# LaunchLoop 🇮🇳

> **Never launch blind. Validate demand before you build.**
> A startup de-risking platform for Indian founders.

🔗 **Live demo:** https://launch-loop-nine.vercel.app/

---

## Status

- The **frontend is complete** and runs entirely on clearly labelled **sample demonstration data** through a service layer.
- A Node/Express + Gemini API backend is **in progress** and is **not required** to run or deploy the app.
- Pre-booking uses a **mock payment flow**. No real payments are processed.

---

## 1. Problem Statement

Too many early-stage founders launch without validated demand. They build before confirming customer need, partner with misaligned co-founders, or run out of money before proving anyone will pay. India's market is diverse and price-sensitive, from Tier-1 metros to Tier-2/Tier-3 towns, so validating before building matters even more.

**LaunchLoop** is a single 4-step pipeline that takes a founder from a real-world business problem, to a complementary team, to simulated customer stress-testing, to refundable pre-orders from real customers.

---

## 2. The 4-Step Connected Pipeline

```
[ Step 1: Problem Board ]
       │ (Select a business problem)
       ▼
[ Step 2: Team Assembly ]
       │ (Detect missing roles, match co-founders, run a trial sprint)
       ▼
[ Step 3: Customer Simulator ]
       │ (Stress-test with simulated Indian personas)
       ▼
[ Step 4: Pre-booking Campaign ]
         (Collect refundable deposits; launch only when the threshold is met)
```

1. **Find real business problems.** Companies post problems (sample data: AgriTech, FinTech, Healthcare, Logistics, CleanTech) with pilot budgets. Selecting one starts the venture context.
2. **Assemble complementary co-founders.** The app identifies missing skill sets for the chosen problem, matches founders with complementary profiles, scores compatibility across four working-style dimensions, and offers a 1-week click-to-move trial sprint board before any commitment.
3. **Stress-test with simulated Indian customers.** Generate a panel of simulated personas across city tiers, income bands, languages and scepticism levels. A deterministic confidence score is computed from persona agreement.
4. **Collect refundable pre-orders.** Founders set a threshold, deposit and deadline. The launch button unlocks only when the threshold is met. If it isn't met by the deadline, deposits are automatically refunded.

---

## 3. Roles

| Role | Theme | Features |
| :--- | :--- | :--- |
| **Founder** (`FOUNDER`) | Emerald | Pipeline stepper, Problem Board, Team Finder, Trial Sprints, Customer Simulator, Pre-booking manager |
| **Company** (`ENTERPRISE`) | Indigo | Company dashboard, posted problems, incoming proposal review (shortlist / accept / reject), post a problem |
| **Backer / Early Adopter** (`BACKER`) | Amber | Discover campaigns, pre-book with a refundable deposit, My Pre-bookings |

If a user opens a URL their role isn't allowed to see (for example a Backer opening `/simulate`), `ProtectedRoute` redirects them to their own dashboard with a notice.

---

## 4. Architecture & Folder Structure

Built with **React 18**, **TypeScript** (strict mode), **Tailwind CSS**, **Zod**, **Vite** and **Vitest**.

```
src/
├── app/            # Routing (lazy-loaded routes), root providers
├── config/         # Navigation, role permissions, persona distributions
├── context/        # AuthContext (mock session), VentureContext (pipeline state)
├── features/       # auth, backer, company, dashboard, landing, pipeline,
│                   # prebooking, problems, simulator, team
├── services/       # Typed service interfaces + mock implementations and sample data
├── shared/         # Reusable UI components, layout, forms, hooks
├── types/          # Domain models and Zod schemas
└── utils/          # Pure functions with unit tests
                    # (confidence, matching, compatibility, prebookingLogic, currency)
```

Design choices:
- **Service layer:** components talk to interfaces, not data sources, so mock data can be swapped for a real backend without touching the UI.
- **Pure, tested logic:** matching, compatibility, confidence and threshold/refund logic live in `utils` as pure functions.
- **Validation:** all form and service inputs are validated with Zod.

---

## 5. Running Locally

**Prerequisites:** Node.js 18+ and npm.

```bash
git clone https://github.com/aanyasri/LaunchLoop.git
cd LaunchLoop
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

```bash
npm run test        # unit tests (Vitest)
npm run typecheck   # TypeScript check
npm run lint        # ESLint
npm run build       # production build in /dist
```

---

## 6. Deploying

The app is a static site and needs no backend.

- Build command: `npm run build`
- Output directory: `dist`
- `vercel.json` rewrites all routes to `index.html` so React Router paths work on refresh.

---

## 7. Mapping Mock Services to a Production Backend

| Mock service | Planned production approach |
| :--- | :--- |
| `IProblemService` | Database (e.g. Firebase Firestore or Supabase) with access rules so proposals are readable only by the owning company and the submitting founder |
| `ITeamService` | Embedding-based similarity search over skills and venture needs |
| `ISimulatorService` | Gemini API with structured JSON output validated by the existing Zod schemas; the API key stays on the server |
| `IPrebookingService` | Payment gateway (e.g. Razorpay or Cashfree) holding refundable deposits until the threshold is met |

---

## 8. Limitations & Safeguards

1. **Simulated customers are hypotheses, not proof of demand.** The simulator generates synthetic feedback to prepare founders for real conversations. It does not replace talking to real customers. Every report carries this disclaimer.
2. **Persona distributions are placeholders.** `config/personaDistributions.ts` is designed to be grounded in sources such as Census of India, NSSO and RBI data. The current values are illustrative.
3. **All companies, problems, profiles, budgets and campaigns are sample data** and are labelled as such in the app.
4. **Refundable deposits are held by the payment partner.** LaunchLoop does not claim to be a licensed escrow.
5. **No real payments or financial data.** The checkout is a sandbox demonstration. No card, UPI or bank details are requested or stored.
6. **Demo authentication only.** Login is a mock role switcher, not production auth.
7. **A deposit is a weaker demand signal than a full purchase.** The pre-booking dashboard shows this difference.

---

## 9. Future Work

- Real backend with Gemini-powered persona simulation, production authentication and a database.
- Real payment partner integration for refundable deposits.
- Founder verification and public track record (past campaigns delivered or refunded).
- Optional, embeddable pre-booking pages so founders can use their own website.
- B2B pilot pre-booking slots for companies from the Problem Board.
- Calibrating simulated personas against real survey data.
