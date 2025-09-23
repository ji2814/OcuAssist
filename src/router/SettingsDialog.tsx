import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SystemSettingsType } from '../types/SystemSettingsType';
import { FaCog, FaPalette, FaRobot, FaDesktop, FaSearchPlus, FaSave, FaTimes } from 'react-icons/fa';
import { useAppSettings } from '../context/AppSettings';

const SettingsDialog: React.FC = () => {
    const navigate = useNavigate();
    const { settings: currentSettings, updateSettings } = useAppSettings();
    
    const [activeTab, setActiveTab] = useState<'system' | 'api'>('system');
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [uiScale, setUiScale] = useState<number>(100);
    const [diagnosisModel, setDiagnosisModel] = useState('');
    const [diagnosisUrl, setDiagnosisUrl] = useState('');
    const [chatModel, setChatModel] = useState('');
    const [chatUrl, setChatUrl] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setTheme(currentSettings.theme);
        setUiScale(currentSettings.uiScale || 100);
        setDiagnosisModel(currentSettings.llmConfig.diagnosis.model_name);
        setDiagnosisUrl(currentSettings.llmConfig.diagnosis.base_url);
        setChatModel(currentSettings.llmConfig.chat.model_name);
        setChatUrl(currentSettings.llmConfig.chat.base_url);
    }, [currentSettings]);

    const handleSave = async () => {
        if (!diagnosisModel.trim() || !diagnosisUrl.trim() || !chatModel.trim() || !chatUrl.trim()) {
            alert('请填写完整的API配置信息');
            return;
        }

        // 验证URL格式
        try {
            new URL(diagnosisUrl);
            new URL(chatUrl);
        } catch (error) {
            alert('请输入有效的API地址');
            return;
        }

        setIsSaving(true);

        try {
            const newSettings: SystemSettingsType = {
                theme,
                uiScale: Math.max(50, Math.min(200, uiScale)), // 限制在50%-200%之间
                llmConfig: {
                    diagnosis: {
                        model_name: diagnosisModel.trim(),
                        api_key: 'your_api_key',
                        base_url: diagnosisUrl.trim()
                    },
                    chat: {
                        model_name: chatModel.trim(),
                        api_key: 'your_api_key',
                        base_url: chatUrl.trim()
                    }
                }
            };

            await updateSettings(newSettings);
            alert('系统设置保存成功！');
            navigate('/');
        } catch (error) {
            alert(error instanceof Error ? error.message : '保存设置失败');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        navigate('/');
    };

    const handleResetToDefault = () => {
        setTheme('light');
        // 根据平台设置默认缩放
        const userAgent = navigator.userAgent;
        const isWindows = userAgent.includes('Windows');
        setUiScale(isWindows ? 95 : 100);
        setDiagnosisModel('llama2');
        setDiagnosisUrl('http://localhost:8000/v1/generate');
        setChatModel('llama2');
        setChatUrl('http://localhost:8000/v1/generate');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[85vh] overflow-hidden flex">
                {/* 左侧切换按钮和操作区域 */}
                <div className="w-48 bg-gray-50 p-4 border-r border-gray-200 flex flex-col">
                    <h2 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
                        <FaCog className="text-blue-600" />
                        设置
                    </h2>
                    <div className="space-y-2 flex-1">
                        <button
                            onClick={() => setActiveTab('system')}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${activeTab === 'system'
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <FaDesktop className="text-lg" />
                            <span>系统设置</span>
                        </button>
                        {/* <button
                            onClick={() => setActiveTab('api')}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${activeTab === 'api'
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <FaKey className="text-lg" />
                            <span>API设置</span>
                        </button> */}
                    </div>

                    {/* 底部按钮 */}
                    <div className="space-y-2 border-t border-gray-200 pt-4">
                        <button
                            onClick={handleResetToDefault}
                            className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors text-left"
                        >
                            恢复默认
                        </button>
                        <div className="space-y-2">
                            <button
                                onClick={handleCancel}
                                disabled={isSaving}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors disabled:opacity-50"
                            >
                                <FaTimes />
                                取消
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                <FaSave />
                                {isSaving ? '保存中...' : '保存'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 右侧内容区域 */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {activeTab === 'system' && (
                        <div className="space-y-6">
                            {/* 界面主题 */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3 text-gray-700 flex items-center gap-2">
                                    <FaPalette className="text-purple-600" />
                                    界面主题
                                </h3>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="theme"
                                            value="light"
                                            checked={theme === 'light'}
                                            onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                                            className="text-blue-600"
                                        />
                                        <span className="text-gray-700">浅色主题</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="theme"
                                            value="dark"
                                            checked={theme === 'dark'}
                                            onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                                            className="text-blue-600"
                                        />
                                        <span className="text-gray-700">深色主题</span>
                                    </label>
                                </div>
                            </div>

                            {/* 界面缩放 */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3 text-gray-700 flex items-center gap-2">
                                    <FaSearchPlus className="text-green-600" />
                                    界面缩放
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4">
                                        <label className="text-sm font-medium text-gray-700 min-w-0">
                                            缩放比例: {uiScale}%
                                        </label>
                                        <input
                                            type="range"
                                            min="50"
                                            max="200"
                                            step="5"
                                            value={uiScale}
                                            onChange={(e) => setUiScale(Number(e.target.value))}
                                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>50%</span>
                                        <span>100%</span>
                                        <span>200%</span>
                                    </div>
                                    <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                                        <p className="font-medium">💡 提示：</p>
                                        <p>• Windows系统建议使用95%缩放以获得最佳显示效果</p>
                                        <p>• Linux/Mac系统建议使用100%缩放</p>
                                        <p>• 可根据个人偏好和屏幕分辨率调整</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setUiScale(95)}
                                            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                                        >
                                            Windows推荐(95%)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setUiScale(100)}
                                            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                                        >
                                            标准(100%)
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'api' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold mb-3 text-gray-700 flex items-center gap-2">
                                <FaRobot className="text-green-600" />
                                AI模型配置
                            </h3>

                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-800 mb-3">诊断模型</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                模型名称
                                            </label>
                                            <input
                                                type="text"
                                                value={diagnosisModel}
                                                onChange={(e) => setDiagnosisModel(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="例如: llama2, gpt-3.5-turbo"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                API地址
                                            </label>
                                            <input
                                                type="url"
                                                value={diagnosisUrl}
                                                onChange={(e) => setDiagnosisUrl(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="例如: http://localhost:8000/v1/generate"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-800 mb-3">聊天模型</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                模型名称
                                            </label>
                                            <input
                                                type="text"
                                                value={chatModel}
                                                onChange={(e) => setChatModel(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="例如: llama2, gpt-3.5-turbo"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                API地址
                                            </label>
                                            <input
                                                type="url"
                                                value={chatUrl}
                                                onChange={(e) => setChatUrl(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="例如: http://localhost:8000/v1/generate"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsDialog;