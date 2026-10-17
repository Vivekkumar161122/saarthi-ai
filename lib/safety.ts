/**
 * Safety & Emergency Guidance for Gig & Informal Workers
 */

export interface FatigueScoreResult {
  continuousHours: number;
  totalShiftHours: number;
  fatigueLevel: 'NORMAL' | 'ELEVATED' | 'HIGH_RISK' | 'DANGEROUS';
  alertMessage: string;
  recommendedRestMinutes: number;
}

export interface LocalizedHazard {
  id: string;
  type: 'weather' | 'traffic' | 'curfew' | 'heatwave';
  title: string;
  advice: string;
  severity: 'info' | 'warning' | 'urgent';
}

export class SafetyGuardian {
  /**
   * Calculates fatigue risk score based on driving/shift duration
   */
  public static evaluateFatigue(continuousHours: number, totalShiftHours: number): FatigueScoreResult {
    if (continuousHours >= 4.5 || totalShiftHours >= 12) {
      return {
        continuousHours,
        totalShiftHours,
        fatigueLevel: 'DANGEROUS',
        alertMessage: '⚠️ CRITICAL FATIGUE: You have been online for over 4.5 continuous hours. Micro-sleep risk is very high. Please pull over at a safe spot, drink water, and rest for 30 minutes.',
        recommendedRestMinutes: 30
      };
    }

    if (continuousHours >= 3 || totalShiftHours >= 9) {
      return {
        continuousHours,
        totalShiftHours,
        fatigueLevel: 'HIGH_RISK',
        alertMessage: '⚠️ High Fatigue Detected. Reaction times drop by 40% after 3 hours of continuous city driving. Take a 15-minute break and stretch.',
        recommendedRestMinutes: 15
      };
    }

    if (continuousHours >= 2) {
      return {
        continuousHours,
        totalShiftHours,
        fatigueLevel: 'ELEVATED',
        alertMessage: '💡 Mild Fatigue: Drink a bottle of water, wash your face, and check tire pressure.',
        recommendedRestMinutes: 10
      };
    }

    return {
      continuousHours,
      totalShiftHours,
      fatigueLevel: 'NORMAL',
      alertMessage: '✅ Shift status is safe. Helmet buckled and headlamp clear. Drive safely!',
      recommendedRestMinutes: 0
    };
  }

  /**
   * Builds an instant SOS message with GPS coordinates for emergency contacts / WhatsApp
   */
  public static generateEmergencySOSMessage(workerName: string, lat?: number, lng?: number): string {
    const coordsStr = lat && lng 
      ? `https://maps.google.com/?q=${lat.toFixed(5)},${lng.toFixed(5)}` 
      : 'Location sharing enabled on phone';
    
    return `🚨 EMERGENCY SOS! I am ${workerName || 'on duty'}. I am in an unsafe situation and need immediate help. My current GPS location: ${coordsStr}. Please contact platform emergency desk or 112 immediately.`;
  }

  /**
   * Returns current active road & climate hazards
   */
  public static getLocalizedHazards(): LocalizedHazard[] {
    return [
      {
        id: 'h1',
        type: 'heatwave',
        title: 'Extreme Heat & Hydration Alert (12 PM - 3 PM)',
        advice: 'Avoid sitting on hot motorcycle seats in direct sun. Carry 1L ORS water. Resting in designated platform partner hubs is your legal right.',
        severity: 'warning'
      },
      {
        id: 'h2',
        type: 'weather',
        title: 'Flash Waterlogging & Low-Lying Underpasses',
        advice: 'Do not ride through water deeper than exhaust pipe. Cancel or pause order if bridge is overflowing — platform penalization protection applies.',
        severity: 'urgent'
      },
      {
        id: 'h3',
        type: 'traffic',
        title: 'Late Night Delivery Safety Protocol',
        advice: 'If customer location has no streetlights, request customer to meet at building gate. Keep app SOS button on standby.',
        severity: 'info'
      }
    ];
  }
}
