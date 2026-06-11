import type { ReactNode } from "react"
import Titlebar from "./Titlebar"
import Sidebar from "./Sidebar"
import PlayerBar from "./PlayerBar"
import NowPlaying from "../player/NowPlaying"
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
      <div className="flex min-h-0 overflow-hidden">
        <Sidebar />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-bg-backdrop pt-6 pl-6">
          {children}
        </main>
      </div>
      <PlayerBar />
      <NowPlaying />
    </div>
  )
}
