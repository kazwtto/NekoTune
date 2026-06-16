export type ThemeMode = "dark" | "light" | "pure-black"

export interface StreamCacheSettings {
  enabled: boolean
  ttlMinutes: number
  maxEntries: number
}

export interface PrefetchCacheSettings {
  enabled: boolean
  prefetchCount: number
  delayMs: number
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
  streamCache: StreamCacheSettings
  prefetchCache: PrefetchCacheSettings
}

