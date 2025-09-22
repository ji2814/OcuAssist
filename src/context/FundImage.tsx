import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { FundImage, ModalType } from '../types/FundImageType';
import { FundImageContextType } from '../types/FundImageContextType';

// 创建Context
const FundImageContext = createContext<FundImageContextType | undefined>(undefined);

// Provider组件
export const FundImageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 按模态分类的图像列表
  const [imagesByModal, setImagesByModal] = useState<{
    OCT: FundImage[];
    FFA: FundImage[];
    CFP: FundImage[];
  }>({
    OCT: [],
    FFA: [],
    CFP: []
  });

  // 当前选中的图像
  const [selectedImage, setSelectedImage] = useState<FundImage | null>(null);

  // 添加图像
  const addImage = useCallback((image: FundImage) => {
    setImagesByModal(prev => ({
      ...prev,
      [image.modalType]: [...prev[image.modalType], image]
    }));
  }, []);

  // 删除图像
  const removeImage = useCallback((imageId: string, modalType: ModalType) => {
    setImagesByModal(prev => ({
      ...prev,
      [modalType]: prev[modalType].filter(img => img.imageID !== imageId)
    }));
    
    // 如果删除的是当前选中的图像，清空选中状态
    if (selectedImage && selectedImage.imageID === imageId) {
      setSelectedImage(null);
    }
  }, [selectedImage]);

  // 选择图像（双击）
  const selectImage = useCallback((image: FundImage) => {
    setSelectedImage(image);
  }, []);

  // 置顶图像
  const pinImage = useCallback((imageId: string, modalType: ModalType) => {
    setImagesByModal(prev => {
      const updatedImages = prev[modalType].map(img => 
        img.imageID === imageId 
          ? { ...img, metadata: { ...img.metadata, pinned: true } }
          : img
      );
      
      return {
        ...prev,
        [modalType]: updatedImages
      };
    });
  }, []);

  // 取消置顶图像
  const unpinImage = useCallback((imageId: string, modalType: ModalType) => {
    setImagesByModal(prev => {
      const updatedImages = prev[modalType].map(img => 
        img.imageID === imageId 
          ? { ...img, metadata: { ...img.metadata, pinned: false } }
          : img
      );
      
      return {
        ...prev,
        [modalType]: updatedImages
      };
    });
  }, []);

  // 获取指定模态的图像列表（按置顶状态排序）
  const getImagesByModal = useCallback((modalType: ModalType): FundImage[] => {
    const images = imagesByModal[modalType];
    // 按置顶状态排序，置顶的在前
    return [...images].sort((a, b) => {
      const aPinned = a.metadata?.pinned || false;
      const bPinned = b.metadata?.pinned || false;
      return Number(bPinned) - Number(aPinned);
    });
  }, [imagesByModal]);

  // 清空指定模态的图像
  const clearImagesByModal = useCallback((modalType: ModalType) => {
    setImagesByModal(prev => ({
      ...prev,
      [modalType]: []
    }));
    
    // 如果清空的是当前选中的图像所在的模态，清空选中状态
    if (selectedImage && selectedImage.modalType === modalType) {
      setSelectedImage(null);
    }
  }, [selectedImage]);

  // 清空所有图像
  const clearAllImages = useCallback(() => {
    setImagesByModal({
      OCT: [],
      FFA: [],
      CFP: []
    });
    setSelectedImage(null);
  }, []);

  const contextValue: FundImageContextType = {
    imagesByModal,
    selectedImage,
    addImage,
    removeImage,
    selectImage,
    pinImage,
    unpinImage,
    getImagesByModal,
    clearImagesByModal,
    clearAllImages
  };

  return (
    <FundImageContext.Provider value={contextValue}>
      {children}
    </FundImageContext.Provider>
  );
};

// 自定义hook用于使用Context
export const useFundImage = () => {
  const context = useContext(FundImageContext);
  if (context === undefined) {
    throw new Error('useFundImage must be used within a FundImageProvider');
  }
  return context;
};

export { FundImageContext };