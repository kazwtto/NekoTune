import { useSettingsStore } from "./settingsStore"

type ThemeMode = "system" | "light" | "dark"

function mapThemeToSettings(theme: ThemeMode): "dark" | "light" | "pure-black" {
  if (theme === "light") return "light"
  return "dark"
}

function mapSettingsToTheme(settingsTheme: string): ThemeMode {
  if (settingsTheme === "light") return "light"
  if (settingsTheme === "pure-black") return "dark"
  return "dark"
}

export function useThemeStore() {
  const settings = useSettingsStore((s) => s.settings)
  const updateSettings = useSettingsStore((s) => s.updateSettings)

  const theme = mapSettingsToTheme(settings.theme)

  const setTheme = (theme: ThemeMode) => {
    updateSettings({ theme: mapThemeToSettings(theme) })
  }

  return { theme, setTheme }
}
