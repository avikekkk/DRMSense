export interface Tab<T extends string> {
  id: T;
  label: string;
}

interface TabBarProps<T extends string> {
  tabs: readonly Tab<T>[];
  activeTab: T;
  onChange: (tab: T) => void;
}

export function TabBar<T extends string>({ tabs, activeTab, onChange }: TabBarProps<T>) {
  return (
    <div
      role="tablist"
      className="flex gap-0 mb-6 border-b border-zinc-200 dark:border-zinc-800"
    >
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${
              active
                ? 'border-gray-900 dark:border-zinc-100 text-gray-900 dark:text-zinc-100'
                : 'border-transparent text-gray-400 dark:text-zinc-500'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
