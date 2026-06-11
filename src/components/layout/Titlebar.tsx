import { useState, useEffect, useRef } from "react"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { useNavigate } from "react-router-dom"
import { Cat, Minus, Square, X, Maximize2, Settings, Search } from "lucide-react"
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
    <div className="relative flex h-14 items-center justify-between bg-bg-base/80 backdrop-blur-md border-b border-white/[0.04] z-50 transition-colors duration-300">
      <div className="flex flex-1 items-center gap-3 px-5 h-full" data-tauri-drag-region>
        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-muted shadow-lg shadow-accent/20 pointer-events-none">
          <Cat size={14} className="text-white drop-shadow-md" />
        </div>
        <span className="text-sm font-bold tracking-wider text-primary pointer-events-none drop-shadow-sm">
          {APP_NAME}
        </span>
      </div>

      <div className="relative flex-1 max-w-[28rem] px-4" ref={dropdownRef}>
        <div data-tauri-drag-region className="absolute inset-0 z-0" />
        <div className="relative z-10">
          <SearchInput
            value={query}
            onChange={setQuery}
            onClear={() => setQuery("")}
            onEnter={handleSubmit}
            onFocus={() => setSearchFocused(true)}
          />

          {showDropdown && (
            <div className="absolute left-4 right-4 z-50 mt-2 overflow-hidden rounded-xl border border-white/[0.08] bg-bg-elevated/95 backdrop-blur-xl shadow-2xl transition-all animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none absolute inset-0" />
              <div className="relative z-10 p-1">
                {query.length === 0 && (
                  <SearchHistory history={history} onSelect={handleSelect} onClear={clearHistory} />
                )}

                {query.length >= 2 && suggestions.length > 0 && (
                  <div className="max-h-64 overflow-y-auto p-1.5 scrollbar-thin">
                    <div className="flex flex-col gap-0.5">
                      {suggestions.slice(0, 8).map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSelect(s)}
                          className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-secondary transition-all duration-200 hover:bg-white/[0.06] hover:text-primary hover:shadow-sm"
                        >
                          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.04]">
                            <Search size={12} className="text-muted" />
                          </div>
                          <span className="truncate">{s}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex h-full items-center pl-4">
        <button
          onClick={() => navigate("/settings")}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-secondary transition-all duration-200 hover:bg-white/[0.08] hover:text-primary mr-2"
          title="Settings"
        >
          <Settings size={15} />
        </button>
        <div className="flex h-full">
          <button
            onClick={() => appWindow.minimize()}
            className="flex h-full w-12 cursor-pointer items-center justify-center text-muted transition-colors duration-200 hover:bg-white/[0.08] hover:text-primary"
          >
            <Minus size={15} />
          </button>
          <button
            onClick={() => appWindow.toggleMaximize()}
            className="flex h-full w-12 cursor-pointer items-center justify-center text-muted transition-colors duration-200 hover:bg-white/[0.08] hover:text-primary"
          >
            {isMaximized ? <Square size={13} /> : <Maximize2 size={14} />}
          </button>
          <button
            onClick={() => appWindow.close()}
            className="flex h-full w-12 cursor-pointer items-center justify-center text-muted transition-colors duration-200 hover:bg-red-500/90 hover:text-white group"
          >
            <X size={16} className="transition-transform group-hover:scale-110" />
          </button>
        </div>
      </div>
    </div>
  )
}
