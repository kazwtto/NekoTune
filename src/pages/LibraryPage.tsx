import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { usePlayerStore } from "../stores/playerStore"
import { useLibraryStore } from "../stores/libraryStore"
import SongCard from "../components/media/SongCard"
import { Music, Clock, Heart } from "lucide-react"
import { usePersistedState } from "../hooks/usePersistedState"
import { useScrollPersistence } from "../hooks/useScrollPersistence"

export default function LibraryPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = usePersistedState("nekotune-library-tab", "songs")
  const queue = usePlayerStore((s) => s.queue)
  const currentSong = usePlayerStore((s) => s.currentSong)
  const queueHistory = usePlayerStore((s) => s.queueHistory)
  const { favorites } = useLibraryStore()
  const scrollRef = useScrollPersistence("library")

  const uniqueSongs = Array.from(
    new Map(queue.map((s) => [s.videoId, s])).values(),
  )

  const uniqueHistory = Array.from(
    new Map(queueHistory.map((s) => [s.videoId, s])).values(),
  )

  const favoriteSongs = uniqueSongs.filter((s) => favorites.includes(s.videoId))

  const tabs = [
    { id: "songs", label: t("library.songs"), icon: Music },
    { id: "favorites", label: t("common.favorites"), icon: Heart },
    { id: "play-history", label: t("library.playHistory"), icon: Clock },
  ]

  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-10 bg-bg-backdrop pb-2 pt-1">
        <h2 className="mb-3 text-xl font-bold text-primary">{t("common.library")}</h2>
        <div className="flex gap-2">
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
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
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

          {activeTab === "favorites" && (
            <>
              {favoriteSongs.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {favoriteSongs.map((song) => (
                    <SongCard key={song.videoId} song={song} />
                  ))}
                </div>
              ) : (
                <div className="mt-12 flex flex-col items-center gap-2">
                  <Heart size={28} className="text-muted" />
                  <p className="text-sm text-muted">{t("common.noResults")}</p>
                  <p className="text-xs text-muted">{t("common.searchAndPlay")}</p>
                </div>
              )}
            </>
          )}

          {activeTab === "play-history" && (
            <>
              {uniqueHistory.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {uniqueHistory.map((song) => (
                    <SongCard key={song.videoId} song={song} />
                  ))}
                </div>
              ) : (
                <div className="mt-12 flex flex-col items-center gap-2">
                  <Clock size={28} className="text-muted" />
                  <p className="text-sm text-muted">{t("library.noPlayHistory")}</p>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
