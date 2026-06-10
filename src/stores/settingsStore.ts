import { create } from "zustand"
import type { AppSettings } from "../types/settings"
import { getItem, setItem } from "../utils/storage"

const STORAGE_KEY = "nekotune-settings"

const defaultSettings: AppSettings = {
  theme: "dark",
  accentColor: "#7c6aef",
  language: "en-US",
  audioQuality: "medium",
  downloadPath: "",
  crossfade: 3,
  enableNormalization: true,
  enableSkipSilence: false,
  enableDiscordRpc: true,
  minimizeToTray: true,
  autoPlay: false,
  autoSkipOnError: true,
  stopOnKill: false,
  gridView: true,
  gridCellSize: 2,
  disableScreenshot: false,
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
