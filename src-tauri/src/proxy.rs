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
            Some(url) => url.clone(),
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
            _ => {
                responder.respond(error_response(StatusCode::BAD_REQUEST, "Only HTTP/HTTPS URLs or numeric IDs allowed"));
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
