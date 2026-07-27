import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  tone?: 'default' | 'warning' | 'danger';
}

const TONE_CLASSES = {
  default: 'border-wayfare-mist bg-white',
  warning: 'border-wayfare-amber/40 bg-amber-50',
  danger: 'border-wayfare-danger/30 bg-red-50',
} as const;

export function Card({
  title,
  children,
  className = '',
  tone = 'default',
}: CardProps) {
  return (
    <section
      className={`rounded-lg border p-3 shadow-sm ${TONE_CLASSES[tone]} ${className}`}
    >
      {title ? (
        <h3 className="mb-2 text-sm font-semibold text-wayfare-ink">{title}</h3>
      ) : null}
      {children}
    </section>
  );
}
