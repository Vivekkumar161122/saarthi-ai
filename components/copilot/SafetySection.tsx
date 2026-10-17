'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  PhoneCall,
  Share2,
  Copy,
  Check,
  Volume2,
  Sparkles
} from 'lucide-react';
import { SafetyGuardian, FatigueScoreResult, LocalizedHazard } from '../../lib/safety';

interface SafetySectionProps {
  workerName: string;
  onTriggerGenAI: (prompt: string, domain: string) => void;
  onSpeakText: (text: string) => void;
  sosSent: boolean;
  onSetSosSent: (val: boolean) => void;
}

export function SafetySection({
  workerName,
  onTriggerGenAI,
  onSpeakText,
  sosSent,
  onSetSosSent
}: SafetySectionProps) {
  const [drivingHours, setDrivingHours] = useState(3.5);
  const [shiftHours, setShiftHours] = useState(8);
  const [fatigueStatus, setFatigueStatus] = useState<FatigueScoreResult>(
    SafetyGuardian.evaluateFatigue(3.5, 8)
  );
  const [fakeCallActive, setFakeCallActive] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const localizedHazards: LocalizedHazard[] = SafetyGuardian.getLocalizedHazards();

  const updateFatigue = (d: number, s: number) => {
    setDrivingHours(d);
    setShiftHours(s);
    setFatigueStatus(SafetyGuardian.evaluateFatigue(d, s));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sosMessage = SafetyGuardian.generateEmergencySOSMessage(workerName, 28.6139, 77.209);

  const askGenAISafetyBriefing = () => {
    const prompt = `I am a gig worker on shift. I have been driving continuously for ${drivingHours} hours and total shift is ${shiftHours} hours. The current weather has a heatwave alert. Please give me a 5th-grade personalized safety briefing, fatigue management checklist, and emergency response advice.`;
    onTriggerGenAI(prompt, 'safety');
  };

  return (
    <div
      role="tabpanel"
      id="panel-safety"
      aria-labelledby="tab-safety"
      className="space-y-4"
    >
      {/* SOS Alert Banner */}
      {sosSent && (
        <div className="p-4 bg-red-100 border-2 border-red-500 rounded-2xl text-red-900 space-y-2 animate-pulse">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              EMERGENCY SOS MESSAGE GENERATED
            </h3>
            <button
              onClick={() => onSetSosSent(false)}
              className="text-xs font-bold underline text-red-700"
            >
              Dismiss
            </button>
          </div>
          <p className="text-xs font-mono bg-white/70 p-2.5 rounded-lg border border-red-200">
            {sosMessage}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => copyToClipboard(sosMessage, 'sos')}
              className="touch-target px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow"
            >
              {copiedId === 'sos' ? 'Copied!' : 'Copy SOS Text'}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(sosMessage)}`}
              target="_blank"
              rel="noreferrer"
              className="touch-target px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow"
            >
              <Share2 className="w-3.5 h-3.5" /> Share on WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Fatigue Guardian & Interactive Sliders */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            2. Continuous Driving Fatigue Guardian
          </h2>
          <button
            onClick={() =>
              onSpeakText(
                'Continuous riding without rest is the number one cause of accidents. Monitor your fatigue risk and stay safe.'
              )
            }
            className="touch-target p-1.5 text-slate-400 hover:text-blue-600 rounded"
            aria-label="Listen to fatigue monitor guide"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Continuous riding without rest is the #1 cause of evening gig accidents. Monitor your fatigue risk and pull over when alerts trigger.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Continuous Hours Online:</label>
            <input
              type="range"
              min="0"
              max="8"
              step="0.5"
              value={drivingHours}
              onChange={(e) => updateFatigue(parseFloat(e.target.value), shiftHours)}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-700">{drivingHours} hours continuous</span>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Total Shift Hours Today:</label>
            <input
              type="range"
              min="1"
              max="16"
              step="1"
              value={shiftHours}
              onChange={(e) => updateFatigue(drivingHours, parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-700">{shiftHours} hours total shift</span>
          </div>
        </div>

        <div
          className={`p-4 rounded-xl border ${
            fatigueStatus.fatigueLevel === 'DANGEROUS'
              ? 'bg-red-50 border-red-300 text-red-900'
              : fatigueStatus.fatigueLevel === 'HIGH_RISK'
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-emerald-50 border-emerald-300 text-emerald-900'
          }`}
        >
          <div className="flex items-center justify-between font-bold text-xs uppercase mb-1">
            <span>Fatigue Risk Status</span>
            <span>{fatigueStatus.fatigueLevel}</span>
          </div>
          <p className="text-xs leading-relaxed">{fatigueStatus.alertMessage}</p>
        </div>

        <button
          onClick={askGenAISafetyBriefing}
          className="w-full touch-target py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow text-xs sm:text-sm"
        >
          <Sparkles className="w-4 h-4" /> Ask GenAI for Personalized Shift Safety Briefing
        </button>
      </div>

      {/* Localized Environmental & Road Hazards */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Live Road & Climate Hazards Advisory
        </h3>
        <div className="grid gap-2">
          {localizedHazards.map((hazard) => (
            <div key={hazard.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800">{hazard.title}</h4>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  {hazard.severity}
                </span>
              </div>
              <p className="text-xs text-slate-600">{hazard.advice}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Fake Emergency Call Trigger (To escape aggressive customer situations) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="font-bold text-sm flex items-center gap-2 text-slate-800">
          <PhoneCall className="w-5 h-5 text-indigo-600" />
          Simulated Fake Incoming Call (Safety Exit)
        </h3>
        <p className="text-xs text-slate-500">
          Stuck with an aggressive customer or dark alleyway? Tap this to trigger a realistic incoming call screen so you can politely excuse yourself.
        </p>

        {fakeCallActive ? (
          <div className="p-6 bg-slate-900 text-white rounded-2xl text-center space-y-4 shadow-xl">
            <p className="text-xs text-slate-400">Incoming Urgent Call...</p>
            <p className="text-xl font-black">Home / Emergency Desk</p>
            <p className="text-xs text-emerald-400">+91 98765 43210</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setFakeCallActive(false)}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-full font-bold text-sm touch-target"
              >
                Decline
              </button>
              <button
                onClick={() => {
                  alert('"Hello beta, please come back immediately, emergency at home."');
                  setFakeCallActive(false);
                }}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-full font-bold text-sm touch-target"
              >
                Accept
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setFakeCallActive(true)}
            className="touch-target px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow"
          >
            📞 Trigger Simulated Incoming Call
          </button>
        )}
      </div>
    </div>
  );
}
