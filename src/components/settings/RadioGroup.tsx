interface RadioOption {
  value: string
  label: string
  description?: string
}

interface RadioGroupProps {
  options: RadioOption[]
  value: string
  onChange: (value: string) => void
}

export default function RadioGroup({ options, value, onChange }: RadioGroupProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {options.map((opt) => {
        const isSelected = value === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-150 ${
              isSelected
                ? "bg-accent-muted ring-1 ring-accent/30"
                : "hover:bg-bg-hover"
            }`}
          >
            <div
              className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150 ${
                isSelected ? "border-accent" : "border-muted"
              }`}
            >
              {isSelected && <div className="h-2 w-2 rounded-full bg-accent" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-sm ${isSelected ? "text-accent font-medium" : "text-primary"}`}>
                {opt.label}
              </p>
              {opt.description && (
                <p className="mt-0.5 text-xs text-muted">{opt.description}</p>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
