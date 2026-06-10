import { useSettingsStore } from "../../stores/settingsStore"
import { useTranslation } from "react-i18next"

const languages = [
  { code: "en-US", label: "English" },
  { code: "pt-BR", label: "Português (Brasil)" },
  { code: "es", label: "Español" },
  { code: "ja", label: "日本語" },
]

export default function LanguageSection() {
  const { t } = useTranslation()
  const { settings, updateSettings } = useSettingsStore()

  return (
    <div>
      <p className="mb-2.5 text-sm font-medium">{t("settings.language")}</p>
      <div className="flex flex-col gap-1.5">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => updateSettings({ language: lang.code })}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm transition-all duration-150"
            style={{
              background: settings.language === lang.code ? "var(--accent-muted)" : "var(--bg-surface)",
              color: settings.language === lang.code ? "var(--accent)" : "var(--text-secondary)",
              border: `1px solid ${settings.language === lang.code ? "var(--accent)" : "var(--border)"}`,
            }}
          >
            {lang.label}
            {settings.language === lang.code && <span className="ml-auto">✓</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
