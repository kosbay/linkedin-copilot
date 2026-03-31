import type { GenerateRequest, StreamChunk } from '@/types/ai';
import type { AIProviderAdapter } from './base';
import { parseSSEStream } from '@/lib/sse-parser';
import { PROVIDER_CONFIGS } from '@/constants/providers';

export class ProxyProvider implements AIProviderAdapter {
  readonly id = 'proxy' as const;

  buildRequest(req: GenerateRequest): { url: string; init: RequestInit } {
    const baseUrl = PROVIDER_CONFIGS.proxy.baseUrl;

    return {
      url: `${baseUrl}/api/generate`,
      init: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${req.apiKey}`,
        },
        body: JSON.stringify({
          model: req.model,
          system: req.systemPrompt,
          messages: [{ role: 'user', content: req.userPrompt }],
          max_tokens: req.maxTokens ?? 1024,
          temperature: req.temperature ?? 0.7,
        }),
      },
    };
  }

  async *parseStream(response: Response): AsyncGenerator<StreamChunk> {
    // The proxy forwards Anthropic's SSE stream directly, so we parse the same format
    if (!response.body) {
      yield { type: 'error', content: 'No response body' };
      return;
    }

    for await (const event of parseSSEStream(response.body)) {
      if (event.event === 'message_stop') {
        yield { type: 'done', content: '' };
        return;
      }

      if (event.event === 'content_block_delta') {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.delta?.type === 'text_delta' && parsed.delta.text) {
            yield { type: 'text', content: parsed.delta.text };
          }
        } catch {
          // Skip unparseable events
        }
      }

      if (event.event === 'error') {
        try {
          const parsed = JSON.parse(event.data);
          yield { type: 'error', content: parsed.error?.message ?? 'Unknown API error' };
          return;
        } catch {
          yield { type: 'error', content: 'Unknown API error' };
          return;
        }
      }
    }

    yield { type: 'done', content: '' };
  }
}
