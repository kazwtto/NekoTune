import { useNavigate } from "react-router-dom"
import type { Playlist } from "../../types/music"
import { ListMusic } from "lucide-react"

interface PlaylistCardProps {
  playlist: Playlist
}

export default function PlaylistCard({ playlist }: PlaylistCardProps) {
  const navigate = useNavigate()

  return (
    <div
      className="group cursor-pointer rounded-lg p-2.5 transition-all duration-150"
      onClick={() => navigate(`/playlist/${playlist.browseId}`)}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div className="mb-2.5 overflow-hidden rounded-lg" style={{ aspectRatio: "1/1" }}>
        {playlist.coverUrl ? (
          <img src={playlist.coverUrl} alt={playlist.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center" style={{ background: "var(--bg-surface)" }}>
            <ListMusic size={24} style={{ color: "var(--text-muted)" }} />
          </div>
        )}
      </div>
      <p className="truncate text-sm font-medium">{playlist.title}</p>
      <p className="truncate text-xs" style={{ color: "var(--text-secondary)" }}>
        {playlist.songCount} songs
        {playlist.owner && <span> • {playlist.owner}</span>}
      </p>
    </div>
  )
}
