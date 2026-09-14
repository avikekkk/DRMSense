export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-5 h-5 border-2 border-zinc-200 dark:border-zinc-700 border-t-gray-900 dark:border-t-zinc-100 animate-spin" />
    </div>
  );
}
