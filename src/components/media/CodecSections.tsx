import { useState } from 'react';
import {
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiFilmLine,
  RiMusic2Line,
} from 'react-icons/ri';
import type {
  DetailedAudioCodecInfo,
  DetailedCodecInfo,
} from '../../types/drm';
import { Section } from './Section';

interface FamilyGroup<T> {
  family: string;
  supported: T[];
  total: number;
  lead: T | undefined;
}

function groupByFamily<T extends { family: string; supported: boolean }>(
  codecs: T[],
): FamilyGroup<T>[] {
  const groups = new Map<string, FamilyGroup<T>>();

  for (const codec of codecs) {
    let group = groups.get(codec.family);
    if (!group) {
      group = { family: codec.family, supported: [], total: 0, lead: undefined };
      groups.set(codec.family, group);
    }
    group.total += 1;
    if (codec.supported) {
      group.supported.push(codec);
      group.lead ??= codec;
    }
  }

  return [...groups.values()];
}

function FamilyBlock({
  family,
  count,
  variants,
}: {
  family: string;
  count: string;
  variants: string[];
}) {
  return (
    <div className="py-2 border-b border-zinc-200 dark:border-zinc-800 last:border-0">
      <div className="flex justify-between items-baseline gap-2">
        <span className="text-sm font-medium text-gray-800 dark:text-zinc-200">{family}</span>
        <span className="text-2xs font-mono text-gray-400 dark:text-zinc-500 tabular-nums shrink-0">
          {count}
        </span>
      </div>

      {variants.length > 0 && (
        <p className="text-2xs font-mono text-gray-400 dark:text-zinc-500 mt-1">
          {variants.join(' · ')}
        </p>
      )}
    </div>
  );
}

export function VideoCodecSection({ codecs }: { codecs: DetailedCodecInfo[] }) {
  const [showUnsupported, setShowUnsupported] = useState(false);
  const allGroups = groupByFamily(codecs);
  const supportedGroups = allGroups.filter((g) => g.supported.length > 0);
  const unsupportedGroups = allGroups.filter((g) => g.supported.length === 0);

  return (
    <Section
      icon={RiFilmLine}
      iconClass="text-gray-800 dark:text-zinc-100"
      title="Video Codecs"
      emptyMessage="No video codecs supported."
      className="space-y-0"
    >
      {supportedGroups.map((group) => (
        <FamilyBlock
          key={group.family}
          family={group.family}
          count={`${group.supported.length}/${group.total}`}
          variants={group.supported.map((c) => c.name)}
        />
      ))}
      {showUnsupported && unsupportedGroups.length > 0 && (
        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <span className="text-2xs text-gray-400 dark:text-zinc-500">Unsupported</span>
          {unsupportedGroups.map((group) => {
            const unsupportedVariants = codecs
              .filter((c) => c.family === group.family && !c.supported)
              .map((c) => c.name);
            return (
              <FamilyBlock
                key={group.family}
                family={group.family}
                count={`0/${group.total}`}
                variants={unsupportedVariants}
              />
            );
          })}
        </div>
      )}
      {unsupportedGroups.length > 0 && (
        <button
          onClick={() => setShowUnsupported(!showUnsupported)}
          className="flex items-center gap-1 text-2xs text-gray-400 dark:text-zinc-500 py-2"
        >
          {showUnsupported ? (
            <>
              <RiArrowDownSLine className="w-3 h-3" /> Show less
            </>
          ) : (
            <>
              <RiArrowRightSLine className="w-3 h-3" /> Show more
            </>
          )}
        </button>
      )}
    </Section>
  );
}

export function AudioCodecSection({ codecs }: { codecs: DetailedAudioCodecInfo[] }) {
  const [showUnsupported, setShowUnsupported] = useState(false);
  const allGroups = groupByFamily(codecs);
  const supportedGroups = allGroups.filter((g) => g.supported.length > 0);
  const unsupportedGroups = allGroups.filter((g) => g.supported.length === 0);

  return (
    <Section
      icon={RiMusic2Line}
      iconClass="text-gray-800 dark:text-zinc-100"
      title="Audio Codecs"
      emptyMessage="No audio codecs supported."
      className="space-y-0"
    >
      {supportedGroups.map((group) => (
        <FamilyBlock
          key={group.family}
          family={group.family}
          count={`${group.supported.length}/${group.total}`}
          variants={group.supported.map((c) => c.name)}
        />
      ))}
      {showUnsupported && unsupportedGroups.length > 0 && (
        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <span className="text-2xs text-gray-400 dark:text-zinc-500">Unsupported</span>
          {unsupportedGroups.map((group) => {
            const unsupportedVariants = codecs
              .filter((c) => c.family === group.family && !c.supported)
              .map((c) => c.name);
            return (
              <FamilyBlock
                key={group.family}
                family={group.family}
                count={`0/${group.total}`}
                variants={unsupportedVariants}
              />
            );
          })}
        </div>
      )}
      {unsupportedGroups.length > 0 && (
        <button
          onClick={() => setShowUnsupported(!showUnsupported)}
          className="flex items-center gap-1 text-2xs text-gray-400 dark:text-zinc-500 py-2"
        >
          {showUnsupported ? (
            <>
              <RiArrowDownSLine className="w-3 h-3" /> Show less
            </>
          ) : (
            <>
              <RiArrowRightSLine className="w-3 h-3" /> Show more
            </>
          )}
        </button>
      )}
    </Section>
  );
}
