import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useSettingsStore } from "../../stores/settingsStore"
import { invoke } from "@tauri-apps/api/core"
import type { LocalSong } from "../../types/music"
import LocalSongCard from "./LocalSongCard"
import { Download, Loader2 } from "lucide-react"

export default function DownloadedSongs() {
  const { t } = useTranslation()
  const { downloadFolder } = useSettingsStore((s) => s.settings)
  const [songs, setSongs] = useState<LocalSong[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const folder = downloadFolder || ""
        if (folder) {
          const results = await invoke<LocalSong[]>("cmd_scan_music_folder", { path: folder })
          setSongs(results)
        } else {
            const defaultDir = await invoke<string>("cmd_get_default_music_dir")
            const nekotuneDir = defaultDir + (defaultDir.endsWith('/') || defaultDir.endsWith('\\') ? '' : '/') + "NekoTune"
            const results = await invoke<LocalSong[]>("cmd_scan_music_folder", { path: nekotuneDir }).catch(() => [])
            setSongs(results)
        }
      } catch (err) {
        console.error("Failed to scan downloaded songs:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [downloadFolder])

  if (loading) {
    return (
      <div className="mt-12 flex flex-col items-center gap-2">
        <Loader2 size={28} className="text-muted animate-spin" />
        <p className="text-sm text-muted">{t("library.scanning")}</p>
      </div>
    )
  }

  if (songs.length === 0) {
    return (
      <div className="mt-12 flex flex-col items-center gap-2 text-center">
        <Download size={28} className="text-muted" />
        <p className="text-sm text-muted">{t("library.noDownloaded")}</p>
        <p className="max-w-[200px] text-xs text-muted">{t("library.downloadHint")}</p>
      </div>
    )
  }

  return (
    <div>
      <h3 className="mb-2.5 text-sm font-semibold text-secondary">
        {t("library.downloaded")} ({songs.length})
      </h3>
      <div className="flex flex-col gap-1.5">
        {songs.map((song, i) => (
          <LocalSongCard key={song.id} song={song} index={i} />
        ))}
      </div>
    </div>
  )
}
