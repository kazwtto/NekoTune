import { useNavigate } from "react-router-dom"
import type { Artist } from "../../types/music"
import { User } from "lucide-react"
import { proxyUrl } from "../../services/proxy"

interface ArtistCardProps {
  artist: Artist
}

export default function ArtistCard({ artist }: ArtistCardProps) {
  const navigate = useNavigate()

  return (
    <div
      className="group cursor-pointer rounded-lg p-2.5 text-center transition-all duration-150 hover:bg-bg-hover"
      onClick={() => navigate(`/artist/${artist.browseId}`)}
    >
      <div className="mx-auto mb-2.5 h-[90px] w-[90px] overflow-hidden rounded-full">
        {artist.imageUrl ? (
          <img src={proxyUrl(artist.imageUrl)} alt={artist.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface">
            <User size={28} className="text-muted" />
          </div>
        )}
      </div>
      <p className="truncate text-sm font-medium text-primary">{artist.name}</p>
      {artist.subscribers && (
        <p className="text-xs text-secondary">
          {artist.subscribers}
        </p>
      )}
    </div>
  )
}
