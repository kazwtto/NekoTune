import { create } from "zustand"
import { getItem, setItem } from "../utils/storage"

const FAVORITES_KEY = "nekotune-favorites"
const PLAYLISTS_KEY = "nekotune-playlists"

export interface Playlist {
  id: string
  title: string
  songIds: string[]
  createdAt: number
}

interface LibraryStore {
  favorites: string[]
  playlists: Playlist[]
  toggleFavorite: (videoId: string) => void
  isFavorite: (videoId: string) => boolean
  createPlaylist: (title: string) => void
  deletePlaylist: (id: string) => void
  addToPlaylist: (playlistId: string, videoId: string) => void
  removeFromPlaylist: (playlistId: string, videoId: string) => void
}

export const useLibraryStore = create<LibraryStore>((set, get) => ({
  favorites: getItem<string[]>(FAVORITES_KEY, []),
  playlists: getItem<Playlist[]>(PLAYLISTS_KEY, []),

  toggleFavorite: (videoId: string) => {
    const current = get().favorites
    const next = current.includes(videoId)
      ? current.filter((id) => id !== videoId)
      : [...current, videoId]
    setItem(FAVORITES_KEY, next)
    set({ favorites: next })
  },

  isFavorite: (videoId: string) => {
    return get().favorites.includes(videoId)
  },

  createPlaylist: (title: string) => {
    const playlist: Playlist = {
      id: `pl-${Date.now()}`,
      title,
      songIds: [],
      createdAt: Date.now(),
    }
    const next = [...get().playlists, playlist]
    setItem(PLAYLISTS_KEY, next)
    set({ playlists: next })
  },

  deletePlaylist: (id: string) => {
    const next = get().playlists.filter((p) => p.id !== id)
    setItem(PLAYLISTS_KEY, next)
    set({ playlists: next })
  },

  addToPlaylist: (playlistId: string, videoId: string) => {
    const next = get().playlists.map((p) =>
      p.id === playlistId && !p.songIds.includes(videoId)
        ? { ...p, songIds: [...p.songIds, videoId] }
        : p
    )
    setItem(PLAYLISTS_KEY, next)
    set({ playlists: next })
  },

  removeFromPlaylist: (playlistId: string, videoId: string) => {
    const next = get().playlists.map((p) =>
      p.id === playlistId
        ? { ...p, songIds: p.songIds.filter((id) => id !== videoId) }
        : p
    )
    setItem(PLAYLISTS_KEY, next)
    set({ playlists: next })
  },
}))
