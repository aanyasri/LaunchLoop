export interface PrebookingCampaign {
  id: string;
  founderId: string;
  founderName: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  targetBackersThreshold: number;
  currentBackersCount: number;
  refundableDepositINR: number;
  fullPriceINR: number;
  deadlineDate: string;
  isLaunched: boolean;
  depositStatus: 'Collecting' | 'Threshold Met' | 'Refunded' | 'Disbursed';
  depositTermsNote: string;
  fullPaymentsCount: number;
  depositOnlyCount: number;
}

export interface PrebookingOrder {
  id: string;
  campaignId: string;
  backerName: string;
  backerEmail: string;
  paymentType: 'REFUNDABLE_DEPOSIT' | 'FULL_PAYMENT';
  amountINR: number;
  paymentMethod: 'UPI' | 'Card' | 'NetBanking';
  status: 'Deposit_Secured' | 'Refunded';
  timestamp: string;
}
