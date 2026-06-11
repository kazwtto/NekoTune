import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { usePlayerStore } from "../stores/playerStore"
import { playerService } from "../services/player"

export function useKeyboard() {
  const store = usePlayerStore()
  const navigate = useNavigate()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return

      switch (e.code) {
        case "Space":
          e.preventDefault()
          if (store.isPlaying) {
            store.pause()
            playerService.pause()
          } else {
            store.resume()
            playerService.play()
          }
          break
        case "ArrowLeft":
          e.preventDefault()
          playerService.seek(Math.max(0, playerService.getCurrentTime() - 5))
          break
        case "ArrowRight":
          e.preventDefault()
          playerService.seek(playerService.getCurrentTime() + 5)
          break
        case "ArrowUp":
          e.preventDefault()
          const newVolUp = Math.min(1, playerService.volume + 0.05)
          playerService.volume = newVolUp
          store.setVolume(newVolUp)
          break
        case "ArrowDown":
          e.preventDefault()
          const newVolDown = Math.max(0, playerService.volume - 0.05)
          playerService.volume = newVolDown
          store.setVolume(newVolDown)
          break
        case "KeyM":
          e.preventDefault()
          playerService.volume = store.volume > 0 ? 0 : 0.8
          store.setVolume(store.volume > 0 ? 0 : 0.8)
          break
        case "KeyL":
          e.preventDefault()
          if (window.location.pathname !== "/lyrics") {
            navigate("/lyrics")
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [store.isPlaying, store.volume, navigate])
}
