import type { FuelType, RouteMetrics, RouteSegment } from '../types';

/**
 * Estimate fuel litres and cost from total distance and vehicle settings.
 * EV uses kWh/100km stored in `vehicleEfficiency` with `fuelPricePerLitre`
 * interpreted as price per kWh.
 */
export function calculateFuelCost(
  totalDistanceKm: number,
  vehicleEfficiency: number,
  fuelPricePerLitre: number,
  _fuelType: FuelType = 'gasoline',
): Pick<RouteMetrics, 'estimatedFuelLitres' | 'estimatedFuelCost'> {
  const estimatedFuelLitres = (totalDistanceKm / 100) * vehicleEfficiency;
  const estimatedFuelCost = estimatedFuelLitres * fuelPricePerLitre;

  return {
    estimatedFuelLitres: round2(estimatedFuelLitres),
    estimatedFuelCost: round2(estimatedFuelCost),
  };
}

/** Aggregate segment stats into trip-level route metrics. */
export function aggregateRouteMetrics(
  segments: RouteSegment[],
  vehicleEfficiency: number,
  fuelPricePerLitre: number,
  fuelType: FuelType,
): RouteMetrics {
  const totalDistanceKm = round2(
    segments.reduce((sum, s) => sum + s.distanceKm, 0),
  );
  const totalDurationMinutes = Math.round(
    segments.reduce((sum, s) => sum + s.durationMinutes, 0),
  );
  const overCapSegments = segments.filter((s) => s.exceedsCap).length;
  const fuel = calculateFuelCost(
    totalDistanceKm,
    vehicleEfficiency,
    fuelPricePerLitre,
    fuelType,
  );

  return {
    totalDistanceKm,
    totalDurationMinutes,
    overCapSegments,
    ...fuel,
  };
}

export function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(km < 100 ? 1 : 0)} km`;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
