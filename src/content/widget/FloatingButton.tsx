import React from 'react';
import { Sparkles } from 'lucide-react';

interface FloatingButtonProps {
  onClick: () => void;
  hasResult?: boolean;
}

export function FloatingButton({ onClick, hasResult }: FloatingButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="relative flex items-center justify-center w-8 h-8 rounded-full bg-brand-600 text-white shadow-li hover:bg-brand-700 hover:shadow-li-lg transition-all duration-150 animate-scale-in"
      style={{ cursor: 'pointer' }}
      title="LinkedIn Copilot"
    >
      <Sparkles size={15} />
      {hasResult && (
        <span
          className="absolute bg-green-500 rounded-full border-2 border-white"
          style={{ width: 9, height: 9, top: -2, right: -2 }}
        />
      )}
    </button>
  );
}
