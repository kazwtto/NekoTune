import type { ReactNode } from "react"
import { createPortal } from "react-dom"
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
  const modalContent = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="overflow-hidden rounded-xl border border-white/[0.08] bg-bg-elevated shadow-2xl backdrop-blur-xl ring-1 ring-black/20"
            style={{ width, maxHeight: "80vh" }}
          >
            {title && (
              <div className="hidden items-center justify-between border-b border-white/[0.08] px-5 py-4">
                <span className="text-sm font-semibold text-primary">{title}</span>
                <button
                  onClick={onClose}
                  className="cursor-pointer rounded-md p-1 text-muted transition-colors duration-150 hover:bg-white/5"
                >
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

  if (typeof document === "undefined") return null
  return createPortal(modalContent, document.body)
}
