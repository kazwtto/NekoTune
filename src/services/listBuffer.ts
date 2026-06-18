interface ListBufferEntry<T> {
  data: T
  cachedAt: number
}

type ListBufferKey =
  | "home-feed"
  | "explore"
  | `playlist:${string}`
  | `album:${string}`
  | `artist:${string}`
  | `browse:${string}`
  | `search:${string}`

class ListBuffer {
  private cache = new Map<string, ListBufferEntry<unknown>>()
  private maxEntries = 30
  private enabled = true
  private storageKey = "nekotune-list-buffer"

  private ttls: Record<string, number> = {
    "home-feed": 30 * 60 * 1000,
    "explore": 60 * 60 * 1000,
    "playlist": 2 * 60 * 60 * 1000,
    "album": 12 * 60 * 60 * 1000,
    "artist": 6 * 60 * 60 * 1000,
    "browse": 4 * 60 * 60 * 1000,
    "search": 15 * 60 * 1000,
  }

  constructor() {
    this.loadFromStorage()
  }

  configure(opts: { enabled?: boolean; maxEntries?: number }) {
    if (opts.enabled !== undefined) this.enabled = opts.enabled
    if (opts.maxEntries !== undefined) this.maxEntries = opts.maxEntries
  }

  get<T>(key: ListBufferKey): T | null {
    if (!this.enabled) return null
    const entry = this.cache.get(key) as ListBufferEntry<T> | undefined
    if (!entry) return null

    const ttl = this.getTtlForKey(key)
    if (Date.now() - entry.cachedAt > ttl) {
      this.cache.delete(key)
      this.saveToStorage()
      return null
    }

    this.touch(key)
    return entry.data
  }

  has(key: ListBufferKey): boolean {
    return this.get(key) !== null
  }

  set<T>(key: ListBufferKey, data: T): void {
    if (!this.enabled) return
    this.touch(key)
    this.cache.set(key, { data, cachedAt: Date.now() })
    this.evict()
    this.saveToStorage()
  }

  delete(key: ListBufferKey): void {
    this.cache.delete(key)
    this.saveToStorage()
  }

  clear(): void {
    this.cache.clear()
    this.saveToStorage()
  }

  clearType(type: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(type)) this.cache.delete(key)
    }
    this.saveToStorage()
  }

  get stats() {
    const byType: Record<string, number> = {}
    for (const key of this.cache.keys()) {
      const type = key.split(":")[0]
      byType[type] = (byType[type] || 0) + 1
    }
    return { total: this.cache.size, byType, enabled: this.enabled }
  }

  private getTtlForKey(key: string): number {
    const type = key.split(":")[0]
    return this.ttls[type] || 30 * 60 * 1000
  }

  private touch(key: string) {
    const entry = this.cache.get(key)
    if (entry) {
      this.cache.delete(key)
      this.cache.set(key, entry)
    }
  }

  private evict() {
    while (this.cache.size > this.maxEntries) {
      const oldest = this.cache.keys().next().value
      if (oldest !== undefined) this.cache.delete(oldest)
    }
  }

  private loadFromStorage() {
    try {
      const raw = localStorage.getItem(this.storageKey)
      if (raw) {
        const entries: [string, ListBufferEntry<unknown>][] = JSON.parse(raw)
        this.cache = new Map(entries)
        const now = Date.now()
        for (const [key, entry] of this.cache) {
          const ttl = this.getTtlForKey(key)
          if (now - entry.cachedAt > ttl) this.cache.delete(key)
        }
      }
    } catch {
      this.cache = new Map()
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(Array.from(this.cache.entries())))
    } catch {}
  }
}

export const listBuffer = new ListBuffer()
