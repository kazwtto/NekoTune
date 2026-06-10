import { Volume2, VolumeX } from "lucide-react"
import { usePlayerStore } from "../../stores/playerStore"
import { playerService } from "../../services/player"

export default function VolumeSlider() {
  const volume = usePlayerStore((s) => s.volume)
  const setVolume = usePlayerStore((s) => s.setVolume)

  function handleChange(val: number) {
    setVolume(val)
    playerService.volume = val
  }

  function toggleMute() {
    if (volume > 0) {
      setVolume(0)
      playerService.volume = 0
    } else {
      setVolume(0.8)
      playerService.volume = 0.8
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleMute}
        className="cursor-pointer transition-colors duration-150"
        style={{ background: "none", border: "none", color: "var(--text-muted)", padding: 4 }}
      >
        {volume > 0 ? <Volume2 size={14} /> : <VolumeX size={14} />}
      </button>
      <div
        className="relative cursor-pointer rounded-full"
        style={{ width: 70, height: 4, background: "var(--bg-elevated)" }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = (e.clientX - rect.left) / rect.width
          handleChange(Math.round(x * 100) / 100)
        }}
      >
        <div
          className="rounded-full transition-all duration-100"
          style={{
            height: "100%",
            width: `${volume * 100}%`,
            background: "var(--accent)",
          }}
        />
      </div>
    </div>
  )
}
