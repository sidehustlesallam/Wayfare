import { Check, Link2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useTripStore } from '../../store/useTripStore';
import { buildShareUrl } from '../../utils/tripShare';
import { Button } from '../common/Button';

interface ShareTripButtonProps {
  onCopied?: () => void;
  onError?: (message: string) => void;
}

export function ShareTripButton({ onCopied, onError }: ShareTripButtonProps) {
  const waypoints = useTripStore((s) => s.waypoints);
  const settings = useTripStore((s) => s.settings);
  const [isSharing, setIsSharing] = useState(false);
  const [justCopied, setJustCopied] = useState(false);

  const disabled = waypoints.length === 0 || isSharing;

  const handleShare = async () => {
    if (waypoints.length === 0) {
      onError?.('Add at least one waypoint before sharing.');
      return;
    }

    setIsSharing(true);
    try {
      const url = buildShareUrl({ v: 1, waypoints, settings });
      await navigator.clipboard.writeText(url);
      setJustCopied(true);
      onCopied?.();
      window.setTimeout(() => setJustCopied(false), 2000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not copy share link';
      onError?.(message);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Button
      variant="secondary"
      className="w-full"
      disabled={disabled}
      onClick={() => {
        void handleShare();
      }}
      aria-label="Copy shareable trip link"
    >
      {isSharing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : justCopied ? (
        <Check className="h-4 w-4 text-wayfare-forest" />
      ) : (
        <Link2 className="h-4 w-4" />
      )}
      {justCopied ? 'Link copied' : 'Share Trip'}
    </Button>
  );
}
