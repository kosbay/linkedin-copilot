import type { RequestMessage, ResponseMessage } from '@/types/messages';
import { syncStorage, localStorage } from '@/lib/storage';

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

    default:
      return { type: 'ERROR', payload: { message: 'Unknown message type' } };
  }
}
