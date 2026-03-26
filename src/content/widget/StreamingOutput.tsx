import React, { useRef, useEffect } from 'react';
import type { GenerateStatus } from '../hooks/useGenerate';

interface StreamingOutputProps {
  text: string;
  status: GenerateStatus;
  error: string | null;
}

export function StreamingOutput({ text, status, error }: StreamingOutputProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [text]);

  if (status === 'error') {
    return (
      <div
        className="lc-output p-3 rounded-lg"
        style={{ color: '#cc1016', background: '#fce9ea', border: '1px solid #f5c2c4' }}
      >
        {error ?? 'An error occurred'}
      </div>
    );
  }

  if (status === 'idle') return null;

  return (
    <div
      ref={containerRef}
      className="lc-output p-3 rounded-lg overflow-y-auto whitespace-pre-wrap"
      style={{
        maxHeight: 220,
        background: '#f3f2ef',
        border: '1px solid rgba(0,0,0,0.08)',
        color: 'rgba(0,0,0,0.9)',
      }}
    >
      {text}
      {status === 'generating' && (
        <span className="inline-block w-0.5 h-4 bg-brand-600 animate-blink ml-0.5 align-text-bottom" />
      )}
    </div>
  );
}
