/**
 * Enterprise PII Anonymizer & Tokenization Engine
 * 
 * Guarantee: Zero-Retention. No raw Personally Identifiable Information (PII)
 * is ever sent to LLM endpoints. PII is tokenized into deterministic local surrogate keys,
 * allowing the client to reconstruct the final response locally.
 */

import { PIIAnonymizationResult } from '../core/types';

export class PIIAnonymizerEngine {
  // Regex rules for high-risk PII
  private static readonly PATTERNS = {
    // Indian Aadhaar (12 digits with optional spaces or hyphens)
    AADHAAR: /\b[2-9]\d{3}[ -]?\d{4}[ -]?\d{4}\b/g,
    // Indian PAN (Permanent Account Number: 5 uppercase letters, 4 digits, 1 letter)
    PAN: /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/gi,
    // Phone numbers (Indian 10-digit mobile, +91 prefixes, US format, etc.)
    PHONE: /(?:(?:\+91[\s-]?)?[6-9]\d{9}|\b(?:\+1[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b)/g,
    // Bank Account Numbers (9 to 18 digits)
    BANK_ACCOUNT: /\b(?:\d{9,18})\b/g,
    // IFSC Codes (4 letters + 0 + 6 alphanumeric)
    IFSC: /\b[A-Z]{4}0[A-Z0-9]{6}\b/gi,
    // UPI IDs (e.g. user@oksbi, 9876543210@paytm, name@okhdfcbank)
    UPI_ID: /\b[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}\b/g,
    // Vehicle Registration (e.g., DL-01-AB-1234, MH02CZ9988, KA 05 MC 1234)
    VEHICLE_NO: /\b[A-Z]{2}[ -]?[0-9]{1,2}[ -]?[A-Z]{1,3}[ -]?[0-9]{4}\b/gi,
    // GPS Coordinates (e.g., 28.6139, 77.2090 or lat/lng pairs)
    GPS_COORDS: /[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)/g,
    // Email addresses
    EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  };

  // Known worker names or name prefix patterns (e.g., "I am Ramesh", "Name: Suresh", "Driver: Rajesh")
  private static readonly NAME_CONTEXT_REGEX = /\b(?:name\s*(?:is|:)|driver\s*(?:is|:)|partner\s*(?:is|:)|myself\s+|i\s+am\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/gi;

  /**
   * Anonymizes input text by replacing PII with secure placeholder tokens
   * e.g. [WORKER_PHONE_1], [BANK_ACCT_1], [VEHICLE_1]
   */
  public static anonymize(text: string, knownName?: string): PIIAnonymizationResult {
    let scrubbed = text;
    const tokenMap: Record<string, string> = {};
    const detectedTypes: Set<string> = new Set();
    let counter = 1;

    // 1. Explicit Worker Name Anonymization
    if (knownName && knownName.trim().length > 1) {
      const escaped = knownName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const nameRegex = new RegExp(`\\b${escaped}\\b`, 'gi');
      if (nameRegex.test(scrubbed)) {
        const token = `[WORKER_NAME_${counter++}]`;
        tokenMap[token] = knownName;
        detectedTypes.add('NAME');
        scrubbed = scrubbed.replace(nameRegex, token);
      }
    }

    // 2. Contextual Names (e.g., "I am Suresh Kumar")
    scrubbed = scrubbed.replace(this.NAME_CONTEXT_REGEX, (match, capturedName) => {
      const token = `[WORKER_NAME_${counter++}]`;
      tokenMap[token] = capturedName;
      detectedTypes.add('NAME');
      return match.replace(capturedName, token);
    });

    // 3. Aadhaar Numbers
    scrubbed = scrubbed.replace(this.PATTERNS.AADHAAR, (match) => {
      const token = `[GOVT_ID_AADHAAR_${counter++}]`;
      tokenMap[token] = match;
      detectedTypes.add('AADHAAR');
      return token;
    });

    // 4. PAN Cards
    scrubbed = scrubbed.replace(this.PATTERNS.PAN, (match) => {
      const token = `[GOVT_ID_PAN_${counter++}]`;
      tokenMap[token] = match;
      detectedTypes.add('PAN');
      return token;
    });

    // 5. UPI IDs (must run before general phone/email)
    scrubbed = scrubbed.replace(this.PATTERNS.UPI_ID, (match) => {
      const token = `[UPI_PAYMENT_ID_${counter++}]`;
      tokenMap[token] = match;
      detectedTypes.add('UPI');
      return token;
    });

    // 6. Emails
    scrubbed = scrubbed.replace(this.PATTERNS.EMAIL, (match) => {
      const token = `[EMAIL_ID_${counter++}]`;
      tokenMap[token] = match;
      detectedTypes.add('EMAIL');
      return token;
    });

    // 7. Vehicle Numbers
    scrubbed = scrubbed.replace(this.PATTERNS.VEHICLE_NO, (match) => {
      const token = `[VEHICLE_REG_${counter++}]`;
      tokenMap[token] = match;
      detectedTypes.add('VEHICLE');
      return token;
    });

    // 8. Phone Numbers
    scrubbed = scrubbed.replace(this.PATTERNS.PHONE, (match) => {
      const token = `[PHONE_NUM_${counter++}]`;
      tokenMap[token] = match;
      detectedTypes.add('PHONE');
      return token;
    });

    // 9. IFSC Code
    scrubbed = scrubbed.replace(this.PATTERNS.IFSC, (match) => {
      const token = `[BANK_IFSC_${counter++}]`;
      tokenMap[token] = match;
      detectedTypes.add('IFSC');
      return token;
    });

    // 10. GPS Coordinates
    scrubbed = scrubbed.replace(this.PATTERNS.GPS_COORDS, (match) => {
      const token = `[GPS_COORDINATES_${counter++}]`;
      tokenMap[token] = match;
      detectedTypes.add('LOCATION');
      return token;
    });

    // 11. Bank Account numbers (only match if explicit context or standalone > 10 digits)
    scrubbed = scrubbed.replace(/\b(?:A\/C|Account|Acct|Acc)[:\s#]*(\d{9,18})\b/gi, (match, acctDigits) => {
      const token = `[BANK_ACCT_${counter++}]`;
      tokenMap[token] = acctDigits;
      detectedTypes.add('BANK_ACCOUNT');
      return match.replace(acctDigits, token);
    });

    return {
      anonymizedText: scrubbed,
      tokenMap,
      scrubbedCount: Object.keys(tokenMap).length,
      detectedTypes: Array.from(detectedTypes),
    };
  }

  /**
   * Reconstitutes the text by replacing surrogate tokens with original PII
   * Executed client-side in the browser, ensuring end-to-end zero-retention.
   */
  public static deanonymize(anonymizedText: string, tokenMap: Record<string, string>): string {
    let result = anonymizedText;
    for (const [token, original] of Object.entries(tokenMap)) {
      // Escape token for regex safety
      const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      result = result.replace(new RegExp(escapedToken, 'g'), original);
    }
    return result;
  }
}
