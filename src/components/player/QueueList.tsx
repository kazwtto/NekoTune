import { useQueue } from "../../hooks/useQueue"
import { GripVertical, Trash2, Music } from "lucide-react"
import { formatTime } from "../../utils/format"
import { proxyUrl } from "../../services/proxy"

export default function QueueList() {
  const { queue, queueIndex, remove } = useQueue()

  if (queue.length === 0) return null

  return (
    <div className="flex flex-col gap-0.5">
      {queue.map((song, i) => (
        <div
          key={`${song.videoId}-${i}`}
          className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-all duration-150 ${
            i === queueIndex ? "bg-accent-muted text-accent" : "text-primary"
          }`}
        >
          <button className="cursor-pointer p-0.5 text-muted">
            <GripVertical size={14} />
          </button>
          {song.isLocal ? (
            song.albumArtUrl ? (
              <img
                src={song.albumArtUrl}
                alt=""
                className="h-8 w-8 flex-shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="thumb-placeholder h-8 w-8" />
            )
          ) : song.albumArtUrl ? (
            <img
              src={proxyUrl(song.albumArtUrl)}
              alt=""
              className="h-8 w-8 flex-shrink-0 rounded-lg object-cover"
            />
          ) : (
            <div className="thumb-placeholder h-8 w-8" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">{song.title}</p>
            <p className="truncate text-muted">
              {song.artist}
            </p>
          </div>
          {song.duration > 0 && (
          <span className="flex-shrink-0 tabular-nums text-muted">
            {formatTime(song.duration)}
          </span>
          )}
          <button
            onClick={() => remove(i)}
            className="cursor-pointer p-1 text-muted transition-colors duration-150 hover:opacity-80"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
    </div>
  )
}
