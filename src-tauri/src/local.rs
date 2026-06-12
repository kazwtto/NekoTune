use lofty::prelude::*;
use lofty::read_from_path;
use serde::{Deserialize, Serialize};
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};
use std::path::{Path, PathBuf};
use walkdir::WalkDir;

const AUDIO_EXTENSIONS: &[&str] = &[
    "mp3", "flac", "ogg", "wav", "m4a", "aac", "wma", "opus", "aiff", "webm",
];

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct LocalSong {
    pub id: String,
    pub file_path: String,
    pub title: String,
    pub artist: String,
    pub album: Option<String>,
    pub duration: f64,
    pub cover_data: Option<String>,
    pub file_data: Option<String>,
}

fn hash_path(path: &str) -> String {
    let mut hasher = DefaultHasher::new();
    path.hash(&mut hasher);
    format!("{:x}", hasher.finish())
}

fn extract_cover(tf: &lofty::file::TaggedFile) -> Option<String> {
    let tag = tf.primary_tag().or_else(|| tf.first_tag())?;
    let picture = tag.pictures().first()?;
    let mime = picture.mime_type()?.as_str();
    let data = picture.data();
    let b64 = base64_encode(data);
    Some(format!("data:{};base64,{}", mime, b64))
}

fn base64_encode(data: &[u8]) -> String {
    const CHARS: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut result = String::with_capacity((data.len() + 2) / 3 * 4);

    for chunk in data.chunks(3) {
        let b0 = chunk[0] as u32;
        let b1 = if chunk.len() > 1 { chunk[1] as u32 } else { 0 };
        let b2 = if chunk.len() > 2 { chunk[2] as u32 } else { 0 };
        let triple = (b0 << 16) | (b1 << 8) | b2;

        result.push(CHARS[((triple >> 18) & 0x3F) as usize] as char);
        result.push(CHARS[((triple >> 12) & 0x3F) as usize] as char);
        if chunk.len() > 1 {
            result.push(CHARS[((triple >> 6) & 0x3F) as usize] as char);
        } else {
            result.push('=');
        }
        if chunk.len() > 2 {
            result.push(CHARS[(triple & 0x3F) as usize] as char);
        } else {
            result.push('=');
        }
    }

    result
}

fn mime_from_ext(ext: &str) -> &'static str {
    match ext {
        "mp3" => "audio/mpeg",
        "flac" => "audio/flac",
        "ogg" => "audio/ogg",
        "wav" => "audio/wav",
        "m4a" => "audio/mp4",
        "aac" => "audio/aac",
        "wma" => "audio/x-ms-wma",
        "opus" => "audio/ogg",
        "aiff" => "audio/aiff",
        "webm" => "audio/webm",
        _ => "audio/mpeg",
    }
}

fn extract_file_data(path: &Path) -> Option<String> {
    let ext = path.extension()?.to_str()?.to_lowercase();
    let mime = mime_from_ext(&ext);
    let bytes = std::fs::read(path).ok()?;
    let b64 = base64_encode(&bytes);
    Some(format!("data:{};base64,{}", mime, b64))
}

fn parse_song_from_path(path: &Path) -> Option<LocalSong> {
    let ext = path.extension()?.to_str()?.to_lowercase();
    if !AUDIO_EXTENSIONS.contains(&ext.as_str()) {
        return None;
    }

    let file_path = path.to_string_lossy().to_string();
    let file_name = path
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("Unknown")
        .to_string();

    let tagged_file = read_from_path(path).ok();

    let mut title = file_name.clone();
    let mut artist = "Unknown Artist".to_string();
    let mut album: Option<String> = None;
    let mut duration: f64 = 0.0;
    let mut cover_data: Option<String> = None;

    if let Some(ref tf) = tagged_file {
        duration = tf.properties().duration().as_secs_f64();
        cover_data = extract_cover(tf);

        let tag = tf.primary_tag().or_else(|| tf.first_tag());
        if let Some(tag) = tag {
            if let Some(t) = tag.title() {
                let t_str = t.into_owned();
                if !t_str.is_empty() {
                    title = t_str;
                }
            }
            if let Some(a) = tag.artist() {
                let a_str = a.into_owned();
                if !a_str.is_empty() {
                    artist = a_str;
                }
            }
            if let Some(al) = tag.album() {
                let al_str = al.into_owned();
                if !al_str.is_empty() {
                    album = Some(al_str);
                }
            }
        }
    }

    let file_data = extract_file_data(path);

    Some(LocalSong {
        id: hash_path(&file_path),
        file_path,
        title,
        artist,
        album,
        duration,
        cover_data,
        file_data,
    })
}

pub fn scan_music_folder(path: &str) -> Result<Vec<LocalSong>, String> {
    let dir = Path::new(path);
    if !dir.is_dir() {
        return Err(format!("Path is not a directory: {}", path));
    }

    let mut songs = Vec::new();

    for entry in WalkDir::new(dir)
        .follow_links(true)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        if entry.file_type().is_file() {
            if let Some(song) = parse_song_from_path(entry.path()) {
                songs.push(song);
            }
        }
    }

    songs.sort_by(|a, b| a.title.cmp(&b.title));
    Ok(songs)
}

pub fn get_file_data(path: &str) -> Result<Option<String>, String> {
    let p = Path::new(path);
    if !p.exists() || !p.is_file() {
        return Err(format!("File not found: {}", path));
    }
    Ok(extract_file_data(p))
}

pub fn get_default_music_dir() -> Result<String, String> {
    let home = dirs_next::home_dir().ok_or_else(|| "Cannot find home directory".to_string())?;
    let music_dir = home.join("Music");
    if music_dir.exists() {
        return Ok(music_dir.to_string_lossy().to_string());
    }

    let candidates = if cfg!(target_os = "windows") {
        vec![
            home.join("Music"),
            PathBuf::from("C:\\Users\\Public\\Music"),
        ]
    } else if cfg!(target_os = "macos") {
        vec![home.join("Music")]
    } else {
        vec![home.join("Music"), home.join("music")]
    };

    for candidate in candidates {
        if candidate.exists() && candidate.is_dir() {
            return Ok(candidate.to_string_lossy().to_string());
        }
    }

    Ok(home.to_string_lossy().to_string())
}