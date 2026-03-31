import type { SyncStorageSchema, LocalStorageSchema, UsageData } from '@/types/storage';
import { DEFAULT_TONE_PRESETS } from '@/constants/tone-presets';
import { PROVIDER_CONFIGS } from '@/constants/providers';
import type { ProviderId } from '@/types/ai';

export const DAILY_GENERATION_LIMIT = 10;

const SYNC_DEFAULTS: SyncStorageSchema = {
  activeProvider: 'proxy',
  activeToneId: 'professional',
  customInstructions: '',
  features: {
    comment: { enabled: true },
    'cold-dm': { enabled: true },
    post: { enabled: true },
  },
  tonePresets: DEFAULT_TONE_PRESETS,
};

const LOCAL_DEFAULTS: LocalStorageSchema = {
  providers: Object.fromEntries(
    Object.keys(PROVIDER_CONFIGS).map((id) => [
      id,
      {
        apiKey: '',
        selectedModel: PROVIDER_CONFIGS[id].defaultModel,
        temperature: 0.7,
        maxTokens: 1024,
      },
    ]),
  ) as Record<ProviderId, LocalStorageSchema['providers'][ProviderId]>,
  history: [],
  userProfile: null,
  usage: { dailyCount: 0, lastResetDate: '' },
};

export const syncStorage = {
  async get<K extends keyof SyncStorageSchema>(key: K): Promise<SyncStorageSchema[K]> {
    const result = await chrome.storage.sync.get(key);
    return (result[key] as SyncStorageSchema[K]) ?? SYNC_DEFAULTS[key];
  },

  async set<K extends keyof SyncStorageSchema>(key: K, value: SyncStorageSchema[K]): Promise<void> {
    await chrome.storage.sync.set({ [key]: value });
  },

  async getAll(): Promise<SyncStorageSchema> {
    const result = await chrome.storage.sync.get(null);
    return { ...SYNC_DEFAULTS, ...result } as SyncStorageSchema;
  },

  onChange(callback: (changes: Partial<SyncStorageSchema>) => void): () => void {
    const listener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      area: string,
    ) => {
      if (area !== 'sync') return;
      const parsed: Partial<SyncStorageSchema> = {};
      for (const [key, change] of Object.entries(changes)) {
        (parsed as Record<string, unknown>)[key] = change.newValue;
      }
      callback(parsed);
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  },
};

export const localStorage = {
  async get<K extends keyof LocalStorageSchema>(key: K): Promise<LocalStorageSchema[K]> {
    const result = await chrome.storage.local.get(key);
    return (result[key] as LocalStorageSchema[K]) ?? LOCAL_DEFAULTS[key];
  },

  async set<K extends keyof LocalStorageSchema>(
    key: K,
    value: LocalStorageSchema[K],
  ): Promise<void> {
    await chrome.storage.local.set({ [key]: value });
  },

  async getAll(): Promise<LocalStorageSchema> {
    const result = await chrome.storage.local.get(null);
    return { ...LOCAL_DEFAULTS, ...result } as LocalStorageSchema;
  },

  onChange(callback: (changes: Partial<LocalStorageSchema>) => void): () => void {
    const listener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      area: string,
    ) => {
      if (area !== 'local') return;
      const parsed: Partial<LocalStorageSchema> = {};
      for (const [key, change] of Object.entries(changes)) {
        (parsed as Record<string, unknown>)[key] = change.newValue;
      }
      callback(parsed);
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  },
};

export async function initializeDefaults(): Promise<void> {
  const existing = await chrome.storage.sync.get(null);
  if (!existing.activeProvider) {
    await chrome.storage.sync.set(SYNC_DEFAULTS);
  }
  const local = await chrome.storage.local.get(null);
  if (!local.providers) {
    await chrome.storage.local.set(LOCAL_DEFAULTS);
  }
}

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getUsage(): Promise<UsageData> {
  const usage = await localStorage.get('usage');
  const today = getTodayDate();
  if (usage.lastResetDate !== today) {
    return { dailyCount: 0, lastResetDate: today };
  }
  return usage;
}

export async function checkUsageLimit(): Promise<{ allowed: boolean; remaining: number }> {
  const usage = await getUsage();
  const remaining = Math.max(0, DAILY_GENERATION_LIMIT - usage.dailyCount);
  return { allowed: remaining > 0, remaining };
}

export async function incrementUsage(): Promise<void> {
  const usage = await getUsage();
  await localStorage.set('usage', {
    dailyCount: usage.dailyCount + 1,
    lastResetDate: getTodayDate(),
  });
}
