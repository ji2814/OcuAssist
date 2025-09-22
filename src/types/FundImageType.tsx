// 模态类型定义
export type ModalType = 'OCT' | 'FFA' | 'CFP';

// 图像数据接口
export interface FundImage {
  patientID: string;
  imageID?: string;
  url: string;
  base64?: string;
  modalType: ModalType;
  uploadDate: string;

  metadata?: {
    size?: string;
    pinned?: boolean;
    eye: 'OD' | 'OS'; //OD是左眼，OS是右眼
  };
}