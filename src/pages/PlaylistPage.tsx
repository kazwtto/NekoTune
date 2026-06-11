import { useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { usePlaylist } from "../hooks/useInnertube"
import { usePlayer } from "../hooks/usePlayer"
import SongCard from "../components/media/SongCard"
import Shimmer from "../components/ui/Shimmer"
import Button from "../components/ui/Button"
import { Play, Shuffle, ArrowLeft, Music } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { proxyUrl } from "../services/proxy"
import { useScrollPersistence } from "../hooks/useScrollPersistence"

export default function PlaylistPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: playlist, isLoading, error } = usePlaylist(id || "")
  const { play } = usePlayer()
  const scrollRef = useScrollPersistence(`playlist-${id}`)

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Shimmer height={130} rounded="10px" />
        <div className="mt-4">
          <Shimmer height={52} count={5} />
        </div>
      </motion.div>
    )
  }

  if (error || !playlist) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p className="text-sm text-error">{t("common.failedToLoad")}</p>
      </motion.div>
    )
  }

  function playAll() {
    if (playlist!.songs && playlist!.songs.length > 0) {
      play(playlist!.songs[0])
    }
  }

  return (
    <motion.div
      ref={scrollRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="overflow-y-auto h-full"
    >
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex cursor-pointer items-center gap-1.5 text-sm text-muted transition-colors duration-150 hover:opacity-80"
      >
        <ArrowLeft size={16} /> {t("common.back")}
      </button>

      <div className="mb-5 flex items-center gap-5">
        <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-xl bg-surface">
          {playlist!.coverUrl ? (
            <img src={proxyUrl(playlist!.coverUrl)} alt={playlist!.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Music size={28} className="text-muted" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-primary">{playlist!.title}</h2>
          {playlist!.description && (
            <p className="mt-1 line-clamp-2 text-sm text-secondary">
              {playlist!.description}
            </p>
          )}
          <p className="mt-1.5 text-sm text-muted">
            {t("common.songsCount", { count: playlist!.songCount || 0 })}
            {playlist!.owner && <span> · {t("playlist.createdBy")} {playlist!.owner}</span>}
          </p>
        </div>
      </div>

      <div className="mb-5 flex gap-2.5">
        <Button onClick={playAll}>
          <Play size={14} /> {t("playlist.playAll")}
        </Button>
        <Button variant="secondary">
          <Shuffle size={14} /> {t("playlist.shufflePlay")}
        </Button>
      </div>

      <div className="flex flex-col gap-1.5">
        {playlist!.songs?.map((song, i) => (
          <SongCard key={song.videoId} song={song} index={i} />
        ))}
      </div>
    </motion.div>
  )
}
