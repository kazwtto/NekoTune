import { invoke } from "@tauri-apps/api/core"
import { useSettingsStore } from "../stores/settingsStore"

export async function downloadSong(videoId: string): Promise<string> {
  const { downloadFolder, downloadFormat, downloadQuality } = useSettingsStore.getState().settings
  return invoke<string>("cmd_download_song", {
    videoId,
    downloadFolder,
    format: downloadFormat,
    quality: downloadQuality,
  })
}

export async function isDownloaded(videoId: string): Promise<boolean> {
  const { downloadFolder } = useSettingsStore.getState().settings
  return invoke<boolean>("cmd_is_downloaded", { videoId, downloadFolder })
}

export async function cancelDownload(videoId: string): Promise<void> {
  await invoke("cmd_cancel_download", { videoId })
}

export async function removeDownload(videoId: string): Promise<void> {
  const { downloadFolder } = useSettingsStore.getState().settings
  await invoke("cmd_remove_download", { videoId, downloadFolder })
}

export async function getDownloadedFilePath(videoId: string): Promise<string> {
  const { downloadFolder } = useSettingsStore.getState().settings
  return invoke<string>("cmd_get_downloaded_file_path", { videoId, downloadFolder })
}

export async function getAllDownloadedIds(): Promise<string[]> {
  const { downloadFolder } = useSettingsStore.getState().settings
  return invoke<string[]>("cmd_get_all_downloaded_ids", { downloadFolder })
}
