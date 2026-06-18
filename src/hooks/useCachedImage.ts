import { useState, useEffect } from "react"
import { imageCacheService } from "../services/imageCacheService"
import { proxyUrl } from "../services/proxy"
import { useSettingsStore } from "../stores/settingsStore"

export function useCachedImage(originalUrl: string | undefined | null): string | undefined {
  const [src, setSrc] = useState<string | undefined>(undefined)
  const ic = useSettingsStore((s) => s.settings.imageCache)

  useEffect(() => {
    if (!originalUrl) {
      setSrc(undefined)
      return
    }

    if (!ic.enabled) {
      setSrc(proxyUrl(originalUrl))
      return
    }

    let cancelled = false

    async function resolve() {
      if (!originalUrl) return

      const cachedPath = await imageCacheService.getPath(originalUrl)
      if (cancelled) return

      if (cachedPath) {
        setSrc(proxyUrl(cachedPath))
        return
      }

      setSrc(proxyUrl(originalUrl))

      imageCacheService
        .download(originalUrl, ic.format, ic.quality, ic.maxEntries, ic.maxStorageMb)
        .then((localPath) => {
          if (!cancelled) setSrc(proxyUrl(localPath))
        })
        .catch(() => {})
    }

    resolve()
    return () => {
      cancelled = true
    }
  }, [originalUrl, ic.enabled, ic.format, ic.quality, ic.maxEntries, ic.maxStorageMb])

  return src
}
