import type { LucideIcon } from "lucide-react"

interface Tab {
  id: string
  label: string
  icon?: LucideIcon
  count?: number
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (id: string) => void
}

export default function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 border-b border-border">
      {tabs.map((tab) => {
        const Icon = tab.icon
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-1.5 cursor-pointer px-3 py-2 text-xs font-semibold transition-all duration-150 relative ${
              activeTab === tab.id
                ? "border-b-2 border-accent text-accent"
                : "border-b-2 border-transparent text-secondary hover:text-primary"
            }`}
          >
            {Icon && <Icon size={12} />}
            {tab.label}
            {tab.count !== undefined && (
              <span className="text-[10px] text-muted ml-0.5">{tab.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

