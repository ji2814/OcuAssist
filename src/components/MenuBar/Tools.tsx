import { useNavigate } from 'react-router-dom';
import { FaFileExport, FaCog, FaUserMd, FaChevronDown } from 'react-icons/fa';
import { useDoctorSettings } from '../../context/DoctorInfo';
import { useAppSettings } from '../../context/AppSettings';
import React, { useState, useRef, useEffect } from 'react';

// 工具栏按钮接口
interface ToolbarButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    tooltip?: string;
}

interface ExportDropdownProps {
    isLoading?: boolean;
}

// 导出报告下拉菜单
const ExportDropdown: React.FC<ExportDropdownProps> = ({ isLoading = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleExportReport = (type: 'recognition' | 'automorph') => {
        setIsOpen(false);
        if (type === 'recognition') {
            // 这里可以调用现有的导出功能
            alert("检测报告功能暂未实现");
        } else if (type === 'automorph') {
            navigate('/automorph-report');
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoading}
                className={`toolbar-button flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-500 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="导出报告"
            >
                <span className="text-lg"><FaFileExport /></span>
                <span className="text-sm font-medium">检测报告</span>
                <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    <FaChevronDown className="text-xs" />
                </span>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                        <button
                            onClick={() => handleExportReport('recognition')}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                        >
                            <FaFileExport className="text-gray-500" />
                            导出检测报告
                        </button>
                        <button
                            onClick={() => handleExportReport('automorph')}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                        >
                            <FaFileExport className="text-gray-500" />
                            导出Automorph报告
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
    icon,
    label,
    onClick,
    isActive = false,
    disabled = false,
    tooltip
}) => (
    <button
        className={`toolbar-button flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-500 transition-colors ${isActive ? 'active bg-blue-700' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={onClick}
        disabled={disabled}
        title={tooltip}
    >
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
    </button>
);

interface AppToolsProps {
    onUserAction?: (action: string) => void;
    doctorName?: string;
}

const AppTools: React.FC<AppToolsProps> = () => {
    const {
        doctorInfo,
        exportReport
    } = useDoctorSettings();

    const {
        isLoading: isSettingsLoading
    } = useAppSettings();

    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // 处理用户操作的主函数
    const handleUserAction = async (action: string) => {
        console.log('User action:', action);

        try {
            setIsLoading(true);

            switch (action) {
                case 'export-diagnosis-report':
                    handleExportDiagnosisReport();
                    break;

                case 'export-recognition-report':
                    await handleExportReport();
                    break;

                case 'doctor-info':
                    handleDoctorInfo();
                    break;

                case 'settings':
                    handleSettings();
                    break;

                default:
                    console.warn('未知的操作类型:', action);
            }
        } catch (error) {
            console.error('操作执行失败:', error);
            alert(error instanceof Error ? error.message : '操作失败，请重试');
        } finally {
            setIsLoading(false);
        }
    };

    // 导出报告
    const handleExportReport = async () => {
        try {
            await exportReport();
            alert("导出报告功能暂未实现");
        } catch (error) {
            throw new Error('报告导出失败：' + (error instanceof Error ? error.message : '未知错误'));
        }
    };

    // 导航到诊断报告页面
    const handleExportDiagnosisReport = () => {
        navigate('/diagnostic-report');
    };


    // 导航到医生信息页面
    const handleDoctorInfo = () => {
        navigate('/doctor-info');
    };

    // 导航到系统设置页面
    const handleSettings = () => {
        navigate('/settings');
    };

    console.log("AppTools");

    return (
        <>
            {/* 右侧区域：用户操作功能 */}
            <div className="flex items-center gap-2">
                <ExportDropdown isLoading={isLoading} />
                <ToolbarButton
                    icon={<FaFileExport />}
                    label="诊断报告"
                    onClick={() => handleUserAction('export-diagnosis-report')}
                    tooltip="导出诊断报告"
                    disabled={isLoading}
                />
                <ToolbarButton
                    icon={<FaUserMd />}
                    label={doctorInfo.name}
                    onClick={() => handleUserAction('doctor-info')}
                    tooltip="医生信息"
                    disabled={isLoading}
                />
                <ToolbarButton
                    icon={<FaCog />}
                    label="系统设置"
                    onClick={() => handleUserAction('settings')}
                    tooltip="系统设置"
                    disabled={isLoading}
                />
            </div>

            {isSettingsLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span>加载设置中...</span>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
};

export default AppTools;