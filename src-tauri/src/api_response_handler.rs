use tauri::Emitter;
use futures::StreamExt;
use serde_json::json;


pub async fn handle_streaming_response(
    app_handle: tauri::AppHandle, 
    response: reqwest::Response
) -> Result<String, String> {
    let mut stream = response.bytes_stream();
    let mut buffer = String::new();
    let mut full_content = String::new();
    let mut is_first_chunk = true;
    
    // 创建一个唯一的流式响应ID
    let response_id = uuid::Uuid::new_v4().to_string();
    
    // 告知前端开始接收流式响应
    app_handle.emit("llm-stream-start", response_id.clone())
        .map_err(|e| format!("Failed to emit start event: {}", e))?;
    
    while let Some(chunk_result) = stream.next().await {
        match chunk_result {
            Ok(chunk) => {
                // 将字节转换为UTF-8字符串并附加到缓冲区
                if let Ok(text) = String::from_utf8(chunk.to_vec()) {
                    buffer.push_str(&text);
                    
                    // 处理缓冲区中的所有完整SSE消息
                    process_sse_buffer(&app_handle, &response_id, &mut buffer, &mut full_content, &mut is_first_chunk)?;
                }
            },
            Err(e) => {
                app_handle.emit("llm-stream-error", format!("Stream error: {}", e))
                    .ok(); // 忽略发送事件失败
                return Err(format!("Error reading stream: {}", e));
            }
        }
    }
    
    // 处理可能残留在缓冲区的任何消息
    if !buffer.is_empty() {
        process_sse_buffer(&app_handle, &response_id, &mut buffer, &mut full_content, &mut is_first_chunk)?;
    }
    
    // 告知前端流式响应已完成
    app_handle.emit("llm-stream-end", response_id)
        .map_err(|e| format!("Failed to emit end event: {}", e))?;
    
    Ok(full_content)
}

fn process_sse_buffer(
    app_handle: &tauri::AppHandle,
    response_id: &str,
    buffer: &mut String,
    full_content: &mut String,
    is_first_chunk: &mut bool
) -> Result<(), String> {
    // 按双换行符分割SSE消息
    let mut messages = Vec::new();
    let mut start_index = 0;
    
    // 寻找完整的SSE消息（以双换行符分隔）
    while let Some(index) = buffer[start_index..].find("\n\n") {
        let end_index = start_index + index;
        let message = &buffer[start_index..end_index];
        messages.push(message.to_string());
        start_index = end_index + 2;
    }
    
    // 保留未处理的部分
    if start_index < buffer.len() {
        *buffer = buffer[start_index..].to_string();
    } else {
        buffer.clear();
    }
    
    // 处理所有找到的消息
    for message in messages {
        if message.starts_with("data: ") {
            let data = &message[6..]; // 跳过"data: "前缀
            
            // 检查是否为结束标记
            if data.trim() == "[DONE]" {
                continue;
            }
            
            // 尝试解析JSON
            match serde_json::from_str::<serde_json::Value>(data) {
                Ok(json) => {
                    // 提取内容增量
                    if let Some(delta) = json["choices"][0]["delta"]["content"].as_str() {
                        // 更新完整内容
                        full_content.push_str(delta);
                        
                        // 发送增量给前端
                        let token_event = json!({
                            "id": response_id,
                            "token": delta,
                            "isFirst": *is_first_chunk
                        });
                        *is_first_chunk = false;
                        
                        app_handle.emit("llm-stream-token", token_event)
                            .map_err(|e| format!("Failed to emit token event: {}", e))?;
                    }
                },
                Err(_e) => {
                    // 继续处理下一条消息，不中断流
                    continue;
                }
            }
        }
    }
    
    Ok(())
}

pub async fn handle_standard_response(response: reqwest::Response) -> Result<String, String> {
    let result = response
        .json::<serde_json::Value>()
        .await
        .map_err(|e| format!("Failed to parse response JSON: {}", e))?;

    result["choices"][0]["message"]["content"]
        .as_str()
        .map(|s| s.to_string())
        .ok_or_else(|| "Failed to extract content from LLM response".to_string())
}
