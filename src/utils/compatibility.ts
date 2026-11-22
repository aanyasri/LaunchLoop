import { UserProfile } from '../types/team';

export interface CompatibilityResult {
  score: number; // 0 to 100
  level: 'High Alignment' | 'Moderate Alignment' | 'Potential Friction';
  alignmentSummary: string;
  breakdown: {
    commitmentMatch: boolean;
    runwayDeltaMonths: number;
    decisionStyleCompatible: boolean;
    riskStanceCompatible: boolean;
  };
}

/**
 * Computes co-founder working compatibility across 4 key dimensions:
 * 1. Commitment (Full-time vs Part-time transition)
 * 2. Financial Runway (months of personal runway)
 * 3. Decision-making style
 * 4. Risk / Growth appetite (Bootstrapped vs VC)
 */
export function calculateCoFounderCompatibility(
  founderA: UserProfile['compatibilityAnswers'],
  founderB: UserProfile['compatibilityAnswers']
): CompatibilityResult {
  if (!founderA || !founderB) {
    return {
      score: 50,
      level: 'Moderate Alignment',
      alignmentSummary: 'Incomplete compatibility questionnaire for one or both founders.',
      breakdown: {
        commitmentMatch: false,
        runwayDeltaMonths: 0,
        decisionStyleCompatible: false,
        riskStanceCompatible: false,
      },
    };
  }

  let totalScore = 0;
  const feedback: string[] = [];

  // 1. Commitment Alignment (30 pts)
  const commitmentMatch = founderA.commitment === founderB.commitment;
  if (commitmentMatch) {
    totalScore += 30;
    feedback.push(`Aligned commitment mode (${founderA.commitment})`);
  } else if (
    founderA.commitment.includes('transitioning') ||
    founderB.commitment.includes('transitioning')
  ) {
    totalScore += 20;
    feedback.push('Compatible transition paths to full-time');
  } else {
    totalScore += 5;
    feedback.push('Discrepancy in weekly time commitment');
  }

  // 2. Financial Runway Alignment (25 pts)
  const runwayDelta = Math.abs(founderA.salaryRunwayMonths - founderB.salaryRunwayMonths);
  if (runwayDelta <= 3) {
    totalScore += 25;
    feedback.push(`Similar salary runway tolerance (Δ ${runwayDelta} mos)`);
  } else if (runwayDelta <= 6) {
    totalScore += 18;
    feedback.push(`Manageable runway divergence (Δ ${runwayDelta} mos)`);
  } else {
    totalScore += 8;
    feedback.push(`High runway gap (Δ ${runwayDelta} mos) requires equity/stipend planning`);
  }

  // 3. Decision Making Style (25 pts)
  const decisionStyleCompatible =
    founderA.decisionMakingStyle === founderB.decisionMakingStyle ||
    (founderA.decisionMakingStyle === 'Data-first rapid iteration' &&
      founderB.decisionMakingStyle !== 'Consensus-driven');

  if (founderA.decisionMakingStyle === founderB.decisionMakingStyle) {
    totalScore += 25;
    feedback.push(`Matching decision style: ${founderA.decisionMakingStyle}`);
  } else if (decisionStyleCompatible) {
    totalScore += 18;
    feedback.push('Complementary execution & decision styles');
  } else {
    totalScore += 10;
    feedback.push('Different decision rhythms (Consensus vs Ownership)');
  }

  // 4. Risk / Funding Stance (20 pts)
  const riskStanceCompatible = founderA.riskStance === founderB.riskStance;
  if (riskStanceCompatible) {
    totalScore += 20;
    feedback.push(`Shared growth goal (${founderA.riskStance})`);
  } else {
    totalScore += 5;
    feedback.push('Contrasting capital views (Bootstrapped vs VC)');
  }

  const finalScore = Math.min(100, Math.max(15, totalScore));
  const level: CompatibilityResult['level'] =
    finalScore >= 75
      ? 'High Alignment'
      : finalScore >= 50
      ? 'Moderate Alignment'
      : 'Potential Friction';

  return {
    score: finalScore,
    level,
    alignmentSummary: feedback.join('. ') + '.',
    breakdown: {
      commitmentMatch,
      runwayDeltaMonths: runwayDelta,
      decisionStyleCompatible,
      riskStanceCompatible,
    },
  };
}
