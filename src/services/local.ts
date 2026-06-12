import { invoke } from "@tauri-apps/api/core"
import type { LocalSong } from "../types/music"

export async function scanMusicFolder(path: string): Promise<LocalSong[]> {
  try {
    return await invoke<LocalSong[]>("cmd_scan_music_folder", { path })
  } catch {
    return []
  }
}

export async function getDefaultMusicDir(): Promise<string> {
  try {
    return await invoke<string>("cmd_get_default_music_dir")
  } catch {
    return ""
  }
}
