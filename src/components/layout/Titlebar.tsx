import { useState, useEffect } from "react"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { Cat, Minus, Square, X, Maximize2 } from "lucide-react"
import { APP_NAME } from "../../utils/constants"

const appWindow = getCurrentWindow()

export default function Titlebar() {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    appWindow.isMaximized().then(setIsMaximized)
    const unlisten = appWindow.listen("tauri://resize", () => {
      appWindow.isMaximized().then(setIsMaximized)
    })
    return () => { unlisten.then((fn) => fn()) }
  }, [])

  return (
    <div className="flex h-8 items-center justify-between border-b border-border bg-black/95">
      <div className="flex flex-1 items-center gap-2 px-3" data-tauri-drag-region>
        <div className="flex h-5 w-5 items-center justify-center rounded bg-accent-muted">
          <Cat size={12} className="text-accent" />
        </div>
        <span className="text-xs font-semibold tracking-wide text-secondary">
          {APP_NAME}
        </span>
      </div>

      <div className="flex h-full">
        <button
          onClick={() => appWindow.minimize()}
          className="flex h-full w-11 cursor-pointer items-center justify-center text-secondary transition-colors duration-100 hover:bg-white/10 hover:text-primary"
        >
          <Minus size={14} />
        </button>
        <button
          onClick={() => appWindow.toggleMaximize()}
          className="flex h-full w-11 cursor-pointer items-center justify-center text-secondary transition-colors duration-100 hover:bg-white/10 hover:text-primary"
        >
          {isMaximized ? <Square size={11} /> : <Maximize2 size={13} />}
        </button>
        <button
          onClick={() => appWindow.close()}
          className="flex h-full w-11 cursor-pointer items-center justify-center text-secondary transition-colors duration-100 hover:bg-red-600 hover:text-white"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
