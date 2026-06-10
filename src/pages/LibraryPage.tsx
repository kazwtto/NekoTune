import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { usePlayerStore } from "../stores/playerStore"
import SongCard from "../components/media/SongCard"
import { Music } from "lucide-react"

export default function LibraryPage() {
  const { t } = useTranslation()
  const queue = usePlayerStore((s) => s.queue)
  const currentSong = usePlayerStore((s) => s.currentSong)

  const uniqueSongs = Array.from(
    new Map(queue.map((s) => [s.videoId, s])).values(),
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <h2 className="mb-4 text-xl font-bold">{t("common.library")}</h2>

      <div className="mb-4 flex gap-2">
        {["songs", "albums", "artists", "playlists"].map((tab) => (
          <button
            key={tab}
            className="rounded-lg px-3.5 py-1.5 text-xs transition-all duration-150"
            style={{
              background: tab === "songs" ? "var(--accent-muted)" : "var(--bg-surface)",
              color: tab === "songs" ? "var(--accent)" : "var(--text-secondary)",
              border: "1px solid var(--border)",
              cursor: "pointer",
            }}
          >
            {t(`library.${tab}`)}
          </button>
        ))}
      </div>

      {currentSong && (
        <div className="mb-5">
          <h3 className="mb-2.5 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
            Now Playing
          </h3>
          <SongCard song={currentSong} />
        </div>
      )}

      {uniqueSongs.length > 0 ? (
        <div>
          <h3 className="mb-2.5 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
            Queue History ({uniqueSongs.length})
          </h3>
          <div className="flex flex-col gap-1.5">
            {uniqueSongs.map((song) => (
              <SongCard key={song.videoId} song={song} />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-12 flex flex-col items-center gap-2">
          <Music size={28} style={{ color: "var(--text-muted)" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {t("library.noSongs")}
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Search and play music to build your library
          </p>
        </div>
      )}
    </motion.div>
  )
}
