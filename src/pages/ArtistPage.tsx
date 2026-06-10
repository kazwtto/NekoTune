import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useArtist } from "../hooks/useInnertube"
import { usePlayer } from "../hooks/usePlayer"
import SongCard from "../components/media/SongCard"
import AlbumCard from "../components/media/AlbumCard"
import Shimmer from "../components/ui/Shimmer"
import Button from "../components/ui/Button"
import { Play, ArrowLeft, User } from "lucide-react"

export default function ArtistPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: artist, isLoading, error } = useArtist(id || "")
  const { play } = usePlayer()

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
        <p className="text-sm" style={{ color: "var(--error)" }}>Failed to load artist</p>
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
          className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-full"
          style={{ background: "var(--bg-surface)" }}
        >
          {artist!.imageUrl ? (
            <img src={artist!.imageUrl} alt={artist!.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <User size={32} style={{ color: "var(--text-muted)" }} />
            </div>
          )}
        </div>
        <div>
          <h2 className="text-lg font-bold">{artist!.name}</h2>
          {artist!.subscribers && (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {artist!.subscribers}
            </p>
          )}
        </div>
      </div>

      <div className="mb-5">
        <Button onClick={playTopSong}>
          <Play size={14} /> Play Top Song
        </Button>
      </div>

      {artist!.songs && artist!.songs.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-2.5 text-sm font-semibold">Top Songs</h3>
          <div className="flex flex-col gap-1.5">
            {artist!.songs!.slice(0, 5).map((song) => (
              <SongCard key={song.videoId} song={song} />
            ))}
          </div>
        </div>
      )}

      {artist!.albums && artist!.albums.length > 0 && (
        <div>
          <h3 className="mb-2.5 text-sm font-semibold">Albums</h3>
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
