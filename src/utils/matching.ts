import { PrimaryRole, UserProfile, MatchRecommendation } from '../types/team';

export interface VentureTeamNeeds {
  filledRoles: PrimaryRole[];
  missingRoles: PrimaryRole[];
  preferredCity?: string;
  minHoursPerWeek?: number;
}

/**
 * Calculates a complementary match score between venture needs and a candidate profile.
 * Rewards candidates who fill missing roles rather than duplicating existing ones.
 */
export function calculateComplementaryMatch(
  needs: VentureTeamNeeds,
  candidate: UserProfile
): MatchRecommendation {
  let score = 0;
  const reasons: string[] = [];
  const filledByCandidate: PrimaryRole[] = [];

  // 1. Role Complementarity (Highest Weight: 50 pts)
  const isMissingRole = needs.missingRoles.includes(candidate.primaryRole);
  const isAlreadyFilled = needs.filledRoles.includes(candidate.primaryRole);

  if (isMissingRole) {
    score += 50;
    filledByCandidate.push(candidate.primaryRole);
    reasons.push(`Directly fills critical missing role: "${candidate.primaryRole}"`);
  } else if (!isAlreadyFilled) {
    score += 25;
    reasons.push(`Adds secondary functional capability: "${candidate.primaryRole}"`);
  } else {
    // Redundant role
    score += 5;
    reasons.push(`Role "${candidate.primaryRole}" is already filled in the core team`);
  }

  // 2. Commitment & Availability (20 pts)
  const requiredHours = needs.minHoursPerWeek || 15;
  if (candidate.hoursPerWeek >= 30) {
    score += 20;
    reasons.push(`High commitment (${candidate.hoursPerWeek} hrs/wk)`);
  } else if (candidate.hoursPerWeek >= requiredHours) {
    score += 15;
    reasons.push(`Meets availability threshold (${candidate.hoursPerWeek} hrs/wk)`);
  } else {
    score += 5;
    reasons.push(`Part-time availability (${candidate.hoursPerWeek} hrs/wk)`);
  }

  // 3. Location / Hub Synergy (15 pts)
  if (
    needs.preferredCity &&
    candidate.city.toLowerCase() === needs.preferredCity.toLowerCase()
  ) {
    score += 15;
    reasons.push(`Same startup hub: ${candidate.city}`);
  } else if (candidate.city) {
    score += 8;
    reasons.push(`Remote collaboration from ${candidate.city}`);
  }

  // 4. Linked Verified Profiles Credibility (15 pts)
  if (candidate.linkedProfiles.github && candidate.linkedProfiles.linkedin) {
    score += 15;
  } else if (candidate.linkedProfiles.github || candidate.linkedProfiles.linkedin) {
    score += 10;
  }

  const finalScore = Math.min(100, Math.max(10, score));

  return {
    profile: candidate,
    matchScore: finalScore,
    matchingReason: reasons.slice(0, 3).join('. ') + '.',
    missingRolesFilled: filledByCandidate,
  };
}

/**
 * Ranks a pool of candidates by complementary match score for the venture.
 */
export function rankComplementaryCandidates(
  needs: VentureTeamNeeds,
  candidates: UserProfile[]
): MatchRecommendation[] {
  return candidates
    .map((candidate) => calculateComplementaryMatch(needs, candidate))
    .sort((a, b) => b.matchScore - a.matchScore);
}
