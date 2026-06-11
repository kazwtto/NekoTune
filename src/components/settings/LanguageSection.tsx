import { useSettingsStore } from "../../stores/settingsStore"
import { useTranslation } from "react-i18next"
import { changeLanguage } from "../../i18n"
import SettingsCard from "./SettingsCard"
import RadioGroup from "./RadioGroup"

export default function LanguageSection() {
  const { t } = useTranslation()
  const { settings, updateSettings } = useSettingsStore()

  function handleLanguageChange(code: string) {
    updateSettings({ language: code })
    changeLanguage(code)
  }

  return (
    <div className="flex flex-col gap-5">
      <SettingsCard title={t("settings.language")}>
        <p className="mb-3 text-xs text-muted">{t("settings.languageDesc")}</p>
        <RadioGroup
          value={settings.language}
          onChange={handleLanguageChange}
          options={[
            { value: "en-US", label: "English", description: "Interface in English" },
            { value: "pt-BR", label: "Português (Brasil)", description: "Interface em português" },
          ]}
        />
      </SettingsCard>
    </div>
  )
}
