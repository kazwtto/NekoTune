import { invoke } from "@tauri-apps/api/core"
import type { SearchResults, Song, Album, Artist, Playlist } from "../types/music"

interface RustSongData {
  id: string
  video_id: string
  title: string
  artist: string
  artist_id?: string
  album?: string
  album_id?: string
  album_art_url?: string
  duration: number
}

interface RustAlbumData {
  id: string
  browse_id: string
  title: string
  artist: string
  artist_id?: string
  year?: number
  cover_url?: string
  song_count?: number
  songs: RustSongData[]
}

interface RustArtistData {
  id: string
  browse_id: string
  name: string
  image_url?: string
  subscribers?: string
  songs: RustSongData[]
  albums: RustAlbumData[]
}

interface RustPlaylistData {
  id: string
  browse_id: string
  title: string
  description?: string
  cover_url?: string
  song_count?: number
  owner?: string
  songs: RustSongData[]
}

interface RustHomeItem {
  type: string
  id?: string
  video_id?: string
  browse_id?: string
  title: string
  subtitle?: string
  cover_url?: string
  duration?: number
}

interface RustHomeSection {
  title: string
  items: RustHomeItem[]
}

interface RustMoodGenre {
  title: string
  color?: string
  browse_id?: string
  params?: string
}

interface RustHomeFeedData {
  sections: RustHomeSection[]
  tags: RustMoodGenre[]
}

interface RustExploreData {
  sections: RustHomeSection[]
  mood_genres: RustMoodGenre[]
}

interface RustSearchResults {
  songs: RustSongData[]
  albums: RustAlbumData[]
  artists: RustArtistData[]
  playlists: RustPlaylistData[]
  videos: RustSongData[]
}

function mapSong(s: RustSongData): Song {
  return {
    id: s.id,
    videoId: s.video_id,
    title: s.title,
    artist: s.artist,
    artistId: s.artist_id,
    album: s.album,
    albumId: s.album_id,
    albumArtUrl: s.album_art_url,
    duration: s.duration,
  }
}

function mapAlbum(a: RustAlbumData): Album {
  return {
    id: a.id,
    browseId: a.browse_id,
    title: a.title,
    artist: a.artist,
    artistId: a.artist_id,
    year: a.year,
    coverUrl: a.cover_url,
    songCount: a.song_count,
    songs: a.songs?.map(mapSong),
  }
}

function mapArtist(a: RustArtistData): Artist {
  return {
    id: a.id,
    browseId: a.browse_id,
    name: a.name,
    imageUrl: a.image_url,
    subscribers: a.subscribers,
    songs: a.songs?.map(mapSong),
    albums: a.albums?.map(mapAlbum),
  }
}

function mapPlaylist(p: RustPlaylistData): Playlist {
  return {
    id: p.id,
    browseId: p.browse_id,
    title: p.title,
    description: p.description,
    coverUrl: p.cover_url,
    songCount: p.song_count,
    owner: p.owner,
    songs: p.songs?.map(mapSong),
  }
}

function mapHomeItem(item: RustHomeItem): Song | Album | Artist | Playlist {
  switch (item.type) {
    case "song":
      return {
        id: item.id || item.video_id || "",
        videoId: item.video_id || item.id || "",
        title: item.title,
        artist: item.subtitle || "Unknown",
        albumArtUrl: item.cover_url,
        duration: item.duration || 0,
      } as Song
    case "album":
      return {
        id: item.browse_id || item.id || "",
        browseId: item.browse_id || item.id || "",
        title: item.title,
        artist: item.subtitle || "Unknown",
        coverUrl: item.cover_url,
      } as Album
    case "artist":
      return {
        id: item.browse_id || item.id || "",
        browseId: item.browse_id || item.id || "",
        name: item.title,
        imageUrl: item.cover_url,
      } as Artist
    case "playlist":
    default:
      return {
        id: item.id || item.browse_id || "",
        browseId: item.browse_id || item.id || "",
        title: item.title,
        description: item.subtitle,
        coverUrl: item.cover_url,
      } as Playlist
  }
}

export interface HomeFeedResult {
  sections: { title: string; items: (Song | Album | Artist | Playlist)[] }[]
  tags: MoodGenre[]
}

export async function getHomeFeed(): Promise<HomeFeedResult> {
  const data = await invoke<RustHomeFeedData>("cmd_get_home_feed")
  return {
    sections: data.sections.map((s) => ({
      title: s.title,
      items: s.items.map(mapHomeItem),
    })),
    tags: data.tags.map((t) => ({
      title: t.title,
      color: t.color,
      browseId: t.browse_id,
      params: t.params,
    })),
  }
}

export interface MoodGenre {
  title: string
  color?: string
  browseId?: string
  params?: string
}

export async function getExplore(): Promise<{ sections: { title: string; items: (Song | Album | Artist | Playlist)[] }[]; moodGenres: MoodGenre[] }> {
  const data = await invoke<RustExploreData>("cmd_get_explore")
  return {
    sections: data.sections.map((s) => ({
      title: s.title,
      items: s.items.map(mapHomeItem),
    })),
    moodGenres: data.mood_genres.map((mg) => ({
      title: mg.title,
      color: mg.color,
      browseId: mg.browse_id,
      params: mg.params,
    })),
  }
}

export async function searchMusic(query: string): Promise<SearchResults> {
  const results = await invoke<RustSearchResults>("cmd_search_music", { query })
  return {
    songs: results.songs.map(mapSong),
    albums: results.albums.map(mapAlbum),
    artists: results.artists.map(mapArtist),
    playlists: results.playlists.map(mapPlaylist),
    videos: results.videos.map(mapSong),
  }
}

export async function getSearchSuggestions(query: string): Promise<string[]> {
  return invoke<string[]>("cmd_get_search_suggestions", { query })
}

export async function getPlaylist(browseId: string): Promise<Playlist> {
  const pl = await invoke<RustPlaylistData>("cmd_get_playlist", { browseId })
  return mapPlaylist(pl)
}

export async function getAlbum(browseId: string): Promise<Album> {
  const album = await invoke<RustAlbumData>("cmd_get_album", { browseId })
  return mapAlbum(album)
}

export async function getArtist(browseId: string): Promise<Artist> {
  const artist = await invoke<RustArtistData>("cmd_get_artist", { browseId })
  return mapArtist(artist)
}

export async function browseCategory(browseId: string, params?: string): Promise<{ title: string; items: (Song | Album | Artist | Playlist)[] }[]> {
  const sections = await invoke<RustHomeSection[]>("cmd_browse_category", { browseId, params: params || null })
  return sections.map((s) => ({
    title: s.title,
    items: s.items.map(mapHomeItem),
  }))
}

export async function getStreamUrl(videoId: string): Promise<{ url: string; duration: number } | null> {
  try {
    return await invoke<{ url: string; duration: number }>("cmd_get_stream_url", { videoId })
  } catch {
    return null
  }
}

export async function getLyricsFromYt(videoId: string): Promise<string | null> {
  try {
    return await invoke<string | null>("cmd_get_lyrics", { videoId })
  } catch {
    return null
  }
}
