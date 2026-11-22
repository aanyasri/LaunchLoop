import { SimulatedPersona } from '../types/simulator';

export interface ConfidenceCalculation {
  overallScore: number;
  confidenceLevel: 'High' | 'Medium' | 'Low';
  confidenceReason: string;
  variance: number;
  sampleCount: number;
  agreementRatio: number;
}

/**
 * Computes simulator confidence deterministically from persona agreement.
 * Pure function: Given a set of simulated personas and their sentiment scores,
 * calculates mean score, standard deviation / variance, and agreement level.
 */
export function computeDeterministicConfidence(
  personas: SimulatedPersona[]
): ConfidenceCalculation {
  if (!personas || personas.length === 0) {
    return {
      overallScore: 0,
      confidenceLevel: 'Low',
      confidenceReason: 'No persona responses available for evaluation.',
      variance: 0,
      sampleCount: 0,
      agreementRatio: 0,
    };
  }

  // Map sentiment to numerical rating (0 to 100)
  const sentimentScoreMap: Record<SimulatedPersona['sentiment'], number> = {
    Bullish: 90,
    Cautious: 65,
    Sceptical: 35,
    Dismissive: 10,
  };

  const scores = personas.map((p) => sentimentScoreMap[p.sentiment]);
  const sampleCount = scores.length;
  const mean = scores.reduce((sum, val) => sum + val, 0) / sampleCount;

  // Compute variance and standard deviation
  const variance = scores.reduce((acc, score) => acc + Math.pow(score - mean, 2), 0) / sampleCount;
  const stdDev = Math.sqrt(variance);

  // Group sentiments into positive (Bullish, Cautious) vs skeptical (Sceptical, Dismissive)
  const positiveCount = personas.filter(
    (p) => p.sentiment === 'Bullish' || p.sentiment === 'Cautious'
  ).length;
  const negativeCount = sampleCount - positiveCount;
  const dominantCount = Math.max(positiveCount, negativeCount);
  const agreementRatio = dominantCount / sampleCount;

  // Deterministic Confidence logic:
  // High: standard deviation is low (personas strongly agree in one direction) AND sample >= 5
  // Medium: moderate divergence or small sample
  // Low: high dispersion across personas (strong polarized disagreement)
  let confidenceLevel: 'High' | 'Medium' | 'Low';
  let confidenceReason: string;

  if (stdDev <= 18 && sampleCount >= 4) {
    confidenceLevel = 'High';
    confidenceReason = `Strong consensus across ${sampleCount} diverse Indian personas with low variance (σ = ${stdDev.toFixed(1)}).`;
  } else if (stdDev <= 28) {
    confidenceLevel = 'Medium';
    confidenceReason = `Moderate consensus. Sentiments vary across city tiers or income brackets (σ = ${stdDev.toFixed(1)}).`;
  } else {
    confidenceLevel = 'Low';
    confidenceReason = `High polarization among simulated personas (σ = ${stdDev.toFixed(1)}). Personas sharply disagree across demographic segments.`;
  }

  return {
    overallScore: Math.round(mean),
    confidenceLevel,
    confidenceReason,
    variance: Math.round(variance),
    sampleCount,
    agreementRatio: Number(agreementRatio.toFixed(2)),
  };
}
