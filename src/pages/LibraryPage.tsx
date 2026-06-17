import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "react-i18next"
import { usePlayerStore } from "../stores/playerStore"
import { useLocalStore } from "../stores/localStore"
import { useSettingsStore } from "../stores/settingsStore"
import SongCard from "../components/media/SongCard"
import FavoriteSongs from "../components/media/FavoriteSongs"
import LocalSongCard from "../components/media/LocalSongCard"
import DownloadedSongs from "../components/media/DownloadedSongs"
import { Music, Heart, FolderOpen, Download } from "lucide-react"
import { usePersistedState } from "../hooks/usePersistedState"
import { useScrollPersistence } from "../hooks/useScrollPersistence"
import { useEffect, useRef } from "react"
import { getDefaultMusicDir } from "../services/local"

export default function LibraryPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = usePersistedState("nekotune-library-tab", "songs")
  const queue = usePlayerStore((s) => s.queue)
  const currentSong = usePlayerStore((s) => s.currentSong)
  const scrollRef = useScrollPersistence("library")

  const { songs: localSongs, isLoading: localLoading, scanFolder } = useLocalStore()
  const { settings, updateSettings } = useSettingsStore()
  const initRef = useRef(false)

  useEffect(() => {
    if (activeTab !== "local") return

    const folder = settings.musicFolder
    if (folder) {
      if (localSongs.length === 0 && !localLoading) {
        scanFolder(folder)
      }
      return
    }

    if (initRef.current) return
    initRef.current = true

    getDefaultMusicDir().then((dir) => {
      if (dir) {
        updateSettings({ musicFolder: dir })
        scanFolder(dir)
      }
    })
  }, [activeTab, settings.musicFolder])

  const uniqueSongs = Array.from(
    new Map(queue.map((s) => [s.videoId, s])).values(),
  )

  const tabs = [
    { id: "songs", label: t("library.songs"), icon: Music },
    { id: "local", label: t("library.local"), icon: FolderOpen },
    { id: "downloaded", label: t("library.downloaded"), icon: Download },
    { id: "favorites", label: t("common.favorites"), icon: Heart },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex h-full flex-col"
    >
      <div className="flex items-center gap-3 pb-3 pt-4">
        <h1 className="text-xl font-bold text-primary">{t("common.library")}</h1>
      </div>
      <div className="mb-3 flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs transition-all duration-150 ${
              activeTab === tab.id
                ? "bg-accent-muted text-accent"
                : "text-secondary hover:bg-bg-hover"
            }`}
          >
            <tab.icon size={12} />
            {tab.label}
          </button>
        ))}
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === "songs" && (
              <>
                {currentSong && (
                  <div className="mb-5">
                    <h3 className="mb-2.5 text-sm font-semibold text-secondary">
                      {t("player.nowPlaying")}
                    </h3>
                    <SongCard song={currentSong} />
                  </div>
                )}

                {uniqueSongs.length > 0 ? (
                  <div>
                    <h3 className="mb-2.5 text-sm font-semibold text-secondary">
                      {t("player.upNext")} ({uniqueSongs.length})
                    </h3>
                    <div className="flex flex-col gap-1.5">
                      {uniqueSongs.map((song) => (
                        <SongCard key={song.videoId} song={song} />
                      ))}
                    </div>

                  </div>
                ) : !currentSong ? (
                  <div className="mt-12 flex flex-col items-center gap-2">
                    <Music size={28} className="text-muted" />
                    <p className="text-sm text-muted">{t("library.noSongs")}</p>
                    <p className="text-xs text-muted">{t("common.searchAndPlay")}</p>
                  </div>
                ) : null}
              </>
            )}

            {activeTab === "local" && (
              <>
                {localLoading ? (
                  <div className="mt-12 flex flex-col items-center gap-2">
                    <FolderOpen size={28} className="text-muted animate-pulse" />
                    <p className="text-sm text-muted">{t("library.scanning")}</p>
                  </div>
                ) : localSongs.length > 0 ? (
                  <div>
                    <h3 className="mb-2.5 text-sm font-semibold text-secondary">
                      {t("library.localSongs")} ({localSongs.length})
                    </h3>
                    <div className="flex flex-col gap-1.5">
                      {localSongs.map((song, i) => (
                        <LocalSongCard key={song.id} song={song} index={i} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-12 flex flex-col items-center gap-2">
                    <FolderOpen size={28} className="text-muted" />
                    <p className="text-sm text-muted">{t("library.noLocalSongs")}</p>
                    <p className="text-xs text-muted">{t("library.configureFolder")}</p>
                  </div>
                )}
              </>
            )}

            {activeTab === "downloaded" && <DownloadedSongs />}

            {activeTab === "favorites" && <FavoriteSongs />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
