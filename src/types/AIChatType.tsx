export type ChatHistory = ChatMessage[];

// AI聊天消息类型
export interface ChatMessage {
  id?: string;
  role: string;
  content: {
    type: "text" | "image_url";
    text?: string;
    image_url?: {
      url:string
    };
  }[];
  timestamp?: Date;
  attachments?: MessageAttachment[];
  thinking?: string;
}

// 消息附件类型
export interface MessageAttachment {
  id: string;
  type: 'image' | 'file';
  name: string;
  url: string;
  size?: number;
  mimeType?: string;
  base64?: string; // 用于图片预览
}

// 文件上传配置
export interface UploadConfig {
  maxFileSize: number; // 字节
  allowedImageTypes: string[];
  allowedFileTypes: string[];
  maxImageWidth?: number;
  maxImageHeight?: number;
}

// 默认上传配置
export const DEFAULT_UPLOAD_CONFIG: UploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  allowedFileTypes: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  maxImageWidth: 2048,
  maxImageHeight: 2048
};