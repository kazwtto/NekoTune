import { useSettingsStore } from "../../stores/settingsStore"
import { useTranslation } from "react-i18next"
import { changeLanguage } from "../../i18n"
import { Check, ChevronDown } from "lucide-react"
import { useState, useRef, useEffect } from "react"

const languages = [
  { value: "en-US", label: "English" },
  { value: "pt-BR", label: "Português (Brasil)" },
]

export default function LanguageSection() {
  const { t, i18n } = useTranslation()
  const { settings, updateSettings } = useSettingsStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = languages.find((l) => l.value === settings.language) ?? languages[0]

  function handleSelect(code: string) {
    updateSettings({ language: code })
    changeLanguage(code)
    setOpen(false)
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="flex flex-col gap-8 px-4">
      <div>
        <h3 className="mb-5 text-xs font-semibold text-secondary">{t("settings.language")}</h3>
        <div ref={ref} className="ml-3 relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-white/[0.08] bg-bg-secondary px-3 py-2.5 text-left text-sm text-primary transition-colors hover:border-white/20"
          >
            <span>{selected.label}</span>
            <ChevronDown
              size={16}
              className={`text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </button>
          {open && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-lg border border-white/[0.08] bg-bg-secondary shadow-lg">
              {languages.map((lang) => {
                const isActive = lang.value === settings.language
                return (
                  <button
                    key={lang.value}
                    onClick={() => handleSelect(lang.value)}
                    className={`flex w-full cursor-pointer items-center justify-between px-3 py-2.5 text-left text-sm transition-colors hover:bg-bg-hover ${
                      isActive ? "text-accent font-medium" : "text-primary"
                    }`}
                  >
                    <span>{lang.label}</span>
                    {isActive && <Check size={14} className="text-accent" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
