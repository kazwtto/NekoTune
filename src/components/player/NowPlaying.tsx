import { motion, AnimatePresence } from "framer-motion"
import { X, Music } from "lucide-react"
import { usePlayerStore } from "../../stores/playerStore"
import { useUiStore } from "../../stores/uiStore"
import ProgressBar from "./ProgressBar"
import Controls from "./Controls"
import VolumeSlider from "./VolumeSlider"
import { Shuffle, Repeat, Heart, ListMusic } from "lucide-react"

export default function NowPlaying() {
  const visible = useUiStore((s) => s.nowPlayingVisible)
  const setVisible = useUiStore((s) => s.setNowPlayingVisible)
  const { currentSong, shuffle, repeat, toggleShuffle, toggleRepeat } = usePlayerStore()

  if (!currentSong) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-40 flex flex-col items-center justify-center p-8"
          style={{
            background: "linear-gradient(180deg, var(--gradient-start) 0%, var(--bg-primary) 100%)",
          }}
        >
          <button
            onClick={() => setVisible(false)}
            className="absolute right-6 top-6 cursor-pointer rounded-full p-2 transition-colors duration-150 hover:bg-white/5"
            style={{ background: "none", border: "none", color: "var(--text-muted)" }}
          >
            <X size={20} />
          </button>

          <div
            className="mb-8 overflow-hidden rounded-2xl shadow-2xl"
            style={{ width: 280, height: 280 }}
          >
            {currentSong.albumArtUrl ? (
              <img
                src={currentSong.albumArtUrl}
                alt={currentSong.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{ background: "var(--bg-surface)" }}
              >
                <Music size={48} style={{ color: "var(--text-muted)" }} />
              </div>
            )}
          </div>

          <h2 className="mb-1 text-center text-xl font-bold">{currentSong.title}</h2>
          <p className="mb-8 text-sm" style={{ color: "var(--text-secondary)" }}>
            {currentSong.artist}
          </p>

          <div className="mb-6 w-full" style={{ maxWidth: 400 }}>
            <ProgressBar />
          </div>

          <div className="mb-8">
            <Controls />
          </div>

          <div className="flex items-center gap-5">
            <button onClick={toggleShuffle} className="cursor-pointer transition-colors duration-150" style={{ background: "none", border: "none", color: shuffle ? "var(--accent)" : "var(--text-muted)" }}>
              <Shuffle size={18} />
            </button>
            <button className="cursor-pointer transition-colors duration-150" style={{ background: "none", border: "none", color: "var(--text-muted)" }}>
              <Heart size={18} />
            </button>
            <button onClick={toggleRepeat} className="cursor-pointer transition-colors duration-150" style={{ background: "none", border: "none", color: repeat !== "off" ? "var(--accent)" : "var(--text-muted)" }}>
              <Repeat size={18} />
            </button>
            <button className="cursor-pointer transition-colors duration-150" style={{ background: "none", border: "none", color: "var(--text-muted)" }}>
              <ListMusic size={18} />
            </button>
          </div>

          <div className="mt-8">
            <VolumeSlider />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
