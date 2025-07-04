
interface CacheEntry<T> {
  value: T;
  expiry: number;
}

const cache = new Map<string, CacheEntry<any>>();

// Cache Time-To-Live in milliseconds. (5 minutes)
const CACHE_TTL_MS = 5 * 60 * 1000; 

/**
 * Retrieves an entry from the cache if it exists and has not expired.
 * @param key The key for the cache entry.
 * @returns The cached value or null if not found or expired.
 */
export function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) {
    return null;
  }

  // Check if the entry has expired
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }

  return entry.value as T;
}

/**
 * Adds or updates an entry in the cache with a specified TTL.
 * @param key The key for the cache entry.
 * @param value The value to cache.
 * @param ttl The time-to-live for the cache entry in milliseconds.
 */
export function setInCache<T>(key: string, value: T, ttl: number = CACHE_TTL_MS): void {
  const expiry = Date.now() + ttl;
  cache.set(key, { value, expiry });
}
