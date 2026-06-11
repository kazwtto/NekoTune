use crate::api::innertube::StreamData;
use tokio::sync::OnceCell;
use yt_dlp::VideoSelection;

static DOWNLOADER: OnceCell<yt_dlp::Downloader> = OnceCell::const_new();

async fn get_downloader() -> Result<&'static yt_dlp::Downloader, String> {
    DOWNLOADER
        .get_or_try_init(|| async {
            let libs_dir = std::env::temp_dir().join("nekotune").join("libs");
            let output_dir = std::env::temp_dir().join("nekotune").join("output");
            std::fs::create_dir_all(&libs_dir).ok();
            std::fs::create_dir_all(&output_dir).ok();

            yt_dlp::Downloader::with_new_binaries(libs_dir, output_dir)
                .await
                .map_err(|e| format!("Failed to install yt-dlp: {e}"))?
                .build()
                .await
                .map_err(|e| format!("Failed to build downloader: {e}"))
        })
        .await
}

pub async fn get_stream_url(video_id: &str) -> Result<StreamData, String> {
    let downloader = get_downloader().await?;

    let url = format!("https://www.youtube.com/watch?v={video_id}");
    let video = downloader
        .fetch_video_infos(&url)
        .await
        .map_err(|e| format!("Failed to fetch video info: {e}"))?;

    let duration = video.duration.unwrap_or(0) as u32;

    let audio_format = video
        .best_audio_format()
        .ok_or_else(|| "No audio format found".to_string())?;

    let audio_url = audio_format
        .url()
        .map_err(|e| format!("Audio format error: {e}"))?
        .clone();

    Ok(StreamData {
        url: audio_url,
        duration,
    })
}
