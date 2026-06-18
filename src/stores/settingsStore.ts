import { create } from "zustand"
import type { AppSettings } from "../types/settings"
import { getItem, setItem } from "../utils/storage"

const STORAGE_KEY = "nekotune-settings"

const defaultSettings: AppSettings = {
  theme: "dark",
  accentColor: "#c6a0f6",
  hideScrollbar: true,
  language: "en-US",
  audioQuality: "medium",
  crossfade: 3,
  enableNormalization: true,
  enableSkipSilence: false,
  autoPlay: false,
  autoSkipOnError: true,
  musicFolder: "",
  downloadFolder: "",
  downloadFormat: "mp3",
  downloadQuality: "high",
  audioCache: {
    enabled: true,
    format: "mp3",
    quality: "high",
    maxEntries: 50,
    maxStorageMb: 500,
  },
  imageCache: {
    enabled: true,
    format: "jpg",
    quality: "high",
    maxEntries: 200,
    maxStorageMb: 100,
  },
  prefetchCache: {
    enabled: true,
    prefetchCount: 2,
    delayMs: 2000,
  },
  songMetadataCache: {
    enabled: true,
    maxEntries: 500,
    ttlDays: 7,
  },
  listBuffer: {
    enabled: true,
    maxEntries: 30,
    ttlHomeFeed: 30,
    ttlExplore: 60,
    ttlPlaylist: 120,
    ttlAlbum: 720,
    ttlArtist: 360,
    ttlSearch: 15,
  },
}

interface SettingsStore {
  settings: AppSettings
  updateSettings: (partial: Partial<AppSettings>) => void
  resetSettings: () => void
}

function loadSettings(): AppSettings {
  const stored = getItem<Partial<AppSettings>>(STORAGE_KEY, {})
  return {
    ...defaultSettings,
    ...stored,
    audioCache: { ...defaultSettings.audioCache, ...(stored.audioCache ?? {}) },
    imageCache: { ...defaultSettings.imageCache, ...(stored.imageCache ?? {}) },
    prefetchCache: { ...defaultSettings.prefetchCache, ...(stored.prefetchCache ?? {}) },
    songMetadataCache: { ...defaultSettings.songMetadataCache, ...(stored.songMetadataCache ?? {}) },
    listBuffer: { ...defaultSettings.listBuffer, ...(stored.listBuffer ?? {}) },
  }
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: loadSettings(),

  updateSettings: (partial) =>
    set((state) => {
      const newSettings = { ...state.settings, ...partial }
      setItem(STORAGE_KEY, newSettings)
      return { settings: newSettings }
    }),

  resetSettings: () => {
    setItem(STORAGE_KEY, defaultSettings)
    set({ settings: defaultSettings })
  },
}))
