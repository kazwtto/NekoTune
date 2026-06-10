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
  style,
  ...props
}: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 500,
    transition: "all 0.15s ease",
    opacity: props.disabled ? 0.5 : 1,
  }

  const sizeStyle = size === "sm" ? { padding: "6px 12px", fontSize: 12 } : { padding: "8px 16px", fontSize: 13 }

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: "var(--accent)",
      color: "#fff",
    },
    secondary: {
      background: "var(--bg-surface)",
      color: "var(--text-secondary)",
      border: "1px solid var(--border)",
    },
    ghost: {
      background: "transparent",
      color: "var(--text-secondary)",
    },
    icon: {
      background: "transparent",
      color: "var(--text-secondary)",
      padding: 6,
      borderRadius: 6,
    },
  }

  return (
    <button
      style={{ ...baseStyle, ...sizeStyle, ...variantStyles[variant], ...style }}
      {...props}
    >
      {children}
    </button>
  )
}
