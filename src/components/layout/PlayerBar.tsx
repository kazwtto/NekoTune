import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Heart,
  Maximize2,
  Loader2,
} from "lucide-react"
import { usePlayer } from "../../hooks/usePlayer"
import { useUiStore } from "../../stores/uiStore"
import { useLibraryStore } from "../../stores/libraryStore"
import VolumeSlider from "../player/VolumeSlider"
import ProgressBar from "../player/ProgressBar"
import { proxyUrl, highResThumb } from "../../services/proxy"

export default function PlayerBar() {
  const {
    currentSong,
    isPlaying,
    isLoading,
    pause,
    resume,
    next,
    previous,
    shuffle,
    repeat,
    toggleShuffle,
    toggleRepeat,
  } = usePlayer()
  const setNowPlayingVisible = useUiStore((s) => s.setNowPlayingVisible)
  const { favorites, toggleFavorite } = useLibraryStore()

  if (!currentSong) return null

  const isFav = favorites.includes(currentSong.videoId)

  return (
    <div className="flex h-[72px] items-center gap-4 border-t border-border bg-player px-4">
      <div className="flex w-48 min-w-40 items-center gap-3">
        <div
          className="relative h-11 w-11 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg bg-elevated transition-transform duration-150 hover:scale-105"
          onClick={() => setNowPlayingVisible(true)}
        >
          {currentSong.albumArtUrl || currentSong.videoId ? (
            <img src={highResThumb(currentSong.videoId) || proxyUrl(currentSong.albumArtUrl)} alt={currentSong.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-muted">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
          )}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 size={16} className="animate-spin text-white" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="cursor-pointer truncate text-sm font-medium hover:underline"
            onClick={() => setNowPlayingVisible(true)}
          >
            {currentSong.title}
          </p>
          <p className="truncate text-xs text-secondary">
            {currentSong.artist}
          </p>
        </div>
        <button
          onClick={() => toggleFavorite(currentSong.videoId)}
          className={`cursor-pointer p-1 transition-colors duration-150 ${isFav ? "text-accent" : "text-muted hover:text-primary"}`}
        >
          <Heart size={14} fill={isFav ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center gap-1">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleShuffle}
            className={`cursor-pointer p-1 transition-colors duration-150 ${
              shuffle ? "text-accent" : "text-muted"
            }`}
          >
            <Shuffle size={14} />
          </button>
          <button onClick={previous} className="cursor-pointer p-1 text-secondary transition-colors duration-150 hover:opacity-80">
            <SkipBack size={16} fill="currentColor" />
          </button>
          <button
            onClick={isPlaying ? pause : resume}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-accent text-white transition-all duration-150 hover:scale-105"
          >
            {isLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : isPlaying ? (
              <Pause size={14} fill="currentColor" />
            ) : (
              <Play size={14} fill="currentColor" />
            )}
          </button>
          <button onClick={next} className="cursor-pointer p-1 text-secondary transition-colors duration-150 hover:opacity-80">
            <SkipForward size={16} fill="currentColor" />
          </button>
          <button
            onClick={toggleRepeat}
            className={`cursor-pointer p-1 transition-colors duration-150 ${
              repeat !== "off" ? "text-accent" : "text-muted"
            }`}
          >
            <Repeat size={14} />
          </button>
        </div>
        <ProgressBar />
      </div>

      <div className="flex w-36 items-center justify-end gap-3">
        <VolumeSlider />
        <button
          onClick={() => setNowPlayingVisible(true)}
          className="cursor-pointer p-1 text-muted transition-colors duration-150 hover:opacity-80"
        >
          <Maximize2 size={14} />
        </button>
      </div>
    </div>
  )
}
