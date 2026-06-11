interface TabsProps {
  tabs: { id: string; label: string }[]
  activeTab: string
  onChange: (id: string) => void
}

export default function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`cursor-pointer px-3 py-2 text-xs transition-all duration-150 ${
            activeTab === tab.id
              ? "border-b-2 border-accent font-semibold text-accent"
              : "border-b-2 border-transparent text-secondary"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
