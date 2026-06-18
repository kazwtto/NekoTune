import { useTranslation } from "react-i18next"
import { useSettingsStore } from "../../stores/settingsStore"
import { FolderOpen } from "lucide-react"
import Dropdown from "../ui/Dropdown"

export default function DownloadSection() {
  const { t } = useTranslation()
  const { settings, updateSettings } = useSettingsStore()

  const formats = [
    { value: "mp3", label: t("settings.formatMp3") },
    { value: "flac", label: t("settings.formatFlac") },
    { value: "ogg", label: t("settings.formatOgg") },
    { value: "wav", label: t("settings.formatWav") },
  ]

  const qualities = [
    { value: "low", label: t("settings.qualityLow") },
    { value: "medium", label: t("settings.qualityMedium") },
    { value: "high", label: t("settings.qualityHigh") },
    { value: "best", label: t("settings.qualityBest") },
  ]

  async function handleBrowse() {
    try {
      const { open } = await import("@tauri-apps/plugin-dialog")
      const selected = await open({
        directory: true,
        multiple: false,
        title: t("settings.downloadFolder"),
        defaultPath: settings.downloadFolder || undefined,
      })
      if (selected) {
        const path = typeof selected === "string" ? selected : selected
        updateSettings({ downloadFolder: path as string })
      }
    } catch (err) {
      console.error("Failed to open folder picker:", err)
    }
  }

  return (
    <div className="flex flex-col gap-8 px-4">
      <div>
        <h3 className="mb-5 text-xs font-semibold text-secondary">
          {t("settings.download")}
        </h3>

        <div className="ml-3 flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-primary">
              {t("settings.downloadFolder")}
            </span>
            <p className="text-xs text-muted">
              {t("settings.downloadFolderDesc")}
            </p>

            <div className="flex items-center gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/[0.08] bg-bg-elevated px-3 py-2">
                <FolderOpen size={14} className="flex-shrink-0 text-muted" />
                <span className="truncate text-sm text-primary">
                  {settings.downloadFolder || t("common.default")}
                </span>
              </div>
              <button
                onClick={handleBrowse}
                className="flex flex-shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-white transition-all duration-150 hover:opacity-90"
              >
                <FolderOpen size={12} />
                {t("settings.browse")}
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <span className="text-sm font-medium text-primary">
                {t("settings.downloadFormat")}
              </span>
              <Dropdown
                value={settings.downloadFormat}
                options={formats}
                onChange={(v) => updateSettings({ downloadFormat: v as any })}
              />
            </div>

            <div className="flex flex-1 flex-col gap-2">
              <span className="text-sm font-medium text-primary">
                {t("settings.downloadQuality")}
              </span>
              <Dropdown
                value={settings.downloadQuality}
                options={qualities}
                onChange={(v) => updateSettings({ downloadQuality: v as any })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
