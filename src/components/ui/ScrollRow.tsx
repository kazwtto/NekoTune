import { useRef, useState, useEffect, useCallback, type ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ScrollRowProps {
  children: ReactNode
  className?: string
}

export default function ScrollRow({ children, className = "" }: ScrollRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener("scroll", checkScroll, { passive: true })
    const ro = new ResizeObserver(checkScroll)
    ro.observe(el)
    return () => {
      el.removeEventListener("scroll", checkScroll)
      ro.disconnect()
    }
  }, [checkScroll])

  function scrollBy(direction: -1 | 1) {
    const el = scrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.75
    el.scrollBy({ left: direction * amount, behavior: "smooth" })
  }

  return (
    <div className={`group/scroll relative overflow-hidden ${className}`}>
      {canScrollLeft && (
        <button
          onClick={() => scrollBy(-1)}
          className="absolute -left-1 top-0 z-10 flex h-full w-8 cursor-pointer items-center justify-center bg-gradient-to-r from-bg-base via-bg-base to-transparent opacity-0 transition-opacity duration-150 group-hover/scroll:opacity-100"
        >
          <ChevronLeft size={20} className="text-primary" />
        </button>
      )}
      <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {children}
      </div>
      {canScrollRight && (
        <button
          onClick={() => scrollBy(1)}
          className="absolute -right-1 top-0 z-10 flex h-full w-8 cursor-pointer items-center justify-center bg-gradient-to-l from-bg-base via-bg-base to-transparent opacity-0 transition-opacity duration-150 group-hover/scroll:opacity-100"
        >
          <ChevronRight size={20} className="text-primary" />
        </button>
      )}
    </div>
  )
}
