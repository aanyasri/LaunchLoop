export interface SimulatedPersona {
  id: string;
  name: string;
  age: number;
  occupation: string;
  city: string;
  cityTier: 'Metro' | 'Tier-2' | 'Tier-3';
  incomeBand: '< ₹5 LPA' | '₹5-12 LPA' | '₹12-25 LPA' | '> ₹25 LPA';
  primaryLanguage: string;
  techComfort: 'Low' | 'Medium' | 'High';
  isSceptical: boolean;
  sentiment: 'Bullish' | 'Cautious' | 'Sceptical' | 'Dismissive';
  willingnessToPayINR: number;
  reactionQuote: string;
  primaryObjection: string;
}

export interface SimulationResult {
  id: string;
  productName: string;
  productDescription: string;
  targetProblem: string;
  targetAudience: string;
  priceINR: number;
  overallScore: number;
  confidenceLevel: 'High' | 'Medium' | 'Low';
  confidenceReason: string;
  disclaimer: string;
  personas: SimulatedPersona[];
  consensusPoints: string[];
  disagreementAreas: string[];
  unmetProblemsRaised: string[];
  actionableImprovements: string[];
  generatedAt: string;
  source?: 'gemini' | 'mock';
}
