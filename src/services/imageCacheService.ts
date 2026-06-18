import { invoke } from "@tauri-apps/api/core"
import { proxyUrl } from "./proxy"

class ImageCacheService {
  async getPath(url: string): Promise<string | null> {
    try {
      return await invoke<string | null>("cmd_image_cache_get_path", { url })
    } catch {
      return null
    }
  }

  async getCachedUrl(url: string): Promise<string | null> {
    const path = await this.getPath(url)
    return path ? proxyUrl(path) ?? null : null
  }

  async download(
    url: string,
    format: string,
    quality: string,
    maxEntries: number,
    maxStorageMb: number,
  ): Promise<string> {
    return invoke<string>("cmd_image_cache_download", {
      url,
      format,
      quality,
      maxEntries,
      maxStorageMb,
    })
  }

  async clear(): Promise<void> {
    await invoke("cmd_image_cache_clear")
  }

  async stats(): Promise<{ count: number; totalBytes: number }> {
    return invoke("cmd_image_cache_stats")
  }
}

export const imageCacheService = new ImageCacheService()
