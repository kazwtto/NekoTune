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
        className="group relative h-1 flex-1 cursor-pointer rounded-full bg-elevated"
        onClick={(e) => {
          if (duration <= 0) return
          const rect = e.currentTarget.getBoundingClientRect()
          const x = (e.clientX - rect.left) / rect.width
          seek(x * duration)
        }}
      >
        <div
          className="h-full rounded-full bg-accent transition-all duration-100"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="min-w-9 text-xs tabular-nums text-muted">
        {formatTime(duration)}
      </span>
    </div>
  )
}
