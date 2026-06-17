import { useTranslation } from "react-i18next"
import { usePlayer } from "../../hooks/usePlayer"
import { useLibraryStore } from "../../stores/libraryStore"
import { useDownloadStore } from "../../stores/downloadStore"
import { useUiStore } from "../../stores/uiStore"
import { Play, Plus, Heart, Download, Check, Loader2, Music, ListMusic, MoreHorizontal, Trash2 } from "lucide-react"
import type { Song } from "../../types/music"
import { formatTime } from "../../utils/format"
import { useState } from "react"
import ContextMenu, { ContextMenuItem } from "../ui/ContextMenu"
import { proxyUrl, highResThumb } from "../../services/proxy"

interface SongCardProps {
  song: Song
  index?: number
  variant?: "list" | "compact" | "table"
  isActive?: boolean
  onClick?: () => void
  playlistId?: string
}

export default function SongCard({ song, index, variant = "list", isActive, onClick, playlistId }: SongCardProps) {
  const { t } = useTranslation()
  const { play, addToQueue } = usePlayer()
  const { favorites, toggleFavorite, removeFromPlaylist } = useLibraryStore()
  const { downloadedIds, downloadingIds, download } = useDownloadStore()
  const setPlaylistSelectModalVisible = useUiStore((s) => s.setPlaylistSelectModalVisible)
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null)

  const isFav = favorites.includes(song.videoId)
  const isDownloaded = downloadedIds.has(song.videoId)
  const isDownloading = downloadingIds.has(song.videoId)
  
  const isCompact = variant === "compact"

  function handlePlay() {
    if (onClick) onClick()
    else play(song)
  }

  function handleDownload(e?: React.MouseEvent) {
    e?.stopPropagation()
    if (!isDownloaded && !isDownloading && !song.isLocal) {
      download(song.videoId)
    }
  }

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault()
    setMenuPos({ x: e.clientX, y: e.clientY })
  }

  if (variant === "table") {
    return (
      <>
        <div
          className={`group grid grid-cols-[32px_minmax(0,2.5fr)_minmax(0,2fr)_50px_32px_32px] gap-3 items-center cursor-pointer transition-colors hover:bg-white/5 px-4 py-1.5 border-b border-white/[0.02] last:border-0 ${
            isActive ? "bg-accent/10" : ""
          }`}
          onClick={handlePlay}
          onContextMenu={handleContextMenu}
        >
          <div className="flex items-center justify-center w-full">
            <span className="text-[11px] font-medium text-white/50 group-hover:hidden">
              {index !== undefined ? index + 1 : ""}
            </span>
            <div className="hidden h-5 w-5 items-center justify-center group-hover:flex">
              <Play size={10} fill="currentColor" className="text-white" />
            </div>
          </div>

          <div className="flex items-center gap-3 min-w-0">
            <div className="relative h-8 w-8 flex-shrink-0">
              {song.isLocal ? (
                song.albumArtUrl ? (
                  <img src={song.albumArtUrl} alt="" className="h-full w-full rounded-md object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-md bg-white/5">
                    <Music size={12} className="text-white/40" />
                  </div>
                )
              ) : song.albumArtUrl || song.videoId ? (
                <img src={highResThumb(song.videoId) || proxyUrl(song.albumArtUrl)} alt="" className="h-full w-full rounded-md object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-md bg-white/5">
                  <Music size={12} className="text-white/40" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`truncate text-[12px] font-semibold ${isActive ? "text-[#E83B7E]" : "text-white"}`}>{song.title}</p>
              <p className="truncate text-[11px] text-white/50">{song.artist}</p>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] text-white/50">{song.artist}</p>
          </div>

          <div className="text-[11px] tabular-nums text-white/50 flex items-center justify-end font-medium">
            {song.duration > 0 ? formatTime(song.duration) : ""}
          </div>

          <div className="flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleFavorite(song.videoId)
              }}
              className={`cursor-pointer transition-transform duration-150 hover:scale-110 ${isFav ? "text-[#E83B7E]" : "text-white/40 opacity-0 group-hover:opacity-100 hover:text-white"}`}
            >
              <Heart size={14} fill={isFav ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="flex items-center justify-center">
            <button
              onClick={handleContextMenu}
              className="cursor-pointer text-white/40 opacity-0 transition-all duration-150 group-hover:opacity-100 hover:text-white"
            >
              <MoreHorizontal size={16} />
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
            <ContextMenuItem onClick={() => { setPlaylistSelectModalVisible(true, song); setMenuPos(null) }}>
              <ListMusic size={14} /> {t("common.addToPlaylist")}
            </ContextMenuItem>
            <ContextMenuItem onClick={() => { toggleFavorite(song.videoId); setMenuPos(null) }}>
              <Heart size={14} fill={isFav ? "currentColor" : "none"} /> {isFav ? t("common.removeFromFavorites") : t("common.addToFavorites")}
            </ContextMenuItem>
            {!song.isLocal && (
              <ContextMenuItem 
                onClick={() => { handleDownload(); setMenuPos(null) }} 
                disabled={isDownloaded || isDownloading}
              >
                {isDownloading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : isDownloaded ? (
                  <Check size={14} />
                ) : (
                  <Download size={14} />
                )}
                {isDownloaded ? t("common.downloaded") : isDownloading ? t("common.downloading") : t("common.download")}
              </ContextMenuItem>
            )}
            {playlistId && (
              <ContextMenuItem 
                onClick={() => { removeFromPlaylist(playlistId, song.videoId); setMenuPos(null) }}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 size={14} /> {t("common.remove", "Remover da playlist")}
              </ContextMenuItem>
            )}
          </ContextMenu>
        )}
      </>
    )
  }

  return (
    <>
      <div
        className={`group flex cursor-pointer items-center gap-3 transition-all duration-150 hover:bg-bg-hover ${
          isCompact
            ? "min-w-[280px] max-w-[280px] rounded-xl p-2.5"
            : "w-full rounded-lg bg-surface px-3 py-2.5"
        } ${isActive ? "bg-accent/10 ring-1 ring-accent/20" : ""}`}
        onClick={handlePlay}
        onContextMenu={handleContextMenu}
      >
        {!isCompact && index !== undefined && (
          <span className="w-5 text-center text-xs text-muted">
            {index + 1}
          </span>
        )}
        
        <div className={`relative flex-shrink-0 ${isCompact ? "h-12 w-12" : "h-10 w-10"}`}>
          {song.isLocal ? (
            song.albumArtUrl ? (
              <img src={song.albumArtUrl} alt="" className="h-full w-full rounded-lg object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-lg bg-bg-elevated">
                <Music size={16} className="text-muted" />
              </div>
            )
          ) : song.albumArtUrl || song.videoId ? (
            <img src={highResThumb(song.videoId) || proxyUrl(song.albumArtUrl)} alt="" className="h-full w-full rounded-lg object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-lg bg-bg-elevated">
              <Music size={16} className="text-muted" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            <Play size={16} fill="white" className="text-white" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className={`truncate text-sm font-medium ${isActive ? "text-accent" : "text-primary"}`}>{song.title}</p>
          <p className="truncate text-xs text-secondary">
            {song.artist}
            {!isCompact && song.album && <span> · {song.album}</span>}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isDownloading ? (
            <Loader2 size={14} className="animate-spin text-accent" />
          ) : isDownloaded ? (
            <Check size={14} className="text-accent" />
          ) : (
            !song.isLocal && (
              <button
                onClick={handleDownload}
                className="cursor-pointer p-1 text-muted opacity-0 transition-all duration-150 group-hover:opacity-100 hover:text-accent/70"
                title={t("common.download")}
              >
                <Download size={14} />
              </button>
            )
          )}
          {!isCompact && song.duration > 0 && (
            <span className="text-xs tabular-nums text-muted">{formatTime(song.duration)}</span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleFavorite(song.videoId)
            }}
            className={`cursor-pointer p-1 opacity-0 transition-all duration-150 group-hover:opacity-100 hover:text-accent/70 ${isFav ? "text-accent opacity-100" : "text-muted"}`}
          >
            <Heart size={14} fill={isFav ? "currentColor" : "none"} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              addToQueue(song)
            }}
            className="cursor-pointer p-1 text-muted opacity-0 transition-all duration-150 group-hover:opacity-100 hover:text-accent/70"
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
          <ContextMenuItem onClick={() => { setPlaylistSelectModalVisible(true, song); setMenuPos(null) }}>
            <ListMusic size={14} /> {t("common.addToPlaylist")}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => { toggleFavorite(song.videoId); setMenuPos(null) }}>
            <Heart size={14} fill={isFav ? "currentColor" : "none"} /> {isFav ? t("common.removeFromFavorites") : t("common.addToFavorites")}
          </ContextMenuItem>
          {!song.isLocal && (
            <ContextMenuItem 
              onClick={() => { handleDownload(); setMenuPos(null) }} 
              disabled={isDownloaded || isDownloading}
            >
              {isDownloading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : isDownloaded ? (
                <Check size={14} />
              ) : (
                <Download size={14} />
              )}
              {isDownloaded ? t("common.downloaded") : isDownloading ? t("common.downloading") : t("common.download")}
            </ContextMenuItem>
          )}
          {playlistId && (
            <ContextMenuItem 
              onClick={() => { removeFromPlaylist(playlistId, song.videoId); setMenuPos(null) }}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 size={14} /> {t("common.remove", "Remover da playlist")}
            </ContextMenuItem>
          )}
        </ContextMenu>
      )}
    </>
  )
}
