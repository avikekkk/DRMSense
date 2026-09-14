import { RiSunLine, RiMoonLine } from 'react-icons/ri';
import { useTheme } from '../hooks/useTheme';

export function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="fixed top-4 right-10 p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
      aria-label="Toggle theme"
    >
      {isDark ? <RiSunLine className="w-4 h-4" /> : <RiMoonLine className="w-4 h-4" />}
    </button>
  );
}
