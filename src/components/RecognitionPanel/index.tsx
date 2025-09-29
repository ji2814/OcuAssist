import clsx from 'clsx';
import { useState } from 'react';
import TripleView from './TripleView';
import AutomorphResultView from './AutomorphResultView';
import OCTSegResultView from './OCTSegResultView';
import { useFundImage } from '../../context/FundImage';
import { useRecognition } from '../../context/Recognition';

type Props = {
  className?: string;
};

const AIRecognitionPanel = (props: Props) => {
  const [currentView, setCurrentView] = useState<'triple' | 'analysis' | 'automorph' | 'octseg'>('triple');
  const { selectedImage } = useFundImage();
  const { performAutomorph, performOCTSeg } = useRecognition();

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
            currentView === 'automorph'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700',
            (!selectedImage || selectedImage.modalType !== 'CFP') && 'opacity-50 cursor-not-allowed'
          )}
          onClick={() => selectedImage && selectedImage.modalType === 'CFP' && setCurrentView('automorph')}
          title={!selectedImage ? '请先选择一张图像' : selectedImage.modalType !== 'CFP' ? 'Automorph分析仅支持CFP图像' : 'Automorph分析'}
        >
          Automorph分析
        </button>
        <button
          className={clsx(
            'px-4 py-2 font-medium text-sm transition-colors',
            currentView === 'octseg'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700',
            (!selectedImage || selectedImage.modalType !== 'OCT') && 'opacity-50 cursor-not-allowed'
          )}
          onClick={() => selectedImage && selectedImage.modalType === 'OCT' && setCurrentView('octseg')}
          title={!selectedImage ? '请先选择一张图像' : selectedImage.modalType !== 'OCT' ? 'OCTSeg分割仅支持OCT图像' : 'OCTSeg分割'}
        >
          OCTSeg分割
        </button>
      </div>

      {/* 视图内容 */}
      <div className="flex-1 overflow-hidden">
        {currentView === 'triple' ? (
          <TripleView className="h-full" />
        ) : currentView === 'analysis' ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">🤖</div>
              <p className="text-lg font-medium">AI分析功能开发中...</p>
              <p className="text-sm text-gray-400 mt-2">敬请期待</p>
            </div>
          </div>
        ) : currentView === 'automorph' ? (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  {selectedImage?.modalType} Automorph分析
                </h3>
                <button
                  onClick={async () => {
                    if (selectedImage && selectedImage.modalType === 'CFP') {
                      try {
                        // 使用正确的参数结构，传递图像URL作为base64字段
                        await performAutomorph({
                          image: selectedImage.url || '',
                          base64: selectedImage.url || ''
                        }, selectedImage.modalType);
                      } catch (error) {
                        console.error('Automorph分析失败:', error);
                      }
                    }
                  }}
                  disabled={!selectedImage || selectedImage.modalType !== 'CFP'}
                  className={clsx(
                    'px-4 py-2 rounded-lg transition-colors',
                    selectedImage && selectedImage.modalType === 'CFP'
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  )}
                >
                  执行分析
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <AutomorphResultView className="h-full" modalType={selectedImage?.modalType || 'OCT'} />
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  OCTSeg 分割分析
                </h3>
                <button
                  onClick={async () => {
                    if (selectedImage && selectedImage.modalType === 'OCT') {
                      try {
                        // 使用正确的参数结构，传递图像URL作为base64字段
                        await performOCTSeg({
                          image: selectedImage.url || '',
                          base64: selectedImage.url || ''
                        });
                      } catch (error) {
                        console.error('OCTSeg分割失败:', error);
                      }
                    }
                  }}
                  disabled={!selectedImage || selectedImage.modalType !== 'OCT'}
                  className={clsx(
                    'px-4 py-2 rounded-lg transition-colors',
                    selectedImage && selectedImage.modalType === 'OCT'
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  )}
                >
                  执行分割
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <OCTSegResultView className="h-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIRecognitionPanel;
