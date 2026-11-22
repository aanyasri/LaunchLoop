import { describe, it, expect } from 'vitest';
import { problemService, CreateProblemInput } from '../problemService';
import { prebookingService } from '../prebookingService';

describe('Service-level Role Enforcement', () => {
  it('prevents non-enterprise accounts from posting business problems', async () => {
    const validProblemInput: CreateProblemInput = {
      title: 'Testing Enterprise Only Problem Creation',
      companyName: 'Test AgriCorp',
      industry: 'AgriTech',
      summary: 'Summary with over twenty characters describing cold-chain friction.',
      description: 'Detailed operational problem description exceeding fifty characters for complete validation.',
      constraints: ['Constraint 1'],
      desiredOutcome: 'Desired prototype outcome here',
      rewardMin: 500000,
      rewardMax: 1500000,
      confidentialityLevel: 'Public',
      ipPolicyNote: 'Standard IP ownership note here',
      suggestedRoles: ['Tech Lead / Fullstack'],
    };

    // Caller is a FOUNDER -> Should reject
    await expect(
      problemService.createProblem(validProblemInput, {
        id: 'usr_founder_01',
        role: 'FOUNDER',
      })
    ).rejects.toThrow('Only Enterprise accounts can post business problems');

    // Caller is an ENTERPRISE -> Should succeed
    const created = await problemService.createProblem(validProblemInput, {
      id: 'usr_ent_01',
      role: 'ENTERPRISE',
      organization: 'Test AgriCorp',
    });
    expect(created.id).toBeDefined();
  });

  it('prevents a company from updating or viewing proposals for another company', async () => {
    // prob_agro_01 belongs to MahaAgro Logistics Corp
    //paySetu user tries to update proposal on prob_agro_01
    await expect(
      problemService.updateProposalStatus(
        {
          proposalId: 'prop_01',
          status: 'Accepted',
        },
        {
          id: 'usr_ent_other',
          role: 'ENTERPRISE',
          organization: 'PaySetu Financial Technologies', // Not the owner of prob_agro_01
        }
      )
    ).rejects.toThrow('You cannot act on proposals for another company');
  });

  it('prevents backer accounts from viewing confidential solution proposals', async () => {
    await expect(
      problemService.getProposalsForProblem('prob_agro_01', {
        id: 'usr_backer_01',
        role: 'BACKER',
      })
    ).rejects.toThrow('Backers cannot view proprietary solution proposals');
  });

  it('prevents backer from canceling or refunding another backer order', async () => {
    // ord_bkr_101 belongs to vikram.j@outlook.com
    await expect(
      prebookingService.cancelOrder('ord_bkr_101', {
        id: 'usr_backer_hacker',
        role: 'BACKER',
        email: 'attacker@otherdomain.com',
      })
    ).rejects.toThrow("You cannot request refund for another backer's order");
  });
});
