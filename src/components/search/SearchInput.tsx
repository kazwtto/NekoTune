import { Search, X } from "lucide-react"
import { useRef } from "react"
import { useTranslation } from "react-i18next"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  onEnter?: () => void
  onFocus?: () => void
  placeholder?: string
}

export default function SearchInput({
  value,
  onChange,
  onClear,
  onEnter,
  onFocus,
  placeholder,
}: SearchInputProps) {
  const { t } = useTranslation()
  const resolvedPlaceholder = placeholder ?? t("search.placeholder")
  const inputRef = useRef<HTMLInputElement>(null)

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && onEnter) {
      onEnter()
    }
  }

  return (
    <div className="group flex h-9 items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 transition-all duration-300 hover:bg-white/[0.06] focus-within:border-accent/40 focus-within:bg-white/[0.08] focus-within:shadow-[0_0_15px_rgba(var(--accent-rgb),0.15)]">
      <Search size={15} className="flex-shrink-0 text-muted transition-colors group-focus-within:text-accent" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        placeholder={resolvedPlaceholder}
        className="w-full bg-transparent text-sm text-primary outline-none placeholder:text-muted/70"
      />
      {value && (
        <button
          onClick={onClear}
          className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-white/[0.05] text-muted transition-all duration-200 hover:bg-white/[0.1] hover:text-primary"
        >
          <X size={12} />
        </button>
      )}
    </div>
  )
}
