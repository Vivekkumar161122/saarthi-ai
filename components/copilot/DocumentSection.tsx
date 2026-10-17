'use client';

import React, { useState } from 'react';
import { FileSearch, Sparkles, Volume2, AlertOctagon, CheckCircle2, AlertTriangle } from 'lucide-react';
import { DocumentHelper, PRESET_DOCUMENTS, DocumentAnalysisResult } from '../../lib/document';

interface DocumentSectionProps {
  onTriggerGenAI: (prompt: string, domain: string) => void;
  onSpeakText: (text: string) => void;
}

export function DocumentSection({ onTriggerGenAI, onSpeakText }: DocumentSectionProps) {
  const [selectedPresetId, setSelectedPresetId] = useState('food-delivery-tos');
  const [customContractText, setCustomContractText] = useState(PRESET_DOCUMENTS[0].rawText);
  const [docAnalysis, setDocAnalysis] = useState<DocumentAnalysisResult | null>(() =>
    DocumentHelper.analyzeDocument(PRESET_DOCUMENTS[0].rawText, PRESET_DOCUMENTS[0].title)
  );

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const found = PRESET_DOCUMENTS.find((p) => p.id === presetId);
    if (found) {
      setCustomContractText(found.rawText);
      setDocAnalysis(DocumentHelper.analyzeDocument(found.rawText, found.title));
    }
  };

  const handleAnalyzeDocument = () => {
    setDocAnalysis(DocumentHelper.analyzeDocument(customContractText, 'Analyzed Custom Gig Document'));
  };

  const askGenAIDeJargoning = () => {
    const prompt = `Please simplify this gig worker legal contract/document in 5th-grade plain language:\n"${customContractText}"\nIdentify all hidden traps, sudden account blocking conditions, unfair wage deduction clauses, and tell me in simple words what rights I have to protect my livelihood.`;
    onTriggerGenAI(prompt, 'document');
  };

  return (
    <div
      role="tabpanel"
      id="panel-document"
      aria-labelledby="tab-document"
      className="space-y-4"
    >
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
            <FileSearch className="w-5 h-5 text-purple-600" />
            4. Document Help & Contract Simplifier
          </h2>
          <button
            onClick={() =>
              onSpeakText(
                'This tool translates confusing contract clauses, insurance policies, and TDS tax forms into simple 5th grade words.'
              )
            }
            className="touch-target p-1.5 text-slate-400 hover:text-blue-600 rounded"
            aria-label="Listen to document help guide"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Platforms hide deactivation traps, wage deductions, and insurance exclusions in dense legal jargon. We translate them into 5th-grade plain language and red-flag traps.
        </p>

        {/* Preset Contract Picker */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Choose a Standard Gig Document or Paste Custom Text:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
            {PRESET_DOCUMENTS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                className={`text-left p-3 rounded-xl border text-xs transition ${
                  selectedPresetId === preset.id
                    ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold mb-0.5">{preset.title}</div>
                <div className="text-[11px] text-slate-500 font-normal">{preset.description}</div>
              </button>
            ))}
          </div>

          <textarea
            value={customContractText}
            onChange={(e) => setCustomContractText(e.target.value)}
            rows={4}
            className="w-full p-3 text-xs border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-purple-500"
            placeholder="Paste any contract clause, terms of service, or insurance wording here..."
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleAnalyzeDocument}
            className="flex-1 touch-target py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow text-xs sm:text-sm"
          >
            <FileSearch className="w-4 h-4" /> Analyze Clauses (Flesch-Kincaid)
          </button>
          <button
            onClick={askGenAIDeJargoning}
            className="flex-1 touch-target py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow text-xs sm:text-sm"
          >
            <Sparkles className="w-4 h-4" /> Ask GenAI for Deep Contract Audit
          </button>
        </div>
      </div>

      {/* Document Analysis Result Breakdown */}
      {docAnalysis && (
        <div className="bg-white p-5 rounded-2xl border border-purple-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">{docAnalysis.documentTitle}</h3>
              <p className="text-xs text-slate-500">Clause-by-Clause Plain Language Audit</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-center px-3 py-1 bg-rose-50 border border-rose-200 rounded-xl">
                <p className="text-[10px] text-rose-600 font-bold uppercase">Original Level</p>
                <p className="text-xs font-black text-rose-700">Grade {docAnalysis.originalReadingGrade} (College Law)</p>
              </div>
              <div className="text-center px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="text-[10px] text-emerald-600 font-bold uppercase">Saarthi Level</p>
                <p className="text-xs font-black text-emerald-700">Grade 5 (Easy)</p>
              </div>
            </div>
          </div>

          {/* Plain-Language Vernacular Card */}
          <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-purple-900">🇮🇳 सरल हिन्दी अनुवाद (Simple Hindi Summary):</p>
              <button
                onClick={() => onSpeakText(docAnalysis.vernacularSummary.hindi)}
                className="touch-target text-xs text-purple-700 font-bold flex items-center gap-1"
              >
                <Volume2 className="w-3.5 h-3.5" /> Listen
              </button>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed italic">
              "{docAnalysis.vernacularSummary.hindi}"
            </p>
          </div>

          {/* Clauses Audit */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Red-Flag & Safety Analysis:
            </h4>
            {docAnalysis.clauses.map((clause) => (
              <div
                key={clause.id}
                className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                  clause.category === 'critical_risk'
                    ? 'bg-red-50 border-red-200 text-red-950'
                    : clause.category === 'warning'
                    ? 'bg-amber-50 border-amber-200 text-amber-950'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    {clause.category === 'critical_risk' ? (
                      <AlertOctagon className="w-4 h-4 text-red-600" />
                    ) : clause.category === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                    {clause.riskTitle}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-white/70">
                    {clause.category.replace('_', ' ')}
                  </span>
                </div>
                <div className="p-2 bg-white/80 rounded-lg text-slate-600 font-mono text-[11px] leading-relaxed">
                  <strong>Contract Fine Print:</strong> "{clause.originalText}"
                </div>
                <p className="text-xs font-medium leading-relaxed">
                  👉 <strong>What this means for you:</strong> {clause.simplifiedExplanation}
                </p>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 border rounded-xl text-xs text-slate-700 space-y-1">
            <p className="font-bold">🛡️ Worker Actionable Advice:</p>
            <p>{docAnalysis.workerActionableAdvice}</p>
          </div>
        </div>
      )}
    </div>
  );
}
