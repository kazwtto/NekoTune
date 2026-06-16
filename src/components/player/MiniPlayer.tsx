import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Heart,
  Loader2,
  Pin,
  PinOff,
  Eye,
  EyeOff,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { emit, listen } from "@tauri-apps/api/event"
import { motion, AnimatePresence } from "framer-motion"
import { usePlayerStore, setIsSyncing } from "../../stores/playerStore"
import { useLibraryStore } from "../../stores/libraryStore"
import ProgressBar from "./ProgressBar"
import { proxyUrl, highResThumb } from "../../services/proxy"
import { getItem, setItem } from "../../utils/storage"

const SETTINGS_KEY = "nekotune-floating-settings"

function loadSettings() {
  return getItem<{ pinned: boolean; bgVisible: boolean; buttonsVisible: boolean }>(SETTINGS_KEY, {
    pinned: false,
    bgVisible: false,
    buttonsVisible: false,
  })
}

function saveSettings(s: { pinned: boolean; bgVisible: boolean; buttonsVisible: boolean }) {
  setItem(SETTINGS_KEY, s)
}

const fadeScale = {
  initial: { opacity: 0, scale: 0.5, width: 0, margin: 0 },
  animate: { opacity: 1, scale: 1, width: "auto" },
  exit: { opacity: 0, scale: 0.2, width: 0, overflow: "hidden" },
  transition: { duration: 0.2, ease: "easeInOut" as const }
}

export default function MiniPlayer() {
  const currentSong = usePlayerStore((s) => s.currentSong)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const isLoading = usePlayerStore((s) => s.isLoading)
  const shuffle = usePlayerStore((s) => s.shuffle)
  const repeat = usePlayerStore((s) => s.repeat)
  const { favorites, toggleFavorite } = useLibraryStore()

  const [pinned, setPinned] = useState(() => loadSettings().pinned)
  const [bgVisible, setBgVisible] = useState(() => loadSettings().bgVisible)
  const [buttonsVisible, setButtonsVisible] = useState(() => loadSettings().buttonsVisible)

  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 380, height: 60 })

  useEffect(() => {
    saveSettings({ pinned, bgVisible, buttonsVisible })
  }, [pinned, bgVisible, buttonsVisible])

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const unlistenState = listen<{
      currentSong: any; isPlaying: boolean; isLoading: boolean; progress: number;
      duration: number; shuffle: boolean; repeat: string; queue: any[]; queueIndex: number;
    }>("player-state-changed", ({ payload }) => {
      setIsSyncing(true)
      usePlayerStore.setState({
        currentSong: payload.currentSong, isPlaying: payload.isPlaying,
        isLoading: payload.isLoading, progress: payload.progress,
        duration: payload.duration, shuffle: payload.shuffle,
        repeat: payload.repeat as any, queue: payload.queue, queueIndex: payload.queueIndex,
      })
      setIsSyncing(false)
    })

    const unlistenProgress = listen<{ progress: number; duration: number }>("player-progress-changed", ({ payload }) => {
      setIsSyncing(true)
      usePlayerStore.setState({ progress: payload.progress, duration: payload.duration })
      setIsSyncing(false)
    })

    return () => { 
      unlistenState.then(fn => fn()) 
      unlistenProgress.then(fn => fn())
    }
  }, [])

  const sendCommand = useCallback((action: string, extra?: any) => { emit("player-command", { action, ...extra }) }, [])

  const lastClickRef = useRef(0)

  const startDrag = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    const now = Date.now()
    if (now - lastClickRef.current < 300) {
      setButtonsVisible((v: boolean) => !v)
      lastClickRef.current = 0
      return
    }
    lastClickRef.current = now
    
    if (!pinned) {
      e.preventDefault()
      getCurrentWindow().startDragging()
    }
  }, [pinned])

  const isFav = currentSong ? favorites.includes(currentSong.videoId) : false


  const { width, height } = dimensions

  const showProgress = height >= 50
  const showExtras = width >= 340 
  const showPrevNext = width >= 240 
  const showSettings = width >= 280 
  const showInfo = width >= 180 
  const showHeart = width >= 300 

  const availableHeight = showProgress ? height - 16 : height
  const artSize = Math.max(20, Math.min(44, availableHeight * 0.8))
  const playBtnSize = Math.max(24, Math.min(36, availableHeight * 0.7))
  const iconSize = Math.max(10, Math.min(16, availableHeight * 0.3))
  const titleSize = Math.max(10, Math.min(14, availableHeight * 0.3))

  return (
    <motion.div
      ref={containerRef}
      layout
      className={`flex h-full w-full flex-col overflow-hidden ${bgVisible ? "bg-player" : ""}`}
      onMouseDown={startDrag}
    >
      <motion.div layout className="flex min-h-0 flex-1 items-center justify-between gap-2 px-3">
        
        <motion.div layout className="flex min-w-0 items-center gap-2">
          <AnimatePresence>
            {buttonsVisible && showSettings && (
              <motion.div {...fadeScale} className="flex flex-col items-center gap-1 pr-1">
                <button
                  onClick={(e) => { e.stopPropagation(); setPinned(!pinned) }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className={`cursor-pointer p-1 transition-colors duration-150 ${pinned ? "text-accent" : "text-muted hover:text-primary"}`}
                >
                  {pinned ? <PinOff size={iconSize} /> : <Pin size={iconSize} />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setBgVisible(!bgVisible) }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className={`cursor-pointer p-1 transition-colors duration-150 ${bgVisible ? "text-muted hover:text-primary" : "text-accent"}`}
                >
                  {bgVisible ? <EyeOff size={iconSize} /> : <Eye size={iconSize} />}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            layout 
            style={{ width: artSize, height: artSize }}
            className="relative shrink-0 overflow-hidden rounded-md bg-elevated shadow-sm"
          >
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
                <Loader2 size={iconSize} className="animate-spin text-white" />
              </div>
            )}
          </motion.div>

          <AnimatePresence>
            {showInfo && (
              <motion.div {...fadeScale} className="min-w-0 max-w-[130px] shrink flex-col justify-center truncate px-1">
                <p className="truncate font-medium leading-tight" style={{ fontSize: titleSize }}>
                  {currentSong?.title || "Nenhuma musica"}
                </p>
                <p className="truncate text-secondary leading-tight" style={{ fontSize: titleSize * 0.85 }}>
                  {currentSong?.artist || ""}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {currentSong && showHeart && (
              <motion.button
                {...fadeScale}
                onClick={(e) => { e.stopPropagation(); toggleFavorite(currentSong.videoId) }}
                onMouseDown={(e) => e.stopPropagation()}
                className={`cursor-pointer p-1 transition-colors duration-150 ${isFav ? "text-accent" : "text-muted hover:text-primary"}`}
              >
                <Heart size={iconSize} fill={isFav ? "currentColor" : "none"} />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div layout className="flex shrink-0 items-center justify-end gap-1 sm:gap-2">
          <AnimatePresence>
            {showExtras && (
              <motion.button
                {...fadeScale}
                onClick={(e) => { e.stopPropagation(); sendCommand("toggle-shuffle") }}
                onMouseDown={(e) => e.stopPropagation()}
                className={`cursor-pointer p-1 transition-colors duration-150 ${shuffle ? "text-accent" : "text-muted hover:text-primary"}`}
              >
                <Shuffle size={iconSize} />
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showPrevNext && (
              <motion.button
                {...fadeScale}
                onClick={(e) => { e.stopPropagation(); sendCommand("previous") }}
                onMouseDown={(e) => e.stopPropagation()}
                className="cursor-pointer p-1 text-secondary transition-colors duration-150 hover:text-primary"
              >
                <SkipBack size={iconSize + 2} fill="currentColor" />
              </motion.button>
            )}
          </AnimatePresence>

          <motion.button
            layout
            style={{ width: playBtnSize, height: playBtnSize }}
            onClick={(e) => { e.stopPropagation(); sendCommand("toggle-play") }}
            onMouseDown={(e) => e.stopPropagation()}
            className="flex shrink-0 cursor-pointer items-center justify-center rounded-full bg-accent text-white transition-all duration-150 hover:scale-105"
          >
            {isLoading ? (
              <Loader2 size={iconSize} className="animate-spin" />
            ) : isPlaying ? (
              <Pause size={iconSize + 2} fill="currentColor" />
            ) : (
              <Play size={iconSize + 2} fill="currentColor" className="ml-[2px]" />
            )}
          </motion.button>

          <AnimatePresence>
            {showPrevNext && (
              <motion.button
                {...fadeScale}
                onClick={(e) => { e.stopPropagation(); sendCommand("next") }}
                onMouseDown={(e) => e.stopPropagation()}
                className="cursor-pointer p-1 text-secondary transition-colors duration-150 hover:text-primary"
              >
                <SkipForward size={iconSize + 2} fill="currentColor" />
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showExtras && (
              <motion.button
                {...fadeScale}
                onClick={(e) => { e.stopPropagation(); sendCommand("toggle-repeat") }}
                onMouseDown={(e) => e.stopPropagation()}
                className={`cursor-pointer p-1 transition-colors duration-150 ${repeat !== "off" ? "text-accent" : "text-muted hover:text-primary"}`}
              >
                <Repeat size={iconSize} />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

      </motion.div>

      <AnimatePresence>
        {showProgress && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-2 select-none"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <ProgressBar showTime={false} onSeek={(time) => sendCommand("seek", { time })} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}