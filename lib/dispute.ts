/**
 * Dispute & Grievance Drafter for Gig Workers
 * Generates legally sound, professional dispute notices and support tickets
 */

export interface DisputeFormData {
  workerName: string;
  partnerId: string;
  platform: string;
  disputeType: 'deactivation' | 'unpaid_wages' | 'false_customer_claim' | 'accident_claim';
  incidentDate: string;
  orderOrTripId: string;
  amountDisputed: string;
  workerExplanation: string;
}

export interface GeneratedDispute {
  subject: string;
  supportTicketBody: string;
  formalLegalNotice: string;
  whatsappShortText: string;
  escalationOfficerEmail: string;
  laborHelpline: string;
  relevantRulesCited: string[];
}

export class DisputeHelper {
  public static generateDisputeLetter(data: DisputeFormData): GeneratedDispute {
    const platform = data.platform || 'Platform Partner Desk';
    const workerName = data.workerName || '[Partner Name]';
    const partnerId = data.partnerId || '[Partner ID]';
    const orderId = data.orderOrTripId || '[Order/Trip ID]';
    const date = data.incidentDate || new Date().toISOString().split('T')[0];
    const amount = data.amountDisputed ? `₹${data.amountDisputed}` : 'the withheld amount';

    let subject = '';
    let ticketBody = '';
    let legalNotice = '';
    let whatsappText = '';
    const rules: string[] = [];

    switch (data.disputeType) {
      case 'deactivation':
        subject = `URGENT APPEAL: Unfair Account Deactivation - Partner ID ${partnerId}`;
        rules.push('Principles of Natural Justice (Right to be heard before termination of livelihood)');
        rules.push('Section 2(s) of Industrial Disputes Act & State Gig Worker Welfare Directives');
        
        ticketBody = `Dear ${platform} Support Team,\n\nMy partner account (ID: ${partnerId}) was abruptly deactivated on ${date} without prior written notice or opportunity to clarify the situation.\n\nExplanation of incident:\n${data.workerExplanation}\n\nI have maintained a consistent completion rating and adhered to all safety guidelines. The sudden blocking of my account directly deprives me of my daily livelihood without due process.\n\nI request an immediate human review of this deactivation and prompt reinstatement of my partner privileges.\n\nSincerely,\n${workerName}\nPartner ID: ${partnerId}`;
        
        legalNotice = `FORMAL GRIEVANCE NOTICE\nTo: Grievance Officer, ${platform}\nFrom: ${workerName} (Partner ID: ${partnerId})\nDate: ${date}\nSubject: Request for Immediate Reinstatement & Hearing on Deactivation\n\nTake notice that the sudden deactivation of Partner ID ${partnerId} violates standard gig worker fair practice principles. I hereby demand:\n1. A clear written copy of the internal audit or customer log that prompted this deactivation.\n2. A 48-hour hearing with the platform Grievance Redressal Committee.\n3. Restoration of access pending review.\n\nFailing resolution within 7 business days, I reserve the right to escalate this grievance to the State Platform Gig Workers Welfare Board.\n\nSigned,\n${workerName}`;
        
        whatsappText = `Hello ${platform} Support, my partner ID is ${partnerId}. My account was deactivated on ${date} without fair hearing. Explanation: ${data.workerExplanation}. Please escalate this to the Senior Review Team for immediate reactivation.`;
        break;

      case 'unpaid_wages':
        subject = `GRIEVANCE: Withheld Earnings / Uncredited Incentives of ${amount} (Order ${orderId})`;
        rules.push('Payment of Wages Principles & Contractual Service Payout Schedules');
        rules.push('Platform Partner Service Agreement - Incentive Guarantee Terms');

        ticketBody = `Dear ${platform} Accounts Team,\n\nI am writing regarding unpaid earnings/incentives totaling ${amount} for shift/order ${orderId} completed on ${date}.\n\nDetails:\n${data.workerExplanation}\n\nAll tasks and service targets were completed in good faith. Kindly audit the ledger and credit ${amount} to my registered account within 48 hours.\n\nThank you,\n${workerName}\nPartner ID: ${partnerId}`;

        legalNotice = `FORMAL NOTICE OF UNPAID EARNINGS\nTo: Head of Finance & Partner Operations, ${platform}\nDate: ${date}\nSubject: Demand for Immediate Clearance of Withheld Payout (${amount})\n\nThis constitutes formal notice that ${amount} earned by ${workerName} (ID: ${partnerId}) on ${date} remains unpaid in violation of the platform payout terms.\n\nPlease provide immediate credit and an itemized payment receipt within 3 business days.\n\nSigned,\n${workerName}`;

        whatsappText = `Hi ${platform} Help, I am ${workerName} (ID: ${partnerId}). My payout of ${amount} for order ${orderId} on ${date} is missing. Please review and credit immediately.`;
        break;

      case 'false_customer_claim':
        subject = `DISPUTE: Fraudulent Customer Claim / Unjust Penalty - Order ${orderId}`;
        rules.push('Burden of Proof & Verification of GPS Geo-tag Telemetry');
        rules.push('Fair Work Foundation Standards for Algorithmic Disciplinary Actions');

        ticketBody = `Dear ${platform} Fraud & Risk Team,\n\nI contest the penalty/flag applied to my profile for order ${orderId} on ${date}.\n\nGrounds for Dispute:\n${data.workerExplanation}\n\nThe delivery was successfully executed at the verified GPS location timestamp. The customer claim is fraudulent and unfairly harms my rating and earnings. Please cross-reference my app GPS coordinates with the merchant dispatch log and revoke this penalty immediately.\n\nRegards,\n${workerName}\nPartner ID: ${partnerId}`;

        legalNotice = `APPEAL AGAINST FALSE PENALTY\nTo: Partner Dispute Tribunal, ${platform}\nOrder ID: ${orderId}\n\nEvidence Summary: GPS telemetry proves arrival at delivery waypoint. The customer false non-receipt claim was made after physical handoff. Imposition of penalty without telemetric verification constitutes arbitrary wage deduction.\n\nRequested Remedy: Complete waiver of penalty and restoration of rating.\n\n${workerName}`;

        whatsappText = `Hello ${platform} Risk Team, I dispute the penalty on order ${orderId}. GPS records confirm I completed delivery at the exact pin. Please reverse the penalty. Partner ID: ${partnerId}.`;
        break;

      case 'accident_claim':
        subject = `EMERGENCY CLAIM: On-Duty Accident Medical Assistance & Insurance - Partner ID ${partnerId}`;
        rules.push('Mandatory Group Personal Accident Insurance for Platform Partners');
        rules.push('Pradhan Mantri e-Shram Accident Benefit Directive');

        ticketBody = `Dear ${platform} Partner Insurance & Safety Desk,\n\nI am reporting an on-duty road incident that occurred on ${date} while fulfilling delivery/trip ${orderId}.\n\nIncident summary:\n${data.workerExplanation}\n\nPlease initiate the platform group accident insurance claim cover immediately and share the emergency cashless hospital network details and TPA claim number.\n\nWorker Name: ${workerName}\nPartner ID: ${partnerId}`;

        legalNotice = `FORMAL NOTIFICATION OF INJURY & INSURANCE CLAIM\nTo: Corporate Insurance Administrator & HR, ${platform}\nDate: ${date}\n\nTake notice of work-related injury sustained during official platform operating hours. Under policy obligations of Mandatory Group Personal Accident Insurance, please release immediate emergency hospitalization guarantee.\n\nClaimant: ${workerName}\nID: ${partnerId}`;

        whatsappText = `URGENT: ${platform} Safety Desk. I had an accident on duty today (${date}) during order ${orderId}. Please connect with me for emergency insurance hospital claim. Partner ID: ${partnerId}.`;
        break;
    }

    return {
      subject,
      supportTicketBody: ticketBody,
      formalLegalNotice: legalNotice,
      whatsappShortText: whatsappText,
      escalationOfficerEmail: `grievance-officer@${platform.toLowerCase().replace(/\s+/g, '')}.com`,
      laborHelpline: '1800-11-2526 / 155214',
      relevantRulesCited: rules
    };
  }
}
