import { useState, useEffect, useRef } from "react"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { useNavigate } from "react-router-dom"
import { Cat, Minus, Square, X, Maximize2, Settings, Search } from "lucide-react"
import { APP_NAME } from "../../utils/constants"
import SearchInput from "../search/SearchInput"
import SearchHistory from "../search/SearchHistory"
import { useSearch } from "../../hooks/useSearch"
import { useUiStore } from "../../stores/uiStore"
import { motion, AnimatePresence } from "framer-motion"

const appWindow = getCurrentWindow()

export default function Titlebar() {
  const [isMaximized, setIsMaximized] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const navigate = useNavigate()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { query, setQuery, suggestions, history, addToHistory, clearHistory } = useSearch()
  const fullscreen = useUiStore((s) => s.nowPlayingVisible || s.settingsVisible)
  const settingsVisible = useUiStore((s) => s.settingsVisible)
  const setSettingsVisible = useUiStore((s) => s.setSettingsVisible)

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
    <div className={`relative flex items-center justify-between bg-bg-base/80 backdrop-blur-md border-b border-white/[0.04] z-50 transition-all duration-300 ${
      fullscreen ? "h-0 overflow-visible border-none bg-transparent" : "h-14"
    }`}>
      <div className={`flex items-center gap-3 px-5 h-full overflow-hidden transition-all duration-300 ${
        fullscreen ? "w-0 opacity-0 px-0 gap-0 pointer-events-none" : "flex-1"
      }`} data-tauri-drag-region>
        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-accent/10 pointer-events-none">
          <Cat size={14} className="text-accent" />
        </div>
        <span className="text-sm font-bold tracking-wider text-primary pointer-events-none drop-shadow-sm">
          {APP_NAME}
        </span>
      </div>

      <div className={`relative transition-all duration-300 ${
        fullscreen ? "w-0 max-w-0 opacity-0 px-0 pointer-events-none" : "flex-1 max-w-[28rem] px-4"
      }`} ref={dropdownRef}>
        <div data-tauri-drag-region className="absolute inset-0 z-0" />
        <div className="relative z-10">
          <SearchInput
            value={query}
            onChange={setQuery}
            onClear={() => setQuery("")}
            onEnter={handleSubmit}
            onFocus={() => setSearchFocused(true)}
          />

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute left-4 right-4 z-50 mt-2 overflow-hidden rounded-xl border border-white/[0.08] bg-bg-elevated/95 backdrop-blur-xl shadow-2xl"
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className={`flex items-center pl-4 ${fullscreen ? "ml-auto absolute right-0 top-0 h-14" : "h-full"}`}>
        <button
          onClick={() => setSettingsVisible(!settingsVisible)}
          className={`flex h-9 cursor-pointer items-center justify-center rounded-full text-secondary transition-all duration-300 hover:bg-white/[0.08] hover:text-primary overflow-hidden ${
            fullscreen ? "w-0 opacity-0 mr-0 pointer-events-none" : "w-9 mr-2"
          }`}
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
