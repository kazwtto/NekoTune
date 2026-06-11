import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { usePersistedState } from "../hooks/usePersistedState"
import {
  Palette, Headphones, Play, Globe, Info,
} from "lucide-react"

import AppearanceSection from "../components/settings/AppearanceSection"
import AudioSection from "../components/settings/AudioSection"
import PlaybackSection from "../components/settings/PlaybackSection"
import LanguageSection from "../components/settings/LanguageSection"
import AboutSection from "../components/settings/AboutSection"

const sections = [
  { id: "appearance", labelKey: "settings.appearance", icon: Palette },
  { id: "audio", labelKey: "settings.audio", icon: Headphones },
  { id: "playback", labelKey: "settings.playback", icon: Play },
  { id: "language", labelKey: "settings.language", icon: Globe },
  { id: "about", labelKey: "settings.about", icon: Info },
]

export default function SettingsPage() {
  const { t } = useTranslation()
  const [active, setActive] = usePersistedState("nekotune-settings-tab", "appearance")

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex h-full gap-6"
    >
      <aside className="w-48 flex-shrink-0">
        <h1 className="mb-6 text-lg font-bold text-primary">{t("common.settings")}</h1>

        <nav className="flex flex-col gap-0.5">
          {sections.map((s) => {
            const Icon = s.icon
            const isActive = active === s.id
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150 ${
                  isActive
                    ? "bg-accent-muted font-medium text-accent"
                    : "text-secondary hover:bg-bg-hover hover:text-primary"
                }`}
              >
                <Icon size={16} />
                {t(s.labelKey)}
              </button>
            )
          })}
        </nav>
      </aside>

      <div className="min-w-0 flex-1 overflow-y-auto pr-6">
        <motion.div
          key={active}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.15 }}
          className="min-h-full"
        >
          {active === "appearance" && <AppearanceSection />}
          {active === "audio" && <AudioSection />}
          {active === "playback" && <PlaybackSection />}
          {active === "language" && <LanguageSection />}
          {active === "about" && <AboutSection />}
        </motion.div>
      </div>
    </motion.div>
  )
}
