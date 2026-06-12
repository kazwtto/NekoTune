import type { Song } from "../types/music"
import type { RepeatMode } from "../types/player"
import { getItem, setItem } from "../utils/storage"

const STORAGE_KEY = "nekotune-player-state"

interface PersistedPlayerState {
  currentSong: Song | null
  queue: Song[]
  queueIndex: number
  queueHistory: Song[]
  volume: number
  shuffle: boolean
  repeat: RepeatMode
  progress: number
  duration: number
}

function stripFileData(songs: Song[]): Song[] {
  return songs.map(s => {
    const { fileData, ...rest } = s
    return rest
  })
}

export function savePlayerState(state: Partial<PersistedPlayerState>): void {
  const current = getItem<PersistedPlayerState>(STORAGE_KEY, {
    currentSong: null,
    queue: [],
    queueIndex: -1,
    queueHistory: [],
    volume: 0.8,
    shuffle: false,
    repeat: "off",
    progress: 0,
    duration: 0,
  })
  const toSave = { ...current, ...state }
  if (toSave.currentSong) {
    const { fileData, ...rest } = toSave.currentSong
    toSave.currentSong = rest
  }
  if (toSave.queue) toSave.queue = stripFileData(toSave.queue)
  if (toSave.queueHistory) toSave.queueHistory = stripFileData(toSave.queueHistory)
  setItem(STORAGE_KEY, toSave)
}

export function loadPlayerState(): PersistedPlayerState | null {
  const state = getItem<PersistedPlayerState | null>(STORAGE_KEY, null)
  if (!state) return null
  return state
}

export function clearPlayerState(): void {
  setItem(STORAGE_KEY, null)
}
