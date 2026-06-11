import type { ReactNode } from "react"

interface SettingsCardProps {
  title: string
  children: ReactNode
}

export default function SettingsCard({ title, children }: SettingsCardProps) {
  return (
    <div className="rounded-xl bg-bg-surface p-5">
      <h3 className="mb-4 text-sm font-semibold text-primary">{title}</h3>
      {children}
    </div>
  )
}
