import { PrebookingCampaign } from '../types/prebooking';

export type DepositOutcome =
  | 'COLLECTING_DEPOSITS'
  | 'THRESHOLD_MET_LAUNCH_UNLOCKED'
  | 'AUTOMATIC_REFUND_TRIGGERED';

export interface PrebookingAnalysis {
  progressPercentage: number;
  isThresholdMet: boolean;
  isExpired: boolean;
  outcome: DepositOutcome;
  daysRemaining: number;
  totalDepositAmountHeldINR: number;
  marketConvictionScore: number; // 0 to 100 demand signal index
  convictionExplanation: string;
}

/**
 * Analyzes a pre-booking campaign's threshold, deadline, and demand signals.
 * Pure function: Deterministically calculates whether deposits are held, unlocked, or refunded.
 */
export function analyzeCampaignStatus(
  campaign: Pick<
    PrebookingCampaign,
    | 'currentBackersCount'
    | 'targetBackersThreshold'
    | 'deadlineDate'
    | 'refundableDepositINR'
    | 'fullPriceINR'
    | 'fullPaymentsCount'
    | 'depositOnlyCount'
  >,
  referenceDateISO?: string
): PrebookingAnalysis {
  const now = referenceDateISO ? new Date(referenceDateISO).getTime() : Date.now();
  const deadline = new Date(campaign.deadlineDate).getTime();
  const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  const isExpired = diffDays < 0;

  const isThresholdMet = campaign.currentBackersCount >= campaign.targetBackersThreshold;
  const progressPercentage = Math.min(
    100,
    Math.round((campaign.currentBackersCount / campaign.targetBackersThreshold) * 100)
  );

  let outcome: DepositOutcome;
  if (isThresholdMet) {
    outcome = 'THRESHOLD_MET_LAUNCH_UNLOCKED';
  } else if (isExpired) {
    outcome = 'AUTOMATIC_REFUND_TRIGGERED';
  } else {
    outcome = 'COLLECTING_DEPOSITS';
  }

  // Calculate total refundable deposits held by payment partner
  const totalDepositAmountHeldINR =
    campaign.depositOnlyCount * campaign.refundableDepositINR +
    campaign.fullPaymentsCount * campaign.fullPriceINR;

  // Demand Conviction Index:
  // A full prepayment shows 3x higher market conviction than a small refundable deposit
  const weightedDemand =
    campaign.fullPaymentsCount * 3 + campaign.depositOnlyCount * 1;
  const targetWeighted = campaign.targetBackersThreshold * 1.5;
  const marketConvictionScore = Math.min(
    100,
    Math.round((weightedDemand / targetWeighted) * 100)
  );

  let convictionExplanation: string;
  if (isThresholdMet) {
    convictionExplanation = `Validated demand! Target of ${campaign.targetBackersThreshold} backers reached. Founder launch button is now enabled.`;
  } else if (isExpired) {
    convictionExplanation = `Threshold not reached by ${campaign.deadlineDate}. All customer deposits are automatically returned by the payment partner.`;
  } else {
    convictionExplanation = `${campaign.currentBackersCount}/${campaign.targetBackersThreshold} pre-booked (${diffDays} days remaining). Refundable deposits held safely by payment partner.`;
  }

  return {
    progressPercentage,
    isThresholdMet,
    isExpired,
    outcome,
    daysRemaining: Math.max(0, diffDays),
    totalDepositAmountHeldINR,
    marketConvictionScore,
    convictionExplanation,
  };
}
