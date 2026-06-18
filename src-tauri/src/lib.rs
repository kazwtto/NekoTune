mod api;
mod cache;
mod download;
mod local;
mod login;
mod proxy;
mod ytdlp;

use api::innertube::*;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

#[derive(Serialize, Deserialize, Default, Clone)]
struct FloatingState {
    x: f64,
    y: f64,
}

fn floating_state_path() -> PathBuf {
    let dir = dirs_next::config_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("nekotune");
    fs::create_dir_all(&dir).ok();
    dir.join("floating_state.json")
}

fn load_floating_state() -> FloatingState {
    let path = floating_state_path();
    fs::read_to_string(&path)
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}

fn save_floating_state(state: &FloatingState) {
    let path = floating_state_path();
    if let Ok(json) = serde_json::to_string(state) {
        fs::write(path, json).ok();
    }
}

#[tauri::command]
async fn cmd_get_home_feed() -> Result<HomeFeedData, String> {
    fetch_home_feed().await
}

#[tauri::command]
async fn cmd_get_explore() -> Result<ExploreData, String> {
    fetch_explore().await
}

#[tauri::command]
async fn cmd_search_music(query: String) -> Result<SearchResults, String> {
    search_music(&query).await
}

#[tauri::command]
async fn cmd_get_search_suggestions(query: String) -> Result<Vec<String>, String> {
    get_search_suggestions(&query).await
}

#[tauri::command]
async fn cmd_get_playlist(browse_id: String) -> Result<PlaylistData, String> {
    get_playlist(&browse_id).await
}

#[tauri::command]
async fn cmd_get_album(browse_id: String) -> Result<AlbumData, String> {
    get_album(&browse_id).await
}

#[tauri::command]
async fn cmd_get_artist(browse_id: String) -> Result<ArtistData, String> {
    get_artist(&browse_id).await
}

#[tauri::command]
async fn cmd_browse_category(browse_id: String, params: Option<String>) -> Result<Vec<HomeSection>, String> {
    browse_category(&browse_id, params.as_deref()).await
}

#[tauri::command]
async fn cmd_get_stream_url(video_id: String) -> Result<StreamData, String> {
    let data = ytdlp::get_stream_url(&video_id).await?;
    let url_id = proxy::register_url(data.url);
    Ok(StreamData {
        url: url_id.to_string(),
        duration: data.duration,
    })
}

#[tauri::command]
async fn cmd_register_stream_url(url: String) -> Result<String, String> {
    let url_id = proxy::register_url(url);
    Ok(url_id.to_string())
}

#[tauri::command]
async fn cmd_get_lyrics(video_id: String) -> Result<Option<String>, String> {
    get_lyrics(&video_id).await
}

#[tauri::command]
async fn cmd_scan_music_folder(path: String) -> Result<Vec<local::LocalSong>, String> {
    local::scan_music_folder(&path)
}

#[tauri::command]
async fn cmd_get_default_music_dir() -> Result<String, String> {
    local::get_default_music_dir()
}

#[tauri::command]
async fn cmd_get_local_file_data(path: String) -> Result<Option<String>, String> {
    local::get_file_data(&path)
}

#[tauri::command]
async fn cmd_debug_dump(endpoint: String, body: String) -> Result<String, String> {
    let parsed: serde_json::Value = serde_json::from_str(&body).map_err(|e| e.to_string())?;
    let resp = reqwest::Client::new()
        .post(&endpoint)
        .json(&parsed)
        .send()
        .await
        .map_err(|e| e.to_string())?;
    let text = resp.text().await.map_err(|e| e.to_string())?;
    Ok(text)
}

#[tauri::command]
fn cmd_set_account_cookie(cookie: String) {
    api::innertube::set_account_cookie(&cookie);
}

#[tauri::command]
fn cmd_open_login_window(app: tauri::AppHandle) -> Result<(), String> {
    login::create_login_window(&app)
}

#[tauri::command]
async fn cmd_poll_login_cookies(app: tauri::AppHandle) -> Result<Option<String>, String> {
    // Spawn on a separate task so cookies_for_url doesn't deadlock on Windows
    tauri::async_runtime::spawn(async move { login::read_login_cookies(&app).await })
        .await
        .map_err(|e| e.to_string())?
}

#[tauri::command]
fn cmd_minimize_to_tray(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.hide();
        if let Some(floating) = app.get_webview_window("floating") {
            let _ = floating.show();
        }
        if app.tray_by_id("main_tray").is_none() {
            let _ = tauri::tray::TrayIconBuilder::with_id("main_tray")
                .icon(app.default_window_icon().unwrap().clone())
                .tooltip("NekoTune")
                .on_tray_icon_event(|tray, event| {
                    if let tauri::tray::TrayIconEvent::Click { .. } = event {
                        let app_handle = tray.app_handle();
                        if let Some(window) = app_handle.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                        if let Some(floating) = app_handle.get_webview_window("floating") {
                            let _ = floating.hide();
                        }
                        app_handle.remove_tray_by_id("main_tray");
                    }
                })
                .build(&app);
        }
    }
    Ok(())
}

// ═══════════════════════════════════════════════════════════════
// Cache Commands
// ═══════════════════════════════════════════════════════════════

#[tauri::command]
async fn cmd_audio_cache_get_path(app: tauri::AppHandle, video_id: String) -> Result<Option<String>, String> {
    Ok(cache::audio_get_path(&app, &video_id))
}

#[tauri::command]
async fn cmd_audio_cache_remove(app: tauri::AppHandle, video_id: String) -> Result<(), String> {
    cache::audio_remove(&app, &video_id);
    Ok(())
}

#[tauri::command]
async fn cmd_audio_cache_clear(app: tauri::AppHandle) -> Result<(), String> {
    cache::audio_clear(&app);
    Ok(())
}

#[tauri::command]
async fn cmd_audio_cache_stats(app: tauri::AppHandle) -> Result<cache::CacheStats, String> {
    Ok(cache::audio_stats(&app))
}

#[tauri::command]
async fn cmd_audio_cache_download(
    app: tauri::AppHandle,
    video_id: String,
    format: String,
    quality: String,
    max_entries: usize,
    max_storage_mb: u64,
) -> Result<String, String> {
    cache::audio_download(&app, &video_id, &format, &quality, max_entries, max_storage_mb).await
}

#[tauri::command]
async fn cmd_image_cache_get_path(app: tauri::AppHandle, url: String) -> Result<Option<String>, String> {
    Ok(cache::image_get_path(&app, &url))
}

#[tauri::command]
async fn cmd_image_cache_clear(app: tauri::AppHandle) -> Result<(), String> {
    cache::image_clear(&app);
    Ok(())
}

#[tauri::command]
async fn cmd_image_cache_stats(app: tauri::AppHandle) -> Result<cache::CacheStats, String> {
    Ok(cache::image_stats(&app))
}

#[tauri::command]
async fn cmd_image_cache_download(
    app: tauri::AppHandle,
    url: String,
    format: String,
    quality: String,
    max_entries: usize,
    max_storage_mb: u64,
) -> Result<String, String> {
    cache::image_download(&app, &url, &format, &quality, max_entries, max_storage_mb).await
}

#[tauri::command]
async fn cmd_audio_cache_evict(app: tauri::AppHandle) -> Result<(), String> {
    cache::audio_evict(&app);
    Ok(())
}

#[tauri::command]
async fn cmd_audio_cache_evict_with_limits(
    app: tauri::AppHandle,
    max_entries: usize,
    max_storage_mb: u64,
) -> Result<(), String> {
    cache::audio_evict_with_limits(&app, max_entries, max_storage_mb);
    Ok(())
}

#[tauri::command]
async fn cmd_cache_debug(app: tauri::AppHandle) -> Result<String, String> {
    use std::fs;
    let config_dir = app.path().app_config_dir().map_err(|e| format!("app_config_dir error: {e}"))?;
    let cache_dir = config_dir.join("cache");
    let audio_dir = cache_dir.join("audio");

    fs::create_dir_all(&audio_dir).map_err(|e| format!("create_dir_all error: {e}"))?;

    let test_file = audio_dir.join("test.txt");
    fs::write(&test_file, "test").map_err(|e| format!("write error: {e}"))?;
    let content = fs::read_to_string(&test_file).map_err(|e| format!("read error: {e}"))?;
    fs::remove_file(&test_file).ok();

    Ok(format!(
        "config_dir: {}\ncache_dir: {}\naudio_dir: {}\nwrite_ok: {}",
        config_dir.display(),
        cache_dir.display(),
        audio_dir.display(),
        content == "test"
    ))
}

#[tauri::command]
async fn cmd_image_cache_evict(app: tauri::AppHandle) -> Result<(), String> {
    cache::image_evict(&app);
    Ok(())
}

#[tauri::command]
async fn cmd_image_cache_evict_with_limits(
    app: tauri::AppHandle,
    max_entries: usize,
    max_storage_mb: u64,
) -> Result<(), String> {
    cache::image_evict_with_limits(&app, max_entries, max_storage_mb);
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .register_asynchronous_uri_scheme_protocol("nekotune", proxy::handle_protocol_request)
        .setup(|app| {
            cache::init_caches(&app.handle());

            if let Some(floating) = app.get_webview_window("floating") {
                let _ = floating.hide();

                let state = load_floating_state();
                if state.x != 0.0 || state.y != 0.0 {
                    let _ = floating.set_position(tauri::Position::Physical(
                        tauri::PhysicalPosition {
                            x: state.x as i32,
                            y: state.y as i32,
                        },
                    ));
                }

                let aspect = 380.0 / 60.0;

                let floating_clone = floating.clone();
                floating.on_window_event(move |event| {
                    match event {
                        tauri::WindowEvent::Moved(pos) => {
                            let state = FloatingState {
                                x: pos.x as f64,
                                y: pos.y as f64,
                                ..load_floating_state()
                            };
                            save_floating_state(&state);
                        }
                        tauri::WindowEvent::Resized(size) => {
                            let w = size.width as f64;
                            let expected_h = (w / aspect) as u32;
                            if size.height != expected_h {
                                let _ = floating_clone.set_size(tauri::Size::Physical(
                                    tauri::PhysicalSize {
                                        width: size.width,
                                        height: expected_h,
                                    },
                                ));
                            }
                        }
                        _ => {}
                    }
                });
            }

            let main_window = app.get_webview_window("main").unwrap();
            let floating_clone = app.get_webview_window("floating").unwrap();
            main_window.on_window_event(move |event| {
                if let tauri::WindowEvent::CloseRequested { .. } = event {
                    let _ = floating_clone.destroy();
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            cmd_get_home_feed,
            cmd_get_explore,
            cmd_search_music,
            cmd_get_search_suggestions,
            cmd_get_playlist,
            cmd_get_album,
            cmd_get_artist,
            cmd_browse_category,
            cmd_get_stream_url,
            cmd_register_stream_url,
            cmd_get_lyrics,
            cmd_debug_dump,
            cmd_set_account_cookie,
            cmd_open_login_window,
            cmd_poll_login_cookies,
            cmd_scan_music_folder,
            cmd_get_default_music_dir,
            cmd_get_local_file_data,
            download::cmd_download_song,
            download::cmd_is_downloaded,
            download::cmd_cancel_download,
            download::cmd_remove_download,
            download::cmd_get_downloaded_file_path,
            download::cmd_get_all_downloaded_ids,
            cmd_minimize_to_tray,
            cmd_audio_cache_get_path,
            cmd_audio_cache_remove,
            cmd_audio_cache_clear,
            cmd_audio_cache_stats,
            cmd_audio_cache_download,
            cmd_image_cache_get_path,
            cmd_image_cache_clear,
            cmd_image_cache_stats,
            cmd_image_cache_download,
            cmd_audio_cache_evict,
            cmd_audio_cache_evict_with_limits,
            cmd_image_cache_evict,
            cmd_image_cache_evict_with_limits,
            cmd_cache_debug,
        ])
        .run(tauri::generate_context!())
        .expect("error while running NekoTune")
}
