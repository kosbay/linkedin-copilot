import type { ProviderId, GenerateRequest, StreamChunk } from '@/types/ai';
import { OpenAIProvider } from './openai';
import { AnthropicProvider } from './anthropic';
import { GroqProvider } from './groq';
import { ProxyProvider } from './proxy';

export interface AIProviderAdapter {
  readonly id: ProviderId;
  buildRequest(req: GenerateRequest): { url: string; init: RequestInit };
  parseStream(response: Response): AsyncGenerator<StreamChunk>;
}

export function createProvider(id: ProviderId): AIProviderAdapter {
  switch (id) {
    case 'openai':
      return new OpenAIProvider();
    case 'anthropic':
      return new AnthropicProvider();
    case 'groq':
      return new GroqProvider();
    case 'proxy':
      return new ProxyProvider();
  }
}
