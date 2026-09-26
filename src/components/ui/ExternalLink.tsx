import type { ReactNode } from 'react';

/** Link that leaves the app: new tab, no opener, underlined so it reads as a link in running text. */
export function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline decoration-zinc-300 dark:decoration-zinc-600 underline-offset-2 hover:text-gray-900 hover:decoration-current dark:hover:text-zinc-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-zinc-500"
    >
      {children}
    </a>
  );
}
