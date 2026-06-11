import { useCallback } from "react"
import { usePlayerStore } from "../stores/playerStore"
import { playerService } from "../services/player"
import type { Song } from "../types/music"

export function useQueue() {
  const store = usePlayerStore()

  const playNow = useCallback(
    (song: Song) => {
      store.play(song)
      playerService.loadAndPlay(song)
    },
    [store],
  )

  const playNext = useCallback(
    (song: Song) => {
      const state = usePlayerStore.getState()
      const newQueue = [...state.queue]
      newQueue.splice(state.queueIndex + 1, 0, song)
      usePlayerStore.setState({ queue: newQueue })
    },
    [],
  )

  const playLater = useCallback(
    (song: Song) => {
      store.addToQueue(song)
    },
    [store],
  )

  const remove = useCallback(
    (index: number) => {
      store.removeFromQueue(index)
    },
    [store],
  )

  const move = useCallback(
    (from: number, to: number) => {
      store.reorderQueue(from, to)
    },
    [store],
  )

  return {
    queue: store.queue,
    queueIndex: store.queueIndex,
    currentSong: store.currentSong,
    playNow,
    playNext,
    playLater,
    remove,
    move,
    clearQueue: store.clearQueue,
  }
}
