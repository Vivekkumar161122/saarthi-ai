# Saarthi AI (सारथी) 🚀
### *The Intelligent Copilot & Advocate for Gig and Informal Workers*

🌐 **Live Web Application:** [https://saarthi-ai-lac-phi.vercel.app/](https://saarthi-ai-lac-phi.vercel.app/)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-saarthi--ai--lac--phi.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://saarthi-ai-lac-phi.vercel.app/)

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Vercel Edge Runtime](https://img.shields.io/badge/Runtime-Vercel%20Edge%20(Zero%20Cold%20Start)-black?style=flat&logo=vercel)](https://vercel.com/docs/functions/edge-functions)
[![Gemini REST API](https://img.shields.io/badge/Gemini%20REST-Native%20Streams-4285F4?style=flat&logo=google)](https://ai.google.dev/)
[![Zero External AI SDKs](https://img.shields.io/badge/Dependencies-Zero%20External%20AI%20SDKs-emerald?style=flat)](https://github.com/Vivekkumar161122/saarthi-ai)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-41%2F41%20Passing-emerald?style=flat&logo=vitest)](https://vitest.dev/)
[![Accessibility](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AA-orange?style=flat)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📖 Overview

Gig and informal workers—such as delivery riders, cab/auto drivers, and daily wage earners—face severe systemic challenges:
- **Complex Welfare Bureaucracy:** Unclear access to government schemes like e-Shram, Ayushman Bharat, or PM-SYM pensions.
- **Opaque Earnings & Deductions:** Difficulty auditing fuel burn, platform cuts, and arbitrary late-delivery penalties.
- **On-the-Job Physical Hazards:** Extreme fatigue, heatwave conditions, night-time safety risks, and road accidents.
- **Contractual Trap Clauses:** Platform partner agreements that reserve the right to deactivate accounts without notice or deny on-duty accident liability.
- **Language Barriers & Algorithmic Deactivations:** Sudden platform account blockings without human review, fair hearings, or legal recourse.

**Saarthi AI (सारथी)** bridges this gap by delivering an empathetic, accessible, real-time GenAI copilot built with **zero external AI package dependencies**, running directly on the **Vercel Edge Runtime** using native Web Streams and the **Gemini REST API**.

---

## 🌟 Six Core Functional Domains

| Domain | Capability | Key Features |
| :--- | :--- | :--- |
| **1. 💰 Earnings Tracking** | Net vs Gross Auditing | Smart regex parsing of payout SMS/text from Swiggy, Zomato, Uber, Ola, Zepto, Blinkit; true take-home calculation factoring fuel costs and platform cuts; flags penalties and sub-minimum wage rates. |
| **2. 🛡️ Safety Practices** | Road Hazard & Distress Protection | 1-Tap SOS broadcast with GPS coordinates and direct WhatsApp dispatch; continuous driving fatigue tracker with micro-sleep alert; simulated incoming emergency call for polite de-escalation; real-time climate hazard alerts. |
| **3. 🏛️ Rights & Welfare Schemes** | Benefits & Schemes Database | Simplified 5th-grade summaries of e-Shram Card (₹2L accident cover), Ayushman Bharat (₹5L health cover), PM-SYM Pension, and State Gig Worker Acts; interactive worker eligibility filter. |
| **4. 📄 Document Help & Simplifier** | Contract & Terms De-Jargoning | Clause-by-clause simplification of platform terms of service, accident insurance policies, and TDS 194-O tax notices; benchmarks original college reading level (Grade 14+) vs. 5th-grade plain language; flags critical deactivation and liability traps. |
| **5. 📝 Grievance & Dispute Drafting** | Algorithmic Appeal Wizard | Generates formal, legally grounded support tickets, statutory grievance notices, and WhatsApp escalation messages citing labor codes and fair gig principles for wrongful deactivations, unpaid wages, and false customer claims. |
| **6. 🎙️ Multilingual Accessibility** | Low-Literacy Inclusivity | Regional vernacular support across 9 languages (Hindi, English, Hinglish, Tamil, Telugu, Kannada, Bengali, Marathi, Spanish); native Web Speech API (STT voice typing & TTS audio playback); WCAG 2.1 AA compliant. |

---

## ⚡ Zero-Dependency & Edge Architecture

- **Zero External AI SDKs:** No third-party wrapper libraries (`ai`, `@ai-sdk/google`, etc.), eliminating npm peer dependency conflicts and heavy bundle overhead.
- **Native Web APIs Only:** Streaming responses via native `fetch`, standard `ReadableStream`, `TextEncoder`, and `TextDecoder` directly from Google Gemini REST API (`gemini-1.5-flash:streamGenerateContent`).
- **Vercel Edge Runtime:** Configured via `export const runtime = 'edge'` in `app/api/chat/route.ts` for zero cold starts.
- **Zero-Latency Fallback Engine:** If no external API key is configured, Saarthi AI seamlessly falls back to an internal edge domain knowledge engine with instant TTFT.

---

## 🔒 Security & Privacy Guardrails

1. **Zero-Retention PII Anonymization (`lib/pii.ts`)**:
   - Automatically sanitizes and tokenizes high-risk PII (names, 10-digit phone numbers, Aadhaar, PAN, vehicle registration numbers, bank account numbers, passwords/MPINs, credit card numbers, UPI IDs, and GPS coordinates) before hitting remote endpoints.
   - Deterministic surrogate tokens (e.g. `[PHONE_1]`, `[VEHICLE_1]`) ensure the worker's private data is never exposed.
2. **Multi-Vector Prompt Injection Defense**:
   - Sanitizes and neutralizes adversarial prompt injection payloads (e.g., `ignore all previous instructions`, jailbreak roleplays, and zero-width unicode exploits).
   - Encapsulates prompts in strict `<system_safety_instructions>` and `<user_untrusted_input>` delimiter tags.

---

## ♿ Accessibility & Inclusivity (WCAG 2.1 AA)

- **Outdoor High-Contrast Mode:** High-contrast amber/black theme designed for direct sunlight visibility on motorcycle phone mounts.
- **Generous Touch Targets:** All interactive buttons and inputs adhere to the minimum $\ge$48x48px touch target standard.
- **Screen Reader Navigation:** Semantic HTML landmark navigation (`<main>`, `<header>`, `<nav>`, `<article>`, `<section>`, `<footer>`), ARIA live regions, and descriptive labels.
- **Voice-First Interaction:** Web Speech API integration for speech recognition (STT) and text-to-speech read-aloud (TTS).
- **5th-Grade Reading Level:** Strictly avoids dense legal jargon, using bulleted summaries for fast mobile reading.

---

## 🏗️ Repository Structure

```
warmup/
├── app/
│   ├── api/chat/route.ts      # Vercel Edge streaming endpoint (Zero AI SDKs, native Gemini REST)
│   ├── globals.css            # Tailwind CSS & high-contrast outdoor theme
│   ├── layout.tsx             # Root layout with metadata & fonts
│   └── page.tsx               # Entry page rendering the copilot
├── components/
│   └── chat.tsx               # Interactive multi-domain UI with native Web Streams & Web Speech API
├── lib/
│   ├── pii.ts                 # Zero-retention PII anonymization & prompt injection shield
│   ├── earnings.ts            # SMS parser, net income calculation & deduction auditing
│   ├── safety.ts              # Safety protocols, fatigue evaluator & SOS generator
│   ├── welfare.ts             # Welfare schemes knowledge base & eligibility checker
│   ├── document.ts            # Document help, contract simplifier & clause risk classifier
│   └── dispute.ts             # Formal dispute & deactivation appeal letter templates
└── tests/
    └── saarthi.test.ts        # Automated unit and factuality test suite (Vitest - 15 tests)
```

---

## 🚀 Quickstart

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Clone & Install
```bash
git clone https://github.com/Vivekkumar161122/saarthi-ai.git
cd saarthi-ai
npm install
```

### 2. Configure Environment (Optional)
```bash
# Provide Gemini API Key for live AI model generation:
export GEMINI_API_KEY="your-gemini-api-key"
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

Saarthi AI includes a comprehensive Vitest test suite covering all core domains (41/41 tests passing):

```bash
✓ tests/saarthi.test.ts (41 tests)
  ✓ 1. PII Anonymization & Prompt Injection Defense (9)
    ✓ strips phone numbers, Aadhaar, vehicle numbers, and UPI IDs
    ✓ strips PAN, Driving License, Voter ID, and Bank Account numbers
    ✓ strips Passport numbers and IPv4 addresses
    ✓ strips credit cards and passwords/PINs
    ✓ neutralizes prompt injection payloads and jailbreak attempts
    ✓ neutralizes markdown image data exfiltration attempts
    ✓ neutralizes HTML and script tag injection attempts
    ✓ wraps payloads in explicit system untrusted input boundaries
    ✓ reconstitutes PII tokens back into plain text locally on client
  ✓ 2. Earnings & Expense Helper Engine (5)
    ✓ parses Swiggy SMS amounts, tips, and computes take-home after fuel
    ✓ identifies Zomato and cab ride-share platforms (Uber/Ola)
    ✓ handles Blinkit, Zepto, and Porter deliveries
    ✓ flags warning when net hourly rate falls below informal wage threshold
    ✓ flags alert when platform penalties exceed 15% of gross earnings
  ✓ 3. Safety Protocols & Fatigue Guardian (6)
    ✓ evaluates normal fatigue safely within 2 hours
    ✓ triggers elevated fatigue warning after 2 continuous hours
    ✓ triggers high risk fatigue warning after 3 continuous hours
    ✓ triggers dangerous fatigue warning after 4.5 continuous hours
    ✓ generates emergency SOS dispatch with Google Maps GPS link
    ✓ provides localized climate and road hazard advisories
  ✓ 4. Welfare & Rights Finder Factuality (4)
    ✓ correctly maps e-Shram benefits, age criteria, and helpline
    ✓ correctly maps Ayushman Bharat PM-JAY health protection
    ✓ filters out PM-SYM pension for workers over age 40 or earning > 15000
    ✓ protects workers under state platform gig worker welfare boards
  ✓ 5. Document Help & Contract Simplifier (5)
    ✓ identifies critical deactivation and liability risks in platform TOS
    ✓ extracts TDS 194-O refund rights for low income gig workers
    ✓ detects insurance active delivery restriction traps
    ✓ detects ride-share dynamic 35% commission surge clauses
    ✓ computes Flesch-Kincaid reading grade metric reliably
  ✓ 6. Dispute & Grievance Drafter (4)
    ✓ generates legally structured deactivation appeal with citations
    ✓ generates accident insurance claim notice with statutory citations
    ✓ generates false penalty contest letter with GPS telemetry grounds
    ✓ generates unpaid wages notice with payment timeline demand
  ✓ 7. Multilingual Accessibility & Inclusivity (1)
    ✓ provides all 9 regional languages with speech codes
  ✓ 8. Edge Rate Limiter & Semantic Cache (3)
    ✓ allows requests within window threshold
    ✓ stores and retrieves cached edge responses
    ✓ returns null for non-existent cache keys
  ✓ 9. Edge API Route Streaming (Zero External AI SDKs & Zod Validation) (4)
    ✓ returns native ReadableStream with text/plain charset=utf-8 for earnings query
    ✓ returns instant cached response with X-Cache-Status HIT on identical query
    ✓ rejects invalid payloads with status 400 via Zod schema
    ✓ streams safety advice when safety domain context is requested
```

---

## 📜 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.
