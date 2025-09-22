import React, { createContext, useState, useContext, ReactNode } from 'react';
import { DoctorInfoType } from '../types/DoctorInfoType';

// 创建Context
const DoctorSettingsContext = createContext<{
    doctorInfo: DoctorInfoType;
    updateDoctorInfo: (info: DoctorInfoType) => void;
    exportReport: () => Promise<void>;
    favoriteCase: () => Promise<void>;
} | undefined>(undefined);

// 默认医生信息
const defaultDoctorInfo: DoctorInfoType = {
    name: '王医生',
    diagnosisTime: new Date().toLocaleString('zh-CN')
};

// Provider组件
export const DoctorSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [doctorInfo, setDoctorInfo] = useState<DoctorInfoType>(defaultDoctorInfo);

    // 更新医生信息
    const updateDoctorInfo = (info: DoctorInfoType) => {
        setDoctorInfo(info);
        // 这里可以添加保存到本地存储的逻辑
        localStorage.setItem('doctorInfo', JSON.stringify(info));
    };

    // 导出报告功能
    const exportReport = async () => {
        try {
            // 获取当前患者信息
            const patientInfo = JSON.parse(localStorage.getItem('patientInfo') || '{}');
            
            // 获取诊断结果
            const diagnosisResults = JSON.parse(localStorage.getItem('diagnosisResults') || '{}');
            
            // 获取聊天记录
            const chatMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
            
            // 构建报告数据
            const reportData = {
                patientInfo,
                doctorInfo,
                diagnosisResults,
                chatMessages,
                exportTime: new Date().toLocaleString('zh-CN'),
                reportId: `RPT_${Date.now()}`
            };

            // 创建并下载报告文件
            const reportContent = JSON.stringify(reportData, null, 2);
            const blob = new Blob([reportContent], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `诊断报告_${patientInfo.patentName || '未知患者'}_${new Date().toLocaleDateString('zh-CN')}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            console.log('报告导出成功');
        } catch (error) {
            console.error('报告导出失败:', error);
            throw new Error('报告导出失败，请重试');
        }
    };

    // 收藏病例功能
    const favoriteCase = async () => {
        // 这个功能暂时未实现
        console.log('收藏病例功能');
    };

    const contextValue = {
        doctorInfo,
        updateDoctorInfo,
        exportReport,
        favoriteCase
    };

    return (
        <DoctorSettingsContext.Provider value={contextValue}>
            {children}
        </DoctorSettingsContext.Provider>
    );
};

// 自定义hook用于使用Context
export const useDoctorSettings = () => {
    const context = useContext(DoctorSettingsContext);
    if (context === undefined) {
        throw new Error('useDoctorSettings must be used within a DoctorSettingsProvider');
    }
    return context;
};

export { DoctorSettingsContext };