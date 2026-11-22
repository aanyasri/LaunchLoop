import { z } from 'zod';
import { SimulationResult, SimulatedPersona } from '../../types/simulator';
import { SAMPLE_SIMULATED_PERSONAS } from '../mocks/seedData';
import { computeDeterministicConfidence } from '../../utils/confidence';

export const SimulateIdeaSchema = z.object({
  productName: z.string().min(3, 'Product name must be at least 3 characters').max(60),
  targetProblem: z.string().min(10, 'Describe the business or user problem being solved'),
  description: z.string().min(20, 'Provide a clear description of the solution and value proposition'),
  targetAudience: z.string().min(5, 'Specify target audience in India (e.g. Tier-2 MSMEs, Agri FPOs)'),
  priceINR: z.number().positive('Price must be greater than ₹0'),
});

export type SimulateIdeaInput = z.infer<typeof SimulateIdeaSchema>;

export interface ISimulatorService {
  simulateProductIdea(input: SimulateIdeaInput): Promise<SimulationResult>;
  getSimulationReport(id: string): Promise<SimulationResult | null>;
}

const simulateDelay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

class MockSimulatorService implements ISimulatorService {
  private pastReports: Map<string, SimulationResult> = new Map();

  constructor() {
    // Seed initial report for Aanya's AgriCold venture
    const initialPersonas = [...SAMPLE_SIMULATED_PERSONAS];
    const initialConfidence = computeDeterministicConfidence(initialPersonas);
    const initialReport: SimulationResult = {
      id: 'sim_agricold_01',
      productName: 'AgriCold Solar Pre-cooling Pod',
      productDescription: 'Modular solar-assisted thermal cold boxes keeping farm produce fresh for 48 hours without grid power.',
      targetProblem: 'Reducing 38% perishable spoilage in the Nashik-Mumbai transit corridor.',
      targetAudience: 'Smallholder tomato/vegetable farmers & logistics aggregation hubs in Maharashtra.',
      priceINR: 18500,
      overallScore: initialConfidence.overallScore,
      confidenceLevel: initialConfidence.confidenceLevel,
      confidenceReason: initialConfidence.confidenceReason,
      disclaimer: 'This simulation provides hypothesis generation to prepare for real customers, not proof of demand. Use pre-booking to validate actual payment intent.',
      personas: initialPersonas,
      consensusPoints: [
        'Decentralised solar pre-cooling solves an authentic, high-frequency revenue loss for perishable produce.',
        'High willingness to adopt if backed by FPO shared leasing or pay-per-crate pricing models.',
      ],
      disagreementAreas: [
        'Upfront capital expenditure viability: Enterprise buyers find ₹18.5k cheap, while smallholders demand under ₹10k or subsidy linkage.',
        'Durability vs cost: Rural commission agents express deep skepticism regarding ruggedness on potholed transit routes.',
      ],
      unmetProblemsRaised: [
        'Monsoon season fallback: How does the unit maintain thermal stability during 7+ days of continuous rain without solar charging?',
        'Local servicing: Lack of electronics repair capability in sub-district taluka centers.',
      ],
      actionableImprovements: [
        'Offer a hybrid battery + phase-change pack for monsoon resilience.',
        'Partner with rural FPOs to finance pods via crate rentals rather than requiring outright farmer purchase.',
        'Replace digital LCDs with color-coded analog LEDs and audio prompts for low-tech literacy workers.',
      ],
      generatedAt: '2026-11-20T10:30:00Z',
    };
    this.pastReports.set(initialReport.id, initialReport);
  }

  async simulateProductIdea(input: SimulateIdeaInput): Promise<SimulationResult> {
    await simulateDelay();
    const validated = SimulateIdeaSchema.parse(input);

    // Adapt sample personas dynamically to the input concept
    const isAffordable = validated.priceINR < 2000;
    const isEnterprise = validated.priceINR > 10000;

    const personas: SimulatedPersona[] = [
      {
        id: `per_${Date.now()}_1`,
        name: 'Rameshwar Kadam',
        age: 51,
        occupation: 'Local Cooperative Chair & Farmer',
        city: 'Nashik',
        cityTier: 'Tier-2',
        incomeBand: '< ₹5 LPA',
        primaryLanguage: 'Marathi',
        techComfort: 'Low',
        isSceptical: true,
        sentiment: isAffordable ? 'Cautious' : 'Sceptical',
        willingnessToPayINR: Math.round(validated.priceINR * 0.4),
        reactionQuote: `For ${validated.productName}, price ₹${validated.priceINR} feels ${
          isAffordable ? 'reasonable if tested first' : 'steep for a small shopkeeper'
        }. If payment is installment-based, more people will consider it.`,
        primaryObjection: 'Requires proof of immediate operational savings in month one.',
      },
      {
        id: `per_${Date.now()}_2`,
        name: 'Sunita Mehra',
        age: 38,
        occupation: 'Wholesale Distributor',
        city: 'Indore',
        cityTier: 'Tier-2',
        incomeBand: '₹12-25 LPA',
        primaryLanguage: 'Hindi',
        techComfort: 'Medium',
        isSceptical: false,
        sentiment: 'Bullish',
        willingnessToPayINR: validated.priceINR,
        reactionQuote: `Addresses a severe bottleneck in ${validated.targetProblem.substring(
          0,
          36
        )}... We lose hours every week here. I would gladly test this in our regional depot.`,
        primaryObjection: 'Needs clear on-ground warranty and service turn-around SLAs.',
      },
      {
        id: `per_${Date.now()}_3`,
        name: 'Arvind Swaminathan',
        age: 29,
        occupation: 'B2B Category Manager',
        city: 'Bengaluru',
        cityTier: 'Metro',
        incomeBand: '> ₹25 LPA',
        primaryLanguage: 'English',
        techComfort: 'High',
        isSceptical: false,
        sentiment: 'Bullish',
        willingnessToPayINR: Math.round(validated.priceINR * 1.2),
        reactionQuote: `Strong product framing. If the workflow connects directly to our vendor inventory, ₹${validated.priceINR} is an easy ROI justification.`,
        primaryObjection: 'Requires API documentation and security compliance audit.',
      },
      {
        id: `per_${Date.now()}_4`,
        name: 'Manjula Devi',
        age: 44,
        occupation: 'Micro-Enterprise Owner & Homemaker',
        city: 'Warangal',
        cityTier: 'Tier-3',
        incomeBand: '< ₹5 LPA',
        primaryLanguage: 'Telugu',
        techComfort: 'Low',
        isSceptical: true,
        sentiment: isEnterprise ? 'Dismissive' : 'Cautious',
        willingnessToPayINR: Math.round(validated.priceINR * 0.3),
        reactionQuote: `Sounds like a modern tech tool made for big cities. Unless someone explains it in Telugu at my shop, I won't know how to operate it.`,
        primaryObjection: 'Language barrier and lack of offline human onboarding.',
      },
      {
        id: `per_${Date.now()}_5`,
        name: 'Kabir Oberoi',
        age: 23,
        occupation: 'Logistics Trainee & Student',
        city: 'Delhi NCR',
        cityTier: 'Metro',
        incomeBand: '< ₹5 LPA',
        primaryLanguage: 'Hindi',
        techComfort: 'High',
        isSceptical: false,
        sentiment: 'Cautious',
        willingnessToPayINR: Math.round(validated.priceINR * 0.7),
        reactionQuote: 'Great UX concept on paper, but Indian supply chains are chaotic. It needs to work during connectivity blackouts.',
        primaryObjection: 'Offline sync capability during weak network reception.',
      },
    ];

    const confidence = computeDeterministicConfidence(personas);

    const report: SimulationResult = {
      id: `sim_${Date.now()}`,
      productName: validated.productName,
      productDescription: validated.description,
      targetProblem: validated.targetProblem,
      targetAudience: validated.targetAudience,
      priceINR: validated.priceINR,
      overallScore: confidence.overallScore,
      confidenceLevel: confidence.confidenceLevel,
      confidenceReason: confidence.confidenceReason,
      disclaimer:
        'This simulation provides hypothesis generation to prepare for real customers, not proof of demand. Use pre-booking to validate actual payment intent.',
      personas,
      consensusPoints: [
        'Core value proposition directly addresses a known operational friction point.',
        'High willingness to adopt among digitally literate business owners and metro logistics managers.',
      ],
      disagreementAreas: [
        `Price sensitivity gap: Metro managers accept ₹${validated.priceINR}, while Tier-3 merchants request a lower pilot threshold.`,
        'Digital vs offline divide: High-comfort users demand APIs, while Tier-3 users need vernacular voice support.',
      ],
      unmetProblemsRaised: [
        'Offline capability when cellular broadband is unavailable.',
        'Local language support across regional dialects (Telugu, Marathi, Hindi).',
      ],
      actionableImprovements: [
        'Introduce a low-risk refundable deposit pilot model to reassure cautious buyers.',
        'Add vernacular voice guidance for low-tech literacy operators.',
        'Offer a tiered pricing model with monthly SaaS or pay-per-use billing.',
      ],
      generatedAt: new Date().toISOString(),
    };

    this.pastReports.set(report.id, report);
    return report;
  }

  async getSimulationReport(id: string): Promise<SimulationResult | null> {
    await simulateDelay();
    return this.pastReports.get(id) || null;
  }
}

export const simulatorService: ISimulatorService = new MockSimulatorService();
