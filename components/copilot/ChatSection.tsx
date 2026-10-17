'use client';

import React, { useRef, useEffect, useState, FormEvent } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  StopCircle,
  Copy,
  Check,
  RotateCcw
} from 'lucide-react';
import { ChatMessage } from '../../hooks/useGenAICopilot';
import { SupportedLanguage } from '../../src/core/types';
import { LANGUAGES } from './Header';

interface ChatSectionProps {
  messages: ChatMessage[];
  input: string;
  setInput: (val: string) => void;
  isLoading: boolean;
  workerName: string;
  language: SupportedLanguage;
  onSendMessage: (text?: string) => void;
  onStopGeneration: () => void;
  onClearMessages: () => void;
}

export function ChatSection({
  messages,
  input,
  setInput,
  isLoading,
  workerName,
  language,
  onSendMessage,
  onStopGeneration,
  onClearMessages
}: ChatSectionProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to latest message
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
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [language, setInput]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported in this browser. Please use Chrome, Edge, or Android Chrome.');
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

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSendMessage();
  };

  return (
    <div
      role="tabpanel"
      id="panel-chat"
      aria-labelledby="tab-chat"
      className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[520px]"
    >
      {/* Quick Suggestion Chips */}
      <div className="bg-slate-50 border-b border-slate-200 p-2.5 flex items-center justify-between gap-2 overflow-x-auto text-xs">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="font-bold text-slate-500 whitespace-nowrap">Try asking:</span>
          <button
            onClick={() => onSendMessage('Swiggy credited Rs 1450 for 9 hrs. Fuel cost was Rs 300. Calculate my true net earnings.')}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-full hover:bg-slate-100 whitespace-nowrap font-medium"
          >
            💰 Calculate Net Earnings
          </button>
          <button
            onClick={() => onSendMessage('How do I apply for e-Shram card and get ₹2 Lakh accident cover?')}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-full hover:bg-slate-100 whitespace-nowrap font-medium"
          >
            🏛️ e-Shram Application Steps
          </button>
          <button
            onClick={() => onSendMessage('Explain the fine print in my platform partner contract about sudden account deactivation.')}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-full hover:bg-slate-100 whitespace-nowrap font-medium"
          >
            📄 Simplify Partner Contract
          </button>
          <button
            onClick={() => onSendMessage('Zomato blocked my ID for customer false complaint. Draft an urgent appeal letter.')}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-full hover:bg-slate-100 whitespace-nowrap font-medium"
          >
            📝 Appeal Blocked ID
          </button>
        </div>

        {messages.length > 0 && (
          <button
            onClick={onClearMessages}
            title="Reset Chat"
            aria-label="Clear all chat messages"
            className="touch-target p-1.5 text-slate-400 hover:text-slate-600 rounded-lg shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[60vh] min-h-[350px]">
        {messages.length === 0 && (
          <div className="text-center py-10 space-y-3">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-3xl mx-auto flex items-center justify-center font-black text-2xl shadow-sm select-none">
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
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <Sparkles className="w-4 h-4 animate-spin text-blue-600" />
                  Generating 5th-grade guidance...
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form with Voice Button */}
      <form onSubmit={handleSubmit} className="border-t border-slate-200 p-3 bg-white flex items-center gap-2">
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
            onClick={onStopGeneration}
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
  );
}
