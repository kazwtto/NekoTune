import { create } from "zustand"

interface UiStore {
  sidebarCollapsed: boolean
  lyricsVisible: boolean
  nowPlayingVisible: boolean
  settingsVisible: boolean
  toggleSidebar: () => void
  setLyricsVisible: (visible: boolean) => void
  setNowPlayingVisible: (visible: boolean) => void
  setSettingsVisible: (visible: boolean) => void
}

export const useUiStore = create<UiStore>((set) => ({
  sidebarCollapsed: false,
  lyricsVisible: false,
  nowPlayingVisible: false,
  settingsVisible: false,

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setLyricsVisible: (visible) => set({ lyricsVisible: visible }),
  setNowPlayingVisible: (visible) => set({ nowPlayingVisible: visible }),
  setSettingsVisible: (visible) => set({ settingsVisible: visible }),
}))
