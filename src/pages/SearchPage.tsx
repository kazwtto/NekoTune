import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { useSearch } from "../hooks/useSearch"
import SearchInput from "../components/search/SearchInput"
import SearchResultsView from "../components/search/SearchResults"
import SearchHistory from "../components/search/SearchHistory"

export default function SearchPage() {
  const { t } = useTranslation()
  const { query, setQuery, results, isLoading, suggestions, history, addToHistory, clearHistory } = useSearch()

  function handleSearch(q: string) {
    setQuery(q)
    if (q.trim()) addToHistory(q.trim())
  }

  function handleClear() {
    setQuery("")
  }

  function handleSuggestionClick(s: string) {
    handleSearch(s)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <SearchInput
        value={query}
        onChange={handleSearch}
        onClear={handleClear}
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
              className="cursor-pointer rounded-full px-3 py-1.5 text-xs transition-all duration-150"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <SearchResultsView results={results} isLoading={isLoading} query={query} />
    </motion.div>
  )
}
