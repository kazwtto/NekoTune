import { useSettingsStore } from "../../stores/settingsStore"
import { useTranslation } from "react-i18next"
import SettingsCard from "./SettingsCard"
import Toggle from "./Toggle"

export default function PlaybackSection() {
  const { t } = useTranslation()
  const { settings, updateSettings } = useSettingsStore()

  return (
    <div className="flex flex-col gap-5">
      <SettingsCard title={t("settings.crossfade")}>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs text-muted">{t("settings.crossfadeDesc")}</span>
          <span className="text-sm font-semibold tabular-nums text-accent">
            {settings.crossfade}s
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={12}
          step={1}
          value={settings.crossfade}
          onChange={(e) => updateSettings({ crossfade: Number(e.target.value) })}
          className="w-full"
        />
        <div className="mt-1.5 flex justify-between text-[11px] text-muted">
          <span>{t("settings.off")}</span>
          <span>12s</span>
        </div>
      </SettingsCard>

      <SettingsCard title={t("settings.behavior")}>
        <div className="flex flex-col divide-y divide-border">
          <Toggle
            label={t("settings.autoPlay")}
            description={t("settings.autoPlayDesc")}
            checked={settings.autoPlay}
            onChange={(v) => updateSettings({ autoPlay: v })}
          />
          <Toggle
            label={t("settings.autoSkipOnError")}
            description={t("settings.autoSkipOnErrorDesc")}
            checked={settings.autoSkipOnError}
            onChange={(v) => updateSettings({ autoSkipOnError: v })}
          />
        </div>
      </SettingsCard>
    </div>
  )
}
