import { useState } from 'react';
import type { IconType } from 'react-icons';
import {
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiFilmLine,
  RiMusic2Line,
} from 'react-icons/ri';
import { CHANNEL_LAYOUTS, HDR_METADATA_TYPES, RESOLUTION_LADDER } from '../../constants/codecs';
import type {
  DetailedAudioCodecInfo,
  DetailedCodecInfo,
  PlaybackModeSupport,
} from '../../types/drm';
import { GuidePanel, GuideToggle, type GuideEntry } from '../ui/Guide';
import { Section } from './Section';

interface FamilyGroup<T> {
  family: string;
  variants: T[];
  /** First supported variant; family-level detail probes ran on this one. */
  lead: T | undefined;
}

function groupByFamily<T extends { family: string; supported: boolean }>(
  codecs: T[],
): FamilyGroup<T>[] {
  const groups = new Map<string, FamilyGroup<T>>();

  for (const codec of codecs) {
    let group = groups.get(codec.family);
    if (!group) {
      group = { family: codec.family, variants: [], lead: undefined };
      groups.set(codec.family, group);
    }
    group.variants.push(codec);
    if (codec.supported) group.lead ??= codec;
  }

  return [...groups.values()];
}

type RungState = 'smooth' | 'rough' | 'none';

interface Rung {
  label: string;
  state: RungState;
  /** Tooltip for this cell. */
  hint: string;
}

const RUNG_STYLES: Record<RungState, string> = {
  smooth:
    'bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900',
  rough: 'rung-hatch border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100',
  none: 'border-zinc-200 text-zinc-300 dark:border-zinc-700 dark:text-zinc-600',
};

function rungClass(state: RungState): string {
  return `inline-block w-11 py-0.5 border text-center text-2xs font-mono ${RUNG_STYLES[state]}`;
}

/** Segmented bar: one cell per rung, filled up to where the decoder stops. */
function Ladder({ rungs, summary }: { rungs: Rung[]; summary: string }) {
  return (
    <div role="img" aria-label={summary} className="flex gap-0.5 shrink-0">
      {rungs.map((rung) => (
        <span
          key={rung.label}
          title={rung.hint}
          className={rungClass(rung.state)}
        >
          {rung.label}
        </span>
      ))}
    </div>
  );
}

function videoRungs(lead: DetailedCodecInfo): Rung[] {
  const names: readonly string[] = RESOLUTION_LADDER.map((r) => r.name);
  const max = lead.maxResolution ? names.indexOf(lead.maxResolution) : -1;
  const smooth = lead.maxSmoothResolution ? names.indexOf(lead.maxSmoothResolution) : -1;

  return names.map((label, i) => {
    const state: RungState = i <= smooth ? 'smooth' : i <= max ? 'rough' : 'none';
    const hint = {
      smooth: `${label}: plays smoothly`,
      rough: `${label}: plays, but may skip frames`,
      none: `${label}: can't play`,
    }[state];
    return { label, state, hint };
  });
}

function videoSummary(lead: DetailedCodecInfo): string {
  const { maxResolution: max, maxSmoothResolution: smooth } = lead;
  if (!max) return 'Did not decode at any tested resolution';
  if (smooth === max) return `Browser reports smooth playback up to ${max}`;
  if (!smooth) return `Browser reports playback up to ${max}, with dropped frames`;
  return `Browser reports smooth playback up to ${smooth}, and up to ${max} with dropped frames`;
}

/** '5.1 Surround' → '5.1'; stereo reads better as a channel count too. */
function shortLayout(label: string): string {
  return label === 'Stereo' ? '2.0' : label.split(' ')[0];
}

function audioRungs(lead: DetailedAudioCodecInfo): Rung[] {
  const accepted = new Set(lead.channelLayouts);
  return CHANNEL_LAYOUTS.map(({ label }) => ({
    label: shortLayout(label),
    state: accepted.has(label) ? 'smooth' : 'none',
    hint: `${label}: ${accepted.has(label) ? 'accepted' : 'not accepted'} by the browser`,
  }));
}

const HDR_SHORT_NAMES: Record<(typeof HDR_METADATA_TYPES)[number]['id'], string> = {
  smpteSt2086: 'HDR10',
  'smpteSt2094-10': 'Dolby Vision',
  'smpteSt2094-40': 'HDR10+',
};

/** Streaming is the case this app is about, so only call out where it falls short. */
function modeExceptions(modes: PlaybackModeSupport | undefined): Tag[] {
  if (!modes) return [];
  const missing: Tag[] = [];
  if (!modes.mediaSource) {
    missing.push({
      label: 'Not in streaming (MSE)',
      hint: 'Streaming sites and video players cannot use this codec',
      muted: true,
    });
  }
  if (!modes.file) {
    missing.push({
      label: 'Not as a file',
      hint: 'Cannot play as a simple video or audio file on a web page',
      muted: true,
    });
  }
  if (!modes.webrtc) {
    missing.push({
      label: 'Not in WebRTC',
      hint: 'Cannot be used in video calls and other live WebRTC streams',
      muted: true,
    });
  }
  return missing;
}

interface Tag {
  label: string;
  hint: string;
  strong?: boolean;
  muted?: boolean;
}

function tagClass(tag: Pick<Tag, 'strong' | 'muted'>): string {
  return `px-1.5 border text-2xs ${
    tag.strong
      ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900'
      : tag.muted
        ? 'border-dashed border-zinc-300 text-gray-400 dark:border-zinc-600 dark:text-zinc-500'
        : 'border-zinc-300 text-gray-600 dark:border-zinc-600 dark:text-zinc-300'
  }`;
}

function Tags({ tags }: { tags: Tag[] }) {
  if (tags.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1 mt-1.5">
      {tags.map((tag) => (
        <li
          key={tag.label}
          title={tag.hint}
          className={`${tagClass(tag)} cursor-help`}
        >
          {tag.label}
        </li>
      ))}
    </ul>
  );
}

function videoTags(lead: DetailedCodecInfo): Tag[] {
  const tags: Tag[] = [];
  if (lead.powerEfficient) {
    tags.push({
      label: 'Hardware decode',
      hint: 'The browser says your graphics chip plays this, which saves battery',
      strong: true,
    });
  }
  for (const id of lead.hdrMetadataTypes ?? []) {
    const name = HDR_SHORT_NAMES[id as keyof typeof HDR_SHORT_NAMES] ?? id;
    tags.push({ label: name, hint: `Can play ${name} HDR video with this codec` });
  }
  if (lead.hasAlphaChannel) {
    tags.push({ label: 'Transparency', hint: 'Can play video with see-through parts' });
  }
  return [...tags, ...modeExceptions(lead.modes)];
}

function audioTags(lead: DetailedAudioCodecInfo): Tag[] {
  const tags: Tag[] = [];
  if (lead.spatialRendering) {
    tags.push({
      label: 'Spatial audio',
      hint: 'The browser says it can play 3D sound, like Dolby Atmos',
    });
  }
  return [...tags, ...modeExceptions(lead.modes)];
}

/** Variant names; ones this browser rejects stay visible but struck through. */
function Variants({ variants }: { variants: { name: string; supported: boolean }[] }) {
  if (variants.length < 2) return null;
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2 text-2xs font-mono">
      {variants.map((v) => (
        <li
          key={v.name}
          className={
            v.supported
              ? 'text-gray-600 dark:text-zinc-300'
              : 'text-gray-300 dark:text-zinc-600 line-through'
          }
        >
          <span title={v.supported ? 'Supported' : 'Not supported in this browser'}>{v.name}</span>
          {!v.supported && <span className="sr-only"> (not supported)</span>}
        </li>
      ))}
    </ul>
  );
}

interface CodecSectionProps<T> {
  icon: IconType;
  title: string;
  codecs: T[];
  legend?: React.ReactNode;
  /** Key shown under "How to read"; each entry pairs a sample with its meaning. */
  guide: GuideEntry[];
  ladder: (lead: T) => { rungs: Rung[]; summary: string } | null;
  tags: (lead: T) => Tag[];
}

function CodecSection<T extends { family: string; name: string; supported: boolean }>({
  icon,
  title,
  codecs,
  legend,
  guide,
  ladder,
  tags,
}: CodecSectionProps<T>) {
  const [showUnsupported, setShowUnsupported] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const guideId = `${title.toLowerCase().replace(/\W+/g, '-')}-guide`;
  const groups = groupByFamily(codecs);
  const supported = groups.filter((g) => g.lead);
  const unsupported = groups.filter((g) => !g.lead);

  return (
    <Section
      icon={icon}
      iconClass="text-gray-800 dark:text-zinc-100"
      title={title}
      action={
        <div className="ml-auto flex items-center gap-4">
          {legend && <div className="hidden sm:block">{legend}</div>}
          <GuideToggle
            open={showGuide}
            onToggle={() => setShowGuide(!showGuide)}
            controls={guideId}
          />
        </div>
      }
    >
      {showGuide && <GuidePanel id={guideId} entries={guide} />}

      {supported.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-zinc-400 py-2">
          This browser did not accept any of the tested formats.
        </p>
      )}

      <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
        {supported.map(({ family, variants, lead }) => {
          const bar = ladder(lead!);
          return (
            <div key={family} className="py-3 first:pt-0">
              <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
                <div className="min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-zinc-100">{family}</h4>
                  <Tags tags={tags(lead!)} />
                </div>
                {bar && <Ladder {...bar} />}
              </div>
              <Variants variants={variants} />
            </div>
          );
        })}
      </div>

      {unsupported.length > 0 && (
        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-700">
          <button
            type="button"
            aria-expanded={showUnsupported}
            onClick={() => setShowUnsupported(!showUnsupported)}
            className="flex items-center gap-1 text-2xs text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-zinc-500"
          >
            {showUnsupported ? (
              <RiArrowDownSLine className="w-3 h-3" />
            ) : (
              <RiArrowRightSLine className="w-3 h-3" />
            )}
            Not supported in this browser
          </button>
          {showUnsupported && (
            <ul className="mt-2 space-y-1.5">
              {unsupported.map(({ family, variants }) => (
                <li key={family}>
                  <span className="text-sm text-gray-400 dark:text-zinc-500">{family}</span>
                  {variants.length > 1 && (
                    <span className="block text-2xs font-mono text-gray-300 dark:text-zinc-600">
                      {variants.map((v) => v.name).join(', ')}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Section>
  );
}

function ResolutionLegend() {
  const swatch = 'inline-block w-3 h-2.5 border border-zinc-900 dark:border-zinc-100';
  return (
    <div className="flex items-center gap-3 text-2xs text-gray-500 dark:text-zinc-400">
      <span className="flex items-center gap-1">
        <span className={`${swatch} bg-zinc-900 dark:bg-zinc-100`} /> Smooth
      </span>
      <span className="flex items-center gap-1">
        <span className={`${swatch} rung-hatch`} /> Drops frames
      </span>
    </div>
  );
}

export function VideoCodecSection({ codecs }: { codecs: DetailedCodecInfo[] }) {
  return (
    <CodecSection
      icon={RiFilmLine}
      title="Video Codecs"
      codecs={codecs}
      legend={<ResolutionLegend />}
      guide={[
        {
          sample: <span className={rungClass('smooth')}>1080p</span>,
          meaning: 'The browser says it can play this size smoothly.',
        },
        {
          sample: <span className={rungClass('rough')}>4K</span>,
          meaning: 'The browser says it can play this size, but it may skip frames and stutter.',
        },
        {
          sample: <span className={rungClass('none')}>8K</span>,
          meaning: "The browser says it can't play this size.",
        },
        {
          sample: <span className={tagClass({ strong: true })}>Hardware decode</span>,
          meaning: 'The browser says your graphics chip plays this, which saves battery.',
        },
        {
          sample: <span className={tagClass({})}>HDR10</span>,
          meaning: 'Something extra this codec can do here, like an HDR format.',
        },
        {
          sample: <span className={tagClass({ muted: true })}>Not in WebRTC</span>,
          meaning: 'A way this codec cannot be played in this browser.',
        },
        {
          sample: (
            <span className="text-2xs font-mono text-gray-300 dark:text-zinc-600 line-through">
              Main 10
            </span>
          ),
          meaning: 'A version of the codec that we checked and your browser said no to.',
        },
      ]}
      ladder={(lead) =>
        // `modes` is set once the family detail probes have run.
        lead.modes
          ? { rungs: videoRungs(lead), summary: videoSummary(lead) }
          : null
      }
      tags={videoTags}
    />
  );
}

export function AudioCodecSection({ codecs }: { codecs: DetailedAudioCodecInfo[] }) {
  return (
    <CodecSection
      icon={RiMusic2Line}
      title="Audio Codecs"
      codecs={codecs}
      guide={[
        {
          sample: (
            <>
              <span className={rungClass('smooth')}>2.0</span>
              <span className={rungClass('none')}>7.1.4</span>
            </>
          ),
          meaning:
            'Speaker setups. Filled ones work. 2.0 is stereo. 5.1, 7.1 and 7.1.4 are surround sound.',
        },
        {
          sample: <span className={tagClass({})}>Spatial audio</span>,
          meaning: 'The browser says it can play 3D sound, like Dolby Atmos.',
        },
        {
          sample: <span className={tagClass({ muted: true })}>Not in WebRTC</span>,
          meaning: 'A way this codec cannot be played in this browser.',
        },
        {
          sample: (
            <span className="text-2xs font-mono text-gray-300 dark:text-zinc-600 line-through">
              AAC Main
            </span>
          ),
          meaning: 'A version of the codec that we checked and your browser said no to.',
        },
      ]}
      ladder={(lead) =>
        lead.channelLayouts
          ? {
              rungs: audioRungs(lead),
              summary: lead.channelLayouts.length
                ? `Accepts ${lead.channelLayouts.join(', ')}`
                : 'Did not accept any tested channel layout',
            }
          : null
      }
      tags={audioTags}
    />
  );
}
