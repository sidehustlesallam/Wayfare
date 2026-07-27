import type { FuelType, RouteMetrics, RouteSegment, UnitSystem } from '../types';

const LITRES_PER_GALLON = 3.785411784;
/** Approximate conversion: MPG (US) ↔ L/100km */
const MPG_FACTOR = 235.214583;

/**
 * Estimate fuel litres and cost from total distance and vehicle settings.
 * `vehicleEfficiency` is always L/100km (or kWh/100km for EV).
 * `fuelPricePerLitre` is always price per litre (or per kWh).
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

export function kmToMiles(km: number): number {
  return km * 0.621371;
}

export function milesToKm(miles: number): number {
  return miles / 0.621371;
}

export function lPer100ToMpg(lPer100: number): number {
  if (lPer100 <= 0) return 0;
  return MPG_FACTOR / lPer100;
}

export function mpgToLPer100(mpg: number): number {
  if (mpg <= 0) return 0;
  return MPG_FACTOR / mpg;
}

export function pricePerLitreToPerGallon(pricePerLitre: number): number {
  return pricePerLitre * LITRES_PER_GALLON;
}

export function pricePerGallonToPerLitre(pricePerGallon: number): number {
  return pricePerGallon / LITRES_PER_GALLON;
}

export function formatDistance(
  km: number,
  unitSystem: UnitSystem = 'metric',
): string {
  if (unitSystem === 'imperial') {
    const miles = kmToMiles(km);
    if (miles < 0.1) return `${Math.round(miles * 5280)} ft`;
    return `${miles.toFixed(miles < 100 ? 1 : 0)} mi`;
  }
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(km < 100 ? 1 : 0)} km`;
}

export function formatFuelAmount(
  litres: number,
  unitSystem: UnitSystem,
  fuelType: FuelType,
): string {
  if (fuelType === 'ev') {
    return `${litres.toFixed(1)} kWh`;
  }
  if (unitSystem === 'imperial') {
    return `${(litres / LITRES_PER_GALLON).toFixed(1)} gal`;
  }
  return `${litres.toFixed(1)} L`;
}

export function formatFuelCost(
  cost: number,
  unitSystem: UnitSystem,
): string {
  const symbol = unitSystem === 'imperial' ? '$' : '€';
  return `${symbol}${cost.toFixed(2)}`;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
