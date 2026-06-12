import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useHomeFeed, useExplore } from "../hooks/useInnertube"
import { usePlayer } from "../hooks/usePlayer"
import { usePlayerStore } from "../stores/playerStore"
import { useScrollPersistence } from "../hooks/useScrollPersistence"
import Shimmer from "../components/ui/Shimmer"
import ScrollRow from "../components/ui/ScrollRow"
import { Music, Play, RefreshCw, Shuffle } from "lucide-react"
import type { Song, Album, Artist, Playlist } from "../types/music"
import type { MoodGenre } from "../services/innertube"
import { proxyUrl, highResThumb } from "../services/proxy"
import AlbumCard from "../components/media/AlbumCard"
import ArtistCard from "../components/media/ArtistCard"
import PlaylistCard from "../components/media/PlaylistCard"

function SectionTitle({ title }: { title: string }) {
  return <h3 className="mb-3 text-base font-bold text-primary">{title}</h3>
}

function TagCarousel({ tags, onRefresh, refreshing }: { tags: MoodGenre[]; onRefresh?: () => void; refreshing?: boolean }) {
  const navigate = useNavigate()

  if (tags.length === 0) return null

  return (
    <div className="mb-5">
      <ScrollRow className="gap-2">
        <button
          onClick={onRefresh}
          className="flex-shrink-0 cursor-pointer rounded-full w-9 h-9 p-0 flex items-center justify-center bg-bg-surface text-secondary transition-all duration-150 hover:brightness-110"
          title="Refresh"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
        </button>
        {tags.map((tag, i) => (
          <button
            key={i}
            onClick={() => {
              if (tag.browseId) {
                const url = tag.params
                  ? `/browse/${encodeURIComponent(tag.browseId)}?params=${encodeURIComponent(tag.params)}`
                  : `/browse/${encodeURIComponent(tag.browseId)}`
                navigate(url)
              }
            }}
            className="flex-shrink-0 cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 hover:brightness-110"
            style={{
              backgroundColor: tag.color || "#8b5cf6",
              color: "#fff",
            }}
          >
            {tag.title}
          </button>
        ))}
      </ScrollRow>
    </div>
  )
}

function SongRow({ songs, title }: { songs: Song[]; title: string }) {
  const { play } = usePlayer()
  const currentSong = usePlayerStore((s) => s.currentSong)

  if (songs.length === 0) return null

  return (
    <div className="mb-6">
      <SectionTitle title={title} />
      <ScrollRow className="gap-2">
        {songs.map((song, i) => (
          <div
            key={song.videoId || i}
            className={`group flex min-w-[280px] max-w-[280px] cursor-pointer items-center gap-3 rounded-lg p-2 transition-all duration-150 hover:bg-bg-hover ${
              currentSong?.videoId === song.videoId ? "bg-accent/10" : ""
            }`}
            onClick={() => play(song)}
          >
            {song.videoId ? (
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
    </div>
  )
}

function AlbumRow({ albums, title }: { albums: Album[]; title: string }) {
  if (albums.length === 0) return null

  return (
    <div className="mb-6">
      <SectionTitle title={title} />
      <ScrollRow className="gap-3">
        {albums.map((album) => (
          <div key={album.browseId} className="min-w-[160px] max-w-[160px]">
            <AlbumCard album={album} />
          </div>
        ))}
      </ScrollRow>
    </div>
  )
}

function ArtistRow({ artists, title }: { artists: Artist[]; title: string }) {
  if (artists.length === 0) return null

  return (
    <div className="mb-6">
      <SectionTitle title={title} />
      <ScrollRow className="gap-4">
        {artists.map((artist) => (
          <ArtistCard key={artist.browseId} artist={artist} />
        ))}
      </ScrollRow>
    </div>
  )
}

function PlaylistRow({ playlists, title }: { playlists: Playlist[]; title: string }) {
  if (playlists.length === 0) return null

  return (
    <div className="mb-6">
      <SectionTitle title={title} />
      <ScrollRow className="gap-3">
        {playlists.map((pl) => (
          <div key={pl.browseId} className="min-w-[160px] max-w-[160px]">
            <PlaylistCard playlist={pl} />
          </div>
        ))}
      </ScrollRow>
    </div>
  )
}

function getLocalizedTitle(title: string, t: (key: string) => string): string {
  const lower = title.toLowerCase()
  if (lower.includes("quick pick")) return t("home.quickPicks")
  if (lower.includes("listen again")) return t("home.listenAgain")
  if (lower.includes("new release")) return t("home.newReleases")
  if (lower.includes("forgotten favorite")) return t("home.forgottenFavorites")
  if (lower.includes("album") && lower.includes("you")) return t("home.albumsForYou")
  if (lower.includes("mix") && lower.includes("you")) return t("home.mixedForYou")
  if (lower.includes("made for you")) return t("home.madeForYou")
  if (lower.includes("trending") || lower.includes("chart") || lower.includes("em alta")) return t("home.trending")
  if (lower.includes("for you") || lower.includes("your")) return t("home.forYou")
  if (lower.includes("recently played")) return t("home.recentlyPlayed")
  if (lower.includes("top songs")) return t("search.songs")
  if (lower.includes("top album")) return t("explore.topAlbums")
  if (lower.includes("top artist")) return t("explore.topArtists")
  if (lower.includes("recommend")) return t("home.discover")
  return title
}

export default function HomePage() {
  const { t } = useTranslation()
  const { data: homeData, isLoading: homeLoading, error: homeError, refetch: refetchHome, isRefetching: homeRefetching } = useHomeFeed()
  const { data: exploreData, refetch: refetchExplore } = useExplore()
  const { play } = usePlayer()
  const queueHistory = usePlayerStore((s) => s.queueHistory)
  const scrollRef = useScrollPersistence("home")

  const isLoading = homeLoading

  const quickPicks = useMemo(() => {
    const seen = new Set<string>()
    const result: Song[] = []
    for (const s of queueHistory) {
      if (!seen.has(s.videoId)) {
        seen.add(s.videoId)
        result.push(s)
      }
    }
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result.slice(0, 20)
  }, [queueHistory])

  const keepListening = useMemo(() => {
    const seen = new Set<string>()
    const result: Song[] = []
    for (const s of queueHistory) {
      if (!seen.has(s.videoId)) {
        seen.add(s.videoId)
        result.push(s)
      }
    }
    return result.slice(0, 15)
  }, [queueHistory])

  const allSections = useMemo(() => {
    const seenSongIds = new Set<string>()
    const result: { title: string; songs: Song[]; albums: Album[]; artists: Artist[]; playlists: Playlist[] }[] = []

    if (homeData?.sections) {
      for (const sec of homeData.sections) {
        const songs = sec.items.filter((i): i is Song => "videoId" in i && !seenSongIds.has(i.videoId))
        for (const s of songs) seenSongIds.add(s.videoId)
        const albums = sec.items.filter((i): i is Album => "browseId" in i && "songs" in i && "coverUrl" in i)
        const artists = sec.items.filter((i): i is Artist => "browseId" in i && "imageUrl" in i && !("songs" in i))
        const playlists = sec.items.filter((i): i is Playlist => "browseId" in i && !("songs" in i) && !("imageUrl" in i))

        if (songs.length > 0 || albums.length > 0 || artists.length > 0 || playlists.length > 0) {
          result.push({ title: sec.title, songs, albums, artists, playlists })
        }
      }
    }

    if (exploreData?.sections) {
      const existingTitles = new Set(result.map((r) => r.title.toLowerCase()))
      for (const sec of exploreData.sections) {
        if (existingTitles.has(sec.title.toLowerCase())) continue
        const songs = sec.items.filter((i): i is Song => "videoId" in i && !seenSongIds.has(i.videoId))
        for (const s of songs) seenSongIds.add(s.videoId)
        const albums = sec.items.filter((i): i is Album => "browseId" in i && "songs" in i && "coverUrl" in i)
        const artists = sec.items.filter((i): i is Artist => "browseId" in i && "imageUrl" in i && !("songs" in i))
        const playlists = sec.items.filter((i): i is Playlist => "browseId" in i && !("songs" in i) && !("imageUrl" in i))

        if (songs.length > 0 || albums.length > 0 || artists.length > 0 || playlists.length > 0) {
          result.push({ title: sec.title, songs, albums, artists, playlists })
        }
      }
    }

    return result
  }, [homeData, exploreData])

  const tags = useMemo(() => {
    const homeTags = homeData?.tags || []
    const exploreTags = exploreData?.moodGenres || []
    const seen = new Set<string>()
    const result: MoodGenre[] = []
    for (const tag of [...homeTags, ...exploreTags]) {
      if (!seen.has(tag.title)) {
        seen.add(tag.title)
        result.push(tag)
      }
    }
    return result
  }, [homeData, exploreData])

  function handleRandomSong() {
    const allSongs: Song[] = []
    for (const sec of allSections) allSongs.push(...sec.songs)
    if (allSongs.length === 0) return
    const random = allSongs[Math.floor(Math.random() * allSongs.length)]
    play(random)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="relative h-full overflow-y-auto"
        ref={scrollRef}
      >
        {isLoading && (
          <div className="sticky top-0 z-10 bg-bg-base pt-4 pb-2">
            <div className="flex gap-2 overflow-hidden">
              {[80, 120, 100, 90, 140, 110, 85].map((w, i) => (
                <Shimmer key={i} height={36} width={`${w}px`} rounded="9999px" />
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col gap-5">
            <div>
              <Shimmer height={16} width="30%" />
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
                <Shimmer height={160} width="160px" rounded="12px" />
              </div>
            </div>
          </div>
        )}

        {!isLoading && homeError && (
          <div className="mt-12 flex flex-col items-center gap-3">
            <Music size={32} className="text-muted" />
            <p className="text-sm text-error">{t("common.failedToLoad")}</p>
            <button
              onClick={() => refetchHome()}
              className="cursor-pointer rounded-full bg-accent px-5 py-2 text-sm font-medium text-white transition-all duration-150 hover:opacity-90"
            >
              {t("common.retry")}
            </button>
          </div>
        )}

        {!isLoading && !homeError && tags.length > 0 && (
          <div className="sticky top-0 z-10 bg-bg-base pt-4 pb-2">
            <TagCarousel tags={tags} onRefresh={() => { refetchHome(); refetchExplore(); }} refreshing={homeRefetching} />
          </div>
        )}

        {!isLoading && !homeError && (
          <div className={tags.length > 0 ? "" : "pt-4"}>
            {quickPicks.length > 0 && (
              <SongRow songs={quickPicks} title={t("home.quickPicks")} />
            )}

            {keepListening.length > 0 && (
              <SongRow songs={keepListening} title={t("home.continueListening")} />
            )}

            {allSections.map((sec, idx) => {
              const title = getLocalizedTitle(sec.title, t)
              return (
                <div key={idx}>
                  {sec.songs.length > 0 && <SongRow songs={sec.songs} title={title} />}
                  {sec.albums.length > 0 && <AlbumRow albums={sec.albums} title={title} />}
                  {sec.artists.length > 0 && <ArtistRow artists={sec.artists} title={title} />}
                  {sec.playlists.length > 0 && <PlaylistRow playlists={sec.playlists} title={title} />}
                </div>
              )
            })}
          </div>
        )}
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleRandomSong}
        className="fixed bottom-24 right-6 z-30 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-accent shadow-lg shadow-accent/30 text-white transition-shadow hover:shadow-xl hover:shadow-accent/40"
        title={t("home.randomSong")}
      >
        <Shuffle size={18} />
      </motion.button>
    </>
  )
}
