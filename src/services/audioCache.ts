import { invoke } from "@tauri-apps/api/core"
import { proxyUrl } from "./proxy"

class AudioCacheService {
  async getPath(videoId: string): Promise<string | null> {
    try {
      return await invoke<string | null>("cmd_audio_cache_get_path", { videoId })
    } catch {
      return null
    }
  }

  async getCachedUrl(videoId: string): Promise<string | null> {
    const path = await this.getPath(videoId)
    return path ? proxyUrl(path) ?? null : null
  }

  async download(
    videoId: string,
    format: string,
    quality: string,
    maxEntries: number,
    maxStorageMb: number,
  ): Promise<string> {
    return invoke<string>("cmd_audio_cache_download", {
      videoId,
      format,
      quality,
      maxEntries,
      maxStorageMb,
    })
  }

  async remove(videoId: string): Promise<void> {
    await invoke("cmd_audio_cache_remove", { videoId })
  }

  async clear(): Promise<void> {
    await invoke("cmd_audio_cache_clear")
  }

  async stats(): Promise<{ count: number; totalBytes: number }> {
    return invoke("cmd_audio_cache_stats")
  }

  async debug(): Promise<string> {
    return invoke<string>("cmd_cache_debug")
  }

  downloadBackground(
    videoId: string,
    format: string,
    quality: string,
    maxEntries: number,
    maxStorageMb: number,
  ): void {
    console.log(`[Cache] downloadBackground: starting for ${videoId}`)
    invoke("cmd_audio_cache_download", {
      videoId,
      format,
      quality,
      maxEntries,
      maxStorageMb,
    })
      .then((path) => console.log(`[Cache] downloadBackground: done for ${videoId} -> ${path}`))
      .catch((e) => console.error(`[Cache] downloadBackground: failed for ${videoId}:`, e))
  }
}

export const audioCache = new AudioCacheService()
