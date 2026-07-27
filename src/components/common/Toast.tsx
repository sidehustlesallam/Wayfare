import { useState } from 'react';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  text: string;
  tone: ToastTone;
}

/**
 * Lightweight toast queue for ephemeral UI feedback (share copy, errors).
 */
export function useToast(durationMs = 2600) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = (id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const showToast = (text: string, tone: ToastTone = 'info') => {
    const id = `toast_${crypto.randomUUID()}`;
    setToasts((current) => [...current, { id, text, tone }]);
    window.setTimeout(() => dismiss(id), durationMs);
  };

  return { toasts, showToast, dismiss };
}

interface ToastViewportProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const TONE_CLASSES: Record<ToastTone, string> = {
  success: 'border-wayfare-forest/30 bg-wayfare-forest text-white',
  error: 'border-wayfare-danger/30 bg-wayfare-danger text-white',
  info: 'border-wayfare-sky/30 bg-wayfare-ink text-white',
};

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-4 left-1/2 z-[2000] flex w-[min(92vw,360px)] -translate-x-1/2 flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-md border px-3 py-2 text-sm shadow-panel ${TONE_CLASSES[toast.tone]}`}
          role="status"
        >
          <div className="flex items-start justify-between gap-3">
            <span>{toast.text}</span>
            <button
              type="button"
              className="shrink-0 text-white/80 hover:text-white"
              aria-label="Dismiss notification"
              onClick={() => onDismiss(toast.id)}
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
