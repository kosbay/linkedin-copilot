import React, { useState, useEffect } from 'react';
import { Settings, Sparkles, Circle } from 'lucide-react';
import type { ProviderId } from '@/types/ai';
import type { TonePreset } from '@/types/storage';
import { PROVIDER_CONFIGS } from '@/constants/providers';
import { syncStorage, localStorage } from '@/lib/storage';

export function Popup() {
  const [activeProvider, setActiveProvider] = useState<ProviderId>('openai');
  const [activeToneId, setActiveToneId] = useState('professional');
  const [tones, setTones] = useState<TonePreset[]>([]);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadAll = () => {
      Promise.all([
        syncStorage.getAll(),
        localStorage.get('providers'),
      ]).then(([sync, providers]) => {
        setActiveProvider(sync.activeProvider);
        setActiveToneId(sync.activeToneId);
        setTones(sync.tonePresets);
        const key = providers[sync.activeProvider]?.apiKey;
        setHasApiKey(!!key || sync.activeProvider === 'proxy');
        setLoaded(true);
      });
    };

    loadAll();

    const unsubSync = syncStorage.onChange(() => loadAll());
    const unsubLocal = localStorage.onChange(() => loadAll());
    return () => { unsubSync(); unsubLocal(); };
  }, []);

  const handleProviderChange = (id: ProviderId) => {
    setActiveProvider(id);
    syncStorage.set('activeProvider', id);
    localStorage.get('providers').then((providers) => {
      setHasApiKey(!!providers[id]?.apiKey || id === 'proxy');
    });
  };

  const handleToneChange = (id: string) => {
    setActiveToneId(id);
    syncStorage.set('activeToneId', id);
  };

  if (!loaded) {
    return (
      <div className="w-[320px] p-4 bg-white">
        <p className="text-sm" style={{ color: 'rgba(0,0,0,0.6)' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-[320px] bg-white">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-600">
            <Sparkles size={13} className="text-white" />
          </div>
          <span className="font-semibold" style={{ color: 'rgba(0,0,0,0.9)' }}>LinkedIn Copilot</span>
        </div>
        <button
          onClick={() => chrome.runtime.openOptionsPage()}
          className="p-1.5 rounded-full hover:bg-black/[0.08] transition-colors"
          style={{ color: 'rgba(0,0,0,0.6)' }}
          title="Settings"
        >
          <Settings size={16} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Status */}
        <div className="flex items-center gap-2">
          <Circle
            size={8}
            className={hasApiKey ? 'fill-green-600 text-green-600' : 'fill-red-500 text-red-500'}
          />
          <span className="text-sm" style={{ color: 'rgba(0,0,0,0.6)' }}>
            {PROVIDER_CONFIGS[activeProvider].name}
            {hasApiKey ? ' — Connected' : ' — No API key'}
          </span>
        </div>

        {/* Provider quick switch */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'rgba(0,0,0,0.6)' }}>Provider</label>
          <select
            value={activeProvider}
            onChange={(e) => handleProviderChange(e.target.value as ProviderId)}
            className="w-full px-3 py-1.5 text-sm rounded bg-white"
            style={{
              border: '1px solid rgba(0,0,0,0.3)',
              color: 'rgba(0,0,0,0.9)',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.currentTarget.style.border = '1px solid #0a66c2';
              e.currentTarget.style.boxShadow = '0 0 0 1px #0a66c2';
            }}
            onBlur={(e) => {
              e.currentTarget.style.border = '1px solid rgba(0,0,0,0.3)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {Object.values(PROVIDER_CONFIGS).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tone quick switch */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'rgba(0,0,0,0.6)' }}>Tone</label>
          <select
            value={activeToneId}
            onChange={(e) => handleToneChange(e.target.value)}
            className="w-full px-3 py-1.5 text-sm rounded bg-white"
            style={{
              border: '1px solid rgba(0,0,0,0.3)',
              color: 'rgba(0,0,0,0.9)',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.currentTarget.style.border = '1px solid #0a66c2';
              e.currentTarget.style.boxShadow = '0 0 0 1px #0a66c2';
            }}
            onBlur={(e) => {
              e.currentTarget.style.border = '1px solid rgba(0,0,0,0.3)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {tones.map((tone) => (
              <option key={tone.id} value={tone.id}>
                {tone.name}
              </option>
            ))}
          </select>
        </div>

        {!hasApiKey && (
          <button
            onClick={() => chrome.runtime.openOptionsPage()}
            className="w-full px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-full hover:bg-brand-700 transition-colors"
          >
            Configure API Key
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2" style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
        <p className="text-center" style={{ fontSize: 10, color: 'rgba(0,0,0,0.4)' }}>
          LinkedIn Copilot v0.1.0 — Open Source
        </p>
      </div>
    </div>
  );
}
