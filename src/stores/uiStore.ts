import { create } from "zustand"
import type { Song } from "../types/music"

interface UiStore {
  sidebarCollapsed: boolean
  lyricsVisible: boolean
  nowPlayingVisible: boolean
  settingsVisible: boolean
  playlistModalVisible: boolean
  playlistSelectModalVisible: boolean
  songForPlaylist: Song | null
  editingPlaylistId: string | null
  toggleSidebar: () => void
  setLyricsVisible: (visible: boolean) => void
  setNowPlayingVisible: (visible: boolean) => void
  setSettingsVisible: (visible: boolean) => void
  setPlaylistModalVisible: (visible: boolean, editingId?: string | null) => void
  setPlaylistSelectModalVisible: (visible: boolean, song?: Song | null) => void
}

export const useUiStore = create<UiStore>((set) => ({
  sidebarCollapsed: false,
  lyricsVisible: false,
  nowPlayingVisible: false,
  settingsVisible: false,
  playlistModalVisible: false,
  playlistSelectModalVisible: false,
  songForPlaylist: null,
  editingPlaylistId: null,

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setLyricsVisible: (visible) => set({ lyricsVisible: visible }),
  setNowPlayingVisible: (visible) => set({ nowPlayingVisible: visible }),
  setSettingsVisible: (visible) => set({ settingsVisible: visible }),
  setPlaylistModalVisible: (visible, editingId = null) => set({ playlistModalVisible: visible, editingPlaylistId: editingId }),
  setPlaylistSelectModalVisible: (visible, song = null) => set({ playlistSelectModalVisible: visible, songForPlaylist: song }),
}))
