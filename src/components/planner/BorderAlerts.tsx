import { Landmark } from 'lucide-react';
import { useBorderDetection } from '../../hooks/useBorderDetection';
import { Card } from '../common/Card';

const KIND_LABELS: Record<string, string> = {
  vignette: 'Vignette',
  passport: 'Passport',
  'driving-side': 'Driving side',
  currency: 'Currency',
  general: 'Border',
};

export function BorderAlerts() {
  const crossings = useBorderDetection();

  if (crossings.length === 0) {
    return (
      <section className="space-y-2">
        <header className="flex items-center gap-2">
          <Landmark className="h-4 w-4 text-wayfare-sky" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-wayfare-slate">
            Border alerts
          </h2>
        </header>
        <p className="text-xs text-wayfare-slate/60">
          International crossings will appear here with vignette and passport
          reminders.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <header className="flex items-center gap-2">
        <Landmark className="h-4 w-4 text-wayfare-sky" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-wayfare-slate">
          Border alerts
        </h2>
      </header>

      {crossings.map((crossing) => (
        <Card
          key={`${crossing.fromCountryCode ?? crossing.fromCountry}-${crossing.toCountryCode ?? crossing.toCountry}`}
          tone="danger"
          title={`🛂 ${crossing.fromCountry} → ${crossing.toCountry}`}
        >
          {crossing.warningKinds && crossing.warningKinds.length > 0 ? (
            <div className="mb-2 flex flex-wrap gap-1">
              {[...new Set(crossing.warningKinds)].map((kind) => (
                <span
                  key={kind}
                  className="rounded bg-wayfare-danger/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-wayfare-danger"
                >
                  {KIND_LABELS[kind] ?? kind}
                </span>
              ))}
            </div>
          ) : null}
          <ul className="space-y-1">
            {crossing.warnings.map((warning) => (
              <li key={warning} className="text-xs text-wayfare-slate">
                {warning}
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </section>
  );
}
