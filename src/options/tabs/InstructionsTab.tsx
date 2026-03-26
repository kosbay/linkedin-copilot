import React, { useState, useEffect } from 'react';
import { syncStorage } from '@/lib/storage';

export function InstructionsTab() {
  const [instructions, setInstructions] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    syncStorage.get('customInstructions').then(setInstructions);
  }, []);

  const handleSave = () => {
    syncStorage.set('customInstructions', instructions);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-1" style={{ color: 'rgba(0,0,0,0.9)' }}>
          Custom Instructions
        </label>
        <p className="text-xs mb-3" style={{ color: 'rgba(0,0,0,0.6)' }}>
          These instructions are added to every generation. Use this to define your writing
          style, role, or any context about yourself. For example: "I'm a software engineer.
          Keep comments technical and concise."
        </p>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="e.g., I'm a product manager at a fintech startup. I prefer a conversational but knowledgeable tone. Never use corporate jargon."
          rows={8}
          className="w-full px-3 py-2 text-sm rounded-lg resize-y"
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
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs" style={{ color: 'rgba(0,0,0,0.4)' }}>
            {instructions.length} characters
          </span>
          <button
            onClick={handleSave}
            className="px-5 py-1.5 text-sm font-semibold text-white bg-brand-600 rounded-full hover:bg-brand-700 transition-colors"
          >
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
