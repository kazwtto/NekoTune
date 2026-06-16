import { NavLink, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useEffect } from "react"
import { useUiStore } from "../../stores/uiStore"
import {
  Home,
  Compass,
  Library,
  ListMusic,
  Heart,
  Clock,
  Plus
} from "lucide-react"

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

      <div className={`mt-6 px-2 flex flex-col gap-1 transition-opacity duration-300 ${collapsed ? "opacity-0 pointer-events-none hidden" : "opacity-100"}`}>
        <div className="flex items-center justify-between px-3 mb-1">
          <span className="text-[11px] font-bold text-secondary tracking-widest">PLAYLISTS</span>
          <button className="text-secondary hover:text-white transition-colors">
            <Plus size={16} />
          </button>
        </div>
        {/* Playlists section ready for future data */}
      </div>
    </nav>
  )
}
