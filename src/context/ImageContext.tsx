// compose/context/ImageContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { FundusImage } from '../types/FundusImage';

// 创建一个上下文
const ImageContext = createContext<{
    imageList: FundusImage[];
    addImage: (image: FundusImage) => FundusImage;
    selectImage: (image: FundusImage) => void;
    removeImage: (imageId: string) => void;
    selectedImage: FundusImage | null;
    allImages: FundusImage[];
    compareImage: FundusImage | null;
    setCompareImage: (image: FundusImage | null) => void;
    displayedImages: Record<string, FundusImage>;
}>({
    imageList: [],
    addImage: () => ({ id: '', path: '', url: '', fileName: '', patientId: '', base64: '', date: new Date(), eye: 'left', modal: 'CFP' }),
    selectImage: () => {},
    removeImage: () => {},
    selectedImage: null,
    allImages: [],
    compareImage: null,
    setCompareImage: () => {},
    displayedImages: {}
});
 
interface ImageProviderProps {
    children: ReactNode;
}

// 上下文提供者组件
const ImageProvider: React.FC<ImageProviderProps> = ({ children }) => {
    const [imageList, setImageList] = useState<FundusImage[]>([]);
    const [selectedImage, setSelectedImage] = useState<FundusImage | null>(null);
    const [compareImage, setCompareImage] = useState<FundusImage | null>(null);
    const [displayedImages, setDisplayedImages] = useState<Record<string, FundusImage>>({});

    // 初始化时和imageList变化时更新displayedImages
    useEffect(() => {
        const newDisplayedImage: Record<string, FundusImage> = {};
        imageList.forEach(image => {
            const modal = image.modal;
            newDisplayedImage[modal] = image;
        });
        setDisplayedImages(newDisplayedImage);
    }, [imageList]);

    // 添加图像
    const addImage = (image: FundusImage) => {
        const imageWithModal = {
            ...image,
            modal: image.modal || 'other'
        };
        setImageList(prevList => {
            const newList = [...prevList, imageWithModal];
            // 更新displayedImages
            setDisplayedImages(prev => ({
                ...prev,
                [imageWithModal.modal]: imageWithModal
            }));
            return newList;
        });
        return imageWithModal; // 返回添加后的图片对象
    };

    // 选择图像
    const selectImage = (image: FundusImage) => {
        setSelectedImage(() => ({...image})); // 确保总是更新
        // 更新displayedImages中对应modal
        setDisplayedImages(prev => ({
            ...prev,
            [image.modal]: {...image}
        }));
    };

    // 删除图像
    const removeImage = (imageId: string) => {
        // 从列表中删除图像
        setImageList(prevList => {
            const newList = prevList.filter(image => image.id !== imageId);
            return newList;
        });
        
        // 如果删除的是当前选中的图像，清除选择状态
        if (selectedImage && selectedImage.id === imageId) {
            setSelectedImage(null);
        }
    };

    // 提供所有图像列表
    const allImages = imageList;

    return (
        <ImageContext.Provider value={{
            imageList,
            addImage,
            selectImage,
            removeImage,
            selectedImage,
            allImages,
            compareImage,
            setCompareImage,
            displayedImages
            }}>
            {children}
        </ImageContext.Provider>
    );
};

// 自定义 Hook 用于获取上下文
const useImageContext = () => {
    return useContext(ImageContext);
};

export { ImageProvider, useImageContext };
