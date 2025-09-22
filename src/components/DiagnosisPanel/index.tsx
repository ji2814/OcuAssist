import { useState } from 'react';
import clsx from 'clsx';
import { FaRobot, FaComments } from 'react-icons/fa';
import AIDiagnosisPage from './AIDiagnosisPage';
import AIChatPage from './AIChatPage';

type Props = {
  className?: string;
};

const DiagnosisPanel = (props: Props) => {
  const [currentPage, setCurrentPage] = useState<'ai-diagnosis' | 'second-page'>('ai-diagnosis');

  return (
    <div 
      className={clsx(
        "bg-white rounded-lg shadow flex flex-col",
        props.className
      )}
    >
      {/* 页面切换标签 */}
      <div className="flex border-b border-gray-200">
        <button
          className={clsx(
            'px-4 py-3 font-medium text-sm transition-colors flex items-center gap-2',
            currentPage === 'ai-diagnosis'
              ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          )}
          onClick={() => setCurrentPage('ai-diagnosis')}
        >
          <FaRobot className="text-lg" />
          AI智能诊断
        </button>
        <button
          className={clsx(
            'px-4 py-3 font-medium text-sm transition-colors flex items-center gap-2',
            currentPage === 'second-page'
              ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          )}
          onClick={() => setCurrentPage('second-page')}
        >
          <FaComments className="text-lg" />
          AI聊天
        </button>
      </div>

      {/* 页面内容 */}
      <div className="flex-1 overflow-hidden">
        {currentPage === 'ai-diagnosis' ? (
          <AIDiagnosisPage className="h-full" />
        ) : (
          <AIChatPage className="h-full" />
        )}
      </div>
    </div>
  );
};

export default DiagnosisPanel;
