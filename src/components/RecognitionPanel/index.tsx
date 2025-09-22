import clsx from 'clsx';
import { useState } from 'react';
import TripleView from './TripleView';

type Props = {
  className?: string;
};

const AIRecognitionPanel = (props: Props) => {
  const [currentView, setCurrentView] = useState<'triple' | 'analysis'>('triple');

  return (
    <div
      className={clsx(
        'bg-white rounded-lg shadow flex flex-col',
        props.className
      )}
    >
      {/* 视图切换标签 */}
      <div className="flex border-b border-gray-200">
        <button
          className={clsx(
            'px-4 py-2 font-medium text-sm transition-colors',
            currentView === 'triple'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          )}
          onClick={() => setCurrentView('triple')}
        >
          三宫图视图
        </button>
        <button
          className={clsx(
            'px-4 py-2 font-medium text-sm transition-colors',
            currentView === 'analysis'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          )}
          onClick={() => setCurrentView('analysis')}
        >
          AI分析视图
        </button>
      </div>

      {/* 视图内容 */}
      <div className="flex-1 overflow-hidden">
        {currentView === 'triple' ? (
          <TripleView className="h-full" />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">🤖</div>
              <p className="text-lg font-medium">AI分析功能开发中...</p>
              <p className="text-sm text-gray-400 mt-2">敬请期待</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIRecognitionPanel;
