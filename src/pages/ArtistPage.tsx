import { useParams, useNavigate, useLocation } from "react-router-dom"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "react-i18next"
import { useArtist } from "../hooks/useInnertube"
import { usePlayer } from "../hooks/usePlayer"
import { useLibraryStore } from "../stores/libraryStore"
import { useUiStore } from "../stores/uiStore"
import Shimmer from "../components/ui/Shimmer"
import ContextMenu, { ContextMenuItem } from "../components/ui/ContextMenu"
import { Play, User, BadgeCheck, Heart, MoreHorizontal, Music, Disc, Users, Calendar, Plus, ListMusic, Link } from "lucide-react"
import { proxyUrl, highResThumb } from "../services/proxy"
import { useScrollPersistence } from "../hooks/useScrollPersistence"
import type { Song } from "../types/music"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
}

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
}

export default function ArtistPage() {
  const { id } = useParams()
  const location = useLocation()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: artist, isLoading, error } = useArtist(id || "")
  const { play, addToQueue } = usePlayer()
  const [activeTab, setActiveTab] = useState(t("artist.overview", "Visão geral"))
  const scrollRef = useScrollPersistence(`artist-${id}-${activeTab}`)
  const toggleFavorite = useLibraryStore(s => s.toggleFavorite)
  const favorites = useLibraryStore(s => s.favorites)
  const setPlaylistSelectModalVisible = useUiStore(s => s.setPlaylistSelectModalVisible)
  const [menuPos, setMenuPos] = useState<{ x: number; y: number; song?: Song } | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [artistMenuPos, setArtistMenuPos] = useState<{ x: number; y: number } | null>(null)

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
        <div className="flex gap-6 mb-8">
          <Shimmer width={100} height={100} rounded="50%" />
          <div className="flex flex-col gap-3 justify-center">
            <Shimmer width={200} height={32} />
            <Shimmer width={150} height={20} />
            <div className="flex gap-3 mt-2">
              <Shimmer width={120} height={28} rounded="9999px" />
              <Shimmer width={100} height={28} rounded="9999px" />
            </div>
          </div>
        </div>
        <Shimmer width="100%" height={200} rounded="12px" />
      </motion.div>
    )
  }

  if (error || !artist) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
        <p className="text-sm text-error">{t("common.failedToLoad")}</p>
      </motion.div>
    )
  }

  function playTopSong() {
    if (artist!.songs && artist!.songs.length > 0) {
      play(artist!.songs[0])
    }
  }

  function handleContextMenu(e: React.MouseEvent, song: Song) {
    e.preventDefault()
    e.stopPropagation()
    setMenuPos({ x: e.clientX, y: e.clientY, song })
  }

  function handleArtistMenu(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setArtistMenuPos({ x: e.clientX, y: e.clientY })
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href)
    setArtistMenuPos(null)
  }

  const tabs = [
    t("artist.overview", "Visão geral"),
    t("artist.songs", "Músicas"),
    t("artist.albums", "Álbuns"),
    t("artist.playlists", "Playlists"),
    t("artist.about", "Sobre")
  ]

  const subCountRaw = artist?.subscribers || ""
  const subCount = subCountRaw.replace(/monthly audience/i, '').replace(/ouvintes(.*)/i, '').trim()

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col h-full overflow-hidden"
    >
      <div className="flex-none mt-4 flex items-stretch justify-between gap-4 px-2">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="h-[100px] w-[100px] flex-shrink-0 overflow-hidden rounded-full bg-surface shadow-xl">
            {artist!.imageUrl ? (
              <img src={proxyUrl(artist!.imageUrl)} alt={artist!.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User size={32} className="text-white/80" />
              </div>
            )}
          </div>
          
          <div className="flex flex-col min-w-0 flex-1 justify-center">
            <div className="flex items-center gap-1.5 pb-0.5">
              <h2 className="text-[24px] font-bold text-white tracking-tight truncate">{artist!.name}</h2>
              <BadgeCheck className="text-[#E83B7E] flex-shrink-0" size={20} />
            </div>
            
            {subCount && (
              <div className="flex items-center gap-1.5 text-[11px] text-white/50 mb-2.5">
                <span className="truncate">{subCount} {t("artist.monthlyAudience", "ouvintes/mês")}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button 
                onClick={playTopSong} 
                className="flex h-[28px] cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#E83B7E] px-4 text-[11px] font-bold text-white transition-transform hover:scale-105 shadow-lg shadow-[#E83B7E]/20 whitespace-nowrap"
              >
                <Play size={12} fill="currentColor" /> {t("artist.playArtist", "Tocar artista")}
              </button>
              <button 
                onClick={() => setIsFollowing(!isFollowing)}
                className={`flex h-[28px] cursor-pointer items-center justify-center gap-1.5 rounded-full border px-3 text-[11px] font-medium transition-colors whitespace-nowrap ${isFollowing ? 'border-[#E83B7E] bg-[#E83B7E]/10 text-[#E83B7E]' : 'border-white/10 bg-transparent text-white/80 hover:bg-white/10 hover:text-white'}`}
              >
                <Heart size={12} fill={isFollowing ? "currentColor" : "none"} /> 
                {isFollowing ? t("artist.following", "Seguindo") : t("artist.follow", "Seguir")}
              </button>
              <button 
                onClick={handleArtistMenu}
                className="flex h-[28px] w-[28px] flex-shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-transparent text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <MoreHorizontal size={12} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-2 pl-4 border-l border-white/10 text-[11px] text-white/50 min-w-[140px] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <Music size={12} className="opacity-60 flex-shrink-0" /> 
            <span className="truncate">{t("common.songsCount", { count: artist!.songs?.length || 0 })}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Disc size={12} className="opacity-60 flex-shrink-0" /> 
            <span className="truncate">{artist!.albums?.length || 0} {t("artist.albums", "álbuns").toLowerCase()}</span>
          </div>
          {subCount && (
            <div className="flex items-center gap-2.5">
              <Users size={12} className="opacity-60 flex-shrink-0" /> 
              <span className="truncate">{subCount} {t("artist.monthlyAudience", "ouvintes/mês")}</span>
            </div>
          )}
          <div className="flex items-center gap-2.5">
            <Calendar size={12} className="opacity-60 flex-shrink-0" /> 
            <span className="truncate">{t("artist.since", "No NekoTune desde 2018")}</span>
          </div>
        </div>
      </div>

      <div className="flex-none mt-5 flex items-center gap-6 border-b border-white/5 px-2">
        {tabs.map((tab) => (
          <div 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`relative pb-2.5 text-[12px] font-medium cursor-pointer transition-colors ${activeTab === tab ? "text-white" : "text-white/50 hover:text-white/80"}`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="artistTabIndicator" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E83B7E] rounded-t-full" />
            )}
          </div>
        ))}
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar mt-4 px-2"
      >
        <AnimatePresence mode="wait">
          {activeTab === t("artist.overview", "Visão geral") && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
        
        <div className="flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[14px] font-bold text-white truncate">{t("artist.popularSongs", "Músicas Populares")}</h3>
            <button 
              onClick={() => setActiveTab(t("artist.songs", "Músicas"))}
              className="text-[11px] font-medium text-[#E83B7E] hover:text-[#E83B7E]/80 transition-colors cursor-pointer flex-shrink-0 ml-2"
            >
              {t("artist.seeAll", "Ver todas")}
            </button>
          </div>
          
          <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col">
            {artist!.songs?.slice(0, 4).map((song, i) => {
              const isFav = favorites.includes(song.videoId)
              return (
                <motion.div 
                  key={song.videoId} 
                  variants={item}
                  className="group relative flex items-center gap-3 border-b border-white/[0.02] py-2 px-2 hover:bg-white/[0.03] rounded-lg transition-colors cursor-pointer" 
                  onClick={() => play(song)}
                  onContextMenu={(e) => handleContextMenu(e, song)}
                >
                  <div className="w-5 text-center text-[11px] font-bold text-white/40 group-hover:hidden flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="w-5 items-center justify-center text-white hidden group-hover:flex flex-shrink-0">
                    <Play size={10} fill="currentColor" />
                  </div>
                  
                  <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-[4px] bg-white/5 shadow-sm">
                    <img src={highResThumb(song.videoId) || proxyUrl(song.thumbnail)} alt="" className="h-full w-full object-cover" />
                  </div>
                  
                  <div className="flex flex-col min-w-0 flex-1 justify-center">
                    <p className="text-[12px] font-semibold text-white truncate group-hover:text-[#E83B7E] transition-colors">{song.title}</p>
                    <p className="text-[11px] text-white/50 truncate tracking-wide mt-0.5">{song.album || song.artist}</p>
                  </div>
                  
                  <div className="text-[11px] font-medium text-white/40 w-10 text-right flex-shrink-0 tabular-nums">
                    {song.duration ? `${Math.floor(song.duration/60)}:${String(song.duration%60).padStart(2, '0')}` : ""}
                  </div>
                  
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity pl-2 pr-1 flex-shrink-0">
                    <button 
                      className={`transition-colors p-1.5 cursor-pointer ${isFav ? "text-[#E83B7E]" : "text-white/40 hover:text-white"}`} 
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(song.videoId) }}
                    >
                      <Heart size={12} fill={isFav ? "currentColor" : "none"} />
                    </button>
                    <button 
                      className="text-white/40 hover:text-white transition-colors p-1.5 cursor-pointer" 
                      onClick={(e) => handleContextMenu(e, song)}
                    >
                      <MoreHorizontal size={12} />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[14px] font-bold text-white truncate">{t("artist.albums", "Álbuns")}</h3>
            <button 
              onClick={() => setActiveTab(t("artist.albums", "Álbuns"))}
              className="text-[11px] font-medium text-[#E83B7E] hover:text-[#E83B7E]/80 transition-colors cursor-pointer flex-shrink-0 ml-2"
            >
              {t("artist.seeAll", "Ver todos")}
            </button>
          </div>

          <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-1">
            {artist!.albums?.slice(0, 3).map((album) => (
              <motion.div 
                key={album.browseId} 
                variants={item}
                className="group flex items-center gap-3 rounded-lg border border-transparent py-2 px-2 hover:bg-white/[0.03] transition-colors cursor-pointer"
                onClick={() => navigate(`/album/${album.browseId}`)}
              >
                <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-[4px] bg-white/5 shadow-sm">
                  <img src={proxyUrl(album.coverUrl)} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                
                <div className="flex flex-col min-w-0 flex-1 justify-center">
                  <p className="text-[12px] font-semibold text-white truncate">{album.title}</p>
                  <p className="text-[11px] text-white/50 truncate tracking-wide mt-0.5">
                    {album.year || "2024"} • {t("common.songsCount", { count: album.songCount || 0 })}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

            </motion.div>
          )}

          {activeTab === t("artist.songs", "Músicas") && (
            <motion.div
              key="songs"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col pb-2"
            >
              <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col">
                {artist!.songs?.map((song, i) => {
                  const isFav = favorites.includes(song.videoId)
                  return (
                    <motion.div 
                      key={song.videoId} 
                      variants={item}
                      className="group relative flex items-center gap-3 border-b border-white/[0.02] py-2 px-2 hover:bg-white/[0.03] rounded-lg transition-colors cursor-pointer" 
                      onClick={() => play(song)}
                      onContextMenu={(e) => handleContextMenu(e, song)}
                    >
                      <div className="w-5 text-center text-[11px] font-bold text-white/40 group-hover:hidden flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="w-5 items-center justify-center text-white hidden group-hover:flex flex-shrink-0">
                        <Play size={10} fill="currentColor" />
                      </div>
                      
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-[4px] bg-white/5 shadow-sm">
                        <img src={highResThumb(song.videoId) || proxyUrl(song.thumbnail)} alt="" className="h-full w-full object-cover" />
                      </div>
                      
                      <div className="flex flex-col min-w-0 flex-1 justify-center">
                        <p className="text-[12px] font-semibold text-white truncate group-hover:text-[#E83B7E] transition-colors">{song.title}</p>
                        <p className="text-[11px] text-white/50 truncate tracking-wide mt-0.5">{song.album || song.artist}</p>
                      </div>
                      
                      <div className="text-[11px] font-medium text-white/40 w-10 text-right flex-shrink-0 tabular-nums">
                        {song.duration ? `${Math.floor(song.duration/60)}:${String(song.duration%60).padStart(2, '0')}` : ""}
                      </div>
                      
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity pl-2 pr-1 flex-shrink-0">
                        <button 
                          className={`transition-colors p-1.5 cursor-pointer ${isFav ? "text-[#E83B7E]" : "text-white/40 hover:text-white"}`} 
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(song.videoId) }}
                        >
                          <Heart size={12} fill={isFav ? "currentColor" : "none"} />
                        </button>
                        <button 
                          className="text-white/40 hover:text-white transition-colors p-1.5 cursor-pointer" 
                          onClick={(e) => handleContextMenu(e, song)}
                        >
                          <MoreHorizontal size={12} />
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            </motion.div>
          )}

          {activeTab === t("artist.albums", "Álbuns") && (
            <motion.div
              key="albums"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-2"
            >
              <motion.div variants={container} initial="hidden" animate="show" className="contents">
                {artist!.albums?.map((album) => (
                  <motion.div 
                    key={album.browseId} 
                    variants={item}
                    className="group flex flex-col gap-3 rounded-xl p-3 hover:bg-white/[0.03] transition-colors cursor-pointer border border-white/[0.02]"
                    onClick={() => navigate(`/album/${album.browseId}`)}
                  >
                    <div className="aspect-square w-full overflow-hidden rounded-[8px] bg-white/5 shadow-md">
                      <img src={proxyUrl(album.coverUrl)} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-[13px] font-bold text-white truncate">{album.title}</p>
                      <p className="text-[11px] text-white/50 truncate tracking-wide mt-1">
                        {album.year || "2024"} • {t("common.songsCount", { count: album.songCount || 0 })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {activeTab === t("artist.playlists", "Playlists") && (
            <motion.div
              key="playlists"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-2"
            >
              {artist!.playlists && artist!.playlists.length > 0 ? (
                <motion.div variants={container} initial="hidden" animate="show" className="contents">
                  {artist!.playlists.map((playlist) => (
                    <motion.div 
                      key={playlist.browseId} 
                      variants={item}
                      className="group flex flex-col gap-3 rounded-xl p-3 hover:bg-white/[0.03] transition-colors cursor-pointer border border-white/[0.02]"
                      onClick={() => navigate(`/playlist/${playlist.browseId}`)}
                    >
                      <div className="aspect-square w-full overflow-hidden rounded-[8px] bg-white/5 shadow-md">
                        <img src={proxyUrl(playlist.coverUrl)} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="text-[13px] font-bold text-white truncate">{playlist.title}</p>
                        <p className="text-[11px] text-white/50 truncate tracking-wide mt-1">
                          {playlist.description || playlist.owner || t("artist.playlists")}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="col-span-full py-10 text-center text-[13px] text-white/50">
                  {t("artist.noPlaylists", "Nenhuma playlist encontrada.")}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === t("artist.about", "Sobre") && (
            <motion.div
              key="about"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col pb-8"
            >
              <h3 className="text-[18px] font-bold text-white mb-4">{t("artist.about", "Sobre")} {artist!.name}</h3>
              {artist!.description ? (
                <div className="text-[14px] text-white/70 leading-relaxed whitespace-pre-wrap max-w-3xl">
                  {artist!.description}
                </div>
              ) : (
                <div className="text-[13px] text-white/50">
                  {t("artist.noDescription", "Nenhuma informação adicional disponível.")}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {menuPos && menuPos.song && (
        <ContextMenu x={menuPos.x} y={menuPos.y} onClose={() => setMenuPos(null)}>
          <ContextMenuItem onClick={() => { play(menuPos.song!); setMenuPos(null) }}>
            <Play size={14} /> {t("common.play")}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => { addToQueue(menuPos.song!); setMenuPos(null) }}>
            <Plus size={14} /> {t("player.addToQueue")}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => { setPlaylistSelectModalVisible(true, menuPos.song!); setMenuPos(null) }}>
            <ListMusic size={14} /> {t("common.addToPlaylist")}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => { toggleFavorite(menuPos.song!.videoId); setMenuPos(null) }}>
            <Heart size={14} fill={favorites.includes(menuPos.song!.videoId) ? "currentColor" : "none"} /> 
            {favorites.includes(menuPos.song!.videoId) ? t("common.removeFromFavorites") : t("common.addToFavorites")}
          </ContextMenuItem>
        </ContextMenu>
      )}
      {artistMenuPos && (
        <ContextMenu x={artistMenuPos.x} y={artistMenuPos.y} onClose={() => setArtistMenuPos(null)}>
          <ContextMenuItem onClick={handleCopyLink}>
            <Link size={14} /> {t("artist.copyLink", "Copiar Link")}
          </ContextMenuItem>
        </ContextMenu>
      )}

    </motion.div>
  )
}
