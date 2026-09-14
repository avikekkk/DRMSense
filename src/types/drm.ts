export interface Codec {
  name: string;
  mimeType: string;
  supported: boolean;
}

/** Which `decodingInfo` playback types accept this codec. */
export interface PlaybackModeSupport {
  file: boolean;
  mediaSource: boolean;
  webrtc: boolean;
}

export interface DetailedCodecInfo extends Codec {
  /** Codec family, e.g. 'H.264 / AVC'. Detail probes run once per family. */
  family: string;
  profile?: string;
  level?: string;
  smooth?: boolean; // From mediaCapabilities.decodingInfo
  powerEfficient?: boolean; // From mediaCapabilities.decodingInfo
  modes?: PlaybackModeSupport;
  /** Codec can carry transparency (VP8/VP9/AV1 alpha). */
  hasAlphaChannel?: boolean;
  /** HDR metadata formats accepted alongside this codec. */
  hdrMetadataTypes?: string[];
  /** Highest ladder rung that decodes at all. */
  maxResolution?: string;
  /** Highest rung that decodes without dropping frames. */
  maxSmoothResolution?: string;
}

export interface AudioCodec {
  name: string;
  mimeType: string;
  supported: boolean;
}

export interface DetailedAudioCodecInfo extends AudioCodec {
  family: string;
  bitrate?: number;
  channels?: number;
  modes?: PlaybackModeSupport;
  /** Channel layouts the decoder accepts, e.g. ['Stereo', '5.1 Surround']. */
  channelLayouts?: string[];
  /** Object-based / spatial audio (Dolby Atmos) support. */
  spatialRendering?: boolean;
}

export interface ContainerSupport {
  name: string;
  extensions: string;
  /** Usable with MediaSource — what streaming players need. */
  mediaSource: boolean;
  /** Progressive playback via canPlayType: 'probably' | 'maybe' | ''. */
  progressive: string;
  /** Usable as a MediaRecorder output container. */
  recording: boolean;
}

export interface HDRCapability {
  name: string;
  supported: boolean;
  description: string;
  transferFunction?: string;
}

export interface DisplayCapabilities {
  colorGamut: {
    sRGB: boolean;
    p3: boolean;
    rec2020: boolean;
  };
  hdr: {
    supported: boolean;
    formats: HDRCapability[];
    metadataTypes: string[];
    transferFunctions: string[];
  };
  screen: {
    width: number;
    height: number;
    bitsPerChannel: number | null;
    colorDepth: number;
    pixelDepth: number;
    refreshRate: number | null;
  };
  maxAudioChannels: number | null;
}

export interface DetailedMediaCapabilities {
  containers: ContainerSupport[];
  videoCodecs: DetailedCodecInfo[];
  audioCodecs: DetailedAudioCodecInfo[];
  display: DisplayCapabilities;
}

/** A codec's decodability *under* a key system, from decodingInfo. */
export interface EncryptedCodecSupport extends Codec {
  smooth?: boolean;
  powerEfficient?: boolean;
  /** Highest ladder rung that decodes under this key system. */
  maxResolution?: string;
}

/** One concrete EME key system string within a DRM family. */
export interface KeySystemResult {
  keySystem: string;
  label: string;
  supported: boolean;
}

export interface DRMSystem {
  name: string;
  keySystem: string;
  icon: string;
}

export interface DRMSystemInfo extends DRMSystem {
  supported: boolean;
  /** Every key system string probed for this family, in priority order. */
  keySystems: KeySystemResult[];
  securityLevel: string;
  /** Robustness strings the CDM accepted, strongest first. */
  videoRobustness: string[];
  audioRobustness: string[];
  /** EME v2 `encryptionScheme` values the CDM accepted (cenc, cbcs, cbcs-1-9). */
  encryptionSchemes: string[];
  /** Highest HDCP version reported `usable` by EME v2 `getStatusForPolicy()`. */
  hdcpVersions: string[];
  persistentLicenseSupport: boolean;
  distinctiveIdentifier: boolean;
  supportedCodecs: EncryptedCodecSupport[];
  supportedAudioCodecs: AudioCodec[];
  /** True when decodingInfo could be asked about encrypted playback at all. */
  encryptedDecodingQueried: boolean;
  hdrCapabilities: HDRCapability[];
}

export type OperatingSystem =
  | 'Windows'
  | 'macOS'
  | 'Linux'
  | 'ChromeOS'
  | 'Android'
  | 'iOS'
  | 'iPadOS'
  | 'Unknown';

export interface SystemInfo {
  os: OperatingSystem;
  osVersion: string;
  browser: string;
  version: string;
  /** True when the UA is a mobile/tablet form factor. */
  mobile: boolean;
}
