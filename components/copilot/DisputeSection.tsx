'use client';

import React, { useState } from 'react';
import { FileText, Sparkles, Copy, Check, Volume2, Scale, ExternalLink } from 'lucide-react';
import { DisputeHelper, GeneratedDispute } from '../../lib/dispute';

interface DisputeSectionProps {
  workerName: string;
  onTriggerGenAI: (prompt: string, domain: string) => void;
  onSpeakText: (text: string) => void;
}

export function DisputeSection({ workerName, onTriggerGenAI, onSpeakText }: DisputeSectionProps) {
  const [disputeType, setDisputeType] = useState<
    'deactivation' | 'unpaid_wages' | 'false_customer_claim' | 'accident_claim'
  >('deactivation');
  const [disputePlatform, setDisputePlatform] = useState('Zomato');
  const [disputeOrderId, setDisputeOrderId] = useState('ORD-88412');
  const [disputeStatement, setDisputeStatement] = useState(
    'My ID was blocked because customer claimed food was never delivered. But I reached the GPS pin, clicked delivery photo, and customer took the packet from my hands.'
  );
  const [generatedDispute, setGeneratedDispute] = useState<GeneratedDispute | null>(() =>
    DisputeHelper.generateDisputeLetter({
      workerName: workerName || 'Vivek Kumar',
      partnerId: 'GIG-9941',
      platform: 'Zomato',
      disputeType: 'deactivation',
      incidentDate: new Date().toISOString().split('T')[0],
      orderOrTripId: 'ORD-88412',
      amountDisputed: '650',
      workerExplanation:
        'My ID was blocked because customer claimed food was never delivered. But I reached the GPS pin, clicked delivery photo, and customer took the packet from my hands.'
    })
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateDispute = () => {
    const res = DisputeHelper.generateDisputeLetter({
      workerName: workerName || 'Partner',
      partnerId: 'GIG-9941',
      platform: disputePlatform,
      disputeType,
      incidentDate: new Date().toISOString().split('T')[0],
      orderOrTripId: disputeOrderId,
      amountDisputed: '650',
      workerExplanation: disputeStatement
    });
    setGeneratedDispute(res);
  };

  const askGenAICustomDispute = () => {
    const prompt = `Please draft a formal dispute ticket and legal appeal letter for me as a gig worker:\nPlatform: ${disputePlatform}\nIssue: ${disputeType.replace(
      /_/g,
      ' '
    )}\nOrder ID: ${disputeOrderId}\nIncident Explanation: "${disputeStatement}"\nCite fair gig worker natural justice principles, Section 2(s) of Industrial Disputes Act, and demand an urgent 48-hour human review in simple but firm language.`;
    onTriggerGenAI(prompt, 'dispute');
  };

  return (
    <div
      role="tabpanel"
      id="panel-dispute"
      aria-labelledby="tab-dispute"
      className="space-y-4"
    >
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
            <FileText className="w-5 h-5 text-blue-600" />
            5. Dispute & Unfair Deactivation Drafter
          </h2>
          <button
            onClick={() =>
              onSpeakText(
                'Generate formal legal support tickets and grievance notices citing fair work principles and state labor directives.'
              )
            }
            className="touch-target p-1.5 text-slate-400 hover:text-blue-600 rounded"
            aria-label="Listen to dispute drafter introduction"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Platforms frequently deactivate worker IDs automatically via computer algorithms. This tool generates formal legal-backed appeal letters to trigger an immediate human hearing.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Platform:</label>
            <select
              value={disputePlatform}
              onChange={(e) => setDisputePlatform(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-xl bg-white"
            >
              <option value="Swiggy">Swiggy</option>
              <option value="Zomato">Zomato</option>
              <option value="Uber">Uber</option>
              <option value="Ola">Ola</option>
              <option value="Zepto">Zepto</option>
              <option value="Blinkit">Blinkit</option>
              <option value="DoorDash">DoorDash</option>
              <option value="Porter">Porter</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Dispute Type:</label>
            <select
              value={disputeType}
              onChange={(e) => setDisputeType(e.target.value as any)}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-xl bg-white"
            >
              <option value="deactivation">Unfair Account Deactivation</option>
              <option value="unpaid_wages">Withheld Earnings / Incentives</option>
              <option value="false_customer_claim">False Customer Complaint / Penalty</option>
              <option value="accident_claim">On-Duty Accident Insurance Claim</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Order / Trip ID:</label>
          <input
            type="text"
            value={disputeOrderId}
            onChange={(e) => setDisputeOrderId(e.target.value)}
            className="w-full p-2.5 text-xs border border-slate-300 rounded-xl"
            placeholder="e.g. ORD-99214"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            What happened? (Explain in simple words):
          </label>
          <textarea
            value={disputeStatement}
            onChange={(e) => setDisputeStatement(e.target.value)}
            rows={3}
            className="w-full p-3 text-xs border border-slate-300 rounded-xl"
            placeholder="Explain what happened..."
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleGenerateDispute}
            className="flex-1 touch-target py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow text-xs sm:text-sm"
          >
            <FileText className="w-4 h-4" /> Generate Template Letter
          </button>
          <button
            onClick={askGenAICustomDispute}
            className="flex-1 touch-target py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow text-xs sm:text-sm"
          >
            <Sparkles className="w-4 h-4" /> Draft Custom Appeal with GenAI
          </button>
        </div>
      </div>

      {/* Generated Dispute Letter Display */}
      {generatedDispute && (
        <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-sm text-slate-900">{generatedDispute.subject}</h3>
            <button
              onClick={() => copyToClipboard(generatedDispute.supportTicketBody, 'ticket')}
              className="touch-target px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm"
            >
              {copiedId === 'ticket' ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              Copy Ticket
            </button>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
            {generatedDispute.supportTicketBody}
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-blue-600" /> Statutory Safeguards Cited:
            </p>
            {generatedDispute.relevantRulesCited.map((r, i) => (
              <p key={i} className="text-xs text-slate-600">• {r}</p>
            ))}
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
            <div className="flex items-center justify-between">
              <p className="font-bold">WhatsApp Escalation Message:</p>
              <button
                onClick={() => copyToClipboard(generatedDispute.whatsappShortText, 'wa')}
                className="touch-target text-[11px] font-bold text-emerald-700 underline"
              >
                {copiedId === 'wa' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="italic">"{generatedDispute.whatsappShortText}"</p>
          </div>
        </div>
      )}
    </div>
  );
}
