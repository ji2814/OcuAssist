import React, { useState, useEffect } from 'react';
import { useFundImage } from '../../context/FundImage';
import { FundImage, ModalType } from '../../types/FundImageType';
import clsx from 'clsx';
import { FaEye } from 'react-icons/fa';

interface TripleViewProps {
  className?: string;
}

const TripleView: React.FC<TripleViewProps> = ({ className }) => {
  const { imagesByModal, selectedImage, selectImage } = useFundImage();
  const [selectedOCT, setSelectedOCT] = useState<FundImage | null>(null);
  const [selectedOtherModals, setSelectedOtherModals] = useState<{
    FFA: FundImage | null;
    CFP: FundImage | null;
  }>({ FFA: null, CFP: null });


  // 初始化选中的图片
  useEffect(() => {
    if (selectedImage) {
      if (selectedImage.modalType === 'OCT') {
        setSelectedOCT(selectedImage);
      } else {
        setSelectedOtherModals(prev => ({
          ...prev,
          [selectedImage.modalType]: selectedImage
        }));
      }
    } else {
      
      setSelectedOCT(null);
      setSelectedOtherModals({ FFA: null, CFP: null });
    }
  }, [selectedImage, imagesByModal]);

  const handleImageClick = (image: FundImage) => {
    selectImage(image);
  };

  const ImageDisplay: React.FC<{
    image: FundImage | null;
    modalType: ModalType;
  }> = ({ image, modalType }) => {
    if (!image) {
      return (
        <div className="flex-1 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center">
            <FaEye className="text-gray-400 text-4xl mx-auto mb-2" />
            <p className="text-gray-500">暂无{modalType}图像，在缩略图中双击图片选定</p>
          </div>
        </div>
      );
    }

    return (
      <div
        className="relative bg-white rounded-lg overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 cursor-pointer h-full"
        onClick={() => handleImageClick(image)}
      >
        {/* 图片显示区域 - 填充整个容器 */}
        <div className="h-full bg-gray-50 flex items-center justify-center relative">
          {image.url ? (
            <img
              src={image.url}
              alt={`${modalType}图像`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-gray-400 text-center">
              <FaEye className="text-4xl mx-auto mb-2" />
              <p>图像预览</p>
            </div>
          )}
          
          {/* 模态类型标签 */}
          <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm font-medium">
            {modalType}
          </div>
          
          {/* 左右眼标签 */}
          {image.metadata?.eye && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium">
              {image.metadata.eye === 'OD' ? '左眼' : '右眼'}
            </div>
          )}
          
          {/* 置顶状态指示器 */}
          {image.metadata?.pinned && (
            <div className="absolute bottom-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
              已置顶
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={clsx('bg-white rounded-lg shadow p-4 h-full flex flex-col', className)}>
      
      {/* 上半部分 - OCT图片（占据约50%高度） */}
      <div className="mb-4" style={{ height: '50%' }}>
        <ImageDisplay
          image={selectedOCT}
          modalType="OCT"
        />
      </div>
      
      {/* 下半部分 - 其他两种模态（占据约50%高度） */}
      <div className="flex gap-4 flex-1" style={{ height: '50%' }}>
        <div className="flex-1">
          <ImageDisplay
            image={selectedOtherModals.CFP}
            modalType="CFP"
          />
        </div>
        <div className="flex-1">
          <ImageDisplay
            image={selectedOtherModals.FFA}
            modalType="FFA"
          />
        </div>
      </div>
    </div>
  );
};

export default TripleView;