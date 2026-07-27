import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  /** Extra class for the dialog panel */
  className?: string;
  /** Hide from screen but keep for print layout */
  printId?: string;
}

export function Modal({
  open,
  title,
  children,
  onClose,
  className = '',
  printId,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1500] flex items-center justify-center bg-wayfare-ink/45 p-4 print:static print:bg-transparent print:p-0"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        id={printId}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wayfare-modal-title"
        className={`max-h-[90vh] w-full max-w-lg overflow-hidden rounded-lg border border-wayfare-mist bg-white shadow-panel print:max-h-none print:max-w-none print:overflow-visible print:rounded-none print:border-0 print:shadow-none ${className}`}
      >
        <header className="flex items-center justify-between border-b border-wayfare-mist px-4 py-3 print:border-wayfare-ink/20">
          <h2
            id="wayfare-modal-title"
            className="font-display text-xl text-wayfare-ink"
          >
            {title}
          </h2>
          <Button
            variant="ghost"
            className="!px-2 !py-1 print:hidden"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </header>
        <div className="max-h-[calc(90vh-3.5rem)] overflow-y-auto p-4 print:max-h-none print:overflow-visible">
          {children}
        </div>
      </div>
    </div>
  );
}
