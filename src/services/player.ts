import { Howl } from "howler"
import type { Song } from "../types/music"
import { proxyUrl } from "./proxy"
import { usePlayerStore } from "../stores/playerStore"
import { useSettingsStore } from "../stores/settingsStore"

class PlayerService {
  private howl: Howl | null = null
  private _currentSong: Song | null = null
  private progressInterval: ReturnType<typeof setInterval> | null = null
  private _volume: number = 0.8
  private loadGeneration = 0

  private get store() {
    return usePlayerStore.getState()
  }

  private get settings() {
    return useSettingsStore.getState().settings
  }

  private patch(state: Partial<ReturnType<typeof usePlayerStore.getState>>) {
    usePlayerStore.setState(state)
  }

  get currentSong(): Song | null {
    return this._currentSong
  }

  get volume(): number {
    return this._volume
  }

  set volume(val: number) {
    this._volume = Math.max(0, Math.min(1, val))
    if (this.howl) this.howl.volume(this._volume)
  }

  async loadAndPlay(song: Song, autoPlay = true): Promise<void> {
    const gen = ++this.loadGeneration
    this.stop()
    this._currentSong = song
    this.patch({ isLoading: true, currentSong: song, progress: 0, duration: song.duration || 0, isPlaying: false })

    try {
      let audioSrc: string | undefined | null = null
      let durationFromYtdlp = 0

      if (song.isLocal) {
        if (song.fileData) {
          audioSrc = song.fileData
        } else if (song.filePath) {
          const { invoke } = await import("@tauri-apps/api/core")
          audioSrc = await invoke<string>("cmd_get_local_file_data", { path: song.filePath })
        }
      } else {
        if (!song.videoId) return
        const { getStreamUrl: fetchStream } = await import("./innertube")
        const streamData = await fetchStream(song.videoId)
        if (gen !== this.loadGeneration) return
        if (!streamData) {
          this.patch({ isLoading: false, isPlaying: false })
          if (this.settings.autoSkipOnError) this.store.next()
          return
        }
        audioSrc = proxyUrl(streamData.url)
        durationFromYtdlp = streamData.duration
      }

      if (gen !== this.loadGeneration) return
      if (!audioSrc) {
        this.patch({ isLoading: false, isPlaying: false })
        return
      }

      this.howl = new Howl({
        src: [audioSrc],
        format: ["mp3", "aac", "webm", "m4a"],
        volume: this._volume,
        html5: true,
        onload: () => {
          if (gen !== this.loadGeneration) return
          const howlDuration = this.howl?.duration() ?? 0
          const dur = howlDuration > 0 ? howlDuration : durationFromYtdlp
          this.patch({ isLoading: false, duration: dur > 0 ? dur : this.store.duration })
          if (autoPlay) this.howl?.play()
        },
        onplay: () => {
          if (gen !== this.loadGeneration) return
          this.patch({ isPlaying: true, isLoading: false })
          this.startProgressInterval()
        },
        onpause: () => {
          this.patch({ isPlaying: false })
          this.stopProgressInterval()
        },
        onstop: () => {
          this.patch({ isPlaying: false })
          this.stopProgressInterval()
        },
        onend: () => {
          this.patch({ isPlaying: false })
          this.stopProgressInterval()
          const state = this.store
          if (state.repeat === "one") {
            this.howl?.seek(0)
            this.howl?.play()
          } else {
            state.next()
            const nextSong = usePlayerStore.getState().currentSong
            if (nextSong && nextSong.videoId !== this._currentSong?.videoId) {
              this.loadAndPlay(nextSong)
            }
          }
        },
        onloaderror: (_id, err) => {
          console.error("Howler load error:", err)
          this.patch({ isLoading: false, isPlaying: false })
          if (this.settings.autoSkipOnError) {
            this.store.next()
            const nextSong = usePlayerStore.getState().currentSong
            if (nextSong && nextSong.videoId !== this._currentSong?.videoId) {
              this.loadAndPlay(nextSong)
            }
          }
        },
        onplayerror: (_id, err) => {
          console.error("Howler play error:", err)
          this.patch({ isPlaying: false, isLoading: false })
        },
      })
    } catch (err) {
      if (gen !== this.loadGeneration) return
      console.error("loadAndPlay failed:", err)
      this.patch({ isLoading: false, isPlaying: false })
    }
  }

  play(): void {
    if (this.howl && !this.howl.playing()) {
      this.howl.play()
    }
  }

  pause(): void {
    if (this.howl) {
      this.howl.pause()
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
  }

  seek(time: number): void {
    if (this.howl) {
      this.howl.seek(time)
    }
  }

  getCurrentTime(): number {
    if (!this.howl) return 0
    const t = this.howl.seek()
    return typeof t === "number" ? t : 0
  }

  getDuration(): number {
    if (!this.howl) return 0
    const d = this.howl.duration()
    return d > 0 ? d : 0
  }

  isPlaying(): boolean {
    return this.howl ? this.howl.playing() : false
  }

  private startProgressInterval(): void {
    this.stopProgressInterval()
    this.progressInterval = setInterval(() => {
      if (!this.howl) return
      const seekVal = this.howl.seek()
      const dur = this.howl.duration()
      const current = typeof seekVal === "number" ? seekVal : 0
      const duration = dur > 0 ? dur : this.store.duration
      usePlayerStore.setState({ progress: current, duration })
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
  }
}

export const playerService = new PlayerService()
