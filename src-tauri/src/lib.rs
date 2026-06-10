mod api;

use api::innertube::*;

#[tauri::command]
async fn cmd_get_home_feed() -> Result<Vec<HomeSection>, String> {
    fetch_home_feed().await
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
async fn cmd_get_stream_url(video_id: String) -> Result<String, String> {
    get_stream_url(&video_id).await
}

#[tauri::command]
async fn cmd_get_lyrics(video_id: String) -> Result<Option<String>, String> {
    get_lyrics(&video_id).await
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![
            cmd_get_home_feed,
            cmd_search_music,
            cmd_get_search_suggestions,
            cmd_get_playlist,
            cmd_get_album,
            cmd_get_artist,
            cmd_get_stream_url,
            cmd_get_lyrics,
            cmd_debug_dump,
        ])
        .run(tauri::generate_context!())
        .expect("error while running NekoTune")
}
