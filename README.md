# Saarthi AI (सारथी) 🚀
### *The Intelligent Copilot & Advocate for Gig and Informal Workers*

🌐 **Live Web Application:** [https://saarthi-ai-lac-phi.vercel.app/](https://saarthi-ai-lac-phi.vercel.app/)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-saarthi--ai--lac--phi.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://saarthi-ai-lac-phi.vercel.app/)

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Vercel AI SDK](https://img.shields.io/badge/Vercel%20AI%20SDK-3.4-blue?style=flat&logo=vercel)](https://sdk.vercel.ai/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-8%2F8%20Passing-emerald?style=flat&logo=vitest)](https://vitest.dev/)
[![Accessibility](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AA-orange?style=flat)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📖 Overview

Gig and informal workers—such as food delivery riders, ride-share drivers, and daily wage earners—face severe systemic challenges:
- **Complex Welfare Bureaucracy:** Unclear access to government schemes like e-Shram or Ayushman Bharat.
- **Opaque Earnings & Deductions:** Difficulty auditing fuel burn, platform cuts, and arbitrary late-delivery penalties.
- **On-the-Job Physical Hazards:** Extreme fatigue, night-time safety risks, and road accidents.
- **Language Barriers & Algorithmic Deactivations:** Unfair platform account blockings without a human hearing or legal recourse.

**Saarthi AI (सारथी)** bridges this gap by delivering an empathetic, accessible, GenAI-powered assistant tailored specifically for low-literacy and vernacular contexts.

---

## 🌟 Core Functional Pillars

| Pillar | Capability | Key Features |
| :--- | :--- | :--- |
| **💰 Earnings & Expense Helper** | Net vs Gross Auditing | Smart regex parsing of payout SMS/text from Swiggy, Zomato, Uber, Ola, Zepto, Blinkit; true take-home calculation factoring fuel costs and platform cuts; flags penalties >15%. |
| **🏛️ Welfare & Rights Finder** | Benefits & Schemes Database | Simplified 5th-grade summaries of e-Shram Card (₹2L accident cover), Ayushman Bharat (₹5L health cover), PM-SYM Pension, and State Gig Worker Acts. |
| **🛡️ Safety & Emergency Hub** | Road Hazard & Distress Protection | 1-Tap SOS broadcast with GPS coordinates; continuous driving fatigue tracker with rest nudges; simulated incoming emergency call to safely exit hostile customer situations. |
| **📝 Dispute & Grievance Drafter** | Algorithmic Appeal Wizard | Generates formal, legally grounded support tickets and legal notices citing labor codes and fair practice guidelines for wrongful deactivations or unpaid tips. |
| **🎙️ Multilingual & Voice-First** | Low-Literacy Inclusivity | Web Speech API integration (Speech-to-Text mic input and Text-to-Speech read aloud); Hindi, Hinglish, and English vernacular support; 5th-grade plain-language engine. |

---

## 🔒 Security & Privacy Guardrails

1. **Zero-Retention PII Anonymization (`lib/pii.ts`)**:
   - Automatically sanitizes and tokenizes high-risk PII (names, 10-digit phone numbers, Aadhaar, PAN, vehicle registration numbers, bank account numbers, UPI IDs, and GPS coordinates) before hitting external LLM endpoints.
   - Deterministic surrogate tokens (e.g. `[PHONE_1]`, `[VEHICLE_1]`) ensure the user's private data is never retained by remote AI providers.
2. **Multi-Vector Prompt Injection Defense**:
   - Scans and neutralizes adversarial prompt injection payloads (e.g., `ignore all previous instructions`, jailbreak roleplays, and zero-width unicode exploits) found in user submissions or parsed screenshots.

---

## ♿ Accessibility & Inclusivity (WCAG 2.1 AA)

- **Outdoor High-Contrast Mode:** Pure high-contrast amber/black theme designed for direct sunlight visibility on motorcycle phone mounts.
- **Generous Touch Targets:** All interactive buttons and inputs adhere to the minimum $\ge$48x48px touch target standard.
- **Screen Reader Navigation:** ARIA live regions, semantic landmark navigation (`role="status"`, `role="alert"`), and a skip-to-content bypass link.
- **5th-Grade Reading Level:** Strictly avoids dense legal jargon unless requested, using bulleted summaries for fast mobile reading.

---

## 🏗️ Architecture

```
warmup/
├── app/
│   ├── api/chat/route.ts      # Vercel Edge streaming endpoint (PII sanitization & AI router)
│   ├── globals.css            # Tailwind CSS & high-contrast outdoor theme
│   ├── layout.tsx             # Root layout with metadata & fonts
│   └── page.tsx               # Entry page rendering the copilot
├── components/
│   └── chat.tsx               # Interactive multi-pillar chat UI with useChat() and Web Speech API
├── lib/
│   ├── pii.ts                 # Zero-retention PII anonymization & prompt injection shield
│   ├── earnings.ts            # SMS parser, net income calculation & deduction auditing
│   ├── welfare.ts             # Welfare schemes knowledge base & eligibility checker
│   ├── safety.ts              # Safety protocols, fatigue evaluator & SOS generator
│   └── dispute.ts             # Formal dispute & deactivation appeal letter templates
└── tests/
    └── saarthi.test.ts        # Automated unit and factuality test suite (Vitest)
```

---

## 🚀 Quickstart

### Prerequisites
- Node.js 18+ (tested up to Node 26)
- npm 9+

### 1. Clone & Install
```bash
git clone https://github.com/your-username/saarthi-ai.git
cd saarthi-ai
npm install --legacy-peer-deps
```

### 2. Configure Environment (Optional)
```bash
cp .env.example .env.local
```
> *Note: Saarthi AI runs out of the box with its built-in zero-latency edge domain engine without requiring paid external API keys.*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Test Suite
```bash
npm test
```

---

## 🧪 Automated Testing

Saarthi AI includes a comprehensive test suite covering all core algorithms:

```bash
✓ tests/saarthi.test.ts (8 tests)
  ✓ 1. PII Anonymization & Prompt Injection Defense
    ✓ strips phone numbers, Aadhaar, vehicle numbers, and UPI IDs
    ✓ neutralizes prompt injection payloads
  ✓ 2. Earnings & Expense Helper Engine
    ✓ parses SMS amounts, tips, and computes take-home after fuel
  ✓ 3. Safety Protocols & Fatigue Guardian
    ✓ triggers dangerous fatigue warning after 4.5 continuous hours
    ✓ generates emergency SOS dispatch with Google Maps GPS link
  ✓ 4. Welfare & Rights Finder Factuality
    ✓ correctly maps e-Shram benefits and age criteria
    ✓ filters out PM-SYM pension for workers over age 40 or earning > 15000
  ✓ 5. Dispute & Grievance Drafter
    ✓ generates legally structured deactivation appeal with citations
```

---

## 📜 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.
