import { useTranslation } from "react-i18next"
import { useState } from "react"
import { AlertTriangle, Trash2 } from "lucide-react"
import ConfirmationModal from "../ui/ConfirmationModal"
import { audioCache } from "../../services/audioCache"
import { imageCacheService } from "../../services/imageCacheService"

const ALL_NEKOTUNE_KEYS = [
  "nekotune-settings",
  "nekotune-account",
  "nekotune-player-state",
  "nekotune-favorites",
  "nekotune-playlists",
  "nekotune-search-history",
  "nekotune-song-cache",
  "nekotune-list-buffer",
  "nekotune-floating-settings",
  "nekotune-language",
  "nekotune-library-tab",
]

export default function DangerZoneSection() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDeleteAll() {
    setDeleting(true)
    try {
      ALL_NEKOTUNE_KEYS.forEach((k) => localStorage.removeItem(k))
      await audioCache.clear().catch(() => {})
      await imageCacheService.clear().catch(() => {})
      localStorage.clear()
      window.location.reload()
    } catch {
      window.location.reload()
    }
  }

  return (
    <div className="flex flex-col gap-8 px-4">
      <div>
        <h3 className="mb-5 text-xs font-semibold text-error">
          {t("settings.dangerZone")}
        </h3>
        
        <div className="ml-3 flex flex-col gap-3">
          <p className="text-xs text-muted">
            {t("settings.deleteAllDataDesc")}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-error" />
              <span className="text-sm text-primary">
                {t("settings.deleteAllData")}
              </span>
            </div>
            
            <button
              onClick={() => setOpen(true)}
              className="flex flex-shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-error px-3 py-2 text-xs font-medium text-white transition-all duration-150 hover:opacity-90"
            >
              <Trash2 size={12} />
              {t("settings.deleteAll")}
            </button>
          </div>
        </div>
      </div>

      <ConfirmationModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDeleteAll}
        title={t("settings.deleteAllData")}
        message={t("settings.deleteAllDataConfirm")}
        confirmButtonProps={{
          children: deleting ? t("common.loading") : t("settings.deleteAll"),
          disabled: deleting
        }}
        variant="danger"
      />
    </div>
  )
}