import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { ModalType } from '../types/FundImageType';
import { DiagnosisContextType, DiagnosisResult, AIDiagnosisRequest } from '../types/DiagnosisType';
import { callLlmApi } from '../utils/CallLlmApi';
import { url2base64 } from '../utils/url2base64';
import { useAppSettings } from './AppSettings';
import { diagnosisPrompt } from '../utils/Prompts';
import { parseBoxContent } from '../utils/parseBBox';
import { ChatMessage } from '../types/AIChatType';

// 创建Context
const DiagnosisContext = createContext<DiagnosisContextType | undefined>(undefined);

// Provider组件
export const DiagnosisProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 获取应用设置
  const { settings } = useAppSettings();
  // AI诊断结果
  const [diagnosisResults, setDiagnosisResults] = useState<{
    OCT: DiagnosisResult | null;
    FFA: DiagnosisResult | null;
    CFP: DiagnosisResult | null;
  }>({
    OCT: null,
    FFA: null,
    CFP: null
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

  // 解析LLM API响应，将JSON字符串转换为DiagnosisResult
  const parseLlmResponse = (response: string, modalType: ModalType): DiagnosisResult => {
    try {
      // 尝试解析JSON响应
      const content = parseBoxContent(response);
      console.log('解析后的响应内容:', content);
      const parsedResponse = JSON.parse(content);
      return {
        modalType,
        imageDescription: parsedResponse.imageDescription || '无法获取图像描述',
        lesionType: parsedResponse.lesionType || ['未检测到明显异常'],
        diseaseType: parsedResponse.diseaseType || '正常',
        diagnosticBasis: parsedResponse.diagnosticBasis || ['图像质量良好，未见明显异常'],
        confidence: parsedResponse.confidence || 0.5,
        timestamp: new Date()
      };
    } catch (error) {
      // 如果JSON解析失败，返回默认结果
      console.error('解析LLM响应失败:', error);
      return {
        modalType,
        imageDescription: 'AI分析完成，但响应格式异常',
        lesionType: [''],
        diseaseType: '',
        diagnosticBasis: [''],
        confidence: 1.0,
        timestamp: new Date()
      };
    }
  };

  // AI诊断函数
  const performAIDiagnosis = useCallback(async (request: AIDiagnosisRequest): Promise<DiagnosisResult> => {
    const { modalType, imageUrl } = request;
    const imageBase64 = await url2base64(imageUrl);

    // 获取对应模态的诊断提示词
    const systemPrompt: ChatMessage = diagnosisPrompt(modalType);
    const systemPrompts: ChatMessage[] = [systemPrompt]

    // 建用户消息，包含图像信息
    const userMessage: ChatMessage[] = [
      {
        role: 'user',
        content: [{
          type: 'image_url',
          image_url: {
            url: imageBase64
          }
        }, {
          type: 'text',
          text: `请分析这张${modalType}图像并提供诊断意见。`
        }],
      }];

    // 构建消息历史
    const messages: ChatMessage[] = [...systemPrompts, ...userMessage];

    try {
      // 调用LLM API
      const llmResponse = await callLlmApi(settings.llmConfig.diagnosis, messages);

      // 解析响应并转换为DiagnosisResult格式
      const diagnosisResult = parseLlmResponse(llmResponse.content, modalType);

      return diagnosisResult;
    } catch (error) {
      console.error(`LLM API调用失败 for ${modalType}:`, error);
      throw new Error(`AI诊断失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }, [settings.llmConfig.diagnosis]);

  // 执行AI诊断
  const diagnoseImage = useCallback(async (request: AIDiagnosisRequest) => {
    const { modalType } = request;

    // 设置加载状态
    setIsLoading(prev => ({ ...prev, [modalType]: true }));
    setErrors(prev => ({ ...prev, [modalType]: null }));

    try {
      // 执行AI诊断
      const result = await performAIDiagnosis(request);

      // 更新诊断结果
      setDiagnosisResults(prev => ({
        ...prev,
        [modalType]: result
      }));
    } catch (error) {
      // 设置错误状态
      setErrors(prev => ({
        ...prev,
        [modalType]: error instanceof Error ? error.message : '诊断失败，请重试'
      }));
    } finally {
      // 清除加载状态
      setIsLoading(prev => ({ ...prev, [modalType]: false }));
    }
  }, [performAIDiagnosis]);

  // 清除诊断结果
  const clearDiagnosis = useCallback((modalType: ModalType) => {
    setDiagnosisResults(prev => ({
      ...prev,
      [modalType]: null
    }));
    setErrors(prev => ({
      ...prev,
      [modalType]: null
    }));
  }, []);

  // 清除所有诊断结果
  const clearAllDiagnoses = useCallback(() => {
    setDiagnosisResults({
      OCT: null,
      FFA: null,
      CFP: null
    });
    setErrors({
      OCT: null,
      FFA: null,
      CFP: null
    });
  }, []);

  const contextValue: DiagnosisContextType = {
    diagnosisResults,
    isLoading,
    errors,
    diagnoseImage,
    clearDiagnosis,
    clearAllDiagnoses
  };

  return (
    <DiagnosisContext.Provider value={contextValue}>
      {children}
    </DiagnosisContext.Provider>
  );
};

// 自定义hook用于使用Context
export const useDiagnosis = () => {
  const context = useContext(DiagnosisContext);
  if (context === undefined) {
    throw new Error('useDiagnosis must be used within a DiagnosisProvider');
  }
  return context;
};

export { DiagnosisContext };