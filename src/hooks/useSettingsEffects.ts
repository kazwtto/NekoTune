import { useEffect } from "react"
import { useSettingsStore } from "../stores/settingsStore"
import { useDownloadStore } from "../stores/downloadStore"
import { changeLanguage } from "../i18n"

export function useSettingsEffects() {
  const settings = useSettingsStore((s) => s.settings)
  const loadDownloaded = useDownloadStore((s) => s.loadAllDownloadedIds)

  useEffect(() => {
    loadDownloaded()
  }, [settings.downloadFolder])

  useEffect(() => {
    const root = document.documentElement

    root.setAttribute("data-theme", settings.theme)

    root.style.setProperty("--color-accent", settings.accentColor)

    const r = parseInt(settings.accentColor.slice(1, 3), 16)
    const g = parseInt(settings.accentColor.slice(3, 5), 16)
    const b = parseInt(settings.accentColor.slice(5, 7), 16)
    root.style.setProperty("--color-accent-muted", `rgba(${r}, ${g}, ${b}, 0.15)`)
    root.style.setProperty("--color-accent-hover", settings.accentColor)

    if (settings.hideScrollbar) {
      root.classList.add("hide-scrollbar")
    } else {
      root.classList.remove("hide-scrollbar")
    }
  }, [settings.theme, settings.accentColor, settings.hideScrollbar])

  useEffect(() => {
    changeLanguage(settings.language)
  }, [settings.language])
}
