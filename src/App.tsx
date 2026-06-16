import { useEffect, useState } from "react"
import { Routes, Route } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { listen } from "@tauri-apps/api/event"
import AppShell from "./components/layout/AppShell"
import MiniPlayer from "./components/player/MiniPlayer"
import HomePage from "./pages/HomePage"
import ExplorePage from "./pages/ExplorePage"
import SearchPage from "./pages/SearchPage"
import LibraryPage from "./pages/LibraryPage"
import PlaylistsPage from "./pages/PlaylistsPage"
import FavoritesPage from "./pages/FavoritesPage"
import HistoryPage from "./pages/HistoryPage"
import PlaylistPage from "./pages/PlaylistPage"
import ArtistPage from "./pages/ArtistPage"
import AlbumPage from "./pages/AlbumPage"
import LyricsPage from "./pages/LyricsPage"
import BrowsePage from "./pages/BrowsePage"

import { invoke } from "@tauri-apps/api/core"
import { useAccountStore } from "./stores/accountStore"
import { usePlayerStore } from "./stores/playerStore"
import { playerService } from "./services/player"

export default function App() {
  const account = useAccountStore((s) => s.account)
  const [isFloating, setIsFloating] = useState(false)

  useEffect(() => {
    const label = getCurrentWindow().label
    setIsFloating(label === "floating")
    if (label === "floating") {
      document.body.style.background = "transparent"
      document.getElementById("root")!.style.background = "transparent"
    }
  }, [])

  useEffect(() => {
    if (account?.cookie) {
      invoke("cmd_set_account_cookie", { cookie: account.cookie }).catch(console.error)
    }
  }, [account?.cookie])

  useEffect(() => {
    if (isFloating) return

    const unlisten = listen<{ action: string; time?: number }>("player-command", ({ payload }) => {
      const state = usePlayerStore.getState()
      switch (payload.action) {
        case "seek":
          if (payload.time !== undefined) {
            playerService.seek(payload.time)
            usePlayerStore.setState({ progress: payload.time })
          }
          break
        case "toggle-play":
          state.isPlaying ? (usePlayerStore.getState().pause(), playerService.pause()) : (usePlayerStore.getState().resume(), playerService.play())
          break
        case "next":
          state.next()
          const nextSong = usePlayerStore.getState().currentSong
          if (nextSong) playerService.loadAndPlay(nextSong)
          break
        case "previous":
          if (state.progress > 3) {
            playerService.seek(0)
            usePlayerStore.setState({ progress: 0 })
          } else {
            state.previous()
            const prevSong = usePlayerStore.getState().currentSong
            if (prevSong) playerService.loadAndPlay(prevSong)
          }
          break
        case "toggle-shuffle":
          usePlayerStore.getState().toggleShuffle()
          break
        case "toggle-repeat":
          usePlayerStore.getState().toggleRepeat()
          break
      }
    })
    return () => { unlisten.then(fn => fn()) }
  }, [isFloating])

  if (isFloating) {
    return <MiniPlayer />
  }

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/playlists" element={<PlaylistsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/playlist/:id" element={<PlaylistPage />} />
          <Route path="/artist/:id" element={<ArtistPage />} />
          <Route path="/album/:id" element={<AlbumPage />} />
          <Route path="/lyrics" element={<LyricsPage />} />
          <Route path="/browse/:browseId" element={<BrowsePage />} />
        </Routes>
      </AnimatePresence>
    </AppShell>
  )
}
