import { useState } from "react"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { useSettingsStore } from "../stores/settingsStore"
import { APP_VERSION } from "../utils/constants"
import AppearanceSection from "../components/settings/AppearanceSection"
import AudioSection from "../components/settings/AudioSection"
import PlaybackSection from "../components/settings/PlaybackSection"
import LanguageSection from "../components/settings/LanguageSection"
import AccountSection from "../components/settings/AccountSection"
import { Cat, RotateCcw } from "lucide-react"

const tabs = [
  { id: "appearance", labelKey: "settings.appearance" },
  { id: "audio", labelKey: "settings.audio" },
  { id: "playback", labelKey: "settings.playback" },
  { id: "language", labelKey: "settings.language" },
  { id: "account", labelKey: "settings.account" },
]

export default function SettingsPage() {
  const { t } = useTranslation()
  const { resetSettings } = useSettingsStore()
  const [activeTab, setActiveTab] = useState("appearance")

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">{t("common.settings")}</h2>
        <button
          onClick={resetSettings}
          className="flex cursor-pointer items-center gap-1.5 text-sm transition-colors duration-150 hover:opacity-80"
          style={{ background: "none", border: "none", color: "var(--text-muted)" }}
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="cursor-pointer whitespace-nowrap rounded-lg px-3.5 py-2 text-sm transition-all duration-150"
            style={{
              background: activeTab === tab.id ? "var(--accent-muted)" : "var(--bg-surface)",
              color: activeTab === tab.id ? "var(--accent)" : "var(--text-secondary)",
              border: `1px solid ${activeTab === tab.id ? "var(--accent)" : "var(--border)"}`,
            }}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      <div className="rounded-xl p-5" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
        {activeTab === "appearance" && <AppearanceSection />}
        {activeTab === "audio" && <AudioSection />}
        {activeTab === "playback" && <PlaybackSection />}
        {activeTab === "language" && <LanguageSection />}
        {activeTab === "account" && <AccountSection />}
      </div>

      <div className="mt-5 flex flex-col items-center gap-1">
        <Cat size={18} style={{ color: "var(--accent)" }} />
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          NekoTune v{APP_VERSION}
        </p>
      </div>
    </motion.div>
  )
}
