import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { useArtist } from "../hooks/useInnertube"
import { usePlayer } from "../hooks/usePlayer"
import SongCard from "../components/media/SongCard"
import AlbumCard from "../components/media/AlbumCard"
import Shimmer from "../components/ui/Shimmer"
import Button from "../components/ui/Button"
import { Play, ArrowLeft, User } from "lucide-react"
import { proxyUrl } from "../services/proxy"
import { useScrollPersistence } from "../hooks/useScrollPersistence"

export default function ArtistPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: artist, isLoading, error } = useArtist(id || "")
  const { play } = usePlayer()
  const scrollRef = useScrollPersistence(`artist-${id}`)

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Shimmer height={90} rounded="8px" />
        <div className="mt-4">
          <Shimmer height={52} count={4} />
        </div>
      </motion.div>
    )
  }

  if (error || !artist) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p className="text-sm text-error">{t("common.failedToLoad")}</p>
      </motion.div>
    )
  }

  function playTopSong() {
    if (artist!.songs && artist!.songs.length > 0) {
      play(artist!.songs[0])
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
        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-full bg-surface">
          {artist!.imageUrl ? (
            <img src={proxyUrl(artist!.imageUrl)} alt={artist!.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <User size={32} className="text-muted" />
            </div>
          )}
        </div>
        <div>
          <h2 className="text-lg font-bold text-primary">{artist!.name}</h2>
          {artist!.subscribers && (
            <p className="text-sm text-muted">
              {artist!.subscribers}
            </p>
          )}
        </div>
      </div>

      <div className="mb-5">
        <Button onClick={playTopSong}>
          <Play size={14} /> {t("common.playTopSong")}
        </Button>
      </div>

      {artist!.songs && artist!.songs.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-2.5 text-sm font-semibold text-primary">{t("common.topSongs")}</h3>
          <div className="flex flex-col gap-1.5">
            {artist!.songs!.slice(0, 5).map((song) => (
              <SongCard key={song.videoId} song={song} />
            ))}
          </div>
        </div>
      )}

      {artist!.albums && artist!.albums.length > 0 && (
        <div>
          <h3 className="mb-2.5 text-sm font-semibold text-primary">{t("search.albums")}</h3>
          <div className="grid grid-cols-3 gap-3">
            {artist!.albums!.map((album) => (
              <AlbumCard key={album.browseId} album={album} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
