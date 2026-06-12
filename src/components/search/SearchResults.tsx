import { useTranslation } from "react-i18next"
import type { SearchResults } from "../../types/music"
import SongCard from "../media/SongCard"
import AlbumCard from "../media/AlbumCard"
import ArtistCard from "../media/ArtistCard"
import PlaylistCard from "../media/PlaylistCard"
import Tabs from "../ui/Tabs"
import Shimmer from "../ui/Shimmer"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Music, Album, User, ListMusic, Video, LayoutGrid } from "lucide-react"

interface SearchResultsProps {
  results?: SearchResults
  isLoading: boolean
  query: string
}

export default function SearchResultsView({ results, isLoading, query }: SearchResultsProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState("all")

  const total = results
    ? results.songs.length + results.albums.length + results.artists.length + results.playlists.length + results.videos.length
    : 0

  const tabs = [
    { id: "all", label: t("search.all"), count: total, icon: LayoutGrid },
    { id: "songs", label: t("search.songs"), count: results?.songs.length || 0, icon: Music },
    { id: "albums", label: t("search.albums"), count: results?.albums.length || 0, icon: Album },
    { id: "artists", label: t("search.artists"), count: results?.artists.length || 0, icon: User },
    { id: "playlists", label: t("search.playlists"), count: results?.playlists.length || 0, icon: ListMusic },
    { id: "videos", label: t("search.videos"), count: results?.videos.length || 0, icon: Video },
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
    results.playlists.length > 0 ||
    results.videos.length > 0

  if (!hasAnyResults) {
    return (
      <p className="mt-8 text-center text-sm text-muted">
        {t("common.noResultsFor", { query })}
      </p>
    )
  }

  return (
    <div className="mt-4">
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      <div className="mt-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === "all" && (
              <div className="flex flex-col gap-4">
                {results.songs.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-xs font-semibold text-secondary uppercase tracking-wider">{t("search.songs")}</h4>
                    <div className="flex flex-col gap-1.5">
                      {results.songs.slice(0, 5).map((song) => (
                        <SongCard key={song.videoId} song={song} />
                      ))}
                    </div>
                  </div>
                )}
                {results.albums.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-xs font-semibold text-secondary uppercase tracking-wider">{t("search.albums")}</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {results.albums.slice(0, 6).map((album) => (
                        <AlbumCard key={album.browseId} album={album} />
                      ))}
                    </div>
                  </div>
                )}
                {results.artists.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-xs font-semibold text-secondary uppercase tracking-wider">{t("search.artists")}</h4>
                    <div className="grid grid-cols-4 gap-3">
                      {results.artists.slice(0, 4).map((artist) => (
                        <ArtistCard key={artist.browseId} artist={artist} />
                      ))}
                    </div>
                  </div>
                )}
                {results.playlists.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-xs font-semibold text-secondary uppercase tracking-wider">{t("search.playlists")}</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {results.playlists.slice(0, 6).map((playlist) => (
                        <PlaylistCard key={playlist.browseId} playlist={playlist} />
                      ))}
                    </div>
                  </div>
                )}
                {results.videos.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-xs font-semibold text-secondary uppercase tracking-wider">{t("search.videos")}</h4>
                    <div className="flex flex-col gap-1.5">
                      {results.videos.slice(0, 5).map((video) => (
                        <SongCard key={video.videoId} song={video} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
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
            {activeTab === "videos" && (
              <div className="flex flex-col gap-1.5">
                {results.videos.map((video) => (
                  <SongCard key={video.videoId} song={video} />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
