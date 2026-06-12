import { useNavigate } from "react-router-dom"
import type { Album } from "../../types/music"
import { Music } from "lucide-react"
import { proxyUrl } from "../../services/proxy"

interface AlbumCardProps {
  album: Album
}

export default function AlbumCard({ album }: AlbumCardProps) {
  const navigate = useNavigate()

  return (
    <div
      className="group cursor-pointer rounded-lg p-2.5 transition-all duration-150 hover:bg-bg-hover"
      onClick={() => navigate(`/album/${album.browseId}`)}
    >
      <div className="mb-2.5 overflow-hidden rounded-lg aspect-square">
        {album.coverUrl ? (
          <img src={proxyUrl(album.coverUrl)} alt={album.title} className="h-full w-full object-cover" />
        ) : (
          <div className="thumb-placeholder h-full w-full" />
        )}
      </div>
      <p className="truncate text-sm font-medium text-primary">{album.title}</p>
      <p className="truncate text-xs text-secondary">
        {album.artist}
        {album.year && <span> · {album.year}</span>}
      </p>
    </div>
  )
}
