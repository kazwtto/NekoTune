import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { useAlbum } from "../hooks/useInnertube"
import { usePlayer } from "../hooks/usePlayer"
import SongCard from "../components/media/SongCard"
import Shimmer from "../components/ui/Shimmer"
import Button from "../components/ui/Button"
import { Play, ArrowLeft, Music } from "lucide-react"
import { proxyUrl } from "../services/proxy"
import { useScrollPersistence } from "../hooks/useScrollPersistence"

export default function AlbumPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: album, isLoading, error } = useAlbum(id || "")
  const { play } = usePlayer()
  const scrollRef = useScrollPersistence(`album-${id}`)

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
        <p className="text-sm text-error">{t("common.failedToLoad")}</p>
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
          {album!.coverUrl ? (
            <img src={proxyUrl(album!.coverUrl)} alt={album!.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Music size={28} className="text-muted" />
            </div>
          )}
        </div>
        <div>
          <h2 className="text-lg font-bold text-primary">{album!.title}</h2>
          <p className="text-sm text-secondary">
            {album!.artist}
            {album!.year && <span> · {album!.year}</span>}
          </p>
          <p className="mt-1 text-sm text-muted">
            {t("common.songsCount", { count: album!.songCount || album!.songs?.length || 0 })}
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
