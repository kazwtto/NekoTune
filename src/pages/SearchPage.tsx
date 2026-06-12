import { useSearchParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { searchMusic } from "../services/innertube"
import SearchResultsView from "../components/search/SearchResults"
import { useScrollPersistence } from "../hooks/useScrollPersistence"
import Tabs from "../components/ui/Tabs"
import { useState, useEffect } from "react"
import { Music, Album, User, ListMusic, Video, LayoutGrid } from "lucide-react"
import { useTranslation } from "react-i18next"

export default function SearchPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const query = searchParams.get("q") || ""
  const scrollRef = useScrollPersistence("search")
  const [activeTab, setActiveTab] = useState("all")

  const { data: results, isLoading } = useQuery({
    queryKey: ["search", query],
    queryFn: () => searchMusic(query),
    enabled: query.length >= 2,
    staleTime: 60_000,
  })

  const total = results
    ? results.songs.length + results.albums.length + results.artists.length + results.playlists.length + results.videos.length
    : 0

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })
  }, [activeTab])

  const tabs = [
    { id: "all", label: t("search.all"), count: total, icon: LayoutGrid },
    { id: "songs", label: t("search.songs"), count: results?.songs.length || 0, icon: Music },
    { id: "videos", label: t("search.videos"), count: results?.videos.length || 0, icon: Video },
    { id: "albums", label: t("search.albums"), count: results?.albums.length || 0, icon: Album },
    { id: "artists", label: t("search.artists"), count: results?.artists.length || 0, icon: User },
    { id: "playlists", label: t("search.playlists"), count: results?.playlists.length || 0, icon: ListMusic },
  ]

  return (
    <div className="flex h-full flex-col">
      {results && total > 0 && (
        <div className="flex-shrink-0 px-4">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>
      )}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <SearchResultsView results={results} isLoading={isLoading} query={query} activeTab={activeTab} onTabChange={setActiveTab} />
        </motion.div>
      </div>
    </div>
  )
}
