import type { IconType } from 'react-icons';

interface SectionProps {
  icon: IconType;
  iconClass: string;
  title: string;
  emptyMessage?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function Section({
  icon: Icon,
  iconClass,
  title,
  emptyMessage,
  children,
  className = 'space-y-1',
  action,
}: SectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 pb-2 mb-3 border-b border-zinc-200 dark:border-zinc-800">
        <Icon className={`w-4 h-4 shrink-0 ${iconClass}`} />
        <h3 className="text-sm font-semibold tracking-tight text-gray-900 dark:text-zinc-100">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}
