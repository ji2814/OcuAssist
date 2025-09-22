import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import {
  ChatMessage,
  MessageAttachment,
  DEFAULT_UPLOAD_CONFIG,
  ChatHistory
} from '../types/AIChatType';
import { useAppSettings } from './AppSettings';
import { callLlmApi } from '../utils/CallLlmApi';
import { ChatPrompt } from '../utils/Prompts';

// AI聊天上下文类型
interface AIChatContextType {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  conversationId: string | null;
  sendMessage: (request: any) => Promise<void>;
  clearConversation: () => void;
  uploadFile: (file: File) => Promise<MessageAttachment>;
  uploadImage: (imageFile: File) => Promise<MessageAttachment>;
}

// 创建Context
const AIChatContext = createContext<AIChatContextType | undefined>(undefined);

// Provider组件
export const AIChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { settings } = useAppSettings();
  
  // 用于生成唯一ID
  const generateId = () => Math.random().toString(36);
  
  // AI响应函数 - 调用真实LLM API
  const performAIChat = useCallback(async (request: any, currentMessages: ChatMessage[] = []): Promise<any> => {
    try {
      // 构建消息历史 - 从当前messages状态中获取历史消息
      const messages: ChatHistory = [ChatPrompt];
      
      // 添加历史消息（过滤掉系统消息，避免重复）
      const historyMessages = currentMessages.filter(msg => msg.role !== 'system');
      messages.push(...historyMessages);
      
      // 构建用户消息内容
      const userMessageContent: ChatMessage['content'] = [];
      
      // 处理图片附件 - 使用image_url类型发送图片
      if (request.attachments && request.attachments.length > 0) {
        request.attachments.forEach((attachment: MessageAttachment) => {
          if (attachment.type === 'image' && attachment.base64) {
            // 使用image_url类型发送图片，让LLM能够真正看到图片
            userMessageContent.push({
              type: 'image_url',
              image_url: {
                url: attachment.base64
              }
            });
          }
        });
      }
      
      // 处理当前图像上下文
      if (request.context?.currentImage?.base64) {
        userMessageContent.push({
          type: 'image_url',
          image_url: {
            url: request.context.currentImage.base64
          }
        });
      }
      
      // 添加文本消息
      if (request.message) {
        let messageText = request.message;
        
        // 如果有附件，添加附件描述信息
        if (request.attachments && request.attachments.length > 0) {
          messageText += `\n\n[用户上传了${request.attachments.length}个文件]`;
          request.attachments.forEach((attachment: MessageAttachment, index: number) => {
            messageText += `\n文件${index + 1}: ${attachment.name} (${attachment.type})`;
          });
        }
        
        userMessageContent.push({
          type: 'text',
          text: messageText
        });
      }
      
      // 创建用户消息
      const userMessage: ChatMessage = {
        role: 'user',
        content: userMessageContent,
      };
      
      messages.push(userMessage);
      
      // 调用LLM API
      const llmResponse = await callLlmApi(settings.llmConfig.chat, messages, true, false);
      const thinking = llmResponse.reasoning_content;
      
      return {
        message: llmResponse.content,
        thinkingProcess: thinking,
        conversationId: request.conversationId || generateId(),
      };
    } catch (error) {
      console.error('LLM API调用失败:', error);
      throw new Error(`AI对话失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }, [settings.llmConfig.chat]);
  
  // 文件上传处理
  const processFile = useCallback(async (file: File): Promise<MessageAttachment> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        const attachment: MessageAttachment = {
          id: generateId(),
          type: file.type.startsWith('image/') ? 'image' : 'file',
          name: file.name,
          url: URL.createObjectURL(file),
          size: file.size,
          mimeType: file.type,
          base64: base64
        };
        resolve(attachment);
      };
      
      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };
      
      reader.readAsDataURL(file);
    });
  }, []);
  
  // 上传文件
  const uploadFile = useCallback(async (file: File): Promise<MessageAttachment> => {
    // 验证文件大小
    if (file.size > DEFAULT_UPLOAD_CONFIG.maxFileSize) {
      throw new Error(`文件大小超过限制 (${DEFAULT_UPLOAD_CONFIG.maxFileSize / (1024 * 1024)}MB)`);
    }
    
    // 验证文件类型
    const allowedTypes = [...DEFAULT_UPLOAD_CONFIG.allowedImageTypes, ...DEFAULT_UPLOAD_CONFIG.allowedFileTypes];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('不支持的文件类型');
    }
    
    return await processFile(file);
  }, [processFile]);
  
  // 上传图片
  const uploadImage = useCallback(async (imageFile: File): Promise<MessageAttachment> => {
    // 验证图片类型
    if (!DEFAULT_UPLOAD_CONFIG.allowedImageTypes.includes(imageFile.type)) {
      throw new Error('不支持的图片格式');
    }
    
    return await processFile(imageFile);
  }, [processFile]);
  
  // 发送消息
  const sendMessage = useCallback(async (request: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 创建用户消息
      const userMessage: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: [{
          type: 'text',
          text: request.message
        }],
        timestamp: new Date(),
        attachments: request.attachments
      };
      
      // 添加用户消息到列表
      setMessages(prev => [...prev, userMessage]);
      
      // 获取当前上下文信息
      const context = {
        ...request.context,
      };
      
      // 发送请求到AI
      const response = await performAIChat({
        ...request,
        context,
        conversationId: conversationId || undefined
      }, messages);
      
      // 更新会话ID
      if (response.conversationId) {
        setConversationId(response.conversationId);
      }
      
      // 创建AI回复消息
      const aiMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: [{
          type: 'text',
          text: response.message
        }],
        timestamp: new Date(),
        thinking: response.thinkingProcess
      };
      
      // 添加AI回复到列表
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '发送消息失败';
      setError(errorMessage);
      
      // 添加错误消息
      const errorMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: [{
          type: 'text',
          text: `抱歉，处理您的消息时出现了错误：${errorMessage}`
        }],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [performAIChat, conversationId, messages]);
  
  
  // 清除对话
  const clearConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setError(null);
  }, []);
  
  const contextValue = {
    messages,
    isLoading,
    error,
    conversationId,
    sendMessage,
    clearConversation,
    uploadFile,
    uploadImage
  };
  
  return (
    <AIChatContext.Provider value={contextValue}>
      {children}
    </AIChatContext.Provider>
  );
};

// 自定义hook用于使用Context
export const useAIChat = () => {
  const context = useContext(AIChatContext);
  if (context === undefined) {
    throw new Error('useAIChat must be used within an AIChatProvider');
  }
  return context;
};

export { AIChatContext };