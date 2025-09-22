import React, { useEffect, useRef } from 'react';
import { useFundImage } from '../../context/FundImage';
import { useDiagnosis } from '../../context/Diagnosis';
import { ModalType } from '../../types/FundImageType';
import { FundImage } from '../../types/FundImageType';
import { DiagnosisResult } from '../../types/DiagnosisType';
import clsx from 'clsx';
import { FaRobot, FaEye, FaStethoscope, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

interface AIDiagnosisPageProps {
  className?: string;
}

const AIDiagnosisPage: React.FC<AIDiagnosisPageProps> = ({ className }) => {
  const { imagesByModal, selectedImage } = useFundImage();
  const { diagnosisResults, isLoading, errors, diagnoseImage, clearDiagnosis } = useDiagnosis();
  const lastDiagnosedImageRef = useRef<{ [key in ModalType]?: string }>({});

  // 获取模态标题
  const getModalTitle = (type: ModalType) => {
    switch (type) {
      case 'OCT': return 'OCT诊断';
      case 'FFA': return 'FFA诊断';
      case 'CFP': return 'CFP诊断';
    }
  };

  // 获取模态颜色
  const getModalColor = (type: ModalType) => {
    switch (type) {
      case 'OCT': return 'bg-blue-50 border-blue-200';
      case 'FFA': return 'bg-green-50 border-green-200';
      case 'CFP': return 'bg-purple-50 border-purple-200';
    }
  };

  // 获取每个模态当前选中的图片
  const getCurrentImage = (modalType: ModalType): FundImage | null => {
    // 如果当前模态有选中的图片，优先使用选中的图片
    if (selectedImage && selectedImage.modalType === modalType) {
      return selectedImage;
    }

    // 如果没有选中的图片，但该类模态有图片，返回该模态的第一张图片
    if (imagesByModal[modalType] && imagesByModal[modalType].length > 0) {
      return imagesByModal[modalType][0];
    }

    // 如果该模态没有任何图片，返回null
    return null;
  };

  // 监听选中图片的变化，清除之前的诊断结果
  useEffect(() => {
    if (selectedImage) {
      const modalType = selectedImage.modalType;
      // 清除当前模态的诊断结果，让用户手动触发新的诊断
      clearDiagnosis(modalType);
      // 清除已诊断图片的记录
      delete lastDiagnosedImageRef.current[modalType];
    }
  }, [selectedImage]);

  // 处理AI诊断
  const handleDiagnose = async (modalType: ModalType) => {
    const image = getCurrentImage(modalType);
    if (!image) return;

    await diagnoseImage({
      modalType,
      imageUrl: image.url,
      imageBase64: image.base64,
      patientID: image.patientID,
      metadata: image.metadata
    });
  };

  // 诊断框组件
  const DiagnosisBox: React.FC<{
    modalType: ModalType;
    image: FundImage | null;
    result: DiagnosisResult | null;
    isLoading: boolean;
    error: string | null;
  }> = ({ modalType, image, result, isLoading, error }) => {
    if (!image) {
      // 如果没有图片，显示空状态框体
      return (
        <div className={clsx(
          'rounded-lg border-2 p-4 flex flex-col',
          getModalColor(modalType),
          className
        )}>
          {/* 头部 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaStethoscope className="text-gray-600" />
              <h3 className="font-semibold text-gray-800">{getModalTitle(modalType)}</h3>
            </div>
          </div>

          {/* 空状态提示 */}
          <div className="flex items-center justify-center h-32 text-gray-500">
            <div className="text-center">
              <FaEye className="text-2xl mx-auto mb-2" />
              <p className="text-sm">暂无{getModalTitle(modalType)}图像</p>
              <p className="text-xs mt-1">请在左侧选择{modalType}图像</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={clsx(
        'rounded-lg border-2 p-4 flex flex-col',
        getModalColor(modalType),
        className
      )}>
        {/* 头部 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FaStethoscope className="text-gray-600" />
            <h3 className="font-semibold text-gray-800">{getModalTitle(modalType)}</h3>
          </div>
          <div className="flex items-center gap-2">
            {image.metadata?.eye && (
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                {image.metadata.eye === 'OD' ? '左眼' : '右眼'}
              </span>
            )}
          </div>
        </div>

        {/* 图片预览 */}
        <div className="mb-4">
          <div className="bg-gray-100 rounded-lg p-2 flex items-center justify-center h-32">
            {image.url ? (
              <img
                src={image.url}
                alt={`${modalType}图像`}
                className="max-h-full max-w-full object-contain rounded"
              />
            ) : (
              <div className="text-center text-gray-500">
                <FaEye className="text-2xl mx-auto mb-1" />
                <p className="text-sm">图像预览</p>
              </div>
            )}
          </div>
        </div>

        {/* 诊断按钮 */}
        {!result && !isLoading && !error && (
          <button
            onClick={() => handleDiagnose(modalType)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <FaRobot />
            AI诊断
          </button>
        )}

        {/* 加载状态 */}
        {isLoading && (
          <div className="text-center py-4">
            <FaSpinner className="animate-spin text-2xl text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">AI正在分析图像...</p>
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-700">
              <FaExclamationTriangle />
              <span className="text-sm font-medium">诊断失败</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <button
              onClick={() => handleDiagnose(modalType)}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              重试
            </button>
          </div>
        )}

        {/* 诊断结果 */}
        {result && (
          <div className="space-y-3">
            {/* 置信度 */}
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-green-500" />
              <span className="text-sm text-gray-600">置信度: {Math.round(result.confidence * 100)}%</span>
            </div>

            {/* 图像描述 */}
            <div className="bg-white rounded-lg p-3 border">
              <h4 className="font-medium text-gray-800 mb-2">图像描述</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{result.imageDescription}</p>
            </div>

            {/* 病灶类型 */}
            <div className="bg-white rounded-lg p-3 border">
              <h4 className="font-medium text-gray-800 mb-2">病灶类型</h4>
              <p className="text-sm text-gray-700">{result.lesionType}</p>
            </div>

            {/* 疾病类型 */}
            <div className="bg-white rounded-lg p-3 border">
              <h4 className="font-medium text-gray-800 mb-2">疾病类型</h4>
              <p className="text-sm text-gray-700">{result.diseaseType}</p>
            </div>

            {/* 诊断依据 */}
            {result.diagnosticBasis.length > 0 && (
              <div className="bg-white rounded-lg p-3 border">
                <h4 className="font-medium text-gray-800 mb-2">诊断依据</h4>
                <ul className="space-y-1">
                  {result.diagnosticBasis.map((basis, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{basis}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 时间戳 */}
            <div className="text-xs text-gray-500 text-right">
              诊断时间: {result.timestamp.toLocaleString()}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 获取当前各模态的图片
  const octImage = getCurrentImage('OCT');
  const ffaImage = getCurrentImage('FFA');
  const cfpImage = getCurrentImage('CFP');

  return (
    <div className={clsx('h-full flex flex-col', className)}>
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <FaRobot className="text-blue-500 text-xl" />
          <div>
            <h2 className="text-lg font-semibold text-gray-800">AI智能诊断</h2>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          已选择: {[octImage && 'OCT', ffaImage && 'FFA', cfpImage && 'CFP'].filter(Boolean).join(', ') || '无'}
        </div>
      </div>

      {/* 诊断框区域 */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          <DiagnosisBox
            modalType="CFP"
            image={cfpImage}
            result={diagnosisResults.CFP}
            isLoading={isLoading.CFP}
            error={errors.CFP}
          />
          <DiagnosisBox
            modalType="OCT"
            image={octImage}
            result={diagnosisResults.OCT}
            isLoading={isLoading.OCT}
            error={errors.OCT}
          />
          <DiagnosisBox
            modalType="FFA"
            image={ffaImage}
            result={diagnosisResults.FFA}
            isLoading={isLoading.FFA}
            error={errors.FFA}
          />
        </div>

        {/* 无图片时的提示 */}
        {!octImage && !ffaImage && !cfpImage && (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <FaEye className="text-4xl mx-auto mb-4" />
              <p className="text-lg">请先选择图像进行AI诊断</p>
              <p className="text-sm mt-2">在左侧缩略图面板中选择OCT、FFA或CFP图像</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIDiagnosisPage;