import { BORDER_LOGISTICS } from '../config/defaults';
import type { BorderCrossing, BorderWarningKind } from '../types';

interface CountryHint {
  code: string;
  name: string;
}

/**
 * Build logistics warnings when entering a destination country.
 * Full geometry-based border intersection is a V2 enhancement;
 * V1 uses waypoint country metadata when available.
 */
export function buildBorderWarnings(
  from: CountryHint | undefined,
  to: CountryHint | undefined,
  coordinates: [number, number],
): BorderCrossing | undefined {
  if (!from || !to || from.code === to.code) return undefined;

  const logistics = BORDER_LOGISTICS[to.code.toUpperCase()] ?? {};
  const warnings: string[] = [];
  const warningKinds: BorderWarningKind[] = [];

  if (logistics.vignette) {
    warnings.push(logistics.vignette);
    warningKinds.push('vignette');
  }
  if (logistics.passport) {
    warnings.push(logistics.passport);
    warningKinds.push('passport');
  }
  if (logistics.drivingSide) {
    warnings.push(logistics.drivingSide);
    warningKinds.push('driving-side');
  }
  if (logistics.currency) {
    warnings.push(logistics.currency);
    warningKinds.push('currency');
  }

  if (warnings.length === 0) {
    warnings.push(
      `Crossing from ${from.name} into ${to.name} — check passport and road rules.`,
    );
    warningKinds.push('general');
  }

  return {
    fromCountry: from.name,
    toCountry: to.name,
    coordinates,
    warnings,
    warningKinds,
  };
}

/** Collect unique border crossings across all route segments. */
export function collectBorderAlerts(
  crossings: BorderCrossing[],
): BorderCrossing[] {
  const seen = new Set<string>();
  const unique: BorderCrossing[] = [];

  for (const crossing of crossings) {
    const key = `${crossing.fromCountry}->${crossing.toCountry}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(crossing);
  }

  return unique;
}
