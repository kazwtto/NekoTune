import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { useAlbum } from "../hooks/useInnertube"
import { usePlayer } from "../hooks/usePlayer"
import SongCard from "../components/media/SongCard"
import Shimmer from "../components/ui/Shimmer"
import Button from "../components/ui/Button"
import { Play, ArrowLeft, Music } from "lucide-react"

export default function AlbumPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: album, isLoading, error } = useAlbum(id || "")
  const { play } = usePlayer()

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Shimmer height={130} rounded="10px" />
        <div className="mt-4">
          <Shimmer height={52} count={6} />
        </div>
      </motion.div>
    )
  }

  if (error || !album) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p className="text-sm" style={{ color: "var(--error)" }}>Failed to load album</p>
      </motion.div>
    )
  }

  function playAll() {
    if (album!.songs && album!.songs.length > 0) {
      play(album!.songs[0])
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex cursor-pointer items-center gap-1.5 text-sm transition-colors duration-150 hover:opacity-80"
        style={{ background: "none", border: "none", color: "var(--text-muted)" }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="mb-5 flex items-center gap-5">
        <div
          className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-xl"
          style={{ background: "var(--bg-surface)" }}
        >
          {album!.coverUrl ? (
            <img src={album!.coverUrl} alt={album!.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Music size={28} style={{ color: "var(--text-muted)" }} />
            </div>
          )}
        </div>
        <div>
          <h2 className="text-lg font-bold">{album!.title}</h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {album!.artist}
            {album!.year && <span> • {album!.year}</span>}
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            {album!.songCount || album!.songs?.length || 0} {t("playlist.songs")}
          </p>
        </div>
      </div>

      <div className="mb-5">
        <Button onClick={playAll}>
          <Play size={14} /> {t("playlist.playAll")}
        </Button>
      </div>

      <div className="flex flex-col gap-1.5">
        {album!.songs?.map((song, i) => (
          <SongCard key={song.videoId} song={song} index={i} />
        ))}
      </div>
    </motion.div>
  )
}
