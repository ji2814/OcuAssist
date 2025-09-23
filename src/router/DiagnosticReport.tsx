import React, { useState, useEffect } from 'react';
import { usePatientInfo } from '../context/PatientInfo';
import { useDiagnosis } from '../context/Diagnosis';
import { useAIChat } from '../context/AIChat';
import { useDoctorSettings } from '../context/DoctorInfo';
import { useNavigate } from 'react-router-dom';
import { FaDownload, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface MedicalCase {
  chiefComplaint: string;
  historyOfPresentIllness: string;
  pastHistory: string;
  physicalExamination: string;
}

interface DiagnosticReportData {
  patientInfo: {
    patentID: string;
    patentName: string;
    age: number;
    gender: string;
    birthDate: string;
    idCardNumber: string;
  };
  medicalCase: MedicalCase;
  diagnosisResults: {
    OCT: any;
    FFA: any;
    CFP: any;
  };
  doctorInfo: {
    name: string;
    diagnosisTime: string;
  };
  reportDate: string;
}

const DiagnosticReport: React.FC = () => {
  const { patentInfo } = usePatientInfo();
  const { diagnosisResults } = useDiagnosis();
  const { messages } = useAIChat();
  const { doctorInfo } = useDoctorSettings();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [reportData, setReportData] = useState<DiagnosticReportData | null>(null);

  // 从AI聊天记录中提取病例信息
  const extractMedicalCaseFromChat = (): MedicalCase => {
    const medicalCase: MedicalCase = {
      chiefComplaint: '',
      historyOfPresentIllness: '',
      pastHistory: '',
      physicalExamination: ''
    };

    const chiefComplaints: string[] = [];
    const historyOfPresentIllnesses: string[] = [];
    const pastHistories: string[] = [];
    const physicalExaminations: string[] = [];

    // 遍历所有消息，提取病例信息
    messages.forEach(message => {
      if (message.role === 'user' && message.content) {
        // 将content数组转换为字符串
        const content = message.content.map(item => {
          if (item.type === 'text' && item.text) {
            return item.text;
          }
          return '';
        }).join('');

        if (content) {
          // 提取主诉
          if (content.includes('主诉：')) {
            const match = content.match(/主诉：([\s\S]*?)(?:\n\n|现病史：|既往史：|体格检查：|$)/);
            if (match && match[1].trim()) {
              chiefComplaints.push(match[1].trim());
            }
          }

          // 提取现病史
          if (content.includes('现病史：')) {
            const match = content.match(/现病史：([\s\S]*?)(?:\n\n|主诉：|既往史：|体格检查：|$)/);
            if (match && match[1].trim()) {
              historyOfPresentIllnesses.push(match[1].trim());
            }
          }

          // 提取既往史
          if (content.includes('既往史：')) {
            const match = content.match(/既往史：([\s\S]*?)(?:\n\n|主诉：|现病史：|体格检查：|$)/);
            if (match && match[1].trim()) {
              pastHistories.push(match[1].trim());
            }
          }

          // 提取体格检查
          if (content.includes('体格检查：')) {
            const match = content.match(/体格检查：([\s\S]*?)(?:\n\n|主诉：|现病史：|既往史：|$)/);
            if (match && match[1].trim()) {
              physicalExaminations.push(match[1].trim());
            }
          }
        }
      }
    });

    // 合并相同类型的信息，用分号分隔
    medicalCase.chiefComplaint = chiefComplaints.join('；');
    medicalCase.historyOfPresentIllness = historyOfPresentIllnesses.join('；');
    medicalCase.pastHistory = pastHistories.join('；');
    medicalCase.physicalExamination = physicalExaminations.join('；');

    return medicalCase;
  };

  // 初始化报告数据
  useEffect(() => {
    const medicalCase = extractMedicalCaseFromChat();
    setReportData({
      patientInfo: patentInfo,
      medicalCase,
      diagnosisResults,
      doctorInfo,
      reportDate: new Date().toLocaleDateString('zh-CN')
    });
  }, [patentInfo, diagnosisResults, messages, doctorInfo]);

  // 处理字段编辑
  const handleFieldEdit = (section: keyof MedicalCase, value: string) => {
    if (reportData) {
      setReportData({
        ...reportData,
        medicalCase: {
          ...reportData.medicalCase,
          [section]: value
        }
      });
    }
  };

  // 生成PDF报告
  const generatePDF = async () => {
    if (!reportData) return;

    setIsGeneratingPDF(true);
    try {
      const reportElement = document.getElementById('diagnostic-report');
      if (!reportElement) {
        throw new Error('找不到报告元素');
      }

      // 临时创建一个克隆元素来避免oklch颜色问题
      const clonedElement = reportElement.cloneNode(true) as HTMLElement;
      clonedElement.style.position = 'absolute';
      clonedElement.style.left = '-9999px';
      clonedElement.style.top = '0';

      // 替换可能包含oklch的CSS类为安全的颜色
      const replaceOklchColors = (element: HTMLElement) => {
        const walker = document.createTreeWalker(
          element,
          NodeFilter.SHOW_ELEMENT,
          null
        );

        let node: Element | null;
        while (node = walker.nextNode() as Element) {
          const computedStyle = window.getComputedStyle(node);
          const htmlNode = node as HTMLElement;

          // 检查并替换可能的oklch颜色
          ['color', 'backgroundColor', 'borderColor'].forEach(prop => {
            const value = computedStyle.getPropertyValue(prop);
            if (value && value.includes('oklch')) {
              // 替换为安全的颜色值
              if (prop === 'color') {
                htmlNode.style.color = '#374151'; // gray-700
              } else if (prop === 'backgroundColor') {
                if (value.includes('gray') || value.includes('50')) {
                  htmlNode.style.backgroundColor = '#f9fafb'; // gray-50
                } else {
                  htmlNode.style.backgroundColor = '#ffffff';
                }
              } else if (prop === 'borderColor') {
                htmlNode.style.borderColor = '#d1d5db'; // gray-300
              }
            }
          });

          // 特殊处理一些常见的Tailwind类
          if (htmlNode.className) {
            const className = htmlNode.className;
            if (className.includes('text-gray')) {
              htmlNode.style.color = '#374151';
            }
            if (className.includes('bg-gray-50')) {
              htmlNode.style.backgroundColor = '#f9fafb';
            }
            if (className.includes('bg-white')) {
              htmlNode.style.backgroundColor = '#ffffff';
            }
            if (className.includes('border-gray')) {
              htmlNode.style.borderColor = '#d1d5db';
            }
            if (className.includes('border-blue')) {
              htmlNode.style.borderColor = '#3b82f6';
            }
          }
        }
      };

      // 应用颜色替换
      replaceOklchColors(clonedElement);

      // 临时添加到DOM
      document.body.appendChild(clonedElement);

      try {
        // 使用html2canvas将HTML转换为图片，配置更严格的选项
        const canvas = await html2canvas(clonedElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          foreignObjectRendering: false,
          ignoreElements: (element) => {
            // 忽略可能包含不支持CSS的元素
            const style = window.getComputedStyle(element);
            return style.getPropertyValue('color').includes('oklch') ||
              style.getPropertyValue('background-color').includes('oklch') ||
              style.getPropertyValue('border-color').includes('oklch');
          },
          onclone: (clonedDoc) => {
            // 在克隆的文档中移除所有可能包含oklch的样式
            const styleSheets = clonedDoc.styleSheets;
            for (let i = 0; i < styleSheets.length; i++) {
              try {
                const styleSheet = styleSheets[i];
                if (styleSheet.cssRules) {
                  for (let j = styleSheet.cssRules.length - 1; j >= 0; j--) {
                    const rule = styleSheet.cssRules[j];
                    if (rule.cssText && rule.cssText.includes('oklch')) {
                      styleSheet.deleteRule(j);
                    }
                  }
                }
              } catch (e) {
                // 跨域样式表可能无法访问，忽略错误
                console.warn('无法处理样式表:', e);
              }
            }
          }
        });

        // 创建PDF
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210; // A4宽度
        const pageHeight = 297; // A4高度
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        // 添加图片到PDF
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // 如果内容超过一页，添加新页面
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        // 保存PDF
        const fileName = `诊断报告_${reportData.patientInfo.patentName}_${reportData.reportDate}.pdf`;
        pdf.save(fileName);
      } finally {
        // 清理临时元素
        document.body.removeChild(clonedElement);
      }
    } catch (error) {
      console.error('PDF生成失败:', error);
      alert('PDF生成失败，请重试');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleClose = () => {
    navigate("/");
  };

  if (!reportData) return null;

  return (
    <div className="h-screen bg-gray-100 p-4 overflow-hidden">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl mx-auto h-full flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">诊断报告</h2>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                <FaSave />
                保存
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                <FaEdit />
                编辑
              </button>
            )}
            <button
              onClick={generatePDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2 px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors disabled:opacity-50"
            >
              <FaDownload />
              {isGeneratingPDF ? '生成中...' : '导出PDF'}
            </button>
            <button
              onClick={handleClose}
              className="flex items-center gap-2 px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              <FaTimes />
              关闭
            </button>
          </div>
        </div>

        {/* 报告内容 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div id="diagnostic-report" className="bg-white p-8">
            {/* 报告标题 */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">眼科诊断报告</h1>
              <p className="text-gray-600">报告日期：{reportData.reportDate}</p>
            </div>

            {/* 患者信息 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-blue-500 pb-2">
                患者信息
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <span className="font-medium text-gray-700">患者姓名：</span>
                  <span className="text-gray-800">{reportData.patientInfo.patentName}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">患者ID：</span>
                  <span className="text-gray-800">{reportData.patientInfo.patentID}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">性别：</span>
                  <span className="text-gray-800">{reportData.patientInfo.gender}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">年龄：</span>
                  <span className="text-gray-800">{reportData.patientInfo.age}岁</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">出生日期：</span>
                  <span className="text-gray-800">{reportData.patientInfo.birthDate}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">身份证号：</span>
                  <span className="text-gray-800">{reportData.patientInfo.idCardNumber}</span>
                </div>
              </div>
            </section>

            {/* 病例信息 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-blue-500 pb-2">
                病例信息
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">主诉</h3>
                  {isEditing ? (
                    <textarea
                      value={reportData.medicalCase.chiefComplaint}
                      onChange={(e) => handleFieldEdit('chiefComplaint', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-800 bg-gray-50 p-3 rounded">
                      {reportData.medicalCase.chiefComplaint || '暂无主诉信息'}
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">现病史</h3>
                  {isEditing ? (
                    <textarea
                      value={reportData.medicalCase.historyOfPresentIllness}
                      onChange={(e) => handleFieldEdit('historyOfPresentIllness', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-800 bg-gray-50 p-3 rounded">
                      {reportData.medicalCase.historyOfPresentIllness || '暂无现病史信息'}
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">既往史</h3>
                  {isEditing ? (
                    <textarea
                      value={reportData.medicalCase.pastHistory}
                      onChange={(e) => handleFieldEdit('pastHistory', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-800 bg-gray-50 p-3 rounded">
                      {reportData.medicalCase.pastHistory || '暂无既往史信息'}
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">体格检查</h3>
                  {isEditing ? (
                    <textarea
                      value={reportData.medicalCase.physicalExamination}
                      onChange={(e) => handleFieldEdit('physicalExamination', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-800 bg-gray-50 p-3 rounded">
                      {reportData.medicalCase.physicalExamination || '暂无体格检查信息'}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* 诊断结果 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-blue-500 pb-2">
                诊断结果
              </h2>

              <div className="space-y-6">
                {Object.entries(reportData.diagnosisResults).map(([modalType, result]) => (
                  <div key={modalType} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      {modalType === 'OCT' ? 'OCT检查' : modalType === 'FFA' ? 'FFA检查' : 'CFP检查'}
                    </h3>
                    {result ? (
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium text-gray-700">图像描述：</span>
                          <span className="text-gray-800">{result.imageDescription}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">病灶类型：</span>
                          <span className="text-gray-800">{result.lesionType.join(', ')}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">疾病类型：</span>
                          <span className="text-gray-800">{result.diseaseType}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">诊断依据：</span>
                          <span className="text-gray-800">{result.diagnosticBasis.join(', ')}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">置信度：</span>
                          <span className="text-gray-800">{Math.round(result.confidence * 100)}%</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">暂无{modalType}诊断结果</p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* 医生签名 */}
            <section className="mt-12">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-gray-800 mb-2">
                    <span className="font-medium">诊断医生：</span>
                    {reportData.doctorInfo.name}
                  </p>
                  <p className="text-gray-800">
                    <span className="font-medium">诊断日期：</span>
                    {reportData.reportDate}
                  </p>
                </div>
                <div className="text-center">
                  <div className="border-b-2 border-gray-400 w-32 mb-2"></div>
                  <p className="text-sm text-gray-600">医生签名</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticReport;