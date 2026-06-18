import { useEffect, useRef } from "react"
import { usePlayerStore } from "../stores/playerStore"
import { useSettingsStore } from "../stores/settingsStore"
import { audioCache } from "../services/audioCache"

const PREFETCH_CONCURRENCY = 3

export function usePrefetch() {
  const currentSong = usePlayerStore((s) => s.currentSong)
  const queue = usePlayerStore((s) => s.queue)
  const queueIndex = usePlayerStore((s) => s.queueIndex)
  const settings = useSettingsStore((s) => s.settings)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!settings.prefetchCache.enabled || !currentSong || settings.prefetchCache.prefetchCount === 0) return

    if (abortRef.current) abortRef.current.abort()

    const controller = new AbortController()
    abortRef.current = controller

    const timer = setTimeout(async () => {
      if (controller.signal.aborted) return

      const { prefetchCount } = settings.prefetchCache
      const ac = settings.audioCache

      if (!ac.enabled) return

      const nextSongs = queue.slice(queueIndex + 1, queueIndex + 1 + prefetchCount)

      const toDownload = []
      for (const song of nextSongs) {
        if (controller.signal.aborted) break
        if (!song.videoId || song.isLocal) continue

        const cachedPath = await audioCache.getPath(song.videoId)
        if (!cachedPath) {
          toDownload.push(song)
        }
      }

      for (let i = 0; i < toDownload.length; i += PREFETCH_CONCURRENCY) {
        if (controller.signal.aborted) break
        const chunk = toDownload.slice(i, i + PREFETCH_CONCURRENCY)
        await Promise.allSettled(
          chunk.map((song) =>
            audioCache.download(
              song.videoId!,
              ac.format,
              ac.quality,
              ac.maxEntries,
              ac.maxStorageMb,
            ),
          ),
        )
      }
    }, 3000)

    return () => {
      clearTimeout(timer)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [currentSong?.videoId, queueIndex, settings.prefetchCache, settings.audioCache])
}
