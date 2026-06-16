import { useEffect, useRef } from "react"
import { usePlayerStore } from "../stores/playerStore"
import { useSettingsStore } from "../stores/settingsStore"
import { streamCache } from "../services/streamCache"
import { getStreamUrl } from "../services/innertube"

export function usePrefetch() {
  const currentSong = usePlayerStore((s) => s.currentSong)
  const queue = usePlayerStore((s) => s.queue)
  const queueIndex = usePlayerStore((s) => s.queueIndex)
  const settings = useSettingsStore((s) => s.settings)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!settings.prefetchCache.enabled || !currentSong || settings.prefetchCache.prefetchCount === 0) return

    if (timerRef.current) clearTimeout(timerRef.current)
    if (abortRef.current) abortRef.current.abort()

    const controller = new AbortController()
    abortRef.current = controller

    timerRef.current = setTimeout(async () => {
      if (controller.signal.aborted) return

      const { prefetchCount, delayMs } = settings.prefetchCache
      const { ttlMinutes, maxEntries, enabled: cacheEnabled } = settings.streamCache

      const nextSongs = queue.slice(queueIndex + 1, queueIndex + 1 + prefetchCount)

      for (const song of nextSongs) {
        if (controller.signal.aborted) break
        if (!song.videoId || song.isLocal) continue
        if (streamCache.has(song.videoId)) continue

        try {
          const data = await getStreamUrl(song.videoId)
          if (controller.signal.aborted) break
          if (data && cacheEnabled) {
            streamCache.configure(maxEntries)
            streamCache.set(song.videoId, data.url, data.duration, ttlMinutes * 60 * 1000)
          }
        } catch {
          // silent — prefetch failure is non-critical
        }

        if (nextSongs.indexOf(song) < nextSongs.length - 1) {
          await new Promise<void>((resolve) => {
            const t = setTimeout(resolve, delayMs)
            controller.signal.addEventListener("abort", () => {
              clearTimeout(t)
              resolve()
            })
          })
        }
      }
    }, 3000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [currentSong?.videoId, queueIndex, settings.prefetchCache, settings.streamCache])
}
