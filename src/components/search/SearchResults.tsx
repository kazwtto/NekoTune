import type { SearchResults } from "../../types/music"
import SongCard from "../media/SongCard"
import AlbumCard from "../media/AlbumCard"
import ArtistCard from "../media/ArtistCard"
import PlaylistCard from "../media/PlaylistCard"
import Tabs from "../ui/Tabs"
import Shimmer from "../ui/Shimmer"
import { useState } from "react"

interface SearchResultsProps {
  results?: SearchResults
  isLoading: boolean
  query: string
}

export default function SearchResultsView({ results, isLoading, query }: SearchResultsProps) {
  const [activeTab, setActiveTab] = useState("songs")

  const tabs = [
    { id: "songs", label: `Songs (${results?.songs.length || 0})` },
    { id: "albums", label: `Albums (${results?.albums.length || 0})` },
    { id: "artists", label: `Artists (${results?.artists.length || 0})` },
    { id: "playlists", label: `Playlists (${results?.playlists.length || 0})` },
  ]

  if (isLoading) {
    return (
      <div className="mt-4 flex flex-col gap-3">
        <Shimmer height={14} width="40%" />
        <Shimmer height={52} />
        <Shimmer height={52} />
        <Shimmer height={52} />
      </div>
    )
  }

  if (!results) return null

  const hasAnyResults =
    results.songs.length > 0 ||
    results.albums.length > 0 ||
    results.artists.length > 0 ||
    results.playlists.length > 0

  if (!hasAnyResults) {
    return (
      <p className="mt-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
        No results for &ldquo;{query}&rdquo;
      </p>
    )
  }

  return (
    <div className="mt-4">
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      <div className="mt-3">
        {activeTab === "songs" && (
          <div className="flex flex-col gap-1.5">
            {results.songs.map((song) => (
              <SongCard key={song.videoId} song={song} />
            ))}
          </div>
        )}
        {activeTab === "albums" && (
          <div className="grid grid-cols-3 gap-3">
            {results.albums.map((album) => (
              <AlbumCard key={album.browseId} album={album} />
            ))}
          </div>
        )}
        {activeTab === "artists" && (
          <div className="grid grid-cols-4 gap-3">
            {results.artists.map((artist) => (
              <ArtistCard key={artist.browseId} artist={artist} />
            ))}
          </div>
        )}
        {activeTab === "playlists" && (
          <div className="grid grid-cols-3 gap-3">
            {results.playlists.map((playlist) => (
              <PlaylistCard key={playlist.browseId} playlist={playlist} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
