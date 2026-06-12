import { useSettingsStore } from "../../stores/settingsStore"
import { useTranslation } from "react-i18next"
import { changeLanguage } from "../../i18n"
import Dropdown from "../ui/Dropdown"

const languages = [
  { value: "en-US", label: "English" },
  { value: "pt-BR", label: "Português (Brasil)" },
]

export default function LanguageSection() {
  const { t } = useTranslation()
  const { settings, updateSettings } = useSettingsStore()

  function handleSelect(code: string) {
    updateSettings({ language: code })
    changeLanguage(code)
  }

  return (
    <div className="flex flex-col gap-8 px-4">
      <div className="ml-3">
        <Dropdown
          label={t("settings.language")}
          value={settings.language}
          options={languages}
          onChange={handleSelect}
        />
      </div>
    </div>
  )
}
