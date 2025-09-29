import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { RecognitionRequest, RecognitionResult, AutomorphResult, OCTSegResult } from '../types/RecognitionType';
import { ModalType } from '../types/FundImageType';
import { fetch } from '@tauri-apps/plugin-http';
import { url2base64 } from '../utils/url2base64';

// Recognition上下文类型
interface RecognitionContextType {
  // 识别结果
  recognitionResults: {
    OCT: RecognitionResult | null;
    FFA: RecognitionResult | null;
    CFP: RecognitionResult | null;
  };
  // automorph结果
  automorphResults: {
    OCT: AutomorphResult | null;
    FFA: AutomorphResult | null;
    CFP: AutomorphResult | null;
  };
  // OCTSeg分割结果
  octSegResults: {
    OCT: OCTSegResult | null;
  };
  // 加载状态
  isLoading: {
    OCT: boolean;
    FFA: boolean;
    CFP: boolean;
  };
  // 错误状态
  errors: {
    OCT: string | null;
    FFA: string | null;
    CFP: string | null;
  };
  // 执行automorph
  performAutomorph: (request: RecognitionRequest, modalType: ModalType) => Promise<void>;
  // 执行OCTSeg分割
  performOCTSeg: (request: RecognitionRequest) => Promise<void>;
  // 清除识别结果
  clearRecognition: (modalType: ModalType) => void;
  // 清除automorph结果
  clearAutomorph: (modalType: ModalType) => void;
  // 清除OCTSeg结果
  clearOCTSeg: () => void;
  // 清除所有结果
  clearAllResults: () => void;
}

// 创建Context
const RecognitionContext = createContext<RecognitionContextType | undefined>(undefined);

// Provider组件
export const RecognitionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 识别结果
  const [recognitionResults, setRecognitionResults] = useState<{
    OCT: RecognitionResult | null;
    FFA: RecognitionResult | null;
    CFP: RecognitionResult | null;
  }>({
    OCT: null,
    FFA: null,
    CFP: null
  });

  // automorph结果
  const [automorphResults, setAutomorphResults] = useState<{
    OCT: AutomorphResult | null;
    FFA: AutomorphResult | null;
    CFP: AutomorphResult | null;
  }>({
    OCT: null,
    FFA: null,
    CFP: null
  });

  // OCTSeg分割结果
  const [octSegResults, setOctSegResults] = useState<{
    OCT: OCTSegResult | null;
  }>({
    OCT: null
  });

  // 加载状态
  const [isLoading, setIsLoading] = useState<{
    OCT: boolean;
    FFA: boolean;
    CFP: boolean;
  }>({
    OCT: false,
    FFA: false,
    CFP: false
  });

  // 错误状态
  const [errors, setErrors] = useState<{
    OCT: string | null;
    FFA: string | null;
    CFP: string | null;
  }>({
    OCT: null,
    FFA: null,
    CFP: null
  });

  // API调用函数
  const apiCall = async (endpoint: string, data: any): Promise<any> => {
    console.log('API调用数据:', {
      ...data,
      base64: data.base64 ? `${data.base64.substring(0, 100)}...` : 'null'
    });
    
    try {
      // POST请求
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('API响应数据:', result);
      return result;
    } catch (error) {
      console.error('API调用失败:', error);
      throw error;
    }
  };

  // 执行automorph
  const performAutomorph = useCallback(async (request: RecognitionRequest, modalType: ModalType) => {
    // 验证是否为CFP图像
    if (modalType !== 'CFP') {
      setErrors(prev => ({
        ...prev,
        [modalType]: 'Automorph分析仅支持CFP（彩色眼底照相）图像'
      }));
      return;
    }

    // 设置加载状态
    setIsLoading(prev => ({ ...prev, [modalType]: true }));
    setErrors(prev => ({ ...prev, [modalType]: null }));

    try {
      console.log(`开始处理${modalType}图像:`, request.image);
      
      // 将图像URL转换为base64
      const base64Data = await url2base64(request.image);
      
      // 调用API
      const result = await apiCall(`http://localhost:5000/api/automorph`, {
        image: request.image,
        base64: base64Data
      });

      console.log(`Automorph分析完成 - ${modalType}:`, result);

      // 更新automorph结果
      setAutomorphResults(prev => ({
        ...prev,
        [modalType]: result
      }));
    } catch (error) {
      console.error(`Automorph分析失败 - ${modalType}:`, error);
      // 设置错误状态
      setErrors(prev => ({
        ...prev,
        [modalType]: error instanceof Error ? error.message : 'Automorph失败，请重试'
      }));
    } finally {
      // 清除加载状态
      setIsLoading(prev => ({ ...prev, [modalType]: false }));
    }
  }, []);

  // 执行OCTSeg分割
  const performOCTSeg = useCallback(async (request: RecognitionRequest) => {
    const modalType = 'OCT';
    
    // 设置加载状态
    setIsLoading(prev => ({ ...prev, [modalType]: true }));
    setErrors(prev => ({ ...prev, [modalType]: null }));

    try {
      console.log(`开始处理OCTSeg分割:`, request.image);
      
      // 将图像URL转换为base64
      const base64Data = await url2base64(request.image);
      
      // 调用API
      const result = await apiCall(`http://localhost:5000/api/octseg`, {
        image: request.image,
        base64: base64Data
      });

      console.log(`OCTSeg分割完成:`, result);

      // 更新OCTSeg结果
      setOctSegResults({
        OCT: result
      });
    } catch (error) {
      console.error(`OCTSeg分割失败:`, error);
      // 设置错误状态
      setErrors(prev => ({
        ...prev,
        [modalType]: error instanceof Error ? error.message : 'OCTSeg分割失败，请重试'
      }));
    } finally {
      // 清除加载状态
      setIsLoading(prev => ({ ...prev, [modalType]: false }));
    }
  }, []);

  // 清除识别结果
  const clearRecognition = useCallback((modalType: ModalType) => {
    setRecognitionResults(prev => ({
      ...prev,
      [modalType]: null
    }));
    setErrors(prev => ({
      ...prev,
      [modalType]: null
    }));
  }, []);

  // 清除automorph结果
  const clearAutomorph = useCallback((modalType: ModalType) => {
    setAutomorphResults(prev => ({
      ...prev,
      [modalType]: null
    }));
    setErrors(prev => ({
      ...prev,
      [modalType]: null
    }));
  }, []);

  // 清除OCTSeg结果
  const clearOCTSeg = useCallback(() => {
    setOctSegResults({
      OCT: null
    });
    setErrors(prev => ({
      ...prev,
      OCT: null
    }));
  }, []);

  // 清除所有结果
  const clearAllResults = useCallback(() => {
    setRecognitionResults({
      OCT: null,
      FFA: null,
      CFP: null
    });
    setAutomorphResults({
      OCT: null,
      FFA: null,
      CFP: null
    });
    setOctSegResults({
      OCT: null
    });
    setErrors({
      OCT: null,
      FFA: null,
      CFP: null
    });
  }, []);

  const contextValue: RecognitionContextType = {
    recognitionResults,
    automorphResults,
    octSegResults,
    isLoading,
    errors,
    performAutomorph,
    performOCTSeg,
    clearRecognition,
    clearAutomorph,
    clearOCTSeg,
    clearAllResults
  };

  return (
    <RecognitionContext.Provider value={contextValue}>
      {children}
    </RecognitionContext.Provider>
  );
};

// 自定义hook用于使用Context
export const useRecognition = () => {
  const context = useContext(RecognitionContext);
  if (context === undefined) {
    throw new Error('useRecognition must be used within a RecognitionProvider');
  }
  return context;
};

export { RecognitionContext };