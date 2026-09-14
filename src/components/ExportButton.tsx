import { RiDownloadLine } from 'react-icons/ri';

interface ExportButtonProps {
  onExport: () => void;
}

export function ExportButton({ onExport }: ExportButtonProps) {
  return (
    <button
      onClick={onExport}
      className="fixed top-4 right-4 p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
      aria-label="Export Data"
      title="Export Data"
    >
      <RiDownloadLine className="w-4 h-4" />
    </button>
  );
}
