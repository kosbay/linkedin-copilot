import React from 'react';
import type { TonePreset } from '@/types/storage';

interface ToneSelectorProps {
  tones: TonePreset[];
  selectedId: string;
  onChange: (id: string) => void;
}

export function ToneSelector({ tones, selectedId, onChange }: ToneSelectorProps) {
  return (
    <select
      value={selectedId}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 text-sm rounded-lg bg-white transition-colors"
      style={{
        border: '1px solid rgba(0,0,0,0.3)',
        color: 'rgba(0,0,0,0.9)',
        outline: 'none',
      }}
      onFocus={(e) => {
        e.currentTarget.style.border = '1px solid #0a66c2';
        e.currentTarget.style.boxShadow = '0 0 0 1px #0a66c2';
      }}
      onBlur={(e) => {
        e.currentTarget.style.border = '1px solid rgba(0,0,0,0.3)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {tones.map((tone) => (
        <option key={tone.id} value={tone.id}>
          {tone.name}
        </option>
      ))}
    </select>
  );
}
