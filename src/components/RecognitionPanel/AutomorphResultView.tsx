import React from 'react';
import { useRecognition } from '../../context/Recognition';
import { ModalType } from '../../types/FundImageType';
import { AutomorphResult } from '../../types/RecognitionType';
import clsx from 'clsx';
import { FaImage, FaChartLine } from 'react-icons/fa';

interface AutomorphResultViewProps {
  className?: string;
  modalType: ModalType;
}

const AutomorphResultView: React.FC<AutomorphResultViewProps> = ({ className, modalType }) => {
  const { automorphResults, isLoading, errors } = useRecognition();
  const result = automorphResults[modalType];

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

  // 量化结果表格
  const QuantitativeTable: React.FC<{
    quantitative: { [key: string]: number | string };
  }> = ({ quantitative }) => {
    const entries = Object.entries(quantitative);

    if (entries.length === 0) {
      return (
        <div className="text-center text-gray-400 py-8">
          <FaChartLine size={32} className="mx-auto mb-2" />
          <p>暂无量化数据</p>
        </div>
      );
    }

    return (
      <div className="h-full overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                特征名称
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                数值
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.map(([key, value], index) => (
              <tr key={key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  {key}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {typeof value === 'number' ? value.toFixed(3) : value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // 非CFP图像提示
  if (modalType !== 'CFP') {
    return (
      <div className={clsx('bg-white rounded-lg shadow p-6 h-full flex items-center justify-center', className)}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-lg font-medium">Automorph分析仅支持CFP图像</p>
          <p className="text-sm mt-2">当前图像类型：{modalType}</p>
          <p className="text-sm text-gray-400 mt-1">请切换到CFP（彩色眼底照相）图像进行分析</p>
        </div>
      </div>
    );
  }

  // 加载状态
  if (isLoading[modalType]) {
    return (
      <div className={clsx('bg-white rounded-lg shadow p-6 h-full flex items-center justify-center', className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">正在分析{modalType}图像...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (errors[modalType]) {
    return (
      <div className={clsx('bg-white rounded-lg shadow p-6 h-full flex items-center justify-center', className)}>
        <div className="text-center text-red-600">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-lg font-medium">分析失败</p>
          <p className="text-sm mt-2">{errors[modalType]}</p>
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
          <p className="text-lg font-medium">暂无{modalType}分析结果</p>
          <p className="text-sm mt-2">请先执行automorph分析</p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('bg-white rounded-lg shadow p-1 flex flex-col', className)} style={{ height: '100%' }}>
      {/* 上半部分 - 六宫格图片展示 */}
      <div className="mb-4" style={{ height: '60%' }}>
        <div className="grid grid-cols-3 gap-3 h-full">
          {/* 原始图像 */}
          <ImageDisplay
            title="原始图像"
            base64Data={result.origin}
            placeholder="原始图像"
          />
          {/* 动脉分割结果 */}
          <ImageDisplay
            title="动脉分割"
            base64Data={result.segmentation.artery_binary_process}
            placeholder="动脉分割结果"
          />
          {/* 静脉分割结果 */}
          <ImageDisplay
            title="静脉分割"
            base64Data={result.segmentation.vein_binary_process}
            placeholder="静脉分割结果"
          />
          {/* 血管分割结果 */}
          <ImageDisplay
            title="血管分割"
            base64Data={result.segmentation.binary_process}
            placeholder="血管分割结果"
          />
          {/* 视盘分割结果 */}
          <ImageDisplay
            title="视盘分割"
            base64Data={result.segmentation.optic_disc_cup}
            placeholder="视盘分割结果"
          />
          {/* 动脉静脉合并结果 */}
          <ImageDisplay
            title="动静脉合并"
            base64Data={result.segmentation.artery_vein}
            placeholder="动静脉合并结果"
          />
        </div>
      </div>

      {/* 下半部分 - 量化结果表格 */}
      <div className="flex-shrink-0" style={{ height: '40%' }}>
        <div className="bg-white rounded-lg border border-gray-200 h-full overflow-hidden">
          <QuantitativeTable quantitative={result.quantitative} />
        </div>
      </div>
    </div>
  );
};

export default AutomorphResultView;