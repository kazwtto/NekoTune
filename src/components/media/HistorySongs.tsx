import { useTranslation } from "react-i18next"
import { usePlayerStore } from "../../stores/playerStore"
import SongCard from "./SongCard"
import { Clock } from "lucide-react"
import type { Song } from "../../types/music"

export default function HistorySongs() {
  const { t } = useTranslation()
  const queueHistory = usePlayerStore((s) => s.queueHistory)

  const uniqueHistory = Array.from(
    new Map(queueHistory.map((s: Song) => [s.videoId, s])).values(),
  )

  if (uniqueHistory.length === 0) {
    return (
      <div className="mt-12 flex flex-col items-center gap-2">
        <Clock size={28} className="text-muted" />
        <p className="text-sm text-muted">{t("library.noPlayHistory")}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      {uniqueHistory.map((song: Song) => (
        <SongCard key={song.videoId} song={song} />
      ))}
    </div>
  )
}
