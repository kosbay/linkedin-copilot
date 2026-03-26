import type { GenerateRequest, StreamChunk } from '@/types/ai';
import type { AIProviderAdapter } from './base';

export class ProxyProvider implements AIProviderAdapter {
  readonly id = 'proxy' as const;

  buildRequest(_req: GenerateRequest): { url: string; init: RequestInit } {
    // Placeholder - will be implemented when backend is ready
    return {
      url: 'https://api.linkedincopilot.com/v1/generate',
      init: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      },
    };
  }

  async *parseStream(_response: Response): AsyncGenerator<StreamChunk> {
    yield {
      type: 'error',
      content: 'Pro mode is not yet available. Please configure your own API key in settings.',
    };
  }
}
