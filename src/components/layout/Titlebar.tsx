import { useState, useEffect, useRef } from "react"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { useNavigate } from "react-router-dom"
import { Cat, Minus, Square, X, Maximize2, Settings } from "lucide-react"
import { APP_NAME } from "../../utils/constants"
import SearchInput from "../search/SearchInput"
import SearchHistory from "../search/SearchHistory"
import { useSearch } from "../../hooks/useSearch"

const appWindow = getCurrentWindow()

export default function Titlebar() {
  const [isMaximized, setIsMaximized] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const navigate = useNavigate()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { query, setQuery, suggestions, history, addToHistory, clearHistory } = useSearch()
  useEffect(() => {
    appWindow.isMaximized().then(setIsMaximized)
    const unlisten = appWindow.listen("tauri://resize", () => {
      appWindow.isMaximized().then(setIsMaximized)
    })
    return () => { unlisten.then((fn) => fn()) }
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSearchFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleSubmit() {
    const q = query.trim()
    if (q) {
      addToHistory(q)
      navigate(`/search?q=${encodeURIComponent(q)}`)
      setSearchFocused(false)
    }
  }

  function handleSelect(s: string) {
    addToHistory(s)
    setQuery(s)
    navigate(`/search?q=${encodeURIComponent(s)}`)
    setSearchFocused(false)
  }

  const showDropdown = searchFocused && (query.length > 0 || history.length > 0)

  return (
    <div className="relative flex h-8 items-center justify-between bg-bg-base">
      <div className="flex flex-1 items-center gap-2 px-3" data-tauri-drag-region>
        <div className="flex h-5 w-5 items-center justify-center rounded bg-accent-muted">
          <Cat size={12} className="text-accent" />
        </div>
        <span className="text-xs font-semibold tracking-wide text-secondary">
          {APP_NAME}
        </span>
      </div>

      <div className="relative flex-1 max-w-md px-3" ref={dropdownRef}>
        <SearchInput
          value={query}
          onChange={setQuery}
          onClear={() => setQuery("")}
          onEnter={handleSubmit}
          onFocus={() => setSearchFocused(true)}
        />

        {showDropdown && (
          <div className="absolute left-0 right-0 z-50 mt-1 rounded-lg border border-border bg-surface shadow-xl">
            {query.length === 0 && (
              <SearchHistory history={history} onSelect={handleSelect} onClear={clearHistory} />
            )}

            {query.length >= 2 && suggestions.length > 0 && (
              <div className="max-h-56 overflow-y-auto px-1.5 pb-1.5">
                <div className="flex flex-col gap-0.5">
                  {suggestions.slice(0, 8).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSelect(s)}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs text-secondary transition-colors duration-100 hover:bg-bg-hover"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex h-full items-center">
        <button
          onClick={() => navigate("/settings")}
          className="flex h-full w-9 cursor-pointer items-center justify-center text-secondary transition-colors duration-100 hover:bg-white/10 hover:text-primary"
          title="Settings"
        >
          <Settings size={14} />
        </button>
        <button
          onClick={() => appWindow.minimize()}
          className="flex h-full w-11 cursor-pointer items-center justify-center text-secondary transition-colors duration-100 hover:bg-white/10 hover:text-primary"
        >
          <Minus size={14} />
        </button>
        <button
          onClick={() => appWindow.toggleMaximize()}
          className="flex h-full w-11 cursor-pointer items-center justify-center text-secondary transition-colors duration-100 hover:bg-white/10 hover:text-primary"
        >
          {isMaximized ? <Square size={11} /> : <Maximize2 size={13} />}
        </button>
        <button
          onClick={() => appWindow.close()}
          className="flex h-full w-11 cursor-pointer items-center justify-center text-secondary transition-colors duration-100 hover:bg-red-600 hover:text-white"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
