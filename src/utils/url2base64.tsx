export async function url2base64(url: string): Promise<string> {
  try {
    // 先通过fetch获取blob对象
    const response = await fetch(url);
    const blob = await response.blob();
    
    // 再将blob转换为base64
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('无法转换为base64'));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  } catch (error) {
    console.error('转换失败:', error);
    throw error;
  }
};