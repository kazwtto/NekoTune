import { create } from "zustand"

interface UiStore {
  sidebarCollapsed: boolean
  lyricsVisible: boolean
  nowPlayingVisible: boolean
  toggleSidebar: () => void
  setLyricsVisible: (visible: boolean) => void
  setNowPlayingVisible: (visible: boolean) => void
}

export const useUiStore = create<UiStore>((set) => ({
  sidebarCollapsed: false,
  lyricsVisible: false,
  nowPlayingVisible: false,

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setLyricsVisible: (visible) => set({ lyricsVisible: visible }),
  setNowPlayingVisible: (visible) => set({ nowPlayingVisible: visible }),
}))
