import { z } from 'zod';
import { UserProfile, TrialSprint, MatchRecommendation, PrimaryRole, SprintTaskStatus } from '../../types/team';
import { SAMPLE_TALENT_PROFILES, SAMPLE_SPRINTS } from '../mocks/seedData';
import { rankComplementaryCandidates, VentureTeamNeeds } from '../../utils/matching';

export const UpdateProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  headline: z.string().min(5, 'Headline is required'),
  city: z.string().min(2, 'City is required'),
  languages: z.array(z.string()).min(1, 'Specify at least one language'),
  primaryRole: z.enum([
    'Tech Lead / Fullstack',
    'AI / Data Engineer',
    'Product Designer',
    'Growth & Marketing',
    'Operations & Logistics',
    'Finance & Legal',
  ] as const),
  skills: z.array(z.string()).min(1, 'Add at least one key skill'),
  hoursPerWeek: z.number().min(5, 'Minimum 5 hours per week').max(80),
  equityMin: z.number().min(0).max(100),
  equityMax: z.number().min(0).max(100),
  riskAppetite: z.enum(['Low', 'Medium', 'High']),
  githubUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

export const UpdateTaskStatusSchema = z.object({
  sprintId: z.string(),
  taskId: z.string(),
  newStatus: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']),
});

export type UpdateTaskStatusInput = z.infer<typeof UpdateTaskStatusSchema>;

export interface ITeamService {
  getCandidates(filterRole?: PrimaryRole | 'ALL', city?: string): Promise<UserProfile[]>;
  getCandidateById(id: string): Promise<UserProfile | null>;
  getRecommendations(needs: VentureTeamNeeds): Promise<MatchRecommendation[]>;
  updateProfile(input: UpdateProfileInput): Promise<UserProfile>;
  getActiveSprint(): Promise<TrialSprint | null>;
  updateSprintTaskStatus(input: UpdateTaskStatusInput): Promise<TrialSprint>;
  startTrialSprint(candidateId: string, ventureName: string): Promise<TrialSprint>;
}

// Latency simulator helper
const simulateDelay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

class MockTeamService implements ITeamService {
  private candidates: UserProfile[] = [...SAMPLE_TALENT_PROFILES];
  private sprints: TrialSprint[] = [...SAMPLE_SPRINTS];

  async getCandidates(filterRole?: PrimaryRole | 'ALL', city?: string): Promise<UserProfile[]> {
    await simulateDelay();
    let list = [...this.candidates];

    if (filterRole && filterRole !== 'ALL') {
      list = list.filter((c) => c.primaryRole === filterRole);
    }
    if (city && city !== 'ALL') {
      list = list.filter((c) => c.city.toLowerCase() === city.toLowerCase());
    }
    return list;
  }

  async getCandidateById(id: string): Promise<UserProfile | null> {
    await simulateDelay();
    const cand = this.candidates.find((c) => c.id === id);
    return cand ? { ...cand } : null;
  }

  async getRecommendations(needs: VentureTeamNeeds): Promise<MatchRecommendation[]> {
    await simulateDelay();
    return rankComplementaryCandidates(needs, this.candidates);
  }

  async updateProfile(input: UpdateProfileInput): Promise<UserProfile> {
    await simulateDelay();
    const validated = UpdateProfileSchema.parse(input);

    const index = this.candidates.findIndex((c) => c.id === validated.id);
    const updatedProfile: UserProfile = {
      id: validated.id,
      name: validated.name,
      headline: validated.headline,
      city: validated.city,
      languages: validated.languages,
      primaryRole: validated.primaryRole,
      skills: validated.skills,
      hoursPerWeek: validated.hoursPerWeek,
      equityExpectationRange: { min: validated.equityMin, max: validated.equityMax },
      riskAppetite: validated.riskAppetite,
      linkedProfiles: {
        github: validated.githubUrl || undefined,
        linkedin: validated.linkedinUrl || undefined,
        isLinked: !!(validated.githubUrl || validated.linkedinUrl),
      },
    };

    if (index !== -1) {
      this.candidates[index] = updatedProfile;
    } else {
      this.candidates.push(updatedProfile);
    }
    return updatedProfile;
  }

  async getActiveSprint(): Promise<TrialSprint | null> {
    await simulateDelay();
    return this.sprints[0] ? { ...this.sprints[0] } : null;
  }

  async updateSprintTaskStatus(input: UpdateTaskStatusInput): Promise<TrialSprint> {
    await simulateDelay();
    const validated = UpdateTaskStatusSchema.parse(input);

    const sprint = this.sprints.find((s) => s.id === validated.sprintId);
    if (!sprint) {
      throw new Error('Trial sprint not found');
    }

    const task = sprint.tasks.find((t) => t.id === validated.taskId);
    if (!task) {
      throw new Error('Sprint task not found');
    }

    task.status = validated.newStatus as SprintTaskStatus;
    return { ...sprint };
  }

  async startTrialSprint(candidateId: string, ventureName: string): Promise<TrialSprint> {
    await simulateDelay();
    const candidate = await this.getCandidateById(candidateId);
    if (!candidate) {
      throw new Error('Candidate not found');
    }

    const newSprint: TrialSprint = {
      id: `sprint_${Date.now()}`,
      ventureName,
      title: `1-Week Trial Sprint with ${candidate.name}`,
      partnerName: candidate.name,
      partnerRole: candidate.primaryRole,
      durationWeeks: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Active',
      tasks: [
        {
          id: `task_${Date.now()}_1`,
          title: `Architecture & functional spec alignment for ${ventureName}`,
          assigneeName: candidate.name,
          status: 'IN_PROGRESS',
        },
        {
          id: `task_${Date.now()}_2`,
          title: 'Weekly check-in & milestone definition',
          assigneeName: 'Founder',
          status: 'TODO',
        },
      ],
    };

    this.sprints.unshift(newSprint);
    return newSprint;
  }
}

export const teamService: ITeamService = new MockTeamService();
