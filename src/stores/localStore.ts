import { create } from "zustand"
import type { LocalSong } from "../types/music"
import { scanMusicFolder } from "../services/local"

interface LocalStore {
  songs: LocalSong[]
  isLoading: boolean
  lastScannedFolder: string
  scanFolder: (path: string) => Promise<void>
}

export const useLocalStore = create<LocalStore>((set) => ({
  songs: [],
  isLoading: false,
  lastScannedFolder: "",

  scanFolder: async (path: string) => {
    if (!path) return
    set({ isLoading: true })
    try {
      const songs = await scanMusicFolder(path)
      set({ songs, lastScannedFolder: path, isLoading: false })
    } catch {
      set({ songs: [], isLoading: false })
    }
  },
}))
