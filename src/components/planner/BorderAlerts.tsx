import { Landmark } from 'lucide-react';
import { useBorderDetection } from '../../hooks/useBorderDetection';
import { Card } from '../common/Card';

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
          key={`${crossing.fromCountry}-${crossing.toCountry}`}
          tone="danger"
          title={`🛂 ${crossing.fromCountry} → ${crossing.toCountry}`}
        >
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
