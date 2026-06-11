import { useState, useCallback, useRef, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { searchMusic, getSearchSuggestions } from "../services/innertube"
import { getItem, setItem } from "../utils/storage"

const HISTORY_KEY = "nekotune-search-history"
const MAX_HISTORY = 10

function readHistory(): string[] {
  return getItem<string[]>(HISTORY_KEY, [])
}

export function useSearch(persistedQuery?: [string, (v: string) => void]) {
  const [externalQuery, setExternalQuery] = persistedQuery ?? ["", () => {}]
  const [query, setQueryState] = useState(externalQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(externalQuery)
  const [history, setHistory] = useState<string[]>(readHistory)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const setQuery = useCallback((q: string) => {
    setQueryState(q)
    setExternalQuery(q)
  }, [setExternalQuery])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  const searchQuery = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => searchMusic(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 60_000,
  })

  const suggestionsQuery = useQuery({
    queryKey: ["suggestions", query],
    queryFn: () => getSearchSuggestions(query),
    enabled: query.length >= 2 && query === debouncedQuery,
    staleTime: 30_000,
  })

  const addToHistory = useCallback((q: string) => {
    setHistory((prev) => {
      const updated = [q, ...prev.filter((h) => h !== q)].slice(0, MAX_HISTORY)
      setItem(HISTORY_KEY, updated)
      return updated
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    setItem(HISTORY_KEY, [])
  }, [])

  return {
    query,
    setQuery,
    debouncedQuery,
    results: searchQuery.data,
    isLoading: searchQuery.isLoading,
    suggestions: suggestionsQuery.data || [],
    history,
    addToHistory,
    clearHistory,
  }
}
