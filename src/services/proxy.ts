import { convertFileSrc } from "@tauri-apps/api/core"

export function proxyUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined
  return convertFileSrc(url, "nekotune")
}

export function highResThumb(videoId: string | undefined | null): string | undefined {
  if (!videoId) return undefined
  return proxyUrl(`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`)
}
