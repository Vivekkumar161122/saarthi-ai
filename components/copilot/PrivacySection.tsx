'use client';

import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, Key } from 'lucide-react';
import { PIIProtector } from '../../lib/pii';
import { SupportedLanguage } from '../../src/core/types';

interface PrivacySectionProps {
  language: SupportedLanguage;
}

export function PrivacySection({ language }: PrivacySectionProps) {
  const [sampleInput, setSampleInput] = useState(
    'My name is Vivek kumar, phone number 6284439257, bike number 007, pay on 007@upi, secret pass 007.'
  );

  const anonymized = PIIProtector.sanitizeAndAnonymize(sampleInput, 'Vivek kumar');

  return (
    <div
      role="tabpanel"
      id="panel-privacy"
      aria-labelledby="tab-privacy"
      className="space-y-4"
    >
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          6. Zero-Retention PII Anonymization & Prompt Injection Shield
        </h2>
        <p className="text-xs text-slate-500">
          Under enterprise data privacy standards, worker phone numbers, vehicle registrations, bank details, and Aadhaar numbers are automatically scrubbed on your phone before prompts ever reach an external AI.
        </p>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <label className="block text-xs font-bold text-slate-700">
            Interactive PII Anonymization Sandbox (Edit text to test):
          </label>
          <textarea
            value={sampleInput}
            onChange={(e) => setSampleInput(e.target.value)}
            rows={2}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-700 focus:ring-2 focus:ring-emerald-500"
          />

          <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Scrubbed Output Transmitted Over the Wire:
          </p>
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-mono text-emerald-800 whitespace-pre-wrap">
            {anonymized.sanitizedText}
          </div>

          {anonymized.strippedCategories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {anonymized.strippedCategories.map((cat, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200"
                >
                  ✓ Masked: {cat}
                </span>
              ))}
            </div>
          )}

          <p className="text-xs font-bold text-slate-700 mt-2 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-blue-600" /> System Boundary Delimitation Container:
          </p>
          <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg text-[11px] font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
            {PIIProtector.wrapInSystemBoundaries(anonymized.sanitizedText, language)}
          </pre>
        </div>
      </div>
    </div>
  );
}
