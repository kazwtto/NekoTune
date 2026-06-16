import React from "react"
import Modal from "./Modal"
import Button from "./Button"
import { useTranslation } from "react-i18next"

interface ConfirmationModalProps {
  open: boolean
  onClose: () => void
  onConfirm?: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: "danger" | "primary"
  actions?: React.ReactNode
}

export default function ConfirmationModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = "danger",
  actions,
}: ConfirmationModalProps) {
  const { t } = useTranslation()

  return (
    <Modal open={open} onClose={onClose} title={title} width={340}>
      <div className="flex flex-col gap-5">
        <p className="text-sm leading-relaxed text-secondary">{message}</p>
        <div className="flex justify-end gap-3">
          {actions ? (
            actions
          ) : (
            <>
              <Button variant="ghost" onClick={onClose} className="text-xs">
                {cancelText || t("common.cancel")}
              </Button>
              {onConfirm && (
                <Button
                  variant={variant === "danger" ? "primary" : variant}
                  onClick={() => {
                    onConfirm()
                    onClose()
                  }}
                  className={`text-xs ${variant === "danger" ? "bg-error hover:bg-error/90" : ""}`}
                >
                  {confirmText || t("common.confirm")}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}
