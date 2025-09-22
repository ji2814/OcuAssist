import React from 'react';
import { useFundImage } from '../../context/FundImage';
import { ModalType } from '../../types/FundImageType';
import clsx from 'clsx';
import { FaThumbtack, FaTrash, FaCheck } from 'react-icons/fa';

interface ImageGalleryProps {
  modalType: ModalType;
  className?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ modalType, className }) => {
  const { 
    getImagesByModal, 
    selectedImage, 
    selectImage, 
    removeImage, 
    pinImage, 
    unpinImage 
  } = useFundImage();

  const images = getImagesByModal(modalType);
  
  // 按日期分组图像
  const groupImagesByDate = (images: any[]) => {
    const grouped: { [date: string]: any[] } = {};
    
    images.forEach(image => {
      const date = image.uploadDate || '未知日期';
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(image);
    });
    
    // 按日期降序排序
    const sortedDates = Object.keys(grouped).sort((a, b) => {
      if (a === '未知日期') return 1;
      if (b === '未知日期') return -1;
      return new Date(b).getTime() - new Date(a).getTime();
    });
    
    return sortedDates.map(date => ({
      date,
      images: grouped[date]
    }));
  };
  
  const groupedImages = groupImagesByDate(images);

  const handleImageDoubleClick = (image: any) => {
    selectImage(image);
  };

  const handleDeleteImage = (imageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeImage(imageId, modalType);
  };

  const handleTogglePin = (imageId: string, isPinned: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPinned) {
      unpinImage(imageId, modalType);
    } else {
      pinImage(imageId, modalType);
    }
  };

  return (
    <div className={clsx('bg-white rounded-lg shadow p-4 flex flex-col h-full', className)}>
      {images.length === 0 ? (
        <div className="text-gray-500 text-center py-8 flex-1 flex items-center justify-center">
          暂无{modalType}图像
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-6 min-h-0 max-h-[calc(100vh-200px)]">
          {groupedImages.map(({ date, images }) => (
            <div key={date} className="space-y-3">
              {/* 日期分组标题 */}
              <div className="flex items-center">
                <h3 className="text-lg font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded">
                  {date === '未知日期' ? date : new Date(date).toLocaleDateString('zh-CN')}
                </h3>
                <div className="flex-1 h-px bg-gray-200 ml-3"></div>
              </div>
              
              {/* 该日期的图像列表 - 纵向排列 */}
              <div className="space-y-4">
                {images.map((image) => {
                  const isPinned = image.metadata?.pinned || false;
                  const isSelected = selectedImage?.imageID === image.imageID;
                  const eyeType = image.metadata?.eye;
                  
                  return (
                    <div
                      key={image.imageID}
                      className={clsx(
                        'relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all',
                        'hover:shadow-lg',
                        {
                          'border-blue-500': isSelected,
                          'border-gray-200': !isSelected,
                          'ring-2 ring-yellow-400': isPinned
                        }
                      )}
                      onDoubleClick={() => handleImageDoubleClick(image)}
                    >
                      {/* 图像预览 - 纵向排列，固定高度 */}
                      <div className="h-48 bg-gray-100 flex items-center justify-center relative">
                        {image.url ? (
                          <img
                            src={image.url}
                            alt={`${modalType}图像`}
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <div className="text-gray-400 text-sm">
                            图像预览
                          </div>
                        )}
                        
                        {/* 左右眼标签 - 右下角 */}
                        {eyeType && (
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium">
                            {eyeType}
                          </div>
                        )}
                      </div>
                      
                      
                      {/* 操作按钮 */}
                      <div className="absolute top-2 right-2 flex gap-1">
                        {/* 置顶/取消置顶按钮 */}
                        <button
                          onClick={(e) => handleTogglePin(image.imageID!, isPinned, e)}
                          className={clsx(
                            'p-2 rounded text-sm flex items-center justify-center',
                            {
                              'bg-yellow-500 text-white': isPinned,
                              'bg-gray-200 text-gray-600 hover:bg-gray-300': !isPinned
                            }
                          )}
                          title={isPinned ? '取消置顶' : '置顶'}
                        >
                          <FaThumbtack />
                        </button>
                        
                        {/* 删除按钮 */}
                        <button
                          onClick={(e) => handleDeleteImage(image.imageID!, e)}
                          className="p-2 rounded text-sm bg-red-500 text-white hover:bg-red-600 flex items-center justify-center"
                          title="删除图像"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      
                      {/* 选中状态指示器 */}
                      {isSelected && (
                        <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                          <FaCheck />
                          已选中
                        </div>
                      )}
                      
                      {/* 置顶状态指示器 */}
                      {isPinned && (
                        <div className="absolute bottom-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                          <FaThumbtack />
                          已置顶
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;