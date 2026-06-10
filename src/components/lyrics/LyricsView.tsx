import { useLyrics } from "../../hooks/useLyrics"
import { usePlayerStore } from "../../stores/playerStore"
import { Music } from "lucide-react"

export default function LyricsView() {
  const { lyrics, currentLineIndex, loading } = useLyrics()
  const currentSong = usePlayerStore((s) => s.currentSong)

  if (!currentSong) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <Music size={32} style={{ color: "var(--text-muted)" }} />
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          No song playing
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Loading lyrics...
        </p>
      </div>
    )
  }

  if (lyrics.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          No lyrics found for &ldquo;{currentSong.title}&rdquo;
        </p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          by {currentSong.artist}
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col justify-center gap-2 overflow-y-auto px-4 py-8">
      {lyrics.map((line, i) => {
        const isActive = i === currentLineIndex
        return (
          <div
            key={i}
            className="text-center transition-all duration-300"
            style={{
              opacity: isActive ? 1 : i < currentLineIndex ? 0.25 : 0.4,
              transform: isActive ? "scale(1.08)" : "scale(1)",
            }}
          >
            <p
              className="text-lg font-medium transition-colors duration-300"
              style={{
                color: isActive ? "var(--accent)" : "var(--text-secondary)",
                textShadow: isActive ? "0 0 24px var(--accent-glow)" : "none",
              }}
            >
              {line.text}
            </p>
          </div>
        )
      })}
    </div>
  )
}
