import { useState, useEffect, useRef, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useHomeFeed } from "../hooks/useInnertube"
import { usePlayer } from "../hooks/usePlayer"
import { usePlayerStore } from "../stores/playerStore"
import { useScrollPersistence } from "../hooks/useScrollPersistence"
import SongCard from "../components/media/SongCard"
import Shimmer from "../components/ui/Shimmer"
import { RefreshCw, Music, Play, Shuffle } from "lucide-react"
import type { Song, Album, Artist, Playlist } from "../types/music"
import { proxyUrl, highResThumb } from "../services/proxy"
import { getItem, setItem } from "../utils/storage"

const ALBUM_HISTORY_KEY = "nekotune-album-history"
const ARTIST_HISTORY_KEY = "nekotune-artist-history"

function getAlbumHistory(): Album[] {
  return getItem<Album[]>(ALBUM_HISTORY_KEY, [])
}

function saveAlbumToHistory(album: Album) {
  const history = getAlbumHistory()
  const filtered = history.filter((a) => a.browseId !== album.browseId)
  setItem(ALBUM_HISTORY_KEY, [album, ...filtered].slice(0, 10))
}

function getArtistHistory(): Artist[] {
  return getItem<Artist[]>(ARTIST_HISTORY_KEY, [])
}

function saveArtistToHistory(artist: Artist) {
  const history = getArtistHistory()
  const filtered = history.filter((a) => a.browseId !== artist.browseId)
  setItem(ARTIST_HISTORY_KEY, [artist, ...filtered].slice(0, 10))
}

function HorizontalSection({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return
    const amount = dir === "left" ? -300 : 300
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" })
  }

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-baseline justify-between">
        <div>
          <h3 className="text-lg font-bold text-primary">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => scroll("left")}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-bg-hover hover:text-primary"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-bg-hover hover:text-primary"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {children}
      </div>
    </div>
  )
}

function MixCard({ item }: { item: Album | Playlist }) {
  const navigate = useNavigate()
  const { play } = usePlayer()
  const isAlbum = "songs" in item && "coverUrl" in item
  const coverUrl = isAlbum ? (item as Album).coverUrl : (item as Playlist).coverUrl
  const title = item.title
  const subtitle = isAlbum ? (item as Album).artist : (item as Playlist).owner
  const browseId = item.browseId

  function handlePlay(e: React.MouseEvent) {
    e.stopPropagation()
    if (isAlbum && (item as Album).songs && (item as Album).songs!.length > 0) {
      play((item as Album).songs![0])
    }
  }

  return (
    <div
      className="group min-w-[160px] max-w-[160px] cursor-pointer"
      onClick={() => {
        if (isAlbum) saveAlbumToHistory(item as Album)
        navigate(isAlbum ? `/album/${browseId}` : `/playlist/${browseId}`)
      }}
    >
      <div className="relative mb-2.5 aspect-square overflow-hidden rounded-2xl bg-bg-elevated shadow-lg transition-shadow duration-200 group-hover:shadow-xl">
        {coverUrl ? (
          <img src={proxyUrl(coverUrl)} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent/20 to-accent/5">
            <Music size={36} className="text-muted" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        <button
          onClick={handlePlay}
          className="absolute bottom-2 right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-accent opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 hover:scale-105"
        >
          <Play size={18} fill="currentColor" className="ml-0.5 text-white" />
        </button>
      </div>
      <p className="truncate text-sm font-semibold text-primary">{title}</p>
      {subtitle && <p className="truncate text-xs text-secondary">{subtitle}</p>}
    </div>
  )
}

function ArtistChipCard({ artist }: { artist: Artist }) {
  const navigate = useNavigate()

  return (
    <div
      className="group flex min-w-[110px] max-w-[110px] cursor-pointer flex-col items-center gap-2"
      onClick={() => {
        saveArtistToHistory(artist)
        navigate(`/artist/${artist.browseId}`)
      }}
    >
      <div className="relative h-[110px] w-[110px] overflow-hidden rounded-full bg-bg-elevated shadow-lg transition-all duration-200 group-hover:shadow-xl group-hover:ring-2 group-hover:ring-accent/40">
        {artist.imageUrl ? (
          <img src={proxyUrl(artist.imageUrl)} alt={artist.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Music size={28} className="text-muted" />
          </div>
        )}
      </div>
      <p className="truncate text-center text-xs font-medium text-primary">{artist.name}</p>
    </div>
  )
}

function RecentSongCard({ song }: { song: Song }) {
  const { play } = usePlayer()

  return (
    <div
      className="group flex cursor-pointer items-center gap-3 rounded-xl bg-bg-surface/60 p-2.5 transition-all duration-150 hover:bg-bg-hover"
      onClick={() => play(song)}
    >
      {song.videoId ? (
        <img
          src={highResThumb(song.videoId) || proxyUrl(song.albumArtUrl)}
          alt=""
          className="h-12 w-12 flex-shrink-0 rounded-lg object-cover shadow-md"
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
  )
}

function RecentAlbumCard({ album }: { album: Album }) {
  const navigate = useNavigate()

  return (
    <div
      className="group flex cursor-pointer items-center gap-3 rounded-xl bg-bg-surface/60 p-2.5 transition-all duration-150 hover:bg-bg-hover"
      onClick={() => {
        saveAlbumToHistory(album)
        navigate(`/album/${album.browseId}`)
      }}
    >
      {album.coverUrl ? (
        <img
          src={proxyUrl(album.coverUrl)}
          alt=""
          className="h-12 w-12 flex-shrink-0 rounded-lg object-cover shadow-md"
        />
      ) : (
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-bg-elevated">
          <Music size={16} className="text-muted" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-primary">{album.title}</p>
        <p className="truncate text-xs text-secondary">{album.artist}</p>
      </div>
    </div>
  )
}

function SectionContent({ items }: { items: (Song | Album | Artist | Playlist)[] }) {
  const songs = items.filter((i): i is Song => "videoId" in i)
  const albums = items.filter((i): i is Album => "browseId" in i && "songs" in i && "coverUrl" in i)
  const artists = items.filter((i): i is Artist => "browseId" in i && "imageUrl" in i && !("songs" in i))
  const playlists = items.filter((i): i is Playlist => "browseId" in i && !("songs" in i) && !("imageUrl" in i))

  if (songs.length > 0) {
    return (
      <div className="flex flex-col gap-1">
        {songs.slice(0, 6).map((song, i) => (
          <SongCard key={song.videoId || i} song={song} />
        ))}
      </div>
    )
  }

  if (artists.length > 0) {
    return (
      <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-none">
        {artists.slice(0, 8).map((artist) => (
          <ArtistChipCard key={artist.browseId} artist={artist} />
        ))}
      </div>
    )
  }

  const mixes = [...albums, ...playlists]
  if (mixes.length > 0) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
        {mixes.slice(0, 8).map((item) => (
          <MixCard key={item.browseId} item={item} />
        ))}
      </div>
    )
  }

  return null
}

function extractTopArtists(songs: Song[]): { name: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const s of songs) {
    if (s.artist) {
      counts.set(s.artist, (counts.get(s.artist) || 0) + 1)
    }
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
}

export default function HomePage() {
  const { t } = useTranslation()
  const { data: sections, isLoading, error, refetch, isRefetching } = useHomeFeed()
  const { play } = usePlayer()
  const queueHistory = usePlayerStore((s) => s.queueHistory)
  const [scrolled, setScrolled] = useState(false)
  const scrollRef = useScrollPersistence("home")

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    function onScroll() {
      setScrolled(el!.scrollTop > 80)
    }
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [scrollRef])

  const recentSongs = useMemo(() => {
    const seen = new Set<string>()
    const result: Song[] = []
    for (const s of queueHistory) {
      if (!seen.has(s.videoId)) {
        seen.add(s.videoId)
        result.push(s)
      }
    }
    return result.slice(0, 5)
  }, [queueHistory])

  const recentAlbums = getAlbumHistory().slice(0, 5)

  const topArtists = useMemo(() => extractTopArtists(queueHistory), [queueHistory])

  const historySongs = useMemo(() => {
    if (!sections || sections.length === 0) return []
    const artistNames = new Set(topArtists.map((a) => a.name.toLowerCase()))
    const results: Song[] = []
    for (const sec of sections) {
      for (const item of sec.items) {
        if ("videoId" in item) {
          const song = item as Song
          if (artistNames.has(song.artist?.toLowerCase())) {
            results.push(song)
          }
        }
      }
    }
    return results.slice(0, 10)
  }, [sections, topArtists])

  const discoverySongs = useMemo(() => {
    if (!sections || sections.length === 0) return []
    const historyIds = new Set(queueHistory.map((s) => s.videoId))
    const artistNames = new Set(topArtists.map((a) => a.name.toLowerCase()))
    const results: Song[] = []
    for (const sec of sections) {
      for (const item of sec.items) {
        if ("videoId" in item) {
          const song = item as Song
          if (!historyIds.has(song.videoId) && !artistNames.has(song.artist?.toLowerCase())) {
            results.push(song)
          }
        }
      }
    }
    return results.slice(0, 10)
  }, [sections, queueHistory, topArtists])

  function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return t("home.greeting")
    if (hour < 18) return t("home.greeting")
    return t("home.greeting")
  }

  function handleRandomSong() {
    if (!sections) return
    const allSongs: Song[] = []
    for (const sec of sections) {
      for (const item of sec.items) {
        if ("videoId" in item) allSongs.push(item as Song)
      }
    }
    if (allSongs.length === 0) return
    const random = allSongs[Math.floor(Math.random() * allSongs.length)]
    play(random)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="relative h-full overflow-y-auto"
      ref={scrollRef}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">{getGreeting()}</h1>
            {topArtists.length > 0 && (
              <p className="mt-1 text-sm text-secondary">
                {t("home.topArtists")}: {topArtists.slice(0, 3).map((a) => a.name).join(", ")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col gap-6">
          <div>
            <Shimmer height={18} width="30%" />
            <div className="mt-3 flex gap-4">
              <Shimmer height={160} width="160px" rounded="16px" />
              <Shimmer height={160} width="160px" rounded="16px" />
              <Shimmer height={160} width="160px" rounded="16px" />
            </div>
          </div>
          <div>
            <Shimmer height={18} width="40%" />
            <div className="mt-3 flex flex-col gap-1">
              <Shimmer height={56} rounded="12px" />
              <Shimmer height={56} rounded="12px" />
              <Shimmer height={56} rounded="12px" />
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-12 flex flex-col items-center gap-3">
          <Music size={32} className="text-muted" />
          <p className="text-sm text-error">{t("home.noResults")}</p>
          <button
            onClick={() => refetch()}
            className="cursor-pointer rounded-full bg-accent px-5 py-2 text-sm font-medium text-white transition-all duration-150 hover:opacity-90"
          >
            {t("common.retry")}
          </button>
        </div>
      )}

      {/* Recently Played - prominent */}
      {!isLoading && !error && recentSongs.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-3 text-lg font-bold text-primary">{t("home.recentlyPlayed")}</h3>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {recentSongs.map((song) => (
              <RecentSongCard key={song.videoId} song={song} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Albums */}
      {!isLoading && !error && recentAlbums.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-3 text-lg font-bold text-primary">{t("home.recentAlbums")}</h3>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {recentAlbums.map((album) => (
              <RecentAlbumCard key={album.browseId} album={album} />
            ))}
          </div>
        </div>
      )}

      {/* Because You Listened - songs from top artists */}
      {!isLoading && !error && historySongs.length > 0 && topArtists.length > 0 && (
        <HorizontalSection
          title={t("home.becauseYouListened")}
          subtitle={topArtists[0]?.name}
        >
          <div className="flex flex-col gap-1 min-w-0">
            {historySongs.map((song, i) => (
              <SongCard key={song.videoId || i} song={song} />
            ))}
          </div>
        </HorizontalSection>
      )}

      {/* Discover - songs NOT from history */}
      {!isLoading && !error && discoverySongs.length > 0 && (
        <HorizontalSection title={t("home.discover")}>
          <div className="flex flex-col gap-1 min-w-0">
            {discoverySongs.map((song, i) => (
              <SongCard key={song.videoId || i} song={song} />
            ))}
          </div>
        </HorizontalSection>
      )}

      {/* Feed sections */}
      {sections && sections.length > 0
        ? sections.map((section, idx) => (
            <HorizontalSection key={idx} title={section.title}>
              <SectionContent items={section.items} />
            </HorizontalSection>
          ))
        : !isLoading && !error ? (
            <div className="mt-12 flex flex-col items-center gap-2">
              <Music size={32} className="text-muted" />
              <p className="text-sm text-muted">{t("home.noResults")}</p>
            </div>
          )
        : null}

      {/* FABs */}
      <div className="fixed bottom-24 right-6 z-30 flex flex-col gap-2">
        <AnimatePresence>
          {scrolled && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => refetch()}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-bg-surface shadow-lg transition-colors hover:bg-bg-hover"
              title={t("home.refresh")}
            >
              <RefreshCw size={16} className={isRefetching ? "animate-spin text-accent" : "text-secondary"} />
            </motion.button>
          )}
        </AnimatePresence>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRandomSong}
          className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-accent shadow-lg shadow-accent/30 text-white transition-shadow hover:shadow-xl hover:shadow-accent/40"
          title={t("home.randomSong")}
        >
          <Shuffle size={18} />
        </motion.button>
      </div>
    </motion.div>
  )
}
