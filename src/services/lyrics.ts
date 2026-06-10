interface LrcLine {
  time: number
  text: string
}

interface LyricWord {
  start: number
  end: number
  text: string
}

interface LyricLine {
  start: number
  end: number
  text: string
  words?: LyricWord[]
}

export async function fetchLrcLibLyrics(title: string, artist: string, _duration: number): Promise<LyricLine[] | null> {
  try {
    const searchUrl = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(title)}`
    const res = await fetch(searchUrl)
    if (!res.ok) return null
    const data = await res.json()

    if (data.syncedLyrics) {
      return parseLrc(data.syncedLyrics)
    }
    if (data.plainLyrics) {
      return data.plainLyrics.split("\n").map((line: string, i: number) => ({
        start: i * 5,
        end: (i + 1) * 5,
        text: line,
      }))
    }
    return null
  } catch {
    return null
  }
}

export async function fetchLrcLibByIsrc(isrc: string): Promise<LyricLine[] | null> {
  try {
    const res = await fetch(`https://lrclib.net/api/get?isrc=${encodeURIComponent(isrc)}`)
    if (!res.ok) return null
    const data = await res.json()
    if (data.syncedLyrics) return parseLrc(data.syncedLyrics)
    return null
  } catch {
    return null
  }
}

function parseLrc(lrc: string): LyricLine[] {
  const lines: LyricLine[] = []
  const lineRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/

  for (const rawLine of lrc.split("\n")) {
    const match = rawLine.match(lineRegex)
    if (!match) continue

    const mins = parseInt(match[1])
    const secs = parseInt(match[2])
    const millis = parseInt(match[3].padEnd(3, "0"))
    const start = mins * 60 + secs + millis / 1000
    const textPart = match[4].trim()

    if (!textPart) continue

    const words: LyricWord[] = []
    let cleanedText = textPart

    const wordMatches = textPart.match(/<(\d{2}:\d{2}\.\d{2,3})>([^<]*)<\/(?:\d{2}:\d{2}\.\d{2,3})>/g)
    if (wordMatches) {
      for (const wm of wordMatches) {
        const wMatch = wm.match(/<(\d{2}:\d{2}\.\d{2,3})>([^<]*)<\/(?:\d{2}:\d{2}\.\d{2,3})>/)
        if (wMatch) {
          const [wMins, wSecs, wMillis] = [
            parseInt(wMatch[1].split(":")[0]),
            parseInt(wMatch[1].split(":")[1].split(".")[0]),
            parseInt((wMatch[1].split(".")[1] || "0").padEnd(3, "0")),
          ]
          const wStart = wMins * 60 + wSecs + wMillis / 1000
          words.push({ start: wStart, end: wStart + 0.3, text: wMatch[2] })
        }
      }
      cleanedText = textPart.replace(/<[^>]+>/g, "")
    }

    lines.push({
      start,
      end: start + 4,
      text: cleanedText,
      words: words.length > 0 ? words : undefined,
    })
  }

  return lines
}

export type { LyricLine, LyricWord, LrcLine }
