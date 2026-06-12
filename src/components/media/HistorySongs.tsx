import { useTranslation } from "react-i18next"
import { usePlayerStore } from "../../stores/playerStore"
import SongCard from "./SongCard"
import { Clock } from "lucide-react"
import { formatDate } from "../../utils/format"

export default function HistorySongs() {
  const { t } = useTranslation()
  const queueHistory = usePlayerStore((s) => s.queueHistory)

  if (!queueHistory || queueHistory.length === 0) {
    return (
      <div className="mt-12 flex flex-col items-center gap-2">
        <Clock size={28} className="text-muted" />
        <p className="text-sm text-muted">{t("library.noPlayHistory")}</p>
      </div>
    )
  }

  // Group entries by formatted date, ensuring the song object exists
  const grouped = queueHistory.reduce((acc, entry, index) => {
    if (!entry || !entry.song) return acc
    
    const dateLabel = formatDate(entry.playedAt, t)
    if (!acc[dateLabel]) acc[dateLabel] = []
    
    // Unshift to keep most recent at top of each group
    acc[dateLabel].unshift({ song: entry.song, index })
    return acc
  }, {} as Record<string, { song: any; index: number }[]>)

  const groupLabels = Object.keys(grouped)

  return (
    <div className="flex flex-col gap-8">
      {groupLabels.map((label) => {
        const items = grouped[label]
        if (!items || items.length === 0) return null

        return (
          <div key={label} className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted px-3">
              {label}
            </h3>
            <div className="flex flex-col gap-1.5">
              {items.map((item) => {
                if (!item.song) return null
                return (
                  <SongCard 
                    key={`${item.song.videoId || 'unknown'}-${item.index}`} 
                    song={item.song} 
                  />
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
