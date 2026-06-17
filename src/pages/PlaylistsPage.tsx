import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { ListMusic, Heart, Pencil, Trash2, Music, Star, Sparkles, Moon, Sun, Cloud, Zap, Flame, Droplet, Headphones, Radio, Mic, Coffee, Activity } from "lucide-react"
import { useLibraryStore } from "../stores/libraryStore"
import { useUiStore } from "../stores/uiStore"
import { useNavigate } from "react-router-dom"
import { proxyUrl } from "../services/proxy"

const ICONS: Record<string, any> = {
  "list-music": ListMusic,
  "heart": Heart,
  "star": Star,
  "sparkles": Sparkles,
  "moon": Moon,
  "sun": Sun,
  "cloud": Cloud,
  "zap": Zap,
  "flame": Flame,
  "droplet": Droplet,
  "music": Music,
  "headphones": Headphones,
  "radio": Radio,
  "mic": Mic,
  "coffee": Coffee,
  "activity": Activity,
}

export default function PlaylistsPage() {
  const { t } = useTranslation()
  const playlists = useLibraryStore((s) => s.playlists)
  const deletePlaylist = useLibraryStore((s) => s.deletePlaylist)
  const togglePlaylistFavorite = useLibraryStore((s) => s.togglePlaylistFavorite)
  const setPlaylistModalVisible = useUiStore((s) => s.setPlaylistModalVisible)
  const navigate = useNavigate()

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

      <div className="min-h-0 flex-1 overflow-y-auto pr-6 pb-6">
        {playlists.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {playlists.map((pl) => {
              const IconComponent = (pl.icon && ICONS[pl.icon]) ? ICONS[pl.icon] : Music
              return (
                <div key={pl.id} className="group relative flex flex-col gap-2 rounded-xl bg-surface p-3 transition-colors hover:bg-bg-hover">
                  <div 
                    onClick={() => navigate(`/playlist/${pl.id}`)}
                    className="relative aspect-square w-full cursor-pointer overflow-hidden rounded-lg shadow-sm"
                    style={{ backgroundColor: !pl.image ? (pl.color || 'rgba(255,255,255,0.1)') : undefined }}
                  >
                    {pl.image ? (
                      <img src={proxyUrl(pl.image)} alt={pl.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center transition-transform duration-300 group-hover:scale-105">
                        <IconComponent size={48} className="text-white drop-shadow-md" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-start justify-between min-w-0">
                    <div 
                      className="cursor-pointer min-w-0 flex-1"
                      onClick={() => navigate(`/playlist/${pl.id}`)}
                    >
                      <h3 className="truncate text-sm font-semibold text-primary">{pl.title}</h3>
                      <p className="truncate text-xs text-secondary">{pl.songs?.length || 0} {t("library.songs")}</p>
                    </div>
                  </div>

                  <div className="absolute right-4 top-4 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={(e) => { e.stopPropagation(); togglePlaylistFavorite(pl.id); }}
                      className={`flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-md transition-colors cursor-pointer ${pl.isFavorite ? 'bg-accent/80 text-white' : 'bg-black/50 text-white hover:bg-accent/80'}`}
                      title={pl.isFavorite ? t("common.removeFromFavorites") : t("common.addToFavorites")}
                    >
                      <Heart size={14} fill={pl.isFavorite ? "currentColor" : "none"} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setPlaylistModalVisible(true, pl.id); }}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-white/20 cursor-pointer"
                      title={t("common.edit")}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => { 
                        e.stopPropagation();
                        if (window.confirm(t("common.confirmDelete"))) deletePlaylist(pl.id); 
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-red-400 backdrop-blur-md transition-colors hover:bg-red-500/80 hover:text-white cursor-pointer"
                      title={t("common.delete")}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="mt-12 flex flex-col items-center gap-2">
            <ListMusic size={28} className="text-muted" />
            <p className="text-sm text-muted">{t("library.noPlaylists")}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
