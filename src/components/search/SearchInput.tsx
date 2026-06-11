import { Search, X } from "lucide-react"
import { useRef } from "react"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  onEnter?: () => void
  placeholder?: string
}

export default function SearchInput({
  value,
  onChange,
  onClear,
  onEnter,
  placeholder = "Search songs, albums, artists...",
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && onEnter) {
      onEnter()
    }
  }

  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border bg-surface px-3.5 py-2.5 transition-all duration-150 focus-within:border-accent/30">
      <Search size={16} className="flex-shrink-0 text-muted" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-primary outline-none"
        autoFocus
      />
      {value && (
        <button
          onClick={onClear}
          className="cursor-pointer p-1 text-muted transition-colors duration-150 hover:opacity-80"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
