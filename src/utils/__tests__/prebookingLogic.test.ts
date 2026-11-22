import { describe, it, expect } from 'vitest';
import { analyzeCampaignStatus } from '../prebookingLogic';

describe('analyzeCampaignStatus', () => {
  it('identifies launch unlock when threshold is reached or exceeded', () => {
    const analysis = analyzeCampaignStatus({
      currentBackersCount: 105,
      targetBackersThreshold: 100,
      deadlineDate: '2026-12-31',
      refundableDepositINR: 499,
      fullPriceINR: 4999,
      fullPaymentsCount: 30,
      depositOnlyCount: 75,
    }, '2026-11-20');

    expect(analysis.isThresholdMet).toBe(true);
    expect(analysis.outcome).toBe('THRESHOLD_MET_LAUNCH_UNLOCKED');
    expect(analysis.progressPercentage).toBe(100);
    expect(analysis.convictionExplanation).toContain('Founder launch button is now enabled');
  });

  it('triggers automatic refund when deadline passes without meeting threshold', () => {
    const analysis = analyzeCampaignStatus({
      currentBackersCount: 42,
      targetBackersThreshold: 100,
      deadlineDate: '2026-11-01', // Date in the past
      refundableDepositINR: 499,
      fullPriceINR: 4999,
      fullPaymentsCount: 5,
      depositOnlyCount: 37,
    }, '2026-11-20');

    expect(analysis.isThresholdMet).toBe(false);
    expect(analysis.isExpired).toBe(true);
    expect(analysis.outcome).toBe('AUTOMATIC_REFUND_TRIGGERED');
    expect(analysis.convictionExplanation).toContain('automatically returned by the payment partner');
  });

  it('reports collecting state when campaign is ongoing', () => {
    const analysis = analyzeCampaignStatus({
      currentBackersCount: 68,
      targetBackersThreshold: 100,
      deadlineDate: '2026-12-15',
      refundableDepositINR: 499,
      fullPriceINR: 4999,
      fullPaymentsCount: 14,
      depositOnlyCount: 54,
    }, '2026-11-20');

    expect(analysis.isThresholdMet).toBe(false);
    expect(analysis.isExpired).toBe(false);
    expect(analysis.outcome).toBe('COLLECTING_DEPOSITS');
    expect(analysis.daysRemaining).toBe(25);
    expect(analysis.progressPercentage).toBe(68);
  });
});
