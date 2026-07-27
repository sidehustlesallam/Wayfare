import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-wayfare-sky text-white hover:bg-wayfare-sky/90 focus-visible:ring-wayfare-sky',
  secondary:
    'bg-wayfare-mist text-wayfare-ink hover:bg-wayfare-mist/80 focus-visible:ring-wayfare-slate',
  ghost:
    'bg-transparent text-wayfare-slate hover:bg-wayfare-mist focus-visible:ring-wayfare-slate',
  danger:
    'bg-wayfare-danger/10 text-wayfare-danger hover:bg-wayfare-danger/20 focus-visible:ring-wayfare-danger',
};

export function Button({
  variant = 'primary',
  className = '',
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
