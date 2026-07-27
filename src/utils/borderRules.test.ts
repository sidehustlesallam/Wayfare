import { describe, expect, it } from 'vitest';
import { getCrossingWarnings } from './borderRules';

describe('getCrossingWarnings', () => {
  it('flags Swiss vignette and CHF when entering CH from FR', () => {
    const result = getCrossingWarnings('FR', 'CH');

    expect(result.warningKinds).toContain('vignette');
    expect(result.warningKinds).toContain('currency');
    expect(result.warnings.some((w) => /vignette/i.test(w))).toBe(true);
    expect(result.warnings.some((w) => /Swiss Franc|CHF/i.test(w))).toBe(true);
  });

  it('flags passport and left-to-right driving side for GB → FR', () => {
    const result = getCrossingWarnings('GB', 'FR');

    expect(result.warningKinds).toContain('passport');
    expect(result.warningKinds).toContain('driving-side');
    expect(
      result.warnings.some((w) => /Schengen|passport|border control/i.test(w)),
    ).toBe(true);
    expect(
      result.warnings.some((w) => /left-hand to right-hand/i.test(w)),
    ).toBe(true);
  });

  it('flags Austrian vignette for DE → AT', () => {
    const result = getCrossingWarnings('DE', 'AT');

    expect(result.warningKinds).toContain('vignette');
    expect(result.warnings.some((w) => /Austrian|Vignette/i.test(w))).toBe(
      true,
    );
  });

  it('does not invent a vignette for FR → DE', () => {
    const result = getCrossingWarnings('FR', 'DE');

    expect(result.warningKinds).not.toContain('vignette');
    expect(result.warningKinds).not.toContain('passport');
    expect(result.warningKinds).toContain('general');
  });
});
