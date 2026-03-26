export type ProviderId = 'openai' | 'anthropic' | 'groq' | 'proxy';

export interface ModelOption {
  id: string;
  name: string;
  maxTokens: number;
}

export interface ProviderConfig {
  id: ProviderId;
  name: string;
  baseUrl: string;
  models: ModelOption[];
  defaultModel: string;
  requiresApiKey: boolean;
}

export type FeatureType = 'comment' | 'cold-dm' | 'post';

export interface GenerateRequest {
  feature: FeatureType;
  providerId: ProviderId;
  model: string;
  apiKey: string;
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface StreamChunk {
  type: 'text' | 'error' | 'done';
  content: string;
}

export interface SSEEvent {
  event?: string;
  data: string;
  id?: string;
}
