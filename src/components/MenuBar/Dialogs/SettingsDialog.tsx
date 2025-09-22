import React, { useState, useEffect } from 'react';
import { SystemSettingsType } from '../../../types/SystemSettingsType';
import { FaCog, FaPalette, FaRobot, FaDesktop, FaKey } from 'react-icons/fa';

interface SettingsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    currentSettings: SystemSettingsType;
    onSave: (settings: SystemSettingsType) => Promise<void>;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({
    isOpen,
    onClose,
    currentSettings,
    onSave
}) => {
    const [activeTab, setActiveTab] = useState<'system' | 'api'>('system');
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [diagnosisModel, setDiagnosisModel] = useState('');
    const [diagnosisUrl, setDiagnosisUrl] = useState('');
    const [chatModel, setChatModel] = useState('');
    const [chatUrl, setChatUrl] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTheme(currentSettings.theme);
            setDiagnosisModel(currentSettings.llmConfig.diagnosis.model_name);
            setDiagnosisUrl(currentSettings.llmConfig.diagnosis.base_url);
            setChatModel(currentSettings.llmConfig.chat.model_name);
            setChatUrl(currentSettings.llmConfig.chat.base_url);
        }
    }, [isOpen, currentSettings]);

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

            await onSave(newSettings);
            onClose();
        } catch (error) {
            alert(error instanceof Error ? error.message : '保存设置失败');
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetToDefault = () => {
        setTheme('light');
        setDiagnosisModel('llama2');
        setDiagnosisUrl('http://localhost:8000/v1/generate');
        setChatModel('llama2');
        setChatUrl('http://localhost:8000/v1/generate');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-[700px] max-w-4xl mx-4 max-h-[80vh] overflow-hidden flex">
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
                        <button
                            onClick={() => setActiveTab('api')}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${activeTab === 'api'
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <FaKey className="text-lg" />
                            <span>API设置</span>
                        </button>
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
                                onClick={onClose}
                                disabled={isSaving}
                                className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors text-left disabled:opacity-50"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-left disabled:opacity-50"
                            >
                                {isSaving ? '保存中...' : '保存'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 右侧内容区域 */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {activeTab === 'system' && (
                        <div className="space-y-6">
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