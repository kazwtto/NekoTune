import { useSearchParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { searchMusic } from "../services/innertube"
import SearchResultsView from "../components/search/SearchResults"
import { useScrollPersistence } from "../hooks/useScrollPersistence"

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get("q") || ""
  const scrollRef = useScrollPersistence("search")

  const { data: results, isLoading } = useQuery({
    queryKey: ["search", query],
    queryFn: () => searchMusic(query),
    enabled: query.length >= 2,
    staleTime: 60_000,
  })

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        <SearchResultsView results={results} isLoading={isLoading} query={query} />
      </motion.div>
    </div>
  )
}
