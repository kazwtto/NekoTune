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
}
