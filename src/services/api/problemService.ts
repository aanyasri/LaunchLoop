import { z } from 'zod';
import { BusinessProblem, SolutionProposal, IndustrySector } from '../../types/problem';
import { UserRole } from '../../types/auth';
import { SAMPLE_PROBLEMS, SAMPLE_PROPOSALS } from '../mocks/seedData';

// User context for role enforcement in the service layer
export interface ServiceUserContext {
  id: string;
  role: UserRole;
  organization?: string;
  email?: string;
}

export const CreateProblemSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(140, 'Title too long'),
  companyName: z.string().min(2, 'Company name is required'),
  industry: z.enum([
    'AgriTech',
    'FinTech',
    'Healthcare',
    'Logistics & Supply Chain',
    'SaaS & Enterprise',
    'CleanTech & Energy',
    'Consumer & D2C',
  ] as const),
  summary: z.string().min(20, 'Summary must be at least 20 characters').max(280),
  description: z.string().min(50, 'Please provide detailed operational context (min 50 chars)'),
  constraints: z.array(z.string()).min(1, 'Specify at least one real-world operational constraint'),
  desiredOutcome: z.string().min(20, 'Desired outcome is required'),
  rewardMin: z.number().positive('Min budget must be greater than 0'),
  rewardMax: z.number().positive('Max budget must be greater than min budget'),
  confidentialityLevel: z.enum(['Public', 'NDA Required', 'Invite Only']),
  ipPolicyNote: z.string().min(10, 'Specify clear IP ownership policy for founders'),
  suggestedRoles: z.array(z.string()).min(1, 'List at least one complementary role required'),
});

export type CreateProblemInput = z.infer<typeof CreateProblemSchema>;

export const UpdateProposalStatusSchema = z.object({
  proposalId: z.string().min(1),
  status: z.enum(['Shortlisted', 'Accepted', 'Rejected', 'Under Review']),
  feedbackNote: z.string().optional(),
});

export type UpdateProposalStatusInput = z.infer<typeof UpdateProposalStatusSchema>;

export interface ProblemFilterOptions {
  query?: string;
  industry?: IndustrySector | 'ALL';
  confidentiality?: string;
  minReward?: number;
}

export interface IProblemService {
  getProblems(filters?: ProblemFilterOptions): Promise<BusinessProblem[]>;
  getProblemById(id: string): Promise<BusinessProblem | null>;
  createProblem(input: CreateProblemInput, user?: ServiceUserContext): Promise<BusinessProblem>;
  getProposalsForCompany(companyName?: string, user?: ServiceUserContext): Promise<SolutionProposal[]>;
  getProposalsForProblem(problemId: string, user?: ServiceUserContext): Promise<SolutionProposal[]>;
  updateProposalStatus(input: UpdateProposalStatusInput, user?: ServiceUserContext): Promise<SolutionProposal>;
  submitProposal(
    proposal: Omit<SolutionProposal, 'id' | 'status' | 'submittedAt'>,
    user?: ServiceUserContext
  ): Promise<SolutionProposal>;
}

const simulateDelay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

class MockProblemService implements IProblemService {
  private problems: BusinessProblem[] = [...SAMPLE_PROBLEMS];
  private proposals: SolutionProposal[] = [...SAMPLE_PROPOSALS];

  async getProblems(filters?: ProblemFilterOptions): Promise<BusinessProblem[]> {
    await simulateDelay();
    let result = [...this.problems];

    if (!filters) return result;

    if (filters.query && filters.query.trim()) {
      const q = filters.query.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.companyName.toLowerCase().includes(q) ||
          p.industry.toLowerCase().includes(q)
      );
    }

    if (filters.industry && filters.industry !== 'ALL') {
      result = result.filter((p) => p.industry === filters.industry);
    }

    if (filters.confidentiality && filters.confidentiality !== 'ALL') {
      result = result.filter((p) => p.confidentialityLevel === filters.confidentiality);
    }

    if (filters.minReward) {
      result = result.filter((p) => p.rewardRange.max >= (filters.minReward || 0));
    }

    return result;
  }

  async getProblemById(id: string): Promise<BusinessProblem | null> {
    await simulateDelay();
    const item = this.problems.find((p) => p.id === id);
    return item ? { ...item } : null;
  }

  async createProblem(input: CreateProblemInput, user?: ServiceUserContext): Promise<BusinessProblem> {
    await simulateDelay();
    // Role enforcement: Only ENTERPRISE accounts can post business problems
    if (user && user.role !== 'ENTERPRISE') {
      throw new Error('Access Denied: Only Enterprise accounts can post business problems.');
    }

    const validated = CreateProblemSchema.parse(input);
    const newProblem: BusinessProblem = {
      id: `prob_${Date.now()}`,
      title: validated.title,
      companyName: validated.companyName,
      isVerifiedCompany: true,
      industry: validated.industry,
      summary: validated.summary,
      description: validated.description,
      constraints: validated.constraints,
      desiredOutcome: validated.desiredOutcome,
      rewardRange: {
        min: validated.rewardMin,
        max: validated.rewardMax,
        currency: 'INR',
        type: 'Pilot Contract',
      },
      confidentialityLevel: validated.confidentialityLevel,
      ipPolicyNote: validated.ipPolicyNote,
      proposalsCount: 0,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      suggestedRoles: validated.suggestedRoles,
    };

    this.problems.unshift(newProblem);
    return newProblem;
  }

  async getProposalsForCompany(companyName?: string, user?: ServiceUserContext): Promise<SolutionProposal[]> {
    await simulateDelay();
    // Role enforcement: Backers cannot read technical proposals
    if (user && user.role === 'BACKER') {
      throw new Error('Access Denied: Backers cannot access company technical proposals.');
    }

    const targetCompany = companyName || user?.organization;
    if (!targetCompany) {
      return [...this.proposals];
    }

    const companyProblemIds = this.problems
      .filter((p) => p.companyName.toLowerCase().includes(targetCompany.toLowerCase()))
      .map((p) => p.id);

    return this.proposals.filter((prop) => companyProblemIds.includes(prop.problemId));
  }

  async getProposalsForProblem(problemId: string, user?: ServiceUserContext): Promise<SolutionProposal[]> {
    await simulateDelay();
    const problem = this.problems.find((p) => p.id === problemId);
    if (!problem) {
      throw new Error('Problem not found');
    }

    // Role enforcement: If caller is ENTERPRISE, must own the problem to view proposals
    if (user && user.role === 'ENTERPRISE') {
      const isOwner =
        user.organization &&
        problem.companyName.toLowerCase().includes(user.organization.toLowerCase());
      if (!isOwner) {
        throw new Error('Access Denied: You may only view proposals for your own company problems.');
      }
    }

    // If caller is FOUNDER, they can only view proposals they personally authored
    if (user && user.role === 'FOUNDER') {
      return this.proposals.filter(
        (p) => p.problemId === problemId && p.founderId === user.id
      );
    }

    if (user && user.role === 'BACKER') {
      throw new Error('Access Denied: Backers cannot view proprietary solution proposals.');
    }

    return this.proposals.filter((p) => p.problemId === problemId);
  }

  async updateProposalStatus(
    input: UpdateProposalStatusInput,
    user?: ServiceUserContext
  ): Promise<SolutionProposal> {
    await simulateDelay();
    const validated = UpdateProposalStatusSchema.parse(input);

    const index = this.proposals.findIndex((p) => p.id === validated.proposalId);
    if (index === -1) {
      throw new Error(`Proposal with ID ${validated.proposalId} not found`);
    }

    const proposal = this.proposals[index];
    const problem = this.problems.find((p) => p.id === proposal.problemId);

    // Role enforcement: Only the company that posted the problem can accept/shortlist/reject proposals
    if (user && user.role !== 'ENTERPRISE') {
      throw new Error('Access Denied: Only Enterprise accounts can update proposal statuses.');
    }

    if (user && user.role === 'ENTERPRISE' && problem) {
      const isOwner =
        user.organization &&
        problem.companyName.toLowerCase().includes(user.organization.toLowerCase());
      if (!isOwner) {
        throw new Error('Access Denied: You cannot act on proposals for another company.');
      }
    }

    this.proposals[index] = {
      ...this.proposals[index],
      status: validated.status,
    };
    return { ...this.proposals[index] };
  }

  async submitProposal(
    proposal: Omit<SolutionProposal, 'id' | 'status' | 'submittedAt'>,
    user?: ServiceUserContext
  ): Promise<SolutionProposal> {
    await simulateDelay();
    // Role enforcement: Backers cannot submit technical venture proposals
    if (user && user.role === 'BACKER') {
      throw new Error('Access Denied: Backers cannot submit solution proposals. Use pre-booking to support ventures.');
    }

    const newProposal: SolutionProposal = {
      ...proposal,
      id: `prop_${Date.now()}`,
      status: 'Submitted',
      submittedAt: new Date().toISOString().split('T')[0],
    };

    this.proposals.unshift(newProposal);

    // Increment count on problem
    const problem = this.problems.find((p) => p.id === proposal.problemId);
    if (problem) {
      problem.proposalsCount += 1;
    }

    return newProposal;
  }
}

export const problemService: IProblemService = new MockProblemService();
