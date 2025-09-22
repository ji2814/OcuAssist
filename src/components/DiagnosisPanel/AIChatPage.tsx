import React, { useState, useRef, useEffect } from 'react';
import { useAIChat } from '../../context/AIChat';
import { ChatMessage, MessageAttachment } from '../../types/AIChatType';
import clsx from 'clsx';
import {
  FaPaperPlane,
  FaPaperclip,
  FaImage,
  FaFile,
  FaSpinner,
  FaLightbulb,
  FaRobot,
  FaUser,
  FaChevronDown,
  FaTimes,
  FaNotesMedical,
  FaHistory,
  FaUserMd,
  FaStethoscope,
} from 'react-icons/fa';

interface AIChatPageProps {
  className?: string;
}

const AIChatPage: React.FC<AIChatPageProps> = ({ className }) => {
  const { messages, isLoading, sendMessage, uploadFile, uploadImage, clearConversation } = useAIChat();
  const [inputMessage, setInputMessage] = useState('');
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [isThinkingExpanded, setIsThinkingExpanded] = useState<{ [key: string]: boolean }>({});
  const [quickInputs, setQuickInputs] = useState({
    chiefComplaint: '',
    historyOfPresentIllness: '',
    pastHistory: '',
    physicalExamination: ''
  });
  const [showQuickInputs, setShowQuickInputs] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 处理快速输入
  const handleQuickInputChange = (field: keyof typeof quickInputs, value: string) => {
    setQuickInputs(prev => ({ ...prev, [field]: value }));
  };

  // 生成快速输入消息
  const generateQuickInputMessage = () => {
    const sections = [];
    if (quickInputs.chiefComplaint) sections.push(`主诉：${quickInputs.chiefComplaint}`);
    if (quickInputs.historyOfPresentIllness) sections.push(`现病史：${quickInputs.historyOfPresentIllness}`);
    if (quickInputs.pastHistory) sections.push(`既往史：${quickInputs.pastHistory}`);
    if (quickInputs.physicalExamination) sections.push(`体格检查：${quickInputs.physicalExamination}`);
    
    return sections.join('\n\n');
  };

  // 导出快捷输入到诊断报告
  const exportQuickInputToReport = () => {
    const message = generateQuickInputMessage();
    if (!message.trim()) {
      alert('请先填写病例信息');
      return;
    }

    // 直接发送消息到AI，这样消息会被添加到聊天记录中
    // 诊断报告会自动从聊天记录中提取病例信息
    sendMessage({
      message: message,
      attachments: undefined,
      context: {}
    });
    
    // 清空快捷输入
    setQuickInputs({
      chiefComplaint: '',
      historyOfPresentIllness: '',
      pastHistory: '',
      physicalExamination: ''
    });
    
    // 隐藏快捷输入面板
    setShowQuickInputs(false);
  };

  // 处理发送消息
  const handleSendMessage = async () => {
    if (!inputMessage.trim() && attachments.length === 0) return;

    // 立即清空输入框和附件，提供更好的用户体验
    const messageToSend = inputMessage;
    const attachmentsToSend = [...attachments];
    setInputMessage('');
    setAttachments([]);

    try {
      await sendMessage({
        message: messageToSend,
        attachments: attachmentsToSend.length > 0 ? attachmentsToSend : undefined,
        context: {}
      });
    } catch (err) {
      console.error('发送消息失败:', err);
      // 如果发送失败，可以选择恢复输入内容（可选）
      // setInputMessage(messageToSend);
      // setAttachments(attachmentsToSend);
    }
  };

  // 处理文件上传
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'image') => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let attachment: MessageAttachment;
        
        if (type === 'image') {
          attachment = await uploadImage(file);
        } else {
          attachment = await uploadFile(file);
        }
        
        setAttachments(prev => [...prev, attachment]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '文件上传失败';
      alert(errorMessage);
    }

    // 清空input值，允许重复上传相同文件
    if (type === 'image' && imageInputRef.current) {
      imageInputRef.current.value = '';
    } else if (type === 'file' && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 移除附件
  const removeAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };


  // 思考过程组件
  const ThinkingProcess: React.FC<{ thinking?: string; messageId: string }> = ({ thinking, messageId }) => {
    const isExpanded = isThinkingExpanded[messageId] || false;

    return (
      <div className="mt-3 bg-blue-50 rounded-lg border border-blue-200">
        <button
          onClick={() => setIsThinkingExpanded(prev => ({ ...prev, [messageId]: !isExpanded }))}
          className="w-full p-3 flex items-center justify-between text-left hover:bg-blue-100 transition-colors rounded-lg"
        >
          <div className="flex items-center gap-2">
            <FaLightbulb className="text-blue-600" />
            <span className="text-sm font-medium text-blue-800">AI思考过程</span>
          </div>
          <FaChevronDown className={`text-blue-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
        
        {isExpanded && thinking && (
          <div className="px-3 pb-3">
            <div className="p-3 bg-white rounded border">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                {thinking}
              </pre>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 附件预览组件
  const AttachmentPreview: React.FC<{ attachment: MessageAttachment }> = ({ attachment }) => {
    if (attachment.type === 'image') {
      return (
        <div className="relative group">
          <img
            src={attachment.url}
            alt={attachment.name}
            className="w-16 h-16 object-cover rounded border"
          />
          <button
            onClick={() => removeAttachment(attachment.id)}
            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2 p-2 bg-gray-100 rounded border relative group">
        <FaFile className="text-gray-600" />
        <span className="text-sm text-gray-700 truncate max-w-32">{attachment.name}</span>
        <button
          onClick={() => removeAttachment(attachment.id)}
          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <FaTimes className="text-xs" />
        </button>
      </div>
    );
  };

  // 消息组件
  const Message: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.role === 'user';
    
    return (
      <div className={clsx('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
        <div className={clsx(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
          isUser ? 'bg-blue-500' : 'bg-green-500'
        )}>
          {isUser ? (
            <FaUser className="text-white text-sm" />
          ) : (
            <FaRobot className="text-white text-sm" />
          )}
        </div>
        
        <div className={clsx('flex-1 max-w-[70%]', isUser ? 'items-end' : 'items-start')}>
          <div className={clsx(
            'rounded-lg p-3',
            isUser 
              ? 'bg-blue-500 text-white' 
              : 'bg-white border border-gray-200 text-gray-800'
          )}>
            {/* 思考过程 */}
            {message.thinking && (
              <ThinkingProcess thinking={message.thinking} messageId={message.id || 'default'} />
            )}
            
            {/* 消息内容 */}
            <p className="text-sm whitespace-pre-wrap">
              {Array.isArray(message.content)
                ? message.content.map(item => {
                    if (item.type === 'text') {
                      return item.text || '';
                    } else if (item.type === 'image_url') {
                      return `[图片: ${item.image_url?.url || ''}]`;
                    }
                    return '';
                  }).join('')
                : typeof message.content === 'string'
                ? message.content
                : ''
              }
            </p>
            
            {/* 附件 */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {message.attachments.map(attachment => (
                  <div key={attachment.id}>
                    {attachment.type === 'image' ? (
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => window.open(attachment.url, '_blank')}
                      />
                    ) : (
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                      >
                        <FaFile className="text-gray-600" />
                        <span className="text-xs text-gray-700 truncate">{attachment.name}</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* 时间戳 */}
          <div className={clsx(
            'text-xs text-gray-500 mt-1',
            isUser ? 'text-right' : 'text-left'
          )}>
            {message.timestamp?.toLocaleTimeString() || ''}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={clsx('h-full flex flex-col', className)}>
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <FaRobot className="text-green-500 text-xl" />
          <div>
            <h2 className="text-lg font-semibold text-gray-800">AI智能助手</h2>
          </div>
        </div>
        <button
          onClick={clearConversation}
          className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
        >
          清空对话
        </button>
      </div>

      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <FaRobot className="text-4xl mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">欢迎使用AI智能助手</h3>
              <p className="text-sm">您可以上传图片或文件，与我进行多轮对话</p>
              <p className="text-xs mt-2">支持OCT、FFA、CFP等眼科图像分析</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map(message => (
              <Message key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <FaRobot className="text-white text-sm" />
                </div>
                <div className="flex-1">
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <FaSpinner className="animate-spin text-blue-500" />
                      <span className="text-sm text-gray-600">AI正在思考中...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="border-t border-gray-200 p-4 bg-white">
        {/* 快速输入框 */}
        <div className="mb-3">
          <button
            onClick={() => setShowQuickInputs(!showQuickInputs)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mb-2"
          >
            <FaNotesMedical />
            {showQuickInputs ? '隐藏' : '显示'}快捷输入
          </button>
          
          {showQuickInputs && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaNotesMedical className="inline mr-1" />
                  主诉
                </label>
                <textarea
                  value={quickInputs.chiefComplaint}
                  onChange={(e) => handleQuickInputChange('chiefComplaint', e.target.value)}
                  placeholder="患者主要症状描述..."
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  inputMode="text"
                  lang="zh-CN"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaHistory className="inline mr-1" />
                  现病史
                </label>
                <textarea
                  value={quickInputs.historyOfPresentIllness}
                  onChange={(e) => handleQuickInputChange('historyOfPresentIllness', e.target.value)}
                  placeholder="疾病发生发展过程..."
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  inputMode="text"
                  lang="zh-CN"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaUserMd className="inline mr-1" />
                  既往史
                </label>
                <textarea
                  value={quickInputs.pastHistory}
                  onChange={(e) => handleQuickInputChange('pastHistory', e.target.value)}
                  placeholder="既往疾病、手术、外伤史..."
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  inputMode="text"
                  lang="zh-CN"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaStethoscope className="inline mr-1" />
                  体格检查
                </label>
                <textarea
                  value={quickInputs.physicalExamination}
                  onChange={(e) => handleQuickInputChange('physicalExamination', e.target.value)}
                  placeholder="体格检查发现..."
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  inputMode="text"
                  lang="zh-CN"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                />
              </div>
              
              <div className="md:col-span-2 flex gap-2">
                <button
                  onClick={exportQuickInputToReport}
                  disabled={!Object.values(quickInputs).some(value => value.trim())}
                  className={clsx(
                    'px-4 py-2 rounded text-sm transition-colors',
                    Object.values(quickInputs).some(value => value.trim())
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  )}
                >
                  添加到输入框
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* 附件预览 */}
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map(attachment => (
              <AttachmentPreview key={attachment.id} attachment={attachment} />
            ))}
          </div>
        )}
        
        <div className="flex gap-2">
          {/* 上传按钮 */}
          <div className="flex gap-1">
            <button
              onClick={() => imageInputRef.current?.click()}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
              title="上传图片"
            >
              <FaImage />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
              title="上传文件"
            >
              <FaPaperclip />
            </button>
          </div>
          
          {/* 输入框 */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e, 'file')}
          />
          <input
            ref={imageInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileUpload(e, 'image')}
          />
          
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="输入您的问题... (Shift+Enter换行)"
            className="flex-1 p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
            disabled={isLoading}
            inputMode="text"
            lang="zh-CN"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
          
          {/* 发送按钮 */}
          <button
            onClick={handleSendMessage}
            disabled={isLoading || (!inputMessage.trim() && attachments.length === 0)}
            className={clsx(
              'px-4 py-2 rounded-lg flex items-center gap-2 transition-colors',
              isLoading || (!inputMessage.trim() && attachments.length === 0)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            )}
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin" />
                发送中
              </>
            ) : (
              <>
                <FaPaperPlane />
                发送
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatPage;