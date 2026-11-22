# LaunchLoop 🇮🇳

> **Never launch blind. Validate demand before you build.**  
> A structured startup de-risking platform built specifically for the Indian innovation ecosystem.

---

## 1. Problem Statement & Vision

Too many early-stage founders launch without validated demand: they build technology before confirming customer need, partner with misaligned co-founders, or exhaust capital before proving willingness to pay. In India's diverse and price-sensitive market—spanning Tier-1 metros to Tier-2/Tier-3 towns—grounding every stage of venture creation in authentic operational constraints and real customer signals before incurring heavy engineering overhead is critical.

**LaunchLoop** provides a unified, 4-step pipeline that carries a founder from a verified real-world problem through complementary team formation, simulated customer stress-testing, and real refundable pre-orders.

---

## 2. The 4-Step Connected Pipeline

```
[ Step 1: Problem Board ] 
       │ (Select verified problem & requirements)
       ▼
[ Step 2: Team Assembly ] 
       │ (Auto-detect missing roles, match co-founders, run 1-week trial sprint)
       ▼
[ Step 3: Customer Simulator ] 
       │ (Stress-test with simulated Indian personas across Metro & Tier-2/3)
       ▼
[ Step 4: Pre-booking Campaign ] 
         (Lock in real demand with refundable deposits held by payment partner)
```

1. **Find Real B2B Problems**: Browse pain points posted by verified Indian corporations (AgriTech, FinTech, Healthcare, Logistics, CleanTech) with committed pilot budgets (₹5L - ₹45L). Choosing a problem automatically initializes the venture context.
2. **Assemble Complementary Co-founders**: The system analyzes the selected problem and identifies missing skillsets (e.g. Tech Lead, Operations, AI Engineer). Founders calculate compatibility scores across four working-style dimensions and execute a structured 1-week click-to-move trial sprint Kanban board before signing equity agreements.
3. **Stress-Test with Simulated Indian Customers**: Generate synthetic customer panels across Indian demographics (Metro IT professionals, Tier-2 MSME retailers, Tier-3 smallholder farmers, homemakers, and skeptical procurement managers). Calculate deterministic confidence scores based on persona agreement and identify critical blind spots before spending capital.
4. **Lock In Refundable Pre-order Demand**: Launch pre-booking campaigns with refundable deposits held safely by the payment partner. The founder's official launch button unlocks **only** when the backer threshold is achieved. If the campaign fails to hit its threshold by the deadline, deposits are automatically refunded.

---

## 3. Architecture & Folder Structure

Built with **React 18**, **TypeScript** (strict mode, zero `any`), **Tailwind CSS**, and **Vite 6**.

```
LaunchLoop/
├── public/                     # Static assets & favicon
├── src/
│   ├── app/                    # Routing, top-level providers, App entry
│   │   ├── App.tsx             # Root component with providers
│   │   └── routes.tsx          # Route-level code-splitting (React.lazy + Suspense)
│   ├── config/                 # Application configuration & permissions
│   │   ├── navigation.ts       # Role-specific navigation menus
│   │   ├── permissions.ts      # Role-based route guard definitions & friendly redirects
│   │   └── personaDistributions.ts # Demographic distributions grounded in Census/NSSO/RBI data
│   ├── context/                # Global state
│   │   ├── AuthContext.tsx     # Role management (Founder, Enterprise, Backer) & mock token
│   │   └── VentureContext.tsx  # Cross-pipeline venture state persisting Problem -> Team -> Sim -> Prebook
│   ├── features/               # Domain feature modules
│   │   ├── auth/               # LoginPage, RegisterPage, ProtectedRoute
│   │   ├── backer/             # DiscoverCampaignsPage, MyPrebookingsPage
│   │   ├── company/            # MyProblemsPage, CompanyProposalsPage
│   │   ├── dashboard/          # Dashboard dispatcher, FounderDashboard, CompanyDashboard, BackerDashboard
│   │   ├── landing/            # LandingPage with 4-step walkthrough & sample disclaimers
│   │   ├── pipeline/           # PipelineStepper component tracking active stage
│   │   ├── prebooking/         # PrebookingDashboardPage, PublicPrebookPage, MockCheckout
│   │   ├── problems/           # ProblemBoardPage, ProblemDetailPage, CreateProblemPage, ProposalSubmitModal
│   │   ├── simulator/          # SimulatorPage, SimulationReportPage, PersonaCards
│   │   └── team/               # TeamFinderPage, EditProfilePage, TrialSprintPage, CompatibilityQuizModal
│   ├── services/
│   │   ├── api/                # Async typed interfaces (IProblemService, ITeamService, etc.)
│   │   └── mocks/              # Realistic Indian sample seed data
│   ├── shared/                 # Reusable atomic UI & layout
│   │   ├── components/
│   │   │   ├── feedback/       # Modal, Alerts
│   │   │   ├── forms/          # FormInput, FormSelect, FormTextarea (accessible, aria-labelled)
│   │   │   ├── layout/         # Navbar (with mobile menu drawer), Footer, Layout
│   │   │   └── ui/             # Button, Badge, Card
│   │   └── hooks/              # useDebounce, custom utilities
│   ├── types/                  # Strict TypeScript domain models & Zod schemas
│   └── utils/                  # Pure deterministic functions & unit tests
│       ├── confidence.ts       # Pure mean/variance confidence scoring
│       ├── matching.ts         # Complementary skill matching algorithm
│       ├── compatibility.ts    # 4-dimension co-founder compatibility formula
│       ├── prebookingLogic.ts  # Threshold & refund state machine
│       └── currency.ts         # Indian Rupee Lakhs/Crores formatter
└── package.json
```

---

## 4. Role Overview & Route Permissions

LaunchLoop provides three distinct role workspaces with designated visual themes and route enforcement:

| Role | Theme Accent | Permitted Features & Navigation |
| :--- | :--- | :--- |
| **Founder** (`FOUNDER`) | Emerald (`brand`) | Pipeline Stepper, Problem Board, Team Finder, Trial Sprints, Customer Simulator, Pre-booking Manager |
| **Company** (`ENTERPRISE`) | Indigo | Company Dashboard, Problem Portfolio, Incoming Proposal Review (Shortlist/Award/Reject), Post a Problem |
| **Backer** (`BACKER`) | Amber | Backer Dashboard, Discover Products, My Pre-bookings Ledger, Refundable Deposit Checkout |

*Route Enforcement*: If a user attempts to access a URL not authorized for their active role (e.g., a Backer navigating to `/simulate` or a Founder navigating to `/company/proposals`), `ProtectedRoute` redirects them to their respective dashboard and displays a friendly notice banner explaining the redirection.

---

## 5. Getting Started & Running Locally

### Prerequisites
- Node.js (v18.x or v20+ recommended)
- npm or yarn

### Installation
```bash
git clone https://github.com/your-username/launchloop.git
cd launchloop
npm install
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Run Unit Tests
```bash
npm run test
```
Executes all 38 unit tests across schemas, permissions, confidence, compatibility, matching, and threshold logic using Vitest.

### Type Check & Build
```bash
npm run typecheck
npm run build
```
Generates an optimized, chunk-split production bundle in `/dist`.

---

## 6. Mapping Mock Services to a Production Backend

The frontend is architected using clean dependency inversion interfaces (`IProblemService`, `ITeamService`, `ISimulatorService`, `IPrebookingService`) that decouple UI components from data persistence:

| Mock Service | Future Production Architecture | Implementation Mapping |
| :--- | :--- | :--- |
| `IProblemService` | **Firebase Firestore / Supabase** | `problems` and `proposals` collections with Row Level Security (RLS) restricting proposal read access to owning company and submitting founder. |
| `ITeamService` | **Supabase Vector / Pinecone** | Candidate skills and venture needs embedded as vectors with pgvector cosine similarity ranking complementary profiles. |
| `ISimulatorService` | **Google Gemini API** | Gemini API prompt with structured JSON output schema matching `SimulatedPersona` and `SimulationResult`. Deterministic confidence computed via pure client/cloud utility. |
| `IPrebookingService` | **Razorpay Route / Cashfree Payments** | Payment gateway split accounts holding refundable pre-booking deposits until the automated threshold webhook fires. |

---

## 7. Honest Limitations & Founder Safeguards

To prevent misleading founders or users, LaunchLoop enforces explicit product and communication safeguards:

1. **Simulated Customers are Hypotheses, Not Demand Proof**:
   - The Idea Simulator generates synthetic feedback to stress-test assumptions and prepare founders for real conversations. It **never** replaces talking to real human customers. Every simulation report displays a prominent disclaimer: *"This simulation provides hypothesis generation to prepare for real customers, not proof of demand. Use pre-booking to validate actual payment intent."*
2. **Sample Demonstration Data**:
   - All seeded enterprise problems, co-founder profiles, and pre-booking campaigns are realistic sample demonstration data designed for the Indian startup landscape. Footer and preview badges clearly label sample data.
3. **Refundable Deposits Held by Payment Partner**:
   - LaunchLoop never claims to be a licensed banking escrow. Backer funds are described accurately as: *"Refundable deposit held safely by the payment partner, automatically refunded if the threshold is not met by the deadline."*
4. **Zero Financial or Card Data Storage**:
   - The mock checkout is a pure sandbox demonstration. No real credit card, UPI MPIN, or bank credentials are ever requested or stored.
5. **No Invented Founder Testimonials**:
   - The landing page focuses exclusively on the objective 4-stage validation workflow and clear feature demonstrations.

---

## License

MIT © LaunchLoop India. Built for builders.
