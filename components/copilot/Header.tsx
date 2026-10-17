'use client';

import React from 'react';
import { AlertTriangle, Sun, Moon, Volume2, Shield } from 'lucide-react';
import { SupportedLanguage } from '../../src/core/types';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  speechCode: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'hi', label: '🇮🇳 हिन्दी (Hindi)', speechCode: 'hi-IN' },
  { code: 'en', label: '🇬🇧 English', speechCode: 'en-IN' },
  { code: 'hinglish', label: '🇮🇳 Hinglish', speechCode: 'hi-IN' },
  { code: 'ta', label: '🇮🇳 தமிழ் (Tamil)', speechCode: 'ta-IN' },
  { code: 'te', label: '🇮🇳 తెలుగు (Telugu)', speechCode: 'te-IN' },
  { code: 'kn', label: '🇮🇳 ಕನ್ನಡ (Kannada)', speechCode: 'kn-IN' },
  { code: 'bn', label: '🇮🇳 বাংলা (Bengali)', speechCode: 'bn-IN' },
  { code: 'mr', label: '🇮🇳 मराठी (Marathi)', speechCode: 'mr-IN' },
  { code: 'es', label: '🇪🇸 Español (Spanish)', speechCode: 'es-ES' }
];

interface HeaderProps {
  workerName: string;
  language: SupportedLanguage;
  highContrast: boolean;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onToggleHighContrast: () => void;
  onTriggerSOS: () => void;
}

export function Header({
  workerName,
  language,
  highContrast,
  onLanguageChange,
  onToggleHighContrast,
  onTriggerSOS
}: HeaderProps) {
  return (
    <header
      className={`sticky top-0 z-40 border-b px-4 py-3 shadow-sm backdrop-blur ${
        highContrast ? 'bg-black/95 border-amber-400' : 'bg-white/95 border-slate-200'
      }`}
      role="banner"
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Brand & Persona */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-md select-none"
            aria-hidden="true"
          >
            सार
          </div>
          <div>
            <h1 className="text-lg font-black leading-tight flex items-center gap-2">
              Saarthi AI
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                Gig Copilot
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-semibold">
              Multilingual GenAI Advocate • Delivery, Cabs & Daily Earners
            </p>
          </div>
        </div>

        {/* Header Controls: Language, High Contrast Outdoor Mode, Emergency SOS */}
        <div className="flex items-center gap-2">
          {/* Vernacular Language Selector */}
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
            aria-label="Select preferred vernacular language"
            className="touch-target px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 shadow-sm"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>

          {/* High Contrast Outdoor Mode Toggle */}
          <button
            onClick={onToggleHighContrast}
            className="touch-target p-2 rounded-xl border border-slate-300 hover:bg-slate-100 transition shadow-sm"
            title="Toggle High Contrast for Outdoor Sunlight"
            aria-label="Toggle High-Contrast Outdoor Mode for bright sunlight"
          >
            {highContrast ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          {/* Emergency SOS Quick Trigger */}
          <button
            onClick={onTriggerSOS}
            className="touch-target px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl animate-sos flex items-center gap-1.5 shadow-lg"
            aria-label="Trigger Emergency SOS Alert with GPS"
          >
            <AlertTriangle className="w-4 h-4" />
            SOS
          </button>
        </div>
      </div>
    </header>
  );
}
