import { useSettingsStore } from "../../stores/settingsStore"
import { useLocalStore } from "../../stores/localStore"
import { useTranslation } from "react-i18next"
import { FolderOpen, RefreshCw, Music } from "lucide-react"
import { getDefaultMusicDir } from "../../services/local"
import { useEffect } from "react"

export default function LocalMusicSection() {
  const { t } = useTranslation()
  const { settings, updateSettings } = useSettingsStore()
  const { songs, isLoading, scanFolder } = useLocalStore()

  const currentFolder = settings.musicFolder

  useEffect(() => {
    if (!currentFolder) {
      getDefaultMusicDir().then((dir) => {
        if (dir) {
          updateSettings({ musicFolder: dir })
          scanFolder(dir)
        }
      })
    } else if (songs.length === 0 && !isLoading) {
      scanFolder(currentFolder)
    }
  }, [currentFolder])

  async function handleBrowse() {
    const { open } = await import("@tauri-apps/plugin-dialog")
    const selected = await open({
      directory: true,
      multiple: false,
      title: t("settings.musicFolder"),
    })
    if (selected) {
      const path = typeof selected === "string" ? selected : selected
      updateSettings({ musicFolder: path as string })
      scanFolder(path as string)
    }
  }

  function handleRescan() {
    if (currentFolder) {
      scanFolder(currentFolder)
    }
  }

  return (
    <div className="flex flex-col gap-8 px-4">
      <div>
        <h3 className="mb-5 text-xs font-semibold text-secondary">
          {t("settings.musicFolder")}
        </h3>
        <div className="ml-3 flex flex-col gap-3">
          <p className="text-xs text-muted">
            {t("settings.musicFolderDesc")}
          </p>

          <div className="flex items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/[0.08] bg-bg-elevated px-3 py-2">
              <FolderOpen size={14} className="flex-shrink-0 text-muted" />
              <span className="truncate text-sm text-primary">
                {currentFolder || t("settings.notSet")}
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

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music size={12} className="text-muted" />
              <span className="text-xs text-secondary">
                {isLoading
                  ? t("library.scanning")
                  : t("library.localSongsCount", { count: songs.length })}
              </span>
            </div>
            <button
              onClick={handleRescan}
              disabled={isLoading || !currentFolder}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-secondary transition-all duration-150 hover:bg-bg-hover hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
              {t("settings.scanNow")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
