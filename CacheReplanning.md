# Replanejamento do Sistema de Cache — NekoTune v3

## 1. Princípios de Design

### 1.1 Backend Decoplado
O módulo `cache.rs` é **completamente independente**:
- **NÃO** importa de `api::innertube`
- **NÃO** importa de `ytdlp`
- **NÃO** importa de `proxy`
- Usa apenas: `reqwest`, `std::fs`, `serde`, `image` (para re-encoding)
- O yt-dlp é chamado diretamente via `std::process::Command` (mesmo padrão de `download.rs`)
- O `lib.rs` é o único que conecta: `cache::audio_get_path()` é chamado no `cmd_*`

### 1.2 Frontend Decoplado
Cada service de cache é um módulo TypeScript isolado:
- `audioCache.ts` — chama comandos `cmd_audio_cache_*` via `invoke()`
- `imageCacheService.ts` — chama comandos `cmd_image_cache_*` via `invoke()`
- Nenhum importa do outro
- Nenhum importa de `innertube.ts` ou `player.ts`
- Os hooks (`useCachedImage`) compõem os services

### 1.3 Tudo Configurável

| Setting | Opções | Efeito |
|---|---|---|
| `audioCache.format` | `mp3`, `flac`, `ogg`, `wav` | Formato do arquivo cacheado |
| `audioCache.quality` | `low`, `medium`, `high`, `best` | Bitrate do áudio |
| `imageCache.format` | `jpg`, `png`, `webp` | Formato da imagem cacheada |
| `imageCache.quality` | `low`, `medium`, `high` | Qualidade/compressão |

---

## 2. Localização no Disco

```
%APPDATA%\nekotune\cache\              (app_config_dir)
├── audio/
│   ├── {video_id}.mp3                 (ou .flac/.ogg/.wav conforme setting)
│   └── ...
├── audio_index.json
├── images/
│   ├── {hash}.jpg                     (ou .png/.webp conforme setting)
│   └── ...
└── images_index.json
```

**Resolução no Windows:** `C:\Users\{user}\AppData\Roaming\nekotune\cache\`

---

## 3. Configurações

### 3.1 Types: `src/types/settings.ts`

```typescript
export type ThemeMode = "dark" | "light" | "pure-black"

export type CacheAudioFormat = "mp3" | "flac" | "ogg" | "wav"
export type CacheAudioQuality = "low" | "medium" | "high" | "best"
export type CacheImageFormat = "jpg" | "png" | "webp"
export type CacheImageQuality = "low" | "medium" | "high"

export interface AudioCacheSettings {
  enabled: boolean
  format: CacheAudioFormat
  quality: CacheAudioQuality
  maxEntries: number
  maxStorageMB: number
}

export interface ImageCacheSettings {
  enabled: boolean
  format: CacheImageFormat
  quality: CacheImageQuality
  maxEntries: number
  maxStorageMB: number
}

export interface PrefetchCacheSettings {
  enabled: boolean
  prefetchCount: number
  delayMs: number
}

export interface SongMetadataCacheSettings {
  enabled: boolean
  maxEntries: number
  ttlDays: number
}

export interface ListBufferSettings {
  enabled: boolean
  maxEntries: number
  ttlHomeFeed: number
  ttlExplore: number
  ttlPlaylist: number
  ttlAlbum: number
  ttlArtist: number
  ttlSearch: number
}

export interface AppSettings {
  theme: ThemeMode
  accentColor: string
  hideScrollbar: boolean
  language: string
  audioQuality: "low" | "medium" | "high"
  crossfade: number
  enableNormalization: boolean
  enableSkipSilence: boolean
  autoPlay: boolean
  autoSkipOnError: boolean
  musicFolder: string
  downloadFolder: string
  downloadFormat: "mp3" | "flac" | "ogg" | "wav"
  downloadQuality: "low" | "medium" | "high" | "best"
  audioCache: AudioCacheSettings
  imageCache: ImageCacheSettings
  prefetchCache: PrefetchCacheSettings
  songMetadataCache: SongMetadataCacheSettings
  listBuffer: ListBufferSettings
}
```

### 3.2 Defaults: `src/stores/settingsStore.ts`

```typescript
const defaultSettings: AppSettings = {
  // ... existentes ...
  audioCache: {
    enabled: true,
    format: "mp3",
    quality: "high",
    maxEntries: 50,
    maxStorageMB: 500,
  },
  imageCache: {
    enabled: true,
    format: "jpg",
    quality: "high",
    maxEntries: 200,
    maxStorageMB: 100,
  },
  prefetchCache: {
    enabled: true,
    prefetchCount: 2,
    delayMs: 2000,
  },
  songMetadataCache: {
    enabled: true,
    maxEntries: 500,
    ttlDays: 7,
  },
  listBuffer: {
    enabled: true,
    maxEntries: 30,
    ttlHomeFeed: 30,
    ttlExplore: 60,
    ttlPlaylist: 120,
    ttlAlbum: 720,
    ttlArtist: 360,
    ttlSearch: 15,
  },
}
```

### 3.3 Mapeamento Qualidade → Args

**Áudio (yt-dlp --audio-quality):**

| Setting | yt-dlp arg | Bitrate aprox. | Tamanho ~5min |
|---|---|---|---|
| `low` | `5` | ~96 kbps | ~3.5 MB |
| `medium` | `3` | ~128 kbps | ~4.7 MB |
| `high` | `1` | ~192 kbps | ~7 MB |
| `best` | `0` | ~320 kbps | ~11.7 MB |

**Imagem (re-encoding via `image` crate):**

| Setting | JPEG quality | PNG compression | Tamanho aprox. |
|---|---|---|---|
| `low` | 50 | fast | ~5-10 KB |
| `medium` | 75 | default | ~15-30 KB |
| `high` | 92 | best | ~30-80 KB |

---

## 4. Backend: `src-tauri/src/cache.rs`

### 4.1 Estrutura

```
cache.rs (completamente independente)
├── mod cache_index         (LRU index serializado em JSON)
├── mod audio_cache         (get_path, store, evict, clear, stats)
├── mod image_cache         (get_path, store, evict, clear, stats)
└── pub use                 (apenas funções públicas para lib.rs)
```

### 4.2 API Pública (funções chamadas por lib.rs)

```rust
// ── Áudio ──────────────────────────────────────────────────
pub fn audio_get_path(app: &AppHandle, video_id: &str) -> Option<String>
pub fn audio_store(app: &AppHandle, video_id: &str, data: &[u8]) -> String
pub fn audio_remove(app: &AppHandle, video_id: &str)
pub fn audio_evict(app: &AppHandle)
pub fn audio_clear(app: &AppHandle)
pub fn audio_stats(app: &AppHandle) -> CacheStats
pub async fn audio_download(app: &AppHandle, video_id: &str, format: &str, quality: &str) -> Result<String, String>

// ── Imagem ─────────────────────────────────────────────────
pub fn image_get_path(app: &AppHandle, url: &str) -> Option<String>
pub fn image_store(app: &AppHandle, url: &str, data: &[u8]) -> String
pub fn image_evict(app: &AppHandle)
pub fn image_clear(app: &AppHandle)
pub fn image_stats(app: &AppHandle) -> CacheStats
pub async fn image_download(app: &AppHandle, url: &str, format: &str, quality: &str) -> Result<String, String>
```

### 4.3 Dependências Rust (adicionar em Cargo.toml)

```toml
image = "0.25"           # re-encoding de imagens
uuid = { version = "1", features = ["v4"] }  # hashes únicos para imagens
```

### 4.4 Comandos Tauri (adicionar em lib.rs)

```rust
// Áudio
cmd_audio_cache_get_path(app, video_id) → Option<String>
cmd_audio_cache_store(app, video_id, data: Vec<u8>) → String
cmd_audio_cache_remove(app, video_id)
cmd_audio_cache_clear(app)
cmd_audio_cache_stats(app) → CacheStats
cmd_audio_cache_download(app, video_id, format, quality) → String

// Imagem
cmd_image_cache_get_path(app, url) → Option<String>
cmd_image_cache_store(app, url, data: Vec<u8>) → String
cmd_image_cache_clear(app)
cmd_image_cache_stats(app) → CacheStats
cmd_image_cache_download(app, url, format, quality) → String
```

---

## 5. Frontend: Services

### 5.1 `src/services/audioCache.ts`

```typescript
import { invoke } from "@tauri-apps/api/core"
import { proxyUrl } from "./proxy"

class AudioCacheService {
  async getPath(videoId: string): Promise<string | null> {
    try { return await invoke("cmd_audio_cache_get_path", { videoId }) }
    catch { return null }
  }

  async getCachedUrl(videoId: string): Promise<string | null> {
    const path = await this.getPath(videoId)
    return path ? proxyUrl(path) ?? null : null
  }

  async store(videoId: string, data: number[]): Promise<string> {
    return invoke("cmd_audio_cache_store", { videoId, data })
  }

  async download(videoId: string, format: string, quality: string): Promise<string> {
    return invoke("cmd_audio_cache_download", { videoId, format, quality })
  }

  async remove(videoId: string): Promise<void> {
    await invoke("cmd_audio_cache_remove", { videoId })
  }

  async clear(): Promise<void> {
    await invoke("cmd_audio_cache_clear")
  }

  async stats(): Promise<{ count: number; totalBytes: number }> {
    return invoke("cmd_audio_cache_stats")
  }
}

export const audioCache = new AudioCacheService()
```

### 5.2 `src/services/imageCacheService.ts`

```typescript
import { invoke } from "@tauri-apps/api/core"
import { proxyUrl } from "./proxy"

class ImageCacheService {
  async getPath(url: string): Promise<string | null> {
    try { return await invoke("cmd_image_cache_get_path", { url }) }
    catch { return null }
  }

  async getCachedUrl(url: string): Promise<string | null> {
    const path = await this.getPath(url)
    return path ? proxyUrl(path) ?? null : null
  }

  async store(url: string, data: number[]): Promise<string> {
    return invoke("cmd_image_cache_store", { url, data })
  }

  async download(url: string, format: string, quality: string): Promise<string> {
    return invoke("cmd_image_cache_download", { url, format, quality })
  }

  async clear(): Promise<void> {
    await invoke("cmd_image_cache_clear")
  }

  async stats(): Promise<{ count: number; totalBytes: number }> {
    return invoke("cmd_image_cache_stats")
  }
}

export const imageCacheService = new ImageCacheService()
```

### 5.3 `src/hooks/useCachedImage.ts`

```typescript
import { useState, useEffect } from "react"
import { imageCacheService } from "../services/imageCacheService"
import { proxyUrl } from "../services/proxy"
import { useSettingsStore } from "../stores/settingsStore"

export function useCachedImage(originalUrl: string | undefined | null): string | undefined {
  const [src, setSrc] = useState<string | undefined>(undefined)
  const imageCacheSettings = useSettingsStore((s) => s.settings.imageCache)

  useEffect(() => {
    if (!originalUrl || !imageCacheSettings.enabled) {
      setSrc(originalUrl ? proxyUrl(originalUrl) : undefined)
      return
    }

    let cancelled = false

    async function resolve() {
      const cachedPath = await imageCacheService.getPath(originalUrl)
      if (cancelled) return

      if (cachedPath) {
        setSrc(proxyUrl(cachedPath))
        return
      }

      const remoteProxy = proxyUrl(originalUrl)
      if (cancelled) return
      setSrc(remoteProxy)

      if (remoteProxy) {
        try {
          const response = await fetch(remoteProxy)
          if (!cancelled && response.ok) {
            const buffer = await response.arrayBuffer()
            const bytes = Array.from(new Uint8Array(buffer))
            if (!cancelled) {
              await imageCacheService.download(
                originalUrl,
                imageCacheSettings.format,
                imageCacheSettings.quality
              )
            }
          }
        } catch {}
      }
    }

    resolve()
    return () => { cancelled = true }
  }, [originalUrl, imageCacheSettings.enabled, imageCacheSettings.format, imageCacheSettings.quality])

  return src
}
```

---

## 6. CacheSection UI

```
⚙ Settings > Cache
│
├── 🔊 Cache de Áudio ──────────────────────────────────
│   ├── [Toggle] Ativar
│   ├── [Dropdown] Formato: MP3 | FLAC | OGG | WAV
│   ├── [Dropdown] Qualidade: Baixa | Média | Alta | Máxima
│   ├── [Slider] Máximo de músicas: 10 ──── 200
│   ├── [Slider] Armazenamento: 100MB ──── 2GB
│   └── Stats: 42 músicas | 187.3 MB    [Limpar]
│
├── 🖼 Cache de Imagens ────────────────────────────────
│   ├── [Toggle] Ativar
│   ├── [Dropdown] Formato: JPG | PNG | WebP
│   ├── [Dropdown] Qualidade: Baixa | Média | Alta
│   ├── [Slider] Máximo de imagens: 50 ── 500
│   ├── [Slider] Armazenamento: 10MB ──── 500MB
│   └── Stats: 156 imagens | 12.4 MB    [Limpar]
│
├── 📋 Cache de Metadados ──────────────────────────────
│   ├── [Toggle] Ativar
│   ├── [Slider] Máximo: 100 ──── 1000
│   └── [Slider] Expiração: 1 ──── 30 dias
│
├── 📦 Buffer de Listas ────────────────────────────────
│   ├── [Toggle] Ativar
│   └── [Slider] Máximo: 10 ──── 100
│
└── ⏩ Pré-carregamento ────────────────────────────────
    ├── [Toggle] Ativar
    ├── [Slider] Músicas: 0 ──── 5
    └── [Slider] Intervalo: 0.5s ── 5s
```

---

## 7. Arquivos a Criar/Modificar/Deletar

### Criar (Backend — independente)

| Arquivo | Responsabilidade |
|---|---|
| `src-tauri/src/cache.rs` | Módulo completo de cache (audio + image) |

### Criar (Frontend — independentes)

| Arquivo | Responsabilidade |
|---|---|
| `src/services/audioCache.ts` | Service de áudio cache |
| `src/services/imageCacheService.ts` | Service de imagem cache |
| `src/services/listBuffer.ts` | Buffer de listas |
| `src/services/cacheInvalidation.ts` | Invalidação centralizada |
| `src/hooks/useCachedImage.ts` | Hook de imagem cacheada |

### Reescrever

| Arquivo | Mudança |
|---|---|
| `src/utils/songCache.ts` | SongMetadataCache |
| `src/types/settings.ts` | Novos types (format/quality) |
| `src/stores/settingsStore.ts` | Novos defaults |
| `src/components/settings/CacheSection.tsx` | 5 seções com dropdowns |
| `src/i18n/locales/en-US.json` | Novas chaves |
| `src/i18n/locales/pt-BR.json` | Novas chaves |

### Modificar

| Arquivo | Mudança |
|---|---|
| `src-tauri/src/lib.rs` | `mod cache` + comandos |
| `src-tauri/Cargo.toml` | `image = "0.25"` |
| `src/services/player.ts` | Usar AudioCache |
| `src/hooks/usePrefetch.ts` | Usar AudioCache |
| `src/hooks/useInnertube.ts` | Integrar ListBuffer |
| `src/components/media/*.tsx` | useCachedImage |

### Deletar

| Arquivo | Motivo |
|---|---|
| `src/services/cache.ts` | Dead code |
| `src/services/streamCache.ts` | Substituído por AudioCache |

---

*Documento gerado em 2026-06-17 para o projeto NekoTune v3.*
