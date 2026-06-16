import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Heart,
  Loader2,
} from "lucide-react"
import { useCallback, useEffect } from "react"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { emit, listen } from "@tauri-apps/api/event"
import { usePlayerStore, setIsSyncing } from "../../stores/playerStore"
import { useLibraryStore } from "../../stores/libraryStore"
import ProgressBar from "./ProgressBar"
import { proxyUrl, highResThumb } from "../../services/proxy"

export default function MiniPlayer() {
  const currentSong = usePlayerStore((s) => s.currentSong)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const isLoading = usePlayerStore((s) => s.isLoading)
  const shuffle = usePlayerStore((s) => s.shuffle)
  const repeat = usePlayerStore((s) => s.repeat)
  const { favorites, toggleFavorite } = useLibraryStore()

  useEffect(() => {
    const unlisten = listen<{
      currentSong: any
      isPlaying: boolean
      isLoading: boolean
      progress: number
      duration: number
      shuffle: boolean
      repeat: string
      queue: any[]
      queueIndex: number
    }>("player-state-changed", ({ payload }) => {
      setIsSyncing(true)
      usePlayerStore.setState({
        currentSong: payload.currentSong,
        isPlaying: payload.isPlaying,
        isLoading: payload.isLoading,
        progress: payload.progress,
        duration: payload.duration,
        shuffle: payload.shuffle,
        repeat: payload.repeat as any,
        queue: payload.queue,
        queueIndex: payload.queueIndex,
      })
      setIsSyncing(false)
    })
    return () => { unlisten.then(fn => fn()) }
  }, [])

  const sendCommand = useCallback((action: string) => {
    emit("player-command", { action })
  }, [])

  const startDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    getCurrentWindow().startDragging()
  }, [])

  const isFav = currentSong ? favorites.includes(currentSong.videoId) : false

  return (
    <div
      className="flex h-full w-full flex-col"
      onMouseDown={startDrag}
    >
      <div className="flex flex-1 items-center" style={{ gap: "4.21vw", paddingLeft: "4.21vw", paddingRight: "4.21vw" }}>
        <div className="flex min-w-0 items-center" style={{ width: "50.53vw", minWidth: "42.11vw", gap: "3.16vw" }}>
          <div className="relative flex-shrink-0 overflow-hidden rounded-lg bg-elevated" style={{ width: "11.58vw", height: "11.58vw" }}>
            {currentSong?.isLocal ? (
              currentSong.albumArtUrl ? (
                <img src={currentSong.albumArtUrl} alt={currentSong.title} className="h-full w-full object-cover" />
              ) : (
                <div className="thumb-placeholder h-full w-full" />
              )
            ) : currentSong?.albumArtUrl || currentSong?.videoId ? (
              <img src={highResThumb(currentSong.videoId) || proxyUrl(currentSong.albumArtUrl)} alt={currentSong.title} className="h-full w-full object-cover" />
            ) : (
              <div className="thumb-placeholder h-full w-full" />
            )}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Loader2 className="animate-spin text-white" style={{ width: "4.21vw", height: "4.21vw" }} />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium" style={{ fontSize: "3.68vw" }}>
              {currentSong?.title || "Nenhuma musica"}
            </p>
            <p className="truncate text-secondary" style={{ fontSize: "3.16vw" }}>
              {currentSong?.artist || ""}
            </p>
          </div>
          {currentSong && (
            <button
              onClick={(e) => { e.stopPropagation(); toggleFavorite(currentSong.videoId) }}
              onMouseDown={(e) => e.stopPropagation()}
              className={`cursor-pointer transition-colors duration-150 ${isFav ? "text-accent" : "text-muted hover:text-primary"}`}
              style={{ padding: "1.05vw" }}
            >
              <Heart style={{ width: "3.68vw", height: "3.68vw" }} fill={isFav ? "currentColor" : "none"} />
            </button>
          )}
        </div>

        <div className="flex items-center" style={{ gap: "4.21vw" }}>
          <button
            onClick={(e) => { e.stopPropagation(); sendCommand("toggle-shuffle") }}
            onMouseDown={(e) => e.stopPropagation()}
            className={`cursor-pointer transition-colors duration-150 ${
              shuffle ? "text-accent" : "text-muted"
            }`}
            style={{ padding: "1.05vw" }}
          >
            <Shuffle style={{ width: "3.68vw", height: "3.68vw" }} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); sendCommand("previous") }}
            onMouseDown={(e) => e.stopPropagation()}
            className="cursor-pointer text-secondary transition-colors duration-150 hover:opacity-80"
            style={{ padding: "1.05vw" }}
          >
            <SkipBack style={{ width: "4.21vw", height: "4.21vw" }} fill="currentColor" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); sendCommand("toggle-play") }}
            onMouseDown={(e) => e.stopPropagation()}
            className="flex cursor-pointer items-center justify-center rounded-full bg-accent text-white transition-all duration-150 hover:scale-105"
            style={{ width: "8.42vw", height: "8.42vw" }}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" style={{ width: "3.68vw", height: "3.68vw" }} />
            ) : isPlaying ? (
              <Pause style={{ width: "3.68vw", height: "3.68vw" }} fill="currentColor" />
            ) : (
              <Play style={{ width: "3.68vw", height: "3.68vw" }} fill="currentColor" />
            )}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); sendCommand("next") }}
            onMouseDown={(e) => e.stopPropagation()}
            className="cursor-pointer text-secondary transition-colors duration-150 hover:opacity-80"
            style={{ padding: "1.05vw" }}
          >
            <SkipForward style={{ width: "4.21vw", height: "4.21vw" }} fill="currentColor" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); sendCommand("toggle-repeat") }}
            onMouseDown={(e) => e.stopPropagation()}
            className={`cursor-pointer transition-colors duration-150 ${
              repeat !== "off" ? "text-accent" : "text-muted"
            }`}
            style={{ padding: "1.05vw" }}
          >
            <Repeat style={{ width: "3.68vw", height: "3.68vw" }} />
          </button>
        </div>
      </div>

      <div style={{ paddingLeft: "4.21vw", paddingRight: "4.21vw", paddingBottom: "2.11vw", paddingTop: "1.05vw" }}>
        <ProgressBar showTime={false} />
      </div>
    </div>
  )
}
