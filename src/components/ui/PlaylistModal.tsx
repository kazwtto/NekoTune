import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useUiStore } from "../../stores/uiStore"
import { useLibraryStore } from "../../stores/libraryStore"
import Modal from "./Modal"
import { Camera, Check, ListMusic, Heart, Star, Sparkles, Moon, Sun, Cloud, Zap, Flame, Droplet, Music, Headphones, Radio, Mic, Coffee, Activity } from "lucide-react"
import { open } from "@tauri-apps/plugin-dialog"
import { appDataDir, join } from "@tauri-apps/api/path"
import { copyFile, mkdir, exists } from "@tauri-apps/plugin-fs"
import { proxyUrl } from "../../services/proxy"

const ICONS = [
  { id: "list-music", icon: ListMusic },
  { id: "heart", icon: Heart },
  { id: "star", icon: Star },
  { id: "sparkles", icon: Sparkles },
  { id: "moon", icon: Moon },
  { id: "sun", icon: Sun },
  { id: "cloud", icon: Cloud },
  { id: "zap", icon: Zap },
  { id: "flame", icon: Flame },
  { id: "droplet", icon: Droplet },
  { id: "music", icon: Music },
  { id: "headphones", icon: Headphones },
  { id: "radio", icon: Radio },
  { id: "mic", icon: Mic },
  { id: "coffee", icon: Coffee },
  { id: "activity", icon: Activity },
]

const COLORS = [
  "#2563eb", "#db2777", "#ea580c", "#16a34a", 
  "#9333ea", "#0891b2", "#e11d48", "#ca8a04"
]

export default function PlaylistModal() {
  const { t } = useTranslation()
  const visible = useUiStore((s) => s.playlistModalVisible)
  const editingId = useUiStore((s) => s.editingPlaylistId)
  const setVisible = useUiStore((s) => s.setPlaylistModalVisible)
  
  const playlists = useLibraryStore((s) => s.playlists)
  const createPlaylist = useLibraryStore((s) => s.createPlaylist)
  const updatePlaylist = useLibraryStore((s) => s.updatePlaylist)

  const [title, setTitle] = useState("")
  const [image, setImage] = useState("")
  const [color, setColor] = useState(COLORS[0])
  const [icon, setIcon] = useState("list-music")
  
  useEffect(() => {
    if (visible) {
      if (editingId) {
        const pl = playlists.find(p => p.id === editingId)
        if (pl) {
          setTitle(pl.title)
          setImage(pl.image || "")
          setColor(pl.color || COLORS[0])
          setIcon(pl.icon || "list-music")
        }
      } else {
        setTitle("")
        setImage("")
        setColor(COLORS[0])
        setIcon("list-music")
      }
    }
  }, [visible, editingId, playlists])

  function handleClose() {
    setVisible(false)
  }

  function handleSave() {
    if (!title.trim()) return

    if (editingId) {
      updatePlaylist(editingId, {
        title: title.trim(),
        image: image.trim() || undefined,
        color,
        icon
      })
    } else {
      createPlaylist({
        title: title.trim(),
        image: image.trim() || undefined,
        color,
        icon
      })
    }
    handleClose()
  }

  async function handlePickImage() {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg", "webp"] }]
      })
      if (selected && typeof selected === "string") {
        const appData = await appDataDir()
        const playlistsDir = await join(appData, "playlists")
        
        const dirExists = await exists(playlistsDir)
        if (!dirExists) {
          await mkdir(playlistsDir, { recursive: true })
        }
        
        const fileName = `pl-img-${Date.now()}-${selected.split(/[\\/]/).pop()}`
        const targetPath = await join(playlistsDir, fileName)
        
        await copyFile(selected, targetPath)
        setImage(targetPath)
      }
    } catch (e) {
      console.error("Failed to pick image:", e)
    }
  }

  const SelectedIcon = ICONS.find(i => i.id === icon)?.icon || ListMusic

  return (
    <Modal open={visible} onClose={handleClose} title={editingId ? t("common.editPlaylist") : t("common.createPlaylist")} width={400}>
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-primary">
          {editingId ? t("common.editPlaylist") : t("common.createPlaylist")}
        </h2>

        <div className="flex gap-4">
          <div 
            onClick={handlePickImage}
            className="relative flex h-24 w-24 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl shadow-lg transition-transform hover:scale-105"
            style={{ backgroundColor: !image ? color : undefined }}
            title={t("common.imageUrl")}
          >
            {image ? (
              <img src={proxyUrl(image)} alt="" className="h-full w-full object-cover" />
            ) : (
              <SelectedIcon size={40} className="text-white drop-shadow-md" />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
              <Camera size={24} className="text-white" />
            </div>
          </div>

          <div className="flex flex-col justify-center flex-1">
            <label className="mb-1 block text-xs font-medium text-secondary">{t("common.title")}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("common.playlistTitle")}
              className="w-full rounded-lg bg-bg-base border border-white/10 px-3 py-2 text-sm text-primary outline-none focus:border-accent"
              autoFocus
            />
          </div>
        </div>

        {!image && (
          <div className="rounded-xl border border-white/5 bg-surface/30">
            <div className="flex items-center justify-between p-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                {t("common.color")}
              </span>
              <div className="flex gap-1.5">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full transition-all hover:scale-110"
                    style={{ 
                      backgroundColor: c,
                      boxShadow: color === c ? `0 0 0 2px ${c}40` : "none"
                    }}
                  >
                    {color === c && <Check size={10} className="text-white drop-shadow-md" />}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mx-3 h-px bg-white/5" />
            
            <div className="flex items-center justify-between p-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                {t("common.icon")}
              </span>
              <div className="flex max-w-[260px] flex-wrap justify-end gap-1">
                {ICONS.map(({ id, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setIcon(id)}
                    className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-colors ${
                      icon === id ? "bg-white/10 text-primary ring-1 ring-white/20" : "text-secondary hover:bg-white/5 hover:text-primary"
                    }`}
                  >
                    <Icon size={14} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-2 flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-secondary hover:bg-white/5 cursor-pointer"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {t("common.save")}
          </button>
        </div>
      </div>
    </Modal>
  )
}
