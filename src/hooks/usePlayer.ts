import { useEffect, useRef, useCallback } from "react"
import { usePlayerStore } from "../stores/playerStore"
import { playerService } from "../services/player"
import type { Song } from "../types/music"

export function usePlayer() {
  const store = usePlayerStore()
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const unsubs = [
      playerService.on("timeupdate", (_, data) => {
        const d = data as { current: number; duration: number }
        store.setProgress(d.current)
        store.setDuration(d.duration)
      }),
      playerService.on("play", () => store.setIsPlaying(true)),
      playerService.on("pause", () => store.setIsPlaying(false)),
      playerService.on("end", () => {
        store.setIsPlaying(false)
        store.next()
      }),
      playerService.on("error", () => {
        store.setIsPlaying(false)
        if (store.repeat === "one") {
          playerService.seek(0)
          playerService.play()
        }
      }),
    ]

    return () => unsubs.forEach((u) => u())
  }, [])

  useEffect(() => {
    playerService.volume = store.volume
  }, [store.volume])

  const play = useCallback(
    (song: Song) => {
      store.play(song)
      playerService.loadAndPlay(song)
    },
    [store],
  )

  const pause = useCallback(() => {
    store.pause()
    playerService.pause()
  }, [store])

  const resume = useCallback(() => {
    store.resume()
    playerService.play()
  }, [store])

  const next = useCallback(() => {
    const state = usePlayerStore.getState()
    state.next()
    const newSong = usePlayerStore.getState().currentSong
    if (newSong) {
      playerService.loadAndPlay(newSong)
    }
  }, [])

  const previous = useCallback(() => {
    const state = usePlayerStore.getState()
    if (state.progress > 3) {
      playerService.seek(0)
      store.setProgress(0)
      return
    }
    state.previous()
    const prevSong = usePlayerStore.getState().currentSong
    if (prevSong) {
      playerService.loadAndPlay(prevSong)
    }
  }, [store])

  const seek = useCallback(
    (time: number) => {
      playerService.seek(time)
      store.setProgress(time)
    },
    [store],
  )

  const playFromQueue = useCallback(
    (index: number) => {
      const state = usePlayerStore.getState()
      const song = state.queue[index]
      if (song) {
        store.play(song)
        playerService.loadAndPlay(song)
      }
    },
    [store],
  )

  return {
    ...store,
    play,
    pause,
    resume,
    next,
    previous,
    seek,
    playFromQueue,
  }
}
