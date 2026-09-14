import { RiComputerLine } from 'react-icons/ri';
import type { SystemInfo } from '../types/drm';

interface SystemInfoCardProps {
  info: SystemInfo;
}

export function SystemInfoCard({ info }: SystemInfoCardProps) {
  const os = info.osVersion !== 'Unknown' ? `${info.os} ${info.osVersion}` : info.os;
  const browser = info.version !== 'Unknown' ? `${info.browser} ${info.version}` : info.browser;

  return (
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
      <RiComputerLine className="w-4 h-4 text-gray-400 dark:text-zinc-500 shrink-0" />
      <span className="text-sm font-mono text-gray-600 dark:text-zinc-300">
        {os} · {browser}
      </span>
      {info.mobile && (
        <span className="text-2xs font-mono text-accent dark:text-accent-dark border border-accent/30 dark:border-accent-dark/30 px-1.5 py-0.5">
          mobile
        </span>
      )}
    </div>
  );
}
