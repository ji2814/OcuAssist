import React, { useState, useRef, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { Send, Loader } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatDialog: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [currentStreamId, setCurrentStreamId] = useState<string | null>(null);
  const currentStreamIdRef = useRef<string | null>(null);
  const unlistenersRef = useRef<UnlistenFn[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const debounce = (fn: Function, delay: number) => {
    let timer: number;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = window.setTimeout(() => fn(...args), delay);
    };
  };

  const debouncedScroll = useRef(debounce(scrollToBottom, 100)).current;

  useEffect(() => {
    debouncedScroll();
  }, [messages, debouncedScroll]);

  useEffect(() => {
    const setupEventListeners = async () => {
      try {
        const startUnlisten = await listen<string>('llm-stream-start', (event) => {
          setCurrentStreamId(event.payload);
          currentStreamIdRef.current = event.payload;
        });

        const tokenUnlisten = await listen<{ id: string, token: string, isFirst: boolean }>('llm-stream-token', (event) => {
          const { id, token, isFirst } = event.payload;
          if (id === currentStreamIdRef.current) {
            setMessages(prev => {
              if (isFirst) {
                return [
                  ...prev,
                  { role: 'assistant', content: token, timestamp: new Date() }
                ];
              } else {
                if (prev.length === 0) return prev;
                const lastMsg = prev[prev.length - 1];
                if (lastMsg.role !== 'assistant') return prev;

                return [
                  ...prev.slice(0, -1),
                  {
                    ...lastMsg,
                    content: lastMsg.content + token,
                  }
                ];
              }
            });
          }
        });

        const endUnlisten = await listen<string>('llm-stream-end', (event) => {
          if (event.payload === currentStreamIdRef.current) {
            setCurrentStreamId(null);
            currentStreamIdRef.current = null;
            setIsLoading(false);
          }
        });

        const errorUnlisten = await listen<string>('llm-stream-error', (event) => {
          console.error('流式响应错误:', event.payload);
        });

        unlistenersRef.current = [startUnlisten, tokenUnlisten, endUnlisten, errorUnlisten];
      } catch (error) {
        console.error('设置事件监听器失败:', error);
      }
    };

    setupEventListeners();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      unlistenersRef.current.forEach(unlisten => {
        try {
          unlisten();
        } catch (e) {
          console.error('解除事件监听失败:', e);
        }
      });
    };
  }, [currentStreamId]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const requestMessages = [
        ...messages.map((msg: Message) => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: "user",
          content: inputValue
        }
      ] as const;

      invoke<string>('call_llm_api', {
        messages: requestMessages,
        stream: true
      }).then(finalResult => {
        console.log('流式输出完成:', finalResult);
        if (!currentStreamId) {
          setIsLoading(false);
        }
      }).catch(error => {
        console.error('流式输出错误:', error);
        if (!currentStreamId) {
          const errorResponse: Message = {
            role: 'assistant',
            content: '无法获取AI回复，请稍后重试',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorResponse]);
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error('发送消息失败:', error);
      const errorResponse: Message = {
        role: 'assistant',
        content: '无法获取AI回复，请稍后重试',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-24 right-6 w-96 h-96 bg-gray-800 rounded-lg shadow-xl flex flex-col z-50">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">AI 助手</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setMessages([])}
            className="text-gray-400 hover:text-white"
            title="清除聊天记录"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-100'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && !currentStreamId && (
          <div className="flex justify-start">
            <div className="max-w-[70%] p-3 rounded-lg bg-gray-700 text-gray-100 flex items-center gap-2">
              <Loader className="animate-spin" size={20} />
              思考中...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="输入消息..."
            className="flex-1 bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="p-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
          >
            {isLoading ? (
              <Loader className="animate-spin" size={20} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatDialog;