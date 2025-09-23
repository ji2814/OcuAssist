import React, { useState } from 'react';
import { useFundImage } from '../../context/FundImage';
import { FundImage, ModalType } from '../../types/FundImageType';
import ImageGallery from './ImageGallery';
import clsx from 'clsx';
import { FaUpload, FaEye } from 'react-icons/fa';

const ImageManager: React.FC = () => {
  const { addImage } = useFundImage();
  const [activeModal, setActiveModal] = useState<ModalType>('CFP');
  const [showEyeSelection, setShowEyeSelection] = useState(false);
  const [pendingImage, setPendingImage] = useState<{file: File, url: string} | null>(null);

  // 处理文件选择
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图像文件');
      return;
    }

    // 创建临时URL用于预览
    const url = URL.createObjectURL(file);
    
    // 显示左右眼选择对话框
    setPendingImage({file, url});
    setShowEyeSelection(true);
  };

  // 确认添加图像
  const confirmAddImage = (eye: 'OD' | 'OS') => {
    if (!pendingImage) return;
    
    let patientID = '123456'// 这里应该从患者信息中获取
    const newImage: FundImage = {
      patientID: patientID, 
      imageID: `${patientID}_${Date.now()}_${eye}_${activeModal}`,
      url: pendingImage.url,
      modalType: activeModal,
      uploadDate: new Date().toISOString().split('T')[0],
      metadata: {
        eye: eye,
        pinned: false
      }
    };

    addImage(newImage);
    
    // 清理状态
    setShowEyeSelection(false);
    setPendingImage(null);
  };

  // 取消添加图像
  const cancelAddImage = () => {
    if (pendingImage) {
      URL.revokeObjectURL(pendingImage.url);
    }
    setShowEyeSelection(false);
    setPendingImage(null);
  };


  return (
    <div className="flex flex-col h-full">
      {/* 顶部标签页 */}
      <div className="bg-white border-b border-gray-200 px-4 pt-4 flex-shrink-0">
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide min-w-0">
          {(['CFP', 'OCT', 'FFA'] as ModalType[]).map((modalType) => (
            <button
              key={modalType}
              onClick={() => setActiveModal(modalType)}
              className={clsx(
                'px-4 py-2 font-medium text-sm border-b-2 transition-colors flex-shrink-0 whitespace-nowrap',
                {
                  'border-blue-500 text-blue-600': activeModal === modalType,
                  'border-transparent text-gray-500 hover:text-gray-700': activeModal !== modalType
                }
              )}
            >
              {modalType}
            </button>
          ))}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 p-4 overflow-hidden flex flex-col">
        {/* 操作按钮 */}
        <div className="mb-6 flex gap-4 flex-shrink-0">
          <label className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors cursor-pointer flex items-center gap-2">
            <FaUpload />
            选择图像文件
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>

      {/* 左右眼选择对话框 */}
      {showEyeSelection && pendingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">选择眼睛类型</h3>
            
            {/* 图像预览 */}
            <div className="mb-4">
              <img
                src={pendingImage.url}
                alt="预览"
                className="w-full max-h-48 sm:max-h-64 object-contain bg-gray-100 rounded"
              />
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">请选择此图像是左眼还是右眼：</p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <button
                  onClick={() => confirmAddImage('OD')}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <FaEye />
                  左眼 (OD)
                </button>
                <button
                  onClick={() => confirmAddImage('OS')}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <FaEye />
                  右眼 (OS)
                </button>
              </div>
            </div>
            
            <button
              onClick={cancelAddImage}
              className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

        {/* 图像画廊 */}
        <div className="flex-1 overflow-hidden">
          <ImageGallery modalType={activeModal} />
        </div>
      </div>
    </div>
  );
};

export default ImageManager;