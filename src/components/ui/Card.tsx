import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-5 ${className}`}
    >
      {children}
    </div>
  );
}
