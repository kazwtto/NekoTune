import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "react-i18next"
import { useUiStore } from "../stores/uiStore"
import { useEffect, useRef, useState } from "react"
import {
  Palette, Headphones, Play, Globe, Info, ChevronDown, FolderOpen,
} from "lucide-react"

import AppearanceSection from "../components/settings/AppearanceSection"
import AudioSection from "../components/settings/AudioSection"
import PlaybackSection from "../components/settings/PlaybackSection"
import LanguageSection from "../components/settings/LanguageSection"
import AboutSection from "../components/settings/AboutSection"
import LocalMusicSection from "../components/settings/LocalMusicSection"

const sections = [
  { id: "appearance", labelKey: "settings.appearance", icon: Palette },
  { id: "audio", labelKey: "settings.audio", icon: Headphones },
  { id: "playback", labelKey: "settings.playback", icon: Play },
  { id: "localMusic", labelKey: "settings.localMusic", icon: FolderOpen },
  { id: "language", labelKey: "settings.language", icon: Globe },
  { id: "about", labelKey: "settings.about", icon: Info },
]

export default function SettingsPage() {
  const { t } = useTranslation()
  const visible = useUiStore((s) => s.settingsVisible)
  const setVisible = useUiStore((s) => s.setSettingsVisible)
  const [active, setActive] = useState("appearance")
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        }
      },
      { root: scrollRef.current, rootMargin: "-50% 0px -50% 0px" }
    )

    const elements = Object.values(sectionRefs.current).filter(Boolean) as HTMLDivElement[]
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [visible])

  function scrollTo(id: string) {
    const el = sectionRefs.current[id]
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed inset-0 z-40 flex gap-6 bg-bg-primary"
        >
          <aside className="w-52 flex-shrink-0 flex flex-col pt-5 pl-6">
            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={() => setVisible(false)}
                className="cursor-pointer rounded-full p-2 text-secondary transition-colors duration-150 hover:text-primary"
              >
                <ChevronDown size={24} />
              </button>
              <h1 className="text-lg font-bold text-primary">{t("common.settings")}</h1>
            </div>

            <nav className="flex flex-col gap-0.5">
              {sections.map((s) => {
                const Icon = s.icon
                const isActive = active === s.id
                return (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-all duration-150 ${isActive
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

          <div
            ref={scrollRef}
            className="min-w-0 flex-1 overflow-y-auto pr-6 pt-5"
          >
            <div className="flex flex-col gap-12 pt-3 pb-12">
              {sections.map((s) => (
                <div
                  key={s.id}
                  id={s.id}
                  ref={(el) => { sectionRefs.current[s.id] = el }}
                >
                  {s.id === "appearance" && <AppearanceSection />}
                  {s.id === "audio" && <AudioSection />}
                  {s.id === "playback" && <PlaybackSection />}
                  {s.id === "localMusic" && <LocalMusicSection />}
                  {s.id === "language" && <LanguageSection />}
                  {s.id === "about" && <AboutSection />}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
