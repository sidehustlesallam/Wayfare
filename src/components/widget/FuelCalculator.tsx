import { Fuel } from 'lucide-react';
import { useTripStore } from '../../store/useTripStore';
import type { FuelType, UnitSystem } from '../../types';
import {
  formatDistance,
  formatDuration,
  formatFuelAmount,
  formatFuelCost,
  lPer100ToMpg,
  mpgToLPer100,
  pricePerGallonToPerLitre,
  pricePerLitreToPerGallon,
} from '../../utils/fuel';
import { Card } from '../common/Card';
import { Dropdown } from '../common/Dropdown';
import { Button } from '../common/Button';

const FUEL_OPTIONS: Array<{ value: FuelType; label: string }> = [
  { value: 'gasoline', label: 'Gasoline' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'ev', label: 'Electric (kWh)' },
];

export function FuelCalculator() {
  const settings = useTripStore((s) => s.settings);
  const metrics = useTripStore((s) => s.metrics);
  const setVehicleEfficiency = useTripStore((s) => s.setVehicleEfficiency);
  const setFuelPricePerLitre = useTripStore((s) => s.setFuelPricePerLitre);
  const setFuelType = useTripStore((s) => s.setFuelType);
  const setUnitSystem = useTripStore((s) => s.setUnitSystem);

  const isEv = settings.fuelType === 'ev';
  const isImperial = settings.unitSystem === 'imperial';

  const displayEfficiency = isEv
    ? settings.vehicleEfficiency
    : isImperial
      ? lPer100ToMpg(settings.vehicleEfficiency)
      : settings.vehicleEfficiency;

  const displayPrice = isEv
    ? settings.fuelPricePerLitre
    : isImperial
      ? pricePerLitreToPerGallon(settings.fuelPricePerLitre)
      : settings.fuelPricePerLitre;

  const efficiencyLabel = isEv
    ? 'Consumption (kWh/100km)'
    : isImperial
      ? 'Efficiency (MPG)'
      : 'Efficiency (L/100km)';

  const priceLabel = isEv
    ? isImperial
      ? 'Price per kWh ($)'
      : 'Price per kWh (€)'
    : isImperial
      ? 'Price per gallon ($)'
      : 'Price per litre (€)';

  const efficiencyMin = isEv ? 10 : isImperial ? 10 : 3;
  const efficiencyMax = isEv ? 40 : isImperial ? 60 : 20;
  const priceMin = isEv ? 0.1 : isImperial ? 2 : 0.5;
  const priceMax = isEv ? 1.5 : isImperial ? 8 : 3;

  const handleEfficiencyChange = (raw: number) => {
    if (isEv || !isImperial) {
      setVehicleEfficiency(raw);
      return;
    }
    setVehicleEfficiency(mpgToLPer100(raw));
  };

  const handlePriceChange = (raw: number) => {
    if (isEv || !isImperial) {
      setFuelPricePerLitre(raw);
      return;
    }
    setFuelPricePerLitre(pricePerGallonToPerLitre(raw));
  };

  const setUnits = (unitSystem: UnitSystem) => {
    setUnitSystem(unitSystem);
  };

  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Fuel className="h-4 w-4 text-wayfare-sky" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-wayfare-slate">
            Fuel & cost
          </h2>
        </div>
        <div className="flex rounded-md border border-wayfare-mist p-0.5 text-[11px]">
          <Button
            variant="ghost"
            className={`!rounded !px-2 !py-1 ${
              !isImperial ? 'bg-wayfare-sky/15 text-wayfare-sky' : ''
            }`}
            onClick={() => setUnits('metric')}
          >
            Metric
          </Button>
          <Button
            variant="ghost"
            className={`!rounded !px-2 !py-1 ${
              isImperial ? 'bg-wayfare-sky/15 text-wayfare-sky' : ''
            }`}
            onClick={() => setUnits('imperial')}
          >
            Imperial
          </Button>
        </div>
      </header>

      <Card>
        <div className="space-y-3">
          <Dropdown
            label="Fuel type"
            options={FUEL_OPTIONS.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
            value={settings.fuelType}
            onChange={(event) => setFuelType(event.target.value as FuelType)}
          />

          <label className="block text-sm">
            <span className="mb-1.5 flex justify-between font-medium text-wayfare-slate">
              <span>{efficiencyLabel}</span>
              <span className="tabular-nums text-wayfare-ink">
                {displayEfficiency.toFixed(1)}
              </span>
            </span>
            <input
              type="range"
              min={efficiencyMin}
              max={efficiencyMax}
              step={0.1}
              value={Number(displayEfficiency.toFixed(1))}
              onChange={(event) =>
                handleEfficiencyChange(Number.parseFloat(event.target.value))
              }
              className="w-full accent-wayfare-sky"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 flex justify-between font-medium text-wayfare-slate">
              <span>{priceLabel}</span>
              <span className="tabular-nums text-wayfare-ink">
                {isImperial ? '$' : '€'}
                {displayPrice.toFixed(2)}
              </span>
            </span>
            <input
              type="range"
              min={priceMin}
              max={priceMax}
              step={0.01}
              value={Number(displayPrice.toFixed(2))}
              onChange={(event) =>
                handlePriceChange(Number.parseFloat(event.target.value))
              }
              className="w-full accent-wayfare-sky"
            />
          </label>

          <dl className="grid grid-cols-2 gap-2 border-t border-wayfare-mist pt-3 text-xs">
            <div>
              <dt className="text-wayfare-slate/60">Distance</dt>
              <dd className="text-sm font-semibold text-wayfare-ink">
                {formatDistance(metrics.totalDistanceKm, settings.unitSystem)}
              </dd>
            </div>
            <div>
              <dt className="text-wayfare-slate/60">Drive time</dt>
              <dd className="text-sm font-semibold text-wayfare-ink">
                {formatDuration(metrics.totalDurationMinutes)}
              </dd>
            </div>
            <div>
              <dt className="text-wayfare-slate/60">
                {isEv ? 'Energy needed' : 'Fuel needed'}
              </dt>
              <dd className="text-sm font-semibold text-wayfare-ink">
                {formatFuelAmount(
                  metrics.estimatedFuelLitres,
                  settings.unitSystem,
                  settings.fuelType,
                )}
              </dd>
            </div>
            <div>
              <dt className="text-wayfare-slate/60">Est. cost</dt>
              <dd className="text-sm font-semibold text-wayfare-sky">
                {formatFuelCost(
                  metrics.estimatedFuelCost,
                  settings.unitSystem,
                )}
              </dd>
            </div>
          </dl>
        </div>
      </Card>
    </section>
  );
}
