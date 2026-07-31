import "server-only";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

/**
 * Process-local cache with a TTL. Good enough for smoothing out bursts of
 * "get services" reads between the periodic database sync (source of
 * truth) and this process restarting — it is NOT a substitute for the
 * `services` table, which is what customer-facing pages actually read.
 */
export function getCached<T>(key: string): T | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value as T;
}

export function setCached<T>(key: string, value: T, ttlMs: number): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}
