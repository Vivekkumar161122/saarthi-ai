'use client';

import React, { useState } from 'react';
import { SupportedLanguage } from '../src/core/types';
import { useGenAICopilot } from '../hooks/useGenAICopilot';
import { Header, LANGUAGES } from './copilot/Header';
import { Navigation, ActiveTabKey } from './copilot/Navigation';
import { ChatSection } from './copilot/ChatSection';
import { EarningsSection } from './copilot/EarningsSection';
import { SafetySection } from './copilot/SafetySection';
import { WelfareSection } from './copilot/WelfareSection';
import { DocumentSection } from './copilot/DocumentSection';
import { DisputeSection } from './copilot/DisputeSection';
import { PrivacySection } from './copilot/PrivacySection';

export function GigCopilotChat() {
  const [activeTab, setActiveTab] = useState<ActiveTabKey>('chat');
  const [highContrast, setHighContrast] = useState(false);
  const [workerName, setWorkerName] = useState('Vivek Kumar');
  const [language, setLanguage] = useState<SupportedLanguage>('hi');
  const [sosSent, setSosSent] = useState(false);

  // Zero-dependency native streaming hook
  const {
    messages,
    input,
    setInput,
    isLoading,
    sendMessage,
    stopGeneration,
    clearMessages
  } = useGenAICopilot({
    workerName,
    language
  });

  // Cross-domain GenAI action trigger: switches to chat tab and starts streaming
  const handleTriggerGenAI = (prompt: string, domain: string) => {
    setActiveTab('chat');
    sendMessage(prompt, domain);
  };

  // Web Speech API Text-to-Speech
  const handleSpeakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`>]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const currentLang = LANGUAGES.find((l) => l.code === language);
    utterance.lang = currentLang ? currentLang.speechCode : 'hi-IN';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-150 ${
        highContrast ? 'high-contrast bg-black text-amber-300' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* 1. Accessible Top Header */}
      <Header
        workerName={workerName}
        language={language}
        highContrast={highContrast}
        onLanguageChange={setLanguage}
        onToggleHighContrast={() => setHighContrast(!highContrast)}
        onTriggerSOS={() => {
          setSosSent(true);
          setActiveTab('safety');
        }}
      />

      {/* 2. Accessible Tab Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        highContrast={highContrast}
      />

      {/* 3. Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 flex flex-col" role="main">
        {activeTab === 'chat' && (
          <ChatSection
            messages={messages}
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            workerName={workerName}
            language={language}
            onSendMessage={sendMessage}
            onStopGeneration={stopGeneration}
            onClearMessages={clearMessages}
          />
        )}

        {activeTab === 'earnings' && (
          <EarningsSection
            onTriggerGenAI={handleTriggerGenAI}
            onSpeakText={handleSpeakText}
          />
        )}

        {activeTab === 'safety' && (
          <SafetySection
            workerName={workerName}
            onTriggerGenAI={handleTriggerGenAI}
            onSpeakText={handleSpeakText}
            sosSent={sosSent}
            onSetSosSent={setSosSent}
          />
        )}

        {activeTab === 'welfare' && (
          <WelfareSection
            onTriggerGenAI={handleTriggerGenAI}
            onSpeakText={handleSpeakText}
          />
        )}

        {activeTab === 'document' && (
          <DocumentSection
            onTriggerGenAI={handleTriggerGenAI}
            onSpeakText={handleSpeakText}
          />
        )}

        {activeTab === 'dispute' && (
          <DisputeSection
            workerName={workerName}
            onTriggerGenAI={handleTriggerGenAI}
            onSpeakText={handleSpeakText}
          />
        )}

        {activeTab === 'privacy' && <PrivacySection language={language} />}
      </main>

      {/* 4. Accessible Footer */}
      <footer
        className="mt-auto border-t border-slate-200 bg-white py-3 px-4 text-center text-xs text-slate-500"
        role="contentinfo"
      >
        Saarthi AI • Zero-Dependency Edge Architecture • Direct Gemini REST API • WCAG 2.1 AA Compliant
      </footer>
    </div>
  );
}
