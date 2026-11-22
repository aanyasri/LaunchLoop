// Simple in-memory / JSON-seeded data store for the LaunchLoop demo server
// No external database setup required.

export interface BusinessProblem {
  id: string;
  title: string;
  companyName: string;
  isVerifiedCompany: boolean;
  industry: string;
  summary: string;
  description: string;
  constraints: string[];
  desiredOutcome: string;
  rewardRange: {
    min: number;
    max: number;
    currency: 'INR';
    type: string;
  };
  confidentialityLevel: 'Public' | 'NDA Required' | 'Invite Only';
  ipPolicyNote: string;
  proposalsCount: number;
  deadline: string;
  createdAt: string;
  suggestedRoles: string[];
}

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

export class DataStore {
  private problems: BusinessProblem[] = [
    {
      id: 'prob_agri_01',
      title: 'Decentralized Solar Cold Storage for Nashik Onion & Tomato Mandis',
      companyName: 'Mahindra Logistics Innovation Hub',
      isVerifiedCompany: true,
      industry: 'AgriTech',
      summary: 'Perishable crop loss exceeds 38% during transit between Nashik farm hubs and Vashi APMC market.',
      description: 'Smallholder tomato and onion farmers lose significant crop value due to lack of immediate pre-cooling facilities at the village consolidation point. We need micro-cold units that can run 100% off-grid with IoT temperature logging.',
      constraints: ['CapEx strictly under ₹25,000 per unit', 'Survives 48-hour power outage', 'Simple vernacular Marathi/Hindi interface'],
      desiredOutcome: 'Deploy pilot cold hubs across 10 Nashik farmer collectives with zero produce spoilage.',
      rewardRange: { min: 800000, max: 2500000, currency: 'INR', type: 'Pilot Contract' },
      confidentialityLevel: 'Public',
      ipPolicyNote: 'Founder retains ownership of all core IP. Enterprise receives first right of commercial deployment.',
      proposalsCount: 2,
      deadline: '2026-12-31',
      createdAt: '2026-10-15',
      suggestedRoles: ['Tech Lead / Fullstack', 'Operations & Logistics'],
    },
    {
      id: 'prob_fin_02',
      title: 'Zero-Footprint Invoice Discounting for Automotive Tier-3 Suppliers',
      companyName: 'Tata AutoComp Systems',
      isVerifiedCompany: true,
      industry: 'FinTech',
      summary: 'Sub-tier MSME suppliers face 90-120 day working capital lockup waiting for tier-1 invoice reconciliations.',
      description: 'Tier-3 auto-component machine shops in Pune and Aurangabad experience severe cash flow bottlenecks while waiting for GST reconciliation and invoice clearance. We need an automated verification bridge using GSTN and TReDS APIs.',
      constraints: ['No balance-sheet collateral required from suppliers', 'Approval turn-around under 4 hours via automated e-mandate'],
      desiredOutcome: 'Pilot program covering 50 machine shop vendors in Chakan industrial belt.',
      rewardRange: { min: 1200000, max: 3500000, currency: 'INR', type: 'Pilot Contract' },
      confidentialityLevel: 'Public',
      ipPolicyNote: 'Founder retains software IP. Enterprise receives preferred enterprise license rates.',
      proposalsCount: 3,
      deadline: '2027-01-15',
      createdAt: '2026-10-20',
      suggestedRoles: ['AI / Data Engineer', 'Finance & Legal'],
    },
  ];

  private campaigns: PrebookingCampaign[] = [
    {
      id: 'camp_01',
      founderId: 'usr_founder_01',
      founderName: 'Aanya Sharma',
      slug: 'agricold-pod',
      title: 'AgriCold: Solar Pre-cooling Pod for Tomato & Onion Farmers',
      tagline: 'Decentralized solar thermal cooling preserving 48 hours of freshness without grid electricity.',
      description: 'Engineered for Indian farm clusters. Holds 15 crates of tomatoes at optimal 12°C. Zero diesel generator dependency.',
      targetBackersThreshold: 100,
      currentBackersCount: 68,
      refundableDepositINR: 499,
      fullPriceINR: 18500,
      deadlineDate: '2026-12-31',
      isLaunched: false,
      depositStatus: 'Collecting',
      depositTermsNote: 'Refundable deposit, automatically refunded if the threshold isn\'t met by the deadline. Held safely by the payment partner.',
      fullPaymentsCount: 14,
      depositOnlyCount: 54,
    },
  ];

  private orders: PrebookingOrder[] = [
    {
      id: 'ord_seed_01',
      campaignId: 'camp_01',
      backerName: 'Vikram Joshi',
      backerEmail: 'vikram.j@outlook.com',
      paymentType: 'REFUNDABLE_DEPOSIT',
      amountINR: 499,
      paymentMethod: 'UPI',
      status: 'Deposit_Secured',
      timestamp: '2026-11-18',
    },
  ];

  // Problems
  getProblems(): BusinessProblem[] {
    return [...this.problems];
  }

  getProblemById(id: string): BusinessProblem | undefined {
    return this.problems.find((p) => p.id === id);
  }

  addProblem(problem: Omit<BusinessProblem, 'id' | 'createdAt' | 'proposalsCount'>): BusinessProblem {
    const newProblem: BusinessProblem = {
      ...problem,
      id: `prob_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      proposalsCount: 0,
    };
    this.problems.unshift(newProblem);
    return newProblem;
  }

  // Campaigns
  getCampaigns(): PrebookingCampaign[] {
    return [...this.campaigns];
  }

  getCampaignById(id: string): PrebookingCampaign | undefined {
    return this.campaigns.find((c) => c.id === id || c.slug === id);
  }

  addCampaign(campaign: Omit<PrebookingCampaign, 'id' | 'currentBackersCount' | 'isLaunched' | 'depositStatus' | 'fullPaymentsCount' | 'depositOnlyCount'>): PrebookingCampaign {
    const newCampaign: PrebookingCampaign = {
      ...campaign,
      id: `camp_${Date.now()}`,
      currentBackersCount: 0,
      isLaunched: false,
      depositStatus: 'Collecting',
      fullPaymentsCount: 0,
      depositOnlyCount: 0,
    };
    this.campaigns.unshift(newCampaign);
    return newCampaign;
  }

  // Orders
  getOrders(): PrebookingOrder[] {
    return [...this.orders];
  }

  addOrder(order: Omit<PrebookingOrder, 'id' | 'status' | 'timestamp'>): PrebookingOrder {
    const newOrder: PrebookingOrder = {
      ...order,
      id: `ord_${Date.now()}`,
      status: 'Deposit_Secured',
      timestamp: new Date().toISOString().split('T')[0],
    };
    this.orders.unshift(newOrder);

    // Update campaign backer count
    const camp = this.campaigns.find((c) => c.id === order.campaignId);
    if (camp) {
      camp.currentBackersCount += 1;
      if (order.paymentType === 'FULL_PAYMENT') {
        camp.fullPaymentsCount += 1;
      } else {
        camp.depositOnlyCount += 1;
      }
      if (camp.currentBackersCount >= camp.targetBackersThreshold) {
        camp.depositStatus = 'Threshold Met';
      }
    }

    return newOrder;
  }
}

export const store = new DataStore();
