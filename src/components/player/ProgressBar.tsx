import { useState } from "react"
import { usePlayer } from "../../hooks/usePlayer"
import { usePlayerStore } from "../../stores/playerStore"
import { formatTime } from "../../utils/format"

export default function ProgressBar({ showTime = true, onSeek }: { showTime?: boolean; onSeek?: (time: number) => void }) {
  const { progress, duration, seek: defaultSeek } = usePlayer()
  const seek = onSeek || defaultSeek
  const [isDragging, setIsDragging] = useState(false)
  const [dragProgress, setDragProgress] = useState(0)

  const displayProgress = isDragging ? dragProgress : progress
  const pct = duration > 0 ? (displayProgress / duration) * 100 : 0

  return (
    <div className="flex w-full items-center gap-3">
      {showTime && (
        <span className="min-w-9 text-right text-xs tabular-nums text-muted select-none">
          {formatTime(displayProgress)}
        </span>
      )}
      <div className="group relative h-1 flex-1 cursor-pointer rounded-full bg-white/10 flex items-center">
        <div
          className="absolute left-0 h-full rounded-full bg-white transition-all pointer-events-none"
          style={{ width: `${pct}%`, transitionDuration: isDragging ? '0ms' : '100ms' }}
        />
        <div
          className={`absolute h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-white shadow-md transition-opacity pointer-events-none ${
            isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
          style={{ left: `${pct}%` }}
        />
        <input
          type="range"
          min={0}
          max={duration || 100}
          step="any"
          value={displayProgress}
          onMouseDown={(e) => {
            e.stopPropagation()
            setIsDragging(true)
            setDragProgress(Number(e.currentTarget.value))
          }}
          onChange={(e) => {
            setIsDragging(true)
            setDragProgress(Number(e.target.value))
          }}
          onMouseUp={(e) => {
            const val = Number(e.currentTarget.value)
            setIsDragging(false)
            usePlayerStore.setState({ progress: val })
            seek(val)
          }}
          onTouchEnd={(e) => {
            const val = Number(e.currentTarget.value)
            setIsDragging(false)
            usePlayerStore.setState({ progress: val })
            seek(val)
          }}
          onKeyUp={(e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
               const val = Number(e.currentTarget.value)
               usePlayerStore.setState({ progress: val })
               seek(val)
            }
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer m-0 p-0"
        />
      </div>
      {showTime && (
        <span className="min-w-9 text-xs tabular-nums text-muted select-none">
          {formatTime(duration)}
        </span>
      )}
    </div>
  )
}
