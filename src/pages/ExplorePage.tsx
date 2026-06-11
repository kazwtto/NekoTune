import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useExplore } from "../hooks/useInnertube"
import AlbumCard from "../components/media/AlbumCard"
import ArtistCard from "../components/media/ArtistCard"
import PlaylistCard from "../components/media/PlaylistCard"
import SongCard from "../components/media/SongCard"
import Shimmer from "../components/ui/Shimmer"
import { Music } from "lucide-react"
import type { Song, Album, Artist, Playlist } from "../types/music"
import type { MoodGenre } from "../services/innertube"

const FALLBACK_COLORS = [
  "#8B5CF6", "#3B82F6", "#10B981", "#EF4444", "#F59E0B",
  "#EC4899", "#14B8A6", "#6366F1", "#F97316", "#06B6D4",
  "#84CC16", "#E879F9", "#22D3EE", "#FB923C", "#A78BFA",
]

function MoodGenreCard({ tag, index }: { tag: MoodGenre; index: number }) {
  const navigate = useNavigate()
  const bgColor = tag.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length]

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-lg transition-all duration-150 hover:brightness-110"
      style={{ backgroundColor: bgColor }}
      onClick={() => {
        if (tag.browseId) {
          const url = tag.params
            ? `/browse/${encodeURIComponent(tag.browseId)}?params=${encodeURIComponent(tag.params)}`
            : `/browse/${encodeURIComponent(tag.browseId)}`
          navigate(url)
        }
      }}
    >
      <div className="flex h-[40px] items-end p-2">
        <p className="text-[11px] font-bold leading-tight text-white drop-shadow-md">{tag.title}</p>
      </div>
    </div>
  )
}

function isSong(item: Song | Album | Artist | Playlist): item is Song {
  return "videoId" in item && "artist" in item && "albumArtUrl" in item
}

function isAlbum(item: Song | Album | Artist | Playlist): item is Album {
  return "browseId" in item && "artist" in item && "coverUrl" in item && !("videoId" in item)
}

function isArtist(item: Song | Album | Artist | Playlist): item is Artist {
  return "browseId" in item && "imageUrl" in item && !("coverUrl" in item)
}

function isPlaylist(item: Song | Album | Artist | Playlist): item is Playlist {
  return "browseId" in item && "coverUrl" in item && !("artist" in item)
}

function getSectionTitle(title: string, t: (key: string) => string): string {
  const lower = title.toLowerCase()
  if (lower.includes("new release")) return t("explore.newReleases")
  if (lower.includes("trending") || lower.includes("hot")) return t("explore.trending")
  if (lower.includes("chart")) return t("explore.charts")
  if (lower.includes("podcast")) return t("explore.podcasts")
  if (lower.includes("for you") || lower.includes("recommended")) return t("explore.recommended")
  if (lower.includes("top song")) return t("explore.topSongs")
  if (lower.includes("top album")) return t("explore.topAlbums")
  if (lower.includes("top artist")) return t("explore.topArtists")
  if (lower.includes("music video")) return t("explore.newMusicVideos")
  return title
}

export default function ExplorePage() {
  const { t } = useTranslation()
  const { data, isLoading, error } = useExplore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="relative h-full overflow-y-auto"
    >
      {/* Mood & Genres grid */}
      {!isLoading && !error && data?.moodGenres && data.moodGenres.length > 0 && (
        <div className="mb-4 pt-4">
          <div className="grid grid-cols-3 gap-1 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {data.moodGenres.map((mg, i) => (
              <MoodGenreCard key={i} tag={mg} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col gap-6 pt-4">
          <div className="grid grid-cols-3 gap-1 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Shimmer key={i} height={40} rounded="8px" />
            ))}
          </div>
          <div>
            <Shimmer height={16} width="35%" />
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i}>
                  <Shimmer height={0} rounded="8px" />
                  <div className="aspect-square" />
                  <Shimmer height={12} width="80%" />
                  <Shimmer height={10} width="50%" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-12 flex flex-col items-center gap-3">
          <Music size={32} className="text-muted" />
          <p className="text-sm text-error">{t("common.failedToLoad")}</p>
        </div>
      )}

      {/* Content sections as grids */}
      {!isLoading && !error && data?.sections && data.sections.map((section, idx) => {
        const songs = section.items.filter(isSong)
        const albums = section.items.filter(isAlbum)
        const artists = section.items.filter(isArtist)
        const playlists = section.items.filter(isPlaylist)

        return (
          <div key={idx} className="mb-6">
            <h3 className="mb-3 text-sm font-bold text-primary">{getSectionTitle(section.title, t)}</h3>
            {albums.length > 0 && (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {albums.slice(0, 10).map((album) => (
                  <div key={album.browseId}>
                    <AlbumCard album={album} />
                  </div>
                ))}
              </div>
            )}
            {artists.length > 0 && (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {artists.slice(0, 10).map((artist) => (
                  <div key={artist.browseId}>
                    <ArtistCard artist={artist} />
                  </div>
                ))}
              </div>
            )}
            {playlists.length > 0 && (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {playlists.slice(0, 10).map((pl) => (
                  <div key={pl.browseId}>
                    <PlaylistCard playlist={pl} />
                  </div>
                ))}
              </div>
            )}
            {songs.length > 0 && (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {songs.slice(0, 10).map((song) => (
                  <SongCard key={song.videoId} song={song} />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </motion.div>
  )
}
