/**
 * Core Domain Types for Saarthi AI
 * The Gig & Informal Worker AI Copilot
 */

export type SupportedLanguage = 
  | 'hi' // Hindi (हिन्दी)
  | 'en' // English
  | 'hinglish' // Hinglish (Hindi in Latin script)
  | 'ta' // Tamil (தமிழ்)
  | 'te' // Telugu (తెలుగు)
  | 'kn' // Kannada (ಕನ್ನಡ)
  | 'bn' // Bengali (বাংলা)
  | 'mr' // Marathi (मराठी)
  | 'es'; // Spanish (Español)

export interface LanguageMeta {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  speechCode: string;
  flag: string;
  sampleGreeting: string;
}

export type PlatformType = 
  | 'swiggy' 
  | 'zomato' 
  | 'uber' 
  | 'ola' 
  | 'zepto' 
  | 'blinkit' 
  | 'dunzo' 
  | 'amazon_flex' 
  | 'urban_company' 
  | 'porter'
  | 'other';

export type WorkerCategory = 
  | 'delivery_bike' 
  | 'ride_share_cab' 
  | 'ride_share_auto' 
  | 'home_services' 
  | 'daily_wage_labor' 
  | 'courier';

export interface EarningsEntry {
  id: string;
  date: string;
  platform: PlatformType;
  grossAmount: number;
  incentives: number;
  tips: number;
  deductions: {
    platformCommission: number;
    penalties: number;
    fuelCost: number;
    vehicleMaintenance: number;
    miscDeduction: number;
    notes?: string;
  };
  netEarnings: number;
  hoursWorked: number;
  tripsCount: number;
  source: 'sms' | 'screenshot' | 'manual';
  rawText?: string;
  flaggedIssues: string[];
}

export interface FatigueState {
  continuousMinutesOnline: number;
  totalShiftHoursToday: number;
  lastRestBreakTimestamp: number;
  hydrationRemindersPending: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  recommendation: string;
}

export interface WelfareScheme {
  id: string;
  name: string;
  nativeName: string;
  ministryOrAuthority: string;
  targetCategory: string[];
  maxIncomeEligibleMonthly?: number;
  minAge: number;
  maxAge: number;
  keyBenefits: string[];
  payoutAmountText: string;
  requiredDocuments: string[];
  applicationPortalUrl: string;
  simpleExplanation: string; // 5th grade reading level
  helpline: string;
}

export interface DisputeRequest {
  id: string;
  workerName: string;
  maskedWorkerToken: string;
  platform: PlatformType;
  disputeType: 
    | 'unfair_deactivation' 
    | 'withheld_pay_or_tips' 
    | 'unjust_penalty' 
    | 'accident_insurance_claim' 
    | 'customer_false_report' 
    | 'fuel_reimbursement_dispute';
  incidentDate: string;
  amountInDispute?: number;
  orderOrTripIds?: string[];
  workerStatement: string;
  attachedEvidenceDescriptions: string[];
  urgency: 'routine' | 'urgent' | 'critical';
  language: SupportedLanguage;
}

export interface GeneratedGrievance {
  disputeId: string;
  subject: string;
  formalLetterBody: string;
  shortSupportTicket: string;
  whatsappNoticeText: string;
  applicableLawCitations: string[];
  escalationContacts: {
    department: string;
    emailOrForm: string;
    appGrievanceNode: string;
  };
  recommendedNextSteps: string[];
  generatedAt: string;
}

export interface LegalDocumentSummary {
  documentTitle: string;
  documentType: 'platform_agreement' | 'insurance_policy' | 'tax_tds' | 'penalty_notice';
  originalClauseCount: number;
  readingGradeLevelOriginal: number; // e.g. 14 (College level)
  readingGradeLevelSummary: number; // 5 (5th grade)
  safeClauses: string[];
  warningClauses: string[];
  criticalRisks: string[];
  actionableAdvice: string;
}

export interface PIIAnonymizationResult {
  anonymizedText: string;
  tokenMap: Record<string, string>; // e.g. '[NAME_1]' => 'Ramesh Kumar'
  scrubbedCount: number;
  detectedTypes: string[];
}

export interface PromptInjectionCheckResult {
  isSafe: boolean;
  threatLevel: 'NONE' | 'LOW' | 'HIGH' | 'BLOCKED';
  reasons: string[];
  sanitizedText: string;
}

export interface SemanticCacheEntry<T = unknown> {
  queryHash: string;
  normalizedQuery: string;
  result: T;
  timestamp: number;
  hitCount: number;
  modelTier: 'TIER_1_LOCAL' | 'TIER_2_BALANCED' | 'TIER_3_REASONING';
}
