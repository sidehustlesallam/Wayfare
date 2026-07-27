import type { BorderWarningKind } from '../types';

export type DrivingSide = 'left' | 'right';

export interface CountryDrivingRules {
  code: string;
  name: string;
  schengen: boolean;
  drivingSide: DrivingSide;
  currencyCode: string;
  currencyName: string;
  /** Highway / national-road vignette or e-toll sticker requirement */
  vignette?: string;
}

/**
 * Static European / international driving regulations lookup.
 * Lightweight client-side reference — not a legal substitute.
 */
export const COUNTRY_RULES: Record<string, CountryDrivingRules> = {
  AT: {
    code: 'AT',
    name: 'Austria',
    schengen: true,
    drivingSide: 'right',
    currencyCode: 'EUR',
    currencyName: 'Euro',
    vignette: 'Austrian Autobahn vignette (Vignette / Digitale Vignette) required.',
  },
  BE: {
    code: 'BE',
    name: 'Belgium',
    schengen: true,
    drivingSide: 'right',
    currencyCode: 'EUR',
    currencyName: 'Euro',
  },
  BG: {
    code: 'BG',
    name: 'Bulgaria',
    schengen: true,
    drivingSide: 'right',
    currencyCode: 'EUR',
    currencyName: 'Euro',
    vignette: 'Bulgarian vignette required on national roads.',
  },
  CH: {
    code: 'CH',
    name: 'Switzerland',
    schengen: true,
    drivingSide: 'right',
    currencyCode: 'CHF',
    currencyName: 'Swiss Franc',
    vignette: 'Swiss motorway vignette required for all motorways.',
  },
  CZ: {
    code: 'CZ',
    name: 'Czechia',
    schengen: true,
    drivingSide: 'right',
    currencyCode: 'CZK',
    currencyName: 'Czech Koruna',
    vignette: 'Czech motorway e-vignette required.',
  },
  DE: {
    code: 'DE',
    name: 'Germany',
    schengen: true,
    drivingSide: 'right',
    currencyCode: 'EUR',
    currencyName: 'Euro',
  },
  DK: {
    code: 'DK',
    name: 'Denmark',
    schengen: true,
    drivingSide: 'right',
    currencyCode: 'DKK',
    currencyName: 'Danish Krone',
  },
  ES: {
    code: 'ES',
    name: 'Spain',
    schengen: true,
    drivingSide: 'right',
    currencyCode: 'EUR',
    currencyName: 'Euro',
  },
  FI: {
    code: 'FI',
    name: 'Finland',
    schengen: true,
    drivingSide: 'right',
    currencyCode: 'EUR',
    currencyName: 'Euro',
  },
  FR: {
    code: 'FR',
    name: 'France',
    schengen: true,
    drivingSide: 'right',
    currencyCode: 'EUR',
    currencyName: 'Euro',
  },
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    schengen: false,
    drivingSide: 'left',
    currencyCode: 'GBP',
    currencyName: 'Pound Sterling',
  },
  GR: {
    code: 'GR',
    name: 'Greece',
    schengen: true,
    drivingSide: 'right',
    currencyCode: 'EUR',
    currencyName: 'Euro',
  },
  HR: {
    code: 'HR',
    name: 'Croatia',
    schengen: true,
    drivingSide: 'right',
    currencyCode: 'EUR',
    currencyName: 'Euro',
  },
  HU: {
    code: 'HU',
    name: 'Hungary',
    schengen: true,
    drivingSide: 'right',
    currencyCode: 'HUF',
    currencyName: 'Hungarian Forint',
    vignette: 'Hungarian e-vignette (e-matrica) required on motorways.',
  },
  IE: {
    code: 'IE',
    name: 'Ireland',
    schengen: false,
    drivingSide: 'left',
    currencyCode: 'EUR',
    currencyName: 'Euro',
  },
  IT: {
    code: 'IT',
    name: 'Italy',
    schengen: true,
    drivingSide: 'right',
    currencyCode: 'EUR',
    currencyName: 'Euro',
  },
  LU: {
    code: 'LU',
    name: 'Luxembourg',
    schengen: true,
    drivingSide: 'right',
    currencyCode: 'EUR',
    currencyName: 'Euro',
  },
  NL: {
    code: 'NL',
    name: 'Netherlands',
    schengen: true,
    drivingSide: 'right',
    currencyCode: 'EUR',
    currencyName: 'Euro',
  },
  NO: {
    code: 'NO',
    name: 'Norway',
    schengen: true,
    drivingSide: 'right',
    currencyCode: 'NOK',
    currencyName: 'Norwegian Krone',
  },
  PL: {
    code: 'PL',
    name: 'Poland',
    schengen: true,
    drivingSide: 'right',
    currencyCode: 'PLN',
    currencyName: 'Polish Złoty',
  },
  PT: {
    code: 'PT',
    name: 'Portugal',
    schengen: true,
    drivingSide: 'right',
    currencyCode: 'EUR',
    currencyName: 'Euro',
  },
  RO: {
    code: 'RO',
    name: 'Romania',
    schengen: true,
    drivingSide: 'right',
    currencyCode: 'RON',
    currencyName: 'Romanian Leu',
    vignette: 'Romanian rovinieta required on national roads.',
  },
  SE: {
    code: 'SE',
    name: 'Sweden',
    schengen: true,
    drivingSide: 'right',
    currencyCode: 'SEK',
    currencyName: 'Swedish Krona',
  },
  SI: {
    code: 'SI',
    name: 'Slovenia',
    schengen: true,
    drivingSide: 'right',
    currencyCode: 'EUR',
    currencyName: 'Euro',
    vignette: 'Slovenian electronic vignette (e-vinjeta) required.',
  },
  SK: {
    code: 'SK',
    name: 'Slovakia',
    schengen: true,
    drivingSide: 'right',
    currencyCode: 'EUR',
    currencyName: 'Euro',
    vignette: 'Slovak motorway e-vignette required.',
  },
  US: {
    code: 'US',
    name: 'United States',
    schengen: false,
    drivingSide: 'right',
    currencyCode: 'USD',
    currencyName: 'US Dollar',
  },
  CA: {
    code: 'CA',
    name: 'Canada',
    schengen: false,
    drivingSide: 'right',
    currencyCode: 'CAD',
    currencyName: 'Canadian Dollar',
  },
};

export function getCountryRules(
  code: string | undefined,
): CountryDrivingRules | undefined {
  if (!code) return undefined;
  return COUNTRY_RULES[code.toUpperCase()];
}

export function countryDisplayName(code: string, fallback?: string): string {
  return getCountryRules(code)?.name ?? fallback ?? code.toUpperCase();
}

export interface CrossingRuleResult {
  warnings: string[];
  warningKinds: BorderWarningKind[];
}

/**
 * Derive vignette / Schengen / driving-side / currency warnings
 * for a from→to country transition.
 */
export function getCrossingWarnings(
  fromCode: string,
  toCode: string,
): CrossingRuleResult {
  const from = getCountryRules(fromCode);
  const to = getCountryRules(toCode);
  const fromName = countryDisplayName(fromCode);
  const toName = countryDisplayName(toCode);

  const warnings: string[] = [];
  const warningKinds: BorderWarningKind[] = [];

  if (to?.vignette) {
    warnings.push(to.vignette);
    warningKinds.push('vignette');
  }

  const fromSchengen = from?.schengen ?? false;
  const toSchengen = to?.schengen ?? false;
  if (from && to && fromSchengen !== toSchengen) {
    warnings.push(
      fromSchengen
        ? `Leaving the Schengen Area (${fromName} → ${toName}) — passport / border control expected.`
        : `Entering the Schengen Area (${fromName} → ${toName}) — passport / border control expected.`,
    );
    warningKinds.push('passport');
  } else if (from && to && !from.schengen && !to.schengen && fromCode !== toCode) {
    warnings.push(
      `International border ${fromName} → ${toName} — carry passport and check entry rules.`,
    );
    warningKinds.push('passport');
  }

  if (from && to && from.drivingSide !== to.drivingSide) {
    warnings.push(
      `Driving side changes from ${from.drivingSide}-hand to ${to.drivingSide}-hand traffic (${toName}).`,
    );
    warningKinds.push('driving-side');
  } else if (!from && to?.drivingSide === 'left') {
    warnings.push(`Driving side in ${toName} is left-hand traffic.`);
    warningKinds.push('driving-side');
  }

  if (from && to && from.currencyCode !== to.currencyCode) {
    warnings.push(
      `Currency changes to ${to.currencyName} (${to.currencyCode}).`,
    );
    warningKinds.push('currency');
  } else if (!from && to && to.currencyCode !== 'EUR') {
    warnings.push(`Local currency is ${to.currencyName} (${to.currencyCode}).`);
    warningKinds.push('currency');
  }

  if (warnings.length === 0) {
    warnings.push(
      `Crossing from ${fromName} into ${toName} — verify road rules and documents.`,
    );
    warningKinds.push('general');
  }

  return { warnings, warningKinds };
}
