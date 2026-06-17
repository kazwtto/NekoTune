import { create } from "zustand"
import { getItem, setItem } from "../utils/storage"
import type { Song } from "../types/music"

const FAVORITES_KEY = "nekotune-favorites"
const PLAYLISTS_KEY = "nekotune-playlists"

export interface Playlist {
  id: string
  title: string
  songs: Song[]
  createdAt: number
  isFavorite?: boolean
  image?: string
  color?: string
  icon?: string
}

interface LibraryStore {
  favorites: string[]
  playlists: Playlist[]
  toggleFavorite: (videoId: string) => void
  isFavorite: (videoId: string) => boolean
  createPlaylist: (data: { title: string; image?: string; color?: string; icon?: string }) => void
  updatePlaylist: (id: string, data: Partial<Playlist>) => void
  deletePlaylist: (id: string) => void
  addToPlaylist: (playlistId: string, song: Song) => void
  removeFromPlaylist: (playlistId: string, videoId: string) => void
  togglePlaylistFavorite: (playlistId: string) => void
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

  createPlaylist: (data) => {
    const playlist: Playlist = {
      id: `pl-${Date.now()}`,
      title: data.title,
      image: data.image,
      color: data.color,
      icon: data.icon,
      songs: [],
      createdAt: Date.now(),
      isFavorite: false,
    }
    const next = [...get().playlists, playlist]
    setItem(PLAYLISTS_KEY, next)
    set({ playlists: next })
  },

  updatePlaylist: (id: string, data: Partial<Playlist>) => {
    const next = get().playlists.map((p) =>
      p.id === id ? { ...p, ...data } : p
    )
    setItem(PLAYLISTS_KEY, next)
    set({ playlists: next })
  },

  deletePlaylist: (id: string) => {
    const next = get().playlists.filter((p) => p.id !== id)
    setItem(PLAYLISTS_KEY, next)
    set({ playlists: next })
  },

  addToPlaylist: (playlistId: string, song: Song) => {
    const next = get().playlists.map((p) =>
      p.id === playlistId && !p.songs.some(s => s.videoId === song.videoId)
        ? { ...p, songs: [...(p.songs || []), song] }
        : p
    )
    setItem(PLAYLISTS_KEY, next)
    set({ playlists: next })
  },

  removeFromPlaylist: (playlistId: string, videoId: string) => {
    const next = get().playlists.map((p) =>
      p.id === playlistId
        ? { ...p, songs: (p.songs || []).filter((s) => s.videoId !== videoId) }
        : p
    )
    setItem(PLAYLISTS_KEY, next)
    set({ playlists: next })
  },

  togglePlaylistFavorite: (playlistId: string) => {
    const next = get().playlists.map((p) =>
      p.id === playlistId ? { ...p, isFavorite: !p.isFavorite } : p
    )
    setItem(PLAYLISTS_KEY, next)
    set({ playlists: next })
  },
}))
