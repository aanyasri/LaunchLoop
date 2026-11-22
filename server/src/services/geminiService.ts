import { z } from 'zod';

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
  source: 'gemini' | 'mock';
}

export const PersonaSchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number(),
  occupation: z.string(),
  city: z.string(),
  cityTier: z.enum(['Metro', 'Tier-2', 'Tier-3']),
  incomeBand: z.enum(['< ₹5 LPA', '₹5-12 LPA', '₹12-25 LPA', '> ₹25 LPA']),
  primaryLanguage: z.string(),
  techComfort: z.enum(['Low', 'Medium', 'High']),
  isSceptical: z.boolean(),
  sentiment: z.enum(['Bullish', 'Cautious', 'Sceptical', 'Dismissive']),
  willingnessToPayINR: z.number(),
  reactionQuote: z.string(),
  primaryObjection: z.string(),
});

export const GeminiResponseSchema = z.object({
  personas: z.array(PersonaSchema).min(3),
  consensusPoints: z.array(z.string()).min(1),
  disagreementAreas: z.array(z.string()).min(1),
  unmetProblemsRaised: z.array(z.string()).min(1),
  actionableImprovements: z.array(z.string()).min(1),
});

/**
 * Pure function to compute confidence deterministically from persona sentiment agreement.
 */
export function computeDeterministicConfidence(personas: SimulatedPersona[]) {
  if (!personas || personas.length === 0) {
    return {
      overallScore: 0,
      confidenceLevel: 'Low' as const,
      confidenceReason: 'No persona responses available for evaluation.',
    };
  }

  const sentimentScoreMap: Record<SimulatedPersona['sentiment'], number> = {
    Bullish: 90,
    Cautious: 65,
    Sceptical: 35,
    Dismissive: 10,
  };

  const scores = personas.map((p) => sentimentScoreMap[p.sentiment]);
  const sampleCount = scores.length;
  const mean = scores.reduce((sum, val) => sum + val, 0) / sampleCount;
  const variance = scores.reduce((acc, score) => acc + Math.pow(score - mean, 2), 0) / sampleCount;
  const stdDev = Math.sqrt(variance);

  let confidenceLevel: 'High' | 'Medium' | 'Low';
  let confidenceReason: string;

  if (stdDev <= 18 && sampleCount >= 4) {
    confidenceLevel = 'High';
    confidenceReason = `Strong consensus across ${sampleCount} diverse Indian personas with low variance (σ = ${stdDev.toFixed(1)}).`;
  } else if (stdDev <= 28) {
    confidenceLevel = 'Medium';
    confidenceReason = `Moderate consensus. Sentiments vary across city tiers or income brackets (σ = ${stdDev.toFixed(1)}).`;
  } else {
    confidenceLevel = 'Low';
    confidenceReason = `High polarization among simulated personas (σ = ${stdDev.toFixed(1)}). Personas sharply disagree across demographic segments.`;
  }

  return {
    overallScore: Math.round(mean),
    confidenceLevel,
    confidenceReason,
  };
}

// Fallback seed personas
const FALLBACK_PERSONAS: SimulatedPersona[] = [
  {
    id: 'per_01',
    name: 'Rajesh Patil',
    age: 44,
    occupation: 'Tomato & Pomegranate Farmer',
    city: 'Nashik',
    cityTier: 'Tier-2',
    incomeBand: '₹5-12 LPA',
    primaryLanguage: 'Marathi',
    techComfort: 'Medium',
    isSceptical: false,
    sentiment: 'Bullish',
    willingnessToPayINR: 16000,
    reactionQuote: 'Mandis reject crates if they soften in the afternoon heat. A reliable solar pre-cooler pays for itself in two harvesting seasons.',
    primaryObjection: 'Needs simple servicing in taluka town; cannot send unit to Pune for minor electronics repair.',
  },
  {
    id: 'per_02',
    name: 'Pooja Iyer',
    age: 34,
    occupation: 'Supply Chain Operations Manager',
    city: 'Bengaluru',
    cityTier: 'Metro',
    incomeBand: '₹12-25 LPA',
    primaryLanguage: 'Kannada',
    techComfort: 'High',
    isSceptical: false,
    sentiment: 'Cautious',
    willingnessToPayINR: 20000,
    reactionQuote: 'Promising unit economics if real-time temperature telemetry integrates with standard warehouse ERPs.',
    primaryObjection: 'Requires proof that battery storage doesn\'t degrade in 42°C summer conditions.',
  },
  {
    id: 'per_03',
    name: 'Sunil Agrawal',
    age: 52,
    occupation: 'Mandi Commission Agent & Hub Trader',
    city: 'Indore',
    cityTier: 'Tier-2',
    incomeBand: '> ₹25 LPA',
    primaryLanguage: 'Hindi',
    techComfort: 'Low',
    isSceptical: true,
    sentiment: 'Sceptical',
    willingnessToPayINR: 11000,
    reactionQuote: 'I have seen many solar gadgets fail when loaders throw heavy crates roughly onto the truck beds.',
    primaryObjection: 'Fragile solar glass and sensors will not withstand rural transport handling.',
  },
  {
    id: 'per_04',
    name: 'Meena Devi',
    age: 38,
    occupation: 'Women SHG Farm Collective Leader',
    city: 'Kolhapur',
    cityTier: 'Tier-3',
    incomeBand: '< ₹5 LPA',
    primaryLanguage: 'Marathi',
    techComfort: 'Low',
    isSceptical: true,
    sentiment: 'Dismissive',
    willingnessToPayINR: 7000,
    reactionQuote: '₹18,500 is more than our collective monthly surplus. Without a NABARD subsidy or bank loan, we cannot buy this outright.',
    primaryObjection: 'Upfront capital expense is far too high for smallholder women farmers.',
  },
];

export async function simulateWithGemini(input: {
  productName: string;
  targetProblem: string;
  description: string;
  targetAudience: string;
  priceINR: number;
}): Promise<SimulationResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  // If no API key provided, fall back immediately to mock simulation
  if (!apiKey) {
    return generateMockSimulation(input);
  }

  try {
    const prompt = `You are an Indian startup market simulator. Analyze this proposed product idea for the Indian market and generate a simulated customer validation panel:
Product Name: "${input.productName}"
Problem Addressed: "${input.targetProblem}"
Solution Description: "${input.description}"
Target Audience in India: "${input.targetAudience}"
Pricing: ₹${input.priceINR} INR

Generate exactly 4 to 6 diverse Indian personas across Metro, Tier-2, and Tier-3 cities, varying income brackets (< ₹5 LPA, ₹5-12 LPA, ₹12-25 LPA, > ₹25 LPA), regional languages (Hindi, Marathi, Tamil, Telugu, Kannada, Bengali, etc.), and tech comfort levels. Ensure at least 30-40% of personas are skeptical buyers raising genuine operational and pricing objections.

Return JSON ONLY strictly matching this schema:
{
  "personas": [
    {
      "id": "per_1",
      "name": "Full Indian Name",
      "age": 35,
      "occupation": "Job Title / Role",
      "city": "City Name",
      "cityTier": "Metro" | "Tier-2" | "Tier-3",
      "incomeBand": "< ₹5 LPA" | "₹5-12 LPA" | "₹12-25 LPA" | "> ₹25 LPA",
      "primaryLanguage": "Language",
      "techComfort": "Low" | "Medium" | "High",
      "isSceptical": boolean,
      "sentiment": "Bullish" | "Cautious" | "Sceptical" | "Dismissive",
      "willingnessToPayINR": number,
      "reactionQuote": "First person quote reacting to the idea",
      "primaryObjection": "Specific reason for hesitation or friction"
    }
  ],
  "consensusPoints": ["point 1", "point 2"],
  "disagreementAreas": ["area 1", "area 2"],
  "unmetProblemsRaised": ["problem 1", "problem 2"],
  "actionableImprovements": ["improvement 1", "improvement 2"]
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      // Never log raw key or prompt
      console.warn(`[Gemini API] Request failed with status ${response.status}. Falling back to mock generator.`);
      return generateMockSimulation(input);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      console.warn('[Gemini API] No text returned from model. Falling back to mock generator.');
      return generateMockSimulation(input);
    }

    const parsedJson = JSON.parse(candidateText);
    const validated = GeminiResponseSchema.parse(parsedJson);

    // Compute deterministic confidence from generated personas
    const confidence = computeDeterministicConfidence(validated.personas as SimulatedPersona[]);

    return {
      id: `sim_gemini_${Date.now()}`,
      productName: input.productName,
      productDescription: input.description,
      targetProblem: input.targetProblem,
      targetAudience: input.targetAudience,
      priceINR: input.priceINR,
      overallScore: confidence.overallScore,
      confidenceLevel: confidence.confidenceLevel,
      confidenceReason: confidence.confidenceReason,
      disclaimer: 'This simulation provides hypothesis generation to prepare for real customers, not proof of demand. Use pre-booking to validate actual payment intent.',
      personas: validated.personas as SimulatedPersona[],
      consensusPoints: validated.consensusPoints,
      disagreementAreas: validated.disagreementAreas,
      unmetProblemsRaised: validated.unmetProblemsRaised,
      actionableImprovements: validated.actionableImprovements,
      generatedAt: new Date().toISOString(),
      source: 'gemini',
    };
  } catch (err) {
    // Fail cleanly to mock generator without breaking user experience
    console.warn('[Gemini API] Error during simulation generation. Falling back to mock generator.', err instanceof Error ? err.message : 'Unknown error');
    return generateMockSimulation(input);
  }
}

export function generateMockSimulation(input: {
  productName: string;
  targetProblem: string;
  description: string;
  targetAudience: string;
  priceINR: number;
}): SimulationResult {
  const personas = [...FALLBACK_PERSONAS];
  const confidence = computeDeterministicConfidence(personas);

  return {
    id: `sim_mock_${Date.now()}`,
    productName: input.productName,
    productDescription: input.description,
    targetProblem: input.targetProblem,
    targetAudience: input.targetAudience,
    priceINR: input.priceINR,
    overallScore: confidence.overallScore,
    confidenceLevel: confidence.confidenceLevel,
    confidenceReason: confidence.confidenceReason,
    disclaimer: 'This simulation provides hypothesis generation to prepare for real customers, not proof of demand. Use pre-booking to validate actual payment intent.',
    personas,
    consensusPoints: [
      'Authentic operational demand exists for solving transit spoilage in regional corridors.',
      'Buyers respond favorably to modular capacity and pay-per-crate leasing models.',
    ],
    disagreementAreas: [
      'Upfront CapEx feasibility: Enterprise hubs find pricing viable, but smallholders demand subsidy or credit linkage.',
      'Transit ruggedness: Rural traders express deep skepticism about hardware resilience on rough village roads.',
    ],
    unmetProblemsRaised: [
      'No standardized crate sizes across Maharashtra vs Gujarat mandis.',
      'Emergency manual bypass required when solar panels are covered in transit dust.',
    ],
    actionableImprovements: [
      'Partner with FPOs or cold chain logistics fleets to offer fractional monthly rental rather than full equipment sales.',
      'Add vernacular voice alerts in Hindi and Marathi for temperature threshold warnings.',
    ],
    generatedAt: new Date().toISOString(),
    source: 'mock',
  };
}
