import { useState } from 'react';
import { FaFileExport, FaCog, FaUserMd } from 'react-icons/fa';
import { useDoctorSettings } from '../../context/DoctorInfo';
import { useAppSettings } from '../../context/AppSettings';
import { SystemSettingsType } from '../../types/SystemSettingsType';
import DoctorInfoDialog from './Dialogs/DoctorInfoDialog';
import SettingsDialog from './Dialogs/SettingsDialog';
import DiagnosticReport from './Dialogs/DiagnosticReport';

// 工具栏按钮接口
interface ToolbarButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    tooltip?: string;
}

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
        updateDoctorInfo,
        exportReport
    } = useDoctorSettings();
    
    const {
        settings: systemSettings,
        updateSettings: updateSystemSettings,
        isLoading: isSettingsLoading
    } = useAppSettings();
    
    const [isDoctorInfoDialogOpen, setIsDoctorInfoDialogOpen] = useState(false);
    const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
    const [isDiagnosticReportOpen, setIsDiagnosticReportOpen] = useState(false);
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
            alert('报告导出成功！');
        } catch (error) {
            throw new Error('报告导出失败：' + (error instanceof Error ? error.message : '未知错误'));
        }
    };

    // 打开诊断报告
    const handleExportDiagnosisReport = () => {
        setIsDiagnosticReportOpen(true);
    };

    // 打开医生信息对话框
    const handleDoctorInfo = () => {
        setIsDoctorInfoDialogOpen(true);
    };

    // 打开系统设置对话框
    const handleSettings = () => {
        setIsSettingsDialogOpen(true);
    };

    // 保存医生信息
    const handleSaveDoctorInfo = (newDoctorInfo: { name: string; diagnosisTime: string }) => {
        updateDoctorInfo(newDoctorInfo);
        alert('医生信息保存成功！');
    };

    // 保存系统设置
    const handleSaveSettings = async (newSettings: SystemSettingsType) => {
        try {
            await updateSystemSettings(newSettings);
            alert('系统设置保存成功！');
        } catch (error) {
            alert(error instanceof Error ? error.message : '保存设置失败');
            throw error;
        }
    };

    console.log("AppTools");

    return (
        <>
            {/* 右侧区域：用户操作功能 */}
            <div className="flex items-center gap-2">
                <ToolbarButton
                    icon={<FaFileExport />}
                    label="检测报告"
                    onClick={() => handleUserAction('export-recognition-report')}
                    tooltip="导出检测报告"
                    disabled={isLoading}
                />
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

            {/* 医生信息对话框 */}
            <DoctorInfoDialog
                isOpen={isDoctorInfoDialogOpen}
                onClose={() => setIsDoctorInfoDialogOpen(false)}
                currentDoctorInfo={doctorInfo}
                onSave={handleSaveDoctorInfo}
            />

            {/* 系统设置对话框 */}
            <SettingsDialog
                isOpen={isSettingsDialogOpen}
                onClose={() => setIsSettingsDialogOpen(false)}
                currentSettings={systemSettings}
                onSave={handleSaveSettings}
            />
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

            {/* 诊断报告对话框 */}
            <DiagnosticReport
                isOpen={isDiagnosticReportOpen}
                onClose={() => setIsDiagnosticReportOpen(false)}
            />
        </>
    );
};

export default AppTools;