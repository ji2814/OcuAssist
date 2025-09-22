import React, { useState, useEffect } from 'react';
import { FaUserMd, FaCalendarAlt } from 'react-icons/fa';

interface DoctorInfoDialogProps {
    isOpen: boolean;
    onClose: () => void;
    currentDoctorInfo: {
        name: string;
        diagnosisTime: string;
    } | null;
    onSave: (doctorInfo: { name: string; diagnosisTime: string }) => void;
}

const DoctorInfoDialog: React.FC<DoctorInfoDialogProps> = ({ 
    isOpen, 
    onClose, 
    currentDoctorInfo, 
    onSave 
}) => {
    const [doctorName, setDoctorName] = useState('');
    const [diagnosisTime, setDiagnosisTime] = useState('');

    useEffect(() => {
        if (isOpen) {
            setDoctorName(currentDoctorInfo?.name || '');
            setDiagnosisTime(currentDoctorInfo?.diagnosisTime || new Date().toLocaleString('zh-CN'));
        }
    }, [isOpen, currentDoctorInfo]);

    const handleSave = () => {
        if (!doctorName.trim()) {
            alert('请输入医生姓名');
            return;
        }
        
        onSave({
            name: doctorName.trim(),
            diagnosisTime: diagnosisTime || new Date().toLocaleString('zh-CN')
        });
        
        onClose();
    };

    const handleSetCurrentTime = () => {
        setDiagnosisTime(new Date().toLocaleString('zh-CN'));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
                <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                    <FaUserMd className="text-blue-600" />
                    医生信息设置
                </h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            医生姓名
                        </label>
                        <input
                            type="text"
                            value={doctorName}
                            onChange={(e) => setDoctorName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="请输入医生姓名"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            诊断时间
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={diagnosisTime}
                                onChange={(e) => setDiagnosisTime(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="请输入诊断时间"
                            />
                            <button
                                onClick={handleSetCurrentTime}
                                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex items-center gap-1"
                                title="设置为当前时间"
                            >
                                <FaCalendarAlt />
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        保存
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DoctorInfoDialog;