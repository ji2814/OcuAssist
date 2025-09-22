import { FundImage, ModalType } from './FundImageType';

export interface FundImageContextType {
  // 按模态分类的图像列表
  imagesByModal: {
    OCT: FundImage[];
    FFA: FundImage[];
    CFP: FundImage[];
  };
  
  // 当前选中的图像
  selectedImage: FundImage | null;
  
  // 添加图像
  addImage: (image: FundImage) => void;
  
  // 删除图像
  removeImage: (imageId: string, modalType: ModalType) => void;
  
  // 选择图像（双击）
  selectImage: (image: FundImage) => void;
  
  // 置顶图像
  pinImage: (imageId: string, modalType: ModalType) => void;
  
  // 取消置顶图像
  unpinImage: (imageId: string, modalType: ModalType) => void;
  
  // 获取指定模态的图像列表（按置顶状态排序）
  getImagesByModal: (modalType: ModalType) => FundImage[];
  
  // 清空指定模态的图像
  clearImagesByModal: (modalType: ModalType) => void;
  
  // 清空所有图像
  clearAllImages: () => void;
}