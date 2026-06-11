import { usePlayer } from "../../hooks/usePlayer"
import { Play, Pause, SkipBack, SkipForward, Loader2 } from "lucide-react"

export default function Controls() {
  const { isPlaying, isLoading, pause, resume, next, previous, currentSong } = usePlayer()

  if (!currentSong) return null

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={previous}
        className="cursor-pointer p-1.5 text-secondary transition-colors duration-150 hover:opacity-80"
      >
        <SkipBack size={20} fill="currentColor" />
      </button>
      <button
        onClick={() => (isPlaying ? pause() : resume())}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-accent text-white transition-all duration-150 hover:scale-105"
      >
        {isLoading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : isPlaying ? (
          <Pause size={18} fill="currentColor" />
        ) : (
          <Play size={18} fill="currentColor" />
        )}
      </button>
      <button
        onClick={next}
        className="cursor-pointer p-1.5 text-secondary transition-colors duration-150 hover:opacity-80"
      >
        <SkipForward size={20} fill="currentColor" />
      </button>
    </div>
  )
}
