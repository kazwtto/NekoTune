import type { ReactNode } from "react"
import Titlebar from "./Titlebar"
import Sidebar from "./Sidebar"
import PlayerBar from "./PlayerBar"
import NowPlaying from "../player/NowPlaying"
import SettingsPage from "../../pages/SettingsPage"
import PlaylistModal from "../ui/PlaylistModal"
import PlaylistSelectModal from "../ui/PlaylistSelectModal"
import { useKeyboard } from "../../hooks/useKeyboard"
import { useSettingsEffects } from "../../hooks/useSettingsEffects"

interface AppShellProps {
  children: ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  useKeyboard()
  useSettingsEffects()

  return (
    <div className="grid h-full w-full flex-1 grid-rows-[auto_1fr_auto] overflow-hidden">
      <Titlebar />
      <div className="flex min-h-0 overflow-hidden bg-bg-base">
        <Sidebar />
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-px bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />
          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pl-6 pt-6">
            {children}
          </main>
        </div>
      </div>
      <PlayerBar />
      <NowPlaying />
      <SettingsPage />
      <PlaylistModal />
      <PlaylistSelectModal />
    </div>
  )
}
