import { useCallback, useEffect } from "react"
import { usePlayerStore } from "../stores/playerStore"
import { playerService } from "../services/player"
import { loadPlayerState, savePlayerState } from "../utils/playerPersist"
import type { Song } from "../types/music"

let restored = false

function restoreOnce() {
  if (restored) return
  restored = true

  const saved = loadPlayerState()
  if (!saved) return

  // Always restore queueHistory
  if (saved.queueHistory && saved.queueHistory.length > 0) {
    usePlayerStore.setState({ queueHistory: saved.queueHistory })
  }

  // Restore full player state if there was a song playing
  if (saved.currentSong) {
    usePlayerStore.setState({
      currentSong: saved.currentSong,
      queue: saved.queue,
      queueIndex: saved.queueIndex,
      queueHistory: saved.queueHistory || [],
      volume: saved.volume,
      shuffle: saved.shuffle,
      repeat: saved.repeat,
      progress: saved.progress,
      duration: saved.duration,
      isPlaying: false,
      isLoading: false,
    })
    playerService.volume = saved.volume
    playerService.loadAndPlay(saved.currentSong, false).then(() => {
      if (saved.progress > 0) {
        playerService.seek(saved.progress)
        usePlayerStore.setState({ progress: saved.progress })
      }
    })
  }
}

export function usePlayer() {
  useEffect(() => {
    restoreOnce()
  }, [])

  const play = useCallback((song: Song) => {
    const store = usePlayerStore.getState()
    store.play(song)
    playerService.loadAndPlay(song).catch((err) => {
      console.error("Play failed:", err)
      usePlayerStore.setState({ isLoading: false, isPlaying: false })
      savePlayerState(usePlayerStore.getState())
    })
  }, [])

  const pause = useCallback(() => {
    usePlayerStore.getState().pause()
    playerService.pause()
  }, [])

  const resume = useCallback(() => {
    usePlayerStore.getState().resume()
    playerService.play()
  }, [])

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
      usePlayerStore.setState({ progress: 0 })
      return
    }
    state.previous()
    const prevSong = usePlayerStore.getState().currentSong
    if (prevSong) {
      playerService.loadAndPlay(prevSong)
    }
  }, [])

  const seek = useCallback((time: number) => {
    playerService.seek(time)
    usePlayerStore.setState({ progress: time })
    savePlayerState(usePlayerStore.getState())
  }, [])

  const playFromQueue = useCallback((index: number) => {
    const store = usePlayerStore.getState()
    const song = store.queue[index]
    if (song) {
      store.playFromQueue(index)
      playerService.loadAndPlay(song)
    }
  }, [])

  const addToQueue = useCallback((song: Song) => {
    usePlayerStore.getState().addToQueue(song)
  }, [])

  const toggleShuffle = useCallback(() => {
    usePlayerStore.getState().toggleShuffle()
  }, [])

  const toggleRepeat = useCallback(() => {
    usePlayerStore.getState().toggleRepeat()
  }, [])

  const setVolume = useCallback((vol: number) => {
    usePlayerStore.getState().setVolume(vol)
  }, [])

  const clearQueue = useCallback(() => {
    usePlayerStore.getState().clearQueue()
    playerService.stop()
  }, [])

  const clearHistory = useCallback(() => {
    usePlayerStore.getState().clearHistory()
  }, [])

  const currentSong = usePlayerStore((s) => s.currentSong)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const isLoading = usePlayerStore((s) => s.isLoading)
  const volume = usePlayerStore((s) => s.volume)
  const shuffle = usePlayerStore((s) => s.shuffle)
  const repeat = usePlayerStore((s) => s.repeat)
  const queue = usePlayerStore((s) => s.queue)
  const queueIndex = usePlayerStore((s) => s.queueIndex)
  const queueHistory = usePlayerStore((s) => s.queueHistory)
  const progress = usePlayerStore((s) => s.progress)
  const duration = usePlayerStore((s) => s.duration)

  useEffect(() => {
    playerService.volume = volume
  }, [volume])

  return {
    currentSong,
    queue,
    queueIndex,
    queueHistory,
    isPlaying,
    isLoading,
    volume,
    progress,
    duration,
    shuffle,
    repeat,
    play,
    pause,
    resume,
    next,
    previous,
    seek,
    playFromQueue,
    addToQueue,
    toggleShuffle,
    toggleRepeat,
    setVolume,
    clearQueue,
    clearHistory,
  }
}
