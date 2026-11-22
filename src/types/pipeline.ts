import { BusinessProblem } from './problem';
import { SimulationResult } from './simulator';
import { PrebookingCampaign } from './prebooking';

export type PipelineStage = 1 | 2 | 3 | 4;

export interface VentureState {
  currentStage: PipelineStage;
  selectedProblem: BusinessProblem | null;
  idea: {
    productName: string;
    targetProblem: string;
    description: string;
    targetAudience: string;
    priceINR: number;
    filledRoles: string[];
    missingRoles: string[];
  } | null;
  simulationResult: SimulationResult | null;
  prebookingCampaign: PrebookingCampaign | null;
}
