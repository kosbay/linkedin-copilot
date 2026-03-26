import React, { useState, useEffect } from 'react';
import { Check, X, Loader2, Eye, EyeOff } from 'lucide-react';
import type { ProviderId } from '@/types/ai';
import type { ProviderSettings } from '@/types/storage';
import { PROVIDER_CONFIGS } from '@/constants/providers';
import { syncStorage, localStorage } from '@/lib/storage';

export function ProviderTab() {
  const [activeProvider, setActiveProvider] = useState<ProviderId>('openai');
  const [providerSettings, setProviderSettings] = useState<Record<ProviderId, ProviderSettings> | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testError, setTestError] = useState('');

  useEffect(() => {
    const loadAll = () => {
      Promise.all([
        syncStorage.get('activeProvider'),
        localStorage.get('providers'),
      ]).then(([provider, providers]) => {
        setActiveProvider(provider);
        setProviderSettings(providers);
      });
    };

    loadAll();

    const unsubSync = syncStorage.onChange(() => loadAll());
    const unsubLocal = localStorage.onChange(() => loadAll());
    return () => { unsubSync(); unsubLocal(); };
  }, []);

  if (!providerSettings) return <div className="p-4" style={{ color: 'rgba(0,0,0,0.6)' }}>Loading...</div>;

  const currentSettings = providerSettings[activeProvider];
  const config = PROVIDER_CONFIGS[activeProvider];

  const updateProviderSettings = (updates: Partial<ProviderSettings>) => {
    const updated = { ...providerSettings, [activeProvider]: { ...currentSettings, ...updates } };
    setProviderSettings(updated);
    localStorage.set('providers', updated);
  };

  const handleProviderChange = (id: ProviderId) => {
    setActiveProvider(id);
    syncStorage.set('activeProvider', id);
    setTestStatus('idle');
    setShowKey(false);
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestError('');

    try {
      const port = chrome.runtime.connect({ name: `generate-test-${Date.now()}` });

      const result = await new Promise<'success' | string>((resolve) => {
        let gotChunk = false;
        const timeout = setTimeout(() => {
          port.disconnect();
          resolve(gotChunk ? 'success' : 'Timeout: no response received');
        }, 15000);

        port.onMessage.addListener((msg) => {
          if (msg.type === 'STREAM_CHUNK') {
            gotChunk = true;
          }
          if (msg.type === 'STREAM_DONE') {
            clearTimeout(timeout);
            port.disconnect();
            resolve('success');
          }
          if (msg.type === 'STREAM_ERROR') {
            clearTimeout(timeout);
            port.disconnect();
            resolve(msg.error);
          }
        });

        port.postMessage({
          type: 'GENERATE_START',
          payload: {
            feature: 'comment',
            providerId: activeProvider,
            model: currentSettings.selectedModel,
            apiKey: currentSettings.apiKey,
            systemPrompt: 'Reply with "OK" only.',
            userPrompt: 'Test',
            maxTokens: 5,
            temperature: 0,
          },
        });
      });

      if (result === 'success') {
        setTestStatus('success');
      } else {
        setTestStatus('error');
        setTestError(result);
      }
    } catch (err) {
      setTestStatus('error');
      setTestError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const inputStyle = {
    border: '1px solid rgba(0,0,0,0.3)',
    color: 'rgba(0,0,0,0.9)',
    outline: 'none',
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.border = '1px solid #0a66c2';
    e.currentTarget.style.boxShadow = '0 0 0 1px #0a66c2';
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.border = '1px solid rgba(0,0,0,0.3)';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div className="space-y-6">
      {/* Provider selector */}
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(0,0,0,0.9)' }}>AI Provider</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(PROVIDER_CONFIGS).map((p) => (
            <button
              key={p.id}
              onClick={() => handleProviderChange(p.id)}
              className="px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors"
              style={{
                border: activeProvider === p.id ? '2px solid #0a66c2' : '1px solid rgba(0,0,0,0.15)',
                background: activeProvider === p.id ? '#e8f3ff' : 'white',
                color: activeProvider === p.id ? '#0a66c2' : 'rgba(0,0,0,0.9)',
                padding: activeProvider === p.id ? '9px 15px' : '10px 16px',
              }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* API Key */}
      {config.requiresApiKey && (
        <div>
          <label className="block text-sm font-semibold mb-1" style={{ color: 'rgba(0,0,0,0.9)' }}>API Key</label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={currentSettings.apiKey}
              onChange={(e) => updateProviderSettings({ apiKey: e.target.value })}
              placeholder={`Enter your ${config.name} API key`}
              className="w-full px-3 py-2 pr-10 text-sm rounded-lg"
              style={inputStyle}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/[0.08]"
              style={{ color: 'rgba(0,0,0,0.6)' }}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="mt-1 text-xs" style={{ color: 'rgba(0,0,0,0.4)' }}>
            Stored locally on your device. Never sent to our servers.
          </p>
        </div>
      )}

      {!config.requiresApiKey && (
        <div
          className="p-4 rounded-lg"
          style={{ background: '#e8f3ff', border: '1px solid rgba(10,102,194,0.2)' }}
        >
          <p className="text-sm" style={{ color: '#0a66c2' }}>
            Pro mode uses our hosted AI. No API key needed.
          </p>
          <p className="text-xs mt-1" style={{ color: '#004182' }}>Coming soon.</p>
        </div>
      )}

      {/* Model selection */}
      <div>
        <label className="block text-sm font-semibold mb-1" style={{ color: 'rgba(0,0,0,0.9)' }}>Model</label>
        <select
          value={currentSettings.selectedModel}
          onChange={(e) => updateProviderSettings({ selectedModel: e.target.value })}
          className="w-full px-3 py-2 text-sm rounded-lg bg-white"
          style={inputStyle}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        >
          {config.models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {/* Temperature */}
      <div>
        <label className="block text-sm font-semibold mb-1" style={{ color: 'rgba(0,0,0,0.9)' }}>
          Temperature: {currentSettings.temperature.toFixed(1)}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={currentSettings.temperature}
          onChange={(e) => updateProviderSettings({ temperature: parseFloat(e.target.value) })}
          className="w-full accent-brand-600"
        />
        <div className="flex justify-between text-xs mt-1" style={{ color: 'rgba(0,0,0,0.4)' }}>
          <span>Precise</span>
          <span>Creative</span>
        </div>
      </div>

      {/* Max tokens */}
      <div>
        <label className="block text-sm font-semibold mb-1" style={{ color: 'rgba(0,0,0,0.9)' }}>Max Tokens</label>
        <input
          type="number"
          min={50}
          max={4096}
          step={50}
          value={currentSettings.maxTokens}
          onChange={(e) => updateProviderSettings({ maxTokens: parseInt(e.target.value) || 1024 })}
          className="w-full px-3 py-2 text-sm rounded-lg"
          style={inputStyle}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
      </div>

      {/* Test connection */}
      <div>
        <button
          onClick={handleTestConnection}
          disabled={testStatus === 'testing' || (!currentSettings.apiKey && config.requiresApiKey)}
          className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-brand-600 rounded-full hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {testStatus === 'testing' && <Loader2 size={14} className="animate-spin" />}
          {testStatus === 'success' && <Check size={14} />}
          {testStatus === 'error' && <X size={14} />}
          Test Connection
        </button>
        {testStatus === 'success' && (
          <p className="mt-2 text-sm" style={{ color: '#057642' }}>Connection successful!</p>
        )}
        {testStatus === 'error' && (
          <p className="mt-2 text-sm" style={{ color: '#cc1016' }}>{testError}</p>
        )}
      </div>
    </div>
  );
}
