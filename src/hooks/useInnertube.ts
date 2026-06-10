import { useQuery } from "@tanstack/react-query"
import { getHomeFeed, getPlaylist, getAlbum, getArtist } from "../services/innertube"

export function useHomeFeed() {
  return useQuery({
    queryKey: ["home-feed"],
    queryFn: getHomeFeed,
    staleTime: 5 * 60_000,
  })
}

export function usePlaylist(browseId: string) {
  return useQuery({
    queryKey: ["playlist", browseId],
    queryFn: () => getPlaylist(browseId),
    enabled: !!browseId,
    staleTime: 60_000,
  })
}

export function useAlbum(browseId: string) {
  return useQuery({
    queryKey: ["album", browseId],
    queryFn: () => getAlbum(browseId),
    enabled: !!browseId,
    staleTime: 60_000,
  })
}

export function useArtist(browseId: string) {
  return useQuery({
    queryKey: ["artist", browseId],
    queryFn: () => getArtist(browseId),
    enabled: !!browseId,
    staleTime: 60_000,
  })
}
