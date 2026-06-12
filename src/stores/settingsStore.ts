import { create } from "zustand"
import type { AppSettings } from "../types/settings"
import { getItem, setItem } from "../utils/storage"

const STORAGE_KEY = "nekotune-settings"

const defaultSettings: AppSettings = {
  theme: "dark",
  accentColor: "#7c6aef",
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
}

interface SettingsStore {
  settings: AppSettings
  updateSettings: (partial: Partial<AppSettings>) => void
  resetSettings: () => void
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: getItem<AppSettings>(STORAGE_KEY, defaultSettings),

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
