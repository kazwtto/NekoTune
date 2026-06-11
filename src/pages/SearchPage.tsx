import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { useSearch } from "../hooks/useSearch"
import SearchInput from "../components/search/SearchInput"
import SearchResultsView from "../components/search/SearchResults"
import SearchHistory from "../components/search/SearchHistory"
import { usePersistedState } from "../hooks/usePersistedState"
import { useScrollPersistence } from "../hooks/useScrollPersistence"

export default function SearchPage() {
  const { t } = useTranslation()
  const persistedQuery = usePersistedState<string>("nekotune-search-query", "")
  const { query, setQuery, results, isLoading, suggestions, history, addToHistory, clearHistory } = useSearch(persistedQuery)
  const scrollRef = useScrollPersistence("search")

  function handleSubmit() {
    const trimmed = query.trim()
    if (trimmed) addToHistory(trimmed)
  }

  function handleSearch(q: string) {
    setQuery(q)
  }

  function handleClear() {
    setQuery("")
  }

  function handleSuggestionClick(s: string) {
    setQuery(s)
    addToHistory(s)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-10 bg-bg-backdrop pb-2 pt-1">
        <SearchInput
          value={query}
          onChange={handleSearch}
          onClear={handleClear}
          onEnter={handleSubmit}
          placeholder={t("search.placeholder")}
        />

        {!query && (
          <SearchHistory history={history} onSelect={handleSuggestionClick} onClear={clearHistory} />
        )}

        {query && suggestions.length > 0 && !results && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {suggestions.slice(0, 5).map((s) => (
              <button
                key={s}
                onClick={() => handleSuggestionClick(s)}
                className="cursor-pointer rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-secondary transition-all duration-150 hover:bg-bg-hover"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <SearchResultsView results={results} isLoading={isLoading} query={query} />
        </motion.div>
      </div>
    </div>
  )
}
