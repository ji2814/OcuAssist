import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserMd, FaCalendarAlt, FaSave, FaTimes } from 'react-icons/fa';
import { useDoctorSettings } from '../context/DoctorInfo';

const DoctorInfoDialog: React.FC = () => {
    const navigate = useNavigate();
    const { doctorInfo, updateDoctorInfo } = useDoctorSettings();
    
    const [doctorName, setDoctorName] = useState('');
    const [diagnosisTime, setDiagnosisTime] = useState('');

    useEffect(() => {
        setDoctorName(doctorInfo?.name || '');
        setDiagnosisTime(doctorInfo?.diagnosisTime || new Date().toLocaleString('zh-CN'));
    }, [doctorInfo]);

    const handleSave = () => {
        if (!doctorName.trim()) {
            alert('请输入医生姓名');
            return;
        }
        
        updateDoctorInfo({
            name: doctorName.trim(),
            diagnosisTime: diagnosisTime || new Date().toLocaleString('zh-CN')
        });
        
        alert('医生信息保存成功！');
        navigate("/");
    };

    const handleCancel = () => {
        navigate("/");
    };

    const handleSetCurrentTime = () => {
        setDiagnosisTime(new Date().toLocaleString('zh-CN'));
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <FaUserMd className="text-blue-600" />
                        医生信息设置
                    </h1>
                    <p className="text-gray-600">请输入医生的基本信息</p>
                </div>
                
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
                    <div>
                        <label htmlFor="doctorName" className="block text-sm font-medium text-gray-700 mb-2">
                            医生姓名 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="doctorName"
                            value={doctorName}
                            onChange={(e) => setDoctorName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="请输入医生姓名"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="diagnosisTime" className="block text-sm font-medium text-gray-700 mb-2">
                            诊断时间
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                id="diagnosisTime"
                                value={diagnosisTime}
                                onChange={(e) => setDiagnosisTime(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="请输入诊断时间"
                            />
                            <button
                                type="button"
                                onClick={handleSetCurrentTime}
                                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex items-center gap-1"
                                title="设置为当前时间"
                            >
                                <FaCalendarAlt />
                            </button>
                        </div>
                    </div>

                    {/* 按钮组 */}
                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-200"
                        >
                            <FaTimes />
                            取消
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200"
                        >
                            <FaSave />
                            保存
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DoctorInfoDialog;