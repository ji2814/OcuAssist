export interface SystemSettingsType {
    theme: 'light' | 'dark';
    llmConfig: {
        diagnosis: LLMApiConfig;
        chat: LLMApiConfig;
    };
}

export interface LLMApiConfig {
    model_name: string;
    api_key: string;
    base_url: string;
}