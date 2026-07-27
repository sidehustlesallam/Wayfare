import { describe, expect, it } from 'vitest';
import {
  calculateFuelCost,
  formatDistance,
  formatFuelAmount,
  formatFuelCost,
  kmToMiles,
  lPer100ToMpg,
  mpgToLPer100,
  pricePerGallonToPerLitre,
  pricePerLitreToPerGallon,
} from './fuel';

describe('cost calculator (metric)', () => {
  it('computes fuel needed and cost from km + L/100km + €/L', () => {
    // 500 km @ 8 L/100km = 40 L; @ €1.50 = €60
    const result = calculateFuelCost(500, 8, 1.5, 'gasoline');

    expect(result.estimatedFuelLitres).toBe(40);
    expect(result.estimatedFuelCost).toBe(60);
  });

  it('formats metric distance and cost labels', () => {
    expect(formatDistance(120.4, 'metric')).toBe('120 km');
    expect(formatFuelAmount(40, 'metric', 'gasoline')).toBe('40.0 L');
    expect(formatFuelCost(60, 'metric')).toBe('€60.00');
  });
});

describe('cost calculator (imperial conversions)', () => {
  it('round-trips MPG ↔ L/100km and $/gal ↔ €/L', () => {
    const lPer100 = 7.5;
    const mpg = lPer100ToMpg(lPer100);
    expect(mpgToLPer100(mpg)).toBeCloseTo(lPer100, 5);

    const pricePerLitre = 1.65;
    const perGallon = pricePerLitreToPerGallon(pricePerLitre);
    expect(pricePerGallonToPerLitre(perGallon)).toBeCloseTo(pricePerLitre, 5);
  });

  it('formats imperial distance, gallons, and dollar cost from metric stores', () => {
    const litres = calculateFuelCost(160.934, 7.5, 1.32, 'gasoline')
      .estimatedFuelLitres;

    expect(kmToMiles(160.934)).toBeCloseTo(100, 1);
    expect(formatDistance(160.934, 'imperial')).toMatch(/mi/);
    expect(formatFuelAmount(litres, 'imperial', 'gasoline')).toMatch(/gal/);
    expect(formatFuelCost(50, 'imperial')).toBe('$50.00');
  });

  it('keeps EV amounts in kWh regardless of unit system', () => {
    const result = calculateFuelCost(200, 18, 0.3, 'ev');
    expect(result.estimatedFuelLitres).toBe(36);
    expect(result.estimatedFuelCost).toBeCloseTo(10.8, 5);
    expect(formatFuelAmount(36, 'imperial', 'ev')).toBe('36.0 kWh');
  });
});
