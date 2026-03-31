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

export interface LinkedInProfile {
  profileUrl: string;
  name: string;
  headline: string;
  location?: string;
  about?: string;
  experience: Array<{
    title: string;
    company: string;
    duration?: string;
  }>;
  education: Array<{
    school: string;
    degree?: string;
    years?: string;
  }>;
  skills: string[];
  scrapedAt: number;
}

export interface SyncStorageSchema {
  activeProvider: ProviderId;
  activeToneId: string;
  customInstructions: string;
  features: Record<FeatureType, { enabled: boolean }>;
  tonePresets: TonePreset[];
}

export interface UsageData {
  dailyCount: number;
  lastResetDate: string; // YYYY-MM-DD
}

export interface LocalStorageSchema {
  providers: Record<ProviderId, ProviderSettings>;
  history: GenerationHistoryEntry[];
  userProfile: LinkedInProfile | null;
  usage: UsageData;
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
