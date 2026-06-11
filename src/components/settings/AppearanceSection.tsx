import { useSettingsStore } from "../../stores/settingsStore"
import type { ThemeMode } from "../../types/settings"
import { useTranslation } from "react-i18next"
import SettingsCard from "./SettingsCard"

const themes: { value: ThemeMode; labelKey: string; preview: string; ring: string }[] = [
  { value: "dark", labelKey: "settings.dark", preview: "#161b22", ring: "rgba(255,255,255,0.1)" },
  { value: "light", labelKey: "settings.light", preview: "#f1f0f5", ring: "rgba(0,0,0,0.1)" },
  { value: "pure-black", labelKey: "settings.pureBlack", preview: "#000000", ring: "rgba(255,255,255,0.15)" },
]

const accentColors = [
  { value: "#7c6aef", labelKey: "settings.colorPurple" },
  { value: "#f97316", labelKey: "settings.colorOrange" },
  { value: "#c084fc", labelKey: "settings.colorLilac" },
  { value: "#22c55e", labelKey: "settings.colorGreen" },
  { value: "#3b82f6", labelKey: "settings.colorBlue" },
  { value: "#ec4899", labelKey: "settings.colorPink" },
  { value: "#eab308", labelKey: "settings.colorYellow" },
  { value: "#ef4444", labelKey: "settings.colorRed" },
]

export default function AppearanceSection() {
  const { t } = useTranslation()
  const { settings, updateSettings } = useSettingsStore()

  return (
    <div className="flex flex-col gap-5">
      <SettingsCard title={t("settings.theme")}>
        <div className="grid grid-cols-3 gap-3">
          {themes.map((th) => {
            const isActive = settings.theme === th.value
            return (
              <button
                key={th.value}
                onClick={() => updateSettings({ theme: th.value })}
                className={`group flex cursor-pointer flex-col items-center gap-2.5 rounded-xl p-4 transition-all duration-150 ${
                  isActive
                    ? "bg-accent-muted ring-2 ring-accent/40"
                    : "bg-bg-elevated hover:ring-1 hover:ring-white/10"
                }`}
              >
                <div className="relative">
                  <div
                    className="h-10 w-10 rounded-full shadow-inner"
                    style={{ background: th.preview, border: `2px solid ${th.ring}` }}
                  />
                  {isActive && (
                    <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </div>
                <span className={`text-xs font-medium ${isActive ? "text-accent" : "text-secondary"}`}>
                  {t(th.labelKey)}
                </span>
              </button>
            )
          })}
        </div>
      </SettingsCard>

      <SettingsCard title={t("settings.accentColor")}>
        <div className="flex flex-wrap gap-3">
          {accentColors.map((c) => {
            const isActive = settings.accentColor === c.value
            return (
              <button
                key={c.value}
                onClick={() => updateSettings({ accentColor: c.value })}
                className="group flex cursor-pointer flex-col items-center gap-1.5"
                title={t(c.labelKey)}
              >
                <div
                  className={`relative h-9 w-9 rounded-full transition-all duration-150 ${
                    isActive ? "scale-110 ring-2 ring-offset-2 ring-offset-bg-surface" : "hover:scale-105"
                  }`}
                  style={{
                    background: c.value,
                    ...(isActive ? { ringColor: c.value } : {}),
                  }}
                >
                  {isActive && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
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
      </SettingsCard>
    </div>
  )
}
