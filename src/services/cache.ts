interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class CacheService {
  private store = new Map<string, CacheEntry<unknown>>()
  private defaultTtl = 5 * 60 * 1000

  get<T>(key: string): T | null {
    const entry = this.store.get(key)
    if (!entry) return null
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.store.delete(key)
      return null
    }
    return entry.data as T
  }

  set<T>(key: string, data: T, ttl?: number): void {
    this.store.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTtl,
    })
  }

  clear(): void {
    this.store.clear()
  }

  get size(): number {
    return this.store.size
  }
}

export const cacheService = new CacheService()
