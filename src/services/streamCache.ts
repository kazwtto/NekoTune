interface StreamCacheEntry {
  url: string
  duration: number
  expiresAt: number
}

class StreamCache {
  private cache = new Map<string, StreamCacheEntry>()
  private maxEntries = 20

  private hits = 0
  private misses = 0

  configure(maxEntries: number) {
    this.maxEntries = maxEntries
  }

  has(videoId: string): boolean {
    const entry = this.cache.get(videoId)
    if (!entry) return false
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(videoId)
      return false
    }
    return true
  }

  get(videoId: string): { url: string; duration: number } | null {
    const entry = this.cache.get(videoId)
    if (!entry) {
      this.misses++
      return null
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(videoId)
      this.misses++
      return null
    }

    this.hits++
    return { url: entry.url, duration: entry.duration }
  }

  set(videoId: string, url: string, duration: number, ttlMs: number) {
    if (this.cache.size >= this.maxEntries) {
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(videoId, {
      url,
      duration,
      expiresAt: Date.now() + ttlMs,
    })
  }

  clear() {
    this.cache.clear()
    this.hits = 0
    this.misses = 0
  }

  get stats() {
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses
    }
  }

  get size() {
    return this.cache.size
  }
}

export const streamCache = new StreamCache()
