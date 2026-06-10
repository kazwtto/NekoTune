import { useTranslation } from "react-i18next"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Heart,
  Music,
  Maximize2,
} from "lucide-react"
import { usePlayer } from "../../hooks/usePlayer"
import { useUiStore } from "../../stores/uiStore"
import { formatTime } from "../../utils/format"
import VolumeSlider from "../player/VolumeSlider"

export default function PlayerBar() {
  const { t } = useTranslation()
  const { currentSong, isPlaying, progress, duration, pause, resume, next, previous, shuffle, repeat, toggleShuffle, toggleRepeat } = usePlayer()
  const setNowPlayingVisible = useUiStore((s) => s.setNowPlayingVisible)

  if (!currentSong) {
    return (
      <div
        className="flex items-center justify-center gap-2"
        style={{
          height: 72,
          background: "var(--player-bg)",
          borderTop: "1px solid var(--border)",
        }}
      >
        <Music size={16} style={{ color: "var(--text-muted)" }} />
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {t("player.noQueue")}
        </span>
      </div>
    )
  }

  const pct = duration > 0 ? (progress / duration) * 100 : 0

  return (
    <div
      className="flex items-center gap-4 px-4"
      style={{
        height: 72,
        background: "var(--player-bg)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center gap-3" style={{ width: 200, minWidth: 160 }}>
        <div
          className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg cursor-pointer transition-transform duration-150 hover:scale-105"
          onClick={() => setNowPlayingVisible(true)}
          style={{ background: "var(--bg-elevated)" }}
        >
          {currentSong.albumArtUrl ? (
            <img src={currentSong.albumArtUrl} alt={currentSong.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Music size={14} style={{ color: "var(--text-muted)" }} />
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
          <p className="truncate text-xs" style={{ color: "var(--text-secondary)" }}>
            {currentSong.artist}
          </p>
        </div>
        <button className="cursor-pointer transition-colors duration-150 hover:opacity-80" style={{ background: "none", border: "none", color: "var(--text-muted)", padding: 4 }}>
          <Heart size={14} />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center gap-1">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleShuffle}
            className="cursor-pointer transition-colors duration-150"
            style={{ background: "none", border: "none", color: shuffle ? "var(--accent)" : "var(--text-muted)", padding: 4 }}
          >
            <Shuffle size={14} />
          </button>
          <button onClick={previous} className="cursor-pointer transition-colors duration-150 hover:opacity-80" style={{ background: "none", border: "none", color: "var(--text-secondary)", padding: 4 }}>
            <SkipBack size={16} fill="currentColor" />
          </button>
          <button
            onClick={isPlaying ? pause : resume}
            className="flex cursor-pointer items-center justify-center rounded-full transition-all duration-150 hover:scale-105"
            style={{ width: 32, height: 32, background: "var(--accent)", border: "none", color: "#fff" }}
          >
            {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
          </button>
          <button onClick={next} className="cursor-pointer transition-colors duration-150 hover:opacity-80" style={{ background: "none", border: "none", color: "var(--text-secondary)", padding: 4 }}>
            <SkipForward size={16} fill="currentColor" />
          </button>
          <button
            onClick={toggleRepeat}
            className="cursor-pointer transition-colors duration-150"
            style={{ background: "none", border: "none", color: repeat !== "off" ? "var(--accent)" : "var(--text-muted)", padding: 4 }}
          >
            <Repeat size={14} />
          </button>
        </div>
        <div className="flex w-full items-center gap-2">
          <span className="text-xs tabular-nums" style={{ color: "var(--text-muted)", minWidth: 32, textAlign: "right" }}>
            {formatTime(progress)}
          </span>
          <div
            className="group relative flex-1 cursor-pointer rounded-full"
            style={{ height: 4, background: "var(--bg-elevated)" }}
            onClick={(e) => {
              if (duration <= 0) return
              const rect = e.currentTarget.getBoundingClientRect()
              const x = (e.clientX - rect.left) / rect.width
              usePlayer().seek(x * duration)
            }}
          >
            <div
              className="rounded-full transition-all duration-100"
              style={{ height: "100%", width: `${pct}%`, background: "var(--accent)" }}
            />
          </div>
          <span className="text-xs tabular-nums" style={{ color: "var(--text-muted)", minWidth: 32 }}>
            {formatTime(duration)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3" style={{ width: 140, justifyContent: "flex-end" }}>
        <VolumeSlider />
        <button
          onClick={() => setNowPlayingVisible(true)}
          className="cursor-pointer transition-colors duration-150 hover:opacity-80"
          style={{ background: "none", border: "none", color: "var(--text-muted)", padding: 4 }}
        >
          <Maximize2 size={14} />
        </button>
      </div>
    </div>
  )
}
