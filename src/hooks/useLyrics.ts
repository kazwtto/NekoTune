import { useState, useEffect, useRef } from "react"
import { fetchLrcLibLyrics } from "../services/lyrics"
import type { LyricLine } from "../services/lyrics"
import { usePlayerStore } from "../stores/playerStore"

export function useLyrics() {
  const [lyrics, setLyrics] = useState<LyricLine[]>([])
  const [currentLineIndex, setCurrentLineIndex] = useState(-1)
  const [loading, setLoading] = useState(false)
  const currentSongRef = useRef<string | null>(null)
  const progress = usePlayerStore((s) => s.progress)

  const currentSong = usePlayerStore((s) => s.currentSong)

  useEffect(() => {
    if (!currentSong) {
      setLyrics([])
      setCurrentLineIndex(-1)
      currentSongRef.current = null
      return
    }

    if (currentSong.videoId === currentSongRef.current) return
    currentSongRef.current = currentSong.videoId

    setLoading(true)
    fetchLrcLibLyrics(currentSong.title, currentSong.artist, currentSong.duration)
      .then((result) => {
        setLyrics(result || [])
        setLoading(false)
      })
      .catch(() => {
        setLyrics([])
        setLoading(false)
      })
  }, [currentSong?.videoId])

  useEffect(() => {
    if (lyrics.length === 0) return
    let found = -1
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (progress >= lyrics[i].start) {
        found = i
        break
      }
    }
    setCurrentLineIndex(found)
  }, [progress, lyrics])

  return { lyrics, currentLineIndex, loading }
}
