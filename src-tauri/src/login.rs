use tauri::{AppHandle, Manager, Url, WebviewUrl, WebviewWindowBuilder};
use tokio::sync::oneshot;

pub fn create_login_window(app: &AppHandle) -> Result<(), String> {
    if let Some(existing) = app.get_webview_window("google-login") {
        let _ = existing.set_focus();
        return Ok(());
    }

    let _window = WebviewWindowBuilder::new(
        app,
        "google-login",
        WebviewUrl::External("https://music.youtube.com".parse().unwrap()),
    )
    .title("Sign in — NekoTune")
    .inner_size(500.0, 700.0)
    .resizable(true)
    .build()
    .map_err(|e| e.to_string())?;

    Ok(())
}

pub async fn read_login_cookies(app: &AppHandle) -> Result<Option<String>, String> {
    let login_win = app
        .get_webview_window("google-login")
        .ok_or_else(|| "no-window".to_string())?;

    let ytm_url: Url = "https://music.youtube.com".parse().unwrap();

    let (tx, rx) = oneshot::channel();
    let win_clone = login_win.clone();

    login_win
        .run_on_main_thread(move || {
            let result = win_clone
                .cookies_for_url(ytm_url)
                .map_err(|e| e.to_string());
            let _ = tx.send(result);
        })
        .map_err(|e| e.to_string())?;

    let cookies = rx
        .await
        .map_err(|_| "cookie channel closed unexpectedly".to_string())??;

    let cookie_str: String = cookies
        .iter()
        .map(|c| format!("{}={}", c.name(), c.value()))
        .collect::<Vec<_>>()
        .join("; ");


    let has_auth = cookie_str.contains("SAPISID=")
        || cookie_str.contains("__Secure-3PSID=")
        || cookie_str.contains("SID=");

    if has_auth && !cookie_str.is_empty() {
        crate::api::innertube::set_account_cookie(&cookie_str);
        let _ = login_win.close();
        Ok(Some(cookie_str))
    } else {
        Ok(None)
    }
}