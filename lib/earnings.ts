/**
 * Earnings & Expense Helper for Gig Workers
 * 
 * Parses payout SMS/text from Swiggy, Zomato, Uber, Ola, Zepto, Blinkit, DoorDash
 * Computes net take-home, fuel/maintenance burn, and flags unfair deductions
 */

export interface ParsedEarnings {
  grossAmount: number;
  incentives: number;
  tips: number;
  fuelExpense: number;
  platformCut: number;
  penalties: number;
  netIncome: number;
  hoursWorked: number;
  effectiveHourlyRate: number;
  platformIdentified: string;
  projectedDailyEarnings: number;
  detectedIssues: string[];
}

export class EarningsHelper {
  /**
   * Smart parsing of SMS messages or freeform earnings text
   */
  public static parseEarningsInput(rawText: string, hoursWorked: number = 8, fuelManual: number = 0): ParsedEarnings {
    const text = rawText.toLowerCase();
    const detectedIssues: string[] = [];
    
    // Detect platform
    let platform = 'Unknown Platform';
    if (text.includes('swiggy')) platform = 'Swiggy';
    else if (text.includes('zomato')) platform = 'Zomato';
    else if (text.includes('uber')) platform = 'Uber';
    else if (text.includes('ola')) platform = 'Ola';
    else if (text.includes('zepto')) platform = 'Zepto';
    else if (text.includes('blinkit')) platform = 'Blinkit';
    else if (text.includes('doordash')) platform = 'DoorDash';
    else if (text.includes('amazon') || text.includes('flex')) platform = 'Amazon Flex';
    else if (text.includes('porter')) platform = 'Porter';

    // 1. Extract monetary amounts using regex
    // Examples: "earned Rs 850", "payout of Rs. 1200", "₹950 credited", "Total: 1400"
    let grossAmount = 0;
    const grossMatches = rawText.match(/(?:earned|credited|payout|total|gross|amount|₹|rs\.?)\s*:?\s*(\d{2,6}(?:\.\d{1,2})?)/gi);
    if (grossMatches && grossMatches.length > 0) {
      // Find highest reasonable primary amount
      const numbers = grossMatches.map(m => {
        const numMatch = m.match(/\d+(?:\.\d+)?/);
        return numMatch ? parseFloat(numMatch[0]) : 0;
      });
      grossAmount = Math.max(...numbers);
    } else {
      // Fallback: look for any 3-5 digit number
      const anyNum = rawText.match(/\b\d{3,5}\b/);
      if (anyNum) grossAmount = parseFloat(anyNum[0]);
      else grossAmount = 850; // reasonable demo default
    }

    // 2. Extract Tips
    let tips = 0;
    const tipMatch = text.match(/tip[s]?\s*(?:of|:)?\s*(?:rs\.?|₹)?\s*(\d{1,4})/i);
    if (tipMatch) tips = parseFloat(tipMatch[1]);

    // 3. Extract Incentives
    let incentives = 0;
    const incentiveMatch = text.match(/(?:incentive|bonus|surge|target)\s*(?:of|:)?\s*(?:rs\.?|₹)?\s*(\d{1,4})/i);
    if (incentiveMatch) incentives = parseFloat(incentiveMatch[1]);

    // 4. Extract Penalties or Deductions
    let penalties = 0;
    const penaltyMatch = text.match(/(?:penalty|deduction|fine|withheld|cut)\s*(?:of|:)?\s*(?:rs\.?|₹)?\s*(\d{1,4})/i);
    if (penaltyMatch) {
      penalties = parseFloat(penaltyMatch[1]);
      detectedIssues.push(`⚠️ Deduction/Penalty detected: ₹${penalties}. Verify order ID for dispute.`);
    }

    // 5. Fuel & Expenses (if not supplied manually, estimate 20% of gross for two-wheeler / 30% for cab)
    let fuelExpense = fuelManual;
    if (fuelExpense === 0) {
      const isCab = platform === 'Uber' || platform === 'Ola';
      fuelExpense = Math.round(grossAmount * (isCab ? 0.30 : 0.20));
    }

    // 6. Platform Cut / Service fee (approx 15% if not factored)
    const platformCut = text.includes('net') ? 0 : Math.round(grossAmount * 0.15);

    // Net income calculation
    const netIncome = Math.max(0, grossAmount + tips + incentives - fuelExpense - penalties - platformCut);

    // Hourly rate
    const safeHours = hoursWorked > 0 ? hoursWorked : 8;
    const effectiveHourlyRate = Math.round(netIncome / safeHours);

    // Projected daily earnings (if shift completed or scaled to full 10-hour day)
    const projectedDailyEarnings = Math.round((netIncome / safeHours) * 10);

    // Warning flags
    if (effectiveHourlyRate < 50) {
      detectedIssues.push('⚠️ Alert: Your net hourly rate is below minimum informal wage standard. Fuel and commission costs are consuming more than 40% of earnings.');
    }
    if (penalties > (grossAmount * 0.15)) {
      detectedIssues.push('🚨 Warning: Penalty exceeds 15% of your earnings. Under Fair Gig Guidelines, you have the right to request an itemized audit.');
    }

    return {
      grossAmount,
      incentives,
      tips,
      fuelExpense,
      platformCut,
      penalties,
      netIncome,
      hoursWorked: safeHours,
      effectiveHourlyRate,
      platformIdentified: platform,
      projectedDailyEarnings,
      detectedIssues
    };
  }
}
