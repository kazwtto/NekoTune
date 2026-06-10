export type ThemeMode = "dark" | "light" | "pure-black"

export interface AppSettings {
  theme: ThemeMode
  accentColor: string
  language: string
  audioQuality: "low" | "medium" | "high"
  downloadPath: string
  crossfade: number
  enableNormalization: boolean
  enableSkipSilence: boolean
  enableDiscordRpc: boolean
  minimizeToTray: boolean
  autoPlay: boolean
  autoSkipOnError: boolean
  stopOnKill: boolean
  gridView: boolean
  gridCellSize: number
  disableScreenshot: boolean
}
