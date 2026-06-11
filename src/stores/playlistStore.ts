import { useLibraryStore } from "./libraryStore"
import type { Song } from "../types/music"

interface PlaylistWithSongs {
  id: string
  name: string
  tracks: Song[]
}

function resolvePlaylist(playlist: { id: string; title: string; songIds: string[] }): PlaylistWithSongs {
  return {
    id: playlist.id,
    name: playlist.title,
    tracks: [],
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
      addToPlaylist(playlistId, track.videoId)
    },
    removeSongFromPlaylist: (playlistId: string, videoId: string) => {
      removeFromPlaylist(playlistId, videoId)
    },
  }
}
