import type { ProviderId } from '@/types/ai';
import { OpenAIProvider } from './openai';

export class GroqProvider extends OpenAIProvider {
  readonly id: ProviderId = 'groq';

  protected get baseUrl(): string {
    return 'https://api.groq.com/openai/v1';
  }
}
