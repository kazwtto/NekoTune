import { create } from "zustand"
import type { Song } from "../types/music"
import type { PlayerState, PlayerActions, RepeatMode, HistoryEntry } from "../types/player"
import { savePlayerState } from "../utils/playerPersist"

type PlayerStore = PlayerState & PlayerActions

function persist(get: () => PlayerStore) {
  const s = get()
  savePlayerState({
    currentSong: s.currentSong,
    queue: s.queue,
    queueIndex: s.queueIndex,
    queueHistory: s.queueHistory,
    volume: s.volume,
    shuffle: s.shuffle,
    repeat: s.repeat,
    progress: s.progress,
    duration: s.duration,
  })
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentSong: null,
  queue: [],
  queueIndex: -1,
  queueHistory: [],
  isPlaying: false,
  isLoading: false,
  volume: 0.8,
  progress: 0,
  duration: 0,
  shuffle: false,
  repeat: "off",
  crossfade: 3,
  pitch: 1,
  tempo: 1,
  equalizer: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

  play: (song: Song) => {
    const state = get()
    const existingIndex = state.queue.findIndex((s) => s.videoId === song.videoId)
    const newHistory = state.currentSong
      ? [...state.queueHistory, { song: state.currentSong, playedAt: Date.now() }].slice(-50)
      : state.queueHistory
    if (existingIndex >= 0) {
      set({ currentSong: song, queueIndex: existingIndex, isPlaying: true, isLoading: true, progress: 0, duration: song.duration || 0, queueHistory: newHistory })
    } else {
      set({
        currentSong: song,
        queue: [...state.queue, song],
        queueIndex: state.queue.length,
        isPlaying: true,
        isLoading: true,
        progress: 0,
        duration: song.duration || 0,
        queueHistory: newHistory,
      })
    }
    persist(get)
  },

  pause: () => {
    set({ isPlaying: false })
    persist(get)
  },
  resume: () => {
    set({ isPlaying: true })
    persist(get)
  },

  next: () => {
    const state = get()
    if (state.queue.length === 0) return
    if (state.repeat === "one") {
      set({ progress: 0 })
      return
    }
    let nextIndex: number
    if (state.shuffle) {
      nextIndex = Math.floor(Math.random() * state.queue.length)
    } else {
      nextIndex = state.queueIndex + 1
      if (nextIndex >= state.queue.length) {
        if (state.repeat === "all") {
          nextIndex = 0
        } else {
          return
        }
      }
    }
    const nextSong = state.queue[nextIndex]
    set({
      queueIndex: nextIndex,
      currentSong: nextSong,
      isPlaying: true,
      isLoading: true,
      progress: 0,
      duration: nextSong?.duration || 0,
      queueHistory: [...state.queueHistory, { song: state.currentSong!, playedAt: Date.now() }].slice(-50),
    })
    persist(get)
  },

  previous: () => {
    const state = get()
    if (state.progress > 3) {
      set({ progress: 0 })
      return
    }
    if (state.queueHistory.length > 0) {
      const history = [...state.queueHistory]
      const prevEntry = history.pop()!
      set({
        queueHistory: history,
        queueIndex: Math.max(0, state.queueIndex - 1),
        currentSong: prevSong,
        isPlaying: true,
        isLoading: true,
        progress: 0,
        duration: prevSong?.duration || 0,
      })
      persist(get)
    }
  },

  seek: (time: number) => set({ progress: time }),
  setVolume: (vol: number) => {
    set({ volume: Math.max(0, Math.min(1, vol)) })
    persist(get)
  },

  toggleShuffle: () => {
    set((s) => ({ shuffle: !s.shuffle }))
    persist(get)
  },

  toggleRepeat: () => {
    const order: RepeatMode[] = ["off", "all", "one"]
    const state = get()
    const currentIndex = order.indexOf(state.repeat)
    const nextMode = order[(currentIndex + 1) % order.length]
    set({ repeat: nextMode })
    persist(get)
  },

  playFromQueue: (index: number) => {
    const state = get()
    const song = state.queue[index]
    if (song) {
      set({
        currentSong: song,
        queueIndex: index,
        isPlaying: true,
        isLoading: true,
        progress: 0,
        duration: song.duration || 0,
      })
      persist(get)
    }
  },

  addToQueue: (song: Song) => {
    const state = get()
    set({ queue: [...state.queue, song] })
    persist(get)
  },

  removeFromQueue: (index: number) => {
    const state = get()
    const newQueue = state.queue.filter((_, i) => i !== index)
    let newIndex = state.queueIndex
    if (index < state.queueIndex) newIndex--
    else if (index === state.queueIndex) newIndex = Math.min(newIndex, newQueue.length - 1)
    set({
      queue: newQueue,
      queueIndex: newIndex,
      currentSong: newQueue[newIndex] || null,
      isPlaying: newQueue.length > 0 ? state.isPlaying : false,
    })
    persist(get)
  },

  reorderQueue: (from: number, to: number) => {
    const state = get()
    const newQueue = [...state.queue]
    const [moved] = newQueue.splice(from, 1)
    newQueue.splice(to, 0, moved)
    let newIndex = state.queueIndex
    if (from === state.queueIndex) {
      newIndex = to
    } else {
      if (from < state.queueIndex && to >= state.queueIndex) newIndex--
      else if (from > state.queueIndex && to <= state.queueIndex) newIndex++
    }
    set({ queue: newQueue, queueIndex: newIndex })
    persist(get)
  },

  clearQueue: () => {
    set({
      queue: [],
      queueIndex: -1,
      currentSong: null,
      isPlaying: false,
      isLoading: false,
      progress: 0,
      duration: 0,
    })
    persist(get)
  },

  clearHistory: () => {
    set({ queueHistory: [] })
    persist(get)
  },

  setProgress: (progress: number) => set({ progress }),
  setDuration: (duration: number) => set({ duration }),
  setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
}))
