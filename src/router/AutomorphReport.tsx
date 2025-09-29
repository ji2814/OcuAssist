import React, { useState, useEffect } from 'react';
import { usePatientInfo } from '../context/PatientInfo';
import { useRecognition } from '../context/Recognition';
import { useDoctorSettings } from '../context/DoctorInfo';
import { useNavigate } from 'react-router-dom';
import { FaDownload, FaTimes } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import '../styles/report-layout.css';

interface AutomorphReportData {
  patientInfo: {
    patentID: string;
    patentName: string;
    age: number;
    gender: string;
    birthDate: string;
    idCardNumber: string;
  };
  automorphResult: {
    origin: string;
    segmentation: {
      artery_binary_process?: string;
      vein_binary_process?: string;
      binary_process?: string;
      optic_disc_cup?: string;
      artery_vein?: string;
    };
    quantitative: {
      [key: string]: number | string;
    };
    timestamp: Date;
    status: 'pending' | 'success' | 'error';
  } | null;
  doctorInfo: {
    name: string;
    diagnosisTime: string;
  };
  reportDate: string;
}

const AutomorphReport: React.FC = () => {
  const { patentInfo } = usePatientInfo();
  const { automorphResults } = useRecognition();
  const { doctorInfo } = useDoctorSettings();
  const navigate = useNavigate();

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [reportData, setReportData] = useState<AutomorphReportData | null>(null);

  // 初始化报告数据
  useEffect(() => {
    setReportData({
      patientInfo: patentInfo,
      automorphResult: automorphResults.CFP,
      doctorInfo,
      reportDate: new Date().toLocaleDateString('zh-CN')
    });
  }, [patentInfo, automorphResults, doctorInfo]);

  // 生成PDF报告
  const generatePDF = async () => {
    if (!reportData || !reportData.automorphResult) return;

    setIsGeneratingPDF(true);
    try {
      const reportElement = document.getElementById('automorph-report');
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
          width: 1123, // A4横向宽度 (210mm * 96dpi / 25.4mm)
          height: 794, // A4横向高度 (297mm * 96dpi / 25.4mm)
          windowWidth: 1123,
          windowHeight: 794,
          scrollX: 0,
          scrollY: 0,
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

        // 创建PDF - 横向A4
        const pdf = new jsPDF('l', 'mm', 'a4'); // 'l' 表示横向
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 297; // A4横向宽度
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // 计算居中位置
        const pageHeight = 210; // A4横向高度
        const position = (pageHeight - imgHeight) / 2;

        // 添加图片到PDF
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);

        // 保存PDF
        const fileName = `Automorph检测报告_${reportData.patientInfo.patentName}_${reportData.reportDate}.pdf`;
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
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl mx-auto h-full flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Automorph检测报告</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={generatePDF}
              disabled={isGeneratingPDF || !reportData.automorphResult}
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
          <div id="automorph-report" className="bg-white p-8 pdf-optimized" style={{ width: '1123px', minHeight: '794px' }}>
            {/* 报告标题 */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2 report-title">眼科Automorph检测报告</h1>
              <p className="text-gray-600">报告日期：{reportData.reportDate}</p>
            </div>

            {/* 患者信息 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-blue-500 pb-2">
                患者信息
              </h2>
              <div className="patient-info-grid text-sm">
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

            {/* 分割图像结果 */}
            {reportData.automorphResult && (
              <section className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-blue-500 pb-2">
                  图像分割结果
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6 image-grid">
                  {/* 原始图像 */}
                  <div className="text-center min-w-0 image-container">
                    <div className="bg-gray-100 rounded-lg p-3 mb-3 h-40 flex items-center justify-center border border-gray-200 shadow-sm">
                      {reportData.automorphResult.origin ? (
                        <img
                          src={reportData.automorphResult.origin.startsWith('data:')
                            ? reportData.automorphResult.origin
                            : `data:image/png;base64,${reportData.automorphResult.origin}`}
                          alt="原始图像"
                          className="max-w-full max-h-full object-contain rounded"
                        />
                      ) : (
                        <div className="text-gray-400 text-sm font-medium">原始图像</div>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-700 truncate">原始图像</p>
                  </div>

                  {/* 动脉分割 */}
                  <div className="text-center min-w-0 image-container">
                    <div className="bg-gray-100 rounded-lg p-3 mb-3 h-40 flex items-center justify-center border border-gray-200 shadow-sm">
                      {reportData.automorphResult.segmentation.artery_binary_process ? (
                        <img
                          src={`data:image/png;base64,${reportData.automorphResult.segmentation.artery_binary_process}`}
                          alt="动脉分割"
                          className="max-w-full max-h-full object-contain rounded"
                        />
                      ) : (
                        <div className="text-gray-400 text-sm font-medium">动脉分割</div>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-700 truncate">动脉分割</p>
                  </div>

                  {/* 静脉分割 */}
                  <div className="text-center min-w-0 image-container">
                    <div className="bg-gray-100 rounded-lg p-3 mb-3 h-40 flex items-center justify-center border border-gray-200 shadow-sm">
                      {reportData.automorphResult.segmentation.vein_binary_process ? (
                        <img
                          src={`data:image/png;base64,${reportData.automorphResult.segmentation.vein_binary_process}`}
                          alt="静脉分割"
                          className="max-w-full max-h-full object-contain rounded"
                        />
                      ) : (
                        <div className="text-gray-400 text-sm font-medium">静脉分割</div>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-700 truncate">静脉分割</p>
                  </div>

                  {/* 血管分割 */}
                  <div className="text-center min-w-0 image-container">
                    <div className="bg-gray-100 rounded-lg p-3 mb-3 h-40 flex items-center justify-center border border-gray-200 shadow-sm">
                      {reportData.automorphResult.segmentation.binary_process ? (
                        <img
                          src={`data:image/png;base64,${reportData.automorphResult.segmentation.binary_process}`}
                          alt="血管分割"
                          className="max-w-full max-h-full object-contain rounded"
                        />
                      ) : (
                        <div className="text-gray-400 text-sm font-medium">血管分割</div>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-700 truncate">血管分割</p>
                  </div>

                  {/* 视盘分割 */}
                  <div className="text-center min-w-0 image-container">
                    <div className="bg-gray-100 rounded-lg p-3 mb-3 h-40 flex items-center justify-center border border-gray-200 shadow-sm">
                      {reportData.automorphResult.segmentation.optic_disc_cup ? (
                        <img
                          src={`data:image/png;base64,${reportData.automorphResult.segmentation.optic_disc_cup}`}
                          alt="视盘分割"
                          className="max-w-full max-h-full object-contain rounded"
                        />
                      ) : (
                        <div className="text-gray-400 text-sm font-medium">视盘分割</div>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-700 truncate">视盘分割</p>
                  </div>

                  {/* 动静脉合并 */}
                  <div className="text-center min-w-0 image-container">
                    <div className="bg-gray-100 rounded-lg p-3 mb-3 h-40 flex items-center justify-center border border-gray-200 shadow-sm">
                      {reportData.automorphResult.segmentation.artery_vein ? (
                        <img
                          src={`data:image/png;base64,${reportData.automorphResult.segmentation.artery_vein}`}
                          alt="动静脉合并"
                          className="max-w-full max-h-full object-contain rounded"
                        />
                      ) : (
                        <div className="text-gray-400 text-sm font-medium">动静脉合并</div>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-700 truncate">动静脉合并</p>
                  </div>
                </div>
              </section>
            )}

            {/* 量化指标 */}
            {reportData.automorphResult && Object.keys(reportData.automorphResult.quantitative).length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-blue-500 pb-2">
                  量化指标
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">指标</th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">数值</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(reportData.automorphResult.quantitative).map(([key, value]) => (
                        <tr key={key} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 font-medium text-gray-700">{key}</td>
                          <td className="border border-gray-300 px-4 py-2 text-gray-800 font-mono">
                            {typeof value === 'number' ? value.toFixed(3) : value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* 医生信息 */}
            <section className="mt-8 pt-4 border-t border-gray-200 signature-section">
              <div className="flex justify-between text-sm text-gray-600 signature-info">
                <div>
                  <span className="font-medium">检查医生：</span>
                  <span>{reportData.doctorInfo.name}</span>
                </div>
                <div>
                  <span className="font-medium">检查时间：</span>
                  <span>{reportData.doctorInfo.diagnosisTime}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomorphReport;