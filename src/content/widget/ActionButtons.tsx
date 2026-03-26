import React, { useState } from 'react';
import { ClipboardCopy, CornerDownLeft, RefreshCw } from 'lucide-react';

interface ActionButtonsProps {
  onInsert: () => void;
  onCopy: () => void;
  onRegenerate: () => void;
  disabled?: boolean;
}

export function ActionButtons({ onInsert, onCopy, onRegenerate, disabled }: ActionButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={onInsert}
        disabled={disabled}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-brand-600 rounded-full hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <CornerDownLeft size={15} />
        Insert
      </button>
      <button
        onClick={handleCopy}
        disabled={disabled}
        className="flex items-center justify-center gap-2 px-4 py-2 font-semibold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          color: '#0a66c2',
          border: '1px solid #0a66c2',
          background: 'transparent',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(112,181,249,0.15)';
          e.currentTarget.style.borderWidth = '2px';
          e.currentTarget.style.padding = '7px 15px';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderWidth = '1px';
          e.currentTarget.style.padding = '8px 16px';
        }}
      >
        <ClipboardCopy size={15} />
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <button
        onClick={onRegenerate}
        disabled={disabled}
        className="flex items-center justify-center px-3 py-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          color: 'rgba(0,0,0,0.6)',
          background: 'transparent',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.08)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        title="Regenerate"
      >
        <RefreshCw size={15} />
      </button>
    </div>
  );
}
