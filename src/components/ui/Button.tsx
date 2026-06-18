import React, { ReactNode, useState } from "react"
import { motion, HTMLMotionProps } from "framer-motion"

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "ghost" | "icon"
  size?: "sm" | "md"
  icon?: ReactNode
  truncate?: boolean
  truncateType?: "split" | "ellipsis"
  children?: ReactNode
}

export default function Button({
  variant = "primary",
  size = "md",
  icon,
  truncate,
  truncateType = "ellipsis",
  children,
  className = "",
  onMouseEnter,
  onMouseLeave,
  ...props
}: ButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors duration-150 cursor-pointer border-none max-w-full"

  const sizes: Record<string, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-xs",
  }

  const variants: Record<string, string> = {
    primary: "bg-accent text-white",
    secondary: "bg-surface text-secondary border border-border",
    ghost: "bg-transparent text-secondary",
    icon: "bg-transparent text-secondary p-1.5 rounded-md",
  }

  const disabledStyle = props.disabled ? "opacity-50" : ""

  const childrenAsString = React.Children.toArray(children).join("").trim()
  const hasText = childrenAsString.length > 0

  let displayContent = children
  let textClasses = "min-w-0"

  if (truncate && hasText) {
    if (!isHovered) {
      if (truncateType === "split") displayContent = childrenAsString.split(" ")[0]
      else if (truncateType === "ellipsis") textClasses = "overflow-hidden text-ellipsis whitespace-nowrap min-w-0"
    } else {
      displayContent = childrenAsString
      textClasses = "whitespace-nowrap min-w-0"
    }
  }

  return (
    <motion.button
      layout
      onMouseEnter={(e: any) => {
        setIsHovered(true)
        if (onMouseEnter) onMouseEnter(e)
      }}
      onMouseLeave={(e: any) => {
        setIsHovered(false)
        if (onMouseLeave) onMouseLeave(e)
      }}
      className={`${base} ${sizes[size]} ${variants[variant]} ${disabledStyle} ${className}`}
      {...props}
    >
      {icon && (
        <motion.span layout className="flex-shrink-0 flex items-center">
          {icon}
        </motion.span>
      )}

      {hasText && (
        <motion.span layout className={textClasses}>
          {displayContent}
        </motion.span>
      )}
    </motion.button>
  )
}