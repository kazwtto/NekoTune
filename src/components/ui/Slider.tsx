import { useRef, useCallback, type CSSProperties } from "react"

interface SliderProps {
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
  style?: CSSProperties
  className?: string
  height?: number
}

export default function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  style,
  className = "",
  height = 4,
}: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = trackRef.current?.getBoundingClientRect()
      if (!rect) return
      const x = (e.clientX - rect.left) / rect.width
      const val = min + x * (max - min)
      onChange(Math.round(val / step) * step)
    },
    [min, max, step, onChange],
  )

  const pct = ((value - min) / (max - min)) * 100

  return (
    <div
      ref={trackRef}
      onClick={handleClick}
      className={`cursor-pointer rounded-full bg-elevated ${className}`}
      style={{ height, position: "relative", ...style }}
    >
      <div
        className="h-full rounded-full bg-accent transition-all duration-100"
        style={{ width: `${pct}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </div>
  )
}
