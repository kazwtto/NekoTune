import { create } from "zustand"
import { downloadSong, isDownloaded, removeDownload } from "../services/download"

interface DownloadStore {
  downloadedIds: Set<string>
  downloadingIds: Set<string>
  downloadErrors: Map<string, string>
  
  checkDownloaded: (videoId: string) => Promise<boolean>
  download: (videoId: string) => Promise<void>
  remove: (videoId: string) => Promise<void>
  refreshAll: (videoIds: string[]) => Promise<void>
  loadAllDownloadedIds: () => Promise<void>
}

export const useDownloadStore = create<DownloadStore>((set, get) => ({
  downloadedIds: new Set<string>(),
  downloadingIds: new Set<string>(),
  downloadErrors: new Map<string, string>(),

  loadAllDownloadedIds: async () => {
    try {
      const { getAllDownloadedIds } = await import("../services/download")
      const ids = await getAllDownloadedIds()
      set({ downloadedIds: new Set(ids) })
    } catch (error) {
      console.error("Failed to load downloaded IDs:", error)
    }
  },

  checkDownloaded: async (videoId: string) => {
    if (get().downloadedIds.has(videoId)) return true
    
    try {
      const exists = await isDownloaded(videoId)
      if (exists) {
        set((state) => {
          const next = new Set(state.downloadedIds)
          next.add(videoId)
          return { downloadedIds: next }
        })
      }
      return exists
    } catch {
      return false
    }
  },

  download: async (videoId: string) => {
    if (get().downloadingIds.has(videoId)) return
    
    set((state) => {
      const next = new Set(state.downloadingIds)
      next.add(videoId)
      return { downloadingIds: next }
    })

    try {
      await downloadSong(videoId)
      set((state) => {
        const nextDownloaded = new Set(state.downloadedIds)
        nextDownloaded.add(videoId)
        const nextDownloading = new Set(state.downloadingIds)
        nextDownloading.delete(videoId)
        return { 
          downloadedIds: nextDownloaded,
          downloadingIds: nextDownloading 
        }
      })
    } catch (error) {
      set((state) => {
        const nextErrors = new Map(state.downloadErrors)
        nextErrors.set(videoId, String(error))
        const nextDownloading = new Set(state.downloadingIds)
        nextDownloading.delete(videoId)
        return { 
          downloadErrors: nextErrors,
          downloadingIds: nextDownloading 
        }
      })
    }
  },

  remove: async (videoId: string) => {
    try {
      await removeDownload(videoId)
      set((state) => {
        const next = new Set(state.downloadedIds)
        next.delete(videoId)
        return { downloadedIds: next }
      })
    } catch (error) {
      console.error("Failed to remove download:", error)
    }
  },

  refreshAll: async (videoIds: string[]) => {
    const results = await Promise.all(videoIds.map(id => isDownloaded(id).then(exists => ({ id, exists }))))
    set((state) => {
      const next = new Set(state.downloadedIds)
      results.forEach(({ id, exists }) => {
        if (exists) next.add(id)
        else next.delete(id)
      })
      return { downloadedIds: next }
    })
  }
}))
