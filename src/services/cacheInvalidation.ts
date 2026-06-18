import { queryClient } from "../main"
import { listBuffer } from "./listBuffer"
import { songMetadataCache } from "../utils/songCache"
import { audioCache } from "./audioCache"
import { imageCacheService } from "./imageCacheService"

export function invalidateHomeFeed() {
  queryClient.invalidateQueries({ queryKey: ["home-feed"] })
  listBuffer.delete("home-feed")
}

export function invalidateExplore() {
  queryClient.invalidateQueries({ queryKey: ["explore"] })
  listBuffer.delete("explore")
}

export function invalidateSearch() {
  queryClient.invalidateQueries({ queryKey: ["search"] })
  queryClient.invalidateQueries({ queryKey: ["suggestions"] })
}

export function invalidatePlaylist(browseId?: string) {
  if (browseId) {
    queryClient.invalidateQueries({ queryKey: ["playlist", browseId] })
    listBuffer.delete(`playlist:${browseId}`)
  } else {
    queryClient.invalidateQueries({ queryKey: ["playlist"] })
    listBuffer.clearType("playlist")
  }
}

export function invalidateAlbum(browseId?: string) {
  if (browseId) {
    queryClient.invalidateQueries({ queryKey: ["album", browseId] })
    listBuffer.delete(`album:${browseId}`)
  } else {
    queryClient.invalidateQueries({ queryKey: ["album"] })
    listBuffer.clearType("album")
  }
}

export function invalidateArtist(browseId?: string) {
  if (browseId) {
    queryClient.invalidateQueries({ queryKey: ["artist", browseId] })
    listBuffer.delete(`artist:${browseId}`)
  } else {
    queryClient.invalidateQueries({ queryKey: ["artist"] })
    listBuffer.clearType("artist")
  }
}

export async function clearAllCaches() {
  queryClient.clear()
  listBuffer.clear()
  songMetadataCache.clear()
  await audioCache.clear()
  await imageCacheService.clear()
}
