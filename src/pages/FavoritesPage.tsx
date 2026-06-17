import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import FavoriteSongs from "../components/media/FavoriteSongs"
import { useLibraryStore } from "../stores/libraryStore"
import { useNavigate } from "react-router-dom"
import { ListMusic, Heart, Music, Star, Sparkles, Moon, Sun, Cloud, Zap, Flame, Droplet, Headphones, Radio, Mic, Coffee, Activity } from "lucide-react"
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

export default function FavoritesPage() {
  const { t } = useTranslation()
  const playlists = useLibraryStore(s => s.playlists)
  const togglePlaylistFavorite = useLibraryStore(s => s.togglePlaylistFavorite)
  const navigate = useNavigate()

  const favoritePlaylists = playlists.filter(p => p.isFavorite)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex h-full flex-col"
    >
      <div className="flex items-center gap-3 pb-3 pt-4">
        <h1 className="text-xl font-bold text-primary">{t("common.favorites")}</h1>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="pr-6 pb-6">
          
          {favoritePlaylists.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 text-sm font-semibold text-secondary">{t("common.playlists")}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {favoritePlaylists.map((pl) => {
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
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/80 text-white backdrop-blur-md transition-colors cursor-pointer"
                          title={t("common.removeFromFavorites")}
                        >
                          <Heart size={14} fill="currentColor" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <h2 className="mb-4 text-sm font-semibold text-secondary">{t("library.songs")}</h2>
          <FavoriteSongs />
        </div>
      </div>
    </motion.div>
  )
}
