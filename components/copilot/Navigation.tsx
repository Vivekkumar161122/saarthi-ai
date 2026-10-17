'use client';

import React from 'react';
import {
  MessageSquare,
  DollarSign,
  ShieldAlert,
  HeartHandshake,
  FileSearch,
  FileText,
  ShieldCheck
} from 'lucide-react';

export type ActiveTabKey =
  | 'chat'
  | 'earnings'
  | 'safety'
  | 'welfare'
  | 'document'
  | 'dispute'
  | 'privacy';

interface NavigationProps {
  activeTab: ActiveTabKey;
  onTabChange: (tab: ActiveTabKey) => void;
  highContrast: boolean;
}

export function Navigation({ activeTab, onTabChange, highContrast }: NavigationProps) {
  const tabs: { key: ActiveTabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'chat', label: '💬 Copilot Chat', icon: <MessageSquare className="w-4 h-4" /> },
    { key: 'earnings', label: '1. Earnings & Fuel', icon: <DollarSign className="w-4 h-4 text-emerald-500" /> },
    { key: 'safety', label: '2. Safety & SOS', icon: <ShieldAlert className="w-4 h-4 text-rose-500" /> },
    { key: 'welfare', label: '3. Welfare & Rights', icon: <HeartHandshake className="w-4 h-4 text-blue-500" /> },
    { key: 'document', label: '4. Document Help', icon: <FileSearch className="w-4 h-4 text-purple-500" /> },
    { key: 'dispute', label: '5. Dispute Drafter', icon: <FileText className="w-4 h-4 text-amber-500" /> },
    { key: 'privacy', label: '6. Privacy Shield', icon: <ShieldCheck className="w-4 h-4 text-emerald-600" /> }
  ];

  return (
    <nav
      className={`border-b px-2 py-2 overflow-x-auto ${
        highContrast ? 'bg-zinc-950 border-amber-500' : 'bg-white border-slate-200'
      }`}
      role="tablist"
      aria-label="Saarthi AI Core Features"
    >
      <div className="max-w-5xl mx-auto flex items-center gap-1.5 md:gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              role="tab"
              id={`tab-${tab.key}`}
              aria-controls={`panel-${tab.key}`}
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onTabChange(tab.key)}
              className={`touch-target px-3.5 py-2.5 text-xs md:text-sm font-bold rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
                isActive
                  ? highContrast
                    ? 'bg-amber-400 text-black font-black'
                    : 'bg-blue-600 text-white shadow-md'
                  : highContrast
                  ? 'text-amber-300 hover:bg-zinc-900'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
