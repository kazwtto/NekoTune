import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "react-i18next"
import {
  Music, Shuffle, Repeat, Heart, ListMusic, Loader2,
  ChevronDown, Repeat1, Mic2, X,
} from "lucide-react"
import { usePlayer } from "../../hooks/usePlayer"
import { useUiStore } from "../../stores/uiStore"
import { useLibraryStore } from "../../stores/libraryStore"
import { usePlayerStore } from "../../stores/playerStore"
import { proxyUrl, highResThumb } from "../../services/proxy"
import { formatTime } from "../../utils/format"
import LyricsView from "../lyrics/LyricsView"

export default function NowPlaying() {
  const { t } = useTranslation()
  const visible = useUiStore((s) => s.nowPlayingVisible)
  const setVisible = useUiStore((s) => s.setNowPlayingVisible)
  const {
    currentSong, isLoading, isPlaying, progress, duration,
    shuffle, repeat,
    pause, resume, next, previous, seek,
    toggleShuffle, toggleRepeat, volume, setVolume,
  } = usePlayer()
  const { favorites, toggleFavorite } = useLibraryStore()
  const queue = usePlayerStore((s) => s.queue)
  const queueIndex = usePlayerStore((s) => s.queueIndex)
  const [showLyrics, setShowLyrics] = useState(false)
  const [showQueue, setShowQueue] = useState(false)

  if (!currentSong) return null

  const isFav = favorites.includes(currentSong.videoId)
  const pct = duration > 0 ? (progress / duration) * 100 : 0

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    if (duration <= 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    seek(x * duration)
  }

  function handleVolumeChange(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    setVolume(x)
  }

  const RepeatIcon = repeat === "one" ? Repeat1 : Repeat

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed inset-0 z-40 flex"
          style={{ background: "linear-gradient(180deg, #1a1040 0%, #0d1117 100%)" }}
        >
          {/* Main Player */}
          <div className="flex flex-1 flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-2">
              <button
                onClick={() => setVisible(false)}
                className="cursor-pointer rounded-full p-2 text-secondary transition-colors duration-150 hover:text-primary"
              >
                <ChevronDown size={24} />
              </button>
              <span className="text-xs font-medium uppercase tracking-wider text-muted">
                {t("player.nowPlaying")}
              </span>
              <div className="w-10" />
            </div>

            {/* Album Art */}
            <div className="flex flex-1 items-center justify-center px-8">
              <div className="relative aspect-square w-full max-w-[290px] overflow-hidden rounded-2xl shadow-2xl">
                {currentSong.albumArtUrl || currentSong.videoId ? (
                  <img
                    src={highResThumb(currentSong.videoId) || proxyUrl(currentSong.albumArtUrl)}
                    alt={currentSong.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-bg-surface">
                    <Music size={56} className="text-muted" />
                  </div>
                )}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Loader2 size={36} className="animate-spin text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Song Info */}
            <div className="px-8 pb-2">
              <h2 className="truncate text-center text-xl font-bold text-primary">
                {currentSong.title}
              </h2>
              <p className="mt-1 truncate text-center text-sm text-secondary">
                {currentSong.artist}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="px-8 pb-4">
              <div className="flex w-full items-center gap-3">
                <span className="min-w-10 text-right text-xs tabular-nums text-muted">
                  {formatTime(progress)}
                </span>
                <div
                  className="group relative h-1 flex-1 cursor-pointer rounded-full bg-white/10"
                  onClick={handleProgressClick}
                >
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-white transition-all duration-100"
                    style={{ width: `${pct}%` }}
                  />
                  <div
                    className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                    style={{ left: `${pct}%` }}
                  />
                </div>
                <span className="min-w-10 text-xs tabular-nums text-muted">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* Transport Controls */}
            <div className="flex items-center justify-center gap-6 px-8 pb-3">
              <button
                onClick={toggleShuffle}
                className={`cursor-pointer p-2 transition-colors duration-150 ${
                  shuffle ? "text-accent" : "text-secondary"
                }`}
              >
                <Shuffle size={20} />
              </button>
              <button
                onClick={previous}
                className="cursor-pointer p-2 text-secondary transition-colors duration-150 hover:text-primary"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>
              <button
                onClick={isPlaying ? pause : resume}
                className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-white text-black transition-transform duration-150 hover:scale-105 active:scale-95"
              >
                {isLoading ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : isPlaying ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <button
                onClick={next}
                className="cursor-pointer p-2 text-secondary transition-colors duration-150 hover:text-primary"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>
              <button
                onClick={toggleRepeat}
                className={`cursor-pointer p-2 transition-colors duration-150 ${
                  repeat !== "off" ? "text-accent" : "text-secondary"
                }`}
              >
                <RepeatIcon size={20} />
              </button>
            </div>

            {/* Bottom Row: Volume + Actions */}
            <div className="flex items-center justify-between px-8 pb-6 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
                  className="cursor-pointer p-1.5 text-secondary transition-colors duration-150 hover:text-primary"
                >
                  {volume > 0 ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                    </svg>
                  )}
                </button>
                <div
                  className="relative h-1 w-20 cursor-pointer rounded-full bg-white/10"
                  onClick={handleVolumeChange}
                >
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-white transition-all duration-100"
                    style={{ width: `${volume * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setShowLyrics(!showLyrics); setShowQueue(false) }}
                  className={`cursor-pointer rounded-full p-2 transition-colors duration-150 ${
                    showLyrics ? "text-accent" : "text-secondary hover:text-primary"
                  }`}
                >
                  <Mic2 size={18} />
                </button>
                <button
                  onClick={() => { setShowQueue(!showQueue); setShowLyrics(false) }}
                  className={`cursor-pointer rounded-full p-2 transition-colors duration-150 ${
                    showQueue ? "text-accent" : "text-secondary hover:text-primary"
                  }`}
                >
                  <ListMusic size={18} />
                </button>
                <button
                  onClick={() => toggleFavorite(currentSong.videoId)}
                  className={`cursor-pointer rounded-full p-2 transition-colors duration-150 ${isFav ? "text-accent" : "text-secondary hover:text-primary"}`}
                >
                  <Heart size={18} fill={isFav ? "currentColor" : "none"} />
                </button>
              </div>
            </div>
          </div>

          {/* Lyrics Panel */}
          <AnimatePresence>
            {showLyrics && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 360, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0 overflow-hidden border-l border-white/10"
              >
                <div className="flex h-full w-[360px] flex-col bg-black/20">
                  <div className="flex items-center justify-between px-4 py-3">
                    <h3 className="text-sm font-semibold text-primary">{t("common.lyrics")}</h3>
                    <button
                      onClick={() => setShowLyrics(false)}
                      className="cursor-pointer rounded-full p-1 text-secondary transition-colors hover:text-primary"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
                    <LyricsView />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Queue Panel */}
          <AnimatePresence>
            {showQueue && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 360, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0 overflow-hidden border-l border-white/10"
              >
                <div className="flex h-full w-[360px] flex-col bg-black/20">
                  <div className="flex items-center justify-between px-4 py-3">
                    <h3 className="text-sm font-semibold text-primary">{t("common.queue")}</h3>
                    <button
                      onClick={() => setShowQueue(false)}
                      className="cursor-pointer rounded-full p-1 text-secondary transition-colors hover:text-primary"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
                    {queue.length === 0 ? (
                      <div className="mt-12 flex flex-col items-center gap-2">
                        <ListMusic size={28} className="text-muted" />
                        <p className="text-sm text-muted">{t("player.noQueue")}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-0.5">
                        {queue.map((song, i) => (
                          <div
                            key={`${song.videoId}-${i}`}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                              i === queueIndex
                                ? "bg-accent-muted"
                                : "hover:bg-white/5"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className={`truncate text-sm ${
                                i === queueIndex ? "text-accent font-medium" : "text-primary"
                              }`}>
                                {song.title}
                              </p>
                              <p className="truncate text-xs text-muted">{song.artist}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
