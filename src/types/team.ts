export type PrimaryRole =
  | 'Tech Lead / Fullstack'
  | 'AI / Data Engineer'
  | 'Product Designer'
  | 'Growth & Marketing'
  | 'Operations & Logistics'
  | 'Finance & Legal';

export interface UserProfile {
  id: string;
  name: string;
  headline: string;
  avatarUrl?: string;
  city: string;
  languages: string[];
  primaryRole: PrimaryRole;
  skills: string[];
  hoursPerWeek: number;
  equityExpectationRange: { min: number; max: number };
  riskAppetite: 'Low' | 'Medium' | 'High';
  linkedProfiles: {
    github?: string;
    linkedin?: string;
    isLinked: boolean;
  };
  compatibilityAnswers?: {
    commitment: 'Full-time now' | 'Part-time transitioning to full-time' | 'Side-project only';
    salaryRunwayMonths: number;
    decisionMakingStyle: 'Consensus-driven' | 'Lead-takes-ownership' | 'Data-first rapid iteration';
    riskStance: 'Bootstrapped steady' | 'VC high-growth aggressive';
  };
}

export interface MatchRecommendation {
  profile: UserProfile;
  matchScore: number;
  matchingReason: string;
  missingRolesFilled: PrimaryRole[];
  compatibilityScore?: number;
}

export type SprintTaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export interface SprintTask {
  id: string;
  title: string;
  description?: string;
  assigneeName: string;
  status: SprintTaskStatus;
}

export interface TrialSprint {
  id: string;
  ventureName: string;
  title: string;
  partnerName: string;
  partnerRole: PrimaryRole;
  durationWeeks: number;
  startDate: string;
  endDate: string;
  status: 'Planning' | 'Active' | 'Completed';
  tasks: SprintTask[];
}
