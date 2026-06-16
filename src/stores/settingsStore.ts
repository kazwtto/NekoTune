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
  streamCache: {
    enabled: true,
    ttlMinutes: 120,
    maxEntries: 50,
  },
  prefetchCache: {
    enabled: true,
    prefetchCount: 2,
    delayMs: 2000,
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
    streamCache: { ...defaultSettings.streamCache, ...(stored.streamCache ?? {}) },
    prefetchCache: { ...defaultSettings.prefetchCache, ...(stored.prefetchCache ?? {}) },
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
