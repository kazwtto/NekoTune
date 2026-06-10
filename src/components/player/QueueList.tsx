import { useQueue } from "../../hooks/useQueue"
import { GripVertical, Trash2 } from "lucide-react"
import { formatTime } from "../../utils/format"

export default function QueueList() {
  const { queue, queueIndex, remove } = useQueue()

  if (queue.length === 0) return null

  return (
    <div className="flex flex-col gap-0.5">
      {queue.map((song, i) => (
        <div
          key={`${song.videoId}-${i}`}
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-all duration-150"
          style={{
            background: i === queueIndex ? "var(--accent-muted)" : "transparent",
            color: i === queueIndex ? "var(--accent)" : "var(--text-primary)",
          }}
        >
          <button
            className="cursor-pointer"
            style={{ background: "none", border: "none", color: "var(--text-muted)", padding: 2 }}
          >
            <GripVertical size={14} />
          </button>
          {song.albumArtUrl && (
            <img
              src={song.albumArtUrl}
              alt=""
              className="h-8 w-8 flex-shrink-0 rounded-lg object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">{song.title}</p>
            <p className="truncate" style={{ color: "var(--text-muted)" }}>
              {song.artist}
            </p>
          </div>
          <span className="flex-shrink-0 tabular-nums" style={{ color: "var(--text-muted)" }}>
            {formatTime(song.duration)}
          </span>
          <button
            onClick={() => remove(i)}
            className="cursor-pointer transition-colors duration-150 hover:opacity-80"
            style={{ background: "none", border: "none", color: "var(--text-muted)", padding: 4 }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
    </div>
  )
}
