import { useEffect, useRef, useState } from 'react';
import { GEOCODING_DEBOUNCE_MS } from '../config/defaults';
import type { GeocodingAdapter } from '../services/geocoding/GeocodingAdapter';
import { geocodingService } from '../services/geocoding/NominatimService';
import type { GeocodingResult } from '../types';

interface UseGeocodingOptions {
  debounceMs?: number;
  adapter?: GeocodingAdapter;
}

interface UseGeocodingResult {
  query: string;
  setQuery: (value: string) => void;
  results: GeocodingResult[];
  isLoading: boolean;
  error: string | null;
  clear: () => void;
}

/**
 * Debounced geocoding hook. Never calls providers directly from components
 * beyond this hook + the GeocodingAdapter.
 */
export function useGeocoding(
  options: UseGeocodingOptions = {},
): UseGeocodingResult {
  const {
    debounceMs = GEOCODING_DEBOUNCE_MS,
    adapter = geocodingService,
  } = options;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    const timer = window.setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const next = await adapter.search(trimmed, controller.signal);
        if (!controller.signal.aborted) {
          setResults(next);
          setError(null);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        const message =
          err instanceof TypeError
            ? 'Network error — check your connection and try again'
            : err instanceof Error
              ? err.message
              : 'Geocoding request failed';
        setError(message);
        setResults([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, debounceMs);

    return () => {
      window.clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [query, debounceMs, adapter]);

  const clear = () => {
    setQuery('');
    setResults([]);
    setError(null);
    setIsLoading(false);
  };

  return { query, setQuery, results, isLoading, error, clear };
}
