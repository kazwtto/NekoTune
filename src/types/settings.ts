export type ThemeMode = "dark" | "light" | "pure-black"

export type CacheAudioFormat = "mp3" | "flac" | "ogg" | "wav"
export type CacheAudioQuality = "low" | "medium" | "high" | "best"
export type CacheImageFormat = "jpg" | "png" | "webp"
export type CacheImageQuality = "low" | "medium" | "high"

export interface AudioCacheSettings {
  enabled: boolean
  format: CacheAudioFormat
  quality: CacheAudioQuality
  maxEntries: number
  maxStorageMb: number
}

export interface ImageCacheSettings {
  enabled: boolean
  format: CacheImageFormat
  quality: CacheImageQuality
  maxEntries: number
  maxStorageMb: number
}

export interface PrefetchCacheSettings {
  enabled: boolean
  prefetchCount: number
  delayMs: number
}

export interface SongMetadataCacheSettings {
  enabled: boolean
  maxEntries: number
  ttlDays: number
}

export interface ListBufferSettings {
  enabled: boolean
  maxEntries: number
  ttlHomeFeed: number
  ttlExplore: number
  ttlPlaylist: number
  ttlAlbum: number
  ttlArtist: number
  ttlSearch: number
}

export interface AppSettings {
  theme: ThemeMode
  accentColor: string
  hideScrollbar: boolean
  language: string
  audioQuality: "low" | "medium" | "high"
  crossfade: number
  enableNormalization: boolean
  enableSkipSilence: boolean
  autoPlay: boolean
  autoSkipOnError: boolean
  musicFolder: string
  downloadFolder: string
  downloadFormat: "mp3" | "flac" | "ogg" | "wav"
  downloadQuality: "low" | "medium" | "high" | "best"
  audioCache: AudioCacheSettings
  imageCache: ImageCacheSettings
  prefetchCache: PrefetchCacheSettings
  songMetadataCache: SongMetadataCacheSettings
  listBuffer: ListBufferSettings
}
