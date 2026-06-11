import { useSettingsStore } from "../../stores/settingsStore"
import { useTranslation } from "react-i18next"
import SettingsCard from "./SettingsCard"
import RadioGroup from "./RadioGroup"
import Toggle from "./Toggle"

export default function AudioSection() {
  const { t } = useTranslation()
  const { settings, updateSettings } = useSettingsStore()

  return (
    <div className="flex flex-col gap-5">
      <SettingsCard title={t("settings.audioQuality")}>
        <p className="mb-3 text-xs text-muted">{t("settings.audioQualityDesc")}</p>
        <RadioGroup
          value={settings.audioQuality}
          onChange={(v) => updateSettings({ audioQuality: v as "low" | "medium" | "high" })}
          options={[
            { value: "low", label: t("settings.low"), description: t("settings.lowDesc") },
            { value: "medium", label: t("settings.medium"), description: t("settings.mediumDesc") },
            { value: "high", label: t("settings.high"), description: t("settings.highDesc") },
          ]}
        />
      </SettingsCard>

      <SettingsCard title={t("settings.playback")}>
        <div className="flex flex-col divide-y divide-border">
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
      </SettingsCard>
    </div>
  )
}
