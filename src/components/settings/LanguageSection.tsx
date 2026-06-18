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
        <p className="mb-2 text-xs font-semibold text-primary">
          {t("settings.language")}
        </p>
      <div className="ml-3">
        <Dropdown
          //label={t("settings.language_more_soon", "More will be added soon.")}
          value={settings.language}
          options={languages}
          onChange={handleSelect}
        />
      </div>
    </div>
  )
}
