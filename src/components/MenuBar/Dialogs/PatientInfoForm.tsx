import React, { useState } from "react";
import { usePatientInfo } from "../../../context/PatientInfo";
import { useNavigate } from "react-router-dom";
import { FaSave, FaTimes } from "react-icons/fa";

const PatientInfoForm = () => {
    const { setPatentInfo } = usePatientInfo();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        patentID: "",
        patentName: "",
        age: "",
        gender: "",
        birthDate: "",
        idCardNumber: ""
    });

    const [errors, setErrors] = useState({
        patentID: "",
        patentName: "",
        age: "",
        gender: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {
            patentID: "",
            patentName: "",
            age: "",
            gender: ""
        };

        let isValid = true;

        if (!formData.patentID.trim()) {
            newErrors.patentID = "患者ID不能为空";
            isValid = false;
        }

        if (!formData.patentName.trim()) {
            newErrors.patentName = "患者姓名不能为空";
            isValid = false;
        }

        if (!formData.age || parseInt(formData.age) <= 0) {
            newErrors.age = "请输入有效的年龄";
            isValid = false;
        }

        if (!formData.gender) {
            newErrors.gender = "请选择性别";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (validateForm()) {
            // Save patient info to context
            setPatentInfo({
                patentID: formData.patentID.trim(),
                patentName: formData.patentName.trim(),
                age: parseInt(formData.age),
                gender: formData.gender,
                birthDate: formData.birthDate,
                idCardNumber: formData.idCardNumber.trim()
            });
            
            // Navigate back to main page
            navigate("/");
        }
    };

    const handleCancel = () => {
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">新建患者信息</h1>
                    <p className="text-gray-600">请输入患者的基本信息</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 患者ID */}
                        <div>
                            <label htmlFor="patentID" className="block text-sm font-medium text-gray-700 mb-2">
                                患者ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="patentID"
                                name="patentID"
                                value={formData.patentID}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.patentID ? "border-red-500" : "border-gray-300"
                                }`}
                                placeholder="请输入患者ID"
                            />
                            {errors.patentID && (
                                <p className="mt-1 text-sm text-red-600">{errors.patentID}</p>
                            )}
                        </div>

                        {/* 患者姓名 */}
                        <div>
                            <label htmlFor="patentName" className="block text-sm font-medium text-gray-700 mb-2">
                                患者姓名 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="patentName"
                                name="patentName"
                                value={formData.patentName}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.patentName ? "border-red-500" : "border-gray-300"
                                }`}
                                placeholder="请输入患者姓名"
                            />
                            {errors.patentName && (
                                <p className="mt-1 text-sm text-red-600">{errors.patentName}</p>
                            )}
                        </div>

                        {/* 年龄 */}
                        <div>
                            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                                年龄 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                id="age"
                                name="age"
                                value={formData.age}
                                onChange={handleInputChange}
                                min="0"
                                max="150"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.age ? "border-red-500" : "border-gray-300"
                                }`}
                                placeholder="请输入年龄"
                            />
                            {errors.age && (
                                <p className="mt-1 text-sm text-red-600">{errors.age}</p>
                            )}
                        </div>

                        {/* 性别 */}
                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                                性别 <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="gender"
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.gender ? "border-red-500" : "border-gray-300"
                                }`}
                            >
                                <option value="">请选择性别</option>
                                <option value="男">男</option>
                                <option value="女">女</option>
                            </select>
                            {errors.gender && (
                                <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                            )}
                        </div>

                        {/* 出生日期 */}
                        <div>
                            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-2">
                                出生日期
                            </label>
                            <input
                                type="date"
                                id="birthDate"
                                name="birthDate"
                                value={formData.birthDate}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* 身份证号 */}
                        <div>
                            <label htmlFor="idCardNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                身份证号
                            </label>
                            <input
                                type="text"
                                id="idCardNumber"
                                name="idCardNumber"
                                value={formData.idCardNumber}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="请输入身份证号"
                                maxLength={18}
                            />
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

export default PatientInfoForm;