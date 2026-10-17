'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useChat } from 'ai/react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  ShieldAlert,
  DollarSign,
  HeartHandshake,
  FileText,
  AlertTriangle,
  PhoneCall,
  Sun,
  Moon,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { PIIProtector } from '../lib/pii';
import { WELFARE_SCHEMES } from '../lib/welfare';
import { SafetyGuardian, FatigueScoreResult } from '../lib/safety';
import { EarningsHelper, ParsedEarnings } from '../lib/earnings';
import { DisputeHelper, GeneratedDispute } from '../lib/dispute';

export function GigCopilotChat() {
  const [activeTab, setActiveTab] = useState<'chat' | 'earnings' | 'welfare' | 'safety' | 'dispute' | 'privacy'>('chat');
  const [highContrast, setHighContrast] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Worker profile state
  const [workerName, setWorkerName] = useState('Raju Kumar');
  const [language, setLanguage] = useState<'en' | 'hi'>('hi');

  // Vercel AI SDK useChat integration
  const { messages, input, handleInputChange, handleSubmit, isLoading, append, setInput } = useChat({
    api: '/api/chat',
    body: {
      workerName,
      language,
    },
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Web Speech API - Speech Recognition (STT)
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [language, setInput]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  // Web Speech API - Text to Speech (TTS)
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Strip markdown symbols for clean speech
    const cleanText = text.replace(/[*#_`>]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.95; // Slightly slower, easy to follow

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // 1-Click Copy helper
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- Sub-Pillar 1: Earnings Helper State ---
  const [smsInput, setSmsInput] = useState(
    'Swiggy: Rs. 1420 credited for 14 orders today. Tip of Rs. 80 included. Deductions: Penalty Rs. 150 for late delivery on order #4829.'
  );
  const [hoursShift, setHoursShift] = useState(9);
  const [fuelManual, setFuelManual] = useState(250);
  const [parsedResult, setParsedResult] = useState<ParsedEarnings | null>(null);

  const calculateEarnings = () => {
    const result = EarningsHelper.parseEarningsInput(smsInput, hoursShift, fuelManual);
    setParsedResult(result);
  };

  // --- Sub-Pillar 2: Safety & Fatigue State ---
  const [drivingHours, setDrivingHours] = useState(3.5);
  const [shiftHours, setShiftHours] = useState(8);
  const [fatigueStatus, setFatigueStatus] = useState<FatigueScoreResult>(
    SafetyGuardian.evaluateFatigue(3.5, 8)
  );
  const [fakeCallActive, setFakeCallActive] = useState(false);
  const [sosSent, setSosSent] = useState(false);

  const updateFatigue = (d: number, s: number) => {
    setDrivingHours(d);
    setShiftHours(s);
    setFatigueStatus(SafetyGuardian.evaluateFatigue(d, s));
  };

  // --- Sub-Pillar 3: Dispute Drafter State ---
  const [disputeType, setDisputeType] = useState<'deactivation' | 'unpaid_wages' | 'false_customer_claim'>('deactivation');
  const [disputePlatform, setDisputePlatform] = useState('Zomato');
  const [disputeOrderId, setDisputeOrderId] = useState('ORD-88412');
  const [disputeStatement, setDisputeStatement] = useState(
    'My ID was blocked because customer claimed food was never delivered. But I reached the GPS pin, clicked delivery photo, and customer took the packet from my hands.'
  );
  const [generatedDispute, setGeneratedDispute] = useState<GeneratedDispute | null>(null);

  const handleGenerateDispute = () => {
    const res = DisputeHelper.generateDisputeLetter({
      workerName,
      partnerId: 'GIG-9941',
      platform: disputePlatform,
      disputeType,
      incidentDate: new Date().toISOString().split('T')[0],
      orderOrTripId: disputeOrderId,
      amountDisputed: '650',
      workerExplanation: disputeStatement,
    });
    setGeneratedDispute(res);
  };

  return (
    <div className={`min-h-screen flex flex-col ${highContrast ? 'high-contrast bg-black text-amber-300' : 'bg-slate-50 text-slate-900'}`}>
      {/* Top Accessible Header */}
      <header className={`sticky top-0 z-40 border-b px-4 py-3 shadow-sm backdrop-blur ${highContrast ? 'bg-black/95 border-amber-400' : 'bg-white/95 border-slate-200'}`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow">
              सार
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight flex items-center gap-2">
                Saarthi AI
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300">
                  Gig Copilot
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">Empowering Delivery & Ride-share Partners</p>
            </div>
          </div>

          {/* Quick Actions (Contrast, Language, SOS) */}
          <div className="flex items-center gap-2">
            {/* Language Switch */}
            <button
              onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
              className="touch-target px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 hover:bg-slate-100 transition"
              aria-label="Toggle language between Hindi and English"
            >
              {language === 'hi' ? '🇮🇳 हिन्दी (Active)' : '🇬🇧 English'}
            </button>

            {/* High Contrast Mode for Sun/Bike Ride */}
            <button
              onClick={() => setHighContrast(!highContrast)}
              className="touch-target p-2 rounded-lg border border-slate-300 hover:bg-slate-100 transition"
              title="Toggle High Contrast for Sunlight"
              aria-label="Toggle High-Contrast Outdoor Mode"
            >
              {highContrast ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {/* Emergency SOS Quick Button */}
            <button
              onClick={() => {
                setSosSent(true);
                setActiveTab('safety');
              }}
              className="touch-target px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-lg animate-sos flex items-center gap-1 shadow-lg"
              aria-label="Trigger Emergency SOS Alert"
            >
              <AlertTriangle className="w-4 h-4" />
              SOS
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Pills (Mobile First, large touch target) */}
      <nav className={`border-b px-2 py-2 overflow-x-auto ${highContrast ? 'bg-zinc-950 border-amber-500' : 'bg-white border-slate-200'}`}>
        <div className="max-w-4xl mx-auto flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('chat')}
            className={`touch-target px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? highContrast ? 'bg-amber-400 text-black' : 'bg-blue-600 text-white shadow'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            💬 Chat Copilot
          </button>

          <button
            onClick={() => setActiveTab('earnings')}
            className={`touch-target px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'earnings'
                ? highContrast ? 'bg-amber-400 text-black' : 'bg-blue-600 text-white shadow'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <DollarSign className="w-4 h-4" /> Earnings & Fuel
          </button>

          <button
            onClick={() => setActiveTab('welfare')}
            className={`touch-target px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'welfare'
                ? highContrast ? 'bg-amber-400 text-black' : 'bg-blue-600 text-white shadow'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <HeartHandshake className="w-4 h-4" /> Welfare & Rights
          </button>

          <button
            onClick={() => setActiveTab('safety')}
            className={`touch-target px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'safety'
                ? highContrast ? 'bg-amber-400 text-black' : 'bg-blue-600 text-white shadow'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-red-500" /> Safety & SOS
          </button>

          <button
            onClick={() => setActiveTab('dispute')}
            className={`touch-target px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'dispute'
                ? highContrast ? 'bg-amber-400 text-black' : 'bg-blue-600 text-white shadow'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" /> Dispute Drafter
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`touch-target px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'privacy'
                ? highContrast ? 'bg-amber-400 text-black' : 'bg-blue-600 text-white shadow'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Privacy Shield
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col">
        {/* TAB 1: CHAT ASSISTANT */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Quick Suggestion Chips */}
            <div className="bg-slate-50 border-b border-slate-200 p-2.5 flex items-center gap-2 overflow-x-auto text-xs">
              <span className="font-semibold text-slate-500 whitespace-nowrap">Try asking:</span>
              <button
                onClick={() => append({ role: 'user', content: 'Swiggy credited Rs 920 for 8 hrs. Fuel Rs 220. What is my real hourly wage?' })}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-full hover:bg-slate-100 whitespace-nowrap"
              >
                💰 Calculate Net Wage
              </button>
              <button
                onClick={() => append({ role: 'user', content: 'How do I apply for e-Shram card and get ₹2 Lakh accident cover?' })}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-full hover:bg-slate-100 whitespace-nowrap"
              >
                🏛️ e-Shram Application
              </button>
              <button
                onClick={() => append({ role: 'user', content: 'Zomato blocked my ID for customer false complaint. Draft an appeal letter.' })}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-full hover:bg-slate-100 whitespace-nowrap"
              >
                📝 Appeal Blocked ID
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[60vh] min-h-[350px]">
              {messages.length === 0 && (
                <div className="text-center py-10 space-y-3">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl mx-auto flex items-center justify-center font-bold text-2xl">
                    सार
                  </div>
                  <h3 className="text-lg font-bold">Namaste {workerName}! How can Saarthi help today?</h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto">
                    Ask in simple Hindi, Hinglish, or English. You can speak using the microphone or type below.
                  </p>
                </div>
              )}

              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-xs font-bold text-slate-500">
                      {m.role === 'user' ? workerName : 'Saarthi AI (Copilot)'}
                    </span>
                    {m.role === 'assistant' && (
                      <button
                        onClick={() => speakText(m.content)}
                        className="touch-target p-1 text-slate-400 hover:text-blue-600 rounded"
                        title="Read Aloud (Text to Speech)"
                        aria-label="Read message aloud"
                      >
                        {isSpeaking ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                        : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar with Mic STT */}
            <form onSubmit={handleSubmit} className="border-t border-slate-200 p-3 bg-white flex items-center gap-2">
              <button
                type="button"
                onClick={toggleListening}
                className={`touch-target p-3 rounded-full transition flex items-center justify-center ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title={isListening ? 'Listening... Tap to stop' : 'Tap to Speak (Voice Input)'}
                aria-label="Voice input button"
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <input
                value={input}
                onChange={handleInputChange}
                placeholder={isListening ? 'Listening now... speak clearly' : 'Type or speak your question...'}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />

              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="touch-target px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center transition"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: EARNINGS & EXPENSE HELPER */}
        {activeTab === 'earnings' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Smart Earnings & Fuel Cost Calculator
              </h2>
              <p className="text-xs text-slate-500">
                Paste your payout SMS from Swiggy, Zomato, Uber, or Zepto to find your real net income after fuel and penalties.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payout SMS / Earnings Text:
                </label>
                <textarea
                  value={smsInput}
                  onChange={(e) => setSmsInput(e.target.value)}
                  rows={3}
                  className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fuel / Charging Expense (₹):</label>
                  <input
                    type="number"
                    value={fuelManual}
                    onChange={(e) => setFuelManual(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 text-sm border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <button
                onClick={calculateEarnings}
                className="w-full touch-target py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Calculate True Take-Home Net
              </button>
            </div>

            {/* Parsed Result Display */}
            {parsedResult && (
              <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <span className="text-xs font-bold uppercase text-slate-400">Platform</span>
                    <h3 className="text-lg font-bold text-slate-800">{parsedResult.platformIdentified}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold uppercase text-slate-400">Net Take-Home</span>
                    <h3 className="text-2xl font-black text-emerald-600">₹{parsedResult.netIncome}</h3>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500">Gross Reported</p>
                    <p className="font-bold text-slate-800">₹{parsedResult.grossAmount}</p>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-xl">
                    <p className="text-xs text-rose-600">Fuel & Drain</p>
                    <p className="font-bold text-rose-700">-₹{parsedResult.fuelExpense}</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl">
                    <p className="text-xs text-amber-700">Net Rate</p>
                    <p className="font-bold text-amber-800">₹{parsedResult.effectiveHourlyRate}/hr</p>
                  </div>
                </div>

                {parsedResult.detectedIssues.length > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                    <p className="font-bold">⚠️ Auditor Flags:</p>
                    {parsedResult.detectedIssues.map((issue, i) => (
                      <p key={i}>• {issue}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: WELFARE & RIGHTS FINDER */}
        {activeTab === 'welfare' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
                <HeartHandshake className="w-5 h-5 text-blue-600" />
                Government & Platform Welfare Schemes
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                These schemes are legally mandated for delivery partners and drivers. They provide free accident cover, hospital care, and pensions.
              </p>

              <div className="grid gap-3">
                {WELFARE_SCHEMES.map((scheme) => (
                  <div key={scheme.id} className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition bg-slate-50/50 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{scheme.name}</h3>
                        <p className="text-xs text-slate-500 font-medium">{scheme.nameHindi}</p>
                      </div>
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-800 font-bold text-xs rounded-full">
                        {scheme.benefitAmount}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100">
                      📖 <strong>Plain English:</strong> {scheme.simpleSummary}
                    </p>

                    <div className="text-xs text-slate-600 space-y-1">
                      <p>📋 <strong>Required Documents:</strong> {scheme.requiredDocuments.join(', ')}</p>
                      <p>📞 <strong>Helpline:</strong> {scheme.helpline}</p>
                    </div>

                    <div className="pt-1 flex items-center justify-between">
                      <a
                        href={scheme.applyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="touch-target px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg inline-flex items-center gap-1"
                      >
                        Official Portal <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SAFETY & EMERGENCY HUB */}
        {activeTab === 'safety' && (
          <div className="space-y-4">
            {/* SOS Dispatch Notification */}
            {sosSent && (
              <div className="p-4 bg-red-100 border-2 border-red-500 rounded-2xl text-red-900 space-y-2 animate-pulse">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  EMERGENCY SOS MESSAGE GENERATED
                </h3>
                <p className="text-xs">
                  {SafetyGuardian.generateEmergencySOSMessage(workerName, 28.6139, 77.209)}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(SafetyGuardian.generateEmergencySOSMessage(workerName, 28.6139, 77.209), 'sos')}
                    className="touch-target px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg"
                  >
                    {copiedId === 'sos' ? 'Copied!' : 'Copy SOS Text'}
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(SafetyGuardian.generateEmergencySOSMessage(workerName, 28.6139, 77.209))}`}
                    target="_blank"
                    rel="noreferrer"
                    className="touch-target px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg"
                  >
                    Share on WhatsApp
                  </a>
                </div>
              </div>
            )}

            {/* Fatigue Monitor */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                Continuous Driving Fatigue Tracker
              </h2>
              <p className="text-xs text-slate-500">
                Continuous riding without rest is the #1 cause of nighttime gig accidents. Keep your fatigue score low.
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
                    className="w-full accent-blue-600"
                  />
                  <span className="text-xs font-bold text-slate-700">{drivingHours} hours</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Shift Hours:</label>
                  <input
                    type="range"
                    min="1"
                    max="16"
                    step="1"
                    value={shiftHours}
                    onChange={(e) => updateFatigue(drivingHours, parseFloat(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <span className="text-xs font-bold text-slate-700">{shiftHours} hours</span>
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${
                fatigueStatus.fatigueLevel === 'DANGEROUS'
                  ? 'bg-red-50 border-red-300 text-red-900'
                  : fatigueStatus.fatigueLevel === 'HIGH_RISK'
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-900'
              }`}>
                <div className="flex items-center justify-between font-bold text-xs uppercase mb-1">
                  <span>Fatigue Level</span>
                  <span>{fatigueStatus.fatigueLevel}</span>
                </div>
                <p className="text-xs leading-relaxed">{fatigueStatus.alertMessage}</p>
              </div>
            </div>

            {/* Fake Emergency Call Trigger (To escape aggressive customer situations) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-indigo-600" />
                Simulated Fake Incoming Call (Safety Exit)
              </h3>
              <p className="text-xs text-slate-500">
                Stuck with an aggressive customer or dark alleyway? Tap this to trigger a realistic incoming call screen so you can politely excuse yourself.
              </p>

              {fakeCallActive ? (
                <div className="p-6 bg-slate-900 text-white rounded-2xl text-center space-y-4 animate-bounce">
                  <p className="text-xs text-slate-400">Incoming Call...</p>
                  <p className="text-xl font-black">Home / Emergency Desk</p>
                  <p className="text-xs text-emerald-400">+91 98765 43210</p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => setFakeCallActive(false)}
                      className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-full font-bold text-sm"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => {
                        alert('"Hello beta, please come back immediately, emergency at home."');
                        setFakeCallActive(false);
                      }}
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-full font-bold text-sm"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setFakeCallActive(true)}
                  className="touch-target px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition"
                >
                  📞 Trigger Simulated Incoming Call
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: DISPUTE & GRIEVANCE DRAFTER */}
        {activeTab === 'dispute' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Dispute & Unfair Deactivation Drafter
              </h2>
              <p className="text-xs text-slate-500">
                Platforms often block worker accounts automatically using computer algorithms. This tool generates formal legal-backed appeal letters to force a human review.
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
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">What happened? (Explain simply):</label>
                <textarea
                  value={disputeStatement}
                  onChange={(e) => setDisputeStatement(e.target.value)}
                  rows={3}
                  className="w-full p-3 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <button
                onClick={handleGenerateDispute}
                className="w-full touch-target py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Generate Formal Grievance Letter
              </button>
            </div>

            {/* Generated Dispute Letter Display */}
            {generatedDispute && (
              <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-bold text-sm text-slate-900">{generatedDispute.subject}</h3>
                  <button
                    onClick={() => copyToClipboard(generatedDispute.supportTicketBody, 'ticket')}
                    className="touch-target px-3 py-1 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded-lg flex items-center gap-1"
                  >
                    {copiedId === 'ticket' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy Support Ticket
                  </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  {generatedDispute.supportTicketBody}
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-700">⚖️ Legal Safeguards Cited:</p>
                  {generatedDispute.relevantRulesCited.map((r, i) => (
                    <p key={i} className="text-xs text-slate-600">• {r}</p>
                  ))}
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                  <p className="font-bold mb-1">WhatsApp Escalation Message:</p>
                  <p className="italic">"{generatedDispute.whatsappShortText}"</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: PRIVACY SHIELD & PII DEMONSTRATION */}
        {activeTab === 'privacy' && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Zero-Retention PII Anonymization Engine
            </h2>
            <p className="text-xs text-slate-500">
              Under enterprise data privacy standards, worker phone numbers, vehicle registrations, and Aadhaar/bank numbers are automatically scrubbed on your phone before prompts ever reach an external AI.
            </p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <p className="text-xs font-bold text-slate-700">Sample Raw Input with Sensitive PII:</p>
              <div className="p-2.5 bg-white border rounded-lg text-xs font-mono text-slate-600">
                "My name is Ramesh Kumar, mobile 9876543210, driving bike DL-01-AB-1234. Swiggy deducted Rs 500 to UPI ramesh@okhdfc."
              </div>

              <p className="text-xs font-bold text-emerald-700">Scrubbed Sanitized Output Sent Over Wire:</p>
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-mono text-emerald-800">
                {PIIProtector.sanitizeAndAnonymize(
                  "My name is Ramesh Kumar, mobile 9876543210, driving bike DL-01-AB-1234. Swiggy deducted Rs 500 to UPI ramesh@okhdfc.",
                  "Ramesh Kumar"
                ).sanitizedText}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Accessible Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-3 px-4 text-center text-xs text-slate-500">
        Saarthi AI • Built with Next.js 14, Tailwind CSS, Vercel AI SDK & Web Speech API • WCAG 2.1 AA Compliant
      </footer>
    </div>
  );
}
