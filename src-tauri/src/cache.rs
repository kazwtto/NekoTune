use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::sync::{LazyLock, Mutex};
use tauri::AppHandle;

// ═══════════════════════════════════════════════════════════════
// Cache Index (LRU)
// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Serialize, Deserialize, Clone)]
struct EntryMeta {
    path: String,
    size: u64,
    cached_at: u64,
    last_accessed: u64,
}

#[derive(Debug, Serialize, Deserialize, Default, Clone)]
struct CacheIndex {
    entries: HashMap<String, EntryMeta>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CacheStats {
    pub count: usize,
    pub total_bytes: u64,
}

static AUDIO_INDEX: LazyLock<Mutex<CacheIndex>> = LazyLock::new(|| Mutex::new(CacheIndex::default()));
static IMAGE_INDEX: LazyLock<Mutex<CacheIndex>> = LazyLock::new(|| Mutex::new(CacheIndex::default()));

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

fn now_ms() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64
}

fn cache_root(_app: &AppHandle) -> PathBuf {
    let dir = dirs_next::data_local_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("NekoTune")
        .join("cache");
    fs::create_dir_all(&dir).ok();
    dir
}

fn audio_dir(app: &AppHandle) -> PathBuf {
    let dir = cache_root(app).join("audio");
    fs::create_dir_all(&dir).ok();
    dir
}

fn image_dir(app: &AppHandle) -> PathBuf {
    let dir = cache_root(app).join("images");
    fs::create_dir_all(&dir).ok();
    dir
}

fn index_path(app: &AppHandle, kind: &str) -> PathBuf {
    cache_root(app).join(format!("{kind}_index.json"))
}

fn save_index(app: &AppHandle, kind: &str, index: &CacheIndex) {
    let path = index_path(app, kind);
    if let Ok(json) = serde_json::to_string_pretty(index) {
        fs::write(path, json).ok();
    }
}

fn url_hash(url: &str) -> String {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    let mut hasher = DefaultHasher::new();
    url.hash(&mut hasher);
    format!("{:016x}", hasher.finish())
}

fn detect_image_ext(data: &[u8]) -> &'static str {
    if data.len() >= 4 {
        if data[0] == 0x89 && data[1] == 0x50 && data[2] == 0x4E && data[3] == 0x47 {
            return "png";
        }
        if data[0] == 0xFF && data[1] == 0xD8 && data[2] == 0xFF {
            return "jpg";
        }
        if data.len() >= 12
            && data[0] == 0x52
            && data[1] == 0x49
            && data[2] == 0x46
            && data[3] == 0x46
            && data[8] == 0x57
            && data[9] == 0x45
            && data[10] == 0x42
            && data[11] == 0x50
        {
            return "webp";
        }
    }
    "jpg"
}

fn evict_lru(index: &mut CacheIndex, _dir: &PathBuf, max_entries: usize, max_bytes: u64) {
    // evict por count
    while index.entries.len() > max_entries {
        if let Some((oldest_key, oldest_meta)) = index
            .entries
            .iter()
            .min_by_key(|(_, e)| e.last_accessed)
            .map(|(k, v)| (k.clone(), v.clone()))
        {
            fs::remove_file(&oldest_meta.path).ok();
            index.entries.remove(&oldest_key);
        } else {
            break;
        }
    }

    // evict por tamanho
    let mut total: u64 = index.entries.values().map(|e| e.size).sum();
    while total > max_bytes && !index.entries.is_empty() {
        if let Some((oldest_key, oldest_meta)) = index
            .entries
            .iter()
            .min_by_key(|(_, e)| e.last_accessed)
            .map(|(k, v)| (k.clone(), v.clone()))
        {
            total = total.saturating_sub(oldest_meta.size);
            fs::remove_file(&oldest_meta.path).ok();
            index.entries.remove(&oldest_key);
        } else {
            break;
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// Audio Cache
// ═══════════════════════════════════════════════════════════════

pub fn audio_get_path(app: &AppHandle, video_id: &str) -> Option<String> {
    let mut index = AUDIO_INDEX.lock().unwrap();
    let result = index.entries.get(video_id).and_then(|entry| {
        let path = PathBuf::from(&entry.path);
        if path.exists() {
            Some(entry.path.clone())
        } else {
            None
        }
    });
    if result.is_some() {
        if let Some(entry) = index.entries.get_mut(video_id) {
            entry.last_accessed = now_ms();
        }
        save_index(app, "audio", &index);
        return result;
    }
    if index.entries.contains_key(video_id) {
        index.entries.remove(video_id);
        save_index(app, "audio", &index);
    }
    None
}

pub fn audio_remove(app: &AppHandle, video_id: &str) {
    let mut index = AUDIO_INDEX.lock().unwrap();
    if let Some(entry) = index.entries.remove(video_id) {
        fs::remove_file(&entry.path).ok();
    }
    save_index(app, "audio", &index);
}

pub fn audio_evict(app: &AppHandle) {
    let dir = audio_dir(app);
    let mut index = AUDIO_INDEX.lock().unwrap();
    evict_lru(&mut index, &dir, 200, 2 * 1024 * 1024 * 1024); // defaults: 200 entries, 2GB
    save_index(app, "audio", &index);
}

pub fn audio_evict_with_limits(app: &AppHandle, max_entries: usize, max_storage_mb: u64) {
    let dir = audio_dir(app);
    let mut index = AUDIO_INDEX.lock().unwrap();
    evict_lru(&mut index, &dir, max_entries, max_storage_mb * 1024 * 1024);
    save_index(app, "audio", &index);
}

pub fn audio_clear(app: &AppHandle) {
    let dir = audio_dir(app);
    fs::remove_dir_all(&dir).ok();
    fs::create_dir_all(&dir).ok();
    let mut index = AUDIO_INDEX.lock().unwrap();
    index.entries.clear();
    save_index(app, "audio", &index);
}

pub fn audio_stats(_app: &AppHandle) -> CacheStats {
    let index = AUDIO_INDEX.lock().unwrap();
    CacheStats {
        count: index.entries.len(),
        total_bytes: index.entries.values().map(|e| e.size).sum(),
    }
}

pub async fn audio_download(
    app: &AppHandle,
    video_id: &str,
    format: &str,
    quality: &str,
    max_entries: usize,
    max_storage_mb: u64,
) -> Result<String, String> {
    // check if already cached
    if let Some(path) = audio_get_path(app, video_id) {
        return Ok(path);
    }

    // ensure yt-dlp binaries
    let libs_dir = std::env::temp_dir().join("nekotune").join("libs");
    let output_dir = std::env::temp_dir().join("nekotune").join("output");
    fs::create_dir_all(&libs_dir).ok();
    fs::create_dir_all(&output_dir).ok();

    let _ = yt_dlp::Downloader::with_new_binaries(libs_dir.clone(), output_dir)
        .await
        .map_err(|e| format!("Failed to install yt-dlp: {e}"))?
        .build()
        .await
        .map_err(|e| format!("Failed to build downloader: {e}"))?;

    let ytdlp_exe = if cfg!(target_os = "windows") {
        "yt-dlp.exe"
    } else {
        "yt-dlp"
    };
    let ytdlp_path = libs_dir.join(ytdlp_exe);
    if !ytdlp_path.exists() {
        return Err("yt-dlp binary not found".to_string());
    }

    // quality mapping
    let audio_quality = match quality {
        "low" => "5",
        "medium" => "3",
        "high" => "1",
        "best" => "0",
        _ => "3",
    };

    let audio_format = match format {
        "flac" => "flac",
        "wav" => "wav",
        "ogg" => "opus",
        _ => "mp3",
    };

    let ext = match format {
        "flac" => "flac",
        "wav" => "wav",
        "ogg" => "ogg",
        _ => "mp3",
    };

    let cache_dir = audio_dir(app);
    let output_template = cache_dir.join(format!("{}.%(ext)s", video_id));
    let url = format!("https://www.youtube.com/watch?v={}", video_id);

    let mut cmd = std::process::Command::new(&ytdlp_path);
    cmd.arg(url)
        .arg("--extract-audio")
        .arg("--audio-format")
        .arg(audio_format)
        .arg("--audio-quality")
        .arg(audio_quality)
        .arg("--no-playlist")
        .arg("--js-runtimes")
        .arg("nodejs")
        .arg("--ffmpeg-location")
        .arg(&libs_dir)
        .arg("-o")
        .arg(&output_template);

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        cmd.creation_flags(CREATE_NO_WINDOW);
    }

    let output = cmd
        .output()
        .map_err(|e| format!("Failed to execute yt-dlp: {e}"))?;

    if !output.status.success() {
        let err = String::from_utf8_lossy(&output.stderr);
        return Err(format!("yt-dlp error: {}", err));
    }

    // find the output file
    let mut final_path = cache_dir.join(format!("{}.{}", video_id, ext));
    if !final_path.exists() {
        for alt in ["opus", "m4a", "webm"] {
            let alt_path = cache_dir.join(format!("{}.{}", video_id, alt));
            if alt_path.exists() {
                final_path = alt_path;
                break;
            }
        }
    }

    if !final_path.exists() {
        return Err("Download failed: file not found".to_string());
    }

    // read and store in index
    let data = fs::read(&final_path).map_err(|e| format!("Failed to read cached file: {e}"))?;
    let path_str = final_path.to_string_lossy().to_string();

    let meta = EntryMeta {
        path: path_str.clone(),
        size: data.len() as u64,
        cached_at: now_ms(),
        last_accessed: now_ms(),
    };

    let mut index = AUDIO_INDEX.lock().unwrap();
    index.entries.insert(video_id.to_string(), meta);
    evict_lru(
        &mut index,
        &cache_dir,
        max_entries,
        max_storage_mb * 1024 * 1024,
    );
    save_index(app, "audio", &index);

    Ok(path_str)
}

// ═══════════════════════════════════════════════════════════════
// Image Cache
// ═══════════════════════════════════════════════════════════════

pub fn image_get_path(app: &AppHandle, url: &str) -> Option<String> {
    let hash = url_hash(url);
    let mut index = IMAGE_INDEX.lock().unwrap();
    let result = index.entries.get(&hash).and_then(|entry| {
        let path = PathBuf::from(&entry.path);
        if path.exists() {
            Some(entry.path.clone())
        } else {
            None
        }
    });
    if result.is_some() {
        if let Some(entry) = index.entries.get_mut(&hash) {
            entry.last_accessed = now_ms();
        }
        save_index(app, "images", &index);
        return result;
    }
    if index.entries.contains_key(&hash) {
        index.entries.remove(&hash);
        save_index(app, "images", &index);
    }
    None
}

pub fn image_store(app: &AppHandle, url: &str, data: &[u8]) -> String {
    let hash = url_hash(url);
    let ext = detect_image_ext(data);
    let dir = image_dir(app);
    let filename = format!("{}.{}", hash, ext);
    let path = dir.join(&filename);
    fs::write(&path, data).ok();

    let meta = EntryMeta {
        path: path.to_string_lossy().to_string(),
        size: data.len() as u64,
        cached_at: now_ms(),
        last_accessed: now_ms(),
    };

    let mut index = IMAGE_INDEX.lock().unwrap();
    index.entries.insert(hash, meta);
    save_index(app, "images", &index);

    path.to_string_lossy().to_string()
}

pub fn image_evict(app: &AppHandle) {
    let dir = image_dir(app);
    let mut index = IMAGE_INDEX.lock().unwrap();
    evict_lru(&mut index, &dir, 500, 500 * 1024 * 1024); // 500 entries, 500MB
    save_index(app, "images", &index);
}

pub fn image_evict_with_limits(app: &AppHandle, max_entries: usize, max_storage_mb: u64) {
    let dir = image_dir(app);
    let mut index = IMAGE_INDEX.lock().unwrap();
    evict_lru(&mut index, &dir, max_entries, max_storage_mb * 1024 * 1024);
    save_index(app, "images", &index);
}

pub fn image_clear(app: &AppHandle) {
    let dir = image_dir(app);
    fs::remove_dir_all(&dir).ok();
    fs::create_dir_all(&dir).ok();
    let mut index = IMAGE_INDEX.lock().unwrap();
    index.entries.clear();
    save_index(app, "images", &index);
}

pub fn image_stats(_app: &AppHandle) -> CacheStats {
    let index = IMAGE_INDEX.lock().unwrap();
    CacheStats {
        count: index.entries.len(),
        total_bytes: index.entries.values().map(|e| e.size).sum(),
    }
}

pub async fn image_download(
    app: &AppHandle,
    url: &str,
    format: &str,
    quality: &str,
    max_entries: usize,
    max_storage_mb: u64,
) -> Result<String, String> {
    // check if already cached
    if let Some(path) = image_get_path(app, url) {
        return Ok(path);
    }

    // download raw bytes
    let client = reqwest::Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {e}"))?;

    let resp = client
        .get(url)
        .send()
        .await
        .map_err(|e| format!("Image download failed: {e}"))?;

    let raw_bytes = resp
        .bytes()
        .await
        .map_err(|e| format!("Failed to read image bytes: {e}"))?;

    // re-encode to target format/quality
    let img = image::load_from_memory(&raw_bytes)
        .map_err(|e| format!("Failed to decode image: {e}"))?;

    let encoded = match format {
        "png" => {
            let mut buf = std::io::Cursor::new(Vec::new());
            img.write_to(&mut buf, image::ImageFormat::Png)
                .map_err(|e| format!("Failed to encode PNG: {e}"))?;
            buf.into_inner()
        }
        "webp" => {
            let mut buf = std::io::Cursor::new(Vec::new());
            img.write_to(&mut buf, image::ImageFormat::WebP)
                .map_err(|e| format!("Failed to encode WebP: {e}"))?;
            buf.into_inner()
        }
        _ => {
            // jpg — re-encode with quality
            let quality_num = match quality {
                "low" => 50u8,
                "medium" => 75u8,
                "high" => 92u8,
                _ => 85u8,
            };
            let mut buf = std::io::Cursor::new(Vec::new());
            let encoder =
                image::codecs::jpeg::JpegEncoder::new_with_quality(&mut buf, quality_num);
            img.write_with_encoder(encoder)
                .map_err(|e| format!("Failed to encode JPEG: {e}"))?;
            buf.into_inner()
        }
    };

    // store
    let path = image_store(app, url, &encoded);

    // evict
    let dir = image_dir(app);
    let mut index = IMAGE_INDEX.lock().unwrap();
    evict_lru(
        &mut index,
        &dir,
        max_entries,
        max_storage_mb * 1024 * 1024,
    );
    save_index(app, "images", &index);

    Ok(path)
}
