import type { RequestMessage, ResponseMessage } from '@/types/messages';

export function sendMessage(message: RequestMessage): Promise<ResponseMessage> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response: ResponseMessage) => {
      resolve(response);
    });
  });
}

export function openStreamPort(name: string): chrome.runtime.Port {
  return chrome.runtime.connect({ name });
}
