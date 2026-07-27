/**
 * Convert an ISO 3166-1 alpha-2 country code to a regional-indicator flag emoji.
 */
export function countryCodeToFlag(countryCode: string | undefined): string {
  if (!countryCode || countryCode.length !== 2) return '📍';

  const upper = countryCode.toUpperCase();
  const points = [...upper].map(
    (char) => 0x1f1e6 - 65 + char.charCodeAt(0),
  );

  if (points.some((point) => point < 0x1f1e6 || point > 0x1f1ff)) {
    return '📍';
  }

  return String.fromCodePoint(...points);
}
