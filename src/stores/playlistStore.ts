import { useLibraryStore } from "./libraryStore"
import type { Song } from "../types/music"

interface PlaylistWithSongs {
  id: string
  name: string
  tracks: Song[]
  isFavorite?: boolean
  image?: string
  color?: string
  icon?: string
}

function resolvePlaylist(playlist: { id: string; title: string; songs: Song[]; isFavorite?: boolean; image?: string; color?: string; icon?: string }): PlaylistWithSongs {
  return {
    id: playlist.id,
    name: playlist.title,
    tracks: playlist.songs || [],
    isFavorite: playlist.isFavorite,
    image: playlist.image,
    color: playlist.color,
    icon: playlist.icon,
  }
}

export function usePlaylistStore() {
  const playlists = useLibraryStore((s) => s.playlists)
  const createPlaylist = useLibraryStore((s) => s.createPlaylist)
  const deletePlaylist = useLibraryStore((s) => s.deletePlaylist)
  const addToPlaylist = useLibraryStore((s) => s.addToPlaylist)
  const removeFromPlaylist = useLibraryStore((s) => s.removeFromPlaylist)

  const resolvedPlaylists = playlists.map(resolvePlaylist)

  return {
    playlists: resolvedPlaylists,
    addPlaylist: createPlaylist,
    removePlaylist: deletePlaylist,
    addSongToPlaylist: (playlistId: string, track: Song) => {
      addToPlaylist(playlistId, track)
    },
    removeSongFromPlaylist: (playlistId: string, videoId: string) => {
      removeFromPlaylist(playlistId, videoId)
    },
  }
}
