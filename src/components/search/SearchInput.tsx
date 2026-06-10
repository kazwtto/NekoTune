import { Search, X } from "lucide-react"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  placeholder?: string
}

export default function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = "Search songs, albums, artists...",
}: SearchInputProps) {
  return (
    <div
      className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 transition-all duration-150"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
    >
      <Search size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm outline-none"
        style={{ color: "var(--text-primary)" }}
        autoFocus
      />
      {value && (
        <button
          onClick={onClear}
          className="cursor-pointer transition-colors duration-150 hover:opacity-80"
          style={{ background: "none", border: "none", color: "var(--text-muted)", padding: 4 }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
