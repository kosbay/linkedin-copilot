import type { ProviderId, FeatureType } from './ai';

export interface TonePreset {
  id: string;
  name: string;
  prompt: string;
  isBuiltIn: boolean;
}

export interface ProviderSettings {
  apiKey: string;
  selectedModel: string;
  temperature: number;
  maxTokens: number;
}

export interface SyncStorageSchema {
  activeProvider: ProviderId;
  activeToneId: string;
  customInstructions: string;
  features: Record<FeatureType, { enabled: boolean }>;
  tonePresets: TonePreset[];
}

export interface LocalStorageSchema {
  providers: Record<ProviderId, ProviderSettings>;
  history: GenerationHistoryEntry[];
}

export interface GenerationHistoryEntry {
  id: string;
  feature: FeatureType;
  provider: ProviderId;
  model: string;
  userPrompt: string;
  generatedText: string;
  timestamp: number;
}
