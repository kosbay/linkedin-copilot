import React, { useState } from 'react';
import { Settings, User, MessageSquare, Palette, Info } from 'lucide-react';
import { ProviderTab } from './tabs/ProviderTab';
import { ProfileTab } from './tabs/ProfileTab';
import { InstructionsTab } from './tabs/InstructionsTab';
import { TonesTab } from './tabs/TonesTab';
import { AboutTab } from './tabs/AboutTab';

const TABS = [
  { id: 'provider', label: 'Provider', icon: Settings, component: ProviderTab },
  { id: 'profile', label: 'Profile', icon: User, component: ProfileTab },
  { id: 'instructions', label: 'Instructions', icon: MessageSquare, component: InstructionsTab },
  { id: 'tones', label: 'Tones', icon: Palette, component: TonesTab },
  { id: 'about', label: 'About', icon: Info, component: AboutTab },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function Options() {
  const [activeTab, setActiveTab] = useState<TabId>('provider');

  const ActiveComponent = TABS.find((t) => t.id === activeTab)!.component;

  return (
    <div className="min-h-screen bg-li-bg">
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold" style={{ color: 'rgba(0,0,0,0.9)' }}>LinkedIn Copilot</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(0,0,0,0.6)' }}>Configure your AI assistant</p>
        </div>

        {/* Tab navigation */}
        <div
          className="flex gap-0.5 mb-6 p-1 rounded-lg"
          style={{ background: 'rgba(0,0,0,0.06)' }}
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white shadow-li'
                    : 'hover:bg-black/[0.04]'
                }`}
                style={{
                  color: activeTab === tab.id ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.6)',
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div
          className="bg-white rounded-lg p-6"
          style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)' }}
        >
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
}
