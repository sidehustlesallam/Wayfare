import { Fuel } from 'lucide-react';
import { useTripStore } from '../../store/useTripStore';
import type { FuelType } from '../../types';
import { formatDistance, formatDuration } from '../../utils/fuel';
import { Card } from '../common/Card';
import { Dropdown } from '../common/Dropdown';

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

  const isEv = settings.fuelType === 'ev';
  const efficiencyLabel = isEv ? 'Consumption (kWh/100km)' : 'Efficiency (L/100km)';
  const priceLabel = isEv ? 'Price per kWh (€)' : 'Price per litre (€)';
  const fuelUnit = isEv ? 'kWh' : 'L';

  return (
    <section className="space-y-3">
      <header className="flex items-center gap-2">
        <Fuel className="h-4 w-4 text-wayfare-sky" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-wayfare-slate">
          Fuel & cost
        </h2>
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
            onChange={(event) =>
              setFuelType(event.target.value as FuelType)
            }
          />

          <label className="block text-sm">
            <span className="mb-1.5 flex justify-between font-medium text-wayfare-slate">
              <span>{efficiencyLabel}</span>
              <span className="tabular-nums text-wayfare-ink">
                {settings.vehicleEfficiency.toFixed(1)}
              </span>
            </span>
            <input
              type="range"
              min={isEv ? 10 : 3}
              max={isEv ? 40 : 20}
              step={0.1}
              value={settings.vehicleEfficiency}
              onChange={(event) =>
                setVehicleEfficiency(Number.parseFloat(event.target.value))
              }
              className="w-full accent-wayfare-sky"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 flex justify-between font-medium text-wayfare-slate">
              <span>{priceLabel}</span>
              <span className="tabular-nums text-wayfare-ink">
                €{settings.fuelPricePerLitre.toFixed(2)}
              </span>
            </span>
            <input
              type="range"
              min={0.5}
              max={isEv ? 1.5 : 3}
              step={0.01}
              value={settings.fuelPricePerLitre}
              onChange={(event) =>
                setFuelPricePerLitre(Number.parseFloat(event.target.value))
              }
              className="w-full accent-wayfare-sky"
            />
          </label>

          <dl className="grid grid-cols-2 gap-2 border-t border-wayfare-mist pt-3 text-xs">
            <div>
              <dt className="text-wayfare-slate/60">Distance</dt>
              <dd className="text-sm font-semibold text-wayfare-ink">
                {formatDistance(metrics.totalDistanceKm)}
              </dd>
            </div>
            <div>
              <dt className="text-wayfare-slate/60">Drive time</dt>
              <dd className="text-sm font-semibold text-wayfare-ink">
                {formatDuration(metrics.totalDurationMinutes)}
              </dd>
            </div>
            <div>
              <dt className="text-wayfare-slate/60">Fuel needed</dt>
              <dd className="text-sm font-semibold text-wayfare-ink">
                {metrics.estimatedFuelLitres.toFixed(1)} {fuelUnit}
              </dd>
            </div>
            <div>
              <dt className="text-wayfare-slate/60">Est. cost</dt>
              <dd className="text-sm font-semibold text-wayfare-sky">
                €{metrics.estimatedFuelCost.toFixed(2)}
              </dd>
            </div>
          </dl>
        </div>
      </Card>
    </section>
  );
}
