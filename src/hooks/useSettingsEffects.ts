import { useEffect } from "react"
import { useSettingsStore } from "../stores/settingsStore"
import { changeLanguage } from "../i18n"

export function useSettingsEffects() {
  const settings = useSettingsStore((s) => s.settings)

  useEffect(() => {
    const root = document.documentElement

    root.setAttribute("data-theme", settings.theme)

    if (settings.theme === "pure-black") {
      root.style.setProperty("--color-bg-primary", "#000000")
      root.style.setProperty("--color-bg-surface", "#080808")
      root.style.setProperty("--color-bg-elevated", "#111111")
      root.style.setProperty("--color-bg-hover", "#1a1a1a")
      root.style.setProperty("--color-bg-backdrop", "#000000")
      root.style.setProperty("--color-player", "#030303")
      root.style.setProperty("--color-primary", "#e6edf3")
      root.style.setProperty("--color-secondary", "#8b949e")
      root.style.setProperty("--color-muted", "#484f58")
      root.style.setProperty("--color-border", "rgba(255, 255, 255, 0.04)")
    } else if (settings.theme === "light") {
      root.style.setProperty("--color-bg-primary", "#f1f0f5")
      root.style.setProperty("--color-bg-surface", "#ffffff")
      root.style.setProperty("--color-bg-elevated", "#e8e7ec")
      root.style.setProperty("--color-bg-hover", "#dddcec")
      root.style.setProperty("--color-bg-backdrop", "#eae9ef")
      root.style.setProperty("--color-player", "#ffffff")
      root.style.setProperty("--color-primary", "#1a1a2e")
      root.style.setProperty("--color-secondary", "#555570")
      root.style.setProperty("--color-muted", "#9090a0")
      root.style.setProperty("--color-border", "rgba(0, 0, 0, 0.08)")
    } else {
      root.style.setProperty("--color-bg-primary", "#0d1117")
      root.style.setProperty("--color-bg-surface", "#161b22")
      root.style.setProperty("--color-bg-elevated", "#1c2333")
      root.style.setProperty("--color-bg-hover", "#242d3d")
      root.style.setProperty("--color-bg-backdrop", "#0a0e14")
      root.style.setProperty("--color-player", "#111827")
      root.style.setProperty("--color-primary", "#e6edf3")
      root.style.setProperty("--color-secondary", "#8b949e")
      root.style.setProperty("--color-muted", "#484f58")
      root.style.setProperty("--color-border", "rgba(255, 255, 255, 0.06)")
    }

    root.style.setProperty("--color-accent", settings.accentColor)

    const r = parseInt(settings.accentColor.slice(1, 3), 16)
    const g = parseInt(settings.accentColor.slice(3, 5), 16)
    const b = parseInt(settings.accentColor.slice(5, 7), 16)
    root.style.setProperty("--color-accent-muted", `rgba(${r}, ${g}, ${b}, 0.15)`)
    root.style.setProperty("--color-accent-hover", settings.accentColor)
  }, [settings.theme, settings.accentColor])

  useEffect(() => {
    changeLanguage(settings.language)
  }, [settings.language])
}
