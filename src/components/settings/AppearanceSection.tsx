import { useSettingsStore } from "../../stores/settingsStore"
import type { ThemeMode } from "../../types/settings"
import { useTranslation } from "react-i18next"

const themes: { value: ThemeMode; labelKey: string; color: string }[] = [
  { value: "dark", labelKey: "settings.dark", color: "#161b22" },
  { value: "light", labelKey: "settings.light", color: "#f1f0f5" },
  { value: "pure-black", labelKey: "settings.pureBlack", color: "#000000" },
]

export default function AppearanceSection() {
  const { t } = useTranslation()
  const { settings, updateSettings } = useSettingsStore()

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2.5 text-sm font-medium">{t("settings.theme")}</p>
        <div className="flex gap-3">
          {themes.map((th) => (
            <button
              key={th.value}
              onClick={() => updateSettings({ theme: th.value })}
              className="flex cursor-pointer flex-col items-center gap-2 rounded-lg p-3.5 transition-all duration-150"
              style={{
                background: settings.theme === th.value ? "var(--accent-muted)" : "var(--bg-surface)",
                border: `1px solid ${settings.theme === th.value ? "var(--accent)" : "var(--border)"}`,
              }}
            >
              <div
                className="h-8 w-8 rounded-full"
                style={{ background: th.color, border: "1px solid var(--border)" }}
              />
              <span className="text-xs">{t(th.labelKey)}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2.5 text-sm font-medium">{t("settings.accentColor")}</p>
        <div className="flex gap-2.5">
          {["#7c6aef", "#f97316", "#c084fc", "#22c55e", "#3b82f6", "#ec4899"].map((color) => (
            <button
              key={color}
              onClick={() => updateSettings({ accentColor: color })}
              className="h-7 w-7 cursor-pointer rounded-full transition-all duration-150"
              style={{
                background: color,
                transform: settings.accentColor === color ? "scale(1.15)" : "scale(1)",
                border: settings.accentColor === color ? "2px solid #fff" : "2px solid transparent",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
