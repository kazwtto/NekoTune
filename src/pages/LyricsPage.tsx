import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import LyricsView from "../components/lyrics/LyricsView"
import { usePlayerStore } from "../stores/playerStore"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function LyricsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const currentSong = usePlayerStore((s) => s.currentSong)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-full flex-col"
    >
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex cursor-pointer items-center gap-1.5 text-sm transition-colors duration-150 hover:opacity-80"
          style={{ background: "none", border: "none", color: "var(--text-muted)" }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        {currentSong && (
          <div className="text-right">
            <p className="text-sm font-medium">{currentSong.title}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {currentSong.artist}
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        <LyricsView />
      </div>

      <div className="pb-2 text-center">
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {t("common.loading")}
        </p>
      </div>
    </motion.div>
  )
}
