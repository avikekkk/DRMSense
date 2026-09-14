import type {
  DetailedAudioCodecInfo,
  DetailedCodecInfo,
  DetailedMediaCapabilities,
  DisplayCapabilities,
  HDRCapability,
  PlaybackModeSupport,
} from '../types/drm';
import {
  AUDIO_CODECS_TO_TEST,
  AUDIO_PROBE_PARAMS,
  CHANNEL_LAYOUTS,
  HDR_METADATA_TYPES,
  HDR_PROBES,
  RESOLUTION_LADDER,
  TRANSFER_FUNCTIONS,
  VIDEO_CODECS_TO_TEST,
  VIDEO_PROBE_PARAMS,
  type AudioCodecProbe,
  type VideoCodecProbe,
} from '../constants/codecs';
import { probeDecodingInfo, type DecodingConfig } from './probe';
import { detectContainers } from './containers';
/** Drop the nulls a "supported ? value : null" map leaves behind. */
function compact<T>(values: (T | null)[]): T[] {
  return values.filter((v): v is T => v !== null);
}

/** `decodingInfo` gives a different answer per playback type; ask all three. */
async function detectPlaybackModes(
  build: (type: 'file' | 'media-source' | 'webrtc') => DecodingConfig,
  label: string,
): Promise<PlaybackModeSupport> {
  const [file, mediaSource, webrtc] = await Promise.all([
    probeDecodingInfo(build('file'), null, `${label} (file)`),
    probeDecodingInfo(build('media-source'), null, `${label} (media-source)`),
    probeDecodingInfo(build('webrtc'), null, `${label} (webrtc)`),
  ]);

  return {
    file: file.supported,
    mediaSource: mediaSource.supported,
    webrtc: webrtc.supported,
  };
}

/**
 * Base probe: is this exact codec string decodable at all.
 */
async function probeVideoBase(codec: VideoCodecProbe): Promise<DetailedCodecInfo> {
  const { supported, smooth, powerEfficient } = await probeDecodingInfo(
    { type: 'media-source', video: { contentType: codec.mimeType, ...VIDEO_PROBE_PARAMS } },
    codec.mimeType,
    `codec ${codec.name}`,
  );

  return { ...codec, supported, smooth, powerEfficient };
}

async function probeAudioBase(codec: AudioCodecProbe): Promise<DetailedAudioCodecInfo> {
  const { supported } = await probeDecodingInfo(
    { type: 'media-source', audio: { contentType: codec.mimeType, ...AUDIO_PROBE_PARAMS } },
    codec.mimeType,
    `audio codec ${codec.name}`,
  );

  return { ...codec, supported };
}

/**
 * Run `detail` once per codec family, on the first variant that is supported.
 *
 * Detail probes cost several `decodingInfo` calls each. Asking them of all ~50
 * video and ~40 audio variants would mean hundreds of round trips to learn
 * essentially the same thing — playback mode and alpha support are properties
 * of the codec, not of the profile/level within it.
 */
async function enrichByFamily<T extends { family: string; supported: boolean }>(
  items: T[],
  detail: (item: T) => Promise<Partial<T>>,
): Promise<void> {
  const representatives = new Map<string, T>();
  for (const item of items) {
    if (item.supported && !representatives.has(item.family)) {
      representatives.set(item.family, item);
    }
  }

  await Promise.all(
    [...representatives.values()].map(async (item) => Object.assign(item, await detail(item))),
  );
}

/**
 * Walk the resolution ladder, tracking the highest rung that decodes and the
 * highest that decodes smoothly. The two diverge on exactly the hardware where
 * it matters — a laptop that can decode 4K AV1 in software but drops frames.
 */
async function detectMaxResolution(
  contentType: string,
  label: string,
): Promise<{ maxResolution?: string; maxSmoothResolution?: string }> {
  let maxResolution: string | undefined;
  let maxSmoothResolution: string | undefined;

  for (const rung of RESOLUTION_LADDER) {
    const { supported, smooth } = await probeDecodingInfo(
      {
        type: 'media-source',
        video: {
          contentType,
          width: rung.width,
          height: rung.height,
          bitrate: rung.bitrate,
          framerate: 30,
        },
      },
      null,
      `${label} at ${rung.name}`,
    );

    // Ladders are monotonic in practice, but do not assume it — a codec level
    // cap can make a higher rung fail while a lower one succeeds.
    if (supported) maxResolution = rung.name;
    if (supported && smooth) maxSmoothResolution = rung.name;
  }

  return { maxResolution, maxSmoothResolution };
}

async function videoFamilyDetail(codec: DetailedCodecInfo): Promise<Partial<DetailedCodecInfo>> {
  const video = { contentType: codec.mimeType, ...VIDEO_PROBE_PARAMS };

  const [modes, alpha, hdrMetadataTypes, resolution] = await Promise.all([
    detectPlaybackModes((type) => ({ type, video }), `codec ${codec.name}`),
    probeDecodingInfo(
      { type: 'media-source', video: { ...video, hasAlphaChannel: true } },
      null,
      `${codec.name} alpha`,
    ),
    // Each metadata type is a separate question; a codec may take HDR10 static
    // metadata but not Dolby Vision's dynamic form.
    Promise.all(
      HDR_METADATA_TYPES.map(async ({ id }) => {
        const r = await probeDecodingInfo(
          { type: 'media-source', video: { ...video, hdrMetadataType: id } },
          null,
          `${codec.name} ${id}`,
        );
        return r.supported ? id : null;
      }),
    ),
    detectMaxResolution(codec.mimeType, `codec ${codec.name}`),
  ]);

  return {
    modes,
    hasAlphaChannel: alpha.supported,
    hdrMetadataTypes: compact(hdrMetadataTypes),
    ...resolution,
  };
}

async function audioFamilyDetail(
  codec: DetailedAudioCodecInfo,
): Promise<Partial<DetailedAudioCodecInfo>> {
  const audio = { contentType: codec.mimeType, ...AUDIO_PROBE_PARAMS };

  const [modes, layouts, spatial] = await Promise.all([
    detectPlaybackModes((type) => ({ type, audio }), `audio codec ${codec.name}`),
    Promise.all(
      CHANNEL_LAYOUTS.map(async ({ channels, label }) => {
        const r = await probeDecodingInfo(
          { type: 'media-source', audio: { ...audio, channels } },
          null,
          `${codec.name} ${label}`,
        );
        return r.supported ? label : null;
      }),
    ),
    probeDecodingInfo(
      { type: 'media-source', audio: { ...audio, spatialRendering: true } },
      null,
      `${codec.name} spatial`,
    ),
  ]);

  return {
    modes,
    channelLayouts: compact(layouts),
    spatialRendering: spatial.supported,
  };
}

/**
 * Bits per colour component, via the CSS `color` media feature.
 *
 * This is the honest answer to "how deep is my display". `screen.colorDepth`
 * reports bits per *pixel* — 24 there means 8 bits per channel — and the CSSOM
 * View spec lets browsers hard-return 24 for compatibility, so it says nothing
 * about the actual panel. The `color` feature is defined per component and, on
 * devices whose channels differ, reports the smallest.
 */
function detectBitsPerChannel(): number | null {
  if (typeof window.matchMedia !== 'function') return null;

  // `(color)` fails to match only on monochrome output.
  if (!window.matchMedia('(color)').matches) return 0;

  for (const bits of [16, 14, 12, 10, 8, 6, 5, 4, 2, 1]) {
    if (window.matchMedia(`(min-color: ${bits})`).matches) return bits;
  }

  return null;
}

/** Screen refresh rate, exposed only behind the Media Capabilities screen extensions. */
function detectRefreshRate(): number | null {
  const screen = window.screen as Screen & { refreshRate?: number };
  return typeof screen.refreshRate === 'number' ? screen.refreshRate : null;
}

/**
 * Maximum output channels the audio hardware advertises — the honest answer to
 * "do I have surround", which no codec query can give.
 */
function detectMaxAudioChannels(): number | null {
  const Ctor =
    window.AudioContext ??
    (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;

  let context: AudioContext | null = null;
  try {
    context = new Ctor();
    return context.destination.maxChannelCount;
  } catch {
    return null;
  } finally {
    // Leaving contexts open exhausts the browser's limit after a few reloads.
    void context?.close().catch(() => {});
  }
}

function detectDisplayCapabilities(): DisplayCapabilities {
  const caps: DisplayCapabilities = {
    colorGamut: { sRGB: false, p3: false, rec2020: false },
    hdr: { supported: false, formats: [], metadataTypes: [], transferFunctions: [] },
    screen: {
      width: 0,
      height: 0,
      bitsPerChannel: null,
      colorDepth: 0,
      pixelDepth: 0,
      refreshRate: null,
    },
    maxAudioChannels: null,
  };

  if (typeof window !== 'undefined') {
    caps.colorGamut.sRGB = window.matchMedia('(color-gamut: srgb)').matches;
    caps.colorGamut.p3 = window.matchMedia('(color-gamut: p3)').matches;
    caps.colorGamut.rec2020 = window.matchMedia('(color-gamut: rec2020)').matches;

    caps.screen.width = window.screen.width;
    caps.screen.height = window.screen.height;
    caps.screen.bitsPerChannel = detectBitsPerChannel();
    caps.screen.colorDepth = window.screen.colorDepth;
    caps.screen.pixelDepth = window.screen.pixelDepth;
    caps.screen.refreshRate = detectRefreshRate();

    caps.hdr.supported = window.matchMedia('(dynamic-range: high)').matches;
    caps.maxAudioChannels = detectMaxAudioChannels();
  }

  return caps;
}

/** Transfer functions the decoder will accept alongside a 10-bit HEVC stream. */
async function detectTransferFunctions(): Promise<string[]> {
  if (!('mediaCapabilities' in navigator)) return [];

  const results = await Promise.all(
    TRANSFER_FUNCTIONS.map(async (transferFunction) => {
      const { supported } = await probeDecodingInfo(
        {
          type: 'media-source',
          video: {
            contentType: 'video/mp4;codecs="hvc1.2.4.L153.B0"',
            width: 3840,
            height: 2160,
            bitrate: 10000000,
            framerate: 24,
            transferFunction,
          },
        },
        null,
        `transfer function ${transferFunction}`,
      );
      return supported ? transferFunction : null;
    }),
  );

  return compact(results);
}

/** HDR metadata formats the decoder accepts, independent of any one codec. */
async function detectHDRMetadataTypes(): Promise<string[]> {
  if (!('mediaCapabilities' in navigator)) return [];

  const results = await Promise.all(
    HDR_METADATA_TYPES.map(async ({ id, label }) => {
      const { supported } = await probeDecodingInfo(
        {
          type: 'media-source',
          video: {
            contentType: 'video/mp4;codecs="hvc1.2.4.L153.B0"',
            width: 3840,
            height: 2160,
            bitrate: 10000000,
            framerate: 24,
            hdrMetadataType: id,
            transferFunction: 'pq',
          },
        },
        null,
        `HDR metadata ${label}`,
      );
      return supported ? label : null;
    }),
  );

  return compact(results);
}

export async function detectHDRSupport(): Promise<HDRCapability[]> {
  const unsupported = HDR_PROBES.map(({ name, description, transferFunction }) => ({
    name,
    supported: false,
    description,
    transferFunction,
  }));

  // Without the Media Capabilities API there is no trustworthy HDR signal;
  // MediaSource.isTypeSupported would report codec support, not HDR support.
  if (!('mediaCapabilities' in navigator)) return unsupported;

  const hasP3 = window.matchMedia('(color-gamut: p3)').matches;

  return Promise.all(
    HDR_PROBES.map(async (probe) => {
      const record: HDRCapability = {
        name: probe.name,
        supported: false,
        description: probe.description,
        transferFunction: probe.transferFunction,
      };

      if (probe.requiresP3Gamut && !hasP3) return record;

      const { supported } = await probeDecodingInfo(probe.config, null, `HDR format ${probe.name}`);
      record.supported = supported;
      return record;
    }),
  );
}

export async function detectMediaCapabilities(): Promise<DetailedMediaCapabilities> {
  const display = detectDisplayCapabilities();
  const containers = detectContainers();

  const [hdrFormats, metadataTypes, transferFunctions, videoCodecs, audioCodecs] =
    await Promise.all([
      detectHDRSupport(),
      detectHDRMetadataTypes(),
      detectTransferFunctions(),
      Promise.all(VIDEO_CODECS_TO_TEST.map(probeVideoBase)),
      Promise.all(AUDIO_CODECS_TO_TEST.map(probeAudioBase)),
    ]);

  await Promise.all([
    enrichByFamily(videoCodecs, videoFamilyDetail),
    enrichByFamily(audioCodecs, audioFamilyDetail),
  ]);

  return {
    containers,
    videoCodecs,
    audioCodecs,
    display: {
      ...display,
      hdr: { ...display.hdr, formats: hdrFormats, metadataTypes, transferFunctions },
    },
  };
}
