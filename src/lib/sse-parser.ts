import type { SSEEvent } from '@/types/ai';

export async function* parseSSEStream(
  stream: ReadableStream<Uint8Array>,
): AsyncGenerator<SSEEvent> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      let currentEvent: Partial<SSEEvent> = {};

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          currentEvent.event = line.slice(7).trim();
        } else if (line.startsWith('data: ')) {
          currentEvent.data = (currentEvent.data ?? '') + line.slice(6);
        } else if (line.startsWith('id: ')) {
          currentEvent.id = line.slice(4).trim();
        } else if (line === '') {
          if (currentEvent.data !== undefined) {
            yield currentEvent as SSEEvent;
          }
          currentEvent = {};
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
