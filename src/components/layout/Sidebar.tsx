import { NavLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useState, useEffect } from "react"
import {
  Home,
  Search,
  Library,
  Settings,
} from "lucide-react"

const navItems = [
  { path: "/", icon: Home, labelKey: "common.home" },
  { path: "/search", icon: Search, labelKey: "common.search" },
  { path: "/library", icon: Library, labelKey: "common.library" },
]

const bottomItems = [
  { path: "/settings", icon: Settings, labelKey: "common.settings" },
]

export default function Sidebar() {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    function handleResize() {
      setCollapsed(window.innerWidth < 640)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <nav
      className={`flex w-44 flex-shrink-0 flex-col overflow-hidden border-r border-border bg-bg-surface py-4 transition-[width] duration-300 ease-in-out ${
        collapsed ? "!w-14" : ""
      }`}
    >
      <div className="mb-6 flex flex-col gap-1 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150 ${
                isActive
                  ? "bg-accent-muted font-medium text-accent"
                  : "text-secondary hover:bg-bg-hover"
              }`
            }
          >
            <item.icon size={16} className="flex-shrink-0" />
            <span className={`whitespace-nowrap transition-opacity duration-300 ${collapsed ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
              {t(item.labelKey)}
            </span>
          </NavLink>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-1 px-2">
        {bottomItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150 ${
                isActive
                  ? "bg-accent-muted font-medium text-accent"
                  : "text-secondary hover:bg-bg-hover"
              }`
            }
          >
            <item.icon size={16} className="flex-shrink-0" />
            <span className={`whitespace-nowrap transition-opacity duration-300 ${collapsed ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
              {t(item.labelKey)}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
