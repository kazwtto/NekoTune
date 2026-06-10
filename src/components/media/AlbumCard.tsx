import { useNavigate } from "react-router-dom"
import type { Album } from "../../types/music"
import { Music } from "lucide-react"

interface AlbumCardProps {
  album: Album
}

export default function AlbumCard({ album }: AlbumCardProps) {
  const navigate = useNavigate()

  return (
    <div
      className="group cursor-pointer rounded-lg p-2.5 transition-all duration-150"
      onClick={() => navigate(`/album/${album.browseId}`)}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div
        className="mb-2.5 overflow-hidden rounded-lg"
        style={{ aspectRatio: "1/1" }}
      >
        {album.coverUrl ? (
          <img src={album.coverUrl} alt={album.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center" style={{ background: "var(--bg-surface)" }}>
            <Music size={24} style={{ color: "var(--text-muted)" }} />
          </div>
        )}
      </div>
      <p className="truncate text-sm font-medium">{album.title}</p>
      <p className="truncate text-xs" style={{ color: "var(--text-secondary)" }}>
        {album.artist}
        {album.year && <span> • {album.year}</span>}
      </p>
    </div>
  )
}
