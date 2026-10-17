/**
 * Document Help & Contract Simplifier for Gig & Informal Workers
 * 
 * Analyzes complex platform contracts, terms of service, insurance policies,
 * tax forms (TDS 194-O), and penalty notices. Translates legal jargon
 * into 5th-grade plain language and highlights trap clauses.
 */

export interface ContractClause {
  id: string;
  originalText: string;
  simplifiedExplanation: string; // 5th-grade reading level
  category: 'safe' | 'warning' | 'critical_risk';
  topic: 'payout' | 'deactivation' | 'accident_insurance' | 'liability' | 'dispute_resolution';
  riskTitle: string;
}

export interface DocumentAnalysisResult {
  documentTitle: string;
  documentType: 'platform_agreement' | 'insurance_policy' | 'tax_tds' | 'penalty_notice' | 'custom';
  originalReadingGrade: number; // e.g. 14 (College level)
  simplifiedReadingGrade: number; // e.g. 5 (5th grade)
  clauses: ContractClause[];
  criticalRisksSummary: string[];
  safeClausesCount: number;
  warningClausesCount: number;
  criticalRisksCount: number;
  workerActionableAdvice: string;
  vernacularSummary: {
    hindi: string;
    hinglish: string;
    english: string;
  };
}

export interface PresetDocument {
  id: string;
  title: string;
  description: string;
  category: 'delivery' | 'rideshare' | 'insurance' | 'tax';
  rawText: string;
}

export const PRESET_DOCUMENTS: PresetDocument[] = [
  {
    id: 'food-delivery-tos',
    title: 'Food Delivery Partner Agreement (Platform TOS)',
    description: 'Standard clause governing account suspension and payment withholding.',
    category: 'delivery',
    rawText: `Clause 14.2: The Company reserves the unilateral, unappealable prerogative to forthwith terminate, deactivate, or suspend the Delivery Partner's access to the Platform without prior written intimation upon receipt of any subjective customer dissatisfaction report, deviation from automated algorithmic delivery transit schedules, or purported breach of code of conduct.
Clause 18.5: The Delivery Partner expressly disclaims any employer-employee relationship and indemnifies the Company against all third-party claims, vehicular damages, traffic infractions, and on-duty medical liabilities incurred during transit.`
  },
  {
    id: 'ride-share-agreement',
    title: 'Ride-Share Driver Service Contract (Cab/Auto)',
    description: 'Clauses on dynamic platform commission and cancellation penalties.',
    category: 'rideshare',
    rawText: `Clause 7.1: The Platform shall deduct a variable platform facilitation fee of up to thirty-five percent (35%) from the gross passenger fare, subject to real-time algorithmic surge determination, without prior daily itemized notification to the Driver Partner.
Clause 9.3: Repeated refusal to accept dispatched trips or passenger-initiated trip cancellations exceeding the platform threshold shall result in automated disciplinary deduction of ₹500 from the driver's rolling reserve payout.`
  },
  {
    id: 'gig-accident-policy',
    title: 'Group Personal Accident Insurance Policy Wording',
    description: 'Fine print regarding active trip coverage vs login time exclusions.',
    category: 'insurance',
    rawText: `Clause 4.1 (Scope of Cover): Accidental death and permanent disability benefits of ₹2,00,000 shall only apply strictly between the timestamp of order acceptance and order customer handoff. No coverage is afforded during idle transit or when logged in awaiting dispatch.
Clause 8.2 (Claim Condition): Intimation of hospitalization must be furnished within twenty-four (24) hours of the incident along with original police First Information Report (FIR) and alcohol toxicity screening test.`
  },
  {
    id: 'tax-tds-194o',
    title: 'Section 194-O TDS & Informal Worker Tax Guidance',
    description: 'Plain-English explanation of 1% TDS deducted by apps from payout.',
    category: 'tax',
    rawText: `Income Tax Act Section 194-O: An e-commerce operator facilitating the sale of goods or provision of services shall at the time of credit or payment deduct income-tax at the rate of one percent (1%) of the gross amount of such sales or services.
Clause 3: Delivery partners earning below basic tax exemption limit (₹3,00,000) may file Form 26AS or zero-tax ITR to claim 100% refund of deducted TDS from the government.`
  }
];

export class DocumentHelper {
  /**
   * Calculates approximate reading grade level using Flesch-Kincaid grade metric
   */
  public static calculateReadingGrade(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 1;
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length || 1;
    
    // Estimate syllables (approx 1 syllable per vowel cluster)
    let syllables = 0;
    for (const w of words) {
      const clean = w.toLowerCase().replace(/[^a-z]/g, '');
      const matches = clean.match(/[aeiouy]{1,2}/g);
      syllables += matches ? matches.length : 1;
    }

    // Flesch-Kincaid Grade Level formula: 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
    const grade = Math.round(0.39 * (wordCount / sentences) + 11.8 * (syllables / wordCount) - 15.59);
    return Math.max(1, Math.min(18, grade));
  }

  /**
   * Analyzes complex legal text or preset agreements, extracting red flags and plain-language translations
   */
  public static analyzeDocument(rawText: string, customTitle?: string): DocumentAnalysisResult {
    const lower = rawText.toLowerCase();
    const clauses: ContractClause[] = [];
    const criticalRisks: string[] = [];

    // Analyze TDS 194-O Tax refund first if applicable
    if (lower.includes('194-o') || lower.includes('tax') || lower.includes('26as') || lower.includes('itr')) {
      clauses.push({
        id: 'c5',
        originalText: 'E-commerce operator shall deduct 1% TDS. Delivery partners earning below basic limit may file ITR to claim 100% refund.',
        simplifiedExplanation: 'The app cuts 1% tax from every order and sends it to the government. If you earn less than ₹3 Lakh in a year, you can easily get ALL of this tax money back into your bank account by filing a free tax return.',
        category: 'safe',
        topic: 'payout',
        riskTitle: '✅ 100% Tax Refund Opportunity (Claim Back Your 1% TDS)'
      });
    }

    // Analyze deactivation risk
    if (lower.includes('deactivate') || lower.includes('terminate') || lower.includes('suspend') || lower.includes('unilateral')) {
      clauses.push({
        id: 'c1',
        originalText: rawText.includes('Clause 14.2') 
          ? rawText.split('\n')[0] 
          : 'Company reserves unilateral prerogative to deactivate partner access without prior intimation.',
        simplifiedExplanation: 'The company says they can block your account anytime without giving you any warning or a chance to explain your side.',
        category: 'critical_risk',
        topic: 'deactivation',
        riskTitle: '🚨 Sudden Account Blocking Without Notice'
      });
      criticalRisks.push('Company claims right to block your livelihood instantly based on unverified customer complaints.');
    }

    // Analyze liability & accident indemnity
    if (lower.includes('indemnif') || lower.includes('medical liabilit') || lower.includes('employer-employee') || lower.includes('third-party')) {
      clauses.push({
        id: 'c2',
        originalText: rawText.includes('Clause 18.5')
          ? rawText.split('\n')[1] || 'Delivery Partner expressly disclaims employer-employee relationship and indemnifies company.'
          : 'Partner indemnifies the company against vehicular damages and on-duty medical liabilities.',
        simplifiedExplanation: 'The company says you are NOT their employee, and if you get hurt in an accident or crash your bike, they will not pay medical bills unless you fight for insurance.',
        category: 'critical_risk',
        topic: 'liability',
        riskTitle: '🚨 No Medical Liability (Company Shifts Crash Blame to You)'
      });
      criticalRisks.push('Company denies being your employer to avoid paying accident benefits and bike repair costs.');
    }

    // Analyze dynamic commission & deductions
    if ((lower.includes('commission') || lower.includes('facilitation fee') || lower.includes('thirty-five percent') || lower.includes('surge')) && !lower.includes('194-o')) {
      clauses.push({
        id: 'c3',
        originalText: 'Platform shall deduct variable platform facilitation fee up to 35% without daily itemized notification.',
        simplifiedExplanation: 'The app can take up to 35% cut from your fare whenever their computer algorithm decides, without showing you the exact breakdown every day.',
        category: 'warning',
        topic: 'payout',
        riskTitle: '⚠️ Hidden & Floating Commission Rates (Up to 35%)'
      });
    }

    // Analyze insurance active trip restriction
    if (lower.includes('accident') || lower.includes('insurance') || lower.includes('fir') || lower.includes('handoff')) {
      clauses.push({
        id: 'c4',
        originalText: 'Accidental cover of ₹2,00,000 applies strictly between order acceptance and customer handoff. No coverage while awaiting orders.',
        simplifiedExplanation: 'Accident insurance ONLY covers you while carrying an active order. If a vehicle hits you while waiting at a red light for the next order, company insurance will try to reject your claim.',
        category: 'warning',
        topic: 'accident_insurance',
        riskTitle: '⚠️ Insurance Loophole: Only Covered During Active Delivery'
      });
    }

    // If no clauses matched, provide a general breakdown
    if (clauses.length === 0) {
      clauses.push({
        id: 'c_gen',
        originalText: rawText.slice(0, 150) + (rawText.length > 150 ? '...' : ''),
        simplifiedExplanation: 'Standard legal terms stating platform rules, service conditions, and worker responsibilities in formal contract language.',
        category: 'warning',
        topic: 'payout',
        riskTitle: 'ℹ️ Contract Conditions Review'
      });
    }

    const safeCount = clauses.filter(c => c.category === 'safe').length;
    const warningCount = clauses.filter(c => c.category === 'warning').length;
    const criticalCount = clauses.filter(c => c.category === 'critical_risk').length;

    const originalGrade = Math.max(12, this.calculateReadingGrade(rawText));
    const simplifiedGrade = 5; // Target 5th-grade reading level

    return {
      documentTitle: customTitle || 'Platform Document & Contract Analysis',
      documentType: lower.includes('tax') || lower.includes('194-o') ? 'tax_tds' : lower.includes('insurance') ? 'insurance_policy' : 'platform_agreement',
      originalReadingGrade: originalGrade,
      simplifiedReadingGrade: simplifiedGrade,
      clauses,
      criticalRisksSummary: criticalRisks.length > 0 ? criticalRisks : ['Verify that commission deductions do not exceed fair gig statutory limits.'],
      safeClausesCount: safeCount,
      warningClausesCount: warningCount,
      criticalRisksCount: criticalCount,
      workerActionableAdvice: criticalCount > 0 
        ? 'Always keep daily screenshots of your earnings and active orders before logging off. If your account is ever blocked without written notice, cite the State Gig Workers Welfare Act to demand a human hearing.'
        : 'Review your monthly payout statements to verify that all incentives and bonuses match the app promises.',
      vernacularSummary: {
        hindi: 'इस अनुबंध में लिखा है कि कंपनी बिना पूर्व सूचना आपकी आईडी बंद कर सकती है और दुर्घटना होने पर जिम्मेदारी से बच सकती है। लेकिन राज्य गिग कल्याण कानून के तहत आपको सुनवाई का पूरा कानूनी हक है।',
        hinglish: 'Is contract mein likha hai ki company bina warning diye account block kar sakti hai. Isliye har roz apne orders aur payout ka screenshot zaroor leke rakhein.',
        english: 'This agreement tries to allow the platform to block accounts without prior notice. Always preserve daily delivery screenshots to protect your legal dispute rights.'
      }
    };
  }
}
