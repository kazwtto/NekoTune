import type { ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  width?: number
}

export default function Modal({ open, onClose, title, children, width = 380 }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0, 0, 0, 0.6)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="rounded-xl"
            style={{
              width,
              maxHeight: "80vh",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              overflow: "hidden",
            }}
          >
            {title && (
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <span className="text-sm font-semibold">{title}</span>
                <button onClick={onClose} className="cursor-pointer rounded-md p-1 transition-colors duration-150 hover:bg-white/5" style={{ color: "var(--text-muted)", background: "none", border: "none" }}>
                  <X size={16} />
                </button>
              </div>
            )}
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
