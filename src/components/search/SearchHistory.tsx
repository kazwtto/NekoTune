import { useTranslation } from "react-i18next"
import { Clock } from "lucide-react"

interface SearchHistoryProps {
  history: string[]
  onSelect: (query: string) => void
  onClear: () => void
}

export default function SearchHistory({ history, onSelect, onClear }: SearchHistoryProps) {
  const { t } = useTranslation()

  if (history.length === 0) return null

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-xs font-medium text-secondary">
          {t("search.recentSearches")}
        </span>
        <button
          onClick={onClear}
          className="cursor-pointer text-xs text-muted transition-colors duration-150 hover:opacity-80"
        >
          {t("search.clearHistory")}
        </button>
      </div>
      <div className="max-h-56 overflow-y-auto px-1.5 pb-1.5">
        <div className="flex flex-col gap-0.5">
          {history.map((h) => (
            <button
              key={h}
              onClick={() => onSelect(h)}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-secondary transition-colors duration-100 hover:bg-bg-hover"
            >
              <Clock size={13} />
              {h}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
