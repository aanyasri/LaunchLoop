/**
 * Persona attribute distributions for Indian market validation.
 *
 * NOTE ON FUTURE GROUNDING WITH REAL-WORLD DATA SOURCES:
 * When swapping the mock simulator with real live AI and statistical panels,
 * these distributions should be grounded in:
 * 1. Census of India & NSSO (National Sample Survey Office) household consumer expenditure surveys.
 * 2. RBI (Reserve Bank of India) / NPCI annual reports for digital payment & UPI adoption across tiers.
 * 3. IAMAI - Internet in India reports for regional language digital penetration.
 * 4. Periodic Labour Force Survey (PLFS) for occupational & income cohort splits.
 */

export interface DemographicDistribution {
  cityTiers: Array<{ tier: 'Metro' | 'Tier-2' | 'Tier-3'; weight: number; sampleCities: string[] }>;
  incomeBands: Array<{
    band: '< ₹5 LPA' | '₹5-12 LPA' | '₹12-25 LPA' | '> ₹25 LPA';
    weight: number;
  }>;
  languages: Array<{ language: string; regionalShare: number }>;
  techComforts: Array<{ level: 'Low' | 'Medium' | 'High'; weight: number }>;
}

export const INDIAN_PERSONA_DISTRIBUTIONS: DemographicDistribution = {
  cityTiers: [
    {
      tier: 'Metro',
      weight: 0.35,
      sampleCities: ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Chennai', 'Pune'],
    },
    {
      tier: 'Tier-2',
      weight: 0.45,
      sampleCities: [
        'Jaipur',
        'Indore',
        'Coimbatore',
        'Lucknow',
        'Chandigarh',
        'Nagpur',
        'Surat',
        'Kochi',
      ],
    },
    {
      tier: 'Tier-3',
      weight: 0.2,
      sampleCities: ['Nashik', 'Warangal', 'Belagavi', 'Alwar', 'Thrissur', 'Muzaffarpur'],
    },
  ],
  incomeBands: [
    { band: '< ₹5 LPA', weight: 0.3 },
    { band: '₹5-12 LPA', weight: 0.4 },
    { band: '₹12-25 LPA', weight: 0.2 },
    { band: '> ₹25 LPA', weight: 0.1 },
  ],
  languages: [
    { language: 'Hindi', regionalShare: 0.4 },
    { language: 'English', regionalShare: 0.2 },
    { language: 'Tamil', regionalShare: 0.1 },
    { language: 'Telugu', regionalShare: 0.1 },
    { language: 'Kannada', regionalShare: 0.07 },
    { language: 'Marathi', regionalShare: 0.08 },
    { language: 'Bengali', regionalShare: 0.05 },
  ],
  techComforts: [
    { level: 'High', weight: 0.35 },
    { level: 'Medium', weight: 0.45 },
    { level: 'Low', weight: 0.2 },
  ],
};
