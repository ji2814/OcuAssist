import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { exists, writeTextFile, readTextFile,mkdir, BaseDirectory } from '@tauri-apps/plugin-fs';
import { platform } from '@tauri-apps/plugin-os';
import { SystemSettingsType } from '../types/SystemSettingsType';

// 创建Context
interface AppSettingsContextType {
    settings: SystemSettingsType;
    isLoading: boolean;
    error: string | null;
    updateSettings: (settings: SystemSettingsType) => Promise<void>;
    loadSettings: () => Promise<void>;
    resetToDefault: () => Promise<void>;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

// 获取默认UI缩放比例（根据平台自动调整）
const getDefaultUIScale = (): number => {
    // 检测平台
    const currentPlatform = platform();
    const isWindows = currentPlatform.includes('windows');
    
    // Windows系统默认使用95%缩放以适配字体大小差异
    return isWindows ? 95 : 100;
};

// 默认设置
const defaultSettings: SystemSettingsType = {
    theme: 'light',
    uiScale: getDefaultUIScale(),
    llmConfig: {
        diagnosis: {
            model_name: 'glm-4.5v',
            api_key: 'f13e9d9620b946b9aee8ab7f668b2c2d.RxpDFAR73XgV6hbG',
            base_url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
        },
        chat: {
            model_name: 'glm-4.5v',
            api_key: 'f13e9d9620b946b9aee8ab7f668b2c2d.RxpDFAR73XgV6hbG',
            base_url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
        }
    }
};

// 设置文件路径
const SETTINGS_FILE = 'settings.json';

export const AppSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<SystemSettingsType>(defaultSettings);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 加载设置
    const loadSettings = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            // 检查设置文件是否存在
            const fileExists = await exists(SETTINGS_FILE, { baseDir: BaseDirectory.AppConfig });
            
            if (fileExists) {
                // 读取现有设置
                const content = await readTextFile(SETTINGS_FILE, { baseDir: BaseDirectory.AppConfig });
                const loadedSettings = JSON.parse(content) as SystemSettingsType;
                
                // 验证设置结构
                if (validateSettings(loadedSettings)) {
                    setSettings(loadedSettings);
                    applyTheme(loadedSettings.theme);
                    applyUIScale(loadedSettings.uiScale);
                    console.log('设置加载成功');
                } else {
                    throw new Error('设置文件格式无效');
                }
            } else {
                // 创建默认设置文件
                await saveSettings(defaultSettings);
                console.log('创建默认设置文件');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '加载设置失败';
            setError(errorMessage);
            console.error('加载设置失败:', err);
            
            // 如果加载失败，使用默认设置
            setSettings(defaultSettings);
            applyTheme(defaultSettings.theme);
            applyUIScale(defaultSettings.uiScale);
        } finally {
            setIsLoading(false);
        }
    };

    // 保存设置
    const saveSettings = async (newSettings: SystemSettingsType) => {
        try {
            await mkdir('ocuassist', { baseDir: BaseDirectory.AppConfig, recursive: true });
            const content = JSON.stringify(newSettings, null, 2);
            await writeTextFile(SETTINGS_FILE, content, { baseDir: BaseDirectory.AppConfig });
            console.log('设置保存成功');
        } catch (err) {
            console.error('保存设置失败:', err);
            throw new Error(`保存设置失败: ${err instanceof Error ? err.message : '未知错误'}`);
        }
    };

    // 更新设置
    const updateSettings = async (newSettings: SystemSettingsType) => {
        setIsLoading(true);
        setError(null);
        
        try {
            // 验证设置
            if (!validateSettings(newSettings)) {
                throw new Error('设置格式无效');
            }

            // 保存到文件
            await saveSettings(newSettings);
            
            // 更新状态
            setSettings(newSettings);
            
            // 应用主题和UI缩放
            applyTheme(newSettings.theme);
            applyUIScale(newSettings.uiScale);
            
            console.log('设置更新成功');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '更新设置失败';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // 重置为默认设置
    const resetToDefault = async () => {
        await updateSettings(defaultSettings);
    };

    // 验证设置结构
    const validateSettings = (settings: any): settings is SystemSettingsType => {
        return (
            settings &&
            typeof settings === 'object' &&
            (settings.theme === 'light' || settings.theme === 'dark') &&
            typeof settings.uiScale === 'number' &&
            settings.uiScale >= 50 &&
            settings.uiScale <= 200 &&
            settings.llmConfig &&
            typeof settings.llmConfig === 'object' &&
            settings.llmConfig.diagnosis &&
            settings.llmConfig.chat &&
            typeof settings.llmConfig.diagnosis.model_name === 'string' &&
            typeof settings.llmConfig.diagnosis.base_url === 'string' &&
            typeof settings.llmConfig.chat.model_name === 'string' &&
            typeof settings.llmConfig.chat.base_url === 'string'
        );
    };

    // 应用主题
    const applyTheme = (theme: 'light' | 'dark') => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    // 应用UI缩放
    const applyUIScale = (scale: number) => {
        const percentage = Math.max(50, Math.min(200, scale)); // 限制在50%-200%之间
        
        // 使用CSS zoom属性
        document.body.style.zoom = `${percentage}%`;
        // 清除其他缩放相关样式
        document.body.style.transform = '';
        document.body.style.transformOrigin = '';
        document.body.style.width = '';
        document.body.style.height = '';
        
        // 同时调整根元素字体大小作为辅助
        document.documentElement.style.fontSize = `${Math.max(12, 16 * percentage / 100)}px`;
        
        // 添加缩放状态类
        if (percentage !== 100) {
            document.body.classList.add('scaling');
        } else {
            document.body.classList.remove('scaling');
        }
        
        // 保存到CSS变量供其他组件使用
        document.documentElement.style.setProperty('--ui-scale', `${percentage / 100}`);
        
        console.log(`应用UI缩放: ${percentage}% (${document.body.style.zoom ? 'zoom' : 'transform'}模式)`);
    };

    // 组件挂载时加载设置
    useEffect(() => {
        loadSettings();
    }, []);

    const contextValue: AppSettingsContextType = {
        settings,
        isLoading,
        error,
        updateSettings,
        loadSettings,
        resetToDefault
    };

    return (
        <AppSettingsContext.Provider value={contextValue}>
            {children}
        </AppSettingsContext.Provider>
    );
};

// 自定义hook用于使用Context
export const useAppSettings = () => {
    const context = useContext(AppSettingsContext);
    if (context === undefined) {
        throw new Error('useAppSettings must be used within an AppSettingsProvider');
    }
    return context;
};

export { AppSettingsContext };