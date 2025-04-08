pub mod config;
pub mod api_response_handler;

use serde_json::json;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn call_llm_api(
    app_handle: tauri::AppHandle,
    messages: Vec<serde_json::Value>,
    stream: Option<bool>
) -> Result<String, String> {
    let api_config: config::ApiConfig = config::load_api_config().map_err(|e| e.to_string())?;
    let should_stream = stream.unwrap_or(false);

    let client = reqwest::Client::new();
    let response = client
        .post(&api_config.endpoint)
        .header("Content-Type", "application/json")
        .header("Authorization", format!("Bearer {}", api_config.key))
        .json(&json!({
            "model": api_config.model,
            "messages": messages,
            "stream": should_stream
        }))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let status = response.status();
    if !status.is_success() {
        let error_text = response.text().await
            .unwrap_or_else(|_| String::from("Failed to read error response"));
        return Err(format!("API request failed: {} - {}", status, error_text));
    }


    let content;
    if should_stream {
        content = api_response_handler::handle_streaming_response(app_handle, response).await?;
    } else {
        content = api_response_handler::handle_standard_response(response).await?;
    }

    Ok(content)
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, call_llm_api])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
