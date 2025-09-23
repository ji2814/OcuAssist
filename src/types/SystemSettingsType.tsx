export interface SystemSettingsType {
    theme: 'light' | 'dark';
    uiScale: number; // 全局界面缩放百分比（例如 100 表示 100%）
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