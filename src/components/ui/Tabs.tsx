interface TabsProps {
  tabs: { id: string; label: string }[]
  activeTab: string
  onChange: (id: string) => void
}

export default function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex gap-1" style={{ borderBottom: "1px solid var(--border)" }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className="cursor-pointer px-3 py-2 text-xs transition-all duration-150"
          style={{
            background: "none",
            border: "none",
            borderBottom: activeTab === tab.id ? "2px solid var(--accent)" : "2px solid transparent",
            color: activeTab === tab.id ? "var(--accent)" : "var(--text-secondary)",
            fontWeight: activeTab === tab.id ? 600 : 400,
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
