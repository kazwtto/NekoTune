import type { Song } from "./music"

export type RepeatMode = "off" | "all" | "one"

export interface PlayerState {
  currentSong: Song | null
  queue: Song[]
  queueIndex: number
  queueHistory: Song[]
  isPlaying: boolean
  volume: number
  progress: number
  duration: number
  shuffle: boolean
  repeat: RepeatMode
  crossfade: number
  pitch: number
  tempo: number
  equalizer: number[]
}

export interface PlayerActions {
  play: (song: Song) => void
  pause: () => void
  resume: () => void
  next: () => void
  previous: () => void
  seek: (time: number) => void
  setVolume: (vol: number) => void
  toggleShuffle: () => void
  toggleRepeat: () => void
  addToQueue: (song: Song) => void
  removeFromQueue: (index: number) => void
  reorderQueue: (from: number, to: number) => void
  clearQueue: () => void
  setProgress: (progress: number) => void
  setDuration: (duration: number) => void
  setIsPlaying: (isPlaying: boolean) => void
}
