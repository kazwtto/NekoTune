import { usePlayer } from "../../hooks/usePlayer"
import { formatTime } from "../../utils/format"

export default function ProgressBar() {
  const { progress, duration, seek } = usePlayer()

  const pct = duration > 0 ? (progress / duration) * 100 : 0

  return (
    <div className="flex w-full items-center gap-3">
      <span className="text-xs tabular-nums" style={{ color: "var(--text-muted)", minWidth: 36, textAlign: "right" }}>
        {formatTime(progress)}
      </span>
      <div
        className="group relative flex-1 cursor-pointer rounded-full"
        style={{ height: 4, background: "var(--bg-elevated)" }}
        onClick={(e) => {
          if (duration <= 0) return
          const rect = e.currentTarget.getBoundingClientRect()
          const x = (e.clientX - rect.left) / rect.width
          seek(x * duration)
        }}
      >
        <div
          className="rounded-full transition-all duration-100"
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "var(--accent)",
          }}
        />
      </div>
      <span className="text-xs tabular-nums" style={{ color: "var(--text-muted)", minWidth: 36 }}>
        {formatTime(duration)}
      </span>
    </div>
  )
}
