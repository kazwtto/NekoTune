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
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between">
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
      <div className="flex flex-col gap-0.5">
        {history.map((h) => (
          <button
            key={h}
            onClick={() => onSelect(h)}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-secondary transition-all duration-150 hover:bg-bg-hover"
          >
            <Clock size={13} />
            {h}
          </button>
        ))}
      </div>
    </div>
  )
}
