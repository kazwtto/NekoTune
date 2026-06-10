use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::process::Command;
use std::sync::LazyLock;

static CLIENT: LazyLock<Client> = LazyLock::new(|| {
    Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
        .build()
        .expect("Failed to create HTTP client")
});

const INNERTUBE_API_KEY: &str = "AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30";

fn get_context() -> serde_json::Value {
    serde_json::json!({
        "client": {
            "clientName": "WEB_REMIX",
            "clientVersion": "1.20241127.01.00",
            "hl": "en",
            "gl": "US"
        }
    })
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SongData {
    pub id: String,
    pub video_id: String,
    pub title: String,
    pub artist: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub artist_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub album: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub album_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub album_art_url: Option<String>,
    pub duration: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AlbumData {
    pub id: String,
    pub browse_id: String,
    pub title: String,
    pub artist: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub artist_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub year: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cover_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub song_count: Option<u32>,
    #[serde(default)]
    pub songs: Vec<SongData>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ArtistData {
    pub id: String,
    pub browse_id: String,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub image_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub subscribers: Option<String>,
    #[serde(default)]
    pub songs: Vec<SongData>,
    #[serde(default)]
    pub albums: Vec<AlbumData>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PlaylistData {
    pub id: String,
    pub browse_id: String,
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cover_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub song_count: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub owner: Option<String>,
    #[serde(default)]
    pub songs: Vec<SongData>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchResults {
    #[serde(default)]
    pub songs: Vec<SongData>,
    #[serde(default)]
    pub albums: Vec<AlbumData>,
    #[serde(default)]
    pub artists: Vec<ArtistData>,
    #[serde(default)]
    pub playlists: Vec<PlaylistData>,
    #[serde(default)]
    pub videos: Vec<SongData>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HomeItem {
    #[serde(rename = "type")]
    pub item_type: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub video_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub browse_id: Option<String>,
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub subtitle: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cover_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub duration: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HomeSection {
    pub title: String,
    pub items: Vec<HomeItem>,
}

fn extract_thumbnails(thumbnails: &serde_json::Value) -> Option<String> {
    thumbnails
        .as_array()
        .and_then(|arr| arr.last())
        .and_then(|t| t.get("url"))
        .and_then(|u| u.as_str())
        .map(|s| s.to_string())
}

fn get_text_from_runs(value: &serde_json::Value) -> Option<String> {
    value
        .get("runs")
        .and_then(|r| r.as_array())
        .map(|runs| {
            runs.iter()
                .filter_map(|r| r.get("text").and_then(|t| t.as_str()))
                .collect::<Vec<&str>>()
                .join("")
        })
        .or_else(|| value.get("simpleText").and_then(|s| s.as_str()).map(|s| s.to_string()))
}

fn parse_duration(duration_str: &str) -> u32 {
    let parts: Vec<&str> = duration_str.split(':').collect();
    match parts.len() {
        3 => {
            let hours: u32 = parts[0].parse().unwrap_or(0);
            let mins: u32 = parts[1].parse().unwrap_or(0);
            let secs: u32 = parts[2].parse().unwrap_or(0);
            hours * 3600 + mins * 60 + secs
        }
        2 => {
            let mins: u32 = parts[0].parse().unwrap_or(0);
            let secs: u32 = parts[1].parse().unwrap_or(0);
            mins * 60 + secs
        }
        _ => 0,
    }
}

fn extract_video_id_from_item(item: &serde_json::Value) -> Option<String> {
    if let Some(vid) = item.get("videoId").and_then(|v| v.as_str()) {
        return Some(vid.to_string());
    }

    if let Some(vid) = item
        .get("playlistItemData")
        .and_then(|d| d.get("videoId"))
        .and_then(|v| v.as_str())
    {
        return Some(vid.to_string());
    }

    if let Some(vid) = item
        .get("overlay")
        .and_then(|o| o.get("musicItemThumbnailOverlayRenderer"))
        .and_then(|r| r.get("content"))
        .and_then(|c| c.get("musicPlayButtonRenderer"))
        .and_then(|b| b.get("playNavigationEndpoint"))
        .and_then(|e| {
            e.get("watchEndpoint")
                .or_else(|| e.get("watchPlaylistEndpoint"))
        })
        .and_then(|w| w.get("videoId").or_else(|| w.get("playlistId")))
        .and_then(|v| v.as_str())
    {
        return Some(vid.to_string());
    }

    if let Some(vid) = item
        .get("navigationEndpoint")
        .and_then(|n| n.get("watchEndpoint"))
        .and_then(|w| w.get("videoId"))
        .and_then(|v| v.as_str())
    {
        return Some(vid.to_string());
    }

    None
}

fn extract_thumbnail_from_item(item: &serde_json::Value) -> Option<String> {
    item.get("thumbnail")
        .and_then(|t| t.get("musicThumbnailRenderer"))
        .and_then(|t| t.get("thumbnail"))
        .and_then(|t| t.get("thumbnails"))
        .or_else(|| {
            item.get("thumbnailRenderer")
                .and_then(|t| t.get("musicThumbnailRenderer"))
                .and_then(|t| t.get("thumbnail"))
                .and_then(|t| t.get("thumbnails"))
        })
        .and_then(extract_thumbnails)
}

fn extract_duration_from_item(item: &serde_json::Value) -> u32 {
    if let Some(dur) = item
        .get("lengthText")
        .and_then(|l| l.get("simpleText"))
        .and_then(|v| v.as_str())
    {
        return parse_duration(dur);
    }

    if let Some(dur) = item
        .get("fixedColumns")
        .and_then(|f| f.as_array())
        .and_then(|a| a.first())
        .and_then(|c| c.get("musicResponsiveListItemFixedColumnRenderer"))
        .and_then(|r| r.get("text"))
        .and_then(|t| t.get("simpleText"))
        .and_then(|v| v.as_str())
    {
        return parse_duration(dur);
    }

    if let Some(dur) = item
        .get("lengthText")
        .and_then(|l| l.get("accessibility"))
        .and_then(|a| a.get("accessibilityData"))
        .and_then(|d| d.get("label"))
        .and_then(|v| v.as_str())
    {
        return parse_duration(dur);
    }

    0
}

fn extract_title_from_item(item: &serde_json::Value) -> String {
    if let Some(t) = item
        .get("title")
        .and_then(get_text_from_runs)
    {
        return t;
    }

    if let Some(t) = item
        .get("flexColumns")
        .and_then(|f| f.as_array())
        .and_then(|a| a.first())
        .and_then(|c| c.get("musicResponsiveListItemFlexColumnRenderer"))
        .and_then(|r| r.get("text"))
        .and_then(get_text_from_runs)
    {
        return t;
    }

    "Unknown".to_string()
}

fn extract_artist_from_item(item: &serde_json::Value) -> (String, Option<String>) {
    if let Some(short) = item.get("shortBylineText") {
        let name = get_text_from_runs(short).unwrap_or_else(|| "Unknown".to_string());
        let id = short
            .get("runs")
            .and_then(|r| r.as_array())
            .and_then(|a| a.iter().find(|r| r.get("navigationEndpoint").is_some()))
            .and_then(|r| r.get("navigationEndpoint"))
            .and_then(|n| n.get("browseEndpoint"))
            .and_then(|b| b.get("browseId"))
            .and_then(|b| b.as_str())
            .map(|s| s.to_string());
        return (name, id);
    }

    if let Some(columns) = item.get("flexColumns").and_then(|f| f.as_array()) {
        if columns.len() >= 2 {
            let second = &columns[1];
            if let Some(text) = second
                .get("musicResponsiveListItemFlexColumnRenderer")
                .and_then(|r| r.get("text"))
                .and_then(get_text_from_runs)
            {
                if !text.is_empty() {
                    let parts: Vec<&str> = text.splitn(2, " - ").collect();
                    if parts.len() == 2 {
                        return (parts[1].to_string(), None);
                    }
                    let parts: Vec<&str> = text.splitn(2, "  ").collect();
                    if parts.len() == 2 {
                        return (parts[1].to_string(), None);
                    }
                    let parts: Vec<&str> = text.splitn(2, '·').collect();
                    if parts.len() == 2 {
                        return (parts[1].trim().to_string(), None);
                    }
                }
            }
        }
    }

    ("Unknown".to_string(), None)
}


fn parse_song_from_music_item(item: &serde_json::Value) -> Option<SongData> {
    let video_id = extract_video_id_from_item(item)?;

    let title = extract_title_from_item(item);
    let (artist, artist_id) = extract_artist_from_item(item);
    let album_art_url = extract_thumbnail_from_item(item);
    let duration = extract_duration_from_item(item);

    Some(SongData {
        id: video_id.clone(),
        video_id,
        title,
        artist,
        artist_id,
        album: None,
        album_id: None,
        album_art_url,
        duration,
    })
}

fn parse_two_row_item(item: &serde_json::Value) -> Option<HomeItem> {
    let nav = item.get("navigationEndpoint");
    let browse_id = nav
        .and_then(|n| n.get("browseEndpoint"))
        .and_then(|b| b.get("browseId"))
        .and_then(|b| b.as_str())
        .map(|s| s.to_string());
    let video_id = item
        .get("videoId")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string());
    let play_playlist_id = item
        .get("thumbnailOverlay")
        .and_then(|o| o.get("musicItemThumbnailOverlayRenderer"))
        .and_then(|r| r.get("content"))
        .and_then(|c| c.get("musicPlayButtonRenderer"))
        .and_then(|b| b.get("playNavigationEndpoint"))
        .and_then(|e| e.get("watchPlaylistEndpoint"))
        .and_then(|w| w.get("playlistId"))
        .and_then(|p| p.as_str())
        .map(|s| s.to_string());
    let title = item
        .get("title")
        .and_then(get_text_from_runs)
        .unwrap_or_else(|| "Unknown".to_string());
    let subtitle = item
        .get("subtitle")
        .and_then(get_text_from_runs);
    let cover_url = item
        .get("thumbnailRenderer")
        .and_then(|t| t.get("musicThumbnailRenderer"))
        .and_then(|t| t.get("thumbnail"))
        .and_then(|t| t.get("thumbnails"))
        .and_then(extract_thumbnails);
    let page_type = nav
        .and_then(|n| n.get("browseEndpoint"))
        .and_then(|b| b.get("browseEndpointContextSupportedConfigs"))
        .and_then(|c| c.get("browseEndpointContextMusicConfig"))
        .and_then(|c| c.get("pageType"))
        .and_then(|t| t.as_str())
        .unwrap_or("");

    match page_type {
        "MUSIC_PAGE_TYPE_ALBUM" => Some(HomeItem {
            item_type: "album".to_string(),
            id: browse_id.clone(),
            video_id: None,
            browse_id,
            title,
            subtitle,
            cover_url,
            duration: None,
        }),
        "MUSIC_PAGE_TYPE_ARTIST" => Some(HomeItem {
            item_type: "artist".to_string(),
            id: browse_id.clone(),
            video_id: None,
            browse_id,
            title,
            subtitle,
            cover_url,
            duration: None,
        }),
        "MUSIC_PAGE_TYPE_PLAYLIST" | "MUSIC_PAGE_TYPE_USER_CHANNEL" => Some(HomeItem {
            item_type: "playlist".to_string(),
            id: play_playlist_id.clone().or_else(|| browse_id.clone()),
            video_id: None,
            browse_id,
            title,
            subtitle,
            cover_url,
            duration: None,
        }),
        _ => {
            if let Some(vid) = &video_id {
                Some(HomeItem {
                    item_type: "song".to_string(),
                    id: Some(vid.clone()),
                    video_id: Some(vid.clone()),
                    browse_id: None,
                    title,
                    subtitle,
                    cover_url,
                    duration: None,
                })
            } else if let Some(bid) = &browse_id {
                Some(HomeItem {
                    item_type: "playlist".to_string(),
                    id: play_playlist_id.clone().or_else(|| Some(bid.clone())),
                    video_id: None,
                    browse_id: Some(bid.clone()),
                    title,
                    subtitle,
                    cover_url,
                    duration: None,
                })
            } else {
                None
            }
        }
    }
}

pub async fn fetch_home_feed() -> Result<Vec<HomeSection>, String> {
    let body = serde_json::json!({
        "context": get_context(),
        "browseId": "FEmusic_home"
    });

    let resp = CLIENT
        .post(format!(
            "https://music.youtube.com/youtubei/v1/browse?key={}",
            INNERTUBE_API_KEY
        ))
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    let data: serde_json::Value = resp
        .json()
        .await
        .map_err(|e| format!("Parse failed: {}", e))?;

    let mut sections = Vec::new();

    let contents = data
        .get("contents")
        .and_then(|c| c.get("singleColumnBrowseResultsRenderer"))
        .and_then(|r| r.get("tabs"))
        .and_then(|t| t.as_array())
        .and_then(|t| t.first())
        .and_then(|t| t.get("tabRenderer"))
        .and_then(|t| t.get("content"))
        .and_then(|c| c.get("sectionListRenderer"))
        .and_then(|s| s.get("contents"))
        .and_then(|c| c.as_array());

    if let Some(contents) = contents {
        for section in contents {
            if let Some(carousel) = section.get("musicCarouselShelfRenderer") {
                let title = carousel
                    .get("header")
                    .and_then(|h| h.get("musicCarouselShelfBasicHeaderRenderer"))
                    .and_then(|h| h.get("title"))
                    .and_then(get_text_from_runs)
                    .unwrap_or_else(|| "Recommended".to_string());

                let mut items = Vec::new();

                if let Some(contents) = carousel.get("contents").and_then(|c| c.as_array()) {
                    for content_item in contents {
                        if let Some(two_row) = content_item.get("musicTwoRowItemRenderer") {
                            if let Some(item) = parse_two_row_item(two_row) {
                                items.push(item);
                            }
                        }
                    }
                }

                if !items.is_empty() {
                    sections.push(HomeSection { title, items });
                }
            }
        }
    }

    Ok(sections)
}

pub async fn search_music(query: &str) -> Result<SearchResults, String> {
    let body = serde_json::json!({
        "context": get_context(),
        "query": query
    });

    let resp = CLIENT
        .post(format!(
            "https://music.youtube.com/youtubei/v1/search?key={}",
            INNERTUBE_API_KEY
        ))
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    let data: serde_json::Value = resp
        .json()
        .await
        .map_err(|e| format!("Parse failed: {}", e))?;

    let mut results = SearchResults {
        songs: Vec::new(),
        albums: Vec::new(),
        artists: Vec::new(),
        playlists: Vec::new(),
        videos: Vec::new(),
    };

    if let Some(contents) = data
        .get("contents")
        .and_then(|c| c.get("tabbedSearchResultsRenderer"))
        .and_then(|r| r.get("tabs"))
        .and_then(|t| t.as_array())
        .and_then(|t| t.first())
        .and_then(|t| t.get("tabRenderer"))
        .and_then(|t| t.get("content"))
        .and_then(|c| c.get("sectionListRenderer"))
        .and_then(|s| s.get("contents"))
        .and_then(|c| c.as_array())
    {
        for section in contents {
            if let Some(card) = section.get("musicCardShelfRenderer") {
                if let Some(items) = card.get("contents").and_then(|c| c.as_array()) {
                    for item in items {
                        if let Some(list_item) = item.get("musicResponsiveListItemRenderer") {
                            parse_search_music_item(list_item, &mut results);
                        }
                    }
                }
            }

            if let Some(item_section) = section.get("itemSectionRenderer") {
                if let Some(items) = item_section.get("contents").and_then(|c| c.as_array()) {
                    for item in items {
                        if let Some(list_item) = item.get("musicResponsiveListItemRenderer") {
                            parse_search_music_item(list_item, &mut results);
                        }
                    }
                }
            }
        }
    }

    Ok(results)
}

fn parse_search_music_item(item: &serde_json::Value, results: &mut SearchResults) {
    if let Some(video_id) = extract_video_id_from_item(item) {
        let title = extract_title_from_item(item);
        let subtitle_text = item
            .get("flexColumns")
            .and_then(|f| f.as_array())
            .and_then(|a| a.get(1))
            .and_then(|c| c.get("musicResponsiveListItemFlexColumnRenderer"))
            .and_then(|r| r.get("text"))
            .and_then(get_text_from_runs)
            .unwrap_or_default();
        let cover_url = extract_thumbnail_from_item(item);
        let duration = extract_duration_from_item(item);

        let artist = if subtitle_text.contains(" - ") {
            subtitle_text.splitn(2, " - ").last().unwrap_or("Unknown").to_string()
        } else if subtitle_text.contains("  ") {
            subtitle_text.splitn(2, "  ").last().unwrap_or("Unknown").to_string()
        } else if subtitle_text.contains('·') {
            subtitle_text.splitn(2, '·').last().unwrap_or("Unknown").trim().to_string()
        } else {
            subtitle_text
        };

        results.songs.push(SongData {
            id: video_id.clone(),
            video_id,
            title,
            artist,
            artist_id: None,
            album: None,
            album_id: None,
            album_art_url: cover_url,
            duration,
        });
        return;
    }

    let nav = item.get("navigationEndpoint");
    let browse_id = nav
        .and_then(|n| n.get("browseEndpoint"))
        .and_then(|b| b.get("browseId"))
        .and_then(|b| b.as_str());

    let page_type = nav
        .and_then(|n| n.get("browseEndpoint"))
        .and_then(|b| b.get("browseEndpointContextSupportedConfigs"))
        .and_then(|c| c.get("browseEndpointContextMusicConfig"))
        .and_then(|c| c.get("pageType"))
        .and_then(|t| t.as_str())
        .unwrap_or("");

    let title = extract_title_from_item(item);

    let subtitle = item
        .get("flexColumns")
        .and_then(|f| f.as_array())
        .and_then(|a| a.get(1))
        .and_then(|c| c.get("musicResponsiveListItemFlexColumnRenderer"))
        .and_then(|r| r.get("text"))
        .and_then(get_text_from_runs)
        .unwrap_or_default();

    let cover_url = extract_thumbnail_from_item(item);

    if let Some(bid) = browse_id {
        match page_type {
            "MUSIC_PAGE_TYPE_ALBUM" => {
                results.albums.push(AlbumData {
                    id: bid.to_string(),
                    browse_id: bid.to_string(),
                    title,
                    artist: subtitle,
                    artist_id: None,
                    year: None,
                    cover_url,
                    song_count: None,
                    songs: Vec::new(),
                });
            }
            "MUSIC_PAGE_TYPE_ARTIST" => {
                results.artists.push(ArtistData {
                    id: bid.to_string(),
                    browse_id: bid.to_string(),
                    name: title,
                    image_url: cover_url,
                    subscribers: None,
                    songs: Vec::new(),
                    albums: Vec::new(),
                });
            }
            "MUSIC_PAGE_TYPE_PLAYLIST" => {
                results.playlists.push(PlaylistData {
                    id: bid.to_string(),
                    browse_id: bid.to_string(),
                    title,
                    description: Some(subtitle),
                    cover_url,
                    song_count: None,
                    owner: None,
                    songs: Vec::new(),
                });
            }
            _ => {
                results.playlists.push(PlaylistData {
                    id: bid.to_string(),
                    browse_id: bid.to_string(),
                    title,
                    description: Some(subtitle),
                    cover_url,
                    song_count: None,
                    owner: None,
                    songs: Vec::new(),
                });
            }
        }
    }
}

pub async fn get_search_suggestions(query: &str) -> Result<Vec<String>, String> {
    let body = serde_json::json!({
        "context": get_context(),
        "input": query
    });

    let resp = CLIENT
        .post(format!(
            "https://music.youtube.com/youtubei/v1/music/get_search_suggestions?key={}",
            INNERTUBE_API_KEY
        ))
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    let data: serde_json::Value = resp
        .json()
        .await
        .map_err(|e| format!("Parse failed: {}", e))?;

    let mut suggestions = Vec::new();

    if let Some(contents) = data.get("contents").and_then(|c| c.as_array()) {
        for content in contents {
            if let Some(suggestions_renderer) = content.get("searchSuggestionsSectionRenderer") {
                if let Some(items) = suggestions_renderer
                    .get("contents")
                    .and_then(|c| c.as_array())
                {
                    for item in items {
                        if let Some(suggestion_renderer) = item.get("searchSuggestionRenderer") {
                            if let Some(text) = suggestion_renderer
                                .get("searchSuggestionTerm")
                                .and_then(|t| t.get("runs"))
                                .and_then(|r| r.as_array())
                                .and_then(|a| a.first())
                                .and_then(|r| r.get("text"))
                                .and_then(|t| t.as_str())
                            {
                                suggestions.push(text.to_string());
                            }
                        }
                    }
                }
            }
        }
    }

    Ok(suggestions)
}

fn get_music_responsive_header(data: &serde_json::Value) -> Option<&serde_json::Value> {
    if let Some(hr) = data.get("header") {
        if hr.get("musicDetailHeaderRenderer").is_some() || hr.get("musicPlaylistHeaderRenderer").is_some() || hr.get("musicImmersiveHeaderRenderer").is_some() {
            return Some(hr);
        }
    }

    data.get("contents")
        .and_then(|c| c.get("twoColumnBrowseResultsRenderer"))
        .and_then(|tc| tc.get("tabs"))
        .and_then(|t| t.as_array())
        .and_then(|t| t.first())
        .and_then(|t| t.get("tabRenderer"))
        .and_then(|t| t.get("content"))
        .and_then(|c| c.get("sectionListRenderer"))
        .and_then(|s| s.get("contents"))
        .and_then(|c| c.as_array())
        .and_then(|arr| arr.first())
        .and_then(|s| s.get("musicResponsiveHeaderRenderer"))
        .map(|hr| hr)
        .or_else(|| {
            data.get("contents")
                .and_then(|c| c.get("twoColumnBrowseResultsRenderer"))
                .and_then(|tc| tc.get("tabs"))
                .and_then(|t| t.as_array())
                .and_then(|t| t.first())
                .and_then(|t| t.get("tabRenderer"))
                .and_then(|t| t.get("content"))
                .and_then(|c| c.get("sectionListRenderer"))
                .and_then(|s| s.get("contents"))
                .and_then(|c| c.as_array())
                .and_then(|arr| arr.first())
                .and_then(|s| s.get("musicResponsiveHeaderRenderer"))
        })
}

fn extract_header_info(data: &serde_json::Value) -> (String, String, Option<String>, Option<u32>, Option<String>, Option<u32>) {
    let header = get_music_responsive_header(data);

    if let Some(hr) = header {
        if hr.get("musicImmersiveHeaderRenderer").is_some() {
            let h = hr.get("musicImmersiveHeaderRenderer").unwrap();
            let name = h.get("title")
                .and_then(|t| t.get("runs"))
                .and_then(|r| r.as_array())
                .and_then(|a| a.first())
                .and_then(|r| r.get("text"))
                .and_then(|t| t.as_str())
                .unwrap_or("Unknown")
                .to_string();
            let cover_url = h.get("thumbnail")
                .and_then(|t| t.get("musicThumbnailRenderer"))
                .and_then(|t| t.get("thumbnail"))
                .and_then(|t| t.get("thumbnails"))
                .and_then(extract_thumbnails)
                .or_else(|| {
                    h.get("thumbnail")
                        .and_then(|t| t.get("thumbnails"))
                        .and_then(extract_thumbnails)
                });
            let subscribers = h.get("monthlyListenerCount")
                .and_then(|m| m.get("runs"))
                .and_then(|r| r.as_array())
                .and_then(|a| a.first())
                .and_then(|r| r.get("text"))
                .and_then(|t| t.as_str())
                .map(|s| s.to_string());
            return (name, "Unknown".to_string(), cover_url, None, subscribers, None);
        }

        let header_obj = hr.get("musicResponsiveHeaderRenderer")
            .or_else(|| hr.get("musicDetailHeaderRenderer"))
            .or_else(|| hr.get("musicPlaylistHeaderRenderer"))
            .unwrap_or(hr);

        let title = header_obj.get("title")
            .and_then(get_text_from_runs)
            .unwrap_or_else(|| "Unknown".to_string());

        let subtitle_text = header_obj.get("subtitle")
            .and_then(get_text_from_runs)
            .unwrap_or_default();

        let artist_name = header_obj.get("straplineTextOne")
            .and_then(get_text_from_runs)
            .unwrap_or_else(|| subtitle_text.clone());

        let artist_id = header_obj.get("straplineTextOne")
            .and_then(|s| s.get("runs"))
            .and_then(|r| r.as_array())
            .and_then(|a| a.first())
            .and_then(|r| r.get("navigationEndpoint"))
            .and_then(|n| n.get("browseEndpoint"))
            .and_then(|b| b.get("browseId"))
            .and_then(|b| b.as_str())
            .map(|s| s.to_string())
            .or_else(|| {
                header_obj.get("subtitle")
                    .and_then(|s| s.get("runs"))
                    .and_then(|r| r.as_array())
                    .and_then(|a| a.iter().find(|r| r.get("navigationEndpoint").is_some()))
                    .and_then(|r| r.get("navigationEndpoint"))
                    .and_then(|n| n.get("browseEndpoint"))
                    .and_then(|b| b.get("browseId"))
                    .and_then(|b| b.as_str())
                    .map(|s| s.to_string())
            });

        let cover_url = header_obj.get("thumbnail")
            .and_then(|t| t.get("musicThumbnailRenderer"))
            .and_then(|t| t.get("thumbnail"))
            .and_then(|t| t.get("thumbnails"))
            .or_else(|| header_obj.get("thumbnail").and_then(|t| t.get("thumbnails")))
            .or_else(|| header_obj.get("image")
                .and_then(|i| i.get("musicThumbnailRenderer"))
                .and_then(|t| t.get("thumbnail"))
                .and_then(|t| t.get("thumbnails")))
            .and_then(extract_thumbnails);

        let year = subtitle_text
            .split_whitespace()
            .last()
            .and_then(|n| n.parse::<u32>().ok());

        let song_count = header_obj.get("secondSubtitle")
            .and_then(get_text_from_runs)
            .or_else(|| header_obj.get("secondSubtitle")
                .and_then(|s| s.get("simpleText"))
                .and_then(|s| s.as_str())
                .map(|s| s.to_string()))
            .and_then(|s| {
                s.split_whitespace()
                    .find(|part| part.chars().all(|c| c.is_ascii_digit()))
                    .and_then(|n| n.parse::<u32>().ok())
            });

        let _owner = header_obj.get("subtitle")
            .and_then(get_text_from_runs);

        return (title, artist_name, artist_id, year, cover_url, song_count);
    }

    let mf = data.get("microformat")
        .and_then(|m| m.get("microformatDataRenderer"));

    if let Some(mf) = mf {
        let title = mf.get("title")
            .and_then(|t| t.as_str())
            .unwrap_or("Unknown")
            .to_string();
        let description = mf.get("description")
            .and_then(|d| d.as_str())
            .unwrap_or("")
            .to_string();
        let cover_url = mf.get("thumbnail")
            .and_then(|t| t.get("thumbnails"))
            .and_then(extract_thumbnails);

        return (title, description, None, None, cover_url, None);
    }

    ("Unknown".to_string(), "Unknown".to_string(), None, None, None, None)
}

fn parse_song_items(shelf: &serde_json::Value) -> Vec<SongData> {
    let mut songs = Vec::new();
    if let Some(items) = shelf.get("contents").and_then(|c| c.as_array()) {
        for item in items {
            if let Some(renderer) = item.get("musicResponsiveListItemRenderer") {
                if let Some(song) = parse_song_from_music_item(renderer) {
                    songs.push(song);
                }
            }
        }
    }
    songs
}

fn get_section_contents(data: &serde_json::Value) -> Option<&serde_json::Value> {
    data.get("contents")
        .and_then(|c| c.get("singleColumnBrowseResultsRenderer"))
        .and_then(|r| r.get("tabs"))
        .and_then(|t| t.as_array())
        .and_then(|t| t.first())
        .and_then(|t| t.get("tabRenderer"))
        .and_then(|t| t.get("content"))
        .and_then(|c| c.get("sectionListRenderer"))
        .and_then(|s| s.get("contents"))
}

fn get_two_column_secondary(data: &serde_json::Value) -> Option<&serde_json::Value> {
    data.get("contents")
        .and_then(|c| c.get("twoColumnBrowseResultsRenderer"))
        .and_then(|c| c.get("secondaryContents"))
        .and_then(|s| s.get("sectionListRenderer"))
        .and_then(|s| s.get("contents"))
}

fn find_song_shelf(data: &serde_json::Value) -> Option<&serde_json::Value> {
    if let Some(shelf) = get_two_column_secondary(data)
        .and_then(|c| c.as_array())
        .and_then(|arr| arr.iter().find(|s| {
            s.get("musicShelfRenderer").is_some() || s.get("musicPlaylistShelfRenderer").is_some()
        }))
        .and_then(|s| s.get("musicShelfRenderer").or_else(|| s.get("musicPlaylistShelfRenderer")))
    {
        return Some(shelf);
    }

    get_section_contents(data)
        .and_then(|c| c.as_array())
        .and_then(|arr| arr.iter().find(|s| {
            s.get("musicShelfRenderer").is_some() || s.get("musicPlaylistShelfRenderer").is_some()
        }))
        .and_then(|s| s.get("musicShelfRenderer").or_else(|| s.get("musicPlaylistShelfRenderer")))
}

pub async fn get_playlist(browse_id: &str) -> Result<PlaylistData, String> {
    let body = serde_json::json!({
        "context": get_context(),
        "browseId": browse_id
    });

    let resp = CLIENT
        .post(format!(
            "https://music.youtube.com/youtubei/v1/browse?key={}",
            INNERTUBE_API_KEY
        ))
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    let data: serde_json::Value = resp
        .json()
        .await
        .map_err(|e| format!("Parse failed: {}", e))?;

    let (title, artist_name, _artist_id, _year, cover_url, song_count) = extract_header_info(&data);

    let songs = find_song_shelf(&data)
        .map(parse_song_items)
        .unwrap_or_default();

    Ok(PlaylistData {
        id: browse_id.to_string(),
        browse_id: browse_id.to_string(),
        title,
        description: Some(artist_name.clone()),
        cover_url,
        song_count,
        owner: Some(artist_name),
        songs,
    })
}

pub async fn get_album(browse_id: &str) -> Result<AlbumData, String> {
    let body = serde_json::json!({
        "context": get_context(),
        "browseId": browse_id
    });

    let resp = CLIENT
        .post(format!(
            "https://music.youtube.com/youtubei/v1/browse?key={}",
            INNERTUBE_API_KEY
        ))
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    let data: serde_json::Value = resp
        .json()
        .await
        .map_err(|e| format!("Parse failed: {}", e))?;

    let (title, artist, artist_id, year, cover_url, song_count) = extract_header_info(&data);

    let songs = find_song_shelf(&data)
        .map(parse_song_items)
        .unwrap_or_default();

    Ok(AlbumData {
        id: browse_id.to_string(),
        browse_id: browse_id.to_string(),
        title,
        artist,
        artist_id: artist_id,
        year,
        cover_url,
        song_count,
        songs,
    })
}

pub async fn get_artist(browse_id: &str) -> Result<ArtistData, String> {
    let body = serde_json::json!({
        "context": get_context(),
        "browseId": browse_id
    });

    let resp = CLIENT
        .post(format!(
            "https://music.youtube.com/youtubei/v1/browse?key={}",
            INNERTUBE_API_KEY
        ))
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    let data: serde_json::Value = resp
        .json()
        .await
        .map_err(|e| format!("Parse failed: {}", e))?;

    let header = data
        .get("header")
        .and_then(|h| h.get("musicImmersiveHeaderRenderer"))
        .or_else(|| data.get("header").and_then(|h| h.get("musicResponsiveHeaderRenderer")));

    let name = header
        .and_then(|h| h.get("title"))
        .and_then(|t| {
            t.get("runs")
                .and_then(|r| r.as_array())
                .and_then(|a| a.first())
                .and_then(|r| r.get("text"))
                .or_else(|| t.get("dynamicTextViewModel").and_then(|d| d.get("text")).and_then(|t| t.get("content")))
        })
        .and_then(|t| t.as_str())
        .unwrap_or("Unknown")
        .to_string();

    let image_url = header
        .and_then(|h| h.get("thumbnail"))
        .and_then(|t| t.get("musicThumbnailRenderer"))
        .and_then(|t| t.get("thumbnail"))
        .and_then(|t| t.get("thumbnails"))
        .or_else(|| {
            header
                .and_then(|h| h.get("thumbnail"))
                .and_then(|t| t.get("thumbnails"))
        })
        .and_then(extract_thumbnails);

    let subscribers = header
        .and_then(|h| h.get("monthlyListenerCount"))
        .and_then(|m| m.get("runs"))
        .and_then(|r| r.as_array())
        .and_then(|a| a.first())
        .and_then(|r| r.get("text"))
        .and_then(|t| t.as_str())
        .map(|s| s.to_string())
        .or_else(|| {
            header
                .and_then(|h| h.get("subtitle"))
                .and_then(|s| s.get("content"))
                .and_then(|t| t.as_str())
                .map(|s| s.to_string())
        });

    let mut songs = Vec::new();
    let mut albums = Vec::new();

    if let Some(sections_arr) = get_section_contents(&data).and_then(|c| c.as_array()) {
        for section in sections_arr {
            if let Some(shelf) = section.get("musicShelfRenderer") {
                let shelf_title = shelf
                    .get("title")
                    .and_then(get_text_from_runs)
                    .unwrap_or_default();

                if shelf_title == "Songs" || shelf_title == "Top songs" {
                    if let Some(items) = shelf.get("contents").and_then(|c| c.as_array()) {
                        for item in items {
                            if let Some(renderer) = item.get("musicResponsiveListItemRenderer") {
                                if let Some(song) = parse_song_from_music_item(renderer) {
                                    songs.push(song);
                                }
                            }
                        }
                    }
                }
            } else if let Some(carousel) = section.get("musicCarouselShelfRenderer") {
                let carousel_title = carousel
                    .get("header")
                    .and_then(|h| h.get("musicCarouselShelfBasicHeaderRenderer"))
                    .and_then(|h| h.get("title"))
                    .and_then(get_text_from_runs)
                    .unwrap_or_default();

                if carousel_title == "Albums" || carousel_title == "Singles" || carousel_title == "EPs" {
                    if let Some(contents) = carousel.get("contents").and_then(|c| c.as_array()) {
                        for content_item in contents {
                            if let Some(renderer) = content_item.get("musicTwoRowItemRenderer") {
                                let album_browse_id = renderer
                                    .get("navigationEndpoint")
                                    .and_then(|n| n.get("browseEndpoint"))
                                    .and_then(|b| b.get("browseId"))
                                    .and_then(|b| b.as_str());

                                if let Some(bid) = album_browse_id {
                                    let title = renderer
                                        .get("title")
                                        .and_then(get_text_from_runs)
                                        .unwrap_or_else(|| "Unknown".to_string());

                                    let cover_url = renderer
                                        .get("thumbnailRenderer")
                                        .and_then(|t| t.get("musicThumbnailRenderer"))
                                        .and_then(|t| t.get("thumbnail"))
                                        .and_then(|t| t.get("thumbnails"))
                                        .and_then(extract_thumbnails);

                                    let year = renderer
                                        .get("subtitle")
                                        .and_then(get_text_from_runs)
                                        .and_then(|s| {
                                            s.split_whitespace()
                                                .last()
                                                .and_then(|n| n.parse::<u32>().ok())
                                        });

                                    albums.push(AlbumData {
                                        id: bid.to_string(),
                                        browse_id: bid.to_string(),
                                        title,
                                        artist: name.clone(),
                                        artist_id: Some(browse_id.to_string()),
                                        year,
                                        cover_url,
                                        song_count: None,
                                        songs: Vec::new(),
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    Ok(ArtistData {
        id: browse_id.to_string(),
        browse_id: browse_id.to_string(),
        name,
        image_url,
        subscribers,
        songs,
        albums,
    })
}

fn find_ytdlp_path() -> Option<String> {
    let possible_paths = vec![
        "yt-dlp.exe".to_string(),
        {
            let mut p = std::env::current_exe().unwrap_or_default();
            p.pop();
            p.push("bin");
            p.push("yt-dlp.exe");
            p.to_string_lossy().to_string()
        },
        {
            let mut p = std::env::current_exe().unwrap_or_default();
            p.pop();
            p.push("yt-dlp.exe");
            p.to_string_lossy().to_string()
        },
    ];

    for path in &possible_paths {
        if std::path::Path::new(path).exists() {
            return Some(path.clone());
        }
    }

    let output = Command::new("where").arg("yt-dlp").output().ok();
    if let Some(out) = output {
        if out.status.success() {
            let stdout = String::from_utf8_lossy(&out.stdout);
            if let Some(first_line) = stdout.lines().next() {
                let trimmed = first_line.trim();
                if std::path::Path::new(trimmed).exists() {
                    return Some(trimmed.to_string());
                }
            }
        }
    }

    None
}

pub async fn get_stream_url(video_id: &str) -> Result<String, String> {
    if let Some(ytdlp_path) = find_ytdlp_path() {
        let output = Command::new(&ytdlp_path)
            .args([
                "-f", "ba",
                "--get-url",
                "--no-warnings",
                "--no-playlist",
                &format!("https://www.youtube.com/watch?v={}", video_id),
            ])
            .output()
            .map_err(|e| format!("Failed to run yt-dlp: {}", e))?;

        if output.status.success() {
            let url = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if !url.is_empty() && url.starts_with("http") {
                return Ok(url);
            }
        }

        let stderr = String::from_utf8_lossy(&output.stderr);
        eprintln!("yt-dlp stderr: {}", stderr);
    }

    Err("yt-dlp is required for playback. Install it from https://github.com/yt-dlp/yt-dlp/releases and place yt-dlp.exe in the app's bin/ directory or add it to PATH.".to_string())
}

pub async fn get_lyrics(video_id: &str) -> Result<Option<String>, String> {
    let body = serde_json::json!({
        "context": get_context(),
        "videoId": video_id
    });

    let resp = CLIENT
        .post(format!(
            "https://music.youtube.com/youtubei/v1/player?key={}",
            INNERTUBE_API_KEY
        ))
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    let data: serde_json::Value = resp
        .json()
        .await
        .map_err(|e| format!("Parse failed: {}", e))?;

    if let Some(lyrics_endpoint) = data
        .get("videoDetails")
        .and_then(|v| v.get("lyricsEndpoint"))
        .and_then(|l| l.get("browseEndpoint"))
        .and_then(|b| b.get("browseId"))
        .and_then(|b| b.as_str())
    {
        let lyrics_body = serde_json::json!({
            "context": get_context(),
            "browseId": lyrics_endpoint
        });

        let lyrics_resp = CLIENT
            .post(format!(
                "https://music.youtube.com/youtubei/v1/browse?key={}",
                INNERTUBE_API_KEY
            ))
            .json(&lyrics_body)
            .send()
            .await
            .map_err(|e| format!("Lyrics request failed: {}", e))?;

        let lyrics_data: serde_json::Value = lyrics_resp
            .json()
            .await
            .map_err(|e| format!("Lyrics parse failed: {}", e))?;

        if let Some(lyrics_content) = lyrics_data
            .get("contents")
            .and_then(|c| c.get("sectionListRenderer"))
            .and_then(|s| s.get("contents"))
            .and_then(|c| c.as_array())
            .and_then(|c| c.first())
            .and_then(|c| c.get("musicSectionRenderer"))
            .and_then(|s| s.get("contents"))
            .and_then(|c| c.as_array())
            .and_then(|c| c.first())
            .and_then(|c| c.get("musicResponsiveListItemRenderer"))
            .and_then(|r| r.get("overlay"))
            .and_then(|o| o.get("musicDescriptionShelfRenderer"))
            .and_then(|d| d.get("description"))
            .and_then(|d| d.get("runs"))
            .and_then(|r| r.as_array())
        {
            let text: String = lyrics_content
                .iter()
                .filter_map(|r| r.get("text").and_then(|t| t.as_str()))
                .collect::<Vec<&str>>()
                .join("");

            if !text.is_empty() {
                return Ok(Some(text));
            }
        }
    }

    Ok(None)
}
