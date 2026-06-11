import { useTranslation } from "react-i18next"
import { Cat } from "lucide-react"
import SettingsCard from "./SettingsCard"
import { APP_VERSION } from "../../utils/constants"

export default function AboutSection() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
          <Cat size={24} className="text-accent" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-primary">NekoTune</h2>
          <p className="text-xs text-muted">YouTube Music Desktop Client</p>
        </div>
      </div>

      <SettingsCard title={t("settings.about")}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-secondary">{t("settings.version")}</span>
            <span className="text-sm tabular-nums text-muted">{APP_VERSION}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-secondary">{t("settings.engine")}</span>
            <span className="text-sm text-muted">Tauri 2.x + React</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-secondary">{t("settings.audioTech")}</span>
            <span className="text-sm text-muted">yt-dlp + Howler.js</span>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title={t("common.account")}>
        <p className="text-sm text-secondary">{t("settings.loginDescription")}</p>
      </SettingsCard>
    </div>
  )
}
