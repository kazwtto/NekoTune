import { useSettingsStore } from "../../stores/settingsStore"
import { useTranslation } from "react-i18next"
import Toggle from "./Toggle"
import Dropdown from "../ui/Dropdown"

export default function AudioSection() {
  const { t } = useTranslation()
  const { settings, updateSettings } = useSettingsStore()

  return (
    <div className="flex flex-col gap-8 px-4">
      <div>
        <h3 className="mb-5 text-xs font-semibold text-secondary">{t("settings.audioQuality")}</h3>
        <div className="ml-3 max-w-xs">
          <Dropdown
          value={settings.audioQuality}
          onChange={(v) => updateSettings({ audioQuality: v as "low" | "medium" | "high" })}
          options={[
            { value: "low", label: t("settings.low") },
            { value: "medium", label: t("settings.medium") },
            { value: "high", label: t("settings.high") },
          ]}
        />
        </div>
      </div>

      <div>
        <h3 className="mb-5 text-xs font-semibold text-secondary">{t("settings.playback")}</h3>
        <div className="ml-3 divide-y divide-border">
          <Toggle
            label={t("settings.normalization")}
            description={t("settings.normalizationDesc")}
            checked={settings.enableNormalization}
            onChange={(v) => updateSettings({ enableNormalization: v })}
          />
          <Toggle
            label={t("settings.skipSilence")}
            description={t("settings.skipSilenceDesc")}
            checked={settings.enableSkipSilence}
            onChange={(v) => updateSettings({ enableSkipSilence: v })}
          />
        </div>
      </div>
    </div>
  )
}
