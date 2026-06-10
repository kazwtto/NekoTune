import { Howl } from "howler"
import type { Song } from "../types/music"

type PlayerEvent = string
type PlayerListener = (event: PlayerEvent, data?: unknown) => void

class PlayerService {
  private howl: Howl | null = null
  private _currentSong: Song | null = null
  private listeners: Map<string, PlayerListener[]> = new Map()
  private progressInterval: ReturnType<typeof setInterval> | null = null
  private _volume: number = 0.8

  get currentSong(): Song | null {
    return this._currentSong
  }

  get volume(): number {
    return this._volume
  }

  set volume(val: number) {
    this._volume = Math.max(0, Math.min(1, val))
    if (this.howl) {
      this.howl.volume(this._volume)
    }
  }

  on(event: PlayerEvent, listener: PlayerListener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(listener)
    return () => {
      const arr = this.listeners.get(event)
      if (arr) {
        const idx = arr.indexOf(listener)
        if (idx >= 0) arr.splice(idx, 1)
      }
    }
  }

  private emit(event: PlayerEvent, data?: unknown) {
    const listeners = this.listeners.get(event)
    if (listeners) {
      listeners.forEach((l) => l(event, data))
    }
  }

  async loadAndPlay(song: Song): Promise<void> {
    this._currentSong = song
    if (song.isLocal && song.filePath) {
      await this.playLocal(song)
    } else {
      await this.playYoutube(song)
    }
  }

  private async playYoutube(song: Song): Promise<void> {
    if (!song.videoId) return
    this.stop()

    const { getStreamUrl: fetchStream } = await import("./innertube")
    const url = await fetchStream(song.videoId)
    if (!url) {
      this.emit("error", "Failed to get stream URL")
      return
    }

    this.howl = new Howl({
      src: [url],
      format: ["mp3", "aac", "webm"],
      volume: this._volume,
      html5: true,
      onload: () => {
        this.emit("load")
        this.howl?.play()
        this.emit("play")
        this.startProgressInterval()
      },
      onplay: () => {
        this.emit("play")
        this.startProgressInterval()
      },
      onpause: () => {
        this.emit("pause")
        this.stopProgressInterval()
      },
      onstop: () => {
        this.emit("stop")
        this.stopProgressInterval()
      },
      onend: () => {
        this.emit("end")
        this.stopProgressInterval()
      },
      onloaderror: () => {
        this.emit("error", "Failed to load audio")
      },
    })
  }

  private async playLocal(song: Song): Promise<void> {
    if (!song.filePath) return
    this.stop()

    this.howl = new Howl({
      src: [`nekotune://${song.filePath}`],
      volume: this._volume,
      html5: true,
      onload: () => {
        this.emit("load")
        this.howl?.play()
        this.emit("play")
        this.startProgressInterval()
      },
      onplay: () => {
        this.emit("play")
        this.startProgressInterval()
      },
      onpause: () => {
        this.emit("pause")
        this.stopProgressInterval()
      },
      onstop: () => {
        this.emit("stop")
        this.stopProgressInterval()
      },
      onend: () => {
        this.emit("end")
        this.stopProgressInterval()
      },
      onloaderror: () => {
        this.emit("error", "Failed to load local file")
      },
    })
  }

  play(): void {
    if (this.howl && !this.howl.playing()) {
      this.howl.play()
      this.emit("play")
      this.startProgressInterval()
    }
  }

  pause(): void {
    if (this.howl?.playing()) {
      this.howl.pause()
      this.emit("pause")
      this.stopProgressInterval()
    }
  }

  togglePlay(): void {
    if (this.howl?.playing()) {
      this.pause()
    } else {
      this.play()
    }
  }

  stop(): void {
    this.stopProgressInterval()
    if (this.howl) {
      this.howl.stop()
      this.howl.unload()
      this.howl = null
    }
    this._currentSong = null
    this.emit("stop")
  }

  seek(time: number): void {
    if (this.howl) {
      this.howl.seek(time)
    }
  }

  getCurrentTime(): number {
    return this.howl ? (this.howl.seek() as number) : 0
  }

  getDuration(): number {
    return this.howl ? this.howl.duration() : 0
  }

  isPlaying(): boolean {
    return this.howl ? this.howl.playing() : false
  }

  private startProgressInterval(): void {
    this.stopProgressInterval()
    this.progressInterval = setInterval(() => {
      if (this.howl?.playing()) {
        this.emit("timeupdate", {
          current: this.howl.seek(),
          duration: this.howl.duration(),
        })
      }
    }, 250)
  }

  private stopProgressInterval(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval)
      this.progressInterval = null
    }
  }

  destroy(): void {
    this.stop()
    this.listeners.clear()
  }
}

export const playerService = new PlayerService()
