export type ThemeMode = "dark" | "light" | "pure-black"

export interface AppSettings {
  theme: ThemeMode
  accentColor: string
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
}
