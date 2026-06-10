import { useSettingsStore } from "../../stores/settingsStore"
import { useTranslation } from "react-i18next"

export default function PlaybackSection() {
  const { t } = useTranslation()
  const { settings, updateSettings } = useSettingsStore()

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 text-sm font-medium">
          {t("settings.crossfade")}: {settings.crossfade}s
        </p>
        <input
          type="range"
          min={0}
          max={12}
          step={1}
          value={settings.crossfade}
          onChange={(e) => updateSettings({ crossfade: Number(e.target.value) })}
          className="w-full"
          style={{ accentColor: "var(--accent)" }}
        />
        <div className="mt-1.5 flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
          <span>0s</span>
          <span>12s</span>
        </div>
      </div>

      <ToggleRow
        label={t("settings.autoPlay")}
        checked={settings.autoPlay}
        onChange={(v) => updateSettings({ autoPlay: v })}
      />
      <ToggleRow
        label={t("settings.autoSkipOnError")}
        checked={settings.autoSkipOnError}
        onChange={(v) => updateSettings({ autoSkipOnError: v })}
      />
      <ToggleRow
        label={t("settings.minimizeToTray")}
        checked={settings.minimizeToTray}
        onChange={(v) => updateSettings({ minimizeToTray: v })}
      />
      <ToggleRow
        label={t("settings.stopOnKill")}
        checked={settings.stopOnKill}
        onChange={(v) => updateSettings({ stopOnKill: v })}
      />
      <ToggleRow
        label={t("settings.disableScreenshot")}
        checked={settings.disableScreenshot}
        onChange={(v) => updateSettings({ disableScreenshot: v })}
      />
    </div>
  )
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className="relative h-5 w-9 cursor-pointer rounded-full transition-colors duration-150"
        style={{
          background: checked ? "var(--accent)" : "var(--bg-elevated)",
          border: "none",
        }}
      >
        <div
          className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-150"
          style={{ transform: checked ? "translateX(16px)" : "translateX(0)" }}
        />
      </button>
    </div>
  )
}
