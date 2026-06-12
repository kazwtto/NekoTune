export interface Song {
  id: string
  videoId: string
  title: string
  artist: string
  artistId?: string
  album?: string
  albumId?: string
  albumArtUrl?: string
  duration: number
  thumbnail?: string
  isLocal?: boolean
  isVideo?: boolean
  filePath?: string
  fileData?: string
}

export interface Album {
  id: string
  browseId: string
  title: string
  artist: string
  artistId?: string
  year?: number
  coverUrl?: string
  songCount?: number
  songs?: Song[]
}

export interface Artist {
  id: string
  browseId: string
  name: string
  imageUrl?: string
  subscribers?: string
  songs?: Song[]
  albums?: Album[]
}

export interface Playlist {
  id: string
  browseId: string
  title: string
  description?: string
  coverUrl?: string
  songCount?: number
  owner?: string
  songs?: Song[]
}

export interface SearchResults {
  songs: Song[]
  albums: Album[]
  artists: Artist[]
  playlists: Playlist[]
  videos: Song[]
}

export interface LocalSong {
  id: string
  filePath: string
  title: string
  artist: string
  album?: string
  duration: number
  coverData?: string
  fileData?: string
}
