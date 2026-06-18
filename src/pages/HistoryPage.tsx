import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import HistorySongs from "../components/media/HistorySongs"
import { Trash2 } from "lucide-react"
import { usePlayer } from "../hooks/usePlayer"
import { useState } from "react"
import ConfirmationModal from "../components/ui/ConfirmationModal"

export default function HistoryPage() {
  const { t } = useTranslation()
  const { clearHistory, queueHistory } = usePlayer()
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex h-full flex-col"
    >
      <div className="flex items-center justify-between pb-3 pt-4 pr-6">
        <h1 className="text-xl font-bold text-primary">{t("common.history")}</h1>
        {queueHistory.length > 0 && (
          <button
            onClick={() => setShowConfirm(true)}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:bg-bg-hover hover:text-error"
          >
            <Trash2 size={14} />
            {t("common.clear")}
          </button>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="pr-6 pb-6">
          <HistorySongs />
        </div>
      </div>

      <ConfirmationModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={clearHistory}
        title={t("library.playHistory")}
        message={t("common.confirmClearHistory")}
        confirmButtonProps={{ children: t("common.clear") }}
      />
    </motion.div>
  )
}
