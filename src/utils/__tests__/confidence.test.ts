import { describe, it, expect } from 'vitest';
import { computeDeterministicConfidence } from '../confidence';
import { SimulatedPersona } from '../../types/simulator';

describe('computeDeterministicConfidence', () => {
  const createMockPersona = (sentiment: SimulatedPersona['sentiment'], id: string): SimulatedPersona => ({
    id,
    name: `Persona ${id}`,
    age: 32,
    occupation: 'Retail Merchant',
    city: 'Indore',
    cityTier: 'Tier-2',
    incomeBand: '₹5-12 LPA',
    primaryLanguage: 'Hindi',
    techComfort: 'Medium',
    isSceptical: sentiment === 'Sceptical' || sentiment === 'Dismissive',
    sentiment,
    willingnessToPayINR: 499,
    reactionQuote: 'Useful concept.',
    primaryObjection: 'None',
  });

  it('returns High confidence when personas consistently agree with low variance', () => {
    const personas: SimulatedPersona[] = [
      createMockPersona('Bullish', '1'),
      createMockPersona('Bullish', '2'),
      createMockPersona('Bullish', '3'),
      createMockPersona('Cautious', '4'),
      createMockPersona('Bullish', '5'),
    ];

    const result = computeDeterministicConfidence(personas);

    expect(result.confidenceLevel).toBe('High');
    expect(result.overallScore).toBeGreaterThanOrEqual(80);
    expect(result.agreementRatio).toBeGreaterThanOrEqual(0.8);
    expect(result.confidenceReason).toContain('Strong consensus');
  });

  it('returns Low confidence when personas are polarized with high variance', () => {
    const polarizedPersonas: SimulatedPersona[] = [
      createMockPersona('Bullish', '1'),
      createMockPersona('Dismissive', '2'),
      createMockPersona('Bullish', '3'),
      createMockPersona('Dismissive', '4'),
    ];

    const result = computeDeterministicConfidence(polarizedPersonas);

    expect(result.confidenceLevel).toBe('Low');
    expect(result.confidenceReason).toContain('High polarization');
    expect(result.variance).toBeGreaterThan(400);
  });

  it('handles empty personas safely', () => {
    const result = computeDeterministicConfidence([]);
    expect(result.confidenceLevel).toBe('Low');
    expect(result.overallScore).toBe(0);
    expect(result.sampleCount).toBe(0);
  });
});
