import type { ProviderConfig } from '@/types/ai';

export const PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    requiresApiKey: true,
    defaultModel: 'gpt-4o-mini',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', maxTokens: 4096 },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', maxTokens: 4096 },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', maxTokens: 4096 },
    ],
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    requiresApiKey: true,
    defaultModel: 'claude-sonnet-4-20250514',
    models: [
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', maxTokens: 4096 },
      { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', maxTokens: 4096 },
    ],
  },
  groq: {
    id: 'groq',
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    requiresApiKey: true,
    defaultModel: 'llama-3.3-70b-versatile',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', maxTokens: 4096 },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', maxTokens: 4096 },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', maxTokens: 4096 },
    ],
  },
  proxy: {
    id: 'proxy',
    name: 'LinkedIn Copilot Pro',
    baseUrl: 'https://linkedin-copilot-gamma.vercel.app',
    requiresApiKey: false,
    defaultModel: 'claude-sonnet-4-20250514',
    models: [
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4 (Pro)', maxTokens: 4096 },
    ],
  },
};
