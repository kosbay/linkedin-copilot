import React, { useState, useEffect, useCallback } from 'react';
import { X, Sparkles, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import type { LinkedInInputType, LinkedInContext } from '@/types/linkedin';
import type { FeatureType, GenerateRequest } from '@/types/ai';
import type { SyncStorageSchema, LocalStorageSchema, LinkedInProfile } from '@/types/storage';
import { buildSystemPrompt, buildUserPrompt } from '@/constants/prompts';
import { syncStorage, localStorage, getUsage, DAILY_GENERATION_LIMIT } from '@/lib/storage';
import type { useGenerate } from '../hooks/useGenerate';
import { insertText } from '../text-inserter';
import { StreamingOutput } from './StreamingOutput';
import { ActionButtons } from './ActionButtons';

interface WidgetPanelProps {
  inputElement: HTMLElement;
  inputType: LinkedInInputType;
  getContext: () => LinkedInContext | null;
  generation: ReturnType<typeof useGenerate>;
  onClose: () => void;
}

const INPUT_TYPE_TO_FEATURE: Record<string, FeatureType> = {
  comment: 'comment',
  message: 'cold-dm',
  post: 'post',
  unknown: 'comment',
};

const FEATURE_LABEL: Record<FeatureType, string> = {
  comment: 'Comment',
  'cold-dm': 'Message',
  post: 'Post',
};

export function WidgetPanel({ inputElement, inputType, getContext, generation, onClose }: WidgetPanelProps) {
  const feature = INPUT_TYPE_TO_FEATURE[inputType] ?? 'comment';
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [settings, setSettings] = useState<(SyncStorageSchema & { providers: LocalStorageSchema['providers'] }) | null>(null);
  const [tonePrompt, setTonePrompt] = useState('');
  const [userProfile, setUserProfile] = useState<LinkedInProfile | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [showDirection, setShowDirection] = useState(feature === 'post');
  const [remaining, setRemaining] = useState<number>(DAILY_GENERATION_LIMIT);
  const { status, text, error, generate, reset } = generation;

  // Load settings on mount and keep in sync with storage changes
  useEffect(() => {
    setSettingsError(null);

    const loadSettings = () => {
      Promise.all([syncStorage.getAll(), localStorage.getAll(), getUsage()])
        .then(([sync, local, usage]) => {
          const tone = sync.tonePresets.find((t) => t.id === sync.activeToneId);
          setTonePrompt(tone?.prompt ?? '');
          setUserProfile(local.userProfile ?? null);
          setSettings({ ...sync, providers: local.providers });
          setRemaining(Math.max(0, DAILY_GENERATION_LIMIT - usage.dailyCount));
        })
        .catch((err) => {
          setSettingsError(err?.message ?? 'Failed to load settings');
        });
    };

    loadSettings();

    const unsubSync = syncStorage.onChange(() => loadSettings());
    const unsubLocal = localStorage.onChange(() => loadSettings());
    return () => { unsubSync(); unsubLocal(); };
  }, []);

  const handleGenerate = useCallback(() => {
    if (!settings) return;

    const context = getContext();
    if (!context) return;

    const providerSettings = settings.providers[settings.activeProvider];
    if (!providerSettings) return;

    const systemPrompt = buildSystemPrompt(
      feature,
      tonePrompt,
      settings.customInstructions,
      userProfile,
    );

    const userPrompt = buildUserPrompt(feature, {
      postText: context.postText,
      postAuthor: context.postAuthor,
      postAuthorHeadline: context.postAuthorHeadline,
      recipientName: context.recipientName,
      recipientHeadline: context.recipientHeadline,
      conversationHistory: context.conversationHistory,
      userPrompt: additionalPrompt || undefined,
    });

    const request: GenerateRequest = {
      feature,
      providerId: settings.activeProvider,
      model: providerSettings.selectedModel,
      apiKey: providerSettings.apiKey,
      systemPrompt,
      userPrompt,
      maxTokens: providerSettings.maxTokens,
      temperature: providerSettings.temperature,
    };

    generate(request);
  }, [settings, tonePrompt, feature, getContext, additionalPrompt, generate]);

  const handleInsert = useCallback(() => {
    if (text && inputElement) {
      insertText(inputElement, text);
      onClose();
    }
  }, [text, inputElement, onClose]);

  const handleCopy = useCallback(() => {
    if (text) {
      navigator.clipboard.writeText(text);
    }
  }, [text]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Stop all keyboard events from leaking to LinkedIn's editor behind us
      e.stopPropagation();

      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && (status === 'idle' || status === 'complete')) {
        handleGenerate();
      }
    },
    [onClose, handleGenerate, status],
  );

  const providerSettings = settings?.providers[settings.activeProvider];
  const noApiKey = settings && providerSettings && !providerSettings.apiKey && settings.activeProvider !== 'proxy';
  const canGenerate = !!settings && !noApiKey;

  return (
    <div
      className="lc-panel bg-white rounded-lg shadow-li-lg animate-scale-in"
      style={{ width: 420, border: '1px solid rgba(0,0,0,0.08)' }}
      onKeyDown={handleKeyDown}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-600">
            <Sparkles size={13} className="text-white" />
          </div>
          <span className="lc-title">LinkedIn Copilot</span>
          <span className="lc-subtitle px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,0,0,0.05)' }}>
            {FEATURE_LABEL[feature]}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-black/[0.08] transition-colors"
          style={{ color: 'rgba(0,0,0,0.6)' }}
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-4" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {settingsError && (
          <div
            className="p-3 rounded-lg"
            style={{ fontSize: 14, color: '#cc1016', background: '#fce9ea', border: '1px solid #f5c2c4' }}
          >
            {settingsError}
          </div>
        )}

        {noApiKey && (
          <div
            className="p-3 rounded-lg"
            style={{ fontSize: 14, color: '#915907', background: '#fef5e7', border: '1px solid #fce3b6' }}
          >
            No API key configured.
            <button
              onClick={() => chrome.runtime.openOptionsPage()}
              className="ml-1 underline hover:no-underline font-semibold"
            >
              Open Settings
            </button>
          </div>
        )}

        {/* Additional prompt - only show if no completed result yet */}
        {status !== 'complete' && (
          feature === 'post' ? (
            <textarea
              value={additionalPrompt}
              onChange={(e) => setAdditionalPrompt(e.target.value)}
              placeholder="What should the post be about?"
              rows={3}
              autoFocus
              className="w-full px-3 py-2 rounded-lg resize-none transition-colors"
              style={{
                border: '1px solid rgba(0,0,0,0.3)',
                outline: 'none',
                color: 'rgba(0,0,0,0.9)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.border = '1px solid #0a66c2';
                e.currentTarget.style.boxShadow = '0 0 0 1px #0a66c2';
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = '1px solid rgba(0,0,0,0.3)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          ) : (
            <div>
              <button
                type="button"
                onClick={() => setShowDirection(!showDirection)}
                className="flex items-center gap-1 py-1 transition-colors"
                style={{ color: 'rgba(0,0,0,0.6)', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                {showDirection ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                Add specific direction
              </button>
              {showDirection && (
                <textarea
                  value={additionalPrompt}
                  onChange={(e) => setAdditionalPrompt(e.target.value)}
                  placeholder="Any specific direction? (optional)"
                  rows={3}
                  autoFocus
                  className="w-full px-3 py-2 rounded-lg resize-none transition-colors"
                  style={{
                    marginTop: 6,
                    border: '1px solid rgba(0,0,0,0.3)',
                    outline: 'none',
                    color: 'rgba(0,0,0,0.9)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '1px solid #0a66c2';
                    e.currentTarget.style.boxShadow = '0 0 0 1px #0a66c2';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(0,0,0,0.3)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              )}
            </div>
          )
        )}

        {/* Generate button */}
        {(status === 'idle' || status === 'error') && (
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full flex items-center justify-center gap-2 px-5 py-2 font-semibold text-white bg-brand-600 rounded-full hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Sparkles size={16} />
            Generate
            {settings?.activeProvider === 'proxy' && !providerSettings?.apiKey && (
              <span
                className="ml-1 px-1.5 py-0.5 rounded text-white/70"
                style={{ fontSize: 11, background: 'rgba(255,255,255,0.2)' }}
              >
                {remaining}/{DAILY_GENERATION_LIMIT}
              </span>
            )}
            <kbd
              className="ml-1 px-1.5 py-0.5 rounded text-white/70"
              style={{ fontSize: 11, background: 'rgba(255,255,255,0.2)' }}
            >
              {'\u2318'}Enter
            </kbd>
          </button>
        )}

        {status === 'generating' && (
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 px-5 py-2 font-semibold rounded-full transition-colors"
            style={{
              color: 'rgba(0,0,0,0.6)',
              background: 'rgba(0,0,0,0.08)',
            }}
          >
            <Loader2 size={16} className="animate-spin" />
            Generating... Click to cancel
          </button>
        )}

        {/* Output */}
        <StreamingOutput text={text} status={status} error={error} />

        {/* Action buttons */}
        {status === 'complete' && text && (
          <ActionButtons
            onInsert={handleInsert}
            onCopy={handleCopy}
            onRegenerate={reset}
          />
        )}
      </div>
    </div>
  );
}
