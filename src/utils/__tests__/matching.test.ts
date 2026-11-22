import { describe, it, expect } from 'vitest';
import { calculateComplementaryMatch, rankComplementaryCandidates, VentureTeamNeeds } from '../matching';
import { UserProfile } from '../../types/team';

describe('calculateComplementaryMatch', () => {
  const sampleCandidate: UserProfile = {
    id: 'usr_cand_01',
    name: 'Devanshi Patel',
    headline: 'Senior Fullstack & Cloud Architect',
    city: 'Bengaluru',
    languages: ['English', 'Hindi', 'Gujarati'],
    primaryRole: 'Tech Lead / Fullstack',
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS'],
    hoursPerWeek: 35,
    equityExpectationRange: { min: 10, max: 20 },
    riskAppetite: 'High',
    linkedProfiles: {
      github: 'https://github.com/devanshi',
      linkedin: 'https://linkedin.com/in/devanshi',
      isLinked: true,
    },
  };

  it('awards high score when candidate fills a critical missing role in the same city with high hours', () => {
    const needs: VentureTeamNeeds = {
      filledRoles: ['Operations & Logistics'],
      missingRoles: ['Tech Lead / Fullstack', 'Growth & Marketing'],
      preferredCity: 'Bengaluru',
      minHoursPerWeek: 20,
    };

    const match = calculateComplementaryMatch(needs, sampleCandidate);

    expect(match.matchScore).toBeGreaterThanOrEqual(85);
    expect(match.missingRolesFilled).toContain('Tech Lead / Fullstack');
    expect(match.matchingReason).toContain('Directly fills critical missing role');
  });

  it('penalizes redundant role already present in the core team', () => {
    const redundantCandidate: UserProfile = {
      ...sampleCandidate,
      primaryRole: 'Operations & Logistics',
    };

    const needs: VentureTeamNeeds = {
      filledRoles: ['Operations & Logistics'],
      missingRoles: ['Tech Lead / Fullstack'],
      preferredCity: 'Bengaluru',
    };

    const match = calculateComplementaryMatch(needs, redundantCandidate);

    expect(match.matchScore).toBeLessThan(60);
    expect(match.matchingReason).toContain('already filled in the core team');
  });

  it('ranks complementary candidates higher than redundant candidates', () => {
    const candidateTech: UserProfile = {
      ...sampleCandidate,
      id: 'c1',
      primaryRole: 'Tech Lead / Fullstack',
    };
    const candidateOps: UserProfile = {
      ...sampleCandidate,
      id: 'c2',
      primaryRole: 'Operations & Logistics',
      hoursPerWeek: 15,
    };

    const needs: VentureTeamNeeds = {
      filledRoles: ['Operations & Logistics'],
      missingRoles: ['Tech Lead / Fullstack'],
    };

    const ranked = rankComplementaryCandidates(needs, [candidateOps, candidateTech]);
    expect(ranked[0].profile.id).toBe('c1');
    expect(ranked[0].matchScore).toBeGreaterThan(ranked[1].matchScore);
  });
});
