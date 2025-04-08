import { readFile } from '@tauri-apps/plugin-fs';
  
// 将文件转换为 base64
export const fileToBase64 = async (filePath: string): Promise<string> => {
    try {
      const binaryData = await readFile(filePath);
      const base64String = btoa(
        binaryData.reduce((data: string, byte: number) => data + String.fromCharCode(byte), '')
      );
      return `data:image/png;base64,${base64String}`;
    } catch (error) {
      console.error('Error converting file to base64:', error);
      return '';
    }
  };