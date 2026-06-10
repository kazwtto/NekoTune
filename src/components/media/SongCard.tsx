import { usePlayer } from "../../hooks/usePlayer"
import { Play, Plus } from "lucide-react"
import type { Song } from "../../types/music"
import { formatTime } from "../../utils/format"
import { useState } from "react"
import ContextMenu, { ContextMenuItem } from "../ui/ContextMenu"

interface SongCardProps {
  song: Song
  index?: number
}

export default function SongCard({ song, index }: SongCardProps) {
  const { play, addToQueue } = usePlayer()
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null)

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
        className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-150"
        style={{ background: "var(--bg-surface)" }}
        onClick={handlePlay}
        onContextMenu={handleContextMenu}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-surface)")}
      >
        {index !== undefined && (
          <span className="w-5 text-center text-xs" style={{ color: "var(--text-muted)" }}>
            {index + 1}
          </span>
        )}
        {song.albumArtUrl && (
          <img src={song.albumArtUrl} alt="" className="h-10 w-10 flex-shrink-0 rounded-lg object-cover" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{song.title}</p>
          <p className="truncate text-xs" style={{ color: "var(--text-secondary)" }}>
            {song.artist}
            {song.album && <span> • {song.album}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs tabular-nums" style={{ color: "var(--text-muted)" }}>
            {formatTime(song.duration)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              addToQueue(song)
            }}
            className="cursor-pointer opacity-0 transition-opacity duration-150 group-hover:opacity-100"
            style={{ background: "none", border: "none", color: "var(--text-muted)", padding: 4 }}
            title="Add to queue"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {menuPos && (
        <ContextMenu x={menuPos.x} y={menuPos.y} onClose={() => setMenuPos(null)}>
          <ContextMenuItem onClick={handlePlay}>
            <Play size={14} /> Play
          </ContextMenuItem>
          <ContextMenuItem onClick={() => { addToQueue(song); setMenuPos(null) }}>
            <Plus size={14} /> Add to Queue
          </ContextMenuItem>
        </ContextMenu>
      )}
    </>
  )
}
