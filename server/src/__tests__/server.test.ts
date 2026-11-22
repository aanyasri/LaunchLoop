import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createApp } from '../app.js';
import { Server } from 'http';

describe('LaunchLoop Express Backend API Tests', () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    const app = createApp();
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address();
        if (typeof address === 'object' && address) {
          baseUrl = `http://localhost:${address.port}`;
        }
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('GET /api/health returns ok status', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('LaunchLoop API');
  });

  it('POST /api/simulate rejects invalid input schema', async () => {
    const invalidPayload = {
      productName: 'A', // too short
      targetProblem: 'Too short',
      description: 'Short',
      targetAudience: '',
      priceINR: -100, // negative price
    };

    const res = await fetch(`${baseUrl}/api/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPayload),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Validation failed');
    expect(body.details).toBeDefined();
  });

  it('POST /api/simulate falls back to mock personas when Gemini API key is missing', async () => {
    delete process.env.GEMINI_API_KEY;

    const validPayload = {
      productName: 'Solar Cold Pod',
      targetProblem: 'Post harvest vegetable spoilage in Maharashtra',
      description: 'Solar thermal cold storage box for farm produce maintaining 12C.',
      targetAudience: 'Smallholder tomato farmers in Nashik',
      priceINR: 18500,
    };

    const res = await fetch(`${baseUrl}/api/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.source).toBe('mock');
    expect(body.data.personas.length).toBeGreaterThan(0);
    expect(body.data.overallScore).toBeGreaterThan(0);
    expect(body.data.confidenceLevel).toBeDefined();
  });

  it('POST /api/problems enforces ENTERPRISE role check', async () => {
    const problemPayload = {
      title: 'Decentralized Solar Cold Hubs for APMC Mandis',
      companyName: 'Mahindra Logistics Innovation Hub',
      industry: 'AgriTech',
      summary: 'Perishable spoilage in transit corridor between Nashik and Mumbai.',
      description: 'Detailed operational context with at least 50 characters of description for testing validation.',
      constraints: ['Sub-20k unit cost', 'Dust-proof housing'],
      desiredOutcome: 'Pilot test across 10 rural farm gates with zero spoilage.',
      rewardMin: 500000,
      rewardMax: 1500000,
      confidentialityLevel: 'Public',
      ipPolicyNote: 'Founder retains ownership of core intellectual property.',
      suggestedRoles: ['Tech Lead / Fullstack', 'Operations & Logistics'],
    };

    // 1. Unauthenticated request -> 401
    const unauthRes = await fetch(`${baseUrl}/api/problems`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(problemPayload),
    });
    expect(unauthRes.status).toBe(401);

    // 2. BACKER role attempting to post enterprise problem -> 403 Forbidden
    const backerRes = await fetch(`${baseUrl}/api/problems`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer mock-session-token-backer-1',
      },
      body: JSON.stringify(problemPayload),
    });
    expect(backerRes.status).toBe(403);

    // 3. ENTERPRISE role -> 201 Created
    const entRes = await fetch(`${baseUrl}/api/problems`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer mock-session-token-enterprise-1',
      },
      body: JSON.stringify(problemPayload),
    });
    expect(entRes.status).toBe(201);
    const entBody = await entRes.json();
    expect(entBody.success).toBe(true);
    expect(entBody.data.id).toBeDefined();
  });

  it('POST /api/campaigns enforces FOUNDER role and /prebook enforces BACKER role', async () => {
    const campaignPayload = {
      title: 'AgriCold Solar Pod Pre-booking Campaign',
      tagline: 'Preserve 48 hours of freshness without grid electricity.',
      description: 'Detailed campaign description with at least 20 characters for validation testing.',
      targetBackersThreshold: 100,
      refundableDepositINR: 499,
      fullPriceINR: 18500,
      deadlineDate: '2026-12-31',
      depositTermsNote: 'Refundable deposit, automatically refunded if the threshold isn\'t met by the deadline.',
    };

    // 1. Create Campaign as FOUNDER
    const createCampRes = await fetch(`${baseUrl}/api/campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer mock-session-token-founder-1',
      },
      body: JSON.stringify(campaignPayload),
    });
    expect(createCampRes.status).toBe(201);
    const campBody = await createCampRes.json();
    const campaignId = campBody.data.id;

    // 2. Prebook deposit as FOUNDER -> 403 (Only BACKER allowed)
    const founderPrebook = await fetch(`${baseUrl}/api/campaigns/${campaignId}/prebook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer mock-session-token-founder-1',
      },
      body: JSON.stringify({
        paymentType: 'REFUNDABLE_DEPOSIT',
        amountINR: 499,
        paymentMethod: 'UPI',
      }),
    });
    expect(founderPrebook.status).toBe(403);

    // 3. Prebook deposit as BACKER -> 201 Created
    const backerPrebook = await fetch(`${baseUrl}/api/campaigns/${campaignId}/prebook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer mock-session-token-backer-1',
      },
      body: JSON.stringify({
        paymentType: 'REFUNDABLE_DEPOSIT',
        amountINR: 499,
        paymentMethod: 'UPI',
      }),
    });
    expect(backerPrebook.status).toBe(201);
    const prebookBody = await backerPrebook.json();
    expect(prebookBody.success).toBe(true);
    expect(prebookBody.data.status).toBe('Deposit_Secured');
  });
});
