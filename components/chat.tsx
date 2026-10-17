'use client';

import React, { useState, useEffect, useRef, FormEvent } from 'react';
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
  ShieldCheck,
  FileSearch,
  BookOpen,
  StopCircle,
  HelpCircle,
  Share2,
  Info
} from 'lucide-react';
import { PIIProtector } from '../lib/pii';
import { WELFARE_SCHEMES, findSchemesForWorker, SchemeInfo } from '../lib/welfare';
import { SafetyGuardian, FatigueScoreResult, LocalizedHazard } from '../lib/safety';
import { EarningsHelper, ParsedEarnings } from '../lib/earnings';
import { DisputeHelper, GeneratedDispute } from '../lib/dispute';
import { DocumentHelper, PRESET_DOCUMENTS, DocumentAnalysisResult } from '../lib/document';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export type SupportedLanguage = 'hi' | 'en' | 'hinglish' | 'ta' | 'te' | 'kn' | 'bn' | 'mr' | 'es';

interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  speechCode: string;
}

const LANGUAGES: LanguageOption[] = [
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

export function GigCopilotChat() {
  const [activeTab, setActiveTab] = useState<'chat' | 'earnings' | 'safety' | 'welfare' | 'document' | 'dispute' | 'privacy'>('chat');
  const [highContrast, setHighContrast] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Worker profile state
  const [workerName, setWorkerName] = useState('Raju Kumar');
  const [language, setLanguage] = useState<SupportedLanguage>('hi');

  // --- Zero-Dependency Native Edge Chat State ---
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Web Speech API - Speech Recognition (STT)
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      const currentLang = LANGUAGES.find((l) => l.code === language);
      recognitionRef.current.lang = currentLang ? currentLang.speechCode : 'hi-IN';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported in this browser. Please use Google Chrome, Edge, or an Android Webview.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        const currentLang = LANGUAGES.find((l) => l.code === language);
        recognitionRef.current.lang = currentLang ? currentLang.speechCode : 'hi-IN';
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
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

    const cleanText = text.replace(/[*#_`>]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const currentLang = LANGUAGES.find((l) => l.code === language);
    utterance.lang = currentLang ? currentLang.speechCode : 'hi-IN';
    utterance.rate = 0.95;

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

  // Zero-Dependency Native Streaming Message Submission
  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: prompt
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    const assistantMessageId = `asst_${Date.now()}`;
    const initialAssistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: ''
    };
    setMessages([...newMessages, initialAssistantMessage]);

    try {
      abortControllerRef.current = new AbortController();
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          workerName,
          language
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok || !response.body) {
        throw new Error(`Failed to generate response: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, content: accumulated } : msg
          )
        );
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: '⚠️ Connection interrupted. Please tap below to retry.' }
              : msg
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
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
  const localizedHazards: LocalizedHazard[] = SafetyGuardian.getLocalizedHazards();

  const updateFatigue = (d: number, s: number) => {
    setDrivingHours(d);
    setShiftHours(s);
    setFatigueStatus(SafetyGuardian.evaluateFatigue(d, s));
  };

  // --- Sub-Pillar 3: Welfare Schemes State & Eligibility Filter ---
  const [workerAge, setWorkerAge] = useState(28);
  const [workerMonthlyIncome, setWorkerMonthlyIncome] = useState(14000);
  const [workerJobType, setWorkerJobType] = useState('delivery');
  const [filteredSchemes, setFilteredSchemes] = useState<SchemeInfo[]>(WELFARE_SCHEMES);

  const filterSchemes = () => {
    const res = findSchemesForWorker(workerAge, workerMonthlyIncome, workerJobType);
    setFilteredSchemes(res);
  };

  // --- Sub-Pillar 4: Document Help & Contract Simplifier State ---
  const [selectedPresetId, setSelectedPresetId] = useState('food-delivery-tos');
  const [customContractText, setCustomContractText] = useState(PRESET_DOCUMENTS[0].rawText);
  const [docAnalysis, setDocAnalysis] = useState<DocumentAnalysisResult | null>(
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

  // --- Sub-Pillar 5: Dispute Drafter State ---
  const [disputeType, setDisputeType] = useState<'deactivation' | 'unpaid_wages' | 'false_customer_claim' | 'accident_claim'>('deactivation');
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
      workerExplanation: disputeStatement
    });
    setGeneratedDispute(res);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-150 ${highContrast ? 'high-contrast bg-black text-amber-300' : 'bg-slate-50 text-slate-900'}`}>
      {/* Top Accessible Header */}
      <header className={`sticky top-0 z-40 border-b px-4 py-3 shadow-sm backdrop-blur ${highContrast ? 'bg-black/95 border-amber-400' : 'bg-white/95 border-slate-200'}`}>
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
              सार
            </div>
            <div>
              <h1 className="text-lg font-extrabold leading-tight flex items-center gap-2">
                Saarthi AI
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                  Gig Copilot
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-semibold">
                Multilingual AI Advocate for Gig & Informal Workers
              </p>
            </div>
          </div>

          {/* Quick Actions (Contrast, Language Selector, Emergency SOS) */}
          <div className="flex items-center gap-2">
            {/* Language Selection Dropdown */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              aria-label="Select preferred language"
              className="touch-target px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>

            {/* High Contrast Mode for Outdoor Sun Glare */}
            <button
              onClick={() => setHighContrast(!highContrast)}
              className="touch-target p-2 rounded-xl border border-slate-300 hover:bg-slate-100 transition shadow-sm"
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
              className="touch-target px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl animate-sos flex items-center gap-1.5 shadow-lg"
              aria-label="Trigger Emergency SOS Alert"
            >
              <AlertTriangle className="w-4 h-4" />
              SOS
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Pills (Mobile First, WCAG min 48px touch target) */}
      <nav
        className={`border-b px-2 py-2 overflow-x-auto ${highContrast ? 'bg-zinc-950 border-amber-500' : 'bg-white border-slate-200'}`}
        role="tablist"
        aria-label="Saarthi AI Features"
      >
        <div className="max-w-5xl mx-auto flex items-center gap-2">
          <button
            role="tab"
            aria-selected={activeTab === 'chat'}
            onClick={() => setActiveTab('chat')}
            className={`touch-target px-4 py-2.5 text-xs md:text-sm font-bold rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? highContrast ? 'bg-amber-400 text-black' : 'bg-blue-600 text-white shadow-md'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            💬 Chat Copilot
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'earnings'}
            onClick={() => setActiveTab('earnings')}
            className={`touch-target px-4 py-2.5 text-xs md:text-sm font-bold rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'earnings'
                ? highContrast ? 'bg-amber-400 text-black' : 'bg-blue-600 text-white shadow-md'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-500" /> 1. Earnings & Fuel
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'safety'}
            onClick={() => setActiveTab('safety')}
            className={`touch-target px-4 py-2.5 text-xs md:text-sm font-bold rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'safety'
                ? highContrast ? 'bg-amber-400 text-black' : 'bg-blue-600 text-white shadow-md'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-500" /> 2. Safety & SOS
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'welfare'}
            onClick={() => setActiveTab('welfare')}
            className={`touch-target px-4 py-2.5 text-xs md:text-sm font-bold rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'welfare'
                ? highContrast ? 'bg-amber-400 text-black' : 'bg-blue-600 text-white shadow-md'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-blue-500" /> 3. Welfare & Rights
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'document'}
            onClick={() => setActiveTab('document')}
            className={`touch-target px-4 py-2.5 text-xs md:text-sm font-bold rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'document'
                ? highContrast ? 'bg-amber-400 text-black' : 'bg-blue-600 text-white shadow-md'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <FileSearch className="w-4 h-4 text-purple-500" /> 4. Document Help
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'dispute'}
            onClick={() => setActiveTab('dispute')}
            className={`touch-target px-4 py-2.5 text-xs md:text-sm font-bold rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'dispute'
                ? highContrast ? 'bg-amber-400 text-black' : 'bg-blue-600 text-white shadow-md'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-500" /> 5. Dispute Drafter
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'privacy'}
            onClick={() => setActiveTab('privacy')}
            className={`touch-target px-4 py-2.5 text-xs md:text-sm font-bold rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'privacy'
                ? highContrast ? 'bg-amber-400 text-black' : 'bg-blue-600 text-white shadow-md'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> 6. Privacy Shield
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 flex flex-col">
        {/* DOMAIN: CHAT COPILOT (VOICE FIRST) */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
            {/* Quick Suggestion Chips */}
            <div className="bg-slate-50 border-b border-slate-200 p-2.5 flex items-center gap-2 overflow-x-auto text-xs">
              <span className="font-bold text-slate-500 whitespace-nowrap">Suggested:</span>
              <button
                onClick={() => handleSendMessage('Swiggy credited Rs 1450 for 9 hrs. Fuel cost was Rs 300. Calculate my true net earnings.')}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-full hover:bg-slate-100 whitespace-nowrap font-medium"
              >
                💰 Calculate Net Earnings
              </button>
              <button
                onClick={() => handleSendMessage('How do I apply for e-Shram card and get ₹2 Lakh accident cover?')}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-full hover:bg-slate-100 whitespace-nowrap font-medium"
              >
                🏛️ e-Shram Application Steps
              </button>
              <button
                onClick={() => handleSendMessage('Explain the fine print in my platform partner contract about sudden account deactivation.')}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-full hover:bg-slate-100 whitespace-nowrap font-medium"
              >
                📄 Simplify Partner Contract
              </button>
              <button
                onClick={() => handleSendMessage('Zomato blocked my ID for customer false complaint. Draft an urgent appeal letter.')}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-full hover:bg-slate-100 whitespace-nowrap font-medium"
              >
                📝 Appeal Blocked ID
              </button>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[60vh] min-h-[350px]">
              {messages.length === 0 && (
                <div className="text-center py-10 space-y-3">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-3xl mx-auto flex items-center justify-center font-black text-2xl shadow-sm">
                    सार
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-800">
                    Namaste {workerName}! Welcome to Saarthi AI.
                  </h2>
                  <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    Ask in simple Hindi, Hinglish, Bengali, Tamil, Telugu, Kannada, or English. You can speak into the microphone or type below.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 pt-2">
                    <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">
                      5th-Grade Easy Reading
                    </span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-medium">
                      Zero-Retention PII Shield
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                      Native Gemini REST Streaming
                    </span>
                  </div>
                </div>
              )}

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-xs font-bold text-slate-500">
                      {m.role === 'user' ? workerName : 'Saarthi AI Copilot'}
                    </span>
                    {m.role === 'assistant' && m.content && (
                      <>
                        <button
                          onClick={() => speakText(m.content)}
                          className="touch-target p-1 text-slate-400 hover:text-blue-600 rounded"
                          title="Read Aloud (Text to Speech)"
                          aria-label="Read message aloud"
                        >
                          {isSpeaking ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(m.content, m.id)}
                          className="touch-target p-1 text-slate-400 hover:text-blue-600 rounded"
                          title="Copy Answer"
                          aria-label="Copy assistant answer"
                        >
                          {copiedId === m.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </>
                    )}
                  </div>
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                        : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                    }`}
                  >
                    {m.content}
                    {m.role === 'assistant' && !m.content && isLoading && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <Sparkles className="w-4 h-4 animate-spin text-blue-600" />
                        Thinking at 5th-grade level...
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar with Web Speech API STT */}
            <form onSubmit={handleFormSubmit} className="border-t border-slate-200 p-3 bg-white flex items-center gap-2">
              <button
                type="button"
                onClick={toggleListening}
                className={`touch-target p-3 rounded-2xl transition flex items-center justify-center ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title={isListening ? 'Listening... Tap to stop' : 'Tap to Speak (Voice Input)'}
                aria-label="Voice input button"
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? 'Listening... speak clearly now' : 'Ask about earnings, welfare, contracts, safety...'}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />

              {isLoading ? (
                <button
                  type="button"
                  onClick={handleStopGeneration}
                  className="touch-target px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center justify-center transition shadow"
                  aria-label="Stop generation"
                >
                  <StopCircle className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="touch-target px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center transition shadow"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>
        )}

        {/* DOMAIN 1: EARNINGS TRACKING & EXPENSE HELPER */}
        {activeTab === 'earnings' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  1. Smart Earnings & Net Income Calculator
                </h2>
                <button
                  onClick={() => speakText('Calculate your real net take home pay after fuel, bike maintenance, and platform deductions.')}
                  className="touch-target p-1.5 text-slate-400 hover:text-blue-600 rounded"
                  aria-label="Listen to earnings instructions"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Paste your payout SMS from Swiggy, Zomato, Uber, Zepto, or Blinkit. We calculate your true take-home after fuel and commissions.
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

              <button
                onClick={calculateEarnings}
                className="w-full touch-target py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow"
              >
                <RefreshCw className="w-4 h-4" /> Calculate True Take-Home Net
              </button>
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

        {/* DOMAIN 2: SAFETY PRACTICES & EMERGENCY PROTOCOLS */}
        {activeTab === 'safety' && (
          <div className="space-y-4">
            {/* SOS Dispatch Notification Banner */}
            {sosSent && (
              <div className="p-4 bg-red-100 border-2 border-red-500 rounded-2xl text-red-900 space-y-2 animate-pulse">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  EMERGENCY SOS MESSAGE GENERATED
                </h3>
                <p className="text-xs font-mono bg-white/70 p-2 rounded-lg">
                  {SafetyGuardian.generateEmergencySOSMessage(workerName, 28.6139, 77.209)}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(SafetyGuardian.generateEmergencySOSMessage(workerName, 28.6139, 77.209), 'sos')}
                    className="touch-target px-3.5 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg"
                  >
                    {copiedId === 'sos' ? 'Copied!' : 'Copy SOS Text'}
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(SafetyGuardian.generateEmergencySOSMessage(workerName, 28.6139, 77.209))}`}
                    target="_blank"
                    rel="noreferrer"
                    className="touch-target px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center gap-1"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share on WhatsApp
                  </a>
                </div>
              </div>
            )}

            {/* Continuous Riding Fatigue Monitor */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                2. Continuous Driving Fatigue Guardian
              </h2>
              <p className="text-xs text-slate-500">
                Continuous riding without rest is the #1 cause of evening gig accidents. Monitor your fatigue risk.
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
                    className="w-full accent-blue-600"
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
            </div>

            {/* Localized Environmental & Road Hazards */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Live Contextual Hazards & Advisory
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
        )}

        {/* DOMAIN 3: RIGHTS & WELFARE SCHEME AWARENESS */}
        {activeTab === 'welfare' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                  <HeartHandshake className="w-5 h-5 text-blue-600" />
                  3. Government & Platform Welfare Scheme Finder
                </h2>
                <button
                  onClick={() => speakText('Government and platform welfare schemes provide free accident insurance, hospitalization, and pension for gig workers.')}
                  className="touch-target p-1.5 text-slate-400 hover:text-blue-600 rounded"
                  aria-label="Listen to welfare summary"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500">
                These statutory schemes provide free accident cover up to ₹2 Lakh, free hospital care up to ₹5 Lakh, and pensions for gig workers.
              </p>

              {/* Interactive Eligibility Filter */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-3">
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
                    Check My Eligibility
                  </button>
                </div>
              </div>

              <div className="grid gap-3">
                {filteredSchemes.map((scheme) => (
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
                      📖 <strong>Plain 5th-Grade Explanation:</strong> {scheme.simpleSummary}
                    </p>

                    <div className="text-xs text-slate-600 space-y-1">
                      <p>📋 <strong>Required Documents:</strong> {scheme.requiredDocuments.join(', ')}</p>
                      <p>📞 <strong>Helpline:</strong> {scheme.helpline}</p>
                    </div>

                    <div className="pt-1 flex items-center justify-between">
                      <button
                        onClick={() => speakText(`${scheme.name}. ${scheme.simpleSummary}. Required documents: ${scheme.requiredDocuments.join(', ')}`)}
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
        )}

        {/* DOMAIN 4: DOCUMENT HELP & CONTRACT SIMPLIFIER */}
        {activeTab === 'document' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                  <FileSearch className="w-5 h-5 text-purple-600" />
                  4. Document Help & Contract Simplifier
                </h2>
                <button
                  onClick={() => speakText('This tool translates confusing contract clauses, insurance policies, and TDS tax forms into simple 5th grade words.')}
                  className="touch-target p-1.5 text-slate-400 hover:text-blue-600 rounded"
                  aria-label="Listen to document help introduction"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Platforms hide deactivation traps, wage deductions, and insurance exclusions in dense legal jargon. We translate them into 5th-grade plain language.
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
                          ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold'
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

              <button
                onClick={handleAnalyzeDocument}
                className="w-full touch-target py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow"
              >
                <Sparkles className="w-4 h-4" /> Translate to 5th-Grade Plain English & Hindi
              </button>
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
                      onClick={() => speakText(docAnalysis.vernacularSummary.hindi)}
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
                        <span>{clause.riskTitle}</span>
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
        )}

        {/* DOMAIN 5: GRIEVANCE & DISPUTE DRAFTING */}
        {activeTab === 'dispute' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                  <FileText className="w-5 h-5 text-blue-600" />
                  5. Dispute & Unfair Deactivation Drafter
                </h2>
                <button
                  onClick={() => speakText('Generate formal legal support tickets and grievance notices citing fair work principles.')}
                  className="touch-target p-1.5 text-slate-400 hover:text-blue-600 rounded"
                  aria-label="Listen to dispute drafter introduction"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
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
                    <option value="DoorDash">DoorDash</option>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">What happened? (Explain simply):</label>
                <textarea
                  value={disputeStatement}
                  onChange={(e) => setDisputeStatement(e.target.value)}
                  rows={3}
                  className="w-full p-3 text-xs border border-slate-300 rounded-xl"
                  placeholder="Explain what happened in simple words..."
                />
              </div>

              <button
                onClick={handleGenerateDispute}
                className="w-full touch-target py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow"
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
                    className="touch-target px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm"
                  >
                    {copiedId === 'ticket' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy Support Ticket
                  </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  {generatedDispute.supportTicketBody}
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-700">⚖️ Statutory Safeguards Cited:</p>
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
        )}

        {/* DOMAIN 6: ZERO-RETENTION PRIVACY SHIELD & PII DEMONSTRATION */}
        {activeTab === 'privacy' && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              6. Zero-Retention PII Anonymization & Security Guardrails
            </h2>
            <p className="text-xs text-slate-500">
              Under enterprise data privacy standards, worker phone numbers, vehicle registrations, bank details, and Aadhaar numbers are automatically scrubbed on your phone before prompts ever reach an external AI.
            </p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <p className="text-xs font-bold text-slate-700">Sample Raw Input with Sensitive PII:</p>
              <div className="p-3 bg-white border rounded-lg text-xs font-mono text-slate-600">
                "My name is Ramesh Kumar, mobile 9876543210, driving bike DL-01-AB-1234, pay me at ramesh@okhdfc."
              </div>

              <p className="text-xs font-bold text-emerald-700">Scrubbed Sanitized Output Sent Over Wire:</p>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-mono text-emerald-800">
                {PIIProtector.sanitizeAndAnonymize(
                  "My name is Ramesh Kumar, mobile 9876543210, driving bike DL-01-AB-1234, pay me at ramesh@okhdfc.",
                  "Ramesh Kumar"
                ).sanitizedText}
              </div>

              <p className="text-xs font-bold text-slate-700 mt-2">Delimited Prompt Injection Defense Container:</p>
              <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg text-[11px] font-mono whitespace-pre-wrap">
                {PIIProtector.wrapInSystemBoundaries('[WORKER_NAME_1] requests earnings breakdown for trip [ORD_123]', language)}
              </pre>
            </div>
          </div>
        )}
      </main>

      {/* Accessible Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-3 px-4 text-center text-xs text-slate-500">
        Saarthi AI • Zero-Dependency Edge Architecture • Direct Gemini REST API • WCAG 2.1 AA Compliant
      </footer>
    </div>
  );
}
