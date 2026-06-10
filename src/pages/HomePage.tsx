import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { useHomeFeed } from "../hooks/useInnertube"
import SongCard from "../components/media/SongCard"
import AlbumCard from "../components/media/AlbumCard"
import ArtistCard from "../components/media/ArtistCard"
import PlaylistCard from "../components/media/PlaylistCard"
import Shimmer from "../components/ui/Shimmer"
import { RefreshCw, Music } from "lucide-react"
import type { Song, Album, Artist, Playlist } from "../types/music"

function HomeItemCard({ item }: { item: Song | Album | Artist | Playlist }) {
  if ("videoId" in item) {
    return <SongCard song={item as Song} />
  }
  if ("browseId" in item && "songs" in item && "coverUrl" in item) {
    return <AlbumCard album={item as Album} />
  }
  if ("browseId" in item && "imageUrl" in item && !("songs" in item)) {
    return <ArtistCard artist={item as Artist} />
  }
  if ("browseId" in item) {
    return <PlaylistCard playlist={item as Playlist} />
  }
  return null
}

export default function HomePage() {
  const { t } = useTranslation()
  const { data: sections, isLoading, error, refetch, isRefetching } = useHomeFeed()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{t("home.quickPicks")}</h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {t("home.madeForYou")}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="cursor-pointer rounded-lg p-2 transition-all duration-150 hover:bg-white/5"
          style={{ background: "none", border: "none", color: "var(--text-muted)" }}
          title="Refresh"
        >
          <RefreshCw size={16} className={isRefetching ? "animate-spin" : ""} />
        </button>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          <Shimmer height={100} rounded="8px" count={4} />
        </div>
      )}

      {error && (
        <div className="mt-8 flex flex-col items-center gap-2">
          <p className="text-sm" style={{ color: "var(--error)" }}>
            Failed to load home feed
          </p>
          <button
            onClick={() => refetch()}
            className="cursor-pointer rounded-lg px-4 py-2 text-sm transition-all duration-150 hover:opacity-90"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            Retry
          </button>
        </div>
      )}

      {sections && sections.length > 0 ? (
        sections.map((section, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="mb-2.5 text-sm font-semibold">{section.title}</h3>
            <div className="flex flex-col gap-1.5">
              {section.items.slice(0, 6).map((item, i) => (
                <HomeItemCard key={item.id || i} item={item} />
              ))}
            </div>
          </div>
        ))
      ) : !isLoading ? (
        <div className="mt-12 flex flex-col items-center gap-2">
          <Music size={28} style={{ color: "var(--text-muted)" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            No results. Make sure YouTube Music is available in your region.
          </p>
        </div>
      ) : null}
    </motion.div>
  )
}
