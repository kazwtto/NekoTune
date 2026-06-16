import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import type { Playlist } from "../../types/music"
import { proxyUrl } from "../../services/proxy"

interface PlaylistCardProps {
  playlist: Playlist
}

export default function PlaylistCard({ playlist }: PlaylistCardProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div
      className="group cursor-pointer rounded-lg p-2.5 transition-all duration-150 hover:bg-bg-hover"
      onClick={() => navigate(`/playlist/${playlist.browseId}`)}
    >
      <div className="mb-2.5 overflow-hidden rounded-lg aspect-square">
        {playlist.coverUrl ? (
          <img src={proxyUrl(playlist.coverUrl)} alt={playlist.title} className="h-full w-full object-cover" />
        ) : (
          <div className="thumb-placeholder h-full w-full" />
        )}
      </div>
      <p className="truncate text-sm font-medium text-primary">{playlist.title}</p>
      <p className="truncate text-xs text-secondary">
        {playlist.songCount} {t("playlist.songs")}
        {playlist.owner && <span> · {playlist.owner}</span>}
      </p>
    </div>
  )
}
