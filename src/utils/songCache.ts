import type { Song } from "../types/music"

const CACHE_KEY = "nekotune-song-cache"
const MAX_CACHE_SIZE = 500

let cache: Map<string, Song> = new Map()

function loadCache(): Map<string, Song> {
  if (cache.size > 0) return cache
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) {
      const entries: [string, Song][] = JSON.parse(raw)
      cache = new Map(entries)
    }
  } catch {
    cache = new Map()
  }
  return cache
}

function saveCache() {
  const entries = Array.from(cache.entries())
  if (entries.length > MAX_CACHE_SIZE) {
    const trimmed = entries.slice(entries.length - MAX_CACHE_SIZE)
    cache = new Map(trimmed)
  }
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(Array.from(cache.entries())))
  } catch {}
}

export function cacheSong(song: Song) {
  loadCache()
  cache.set(song.videoId, song)
  saveCache()
}

export function getCachedSong(videoId: string): Song | undefined {
  loadCache()
  return cache.get(videoId)
}

export function getCachedSongs(videoIds: string[]): Song[] {
  loadCache()
  return videoIds.map((id) => cache.get(id)).filter((s): s is Song => s !== undefined)
}
