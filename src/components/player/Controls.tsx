import { usePlayer } from "../../hooks/usePlayer"
import { Play, Pause, SkipBack, SkipForward } from "lucide-react"

export default function Controls() {
  const { isPlaying, pause, resume, next, previous, currentSong } = usePlayer()

  if (!currentSong) return null

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={previous}
        className="cursor-pointer transition-colors duration-150 hover:opacity-80"
        style={{ background: "none", border: "none", color: "var(--text-secondary)", padding: 6 }}
      >
        <SkipBack size={20} fill="currentColor" />
      </button>
      <button
        onClick={() => (isPlaying ? pause() : resume())}
        className="flex cursor-pointer items-center justify-center rounded-full transition-all duration-150 hover:scale-105"
        style={{
          width: 40,
          height: 40,
          background: "var(--accent)",
          border: "none",
          color: "#fff",
        }}
      >
        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
      </button>
      <button
        onClick={next}
        className="cursor-pointer transition-colors duration-150 hover:opacity-80"
        style={{ background: "none", border: "none", color: "var(--text-secondary)", padding: 6 }}
      >
        <SkipForward size={20} fill="currentColor" />
      </button>
    </div>
  )
}
