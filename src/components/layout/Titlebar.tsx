import { Cat } from "lucide-react"
import { APP_NAME } from "../../utils/constants"

export default function Titlebar() {
  return (
    <div
      className="flex items-center justify-between"
      data-tauri-drag-region
      style={{
        height: 32,
        background: "rgba(13, 17, 23, 0.95)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center gap-2 px-3">
        <div
          className="flex items-center justify-center rounded-md"
          style={{
            width: 20,
            height: 20,
            background: "var(--accent-muted)",
          }}
        >
          <Cat size={12} style={{ color: "var(--accent)" }} />
        </div>
        <span
          className="text-xs font-semibold tracking-wide"
          style={{ color: "var(--text-secondary)" }}
        >
          {APP_NAME}
        </span>
      </div>
    </div>
  )
}
