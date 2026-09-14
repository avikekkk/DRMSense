import { RiShieldLine } from 'react-icons/ri';

export function PageHeader() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <RiShieldLine className="w-6 h-6 text-gray-800 dark:text-zinc-100" />
        <h1 className="text-xl font-bold tracking-tighter text-gray-900 dark:text-zinc-100">
          DRMSense
        </h1>
      </div>
      <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-lg leading-relaxed">
        Browser diagnostics for DRM systems and media codec support.
      </p>
    </div>
  );
}
