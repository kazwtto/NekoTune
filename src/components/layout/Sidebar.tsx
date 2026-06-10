import { NavLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  Home,
  Search,
  Library,
  ListMusic,
  Settings,
} from "lucide-react"

const navItems = [
  { path: "/", icon: Home, labelKey: "common.home" },
  { path: "/search", icon: Search, labelKey: "common.search" },
  { path: "/library", icon: Library, labelKey: "common.library" },
  { path: "/queue", icon: ListMusic, labelKey: "common.queue" },
]

const bottomItems = [
  { path: "/settings", icon: Settings, labelKey: "common.settings" },
]

export default function Sidebar() {
  const { t } = useTranslation()

  return (
    <nav
      className="flex flex-col py-4"
      style={{
        width: 180,
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border)",
      }}
    >
      <div className="mb-6 flex flex-col gap-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150"
            style={({ isActive }) => ({
              background: isActive ? "var(--accent-muted)" : "transparent",
              color: isActive ? "var(--accent)" : "var(--text-secondary)",
              fontWeight: isActive ? 500 : 400,
            })}
          >
            <item.icon size={16} />
            <span>{t(item.labelKey)}</span>
          </NavLink>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-1 px-3">
        {bottomItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150"
            style={({ isActive }) => ({
              background: isActive ? "var(--accent-muted)" : "transparent",
              color: isActive ? "var(--accent)" : "var(--text-secondary)",
              fontWeight: isActive ? 500 : 400,
            })}
          >
            <item.icon size={16} />
            <span>{t(item.labelKey)}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
