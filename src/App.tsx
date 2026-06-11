import { Routes, Route } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import AppShell from "./components/layout/AppShell"
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
import SettingsPage from "./pages/SettingsPage"
import BrowsePage from "./pages/BrowsePage"

export default function App() {
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
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/browse/:browseId" element={<BrowsePage />} />
        </Routes>
      </AnimatePresence>
    </AppShell>
  )
}
