import { useState } from "react"
import { useTranslation } from "react-i18next"
import { usePlayer } from "../../hooks/usePlayer"
import { useLibraryStore } from "../../stores/libraryStore"
import { useDownloadStore } from "../../stores/downloadStore"
import { Play, Plus, Heart, Trash2, MoreVertical } from "lucide-react"
import type { LocalSong } from "../../types/music"
import { formatTime } from "../../utils/format"
import ContextMenu, { ContextMenuItem } from "../ui/ContextMenu"

interface LocalSongCardProps {
  song: LocalSong
  index?: number
}

function localSongToSong(local: LocalSong) {
  return {
    id: local.videoId || local.id,
    videoId: local.videoId || local.id,
    title: local.title,
    artist: local.artist,
    album: local.album,
    albumArtUrl: local.coverData,
    duration: local.duration,
    isLocal: true,
    filePath: local.filePath,
    fileData: local.fileData,
  }
}

export default function LocalSongCard({ song, index }: LocalSongCardProps) {
  const { t } = useTranslation()
  const { play, addToQueue } = usePlayer()
  const { toggleFavorite, favorites } = useLibraryStore()
  const { remove } = useDownloadStore()
  const [coverFailed, setCoverFailed] = useState(false)
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null)
  const showCover = song.coverData && !coverFailed

  const effectiveId = song.videoId || song.id
  const isFav = favorites.includes(effectiveId)

  function handlePlay() {
    play(localSongToSong(song))
  }

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault()
    setMenuPos({ x: e.clientX, y: e.clientY })
  }

  async function handleRemove() {
    if (song.videoId) {
      if (window.confirm(t("library.removeDownloadConfirm"))) {
        await remove(song.videoId)
        setMenuPos(null)
      }
    }
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
        {showCover ? (
          <img
            src={song.coverData}
            alt=""
            className="h-10 w-10 flex-shrink-0 rounded-lg object-cover"
            onError={() => setCoverFailed(true)}
          />
        ) : (
          <div className="thumb-placeholder h-10 w-10" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-primary">{song.title}</p>
          <p className="truncate text-xs text-secondary">
            {song.artist}
            {song.album && <span> · {song.album}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {song.duration > 0 && (
            <span className="text-xs tabular-nums text-muted">
              {formatTime(song.duration)}
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleContextMenu(e)
            }}
            className="cursor-pointer p-1 text-muted opacity-0 transition-all duration-150 group-hover:opacity-100 hover:text-accent/70"
          >
            <MoreVertical size={14} />
          </button>
        </div>
      </div>

      {menuPos && (
        <ContextMenu x={menuPos.x} y={menuPos.y} onClose={() => setMenuPos(null)}>
          <ContextMenuItem onClick={() => { handlePlay(); setMenuPos(null) }}>
            <Play size={14} /> {t("common.play")}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => { addToQueue(localSongToSong(song)); setMenuPos(null) }}>
            <Plus size={14} /> {t("player.addToQueue")}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => { toggleFavorite(effectiveId); setMenuPos(null) }}>
            <Heart size={14} fill={isFav ? "currentColor" : "none"} /> {isFav ? t("common.removeFromFavorites") : t("common.addToFavorites")}
          </ContextMenuItem>
          {song.videoId && (
            <ContextMenuItem onClick={() => { handleRemove(); setMenuPos(null) }} className="text-red-500 hover:bg-red-500/10">
              <Trash2 size={14} /> {t("library.removeDownload")}
            </ContextMenuItem>
          )}
        </ContextMenu>
      )}
    </>
  )
}