export const APP_NAME = "NekoTune"
export const APP_VERSION = "0.1.0"

export const WINDOW = {
  WIDTH: 800,
  HEIGHT: 600,
  TITLEBAR_HEIGHT: 32,
  SIDEBAR_WIDTH: 180,
  PLAYER_HEIGHT: 72,
}

export const QUALITY_OPTIONS = {
  low: { itag: 140, bitrate: 50000 },
  medium: { itag: 140, bitrate: 128000 },
  high: { itag: 251, bitrate: 256000 },
} as const

export const EQUALIZER_BANDS = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000]
