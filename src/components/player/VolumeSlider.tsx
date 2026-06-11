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
        className="cursor-pointer p-1 text-muted transition-colors duration-150"
      >
        {volume > 0 ? <Volume2 size={14} /> : <VolumeX size={14} />}
      </button>
      <div
        className="relative h-1 w-[70px] cursor-pointer rounded-full bg-elevated"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = (e.clientX - rect.left) / rect.width
          handleChange(Math.round(x * 100) / 100)
        }}
      >
        <div
          className="h-full rounded-full bg-accent transition-all duration-100"
          style={{ width: `${volume * 100}%` }}
        />
      </div>
    </div>
  )
}
