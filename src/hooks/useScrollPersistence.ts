import { useEffect, useRef } from "react"

const scrollPositions = new Map<string, number>()

export function useScrollPersistence(key: string) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const saved = scrollPositions.get(key)
    if (saved !== undefined) {
      requestAnimationFrame(() => {
        el.scrollTop = saved
      })
    }

    function onScroll() {
      scrollPositions.set(key, el!.scrollTop)
    }

    el.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      el.removeEventListener("scroll", onScroll)
      scrollPositions.set(key, el.scrollTop)
    }
  }, [key])

  return ref
}
