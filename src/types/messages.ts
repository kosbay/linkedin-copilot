import type { GenerateRequest } from './ai';
import type { SyncStorageSchema, LocalStorageSchema, LinkedInProfile } from './storage';

export type RequestMessage =
  | { type: 'GENERATE_START'; payload: GenerateRequest }
  | { type: 'GENERATE_CANCEL'; payload: { requestId: string } }
  | { type: 'GET_SETTINGS' }
  | { type: 'PING' }
  | { type: 'SCRAPE_PROFILE' };

export type ResponseMessage =
  | { type: 'SETTINGS'; payload: SyncStorageSchema & LocalStorageSchema }
  | { type: 'PONG' }
  | { type: 'ERROR'; payload: { message: string } }
  | { type: 'PROFILE_SCRAPED'; payload: { profile: LinkedInProfile } };

export type StreamMessage =
  | { type: 'STREAM_CHUNK'; content: string }
  | { type: 'STREAM_ERROR'; error: string }
  | { type: 'STREAM_DONE' };
