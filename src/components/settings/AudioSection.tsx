import { useSettingsStore } from "../../stores/settingsStore"
import { useTranslation } from "react-i18next"

const qualities = [
  { value: "low", labelKey: "settings.low", bitrate: "50 kbps" },
  { value: "medium", labelKey: "settings.medium", bitrate: "128 kbps" },
  { value: "high", labelKey: "settings.high", bitrate: "256 kbps" },
] as const

export default function AudioSection() {
  const { t } = useTranslation()
  const { settings, updateSettings } = useSettingsStore()

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2.5 text-sm font-medium">{t("settings.audioQuality")}</p>
        <div className="flex gap-2.5">
          {qualities.map((q) => (
            <button
              key={q.value}
              onClick={() => updateSettings({ audioQuality: q.value })}
              className="cursor-pointer rounded-lg px-4 py-2.5 text-xs transition-all duration-150"
              style={{
                background: settings.audioQuality === q.value ? "var(--accent-muted)" : "var(--bg-surface)",
                color: settings.audioQuality === q.value ? "var(--accent)" : "var(--text-secondary)",
                border: `1px solid ${settings.audioQuality === q.value ? "var(--accent)" : "var(--border)"}`,
              }}
            >
              <span className="font-medium">{t(q.labelKey)}</span>
              <br />
              <span style={{ color: "var(--text-muted)" }}>{q.bitrate}</span>
            </button>
          ))}
        </div>
      </div>

      <ToggleRow
        label={t("settings.normalization")}
        checked={settings.enableNormalization}
        onChange={(v) => updateSettings({ enableNormalization: v })}
      />
      <ToggleRow
        label={t("settings.skipSilence")}
        checked={settings.enableSkipSilence}
        onChange={(v) => updateSettings({ enableSkipSilence: v })}
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
