'use client';

import React, { useState } from 'react';
import { DollarSign, RefreshCw, Volume2, Sparkles, TrendingUp, AlertCircle } from 'lucide-react';
import { EarningsHelper, ParsedEarnings } from '../../lib/earnings';

interface EarningsSectionProps {
  onTriggerGenAI: (prompt: string, domain: string) => void;
  onSpeakText: (text: string) => void;
}

export function EarningsSection({ onTriggerGenAI, onSpeakText }: EarningsSectionProps) {
  const [smsInput, setSmsInput] = useState(
    'Swiggy: Rs. 1420 credited for 14 orders today. Tip of Rs. 80 included. Deductions: Penalty Rs. 150 for late delivery on order #4829.'
  );
  const [hoursShift, setHoursShift] = useState(9);
  const [fuelManual, setFuelManual] = useState(250);
  const [parsedResult, setParsedResult] = useState<ParsedEarnings | null>(() =>
    EarningsHelper.parseEarningsInput(
      'Swiggy: Rs. 1420 credited for 14 orders today. Tip of Rs. 80 included. Deductions: Penalty Rs. 150 for late delivery on order #4829.',
      9,
      250
    )
  );

  const calculateEarnings = () => {
    const result = EarningsHelper.parseEarningsInput(smsInput, hoursShift, fuelManual);
    setParsedResult(result);
  };

  const askGenAIAudit = () => {
    const prompt = `Please analyze my earnings payout and fuel expenses in simple 5th-grade language:\n${smsInput}\nHours worked: ${hoursShift}\nFuel cost: ₹${fuelManual}\nNet Take-Home: ₹${
      parsedResult?.netIncome || 0
    }. How can I minimize deductions, challenge unfair penalties, and improve my hourly profit?`;
    onTriggerGenAI(prompt, 'earnings');
  };

  return (
    <div
      role="tabpanel"
      id="panel-earnings"
      aria-labelledby="tab-earnings"
      className="space-y-4"
    >
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            1. Smart Earnings & Net Income Calculator
          </h2>
          <button
            onClick={() =>
              onSpeakText(
                'Calculate your real take home pay after fuel, platform cuts, and penalties. Then ask GenAI to audit deductions.'
              )
            }
            className="touch-target p-1.5 text-slate-400 hover:text-blue-600 rounded"
            aria-label="Listen to earnings calculator instructions"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Paste your payout SMS from Swiggy, Zomato, Uber, Zepto, or Blinkit. We calculate your true take-home after fuel and commissions, and leverage GenAI to detect unfair deductions.
        </p>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Payout SMS / Earnings Summary Text:
          </label>
          <textarea
            value={smsInput}
            onChange={(e) => setSmsInput(e.target.value)}
            rows={3}
            className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
            placeholder="Paste payout text here..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Hours Worked Today:</label>
            <input
              type="number"
              value={hoursShift}
              onChange={(e) => setHoursShift(parseFloat(e.target.value) || 0)}
              className="w-full p-2.5 text-sm border border-slate-300 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Fuel / EV Charging (₹):</label>
            <input
              type="number"
              value={fuelManual}
              onChange={(e) => setFuelManual(parseFloat(e.target.value) || 0)}
              className="w-full p-2.5 text-sm border border-slate-300 rounded-xl"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={calculateEarnings}
            className="flex-1 touch-target py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow text-xs sm:text-sm"
          >
            <RefreshCw className="w-4 h-4" /> Calculate Take-Home Net
          </button>
          <button
            onClick={askGenAIAudit}
            className="flex-1 touch-target py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow text-xs sm:text-sm"
          >
            <Sparkles className="w-4 h-4" /> Ask GenAI to Audit Deductions
          </button>
        </div>
      </div>

      {/* Parsed Result Display */}
      {parsedResult && (
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">Platform Identified</span>
              <h3 className="text-lg font-bold text-slate-800">{parsedResult.platformIdentified}</h3>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold uppercase text-slate-400">True Take-Home (Net)</span>
              <h3 className="text-2xl font-black text-emerald-600">₹{parsedResult.netIncome}</h3>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500">Gross Reported</p>
              <p className="font-bold text-slate-800">₹{parsedResult.grossAmount}</p>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl">
              <p className="text-xs text-rose-600">Fuel & Maintenance</p>
              <p className="font-bold text-rose-700">-₹{parsedResult.fuelExpense}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl">
              <p className="text-xs text-amber-700">Net Hourly Rate</p>
              <p className="font-bold text-amber-800">₹{parsedResult.effectiveHourlyRate}/hr</p>
            </div>
          </div>

          {parsedResult.detectedIssues.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" /> Auditor Flags:
              </p>
              {parsedResult.detectedIssues.map((issue, i) => (
                <p key={i}>• {issue}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
