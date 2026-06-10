import { Clock } from "lucide-react"

interface SearchHistoryProps {
  history: string[]
  onSelect: (query: string) => void
  onClear: () => void
}

export default function SearchHistory({ history, onSelect, onClear }: SearchHistoryProps) {
  if (history.length === 0) return null

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
          Recent Searches
        </span>
        <button
          onClick={onClear}
          className="cursor-pointer text-xs transition-colors duration-150 hover:opacity-80"
          style={{ background: "none", border: "none", color: "var(--text-muted)" }}
        >
          Clear
        </button>
      </div>
      <div className="flex flex-col gap-0.5">
        {history.map((h) => (
          <button
            key={h}
            onClick={() => onSelect(h)}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-all duration-150"
            style={{ background: "none", border: "none", color: "var(--text-secondary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Clock size={13} />
            {h}
          </button>
        ))}
      </div>
    </div>
  )
}
