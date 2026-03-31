import type { RequestMessage, ResponseMessage } from '@/types/messages';
import { syncStorage, localStorage } from '@/lib/storage';
import { handleScrapeProfile } from './handlers/scrape-profile';

export async function handleMessage(
  message: RequestMessage,
  _sender: chrome.runtime.MessageSender,
): Promise<ResponseMessage> {
  switch (message.type) {
    case 'GET_SETTINGS': {
      const [sync, local] = await Promise.all([
        syncStorage.getAll(),
        localStorage.getAll(),
      ]);
      return { type: 'SETTINGS', payload: { ...sync, ...local } };
    }

    case 'PING':
      return { type: 'PONG' };

    case 'SCRAPE_PROFILE': {
      try {
        const profile = await handleScrapeProfile();
        return { type: 'PROFILE_SCRAPED', payload: { profile } };
      } catch (err) {
        return { type: 'ERROR', payload: { message: err instanceof Error ? err.message : 'Profile scraping failed' } };
      }
    }

    default:
      return { type: 'ERROR', payload: { message: 'Unknown message type' } };
  }
}
