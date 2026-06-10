import type { ReactNode } from "react"

interface MediaGridProps {
  children: ReactNode
  columns?: number
}

export default function MediaGrid({ children, columns = 2 }: MediaGridProps) {
  return (
    <div
      className="grid gap-3"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      {children}
    </div>
  )
}
