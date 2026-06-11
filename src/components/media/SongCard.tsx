import { useTranslation } from "react-i18next"
import { usePlayer } from "../../hooks/usePlayer"
import { useLibraryStore } from "../../stores/libraryStore"
import { Play, Plus, Heart } from "lucide-react"
import type { Song } from "../../types/music"
import { formatTime } from "../../utils/format"
import { useState } from "react"
import ContextMenu, { ContextMenuItem } from "../ui/ContextMenu"
import { proxyUrl, highResThumb } from "../../services/proxy"

interface SongCardProps {
  song: Song
  index?: number
}

export default function SongCard({ song, index }: SongCardProps) {
  const { t } = useTranslation()
  const { play, addToQueue } = usePlayer()
  const { favorites, toggleFavorite } = useLibraryStore()
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null)

  const isFav = favorites.includes(song.videoId)

  function handlePlay() {
    play(song)
  }

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault()
    setMenuPos({ x: e.clientX, y: e.clientY })
  }

  return (
    <>
      <div
        className="group flex cursor-pointer items-center gap-3 rounded-lg bg-surface px-3 py-2.5 transition-all duration-150 hover:bg-bg-hover"
        onClick={handlePlay}
        onContextMenu={handleContextMenu}
      >
        {index !== undefined && (
          <span className="w-5 text-center text-xs text-muted">
            {index + 1}
          </span>
        )}
        {song.albumArtUrl || song.videoId ? (
          <img src={highResThumb(song.videoId) || proxyUrl(song.albumArtUrl)} alt="" className="h-10 w-10 flex-shrink-0 rounded-lg object-cover" />
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-primary">{song.title}</p>
          <p className="truncate text-xs text-secondary">
            {song.artist}
            {song.album && <span> · {song.album}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs tabular-nums text-muted">
            {formatTime(song.duration)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleFavorite(song.videoId)
            }}
            className={`cursor-pointer p-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 ${isFav ? "text-accent opacity-100" : "text-muted"}`}
          >
            <Heart size={14} fill={isFav ? "currentColor" : "none"} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              addToQueue(song)
            }}
            className="cursor-pointer p-1 text-muted opacity-0 transition-opacity duration-150 group-hover:opacity-100"
            title={t("player.addToQueue")}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {menuPos && (
        <ContextMenu x={menuPos.x} y={menuPos.y} onClose={() => setMenuPos(null)}>
          <ContextMenuItem onClick={handlePlay}>
            <Play size={14} /> {t("common.play")}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => { addToQueue(song); setMenuPos(null) }}>
            <Plus size={14} /> {t("player.addToQueue")}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => { toggleFavorite(song.videoId); setMenuPos(null) }}>
            <Heart size={14} fill={isFav ? "currentColor" : "none"} /> {isFav ? t("common.favorites") : t("common.favorites")}
          </ContextMenuItem>
        </ContextMenu>
      )}
    </>
  )
}
