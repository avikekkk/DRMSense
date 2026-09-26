import type { ReactNode } from 'react';
import { RiQuestionLine } from 'react-icons/ri';

/** One line of a "How to read" key: what a thing looks like, and what it means. */
export interface GuideEntry {
  sample: ReactNode;
  meaning: string;
}

export function GuideToggle({
  open,
  onToggle,
  controls,
}: {
  open: boolean;
  onToggle: () => void;
  controls: string;
}) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={controls}
      onClick={onToggle}
      className={`flex items-center gap-1 text-2xs focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 ${
        open
          ? 'text-gray-900 dark:text-zinc-100'
          : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100'
      }`}
    >
      <RiQuestionLine className="w-3.5 h-3.5" />
      How to read
    </button>
  );
}

export function GuidePanel({ id, entries }: { id: string; entries: GuideEntry[] }) {
  return (
    <dl
      id={id}
      className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 items-center p-3 mb-4 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700"
    >
      {entries.map(({ sample, meaning }) => (
        <div key={meaning} className="contents">
          <dt className="flex gap-0.5 justify-self-start">{sample}</dt>
          <dd className="text-xs text-gray-600 dark:text-zinc-300">{meaning}</dd>
        </div>
      ))}
    </dl>
  );
}
