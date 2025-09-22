import React, { createContext, useState, useContext, ReactNode } from 'react';
import { PatentInfoType, PatentInfoContextType } from '../types/PatentInfoType';

// 创建Context
const PatientInfoContext = createContext<PatentInfoContextType | undefined>(undefined);

// 默认患者信息
const defaultPatentInfo: PatentInfoType = {
    patentID: '123456',
    patentName: '张三',
    age: 45,
    gender: '男',
    birthDate: '1979-03-15',
    idCardNumber: '320123197903154321'
};

// Provider组件
export const PatientInfoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [patentInfo, setPatentInfo] = useState<PatentInfoType>(defaultPatentInfo);

    return (
        <PatientInfoContext.Provider value={{ patentInfo, setPatentInfo }}>
            {children}
        </PatientInfoContext.Provider>
    );
};

// 自定义hook用于使用Context
export const usePatientInfo = () => {
    const context = useContext(PatientInfoContext);
    if (context === undefined) {
        throw new Error('usePatientInfo must be used within a PatientInfoProvider');
    }
    return context;
};

export { PatientInfoContext };