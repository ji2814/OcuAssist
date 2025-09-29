import React from 'react';
import { useRecognition } from '../../context/Recognition';
import clsx from 'clsx';
import { FaImage } from 'react-icons/fa';

interface OCTSegResultViewProps {
  className?: string;
}

const OCTSegResultView: React.FC<OCTSegResultViewProps> = ({ className }) => {
  const { octSegResults, isLoading, errors } = useRecognition();
  const result = octSegResults.OCT;

  // 图片显示组件
  const ImageDisplay: React.FC<{
    title: string;
    base64Data?: string;
    placeholder: string;
  }> = ({ title, base64Data, placeholder }) => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full flex flex-col">
      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex-shrink-0">
        <h3 className="text-sm font-medium text-gray-700 flex items-center">
          <FaImage className="mr-2" size={14} />
          {title}
        </h3>
      </div>
      <div className="flex-1 bg-gray-100 flex items-center justify-center min-h-0">
        {base64Data ? (
          <img
            src={base64Data.startsWith('data:') ? base64Data : `data:image/png;base64,${base64Data}`}
            alt={title}
            className="max-w-full max-h-full object-contain"
            style={{ width: 'auto', height: 'auto' }}
            onError={(e) => {
              console.error(`Failed to load image: ${title}`, base64Data);
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="text-center text-gray-400">
            <FaImage size={32} className="mx-auto mb-2" />
            <p className="text-xs">{placeholder}</p>
          </div>
        )}
      </div>
    </div>
  );

  // 非OCT图像提示
  if (isLoading.OCT === false && !result && !errors.OCT) {
    return (
      <div className={clsx('bg-white rounded-lg shadow p-6 h-full flex items-center justify-center', className)}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-lg font-medium">OCTSeg分割仅支持OCT图像</p>
          <p className="text-sm mt-2">请确保当前图像为OCT类型</p>
        </div>
      </div>
    );
  }

  // 加载状态
  if (isLoading.OCT) {
    return (
      <div className={clsx('bg-white rounded-lg shadow p-6 h-full flex items-center justify-center', className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">正在执行OCTSeg分割...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (errors.OCT) {
    return (
      <div className={clsx('bg-white rounded-lg shadow p-6 h-full flex items-center justify-center', className)}>
        <div className="text-center text-red-600">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-lg font-medium">OCTSeg分割失败</p>
          <p className="text-sm mt-2">{errors.OCT}</p>
        </div>
      </div>
    );
  }

  // 无数据状态
  if (!result) {
    return (
      <div className={clsx('bg-white rounded-lg shadow p-6 h-full flex items-center justify-center', className)}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-lg font-medium">暂无OCTSeg分割结果</p>
          <p className="text-sm mt-2">请先执行OCTSeg分割分析</p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('bg-white rounded-lg shadow p-1 flex flex-col', className)} style={{ height: '100%' }}>
      {/* 两宫格图片展示 - 原图和分割结果 */}
      <div className="grid grid-cols-2 gap-3 h-full">
        {/* 原始图像 */}
        <ImageDisplay
          title="原始OCT图像"
          base64Data={result.origin}
          placeholder="原始OCT图像"
        />
        {/* OCTSeg分割结果 */}
        <ImageDisplay
          title="OCT积液分割"
          base64Data={result.segmentation.OCTSeg}
          placeholder="OCT积液分割结果"
        />
      </div>
    </div>
  );
};

export default OCTSegResultView;