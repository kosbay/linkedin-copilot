import React from 'react';
import { Github, ExternalLink } from 'lucide-react';

export function AboutTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold" style={{ color: 'rgba(0,0,0,0.9)' }}>LinkedIn Copilot</h3>
        <p className="text-sm mt-1" style={{ color: 'rgba(0,0,0,0.6)' }}>Version 0.1.0</p>
      </div>

      <p className="text-sm" style={{ color: 'rgba(0,0,0,0.6)' }}>
        AI-powered LinkedIn assistant for generating comments, cold messages, and posts.
        Open source and privacy-first — your API keys never leave your device.
      </p>

      <div className="space-y-3">
        <a
          href="https://github.com/yourusername/linkedin-copilot"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-full transition-colors"
          style={{
            color: 'rgba(0,0,0,0.9)',
            border: '1px solid rgba(0,0,0,0.6)',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(0,0,0,0.08)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}
        >
          <Github size={16} />
          View on GitHub
          <ExternalLink size={12} className="ml-auto" style={{ color: 'rgba(0,0,0,0.4)' }} />
        </a>

        <button
          disabled
          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-brand-600 rounded-full opacity-50 cursor-not-allowed"
        >
          Upgrade to Pro — Coming Soon
        </button>
      </div>

      <div className="text-xs space-y-1" style={{ color: 'rgba(0,0,0,0.4)' }}>
        <p>Licensed under MIT</p>
        <p>Made with React, TypeScript, and Tailwind CSS</p>
      </div>
    </div>
  );
}
