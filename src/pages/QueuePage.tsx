import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { usePlayer } from "../hooks/usePlayer"
import { usePlayerStore } from "../stores/playerStore"
import { playerService } from "../services/player"
import QueueList from "../components/player/QueueList"
import { formatTime } from "../utils/format"
import { Music, Trash2 } from "lucide-react"
import { proxyUrl } from "../services/proxy"
import { useScrollPersistence } from "../hooks/useScrollPersistence"

export default function QueuePage() {
  const { t } = useTranslation()
  const { currentSong, isPlaying, pause, resume, progress, duration, seek, queue, clearQueue } = usePlayer()
  const store = usePlayerStore()
  const scrollRef = useScrollPersistence("queue")

  const upcomingQueue = queue.slice(store.queueIndex + 1)
  const history = store.queueHistory

  return (
    <motion.div
      ref={scrollRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="overflow-y-auto h-full"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-primary">{t("player.nowPlaying")}</h2>
        {queue.length > 0 && (
          <button
            onClick={() => { clearQueue(); playerService.stop() }}
            className="flex cursor-pointer items-center gap-1.5 text-sm text-muted transition-colors duration-150 hover:opacity-80"
          >
            <Trash2 size={14} /> {t("player.clearQueue")}
          </button>
        )}
      </div>

      {currentSong && (
        <div
          className="mb-5 cursor-pointer rounded-xl bg-accent-muted p-4 transition-all duration-150"
          onClick={() => {
            if (isPlaying) pause()
            else resume()
          }}
        >
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-elevated">
              {currentSong.albumArtUrl ? (
                <img src={proxyUrl(currentSong.albumArtUrl)} alt={currentSong.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Music size={18} className="text-muted" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold text-primary">{currentSong.title}</p>
              <p className="truncate text-sm text-secondary">
                {currentSong.artist}
              </p>
              <div className="mt-2">
                <div
                  className="relative h-1 cursor-pointer rounded-full bg-elevated"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (duration <= 0) return
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = (e.clientX - rect.left) / rect.width
                    seek(x * duration)
                  }}
                >
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-100"
                    style={{ width: duration > 0 ? `${(progress / duration) * 100}%` : 0 }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-xs tabular-nums text-muted">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <h3 className="mb-2.5 text-sm font-semibold text-primary">{t("player.upNext")} ({upcomingQueue.length})</h3>
      {upcomingQueue.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted">
          {t("player.noQueue")}
        </p>
      ) : (
        <QueueList />
      )}

      {history.length > 0 && (
        <>
          <h3 className="mb-2.5 mt-5 text-sm font-semibold text-primary">{t("player.history")}</h3>
          <div className="flex flex-col gap-0.5">
            {history.slice(-10).reverse().map((song, i) => (
              <div
                key={`${song.videoId}-hist-${i}`}
                className="flex items-center gap-2.5 rounded-lg bg-surface px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-primary">{song.title}</p>
                  <p className="truncate text-xs text-muted">
                    {song.artist}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  )
}
