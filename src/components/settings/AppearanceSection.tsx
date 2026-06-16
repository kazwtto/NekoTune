import { useSettingsStore } from "../../stores/settingsStore"
import type { ThemeMode } from "../../types/settings"
import { useTranslation } from "react-i18next"
import { Check } from "lucide-react"
import Toggle from "./Toggle"

const themes: { value: ThemeMode; labelKey: string }[] = [
  { value: "dark", labelKey: "settings.dark" },
  { value: "light", labelKey: "settings.light" },
  { value: "pure-black", labelKey: "settings.pureBlack" },
]

const vibrantColors = [
  "#7c6aef", "#3b82f6", "#22c55e", "#f97316", 
  "#eab308", "#ef4444", "#ec4899", "#c084fc",
]

const pastelColors = [
  "#c6a0f6", "#8caaee", "#a6da95", "#f5a97f", 
  "#eed49f", "#ed8796", "#f5bde6", "#b7bdf8",
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
                data-theme={th.value}
                onClick={() => updateSettings({ theme: th.value })}
                className={`group flex flex-1 cursor-pointer flex-col items-start rounded-xl p-0.5 transition-all duration-200 ${
                  isActive ? "ring-2 ring-accent" : "ring-1 ring-white/[0.08] hover:ring-white/20"
                }`}
              >
                <div className="flex w-full flex-col overflow-hidden rounded-[10px] bg-bg-primary">
                  <div className="flex items-end gap-1 px-3 pt-3 pb-2 bg-bg-primary">
                    <div className="h-2 w-2 rounded-full bg-bg-surface" />
                    <div className="h-2 w-12 rounded bg-bg-surface" />
                    <div className="h-2 w-8 rounded ml-auto bg-bg-surface" />
                  </div>
                  <div className="flex gap-1.5 px-3 pt-2 pb-3 bg-bg-primary">
                    <div className="h-10 w-10 rounded-lg bg-bg-elevated" />
                    <div className="flex flex-col gap-1 flex-1">
                      <div className="h-2 w-16 rounded bg-bg-elevated" />
                      <div className="h-2 w-10 rounded bg-bg-elevated" />
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
        <div className="ml-3 flex flex-col gap-6">
          
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted/70 ml-1">Vibrant</span>
            <div className="flex flex-wrap gap-4">
              {vibrantColors.map((color) => {
                const isActive = settings.accentColor === color
                return (
                  <button
                    key={color}
                    onClick={() => updateSettings({ accentColor: color })}
                    className="group relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl transition-all duration-300"
                  >
                    <div 
                      className={`absolute inset-0 rounded-xl transition-all duration-300 ease-out ${
                        isActive ? "scale-100 opacity-100" : "scale-[0.8] opacity-80 group-hover:scale-95 group-hover:opacity-100"
                      }`}
                      style={{
                        backgroundColor: color,
                        boxShadow: isActive ? `0 4px 12px -2px ${color}80` : "none"
                      }}
                    />
                    <div 
                      className={`absolute inset-[-4px] rounded-[16px] border-[2px] transition-all duration-300 ease-out ${
                        isActive ? "scale-100 opacity-100" : "scale-90 opacity-0"
                      }`}
                      style={{ borderColor: color }}
                    />
                    {isActive && <Check size={14} strokeWidth={3} className="relative z-10 text-white drop-shadow-sm scale-in-center" />}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted/70 ml-1">Pastel</span>
            <div className="flex flex-wrap gap-4">
              {pastelColors.map((color) => {
                const isActive = settings.accentColor === color
                return (
                  <button
                    key={color}
                    onClick={() => updateSettings({ accentColor: color })}
                    className="group relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl transition-all duration-300"
                  >
                    <div 
                      className={`absolute inset-0 rounded-xl transition-all duration-300 ease-out ${
                        isActive ? "scale-100 opacity-100" : "scale-[0.8] opacity-80 group-hover:scale-95 group-hover:opacity-100"
                      }`}
                      style={{
                        backgroundColor: color,
                        boxShadow: isActive ? `0 4px 12px -2px ${color}80` : "none"
                      }}
                    />
                    <div 
                      className={`absolute inset-[-4px] rounded-[16px] border-[2px] transition-all duration-300 ease-out ${
                        isActive ? "scale-100 opacity-100" : "scale-90 opacity-0"
                      }`}
                      style={{ borderColor: color }}
                    />
                    {isActive && <Check size={14} strokeWidth={3} className="relative z-10 text-white drop-shadow-sm scale-in-center" />}
                  </button>
                )
              })}
            </div>
          </div>

        </div>
      </div>

      <div>
        <h3 className="mb-5 text-xs font-semibold text-secondary">{t("settings.layout")}</h3>
        <div className="ml-3 divide-y divide-border">
          <Toggle
            label={t("settings.hideScrollbar")}
            description={t("settings.hideScrollbarDesc")}
            checked={settings.hideScrollbar}
            onChange={(v) => updateSettings({ hideScrollbar: v })}
          />
        </div>
      </div>
    </div>
  )
}
