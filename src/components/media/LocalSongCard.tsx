import { useState } from "react"
import { useTranslation } from "react-i18next"
import { usePlayer } from "../../hooks/usePlayer"
import { Play, Music } from "lucide-react"
import type { LocalSong } from "../../types/music"
import { formatTime } from "../../utils/format"

interface LocalSongCardProps {
  song: LocalSong
  index?: number
}

function localSongToSong(local: LocalSong) {
  return {
    id: local.id,
    videoId: local.id,
    title: local.title,
    artist: local.artist,
    album: local.album,
    albumArtUrl: local.coverData,
    duration: local.duration,
    isLocal: true,
    filePath: local.filePath,
    fileData: local.fileData,
  }
}

export default function LocalSongCard({ song, index }: LocalSongCardProps) {
  const { t } = useTranslation()
  const { play } = usePlayer()
  const [coverFailed, setCoverFailed] = useState(false)
  const showCover = song.coverData && !coverFailed

  function handlePlay() {
    play(localSongToSong(song))
  }

  return (
    <div
      className="group flex cursor-pointer items-center gap-3 rounded-lg bg-surface px-3 py-2.5 transition-all duration-150 hover:bg-bg-hover"
      onClick={handlePlay}
    >
      {index !== undefined && (
        <span className="w-5 text-center text-xs text-muted">
          {index + 1}
        </span>
      )}
      {showCover ? (
        <img
          src={song.coverData}
          alt=""
          className="h-10 w-10 flex-shrink-0 rounded-lg object-cover"
          onError={() => setCoverFailed(true)}
        />
      ) : (
        <div className="thumb-placeholder h-10 w-10" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-primary">{song.title}</p>
        <p className="truncate text-xs text-secondary">
          {song.artist}
          {song.album && <span> · {song.album}</span>}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {song.duration > 0 && (
          <span className="text-xs tabular-nums text-muted">
            {formatTime(song.duration)}
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            handlePlay()
          }}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-accent opacity-0 shadow-md transition-all duration-150 group-hover:opacity-100"
        >
          <Play size={12} fill="currentColor" className="ml-0.5 text-white" />
        </button>
      </div>
    </div>
  )
}