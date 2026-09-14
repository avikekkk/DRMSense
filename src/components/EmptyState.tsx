import { RiShieldLine } from 'react-icons/ri';

export function EmptyState() {
  return (
    <div className="col-span-full py-16 border border-zinc-200 dark:border-zinc-800">
      <RiShieldLine className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 text-center">
        No DRM systems detected
      </h3>
      <p className="text-xs text-gray-400 dark:text-gray-500 max-w-sm mx-auto text-center leading-relaxed">
        This browser does not support any of the key systems checked (Widevine, PlayReady,
        FairPlay, WisePlay, ClearKey). EME may be disabled in your browser settings.
      </p>
    </div>
  );
}
