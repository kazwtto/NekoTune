import { useMemo, useRef } from "react"
import { motion } from "framer-motion"
import { useParams, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useQuery } from "@tanstack/react-query"
import { browseCategory } from "../services/innertube"
import { usePlayer } from "../hooks/usePlayer"
import { usePlayerStore } from "../stores/playerStore"
import Shimmer from "../components/ui/Shimmer"
import ScrollRow from "../components/ui/ScrollRow"
import AlbumCard from "../components/media/AlbumCard"
import ArtistCard from "../components/media/ArtistCard"
import PlaylistCard from "../components/media/PlaylistCard"
import { Music, Play } from "lucide-react"
import type { Song, Album, Artist, Playlist } from "../types/music"
import { proxyUrl, highResThumb } from "../services/proxy"

function SectionTitle({ title }: { title: string }) {
  return <h3 className="mb-3 text-base font-bold text-primary">{title}</h3>
}

function SongRow({ songs }: { songs: Song[] }) {
  const { play } = usePlayer()
  const currentSong = usePlayerStore((s) => s.currentSong)

  if (songs.length === 0) return null

  return (
    <ScrollRow className="gap-2">
      {songs.map((song, i) => (
        <div
          key={song.videoId || i}
          className={`group flex min-w-[280px] max-w-[280px] cursor-pointer items-center gap-3 rounded-lg p-2 transition-all duration-150 hover:bg-bg-hover ${
            currentSong?.videoId === song.videoId ? "bg-accent/10" : ""
          }`}
          onClick={() => play(song)}
        >
          {song.isLocal ? (
            song.albumArtUrl ? (
              <img src={song.albumArtUrl} alt="" className="h-12 w-12 flex-shrink-0 rounded-lg object-cover" />
            ) : (
              <div className="thumb-placeholder h-12 w-12" />
            )
          ) : song.videoId ? (
            <img
              src={highResThumb(song.videoId) || proxyUrl(song.albumArtUrl)}
              alt=""
              className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-bg-elevated">
              <Music size={16} className="text-muted" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-primary">{song.title}</p>
            <p className="truncate text-xs text-secondary">{song.artist}</p>
          </div>
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent opacity-0 shadow-md transition-all duration-150 group-hover:opacity-100">
            <Play size={14} fill="currentColor" className="ml-0.5 text-white" />
          </div>
        </div>
      ))}
    </ScrollRow>
  )
}

function AlbumRow({ albums }: { albums: Album[] }) {
  if (albums.length === 0) return null
  return (
    <ScrollRow className="gap-3">
      {albums.map((album) => (
        <div key={album.browseId} className="min-w-[160px] max-w-[160px]">
          <AlbumCard album={album} />
        </div>
      ))}
    </ScrollRow>
  )
}

function ArtistRow({ artists }: { artists: Artist[] }) {
  if (artists.length === 0) return null
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
      {artists.map((artist) => (
        <ArtistCard key={artist.browseId} artist={artist} />
      ))}
    </div>
  )
}

function PlaylistRow({ playlists }: { playlists: Playlist[] }) {
  if (playlists.length === 0) return null
  return (
    <ScrollRow className="gap-3">
      {playlists.map((pl) => (
        <div key={pl.browseId} className="min-w-[160px] max-w-[160px]">
          <PlaylistCard playlist={pl} />
        </div>
      ))}
    </ScrollRow>
  )
}

export default function BrowsePage() {
  const { browseId } = useParams<{ browseId: string }>()
  const [searchParams] = useSearchParams()
  const params = searchParams.get("params") || undefined
  const { t } = useTranslation()
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data: sections, isLoading, error } = useQuery({
    queryKey: ["browse", browseId, params],
    queryFn: () => browseCategory(browseId!, params),
    enabled: !!browseId,
    staleTime: 5 * 60_000,
  })

  const pageTitle = useMemo(() => {
    if (!sections || sections.length === 0) return ""
    return sections[0].title || ""
  }, [sections])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="relative h-full overflow-y-auto pr-6 pb-6"
      ref={scrollRef}
    >
      <div className="pt-4">
        <div className="mb-4 flex items-center gap-3">
          {pageTitle && <h1 className="flex-1 text-lg font-bold text-primary">{pageTitle}</h1>}
        </div>

        {isLoading && (
          <div className="flex flex-col gap-5">
            <div>
              <Shimmer height={16} width="35%" />
              <div className="mt-3 flex gap-2">
                <Shimmer height={56} width="280px" rounded="8px" />
                <Shimmer height={56} width="280px" rounded="8px" />
              </div>
            </div>
            <div>
              <Shimmer height={16} width="40%" />
              <div className="mt-3 flex gap-3">
                <Shimmer height={160} width="160px" rounded="12px" />
                <Shimmer height={160} width="160px" rounded="12px" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-12 flex flex-col items-center gap-3">
            <Music size={32} className="text-muted" />
            <p className="text-sm text-error">{t("common.failedToLoad")}</p>
          </div>
        )}

        {!isLoading && !error && sections && (
          <div className="flex flex-col gap-6">
            {sections.map((sec, idx) => {
              const songs = sec.items.filter((i): i is Song => "videoId" in i)
              const albums = sec.items.filter((i): i is Album => "browseId" in i && "songs" in i && "coverUrl" in i)
              const artists = sec.items.filter((i): i is Artist => "browseId" in i && "imageUrl" in i && !("songs" in i))
              const playlists = sec.items.filter((i): i is Playlist => "browseId" in i && !("songs" in i) && !("imageUrl" in i))

              return (
                <div key={idx}>
                  {sec.title && <SectionTitle title={sec.title} />}
                  <SongRow songs={songs} />
                  <AlbumRow albums={albums} />
                  <ArtistRow artists={artists} />
                  <PlaylistRow playlists={playlists} />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}
