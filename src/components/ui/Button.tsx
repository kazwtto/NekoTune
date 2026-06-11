import type { ButtonHTMLAttributes, ReactNode } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "icon"
  size?: "sm" | "md"
  children?: ReactNode
}

export default function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all duration-150 cursor-pointer border-none"

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

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${disabledStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
