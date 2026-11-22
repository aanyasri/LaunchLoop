import { describe, it, expect } from 'vitest';
import { calculateCoFounderCompatibility } from '../compatibility';
import { UserProfile } from '../../types/team';

describe('calculateCoFounderCompatibility', () => {
  const baseAnswers: NonNullable<UserProfile['compatibilityAnswers']> = {
    commitment: 'Full-time now',
    salaryRunwayMonths: 12,
    decisionMakingStyle: 'Data-first rapid iteration',
    riskStance: 'Bootstrapped steady',
  };

  it('yields High Alignment when all four dimensions match closely', () => {
    const result = calculateCoFounderCompatibility(baseAnswers, {
      commitment: 'Full-time now',
      salaryRunwayMonths: 10, // delta is only 2 months
      decisionMakingStyle: 'Data-first rapid iteration',
      riskStance: 'Bootstrapped steady',
    });

    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.level).toBe('High Alignment');
    expect(result.breakdown.commitmentMatch).toBe(true);
    expect(result.breakdown.runwayDeltaMonths).toBe(2);
  });

  it('detects potential friction when commitment and runway diverge significantly', () => {
    const result = calculateCoFounderCompatibility(baseAnswers, {
      commitment: 'Side-project only',
      salaryRunwayMonths: 1, // delta is 11 months!
      decisionMakingStyle: 'Consensus-driven',
      riskStance: 'VC high-growth aggressive',
    });

    expect(result.score).toBeLessThan(50);
    expect(result.level).toBe('Potential Friction');
    expect(result.alignmentSummary).toContain('Discrepancy in weekly time commitment');
  });

  it('handles missing/incomplete answers safely without crashing', () => {
    const result = calculateCoFounderCompatibility(baseAnswers, undefined);
    expect(result.score).toBe(50);
    expect(result.level).toBe('Moderate Alignment');
  });
});
