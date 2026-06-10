import type { ReactNode } from "react"
import Titlebar from "./Titlebar"
import Sidebar from "./Sidebar"
import PlayerBar from "./PlayerBar"
import NowPlaying from "../player/NowPlaying"
import { useKeyboard } from "../../hooks/useKeyboard"

interface AppShellProps {
  children: ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  useKeyboard()

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <Titlebar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main
          className="flex-1 overflow-y-auto p-5"
          style={{ background: "var(--bg-primary)" }}
        >
          {children}
        </main>
      </div>
      <PlayerBar />
      <NowPlaying />
    </div>
  )
}
