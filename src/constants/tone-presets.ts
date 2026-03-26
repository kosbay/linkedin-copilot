import type { TonePreset } from '@/types/storage';

export const DEFAULT_TONE_PRESETS: TonePreset[] = [
  {
    id: 'professional',
    name: 'Professional',
    prompt: 'Write in a professional, polished tone. Use clear, direct language appropriate for business communication.',
    isBuiltIn: true,
  },
  {
    id: 'casual',
    name: 'Casual',
    prompt: 'Write in a relaxed, conversational tone. Be friendly and approachable, as if talking to a colleague.',
    isBuiltIn: true,
  },
  {
    id: 'witty',
    name: 'Witty',
    prompt: 'Write with clever humor and wit. Be engaging and memorable while still being respectful.',
    isBuiltIn: true,
  },
  {
    id: 'friendly',
    name: 'Friendly',
    prompt: 'Write in a warm, encouraging tone. Be supportive and positive.',
    isBuiltIn: true,
  },
  {
    id: 'authoritative',
    name: 'Authoritative',
    prompt: 'Write with confidence and expertise. Use data-driven language and demonstrate deep knowledge.',
    isBuiltIn: true,
  },
];
