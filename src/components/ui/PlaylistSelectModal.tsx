import { useTranslation } from "react-i18next"
import { useUiStore } from "../../stores/uiStore"
import { useLibraryStore } from "../../stores/libraryStore"
import Modal from "./Modal"
import { Plus, ListMusic } from "lucide-react"
import { proxyUrl } from "../../services/proxy"

export default function PlaylistSelectModal() {
  const { t } = useTranslation()
  const visible = useUiStore((s) => s.playlistSelectModalVisible)
  const song = useUiStore((s) => s.songForPlaylist)
  const setVisible = useUiStore((s) => s.setPlaylistSelectModalVisible)
  const setCreateModalVisible = useUiStore((s) => s.setPlaylistModalVisible)
  const playlists = useLibraryStore((s) => s.playlists)
  const addToPlaylist = useLibraryStore((s) => s.addToPlaylist)

  function handleClose() {
    setVisible(false)
  }

  function handleSelect(playlistId: string) {
    if (song) {
      addToPlaylist(playlistId, song)
    }
    handleClose()
  }

  return (
    <Modal open={visible} onClose={handleClose} title={t("common.addToPlaylist")} width={320}>
      <div className="flex flex-col gap-2">
        <div className="mb-2 text-sm font-semibold text-primary">{t("common.addToPlaylist")}</div>
        <button
          onClick={() => {
            handleClose()
            setCreateModalVisible(true)
          }}
          className="flex items-center gap-3 rounded-lg p-2.5 text-sm font-medium text-accent hover:bg-accent/10 transition-colors cursor-pointer"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded bg-accent/20">
            <Plus size={18} />
          </div>
          {t("common.createPlaylist")}
        </button>

        <div className="mt-2 flex max-h-64 flex-col gap-1 overflow-y-auto pr-1">
          {playlists.map((pl) => (
            <button
              key={pl.id}
              onClick={() => handleSelect(pl.id)}
              className="flex items-center gap-3 rounded-lg p-2 hover:bg-bg-hover transition-colors text-left cursor-pointer"
            >
              {pl.image ? (
                <img src={proxyUrl(pl.image)} alt="" className="h-10 w-10 rounded object-cover" />
              ) : (
                <div 
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded"
                  style={{ backgroundColor: pl.color || 'rgba(255,255,255,0.1)' }}
                >
                  <ListMusic size={18} className="text-white" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-primary">{pl.title}</p>
                <p className="truncate text-xs text-secondary">{pl.songs?.length || 0} {t("library.songs")}</p>
              </div>
            </button>
          ))}
          {playlists.length === 0 && (
            <div className="py-4 text-center text-xs text-muted">
              {t("library.noPlaylists")}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
