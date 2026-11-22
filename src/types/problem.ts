export type IndustrySector =
  | 'AgriTech'
  | 'FinTech'
  | 'Healthcare'
  | 'Logistics & Supply Chain'
  | 'SaaS & Enterprise'
  | 'CleanTech & Energy'
  | 'Consumer & D2C';

export type ConfidentialityLevel = 'Public' | 'NDA Required' | 'Invite Only';

export interface BusinessProblem {
  id: string;
  title: string;
  companyName: string;
  companyLogoUrl?: string;
  isVerifiedCompany: boolean;
  industry: IndustrySector;
  summary: string;
  description: string;
  constraints: string[];
  desiredOutcome: string;
  rewardRange: {
    min: number;
    max: number;
    currency: 'INR';
    type: 'Pilot Contract' | 'Equity Grant' | 'Grant / Cash Bounty';
  };
  confidentialityLevel: ConfidentialityLevel;
  ipPolicyNote: string;
  proposalsCount: number;
  deadline: string;
  createdAt: string;
  suggestedRoles: string[];
}

export type ProposalStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Shortlisted'
  | 'Accepted'
  | 'Rejected';

export interface SolutionProposal {
  id: string;
  problemId: string;
  founderId: string;
  founderName: string;
  summary: string;
  approach: string;
  expectedImpact: string;
  teamNeeded: string[];
  status: ProposalStatus;
  submittedAt: string;
}
