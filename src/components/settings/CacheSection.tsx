import { useSettingsStore } from "../../stores/settingsStore"
import { useTranslation } from "react-i18next"
import Toggle from "./Toggle"
import Dropdown from "../ui/Dropdown"
import { audioCache } from "../../services/audioCache"
import { imageCacheService } from "../../services/imageCacheService"
import { useState, useEffect } from "react"

export default function CacheSection() {
  const { t } = useTranslation()
  const { settings, updateSettings } = useSettingsStore()
  const { audioCache: ac, imageCache: ic, prefetchCache: pc, songMetadataCache: smc, listBuffer: lb } = settings

  const [audioStats, setAudioStats] = useState<{ count: number; totalBytes: number } | null>(null)
  const [imageStats, setImageStats] = useState<{ count: number; totalBytes: number } | null>(null)

  useEffect(() => {
    audioCache.stats().then(setAudioStats).catch(() => setAudioStats({ count: 0, totalBytes: 0 }))
    imageCacheService.stats().then(setImageStats).catch(() => setImageStats({ count: 0, totalBytes: 0 }))
  }, [])

  async function refreshStats() {
    const a = await audioCache.stats().catch(() => ({ count: 0, totalBytes: 0 }))
    const i = await imageCacheService.stats().catch(() => ({ count: 0, totalBytes: 0 }))
    setAudioStats(a)
    setImageStats(i)
  }

  function formatBytes(bytes: number): string {
    if (!bytes || bytes === 0) return "0 B"
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="flex flex-col gap-8 px-4">

      <div>
        <h3 className="mb-5 text-xs font-semibold text-secondary">{t("settings.audioCache")}</h3>
        <div className="ml-3 divide-y divide-border">
          <Toggle
            label={t("settings.audioCacheEnabled")}
            description={t("settings.audioCacheEnabledDesc")}
            checked={ac.enabled}
            onChange={(v) => updateSettings({ audioCache: { ...ac, enabled: v } })}
          />
        </div>

        {ac.enabled && (
          <div className="ml-3 mt-6 flex flex-col gap-6">
            <div className="flex gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <span className="text-sm font-medium text-primary">{t("settings.audioCacheFormat")}</span>
                <Dropdown
                  value={ac.format}
                  options={[
                    { value: "mp3", label: "MP3" },
                    { value: "flac", label: "FLAC" },
                    { value: "ogg", label: "OGG" },
                    { value: "wav", label: "WAV" },
                  ]}
                  onChange={(v) => updateSettings({ audioCache: { ...ac, format: v as any } })}
                />
              </div>

              <div className="flex flex-col gap-2 flex-1">
                <span className="text-sm font-medium text-primary">{t("settings.audioCacheQuality")}</span>
                <Dropdown
                  value={ac.quality}
                  options={[
                    { value: "low", label: t("settings.qualityLow") },
                    { value: "medium", label: t("settings.qualityMedium") },
                    { value: "high", label: t("settings.qualityHigh") },
                    { value: "best", label: t("settings.qualityBest") },
                  ]}
                  onChange={(v) => updateSettings({ audioCache: { ...ac, quality: v as any } })}
                />
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-muted">{t("settings.audioCacheMaxEntries")}</span>
                <span className="text-sm font-semibold tabular-nums text-accent">{ac.maxEntries}</span>
              </div>
              <input type="range" min={10} max={200} step={10} value={ac.maxEntries}
                onChange={(e) => updateSettings({ audioCache: { ...ac, maxEntries: Number(e.target.value) } })}
                className="w-full" />
              <div className="mt-1.5 flex justify-between text-[11px] text-muted"><span>10</span><span>200</span></div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-muted">{t("settings.audioCacheMaxStorage")}</span>
                <span className="text-sm font-semibold tabular-nums text-accent">{ac.maxStorageMb} MB</span>
              </div>
              <input type="range" min={100} max={2000} step={100} value={ac.maxStorageMb}
                onChange={(e) => updateSettings({ audioCache: { ...ac, maxStorageMb: Number(e.target.value) } })}
                className="w-full" />
              <div className="mt-1.5 flex justify-between text-[11px] text-muted"><span>100 MB</span><span>2 GB</span></div>
            </div>

            <div className="flex cursor-pointer items-center justify-between rounded-lg bg-bg-hover px-4 py-3" onClick={refreshStats}>
              <div className="flex gap-4 text-xs text-muted">
                <span>{t("settings.cacheEntries")}: <span className="font-semibold text-primary">{audioStats?.count ?? 0}</span></span>
                <span>{t("settings.cacheSize")}: <span className="font-semibold text-accent">{formatBytes(audioStats?.totalBytes ?? 0)}</span></span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); audioCache.clear().then(refreshStats) }}
                className="cursor-pointer text-xs text-secondary transition-colors hover:text-primary">
                {t("settings.clearCache")}
              </button>
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-5 text-xs font-semibold text-secondary">{t("settings.imageCache")}</h3>
        <div className="ml-3 divide-y divide-border">
          <Toggle
            label={t("settings.imageCacheEnabled")}
            description={t("settings.imageCacheEnabledDesc")}
            checked={ic.enabled}
            onChange={(v) => updateSettings({ imageCache: { ...ic, enabled: v } })}
          />
        </div>

        {ic.enabled && (
          <div className="ml-3 mt-6 flex flex-col gap-6">
            <div className="flex gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <span className="text-sm font-medium text-primary">{t("settings.imageCacheFormat")}</span>
                <Dropdown
                  value={ic.format}
                  options={[
                    { value: "jpg", label: "JPEG" },
                    { value: "png", label: "PNG" },
                    { value: "webp", label: "WebP" },
                  ]}
                  onChange={(v) => updateSettings({ imageCache: { ...ic, format: v as any } })}
                />
              </div>

              <div className="flex flex-col gap-2 flex-1">
                <span className="text-sm font-medium text-primary">{t("settings.imageCacheQuality")}</span>
                <Dropdown
                  value={ic.quality}
                  options={[
                    { value: "low", label: t("settings.qualityLow") },
                    { value: "medium", label: t("settings.qualityMedium") },
                    { value: "high", label: t("settings.qualityHigh") },
                  ]}
                  onChange={(v) => updateSettings({ imageCache: { ...ic, quality: v as any } })}
                />
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-muted">{t("settings.imageCacheMaxEntries")}</span>
                <span className="text-sm font-semibold tabular-nums text-accent">{ic.maxEntries}</span>
              </div>
              <input type="range" min={50} max={500} step={50} value={ic.maxEntries}
                onChange={(e) => updateSettings({ imageCache: { ...ic, maxEntries: Number(e.target.value) } })}
                className="w-full" />
              <div className="mt-1.5 flex justify-between text-[11px] text-muted"><span>50</span><span>500</span></div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-muted">{t("settings.imageCacheMaxStorage")}</span>
                <span className="text-sm font-semibold tabular-nums text-accent">{ic.maxStorageMb} MB</span>
              </div>
              <input type="range" min={10} max={500} step={10} value={ic.maxStorageMb}
                onChange={(e) => updateSettings({ imageCache: { ...ic, maxStorageMb: Number(e.target.value) } })}
                className="w-full" />
              <div className="mt-1.5 flex justify-between text-[11px] text-muted"><span>10 MB</span><span>500 MB</span></div>
            </div>

            <div className="flex cursor-pointer items-center justify-between rounded-lg bg-bg-hover px-4 py-3" onClick={refreshStats}>
              <div className="flex gap-4 text-xs text-muted">
                <span>{t("settings.cacheEntries")}: <span className="font-semibold text-primary">{imageStats?.count ?? 0}</span></span>
                <span>{t("settings.cacheSize")}: <span className="font-semibold text-accent">{formatBytes(imageStats?.totalBytes ?? 0)}</span></span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); imageCacheService.clear().then(refreshStats) }}
                className="cursor-pointer text-xs text-secondary transition-colors hover:text-primary">
                {t("settings.clearCache")}
              </button>
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-5 text-xs font-semibold text-secondary">{t("settings.songMetadataCache")}</h3>
        <div className="ml-3 divide-y divide-border">
          <Toggle
            label={t("settings.songMetadataCacheEnabled")}
            description={t("settings.songMetadataCacheEnabledDesc")}
            checked={smc.enabled}
            onChange={(v) => updateSettings({ songMetadataCache: { ...smc, enabled: v } })}
          />
        </div>
        {smc.enabled && (
          <div className="ml-3 mt-6 flex flex-col gap-6">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-muted">{t("settings.songMetadataMaxEntries")}</span>
                <span className="text-sm font-semibold tabular-nums text-accent">{smc.maxEntries}</span>
              </div>
              <input type="range" min={100} max={1000} step={100} value={smc.maxEntries}
                onChange={(e) => updateSettings({ songMetadataCache: { ...smc, maxEntries: Number(e.target.value) } })}
                className="w-full" />
              <div className="mt-1.5 flex justify-between text-[11px] text-muted"><span>100</span><span>1000</span></div>
            </div>
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-muted">{t("settings.songMetadataTtl")}</span>
                <span className="text-sm font-semibold tabular-nums text-accent">{smc.ttlDays}d</span>
              </div>
              <input type="range" min={1} max={30} step={1} value={smc.ttlDays}
                onChange={(e) => updateSettings({ songMetadataCache: { ...smc, ttlDays: Number(e.target.value) } })}
                className="w-full" />
              <div className="mt-1.5 flex justify-between text-[11px] text-muted"><span>1d</span><span>30d</span></div>
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-5 text-xs font-semibold text-secondary">{t("settings.listBuffer")}</h3>
        <div className="ml-3 divide-y divide-border">
          <Toggle
            label={t("settings.listBufferEnabled")}
            description={t("settings.listBufferEnabledDesc")}
            checked={lb.enabled}
            onChange={(v) => updateSettings({ listBuffer: { ...lb, enabled: v } })}
          />
        </div>
        {lb.enabled && (
          <div className="ml-3 mt-6">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-muted">{t("settings.listBufferMaxEntries")}</span>
                <span className="text-sm font-semibold tabular-nums text-accent">{lb.maxEntries}</span>
              </div>
              <input type="range" min={10} max={100} step={5} value={lb.maxEntries}
                onChange={(e) => updateSettings({ listBuffer: { ...lb, maxEntries: Number(e.target.value) } })}
                className="w-full" />
              <div className="mt-1.5 flex justify-between text-[11px] text-muted"><span>10</span><span>100</span></div>
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-5 text-xs font-semibold text-secondary">{t("settings.prefetchCache")}</h3>
        <div className="ml-3 divide-y divide-border">
          <Toggle
            label={t("settings.prefetchEnabled")}
            description={t("settings.prefetchEnabledDesc")}
            checked={pc.enabled}
            onChange={(v) => updateSettings({ prefetchCache: { ...pc, enabled: v } })}
          />
        </div>
        {pc.enabled && (
          <div className="ml-3 mt-6 flex flex-col gap-6">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-muted">{t("settings.prefetchCount")}</span>
                <span className="text-sm font-semibold tabular-nums text-accent">
                  {pc.prefetchCount === 0 ? t("settings.off") : pc.prefetchCount}
                </span>
              </div>
              <input type="range" min={0} max={5} step={1} value={pc.prefetchCount}
                onChange={(e) => updateSettings({ prefetchCache: { ...pc, prefetchCount: Number(e.target.value) } })}
                className="w-full" />
              <div className="mt-1.5 flex justify-between text-[11px] text-muted"><span>{t("settings.off")}</span><span>5</span></div>
            </div>
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-muted">{t("settings.prefetchDelay")}</span>
                <span className="text-sm font-semibold tabular-nums text-accent">{pc.delayMs / 1000}s</span>
              </div>
              <input type="range" min={500} max={5000} step={500} value={pc.delayMs}
                onChange={(e) => updateSettings({ prefetchCache: { ...pc, delayMs: Number(e.target.value) } })}
                className="w-full" />
              <div className="mt-1.5 flex justify-between text-[11px] text-muted"><span>0.5s</span><span>5s</span></div>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
