import React from "react"
import Modal from "./Modal"
import Button from "./Button"
import { useTranslation } from "react-i18next"

type ButtonProps = React.ComponentProps<typeof Button>

interface ConfirmationModalProps {
  open: boolean
  onClose: () => void
  onConfirm?: () => void
  title: string
  message: React.ReactNode
  variant?: "danger" | "primary"
  buttonJustify?: "justify-end" | "justify-center" | "justify-start" | "justify-between" | "justify-around" | "justify-evenly"
  confirmButtonProps?: ButtonProps
  cancelButtonProps?: ButtonProps
  actions?: React.ReactNode
}

export default function ConfirmationModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  variant = "danger",
  buttonJustify="justify-end",
  confirmButtonProps = {},
  cancelButtonProps = {},
  actions,
}: ConfirmationModalProps) {
  const { t } = useTranslation()
  
  const isDanger = variant === "danger"

  return (
    <Modal open={open} onClose={onClose} title={title} width={340}>
      <div className="flex flex-col gap-5">
        <div className="text-sm leading-relaxed text-secondary">{message}</div>

        <div className={`flex ${buttonJustify} gap-3`}>
          {actions ? (
            actions
          ) : (
            <>
              <Button
                variant={cancelButtonProps.variant || "ghost"}
                onClick={onClose}
                className={cancelButtonProps.className}
                {...cancelButtonProps}
              >
                {cancelButtonProps.children || t("common.cancel")}
              </Button>

              {onConfirm && (
                <Button
                  variant={confirmButtonProps.variant || "primary"}
                  onClick={(e) => {
                    if (confirmButtonProps.onClick) confirmButtonProps.onClick(e)
                    onConfirm()
                    onClose()
                  }}
                  className={`${isDanger ? "bg-error text-white hover:bg-error/90" : ""} ${confirmButtonProps.className || ""}`}
                  {...confirmButtonProps}
                >
                  {confirmButtonProps.children || t("common.confirm")}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}