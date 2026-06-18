import type { Song, Album, Artist, Playlist } from "../types/music"

const STORAGE_KEY = "nekotune-song-cache"
const MAX_ENTRIES = 500
const TTL_MS = 7 * 24 * 60 * 60 * 1000

interface CacheEntry<T> {
  data: T
  cachedAt: number
}

type CacheableItem = Song | Album | Artist | Playlist

function getCacheKey(item: CacheableItem): string {
  if ("videoId" in item && (item as Song).videoId) return `song:${(item as Song).videoId}`
  if ("browseId" in item) {
    const browseId = (item as Album | Artist | Playlist).browseId
    if ("imageUrl" in item) return `artist:${browseId}`
    if ("songs" in item && "songCount" in item) return `album:${browseId}`
    return `playlist:${browseId}`
  }
  return `unknown:${JSON.stringify(item)}`
}

class SongMetadataCache {
  private cache = new Map<string, CacheEntry<CacheableItem>>()
  private loaded = false

  constructor() {
    this.loadFromStorage()
  }

  getSong(videoId: string): Song | null {
    const entry = this.cache.get(`song:${videoId}`)
    if (!entry || this.isExpired(entry)) {
      if (entry) this.cache.delete(`song:${videoId}`)
      return null
    }
    this.touch(`song:${videoId}`)
    return entry.data as Song
  }

  getAlbum(browseId: string): Album | null {
    const entry = this.cache.get(`album:${browseId}`)
    if (!entry || this.isExpired(entry)) {
      if (entry) this.cache.delete(`album:${browseId}`)
      return null
    }
    this.touch(`album:${browseId}`)
    return entry.data as Album
  }

  getArtist(browseId: string): Artist | null {
    const entry = this.cache.get(`artist:${browseId}`)
    if (!entry || this.isExpired(entry)) {
      if (entry) this.cache.delete(`artist:${browseId}`)
      return null
    }
    this.touch(`artist:${browseId}`)
    return entry.data as Artist
  }

  getPlaylist(browseId: string): Playlist | null {
    const entry = this.cache.get(`playlist:${browseId}`)
    if (!entry || this.isExpired(entry)) {
      if (entry) this.cache.delete(`playlist:${browseId}`)
      return null
    }
    this.touch(`playlist:${browseId}`)
    return entry.data as Playlist
  }

  getManySongs(videoIds: (string | undefined)[]): Song[] {
    return videoIds
      .map((id) => (id ? this.getSong(id) : null))
      .filter((s): s is Song => s !== null)
  }

  set(item: CacheableItem): void {
    const key = getCacheKey(item)
    this.touch(key)
    this.cache.set(key, { data: item, cachedAt: Date.now() })
    this.evict()
    this.saveToStorage()
  }

  setSong(song: Song): void {
    if (!song.videoId) return
    this.set(song)
  }

  setAlbum(album: Album): void {
    this.set(album)
  }

  setArtist(artist: Artist): void {
    this.set(artist)
  }

  setPlaylist(playlist: Playlist): void {
    this.set(playlist)
  }

  setBatchSongs(songs: Song[]): void {
    for (const song of songs) this.setSong(song)
  }

  setBatchAlbums(albums: Album[]): void {
    for (const album of albums) this.setAlbum(album)
  }

  setBatchArtists(artists: Artist[]): void {
    for (const artist of artists) this.setArtist(artist)
  }

  clear(): void {
    this.cache.clear()
    this.saveToStorage()
  }

  get stats() {
    const songs = [...this.cache.entries()].filter(([k]) => k.startsWith("song:")).length
    const albums = [...this.cache.entries()].filter(([k]) => k.startsWith("album:")).length
    const artists = [...this.cache.entries()].filter(([k]) => k.startsWith("artist:")).length
    const playlists = [...this.cache.entries()].filter(([k]) => k.startsWith("playlist:")).length
    return { total: this.cache.size, songs, albums, artists, playlists }
  }

  private isExpired(entry: CacheEntry<CacheableItem>): boolean {
    return Date.now() - entry.cachedAt > TTL_MS
  }

  private touch(key: string) {
    const entry = this.cache.get(key)
    if (entry) {
      this.cache.delete(key)
      this.cache.set(key, entry)
    }
  }

  private evict() {
    while (this.cache.size > MAX_ENTRIES) {
      const oldest = this.cache.keys().next().value
      if (oldest !== undefined) this.cache.delete(oldest)
    }
  }

  private loadFromStorage() {
    if (this.loaded) return
    this.loaded = true
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const entries: [string, CacheEntry<CacheableItem>][] = JSON.parse(raw)
        this.cache = new Map(entries)
        const now = Date.now()
        for (const [key, entry] of this.cache) {
          if (now - entry.cachedAt > TTL_MS) this.cache.delete(key)
        }
      }
    } catch {
      this.cache = new Map()
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(this.cache.entries())))
    } catch {}
  }
}

export const songMetadataCache = new SongMetadataCache()
