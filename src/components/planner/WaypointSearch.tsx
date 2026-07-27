import { Loader2, Search } from 'lucide-react';
import { useGeocoding } from '../../hooks/useGeocoding';
import type { GeocodingResult } from '../../types';
import { countryCodeToFlag } from '../../utils/countryFlag';

interface WaypointSearchProps {
  onSelect: (result: GeocodingResult) => void;
  placeholder?: string;
}

export function WaypointSearch({
  onSelect,
  placeholder = 'Search city or address…',
}: WaypointSearchProps) {
  const { query, setQuery, results, isLoading, error, clear } = useGeocoding();
  const trimmed = query.trim();
  const showEmpty =
    trimmed.length >= 2 && !isLoading && !error && results.length === 0;

  const handleSelect = (result: GeocodingResult) => {
    onSelect(result);
    clear();
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-wayfare-slate/50"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md border border-wayfare-mist bg-white py-2.5 pl-9 pr-9 text-sm text-wayfare-ink shadow-sm placeholder:text-wayfare-slate/40 focus:border-wayfare-sky focus:outline-none focus:ring-2 focus:ring-wayfare-sky/30"
          aria-label="Search for a waypoint"
          aria-autocomplete="list"
          aria-controls="waypoint-search-results"
          autoComplete="off"
        />
        {isLoading ? (
          <Loader2
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-wayfare-sky"
            aria-hidden
          />
        ) : null}
      </div>

      {error ? (
        <p className="mt-1.5 text-xs text-wayfare-danger" role="alert">
          Search failed — {error}. Try again in a moment.
        </p>
      ) : null}

      {showEmpty ? (
        <p className="mt-1.5 text-xs text-wayfare-slate/60">
          No locations matched “{trimmed}”.
        </p>
      ) : null}

      {results.length > 0 ? (
        <ul
          id="waypoint-search-results"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-wayfare-mist bg-white py-1 shadow-panel"
          role="listbox"
        >
          {results.map((result) => {
            const flag = countryCodeToFlag(result.countryCode);
            const countryLabel =
              result.countryName ?? result.countryCode ?? 'Unknown country';

            return (
              <li key={result.id}>
                <button
                  type="button"
                  className="flex w-full items-start gap-2.5 px-3 py-2 text-left text-sm hover:bg-wayfare-mist/70"
                  onClick={() => handleSelect(result)}
                  role="option"
                >
                  <span
                    className="mt-0.5 text-base leading-none"
                    aria-hidden
                    title={countryLabel}
                  >
                    {flag}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-wayfare-ink">
                      {result.label}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-wayfare-slate/70">
                      {countryLabel}
                      {result.displayName !== result.label
                        ? ` · ${result.displayName}`
                        : ''}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
