import { useSettingsStore } from "../../stores/settingsStore"
import { useTranslation } from "react-i18next"
import Toggle from "./Toggle"
import { streamCache } from "../../services/streamCache"
import { useState } from "react"

export default function CacheSection() {
  const { t } = useTranslation()
  const { settings, updateSettings } = useSettingsStore()
  const { streamCache: sc, prefetchCache: pc } = settings
  const [stats, setStats] = useState(streamCache.stats)

  function refreshStats() {
    setStats(streamCache.stats)
  }

  function handleClearCache() {
    streamCache.clear()
    setStats(streamCache.stats)
  }

  return (
    <div className="flex flex-col gap-8 px-4">
      <div>
        <h3 className="mb-5 text-xs font-semibold text-secondary">{t("settings.streamCache")}</h3>
        <div className="ml-3 divide-y divide-border">
          <Toggle
            label={t("settings.streamCacheEnabled")}
            description={t("settings.streamCacheEnabledDesc")}
            checked={sc.enabled}
            onChange={(v) => updateSettings({ streamCache: { ...sc, enabled: v } })}
          />
        </div>

        {sc.enabled && (
          <div className="ml-3 mt-6 flex flex-col gap-6">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-muted">{t("settings.streamCacheTtl")}</span>
                <span className="text-sm font-semibold tabular-nums text-accent">
                  {sc.ttlMinutes >= 60 ? `${sc.ttlMinutes / 60}h` : `${sc.ttlMinutes}min`}
                </span>
              </div>
              <input
                type="range"
                min={30}
                max={360}
                step={30}
                value={sc.ttlMinutes}
                onChange={(e) => updateSettings({ streamCache: { ...sc, ttlMinutes: Number(e.target.value) } })}
                className="w-full"
              />
              <div className="mt-1.5 flex justify-between text-[11px] text-muted">
                <span>30min</span>
                <span>6h</span>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-muted">{t("settings.streamCacheMaxEntries")}</span>
                <span className="text-sm font-semibold tabular-nums text-accent">{sc.maxEntries}</span>
              </div>
              <input
                type="range"
                min={10}
                max={200}
                step={10}
                value={sc.maxEntries}
                onChange={(e) => updateSettings({ streamCache: { ...sc, maxEntries: Number(e.target.value) } })}
                className="w-full"
              />
              <div className="mt-1.5 flex justify-between text-[11px] text-muted">
                <span>10</span>
                <span>200</span>
              </div>
            </div>

            <div
              className="flex cursor-pointer items-center justify-between rounded-lg bg-bg-hover px-4 py-3"
              onClick={refreshStats}
            >
              <div className="flex gap-4 text-xs text-muted">
                <span>
                  {t("settings.cacheEntries")}: <span className="font-semibold text-primary">{stats.size}</span>
                </span>
                <span>
                  {t("settings.cacheHits")}: <span className="font-semibold text-accent">{stats.hits}</span>
                </span>
                <span>
                  {t("settings.cacheMisses")}: <span className="font-semibold text-primary">{stats.misses}</span>
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleClearCache()
                }}
                className="cursor-pointer text-xs text-secondary transition-colors hover:text-primary"
              >
                {t("settings.clearCache")}
              </button>
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
              <input
                type="range"
                min={0}
                max={5}
                step={1}
                value={pc.prefetchCount}
                onChange={(e) => updateSettings({ prefetchCache: { ...pc, prefetchCount: Number(e.target.value) } })}
                className="w-full"
              />
              <div className="mt-1.5 flex justify-between text-[11px] text-muted">
                <span>{t("settings.off")}</span>
                <span>5</span>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-muted">{t("settings.prefetchDelay")}</span>
                <span className="text-sm font-semibold tabular-nums text-accent">{pc.delayMs / 1000}s</span>
              </div>
              <input
                type="range"
                min={500}
                max={5000}
                step={500}
                value={pc.delayMs}
                onChange={(e) => updateSettings({ prefetchCache: { ...pc, delayMs: Number(e.target.value) } })}
                className="w-full"
              />
              <div className="mt-1.5 flex justify-between text-[11px] text-muted">
                <span>0.5s</span>
                <span>5s</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
