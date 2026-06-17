import { useParams } from "react-router-dom"
import { useState } from "react"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { usePlaylist } from "../hooks/useInnertube"
import { usePlayer } from "../hooks/usePlayer"
import { useLibraryStore } from "../stores/libraryStore"
import SongCard from "../components/media/SongCard"
import MediaPageSkeleton from "../components/ui/MediaPageSkeleton"
import ContextMenu, { ContextMenuItem } from "../components/ui/ContextMenu"
import AddSongsModal from "../components/ui/AddSongsModal"
import { Play, Shuffle, Plus, MoreHorizontal, Music, ListMusic, Heart, Star, Sparkles, Moon, Sun, Cloud, Zap, Flame, Droplet, Headphones, Radio, Mic, Coffee, Activity, Clock, User, Calendar, Pencil } from "lucide-react"
import { proxyUrl } from "../services/proxy"
import { useScrollPersistence } from "../hooks/useScrollPersistence"
import { useUiStore } from "../stores/uiStore"

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

export default function PlaylistPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const setPlaylistModalVisible = useUiStore((s) => s.setPlaylistModalVisible)
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  
  const isLocal = id?.startsWith("pl-")
  const localPlaylist = useLibraryStore(s => s.playlists.find(p => p.id === id))
  
  const { data: externalPlaylist, isLoading: externalLoading, error: externalError } = usePlaylist(!isLocal ? (id || "") : "")
  const { playPlaylist } = usePlayer()
  const scrollRef = useScrollPersistence(`playlist-${id}`)

  const isLoading = isLocal ? false : externalLoading
  const error = isLocal ? (!localPlaylist ? true : false) : externalError

  const playlist = isLocal && localPlaylist ? {
    id: localPlaylist.id,
    title: localPlaylist.title,
    description: "",
    coverUrl: localPlaylist.image,
    songs: localPlaylist.songs || [],
    songCount: localPlaylist.songs?.length || 0,
    owner: t("common.you"),
    color: localPlaylist.color,
    icon: localPlaylist.icon
  } : externalPlaylist

  if (isLoading) {
    return <MediaPageSkeleton />
  }

  if (error || !playlist) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p className="text-sm text-error">{t("common.failedToLoad")}</p>
      </motion.div>
    )
  }

  function playAll() {
    if (playlist!.songs && playlist!.songs.length > 0) {
      playPlaylist(playlist!.songs, false)
    }
  }

  function shuffleAll() {
    if (playlist!.songs && playlist!.songs.length > 0) {
      playPlaylist(playlist!.songs, true)
    }
  }

  const IconComponent = (isLocal && playlist.icon && ICONS[playlist.icon]) ? ICONS[playlist.icon] : Music

  const totalDurationSeconds = playlist.songs?.reduce((acc, song) => acc + (song.duration || 0), 0) || 0
  const durationText = totalDurationSeconds > 0 
    ? (totalDurationSeconds >= 3600 
        ? `${Math.floor(totalDurationSeconds/3600)}h ${Math.floor((totalDurationSeconds%3600)/60)}m` 
        : `${Math.floor(totalDurationSeconds/60)} min ${totalDurationSeconds%60}s`)
    : ""

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col h-full pr-4 pb-2"
    >
      <div className="flex-none mt-6 flex items-stretch justify-between gap-4 px-2">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div 
            className="flex h-[100px] w-[100px] flex-shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-surface"
            style={{ backgroundColor: isLocal && !playlist!.coverUrl ? (playlist!.color || 'rgba(255,255,255,0.1)') : undefined }}
          >
            {playlist!.coverUrl ? (
              <img src={proxyUrl(playlist!.coverUrl)} alt={playlist!.title} className="h-full w-full object-cover" />
            ) : (
              <IconComponent size={32} className={isLocal ? "text-white/80" : "text-muted"} />
            )}
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <h2 className="text-[24px] font-bold text-white tracking-tight truncate pb-0.5">{playlist!.title}</h2>
            
            <div className="flex items-center gap-1.5 text-[11px] text-white/50">
              <span>{t("common.songsCount", { count: playlist!.songCount || 0 })}</span>
              {playlist!.owner && (
                <>
                  <span>•</span>
                  <span>{t("playlist.createdBy")} {playlist!.owner}</span>
                </>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button 
                onClick={playAll} 
                className="flex h-[28px] cursor-pointer items-center gap-1.5 rounded-full bg-[#E83B7E] px-4 text-[11px] font-bold text-white transition-transform hover:scale-105"
              >
                <Play size={12} fill="currentColor" /> {t("playlist.playAll")}
              </button>
              <button 
                onClick={shuffleAll}
                className="flex h-[28px] cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-transparent px-3 text-[11px] font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white truncate"
              >
                <Shuffle size={12} /> <span className="truncate">{t("playlist.shufflePlay")}</span>
              </button>
              {isLocal && (
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex h-[28px] cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-transparent px-3 text-[11px] font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white truncate"
                >
                  <Plus size={12} /> <span className="truncate">{t("playlist.addSongs", "Adicionar músicas")}</span>
                </button>
              )}
              <button 
                onClick={(e) => setMenuPos({ x: e.clientX, y: e.clientY })}
                className="flex h-[28px] w-[28px] flex-shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-transparent text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <MoreHorizontal size={12} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-2 pl-4 border-l border-white/10 text-[11px] text-white/50 min-w-[140px]">
          <div className="flex items-center gap-2.5">
            <Music size={12} className="opacity-60" /> 
            <span>{t("common.songsCount", { count: playlist!.songCount || 0 })}</span>
          </div>
          {durationText && (
            <div className="flex items-center gap-2.5">
              <Clock size={12} className="opacity-60" /> 
              <span>{durationText}</span>
            </div>
          )}
          {playlist!.owner && (
            <div className="flex items-center gap-2.5">
              <User size={12} className="opacity-60" /> 
              <span>{t("playlist.createdBy")} {playlist!.owner}</span>
            </div>
          )}
          {isLocal && (
            <div className="flex items-center gap-2.5">
              <Calendar size={12} className="opacity-60" /> 
              <span>{t("common.updatedToday", "Atualizado hoje")}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-none grid grid-cols-[32px_minmax(0,2.5fr)_minmax(0,2fr)_50px_32px_32px] gap-3 px-4 py-2 mt-6 text-[10px] font-bold tracking-widest text-white/40 uppercase items-center">
        <div className="text-center">#</div>
        <div>{t("player.song")}</div>
        <div>{t("common.artist")}</div>
        <div className="flex justify-end"><Clock size={12} /></div>
        <div className="flex justify-center"><Heart size={12} /></div>
        <div></div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.03] shadow-lg mb-8"
      >
        <div className="flex flex-col">
          {playlist!.songs?.map((song, i) => (
            <SongCard 
              key={song.videoId} 
              song={song} 
              index={i} 
              variant="table" 
              playlistId={isLocal ? playlist!.id : undefined}
            />
          ))}
        </div>
      </div>

      {menuPos && (
        <ContextMenu x={menuPos.x} y={menuPos.y} onClose={() => setMenuPos(null)}>
          <ContextMenuItem onClick={() => { playAll(); setMenuPos(null) }}>
            <Play size={14} /> {t("playlist.playAll")}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => { shuffleAll(); setMenuPos(null) }}>
            <Shuffle size={14} /> {t("playlist.shufflePlay")}
          </ContextMenuItem>
          {isLocal && (
            <ContextMenuItem onClick={() => { setPlaylistModalVisible(true, playlist.id); setMenuPos(null) }}>
              <Pencil size={14} /> {t("common.edit", "Editar")}
            </ContextMenuItem>
          )}
        </ContextMenu>
      )}

      {isLocal && playlist && (
        <AddSongsModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          playlistId={playlist.id} 
        />
      )}
    </motion.div>
  )
}
