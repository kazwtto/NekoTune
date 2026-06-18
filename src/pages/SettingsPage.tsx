import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "react-i18next"
import { useUiStore } from "../stores/uiStore"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  Palette, Headphones, Play, Globe, Info, ChevronDown, FolderOpen, Download, Database, Trash2,
} from "lucide-react"

import AppearanceSection from "../components/settings/AppearanceSection"
import AudioSection from "../components/settings/AudioSection"
import PlaybackSection from "../components/settings/PlaybackSection"
import LanguageSection from "../components/settings/LanguageSection"
import AboutSection from "../components/settings/AboutSection"
import LocalMusicSection from "../components/settings/LocalMusicSection"
import DownloadSection from "../components/settings/DownloadSection"
import CacheSection from "../components/settings/CacheSection"
import AccountSection from "../components/settings/AccountSection"
import DangerZoneSection from "../components/settings/DangerZoneSection"

const sections = [
  { id: "appearance", labelKey: "settings.appearance", icon: Palette },
  { id: "language", labelKey: "settings.language", icon: Globe },
  { id: "audio", labelKey: "settings.audio", icon: Headphones },
  { id: "playback", labelKey: "settings.playback", icon: Play },
  { id: "download", labelKey: "settings.download", icon: Download },
  { id: "cache", labelKey: "settings.cache", icon: Database },
  { id: "localMusic", labelKey: "settings.localMusic", icon: FolderOpen },
  // { id: "account", labelKey: "settings.account", icon: UserCircle },
  { id: "dangerZone", labelKey: "settings.dangerZone", icon: Trash2 },
  { id: "about", labelKey: "settings.about", icon: Info },
]

const EDGE_EPSILON_PX = 2
const TRIGGER_LINE_PX = 4
const MAX_LOCK_MS = 1000

export default function SettingsPage() {
  const { t } = useTranslation()
  const visible = useUiStore((s) => s.settingsVisible)
  const setVisible = useUiStore((s) => s.setSettingsVisible)
  const [active, setActive] = useState("appearance")
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const scrollingRef = useRef(false)
  const pendingUnlockRef = useRef<(() => void) | null>(null)
  const pendingTimeoutRef = useRef<number | undefined>(undefined)

  const recompute = useCallback(() => {
    if (scrollingRef.current) return
    const container = scrollRef.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container

    if (scrollTop <= EDGE_EPSILON_PX) {
      setActive(sections[0].id)
      return
    }

    if (scrollTop + clientHeight >= scrollHeight - EDGE_EPSILON_PX) {
      setActive(sections[sections.length - 1].id)
      return
    }

    const triggerY = container.getBoundingClientRect().top + TRIGGER_LINE_PX

    let next = sections[0].id
    for (const s of sections) {
      const el = sectionRefs.current[s.id]
      if (!el) continue
      if (el.getBoundingClientRect().top <= triggerY) {
        next = s.id
      }
    }

    setActive(next)
  }, [])

  const cancelPendingUnlock = useCallback(() => {
    const container = scrollRef.current
    if (container && pendingUnlockRef.current) {
      container.removeEventListener("scrollend", pendingUnlockRef.current)
    }
    if (pendingTimeoutRef.current !== undefined) {
      window.clearTimeout(pendingTimeoutRef.current)
    }
    pendingUnlockRef.current = null
    pendingTimeoutRef.current = undefined
  }, [])

  useEffect(() => {
    if (!visible) return
    const container = scrollRef.current
    if (!container) return

    scrollingRef.current = false
    recompute()

    let scrollScheduled = false
    function onScroll() {
      if (scrollScheduled) return
      scrollScheduled = true
      requestAnimationFrame(() => {
        scrollScheduled = false
        recompute()
      })
    }

    container.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      container.removeEventListener("scroll", onScroll)
      cancelPendingUnlock()
      scrollingRef.current = false
    }
  }, [visible, recompute, cancelPendingUnlock])

  function scrollTo(id: string) {
    const el = sectionRefs.current[id]
    const container = scrollRef.current
    if (!el || !container) return

    cancelPendingUnlock()
    setActive(id)
    scrollingRef.current = true

    const unlock = () => {
      cancelPendingUnlock()
      scrollingRef.current = false
      recompute()
    }

    pendingUnlockRef.current = unlock
    container.addEventListener("scrollend", unlock, { once: true })
    pendingTimeoutRef.current = window.setTimeout(unlock, MAX_LOCK_MS)

    el.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed inset-0 z-40 flex gap-6"
          style={{ background: "var(--color-bg-primary)" }}
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
                  {s.id === "download" && <DownloadSection />}
                  {s.id === "cache" && <CacheSection />}
                  {s.id === "localMusic" && <LocalMusicSection />}
                  {s.id === "account" && <AccountSection />}
                  {s.id === "language" && <LanguageSection />}
                  {s.id === "dangerZone" && <DangerZoneSection />}
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