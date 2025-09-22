import React, { useRef } from "react";
import { usePatientInfo } from "../../context/PatientInfo";
import { FaFileImport, FaFileExport, FaFolderOpen } from "react-icons/fa";
import { invoke } from "@tauri-apps/api/core";
import { useNavigate } from "react-router-dom";

const PatientInfo = () => {
    const { patentInfo, setPatentInfo } = usePatientInfo();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    // 导入项目
    const handleImportProject = async () => {
        try {
            alert("导入项目功能暂未实现");
            return;
            // 调用Tauri命令选择文件夹
            const selectedPath = await invoke<string>("select_folder");
            if (selectedPath) {
                // 读取meta.json文件
                const metadata = await invoke<string>("read_metadata_file", { path: selectedPath });
                const metaData = JSON.parse(metadata);
                
                // 更新患者信息
                const patientData = metaData.PatentInfo;
                setPatentInfo({
                    patentID: patientData.PatentID,
                    patentName: patientData.PatentName,
                    age: patientData.Age,
                    gender: patientData.Gender,
                    birthDate: "", // 可以从身份证号推导
                    idCardNumber: "" // 元数据中没有身份证号
                });
                
                console.log("项目导入成功:", selectedPath);
            }
        } catch (error) {
            console.error("导入项目失败:", error);
            alert("导入项目失败，请检查文件格式和路径");
        }
    };

    // 导出项目
    const handleExportProject = async () => {
        try {
            alert("导出项目功能暂未实现");
            return;
            // 调用Tauri命令选择导出路径
            const exportPath = await invoke<string>("select_export_folder");
            if (exportPath) {
                // 创建项目结构并导出
                await invoke("export_project", {
                    patientId: patentInfo.patentID,
                    exportPath: exportPath,
                    patientInfo: patentInfo
                });
                console.log("项目导出成功:", exportPath);
                alert("项目导出成功！");
            }
        } catch (error) {
            console.error("导出项目失败:", error);
            alert("导出项目失败，请检查导出路径");
        }
    };

    // // 打开项目文件夹
    // const handleOpenProjectFolder = () => {
    //     if (fileInputRef.current) {
    //         fileInputRef.current.click();
    //     }
    // };
    // 新建项目
    const handleNewProject = () => {
        navigate("/new-patient");
    };

    // 处理文件选择
    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const text = await file.text();
                const metaData = JSON.parse(text);
                
                // 更新患者信息
                const patientData = metaData.PatentInfo;
                if (patientData) {
                    setPatentInfo({
                        patentID: patientData.PatentID || "",
                        patentName: patientData.PatentName || "",
                        age: patientData.Age || 0,
                        gender: patientData.Gender || "",
                        birthDate: "", // 可以从身份证号推导
                        idCardNumber: ""
                    });
                    console.log("元数据文件加载成功");
                }
            } catch (error) {
                console.error("读取元数据文件失败:", error);
                alert("读取元数据文件失败，请检查文件格式");
            }
        }
    };

    return (
        <div className="flex items-center gap-8 text-white">
            {/* 患者信息展示区域 */}
            <div className="flex items-center gap-6">
                <div className="flex flex-col">
                    <span className="font-semibold text-lg">{patentInfo.patentName}</span>
                    <span className="text-sm opacity-80">ID: {patentInfo.patentID}</span>
                </div>
                <div className="flex gap-4 text-sm">
                    <span>性别: {patentInfo.gender}</span>
                    <span>年龄: {patentInfo.age}岁</span>
                    <span>出生日期: {patentInfo.birthDate}</span>
                </div>
                <div className="text-sm opacity-80">
                    <span>身份证号: {patentInfo.idCardNumber}</span>
                </div>
            </div>

            {/* 导入导出功能按钮 */}
            <div className="flex items-center gap-2 border-l border-white/30 pl-6">
                <button
                    onClick={handleImportProject}
                    className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 border border-white/30 hover:border-white/50"
                    title="导入项目"
                >
                    <FaFileImport className="text-lg" />
                    <span className="text-sm font-medium">导入</span>
                </button>
                
                <button
                    onClick={handleNewProject}
                    className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 border border-white/30 hover:border-white/50"
                    title="新建项目"
                >
                    <FaFolderOpen className="text-lg" />
                    <span className="text-sm font-medium">新建</span>
                </button>
                
                <button
                    onClick={handleExportProject}
                    className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 border border-white/30 hover:border-white/50"
                    title="导出项目"
                >
                    <FaFileExport className="text-lg" />
                    <span className="text-sm font-medium">导出</span>
                </button>
                
                {/* 隐藏的文件输入 */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>
        </div>
    );
};

export default PatientInfo;
