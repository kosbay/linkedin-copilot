import type { GenerateRequest } from '@/types/ai';
import type { StreamMessage } from '@/types/messages';
import { createProvider } from '../providers/base';
import { checkUsageLimit, incrementUsage, DAILY_GENERATION_LIMIT } from '@/lib/storage';

export async function handleGenerate(
  port: chrome.runtime.Port,
  request: GenerateRequest,
): Promise<void> {
  try {
    // Free proxy users (no license key) get a daily limit
    const isFreeProxy = request.providerId === 'proxy' && !request.apiKey;

    if (isFreeProxy) {
      const { allowed } = await checkUsageLimit();
      if (!allowed) {
        const msg: StreamMessage = {
          type: 'STREAM_ERROR',
          error: `__LIMIT_REACHED__You've used all ${DAILY_GENERATION_LIMIT} free generations for today. Upgrade to Pro for unlimited access.`,
        };
        port.postMessage(msg);
        return;
      }
    }

    const provider = createProvider(request.providerId);
    const { url, init } = provider.buildRequest(request);

    const response = await fetch(url, init);

    if (!response.ok) {
      const errorBody = await response.text();
      const msg: StreamMessage = {
        type: 'STREAM_ERROR',
        error: `API error ${response.status}: ${errorBody}`,
      };
      port.postMessage(msg);
      return;
    }

    if (!response.body) {
      const msg: StreamMessage = {
        type: 'STREAM_ERROR',
        error: 'No response body received',
      };
      port.postMessage(msg);
      return;
    }

    for await (const chunk of provider.parseStream(response)) {
      if (chunk.type === 'text') {
        const msg: StreamMessage = { type: 'STREAM_CHUNK', content: chunk.content };
        port.postMessage(msg);
      } else if (chunk.type === 'error') {
        const msg: StreamMessage = { type: 'STREAM_ERROR', error: chunk.content };
        port.postMessage(msg);
        return;
      }
    }

    if (isFreeProxy) await incrementUsage();
    const doneMsg: StreamMessage = { type: 'STREAM_DONE' };
    port.postMessage(doneMsg);
  } catch (err) {
    const msg: StreamMessage = {
      type: 'STREAM_ERROR',
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
    port.postMessage(msg);
  }
}
