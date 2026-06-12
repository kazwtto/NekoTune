import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ChevronDown } from "lucide-react"

interface DropdownOption {
  value: string
  label: string
}

interface DropdownProps {
  label?: string
  value: string
  options: DropdownOption[]
  onChange: (value: string) => void
}

export default function Dropdown({ label, value, options, onChange }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value) || options[0]

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
    <div className="flex flex-col gap-2">
      {label && <h3 className="mb-3 text-xs font-semibold text-secondary">{label}</h3>}
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-white/[0.08] bg-bg-surface px-3 py-2.5 text-left text-sm text-primary transition-all hover:border-white/20 hover:bg-bg-hover"
        >
          <span className="truncate">{selected.label}</span>
          <ChevronDown
            size={16}
            className={`text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-lg border border-white/[0.08] bg-bg-elevated shadow-xl ring-1 ring-black/20 backdrop-blur-md"
            >
              <div className="flex flex-col py-1">
                {options.map((option) => {
                  const isActive = option.value === value
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        onChange(option.value)
                        setOpen(false)
                      }}
                      className={`flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-white/5 ${
                        isActive ? "text-accent font-medium bg-accent-muted/10" : "text-primary"
                      }`}
                    >
                      <span className="truncate">{option.label}</span>
                      {isActive && <Check size={14} className="text-accent" />}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
