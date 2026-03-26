import { useState, useCallback, useRef } from 'react';
import type { GenerateRequest } from '@/types/ai';
import type { StreamMessage } from '@/types/messages';

export type GenerateStatus = 'idle' | 'generating' | 'complete' | 'error';

export function useGenerate() {
  const [status, setStatus] = useState<GenerateStatus>('idle');
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const portRef = useRef<chrome.runtime.Port | null>(null);

  const generate = useCallback((request: GenerateRequest) => {
    setStatus('generating');
    setText('');
    setError(null);

    const port = chrome.runtime.connect({
      name: `generate-${crypto.randomUUID()}`,
    });
    portRef.current = port;

    port.onMessage.addListener((msg: StreamMessage) => {
      switch (msg.type) {
        case 'STREAM_CHUNK':
          setText((prev) => prev + msg.content);
          break;
        case 'STREAM_DONE':
          setStatus('complete');
          port.disconnect();
          break;
        case 'STREAM_ERROR':
          setError(msg.error);
          setStatus('error');
          port.disconnect();
          break;
      }
    });

    port.onDisconnect.addListener(() => {
      if (chrome.runtime.lastError) {
        setError(chrome.runtime.lastError.message ?? 'Connection lost');
        setStatus('error');
      }
    });

    port.postMessage({ type: 'GENERATE_START', payload: request });
  }, []);

  const cancel = useCallback(() => {
    portRef.current?.disconnect();
    portRef.current = null;
    setStatus('idle');
  }, []);

  const reset = useCallback(() => {
    portRef.current?.disconnect();
    portRef.current = null;
    setStatus('idle');
    setText('');
    setError(null);
  }, []);

  return { status, text, error, generate, cancel, reset };
}
