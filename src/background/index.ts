import { handleMessage } from './router';
import { handleGenerate } from './handlers/generate';
import { initializeDefaults } from '@/lib/storage';
import type { RequestMessage } from '@/types/messages';

// Handle port connections for streaming generation
chrome.runtime.onConnect.addListener((port) => {
  if (port.name.startsWith('generate-')) {
    port.onMessage.addListener((msg: RequestMessage) => {
      if (msg.type === 'GENERATE_START') {
        handleGenerate(port, msg.payload);
      }
    });
  }
});

// Handle one-shot messages (settings, ping)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse);
  return true; // Keep channel open for async response
});

// Initialize defaults on first install
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await initializeDefaults();
    console.log('LinkedIn Copilot: defaults initialized');
  }
});

console.log('LinkedIn Copilot service worker loaded');
