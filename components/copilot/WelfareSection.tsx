'use client';

import React, { useState } from 'react';
import { HeartHandshake, Volume2, Sparkles, ExternalLink, CheckCircle } from 'lucide-react';
import { WELFARE_SCHEMES, findSchemesForWorker, SchemeInfo } from '../../lib/welfare';

interface WelfareSectionProps {
  onTriggerGenAI: (prompt: string, domain: string) => void;
  onSpeakText: (text: string) => void;
}

export function WelfareSection({ onTriggerGenAI, onSpeakText }: WelfareSectionProps) {
  const [workerAge, setWorkerAge] = useState(28);
  const [workerMonthlyIncome, setWorkerMonthlyIncome] = useState(14000);
  const [workerJobType, setWorkerJobType] = useState('delivery');
  const [filteredSchemes, setFilteredSchemes] = useState<SchemeInfo[]>(WELFARE_SCHEMES);

  const filterSchemes = () => {
    const res = findSchemesForWorker(workerAge, workerMonthlyIncome, workerJobType);
    setFilteredSchemes(res);
  };

  const askGenAIApplicationHelp = () => {
    const eligibleNames = filteredSchemes.map((s) => s.name).join(', ');
    const prompt = `I am a ${workerAge}-year-old ${workerJobType} worker earning ₹${workerMonthlyIncome}/month. I want to apply for my eligible welfare schemes (${eligibleNames}). In simple 5th-grade language, give me a step-by-step application walkthrough, documents required, and common CSC Jan Seva Kendra mistakes to avoid.`;
    onTriggerGenAI(prompt, 'welfare');
  };

  return (
    <div
      role="tabpanel"
      id="panel-welfare"
      aria-labelledby="tab-welfare"
      className="space-y-4"
    >
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
            <HeartHandshake className="w-5 h-5 text-blue-600" />
            3. Government & Platform Welfare Scheme Finder
          </h2>
          <button
            onClick={() =>
              onSpeakText(
                'Government and platform welfare schemes provide free accident insurance, hospitalization, and pensions for gig workers.'
              )
            }
            className="touch-target p-1.5 text-slate-400 hover:text-blue-600 rounded"
            aria-label="Listen to welfare summary"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Statutory schemes provide free accident cover up to ₹2 Lakh, free hospital care up to ₹5 Lakh, and retirement pensions for gig workers.
        </p>

        {/* Interactive Eligibility Filter */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Your Age:</label>
            <input
              type="number"
              value={workerAge}
              onChange={(e) => setWorkerAge(parseInt(e.target.value) || 0)}
              className="w-full p-2 text-xs border rounded-lg bg-white"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Monthly Income (₹):</label>
            <input
              type="number"
              value={workerMonthlyIncome}
              onChange={(e) => setWorkerMonthlyIncome(parseInt(e.target.value) || 0)}
              className="w-full p-2 text-xs border rounded-lg bg-white"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={filterSchemes}
              className="w-full touch-target py-2 bg-blue-600 text-white rounded-lg text-xs font-bold shadow hover:bg-blue-700 transition"
            >
              Filter Eligible Schemes
            </button>
          </div>
        </div>

        <button
          onClick={askGenAIApplicationHelp}
          className="w-full touch-target py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow text-xs sm:text-sm"
        >
          <Sparkles className="w-4 h-4" /> Ask GenAI for Step-by-Step Application Guide
        </button>

        {/* Schemes List */}
        <div className="grid gap-3 pt-2">
          {filteredSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition bg-slate-50/50 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    {scheme.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{scheme.nameHindi}</p>
                </div>
                <span className="px-2.5 py-1 bg-blue-100 text-blue-800 font-bold text-xs rounded-full shrink-0">
                  {scheme.benefitAmount}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100">
                📖 <strong>Plain 5th-Grade Explanation:</strong> {scheme.simpleSummary}
              </p>

              <div className="text-xs text-slate-600 space-y-1">
                <p>📋 <strong>Required Documents:</strong> {scheme.requiredDocuments.join(', ')}</p>
                <p>📞 <strong>Helpline:</strong> {scheme.helpline}</p>
              </div>

              <div className="pt-1 flex items-center justify-between">
                <button
                  onClick={() =>
                    onSpeakText(
                      `${scheme.name}. ${scheme.simpleSummary}. Required documents: ${scheme.requiredDocuments.join(
                        ', '
                      )}`
                    )
                  }
                  className="touch-target text-xs text-blue-600 font-bold flex items-center gap-1"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Read Aloud
                </button>
                <a
                  href={scheme.applyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="touch-target px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg inline-flex items-center gap-1 shadow"
                >
                  Official Portal <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
