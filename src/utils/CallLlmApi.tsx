import { LLMApiConfig } from '../types/SystemSettingsType';
import { fetch } from '@tauri-apps/plugin-http';

import { ChatHistory } from '../types/AIChatType';


export async function callLlmApi(apiConfig: LLMApiConfig, messages: ChatHistory,
    thinking: boolean = false, stream: boolean = false) {
    console.log('LLM API Config:', apiConfig);
    console.log('LLM API Request:', messages);

    const thinkingFlag = thinking ? 'enabled' : 'disabled';
    try {
        const response = await fetch(apiConfig.base_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiConfig.api_key}`
            },
            body: JSON.stringify({
                model: apiConfig.model_name,
                messages: messages,
                stream: stream,
                thinking: {
                    "type": thinkingFlag
                }
            })
        });
        if (response.ok) {
            const data = await response.json();
            console.log('LLM API Response:', data.choices[0].message);
            return data.choices[0].message;
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error calling LLM API:', error);
        throw error;
    }
}