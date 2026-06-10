import { useEffect, useRef, type ReactNode } from "react"

interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
  children: ReactNode
}

export default function ContextMenu({ x, y, onClose, children }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose])

  const adjustedX = Math.min(x, window.innerWidth - 180)
  const adjustedY = Math.min(y, window.innerHeight - 200)

  return (
    <div
      ref={ref}
      className="rounded-lg py-1.5 shadow-xl z-50"
      style={{
        position: "fixed",
        left: adjustedX,
        top: adjustedY,
        minWidth: 160,
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
      }}
      onClick={onClose}
    >
      {children}
    </div>
  )
}

export function ContextMenuItem({
  onClick,
  children,
  danger,
}: {
  onClick: () => void
  children: ReactNode
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-xs transition-colors duration-150"
      style={{
        background: "none",
        border: "none",
        color: danger ? "var(--error)" : "var(--text-secondary)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </button>
  )
}
