import { useEffect, useRef } from "react"
import { usePlayerStore } from "../stores/playerStore"
import { useSettingsStore } from "../stores/settingsStore"
import { audioCache } from "../services/audioCache"

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
      const ac = settings.audioCache

      if (!ac.enabled) return

      const nextSongs = queue.slice(queueIndex + 1, queueIndex + 1 + prefetchCount)

      for (const song of nextSongs) {
        if (controller.signal.aborted) break
        if (!song.videoId || song.isLocal) continue

        const cachedPath = await audioCache.getPath(song.videoId)
        if (cachedPath) continue

        try {
          await audioCache.download(
            song.videoId,
            ac.format,
            ac.quality,
            ac.maxEntries,
            ac.maxStorageMb,
          )
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
  }, [currentSong?.videoId, queueIndex, settings.prefetchCache, settings.audioCache])
}
