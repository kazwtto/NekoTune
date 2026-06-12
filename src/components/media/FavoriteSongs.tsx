import { useTranslation } from "react-i18next"
import { usePlayerStore } from "../../stores/playerStore"
import { useLibraryStore } from "../../stores/libraryStore"
import SongCard from "./SongCard"
import { Heart } from "lucide-react"
import type { Song } from "../../types/music"

export default function FavoriteSongs() {
  const { t } = useTranslation()
  const queue = usePlayerStore((s) => s.queue)
  const { favorites } = useLibraryStore()

  const uniqueSongs = Array.from(
    new Map(queue.map((s: Song) => [s.videoId, s])).values(),
  )

  const favoriteSongs = uniqueSongs.filter((s: Song) => favorites.includes(s.videoId))

  if (favoriteSongs.length === 0) {
    return (
      <div className="mt-12 flex flex-col items-center gap-2">
        <Heart size={28} className="text-muted" />
        <p className="text-sm text-muted">{t("common.noResults")}</p>
        <p className="text-xs text-muted">{t("common.searchAndPlay")}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      {favoriteSongs.map((song: Song) => (
        <SongCard key={song.videoId} song={song} />
      ))}
    </div>
  )

}
