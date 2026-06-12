import { useSettingsStore } from "../../stores/settingsStore"
import type { ThemeMode } from "../../types/settings"
import { useTranslation } from "react-i18next"
import { Check } from "lucide-react"

const themes: { value: ThemeMode; labelKey: string; colors: string[] }[] = [
  { value: "dark", labelKey: "settings.dark", colors: ["#0d1117", "#161b22", "#1c2333"] },
  { value: "light", labelKey: "settings.light", colors: ["#f1f0f5", "#ffffff", "#e8e7ec"] },
  { value: "pure-black", labelKey: "settings.pureBlack", colors: ["#000000", "#080808", "#111111"] },
]

const accentColors = [
  { value: "#7c6aef", labelKey: "settings.colorPurple" },
  { value: "#3b82f6", labelKey: "settings.colorBlue" },
  { value: "#22c55e", labelKey: "settings.colorGreen" },
  { value: "#f97316", labelKey: "settings.colorOrange" },
  { value: "#eab308", labelKey: "settings.colorYellow" },
  { value: "#ef4444", labelKey: "settings.colorRed" },
  { value: "#ec4899", labelKey: "settings.colorPink" },
  { value: "#c084fc", labelKey: "settings.colorLilac" },
]

export default function AppearanceSection() {
  const { t } = useTranslation()
  const { settings, updateSettings } = useSettingsStore()

  return (
    <div className="flex flex-col gap-8 px-4">
      <div>
        <h3 className="mb-5 text-xs font-semibold text-secondary">{t("settings.theme")}</h3>
        <div className="ml-3 flex gap-4">
          {themes.map((th) => {
            const isActive = settings.theme === th.value
            return (
              <button
                key={th.value}
                onClick={() => updateSettings({ theme: th.value })}
                className={`group flex flex-1 cursor-pointer flex-col items-start rounded-xl p-0.5 transition-all duration-200 ${
                  isActive ? "ring-2 ring-accent" : "ring-1 ring-white/[0.08] hover:ring-white/20"
                }`}
              >
                <div className="flex w-full flex-col overflow-hidden rounded-[10px]">
                  <div className="flex items-end gap-1 px-3 pt-3 pb-2" style={{ background: th.colors[0] }}>
                    <div className="h-2 w-2 rounded-full" style={{ background: th.colors[1] }} />
                    <div className="h-2 w-12 rounded" style={{ background: th.colors[1] }} />
                    <div className="h-2 w-8 rounded ml-auto" style={{ background: th.colors[1] }} />
                  </div>
                  <div className="flex gap-1.5 px-3 pt-2 pb-3" style={{ background: th.colors[0] }}>
                    <div className="h-10 w-10 rounded-lg" style={{ background: th.colors[2] }} />
                    <div className="flex flex-col gap-1 flex-1">
                      <div className="h-2 w-16 rounded" style={{ background: th.colors[2] }} />
                      <div className="h-2 w-10 rounded" style={{ background: th.colors[2] }} />
                    </div>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between px-3 py-2.5">
                  <span className={`text-xs font-medium ${isActive ? "text-accent" : "text-secondary"}`}>
                    {t(th.labelKey)}
                  </span>
                  {isActive && <Check size={12} className="text-accent" />}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-5 text-xs font-semibold text-secondary">{t("settings.accentColor")}</h3>
        <div className="ml-3 flex flex-wrap gap-3">
          {accentColors.map((c) => {
            const isActive = settings.accentColor === c.value
            return (
              <button
                key={c.value}
                onClick={() => updateSettings({ accentColor: c.value })}
                className={`group flex cursor-pointer flex-col items-center gap-2 transition-all duration-200 ${
                  isActive ? "scale-105" : "hover:scale-105"
                }`}
                title={t(c.labelKey)}
              >
                <div
                  className={`h-9 w-9 rounded-full transition-all duration-200 ${
                    isActive ? "ring-2 ring-offset-2 ring-offset-bg-primary" : ""
                  }`}
                  style={{
                    background: c.value,
                    ...(isActive ? { ringColor: c.value } : {}),
                  }}
                >
                  {isActive && (
                    <div className="flex h-full w-full items-center justify-center">
                      <Check size={12} className="text-white drop-shadow" />
                    </div>
                  )}
                </div>
                <span className={`text-[10px] ${isActive ? "text-primary font-medium" : "text-muted"}`}>
                  {t(c.labelKey)}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
