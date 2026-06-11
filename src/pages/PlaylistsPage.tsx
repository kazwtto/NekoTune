import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { ListMusic } from "lucide-react"

export default function PlaylistsPage() {
  const { t } = useTranslation()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex h-full flex-col"
    >
      <div className="flex items-center gap-3 pb-3 pt-4">
        <h1 className="text-xl font-bold text-primary">{t("common.playlists")}</h1>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mt-12 flex flex-col items-center gap-2">
          <ListMusic size={28} className="text-muted" />
          <p className="text-sm text-muted">{t("library.noPlaylists")}</p>
        </div>
      </div>
    </motion.div>
  )
}
