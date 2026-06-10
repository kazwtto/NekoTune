import { useTranslation } from "react-i18next"
import { User, LogIn } from "lucide-react"

export default function AccountSection() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full"
        style={{ background: "var(--bg-surface)" }}
      >
        <User size={28} style={{ color: "var(--text-muted)" }} />
      </div>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        {t("settings.notSynced")}
      </p>
      <button
        className="flex cursor-pointer items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-150 hover:opacity-90"
        style={{ background: "var(--accent)", border: "none", color: "#fff" }}
      >
        <LogIn size={14} />
        {t("settings.login")}
      </button>
      <p className="text-center text-xs" style={{ color: "var(--text-muted)", maxWidth: 260 }}>
        Login via Google to sync your playlists, history, and personalized recommendations.
      </p>
    </div>
  )
}
