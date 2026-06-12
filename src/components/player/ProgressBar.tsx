import { usePlayer } from "../../hooks/usePlayer"
import { formatTime } from "../../utils/format"

export default function ProgressBar() {
  const { progress, duration, seek } = usePlayer()

  const pct = duration > 0 ? (progress / duration) * 100 : 0

  return (
    <div className="flex w-full items-center gap-3">
      <span className="min-w-9 text-right text-xs tabular-nums text-muted">
        {formatTime(progress)}
      </span>
      <div
        className="group relative h-1 flex-1 cursor-pointer rounded-full bg-white/10"
        onClick={(e) => {
          if (duration <= 0) return
          const rect = e.currentTarget.getBoundingClientRect()
          const x = (e.clientX - rect.left) / rect.width
          seek(x * duration)
        }}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-white transition-all duration-100"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow-md transition-opacity group-hover:opacity-100"
          style={{ left: `${pct}%` }}
        />
      </div>
      <span className="min-w-9 text-xs tabular-nums text-muted">
        {formatTime(duration)}
      </span>
    </div>
  )
}
