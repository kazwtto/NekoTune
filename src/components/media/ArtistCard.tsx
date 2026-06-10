import { useNavigate } from "react-router-dom"
import type { Artist } from "../../types/music"
import { User } from "lucide-react"

interface ArtistCardProps {
  artist: Artist
}

export default function ArtistCard({ artist }: ArtistCardProps) {
  const navigate = useNavigate()

  return (
    <div
      className="group cursor-pointer rounded-lg p-2.5 text-center transition-all duration-150"
      onClick={() => navigate(`/artist/${artist.browseId}`)}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div className="mx-auto mb-2.5 overflow-hidden rounded-full" style={{ width: 90, height: 90 }}>
        {artist.imageUrl ? (
          <img src={artist.imageUrl} alt={artist.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center" style={{ background: "var(--bg-surface)" }}>
            <User size={28} style={{ color: "var(--text-muted)" }} />
          </div>
        )}
      </div>
      <p className="truncate text-sm font-medium">{artist.name}</p>
      {artist.subscribers && (
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {artist.subscribers}
        </p>
      )}
    </div>
  )
}
