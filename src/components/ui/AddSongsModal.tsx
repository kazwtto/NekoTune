import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Search, Loader2, Check, Music, X, ListMusic } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Modal from "./Modal"
import Button from "./Button"
import { useLibraryStore } from "../../stores/libraryStore"
import { getPlaylist, getAlbum, getArtist, searchMusic } from "../../services/innertube"
import type { Song } from "../../types/music"
import { proxyUrl, highResThumb } from "../../services/proxy"

interface AddSongsModalProps {
  isOpen: boolean
  onClose: () => void
  playlistId: string
}

export default function AddSongsModal({ isOpen, onClose, playlistId }: AddSongsModalProps) {
  const { t } = useTranslation()
  const addToPlaylist = useLibraryStore((s) => s.addToPlaylist)

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [songs, setSongs] = useState<Song[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  function parseInput(val: string): { type: "playlist" | "album" | "artist" | "video" | "search"; id: string } {
    try {
      const u = new URL(val)

      if (u.hostname === "youtu.be") {
        const path = u.pathname.substring(1)
        if (path) return { type: "video", id: path }
      }

      const list = u.searchParams.get("list")
      if (list) {
        if (list.startsWith("OLAK5uy")) return { type: "playlist", id: `VL${list}` }
        if (list.startsWith("PL") || list.startsWith("RD")) return { type: "playlist", id: list.startsWith("VL") ? list : `VL${list}` }
      }
      const v = u.searchParams.get("v")
      if (v) return { type: "video", id: v }

      const pathParts = u.pathname.split("/").filter(Boolean)
      if (pathParts[0] === "channel" || pathParts[0] === "c") {
        return { type: "artist", id: pathParts[1] }
      }
      if (pathParts[0] === "release") {
        return { type: "search", id: val }
      }
    } catch {
    }

    if (val.startsWith("VLPL") || val.startsWith("VLRD")) return { type: "playlist", id: val }
    if (val.startsWith("PL") || val.startsWith("RD")) return { type: "playlist", id: `VL${val}` }
    if (val.startsWith("MPREb_")) return { type: "album", id: val }
    if (val.startsWith("UC")) return { type: "artist", id: val }
    if (val.length === 11 && !val.includes(" ")) return { type: "video", id: val }

    return { type: "search", id: val }
  }

  async function handleLoad() {
    if (!input.trim()) return

    setIsLoading(true)
    setError(null)
    setSongs([])
    setSelectedIds(new Set())

    try {
      const parsed = parseInput(input.trim())
      let loadedSongs: Song[] = []

      if (parsed.type === "playlist") {
        const pl = await getPlaylist(parsed.id)
        if (pl.songs) loadedSongs = pl.songs
      } else if (parsed.type === "album") {
        const al = await getAlbum(parsed.id)
        if (al.songs) loadedSongs = al.songs
      } else if (parsed.type === "artist") {
        const ar = await getArtist(parsed.id)
        if (ar.songs) loadedSongs = ar.songs
      } else if (parsed.type === "video" || parsed.type === "search") {
        const results = await searchMusic(parsed.id)
        if (parsed.type === "video") {
          const exactSong = results.songs.find(s => s.videoId === parsed.id)
                         || results.videos.find(v => v.videoId === parsed.id)
          if (exactSong) {
            loadedSongs = [exactSong]
          } else if (results.songs.length > 0) {
            loadedSongs = [results.songs[0]]
          } else if (results.videos.length > 0) {
            loadedSongs = [results.videos[0]]
          }
        } else {
          loadedSongs = results.songs
        }
      }

      if (loadedSongs.length > 0) {
        setSongs(loadedSongs)
        setSelectedIds(new Set(loadedSongs.map(s => s.videoId)))
      } else {
        setError(t("common.noResults", "Nenhum resultado encontrado."))
      }
    } catch (err: any) {
      setError(err.toString())
    } finally {
      setIsLoading(false)
    }
  }

  function toggleSelect(videoId: string) {
    const next = new Set(selectedIds)
    if (next.has(videoId)) next.delete(videoId)
    else next.add(videoId)
    setSelectedIds(next)
  }

  function toggleSelectAll() {
    if (selectedIds.size === songs.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(songs.map(s => s.videoId)))
    }
  }

  function handleAdd() {
    const songsToAdd = songs.filter(s => selectedIds.has(s.videoId))
    for (const s of songsToAdd) {
      addToPlaylist(playlistId, s)
    }
    onClose()
  }

  const allSelected = selectedIds.size === songs.length && songs.length > 0

  return (
    <>
      <AnimatePresence>
        {isLoading && isOpen && (
          <motion.div
            key="global-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-auto"
          >
            <Loader2 size={40} className="animate-spin text-accent drop-shadow-md" />
          </motion.div>
        )}
      </AnimatePresence>

      <Modal open={isOpen && !isLoading} onClose={onClose} width={480}>
        <motion.div layout className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
              <ListMusic size={18} className="text-accent" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-primary leading-tight">
                {t("playlist.addSongs", "Adicionar músicas")}
              </h2>
              <p className="text-xs text-secondary mt-0.5">
                {t("playlist.addSongsDesc", "Cole um link do YouTube ou pesquise por nome")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLoad()}
              placeholder="https://music.youtube.com/..."
              className="flex-1 border-b border-white/10 bg-transparent py-2 text-sm text-primary placeholder:opacity-35 focus:border-accent focus:outline-none transition-colors"
            />
            <button
              onClick={handleLoad}
              disabled={!input.trim()}
              className="flex cursor-pointer items-center justify-center p-2 text-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              <Search size={18} />
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-red-500/20 bg-red-500/[0.07] text-sm text-red-400 mt-1">
                  <X size={13} className="flex-shrink-0" />
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {songs.length > 0 && (
            <motion.div layout className="flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                  {songs.length} {t("library.songs", "músicas")}
                </span>
                <button
                  onClick={toggleSelectAll}
                  className="text-xs font-medium text-accent hover:text-white transition-colors cursor-pointer"
                >
                  {allSelected
                    ? t("playlist.deselectAll", "Desmarcar todos")
                    : t("playlist.selectAll", "Selecionar todos")
                  }
                </button>
              </div>

              <div className="max-h-[240px] overflow-y-auto flex flex-col gap-0.5 pr-0.5 custom-scrollbar">
                <AnimatePresence>
                  {songs.map((song, i) => {
                    const isSelected = selectedIds.has(song.videoId)
                    return (
                      <motion.div
                        key={song.videoId}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(i * 0.03, 0.3) }}
                        onClick={() => toggleSelect(song.videoId)}
                        className={`group flex items-center gap-3 px-2.5 py-2 rounded-lg cursor-pointer transition-colors duration-150 ${
                          isSelected
                            ? "bg-accent/10"
                            : "hover:bg-white/[0.04]"
                        }`}
                      >
                        <div className={`w-[14px] h-[14px] rounded-[3px] flex items-center justify-center flex-shrink-0 border transition-colors ${
                          isSelected
                            ? "bg-accent border-accent text-black"
                            : "border-white/20 text-transparent group-hover:border-white/40"
                        }`}>
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0.3, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.3, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                              >
                                <Check size={10} strokeWidth={3} />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-white/[0.05] flex items-center justify-center">
                          {(song.thumbnail || song.albumArtUrl || song.videoId) ? (
                            <img
                              src={highResThumb(song.videoId) || proxyUrl(song.albumArtUrl || song.thumbnail)}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Music size={13} className="text-muted" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 flex items-center gap-2">
                          <p className={`text-[13px] truncate transition-colors ${
                            isSelected ? "text-accent font-medium" : "text-primary group-hover:text-white"
                          }`}>
                            {song.title}
                          </p>
                          <span className="text-white/20 text-[10px] flex-shrink-0">•</span>
                          <p className="text-[11px] text-secondary truncate">{song.artist}</p>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>

              <motion.div layout className="flex items-center justify-between pt-3 border-t border-white/10">
                <span className="text-xs text-secondary">
                  <span className="font-semibold text-primary">{selectedIds.size}</span>
                  {" / "}
                  <span>{songs.length}</span>
                </span>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" onClick={onClose} className="text-xs px-3 py-1.5 h-auto">
                    {t("common.cancel", "Cancelar")}
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleAdd}
                    disabled={selectedIds.size === 0}
                    className="text-xs px-4 py-1.5 h-auto"
                  >
                    {t("playlist.addCount", { count: selectedIds.size, defaultValue: `Adicionar ${selectedIds.size}` })}
                  </Button>
                </div>
              </motion.div>

            </motion.div>
          )}
        </motion.div>
      </Modal>
    </>
  )
}