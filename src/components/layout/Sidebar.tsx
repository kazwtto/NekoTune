import { NavLink, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useEffect, useState } from "react"
import { useUiStore } from "../../stores/uiStore"
import { useLibraryStore } from "../../stores/libraryStore"
import ContextMenu, { ContextMenuItem } from "../ui/ContextMenu"
import {
  Home,
  Compass,
  Library,
  ListMusic,
  Heart,
  Clock,
  Plus,
  Pencil,
  Trash2
} from "lucide-react"
import { proxyUrl } from "../../services/proxy"

const navItems = [
  { path: "/", icon: Home, labelKey: "common.home" },
  { path: "/explore", icon: Compass, labelKey: "common.explore" },
  { path: "/library", icon: Library, labelKey: "common.library" },
  { path: "/playlists", icon: ListMusic, labelKey: "common.playlists" },
  { path: "/favorites", icon: Heart, labelKey: "common.favorites" },
  { path: "/history", icon: Clock, labelKey: "common.history" },
]

export default function Sidebar() {
  const { t } = useTranslation()
  const location = useLocation()
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const setPlaylistModalVisible = useUiStore((s) => s.setPlaylistModalVisible)
  const playlists = useLibraryStore((s) => s.playlists)
  const togglePlaylistFavorite = useLibraryStore((s) => s.togglePlaylistFavorite)
  const deletePlaylist = useLibraryStore((s) => s.deletePlaylist)

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; playlistId: string } | null>(null)

  useEffect(() => {
    function handleResize() {
      const state = useUiStore.getState()
      const shouldCollapse = window.innerWidth < 640
      if (shouldCollapse !== state.sidebarCollapsed) {
        useUiStore.setState({ sidebarCollapsed: shouldCollapse })
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  function handleContextMenu(e: React.MouseEvent, playlistId: string) {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, playlistId })
  }

  return (
    <nav className={`flex flex-shrink-0 flex-col overflow-hidden bg-bg-base py-3 transition-[width] duration-300 ease-in-out ${collapsed ? "!w-14" : "w-[180px]"}`}>
      <div className="flex flex-col gap-0.5 px-2">
        {navItems.map((item) => {
          const active = item.path === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(item.path)
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                active
                  ? "bg-accent/15 font-semibold text-accent"
                  : "font-normal text-secondary hover:bg-white/5 hover:text-primary"
              }`}
            >
              <item.icon
                size={18}
                className="flex-shrink-0 transition-all duration-200"
                strokeWidth={2}
              />
              <span className={`whitespace-nowrap transition-opacity duration-300 ${collapsed ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                {t(item.labelKey)}
              </span>
            </NavLink>
          )
        })}
      </div>

      <div className={`mt-6 px-2 flex flex-col min-h-0 flex-1 transition-opacity duration-300 ${collapsed ? "opacity-0 pointer-events-none hidden" : "opacity-100"}`}>
        <div className="flex items-center justify-between px-3 mb-2 flex-shrink-0">
          <span className="text-[11px] font-bold text-secondary tracking-widest">PLAYLISTS</span>
          <button 
            onClick={() => setPlaylistModalVisible(true)}
            className="text-secondary hover:text-white transition-colors p-1 rounded-md hover:bg-white/5 cursor-pointer"
            title={t("common.createPlaylist")}
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-1 flex flex-col gap-0.5">
          {playlists.map(pl => {
            const active = location.pathname === `/playlist/${pl.id}`
            return (
              <NavLink
                key={pl.id}
                to={`/playlist/${pl.id}`}
                onContextMenu={(e) => handleContextMenu(e, pl.id)}
                className={`flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-all duration-200 ${
                  active
                    ? "bg-accent/15 font-medium text-accent"
                    : "font-normal text-secondary hover:bg-white/5 hover:text-primary"
                }`}
              >
                {pl.image ? (
                  <img src={proxyUrl(pl.image)} alt="" className="h-6 w-6 rounded object-cover flex-shrink-0" />
                ) : (
                  <div 
                    className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded"
                    style={{ backgroundColor: pl.color || 'rgba(255,255,255,0.1)' }}
                  >
                    <ListMusic size={12} className="text-white" />
                  </div>
                )}
                <span className="truncate">{pl.title}</span>
              </NavLink>
            )
          })}
        </div>
      </div>

      {contextMenu && (() => {
        const pl = playlists.find((p) => p.id === contextMenu.playlistId)
        if (!pl) return null

        return (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
          >
            <ContextMenuItem
              onClick={() => {
                togglePlaylistFavorite(pl.id)
                setContextMenu(null)
              }}
            >
              <Heart size={14} fill={pl.isFavorite ? "currentColor" : "none"} />
              {pl.isFavorite ? t("common.removeFromFavorites") : t("common.addToFavorites")}
            </ContextMenuItem>
            
            <div className="my-1 h-px w-full bg-white/10" />
            
            <ContextMenuItem
              onClick={() => {
                setPlaylistModalVisible(true, pl.id)
                setContextMenu(null)
              }}
            >
              <Pencil size={14} />
              {t("common.edit")}
            </ContextMenuItem>
            
            <ContextMenuItem
              danger
              onClick={() => {
                if (window.confirm(t("common.confirmDelete"))) {
                  deletePlaylist(pl.id)
                }
                setContextMenu(null)
              }}
            >
              <Trash2 size={14} />
              {t("common.delete")}
            </ContextMenuItem>
          </ContextMenu>
        )
      })()}
    </nav>
  )
}
