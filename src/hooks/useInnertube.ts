import { useQuery } from "@tanstack/react-query"
import { getHomeFeed, getExplore, getPlaylist, getAlbum, getArtist } from "../services/innertube"
import { listBuffer } from "../services/listBuffer"
import { useSettingsStore } from "../stores/settingsStore"

const bufferEnabled = () => useSettingsStore.getState().settings.listBuffer.enabled

type BufferKey = "home-feed" | "explore" | `playlist:${string}` | `album:${string}` | `artist:${string}`

async function buffered<T>(key: BufferKey, fetcher: () => Promise<T>): Promise<T> {
  if (bufferEnabled()) {
    const cached = listBuffer.get<T>(key)
    if (cached !== null) return cached
  }
  const data = await fetcher()
  if (bufferEnabled()) {
    listBuffer.set(key, data)
  }
  return data
}

export function useHomeFeed() {
  return useQuery({
    queryKey: ["home-feed"],
    queryFn: () => buffered("home-feed", getHomeFeed),
    staleTime: 5 * 60_000,
  })
}

export function useExplore() {
  return useQuery({
    queryKey: ["explore"],
    queryFn: () => buffered("explore", getExplore),
    staleTime: 5 * 60_000,
  })
}

export function usePlaylist(browseId: string) {
  return useQuery({
    queryKey: ["playlist", browseId],
    queryFn: () => buffered(`playlist:${browseId}` as BufferKey, () => getPlaylist(browseId)),
    enabled: !!browseId,
    staleTime: 60_000,
  })
}

export function useAlbum(browseId: string) {
  return useQuery({
    queryKey: ["album", browseId],
    queryFn: () => buffered(`album:${browseId}` as BufferKey, () => getAlbum(browseId)),
    enabled: !!browseId,
    staleTime: 60_000,
  })
}

export function useArtist(browseId: string) {
  return useQuery({
    queryKey: ["artist", browseId],
    queryFn: () => buffered(`artist:${browseId}` as BufferKey, () => getArtist(browseId)),
    enabled: !!browseId,
    staleTime: 60_000,
  })
}
