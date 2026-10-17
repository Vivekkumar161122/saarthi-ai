/**
 * Welfare & Rights Knowledge Base for Gig & Informal Workers
 * Verified against official schemes (e-Shram, PM-JAY, PM-SYM, Gig Workers Acts)
 */

export interface SchemeInfo {
  id: string;
  name: string;
  nameHindi: string;
  category: 'health' | 'pension' | 'accident' | 'legal_rights';
  benefitAmount: string;
  eligibleCriteria: string;
  requiredDocuments: string[];
  simpleSummary: string; // 5th-grade plain language
  applyUrl: string;
  helpline: string;
}

export const WELFARE_SCHEMES: SchemeInfo[] = [
  {
    id: 'e-shram',
    name: 'e-Shram Card (National Database of Unorganized Workers)',
    nameHindi: 'ई-श्रम कार्ड (असंगठित कर्मकार पंजीकरण)',
    category: 'accident',
    benefitAmount: '₹2,00,000 accidental death cover + ₹1,00,000 permanent disability',
    eligibleCriteria: 'Age 16–59 years, working as delivery partner, driver, maid, or daily earner, not covered by EPFO/ESIC.',
    requiredDocuments: ['Aadhaar Card', 'Active Mobile linked to Aadhaar', 'Bank Account (Savings)'],
    simpleSummary: 'A free government card for delivery partners and drivers. If you have an accident on duty, your family gets up to ₹2 Lakh help. It also unlocks emergency cash transfers during lockdowns or floods.',
    applyUrl: 'https://eshram.gov.in',
    helpline: '14434 (Toll-Free)'
  },
  {
    id: 'pm-jay',
    name: 'Ayushman Bharat (PM-JAY Health Protection)',
    nameHindi: 'आयुष्मान भारत (मुफ्त इलाज योजना)',
    category: 'health',
    benefitAmount: 'Up to ₹5,00,000 per family per year for cashless hospital treatment',
    eligibleCriteria: 'Low-income informal workers and families listed in SECC or state food security database.',
    requiredDocuments: ['Ration Card / Food Security Card', 'Aadhaar Card', 'Family Member Details'],
    simpleSummary: 'Free hospital card giving your whole family up to ₹5 Lakh free medical care each year in government and top private hospitals for surgeries, ICU, and emergencies.',
    applyUrl: 'https://mera.pmjay.gov.in',
    helpline: '14555'
  },
  {
    id: 'pm-sym',
    name: 'Pradhan Mantri Shram Yogi Maan-dhan (PM-SYM Pension)',
    nameHindi: 'पीएम श्रम योगी मानधन (मासिक पेंशन)',
    category: 'pension',
    benefitAmount: 'Guaranteed ₹3,000 monthly pension after age 60',
    eligibleCriteria: 'Age 18–40 years, monthly income below ₹15,000, not in regular salaried job with PF.',
    requiredDocuments: ['Aadhaar Card', 'Savings Bank Passbook / Jan Dhan Account', 'Mobile Number'],
    simpleSummary: 'Save ₹55 to ₹200 every month (government adds an equal amount). Once you turn 60, you receive ₹3,000 cash in your bank every month for life.',
    applyUrl: 'https://maandhan.in',
    helpline: '1800-267-6888'
  },
  {
    id: 'gig-welfare-board',
    name: 'Platform Gig Workers Welfare Act & Fee Protection',
    nameHindi: 'गिग वर्कर्स वेलफेयर बोर्ड व सुरक्षा कानून',
    category: 'legal_rights',
    benefitAmount: 'State welfare fund from 1-2% fee on every ride/delivery; dispute resolution tribunal',
    eligibleCriteria: 'Any registered partner working for Swiggy, Zomato, Uber, Ola, Zepto, Blinkit, etc.',
    requiredDocuments: ['Platform Partner ID', 'Last 30 Days Payout Statement', 'Aadhaar Card'],
    simpleSummary: 'Law protecting gig workers against sudden unfair account blockings and wage theft. Companies must give written reasons before deactivating your ID and contribute to your welfare cess.',
    applyUrl: 'https://labour.gov.in',
    helpline: '155214'
  }
];

export function findSchemesForWorker(age: number, monthlyIncome: number, workType: string): SchemeInfo[] {
  return WELFARE_SCHEMES.filter(scheme => {
    if (scheme.id === 'pm-sym' && (age < 18 || age > 40 || monthlyIncome > 15000)) {
      return false;
    }
    if (scheme.id === 'e-shram' && (age < 16 || age > 59)) {
      return false;
    }
    return true;
  });
}
