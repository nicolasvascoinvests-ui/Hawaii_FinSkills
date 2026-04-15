import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Copy mobile/.env.example to mobile/.env and fill in the values from the Supabase dashboard.'
  );
}

// Android SecureStore enforces a 2048-byte limit per value. Supabase
// JWT sessions regularly exceed this after refresh rotation. Chunk
// long values across `${key}.N` entries and track the count in the
// primary key so reads reassemble transparently.
const CHUNK_SIZE = 1800;
const COUNT_PREFIX = '__chunks__:';

async function chunkedGet(key: string): Promise<string | null> {
  const head = await SecureStore.getItemAsync(key);
  if (head === null) return null;
  if (!head.startsWith(COUNT_PREFIX)) return head;
  const count = parseInt(head.slice(COUNT_PREFIX.length), 10);
  if (!Number.isFinite(count) || count <= 0) return null;
  const parts: string[] = [];
  for (let i = 0; i < count; i++) {
    const part = await SecureStore.getItemAsync(`${key}.${i}`);
    if (part === null) return null;
    parts.push(part);
  }
  return parts.join('');
}

async function chunkedSet(key: string, value: string): Promise<void> {
  // Clear any stale chunks from a previous (larger) value.
  const prev = await SecureStore.getItemAsync(key);
  if (prev && prev.startsWith(COUNT_PREFIX)) {
    const prevCount = parseInt(prev.slice(COUNT_PREFIX.length), 10);
    if (Number.isFinite(prevCount)) {
      for (let i = 0; i < prevCount; i++) {
        await SecureStore.deleteItemAsync(`${key}.${i}`);
      }
    }
  }
  if (value.length <= CHUNK_SIZE) {
    await SecureStore.setItemAsync(key, value);
    return;
  }
  const chunks: string[] = [];
  for (let i = 0; i < value.length; i += CHUNK_SIZE) {
    chunks.push(value.slice(i, i + CHUNK_SIZE));
  }
  for (let i = 0; i < chunks.length; i++) {
    await SecureStore.setItemAsync(`${key}.${i}`, chunks[i]);
  }
  await SecureStore.setItemAsync(key, `${COUNT_PREFIX}${chunks.length}`);
}

async function chunkedRemove(key: string): Promise<void> {
  const head = await SecureStore.getItemAsync(key);
  if (head && head.startsWith(COUNT_PREFIX)) {
    const count = parseInt(head.slice(COUNT_PREFIX.length), 10);
    if (Number.isFinite(count)) {
      for (let i = 0; i < count; i++) {
        await SecureStore.deleteItemAsync(`${key}.${i}`);
      }
    }
  }
  await SecureStore.deleteItemAsync(key);
}

const SecureStoreAdapter = {
  getItem: (key: string) => chunkedGet(key),
  setItem: (key: string, value: string) => chunkedSet(key, value),
  removeItem: (key: string) => chunkedRemove(key),
};

const storage = Platform.OS === 'web' ? AsyncStorage : SecureStoreAdapter;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
