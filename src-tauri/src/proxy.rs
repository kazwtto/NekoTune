use reqwest::Client;
use std::collections::HashMap;
use std::sync::{LazyLock, Mutex};
use std::sync::atomic::{AtomicU64, Ordering};
use tauri::http::{Request, Response, StatusCode};
use tauri::{UriSchemeContext, UriSchemeResponder, Wry};

static PROXY_CLIENT: LazyLock<Client> = LazyLock::new(|| {
    Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
        .build()
        .expect("Failed to create proxy HTTP client")
});

static URL_REGISTRY: LazyLock<Mutex<HashMap<u64, String>>> =
    LazyLock::new(|| Mutex::new(HashMap::new()));
static URL_COUNTER: AtomicU64 = AtomicU64::new(1);

pub fn register_url(url: String) -> u64 {
    let id = URL_COUNTER.fetch_add(1, Ordering::Relaxed);
    URL_REGISTRY.lock().unwrap().insert(id, url);
    id
}

fn error_response(status: StatusCode, body: &str) -> Response<Vec<u8>> {
    Response::builder()
        .status(status)
        .body(body.as_bytes().to_vec())
        .unwrap()
}

use std::io::Read;

fn mime_from_ext(path: &std::path::Path) -> &str {
    match path.extension().and_then(|e| e.to_str()).unwrap_or("").to_lowercase().as_str() {
        "mp3" => "audio/mpeg",
        "flac" => "audio/flac",
        "ogg" => "audio/ogg",
        "wav" => "audio/wav",
        "m4a" | "aac" => "audio/aac",
        "wma" => "audio/x-ms-wma",
        "opus" => "audio/opus",
        "aiff" => "audio/aiff",
        "webm" => "audio/webm",
        _ => "application/octet-stream",
    }
}

fn serve_local_file(path: &std::path::Path, request: &Request<Vec<u8>>, responder: UriSchemeResponder) {
    let mime = mime_from_ext(path);
    let file_size = std::fs::metadata(path).map(|m| m.len()).unwrap_or(0);

    if let Some(range) = request.headers().get("range") {
        let range_str = range.to_str().unwrap_or("");
        if let Some(r) = range_str.strip_prefix("bytes=") {
            let parts: Vec<&str> = r.split('-').collect();
            if let Ok(start) = parts[0].parse::<u64>() {
                let end = parts.get(1).and_then(|e| e.parse::<u64>().ok()).unwrap_or(file_size - 1);
                let len = (end - start + 1) as usize;
                let mut file = match std::fs::File::open(path) {
                    Ok(f) => f,
                    Err(e) => {
                        responder.respond(error_response(StatusCode::INTERNAL_SERVER_ERROR, &format!("Open error: {e}")));
                        return;
                    }
                };
                use std::io::Seek;
                if file.seek(std::io::SeekFrom::Start(start)).is_err() {
                    responder.respond(error_response(StatusCode::INTERNAL_SERVER_ERROR, "Seek error"));
                    return;
                }
                let mut buf = vec![0u8; len];
                if file.read_exact(&mut buf).is_err() {
                    responder.respond(error_response(StatusCode::INTERNAL_SERVER_ERROR, "Read error"));
                    return;
                }
                let content_range = format!("bytes {}-{}/{}", start, end, file_size);
                let resp = Response::builder()
                    .status(StatusCode::PARTIAL_CONTENT)
                    .header("content-type", mime)
                    .header("content-length", len)
                    .header("content-range", content_range)
                    .header("accept-ranges", "bytes")
                    .body(buf)
                    .unwrap();
                responder.respond(resp);
                return;
            }
        }
    }

    let mut file = match std::fs::File::open(path) {
        Ok(f) => f,
        Err(e) => {
            responder.respond(error_response(StatusCode::INTERNAL_SERVER_ERROR, &format!("Open error: {e}")));
            return;
        }
    };
    let mut buf = Vec::new();
    if file.read_to_end(&mut buf).is_err() {
        responder.respond(error_response(StatusCode::INTERNAL_SERVER_ERROR, "Read error"));
        return;
    }
    let resp = Response::builder()
        .status(StatusCode::OK)
        .header("content-type", mime)
        .header("content-length", buf.len())
        .header("accept-ranges", "bytes")
        .body(buf)
        .unwrap();
    responder.respond(resp);
}

pub fn handle_protocol_request(
    _ctx: UriSchemeContext<'_, Wry>,
    request: Request<Vec<u8>>,
    responder: UriSchemeResponder,
) {
    let path = request.uri().path().to_string();
    let trimmed = path.trim_start_matches('/');

    if trimmed.is_empty() {
        responder.respond(error_response(StatusCode::BAD_REQUEST, "Empty path"));
        return;
    }

    let target_url = if let Ok(id) = trimmed.parse::<u64>() {
        match URL_REGISTRY.lock().unwrap().get(&id) {
            Some(url) => {
                let p = std::path::Path::new(url);
                if p.exists() && p.is_file() {
                    serve_local_file(p, &request, responder);
                    return;
                }
                url.clone()
            }
            None => {
                responder.respond(error_response(StatusCode::NOT_FOUND, "URL ID not found"));
                return;
            }
        }
    } else {
        match percent_encoding::percent_decode(trimmed.as_bytes())
            .decode_utf8_lossy()
            .into_owned()
        {
            s if s.starts_with("http://") || s.starts_with("https://") => s,
            s => {
                let path = std::path::Path::new(&s);
                if path.exists() && path.is_file() {
                    serve_local_file(path, &request, responder);
                    return;
                }
                responder.respond(error_response(StatusCode::BAD_REQUEST, "Only HTTP/HTTPS URLs, numeric IDs, or local file paths allowed"));
                return;
            }
        }
    };

    std::thread::spawn(move || {
        let rt = tokio::runtime::Runtime::new().unwrap();
        rt.block_on(async {
            let mut req_builder = PROXY_CLIENT.get(&target_url);

            if let Some(range) = request.headers().get("range") {
                req_builder = req_builder.header("range", range);
            }
            if let Some(ac) = request.headers().get("accept") {
                req_builder = req_builder.header("accept", ac);
            }

            let upstream = match req_builder.send().await {
                Ok(r) => r,
                Err(e) => {
                    responder.respond(error_response(StatusCode::BAD_GATEWAY, &format!("Upstream error: {e}")));
                    return;
                }
            };

            let status = StatusCode::from_u16(upstream.status().as_u16())
                .unwrap_or(StatusCode::INTERNAL_SERVER_ERROR);

            let mut builder = Response::builder().status(status);

            for header in &["content-type", "content-length", "content-range", "accept-ranges"] {
                if let Some(val) = upstream.headers().get(*header) {
                    builder = builder.header(*header, val);
                }
            }

            match upstream.bytes().await {
                Ok(body) => {
                    responder.respond(builder.body(body.to_vec()).unwrap());
                }
                Err(e) => {
                    responder.respond(error_response(StatusCode::BAD_GATEWAY, &format!("Body error: {e}")));
                }
            }
        });
    });
}
