import type { ProviderId, GenerateRequest, StreamChunk } from '@/types/ai';
import type { AIProviderAdapter } from './base';
import { parseSSEStream } from '@/lib/sse-parser';

export class OpenAIProvider implements AIProviderAdapter {
  readonly id: ProviderId = 'openai';

  protected get baseUrl(): string {
    return 'https://api.openai.com/v1';
  }

  buildRequest(req: GenerateRequest): { url: string; init: RequestInit } {
    return {
      url: `${this.baseUrl}/chat/completions`,
      init: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${req.apiKey}`,
        },
        body: JSON.stringify({
          model: req.model,
          messages: [
            { role: 'system', content: req.systemPrompt },
            { role: 'user', content: req.userPrompt },
          ],
          stream: true,
          max_tokens: req.maxTokens ?? 1024,
          temperature: req.temperature ?? 0.7,
        }),
      },
    };
  }

  async *parseStream(response: Response): AsyncGenerator<StreamChunk> {
    if (!response.body) {
      yield { type: 'error', content: 'No response body' };
      return;
    }

    for await (const event of parseSSEStream(response.body)) {
      if (event.data === '[DONE]') {
        yield { type: 'done', content: '' };
        return;
      }

      try {
        const parsed = JSON.parse(event.data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          yield { type: 'text', content };
        }
      } catch {
        // Skip unparseable events
      }
    }

    yield { type: 'done', content: '' };
  }
}
