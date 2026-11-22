import { describe, it, expect } from 'vitest';
import {
  CreateProblemSchema,
  UpdateProposalStatusSchema,
} from '../../services/api/problemService';
import {
  UpdateProfileSchema,
  UpdateTaskStatusSchema,
} from '../../services/api/teamService';
import { SimulateIdeaSchema } from '../../services/api/simulatorService';
import { CreatePrebookingOrderSchema } from '../../services/api/prebookingService';

describe('Zod Schema Validation Tests', () => {
  describe('CreateProblemSchema', () => {
    it('validates a complete, authentic enterprise problem statement', () => {
      const validProblem = {
        title: 'Solar Cold Storage for Maharashtra Onion Farmers',
        companyName: 'Mahindra Logistics Innovation Hub',
        industry: 'AgriTech',
        summary: 'Reducing post-harvest loss through off-grid thermal cold storage in Nashik transit corridors.',
        description: 'Perishable crop loss exceeds 35% during farm-to-mandi transit. We need decentralized micro-cold hubs that run without grid power.',
        constraints: ['Sub-₹20,000 unit cost for farmer FPO economics', '12-hour thermal backup without diesel'],
        desiredOutcome: 'Deploy pilot across 20 farm gates in Nashik with verified temperature telemetry.',
        rewardMin: 500000,
        rewardMax: 1500000,
        confidentialityLevel: 'Public',
        ipPolicyNote: 'Founder retains 100% IP ownership. Enterprise gets first right of pilot deployment.',
        suggestedRoles: ['Tech Lead / Fullstack', 'Operations & Logistics'],
      };

      const result = CreateProblemSchema.safeParse(validProblem);
      expect(result.success).toBe(true);
    });

    it('rejects problems with title too short or invalid industry', () => {
      const invalidProblem = {
        title: 'Short',
        companyName: 'Test Corp',
        industry: 'InvalidIndustry',
        summary: 'Too short',
        description: 'Short desc',
        constraints: [],
        desiredOutcome: 'Short outcome',
        rewardMin: -100,
        rewardMax: 50,
        confidentialityLevel: 'Public',
        ipPolicyNote: 'IP note',
        suggestedRoles: [],
      };

      const result = CreateProblemSchema.safeParse(invalidProblem);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.title).toBeDefined();
        expect(errors.industry).toBeDefined();
        expect(errors.rewardMin).toBeDefined();
        expect(errors.constraints).toBeDefined();
        expect(errors.suggestedRoles).toBeDefined();
      }
    });
  });

  describe('UpdateProposalStatusSchema', () => {
    it('accepts valid proposal statuses', () => {
      const validStatuses = ['Shortlisted', 'Accepted', 'Rejected', 'Under Review'] as const;
      validStatuses.forEach((status) => {
        const result = UpdateProposalStatusSchema.safeParse({
          proposalId: 'prop_01',
          status,
          feedbackNote: 'Strong technical approach',
        });
        expect(result.success).toBe(true);
      });
    });

    it('rejects unknown or invalid proposal status', () => {
      const result = UpdateProposalStatusSchema.safeParse({
        proposalId: 'prop_01',
        status: 'ApprovedByMistake',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('UpdateProfileSchema', () => {
    it('validates a complete talent profile with Indian context', () => {
      const validProfile = {
        id: 'usr_founder_01',
        name: 'Aanya Sharma',
        headline: 'CleanTech Systems Architect & Product Lead',
        city: 'Pune',
        languages: ['English', 'Hindi', 'Marathi'],
        primaryRole: 'Tech Lead / Fullstack',
        skills: ['Embedded C++', 'Thermal Storage', 'React', 'TypeScript'],
        hoursPerWeek: 40,
        equityMin: 15,
        equityMax: 35,
        riskAppetite: 'High',
        githubUrl: 'https://github.com/aanya-clean-tech',
        linkedinUrl: 'https://linkedin.com/in/aanya-sharma-tech',
      };

      const result = UpdateProfileSchema.safeParse(validProfile);
      expect(result.success).toBe(true);
    });

    it('rejects unreasonable hours per week and invalid URLs', () => {
      const invalidProfile = {
        id: 'usr_founder_01',
        name: 'A',
        headline: 'Bad',
        city: 'P',
        languages: [],
        primaryRole: 'Tech Lead / Fullstack',
        skills: [],
        hoursPerWeek: 120, // max 80
        equityMin: -5,
        equityMax: 150,
        riskAppetite: 'High',
        githubUrl: 'not-a-valid-url',
        linkedinUrl: 'not-a-valid-url',
      };

      const result = UpdateProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.name).toBeDefined();
        expect(errors.languages).toBeDefined();
        expect(errors.skills).toBeDefined();
        expect(errors.hoursPerWeek).toBeDefined();
        expect(errors.githubUrl).toBeDefined();
      }
    });
  });

  describe('UpdateTaskStatusSchema', () => {
    it('validates sprint Kanban status transitions', () => {
      const validStatuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] as const;
      validStatuses.forEach((newStatus) => {
        const result = UpdateTaskStatusSchema.safeParse({
          sprintId: 'sprint_01',
          taskId: 'task_01',
          newStatus,
        });
        expect(result.success).toBe(true);
      });
    });

    it('rejects invalid sprint status', () => {
      const result = UpdateTaskStatusSchema.safeParse({
        sprintId: 'sprint_01',
        taskId: 'task_01',
        newStatus: 'BLOCKED_INVALID',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('SimulateIdeaSchema', () => {
    it('validates a startup idea for Indian customer persona simulation', () => {
      const validIdea = {
        productName: 'AgriCold Pre-cooling Pod',
        targetProblem: 'Post-harvest spoilage of perishable vegetables in Maharashtra transit corridors',
        description: 'Solar-assisted thermal storage containers that maintain 12°C for 48 hours without grid electricity.',
        targetAudience: 'Smallholder tomato/onion farmers & FPO hubs in Tier-2/Tier-3 Maharashtra',
        priceINR: 18500,
      };

      const result = SimulateIdeaSchema.safeParse(validIdea);
      expect(result.success).toBe(true);
    });

    it('rejects empty target problem or zero/negative price', () => {
      const invalidIdea = {
        productName: 'AI',
        targetProblem: 'Short',
        description: 'Short',
        targetAudience: 'Few',
        priceINR: -500,
      };

      const result = SimulateIdeaSchema.safeParse(invalidIdea);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.productName).toBeDefined();
        expect(errors.targetProblem).toBeDefined();
        expect(errors.priceINR).toBeDefined();
      }
    });
  });

  describe('CreatePrebookingOrderSchema', () => {
    it('validates a backer refundable deposit order', () => {
      const validOrder = {
        campaignId: 'camp_01',
        backerName: 'Vikram Joshi',
        backerEmail: 'vikram.j@outlook.com',
        paymentType: 'REFUNDABLE_DEPOSIT',
        amountINR: 499,
        paymentMethod: 'UPI',
        upiId: 'vikram@okhdfcbank',
      };

      const result = CreatePrebookingOrderSchema.safeParse(validOrder);
      expect(result.success).toBe(true);
    });

    it('validates a full pre-order payment', () => {
      const validFullOrder = {
        campaignId: 'camp_01',
        backerName: 'Aditi Deshmukh',
        backerEmail: 'aditi.d@gmail.com',
        paymentType: 'FULL_PAYMENT',
        amountINR: 18500,
        paymentMethod: 'Card',
      };

      const result = CreatePrebookingOrderSchema.safeParse(validFullOrder);
      expect(result.success).toBe(true);
    });

    it('rejects invalid email and negative amount', () => {
      const invalidOrder = {
        campaignId: 'camp_01',
        backerName: '',
        backerEmail: 'not-an-email',
        paymentType: 'REFUNDABLE_DEPOSIT',
        amountINR: -100,
        paymentMethod: 'Bitcoin',
      };

      const result = CreatePrebookingOrderSchema.safeParse(invalidOrder);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.backerEmail).toBeDefined();
        expect(errors.amountINR).toBeDefined();
        expect(errors.paymentMethod).toBeDefined();
      }
    });
  });
});
