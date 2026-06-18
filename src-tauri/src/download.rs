use std::path::{Path, PathBuf};
use std::collections::HashSet;
use std::sync::{Mutex, OnceLock};
use std::process::Command;
use walkdir::WalkDir;
use lofty::prelude::*;
use lofty::tag::ItemKey;
use lofty::config::WriteOptions;
use tauri::AppHandle;

fn active_downloads() -> &'static Mutex<HashSet<String>> {
    static ACTIVE_DOWNLOADS: OnceLock<Mutex<HashSet<String>>> = OnceLock::new();
    ACTIVE_DOWNLOADS.get_or_init(|| Mutex::new(HashSet::new()))
}

fn get_download_folder(custom_folder: Option<String>) -> Result<PathBuf, String> {
    let path = match custom_folder {
        Some(f) if !f.is_empty() => PathBuf::from(f),
        _ => {
            let home = dirs_next::home_dir().ok_or("Could not find home directory")?;
            home.join("Music").join("NekoTune")
        }
    };

    if !path.exists() {
        std::fs::create_dir_all(&path).map_err(|e| format!("Failed to create download directory: {e}"))?;
    }

    Ok(path)
}

fn is_already_downloaded(download_dir: &Path, video_id: &str) -> bool {
    if !download_dir.exists() { return false; }

    for entry in WalkDir::new(download_dir)
        .max_depth(1)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        if entry.file_type().is_file() {
            let ext = entry.path().extension().and_then(|s| s.to_str()).unwrap_or("").to_lowercase();
            if ["mp3", "flac", "ogg", "wav", "opus"].contains(&ext.as_str()) {
                if let Ok(tagged_file) = lofty::read_from_path(entry.path()) {
                    let tag = tagged_file.primary_tag().or_else(|| tagged_file.first_tag());
                    if let Some(tag) = tag {
                        if let Some(val) = tag.get(&ItemKey::Unknown("NEKOTUNE_VIDEO_ID".to_string())).and_then(|i| i.value().text()) {
                            if val == video_id {
                                return true;
                            }
                        }
                    }
                }
            }
        }
    }
    false
}

fn get_downloaded_file_path_internal(download_dir: &Path, video_id: &str) -> Option<PathBuf> {
    if !download_dir.exists() { return None; }

    for entry in WalkDir::new(download_dir)
        .max_depth(1)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        if entry.file_type().is_file() {
            let ext = entry.path().extension().and_then(|s| s.to_str()).unwrap_or("").to_lowercase();
            if ["mp3", "flac", "ogg", "wav", "opus"].contains(&ext.as_str()) {
                if let Ok(tagged_file) = lofty::read_from_path(entry.path()) {
                    let tag = tagged_file.primary_tag().or_else(|| tagged_file.first_tag());
                    if let Some(tag) = tag {
                        if let Some(val) = tag.get(&ItemKey::Unknown("NEKOTUNE_VIDEO_ID".to_string())).and_then(|i| i.value().text()) {
                            if val == video_id {
                                return Some(entry.path().to_path_buf());
                            }
                        }
                    }
                }
            }
        }
    }
    None
}

fn embed_video_id_tag(file_path: &Path, video_id: &str) -> Result<(), String> {
    let mut tagged_file = lofty::read_from_path(file_path)
        .map_err(|e| format!("Failed to read tags: {e}"))?;

    let tag = if tagged_file.primary_tag().is_some() {
        tagged_file.primary_tag_mut().unwrap()
    } else if tagged_file.first_tag().is_some() {
        tagged_file.first_tag_mut().unwrap()
    } else {
        return Err("No tags found in file".to_string());
    };

    tag.insert_text(ItemKey::Unknown("NEKOTUNE_VIDEO_ID".to_string()), video_id.to_string());
    tag.save_to_path(file_path, WriteOptions::default()).map_err(|e| format!("Failed to save tags: {e}"))?;

    Ok(())
}

#[tauri::command]
pub async fn cmd_is_downloaded(video_id: String, download_folder: Option<String>) -> Result<bool, String> {
    let folder = get_download_folder(download_folder)?;
    Ok(is_already_downloaded(&folder, &video_id))
}

#[tauri::command]
pub async fn cmd_get_downloaded_file_path(video_id: String, download_folder: Option<String>) -> Result<String, String> {
    let folder = get_download_folder(download_folder)?;
    get_downloaded_file_path_internal(&folder, &video_id)
        .map(|p| p.to_string_lossy().to_string())
        .ok_or_else(|| "File not found".to_string())
}

#[tauri::command]
pub async fn cmd_cancel_download(video_id: String) -> Result<(), String> {
    active_downloads().lock().unwrap().remove(&video_id);
    Ok(())
}

#[tauri::command]
pub async fn cmd_remove_download(video_id: String, download_folder: Option<String>) -> Result<(), String> {
    let folder = get_download_folder(download_folder)?;
    if let Some(path) = get_downloaded_file_path_internal(&folder, &video_id) {
        std::fs::remove_file(path).map_err(|e| format!("Failed to remove file: {e}"))?;
    }
    Ok(())
}

#[tauri::command]
pub async fn cmd_get_all_downloaded_ids(download_folder: Option<String>) -> Result<Vec<String>, String> {
    let folder = get_download_folder(download_folder)?;
    if !folder.exists() { return Ok(Vec::new()); }

    let mut ids = Vec::new();

    for entry in WalkDir::new(folder)
        .max_depth(1)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        if entry.file_type().is_file() {
            let ext = entry.path().extension().and_then(|s| s.to_str()).unwrap_or("").to_lowercase();
            if ["mp3", "flac", "ogg", "wav", "opus"].contains(&ext.as_str()) {
                if let Ok(tagged_file) = lofty::read_from_path(entry.path()) {
                    let tag = tagged_file.primary_tag().or_else(|| tagged_file.first_tag());
                    if let Some(tag) = tag {
                        if let Some(val) = tag.get(&ItemKey::Unknown("NEKOTUNE_VIDEO_ID".to_string())).and_then(|i| i.value().text()) {
                            ids.push(val.to_string());
                        }
                    }
                }
            }
        }
    }
    Ok(ids)
}

#[tauri::command]
pub async fn cmd_download_song(
    _app: AppHandle,
    video_id: String,
    download_folder: Option<String>,
    format: Option<String>,
    quality: Option<String>,
) -> Result<String, String> {
    // 1. Check duplicate
    {
        let mut active = active_downloads().lock().unwrap();
        if active.contains(&video_id) {
            return Err("Download already in progress".to_string());
        }
        active.insert(video_id.clone());
    }

    struct DownloadGuard(String);
    impl Drop for DownloadGuard {
        fn drop(&mut self) {
            active_downloads().lock().unwrap().remove(&self.0);
        }
    }
    let _guard = DownloadGuard(video_id.clone());

    // 2. Check if already exists
    let folder = get_download_folder(download_folder)?;
    if is_already_downloaded(&folder, &video_id) {
        return Err("Song already downloaded".to_string());
    }

    // 3. Ensure binaries
    let libs_dir = std::env::temp_dir().join("nekotune").join("libs");
    let output_dir = std::env::temp_dir().join("nekotune").join("output");
    std::fs::create_dir_all(&libs_dir).ok();
    std::fs::create_dir_all(&output_dir).ok();

    let _ = yt_dlp::Downloader::with_new_binaries(libs_dir.clone(), output_dir)
        .await
        .map_err(|e| format!("Failed to install yt-dlp: {e}"))?
        .build()
        .await
        .map_err(|e| format!("Failed to build downloader: {e}"))?;

    let ytdlp_exe = if cfg!(target_os = "windows") { "yt-dlp.exe" } else { "yt-dlp" };
    let ytdlp_path = libs_dir.join(ytdlp_exe);

    if !ytdlp_path.exists() {
        return Err("yt-dlp binary not found after installation".to_string());
    }

    // 4. Quality/Format mapping
    let format_str = format.unwrap_or_else(|| "mp3".to_string());
    let quality_str = quality.unwrap_or_else(|| "high".to_string());

    let audio_format = match format_str.as_str() {
        "flac" => "flac",
        "wav" => "wav",
        "ogg" => "opus",
        _ => "mp3",
    };
    
    let audio_quality = match quality_str.as_str() {
        "low" => "5",
        "medium" => "3",
        "high" => "0",
        "best" => "0",
        _ => "0",
    };

    let ext = match format_str.as_str() {
        "flac" => "flac",
        "wav" => "wav",
        "ogg" => "ogg",
        _ => "mp3",
    };

    let output_template = folder.join(format!("{}.%(ext)s", video_id));
    let url = format!("https://www.youtube.com/watch?v={}", video_id);

    // 5. Run yt-dlp
    let mut cmd = Command::new(&ytdlp_path);
    cmd.arg(url)
        .arg("--extract-audio")
        .arg("--audio-format").arg(audio_format)
        .arg("--audio-quality").arg(audio_quality)
        .arg("--no-playlist")
        .arg("--add-metadata")
        .arg("--embed-thumbnail")
        .arg("--ffmpeg-location").arg(&libs_dir)
        .arg("-o").arg(&output_template);

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        cmd.creation_flags(CREATE_NO_WINDOW);
    }

    let output = cmd.output().map_err(|e| format!("Failed to execute yt-dlp: {e}"))?;

    if !output.status.success() {
        let err = String::from_utf8_lossy(&output.stderr);
        return Err(format!("yt-dlp error: {}", err));
    }

    // 6. Find the actual file
    let mut final_path = folder.join(format!("{}.{}", video_id, ext));
    
    if !final_path.exists() {
        let alts = ["opus", "m4a", "webm"];
        for alt in alts {
            let alt_path = folder.join(format!("{}.{}", video_id, alt));
            if alt_path.exists() {
                final_path = alt_path;
                break;
            }
        }
    }

    if !final_path.exists() {
        return Err("Download failed: File not found after yt-dlp execution".to_string());
    }

    // 7. Embed custom tag
    let _ = embed_video_id_tag(&final_path, &video_id);

    Ok(final_path.to_string_lossy().to_string())
}
