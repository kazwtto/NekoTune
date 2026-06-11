import { searchMusic, getAlbum, getArtist } from "./innertube"

export async function searchYouTube(query: string, limit?: number) {
  const results = await searchMusic(query)
  const songs = results.songs || results.videos || []
  return limit ? songs.slice(0, limit) : songs
}

export async function getAlbumTracks(browseId: string) {
  const album = await getAlbum(browseId)
  return { tracks: album.songs || [] }
}

export async function getArtistInfo(browseId: string) {
  const artist = await getArtist(browseId)
  return { thumbnailUrl: artist.imageUrl, name: artist.name }
}

export async function getArtistTopTracks(browseId: string) {
  const artist = await getArtist(browseId)
  return artist.songs || []
}
