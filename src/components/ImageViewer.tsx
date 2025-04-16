// components/ImageViewer.tsx
import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core';
import {
  ZoomIn, ZoomOut, RotateCw, Move, Eye, Brain, Square, Loader
} from 'lucide-react';
import { useImageContext } from '../context/ImageContext';
import { fileToBase64 } from '../util/path2base64';
import { defectPrompt } from '../util/prompts';

interface ImageViewerToolsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotate: () => void;
  onPanMode: () => void;
  isPanMode: boolean;
}

interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
}

interface ImageContentProps {
  zoom: number;
  rotation: number;
  imageUrl?: string;
  showCrosshair?: boolean;
  positionX: number;
  positionY: number;
  isPanMode: boolean;
  bboxes?: BBox[];
  onBboxesChange?: (bboxes: BBox[]) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseMove?: (e: React.MouseEvent) => void;
  onMouseUp?: () => void;
  onMouseLeave?: () => void;
}


// 图像查看器工具栏组件
interface ImageViewerToolsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotate: () => void;
  onPanMode: () => void;
  onAnalyze: () => void;
  isPanMode: boolean;
  isAnalyzing: boolean;
  bboxes: BBox[];
  onBboxesChange: (bboxes: BBox[]) => void;
}

const ImageViewerTools: React.FC<ImageViewerToolsProps> = ({
  onZoomIn,
  onZoomOut,
  onRotate,
  onPanMode,
  onAnalyze,
  isPanMode,
  isAnalyzing,
  bboxes,
  onBboxesChange
}) => (
  <>
    <div className="absolute top-2 left-2 bg-gray-800 rounded-full p-1 z-10">
      <div className="flex flex-col gap-1">
        <button onClick={onZoomIn} className="p-1 hover:bg-gray-700 rounded-full">
          <ZoomIn size={16} />
        </button>
        <button onClick={onZoomOut} className="p-1 hover:bg-gray-700 rounded-full">
          <ZoomOut size={16} />
        </button>
        <button onClick={onRotate} className="p-1 hover:bg-gray-700 rounded-full">
          <RotateCw size={16} />
        </button>
        <button
          onClick={onPanMode}
          className={`p-1 hover:bg-gray-700 rounded-full ${isPanMode ? 'bg-gray-700' : ''}`}
        >
          <Move size={16} />
        </button>
      </div>
    </div>
    <div className="absolute top-2 right-2 bg-gray-800 rounded-full p-1 z-10">
      <div className="flex gap-1">
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className={`p-1 rounded-full ${isAnalyzing ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          title={isAnalyzing ? "Analyzing..." : "AI Analyze"}
        >
          {isAnalyzing ? (
            <Loader className="animate-spin" size={16} />
          ) : (
            <Brain size={16} />
          )}
        </button>
        <button
          onClick={() => {
            if (onBboxesChange) {
              const newLabel = prompt('请输入标注区域名称:', '新区域');
              if (newLabel) {
                onBboxesChange([...bboxes, {
                  x: 0.4,
                  y: 0.4,
                  width: 0.2,
                  height: 0.2,
                  label: newLabel,
                  confidence: 1.0
                }]);
              }
            }
          }}
          className="p-1 hover:bg-gray-700 rounded-full"
          title="Draw BBox"
        >
          <Square size={16} />
        </button>
      </div>
    </div>
  </>
);

// 中心标线组件
const CenterCrossHair = () => (
  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
    <div className="w-12 h-12 border-2 border-blue-400 rounded-full opacity-50" />
    <div className="absolute top-1/2 left-1/2 w-6 h-0.5 bg-blue-400 -translate-x-1/2 -translate-y-1/2" />
    <div className="absolute top-1/2 left-1/2 w-0.5 h-6 bg-blue-400 -translate-x-1/2 -translate-y-1/2" />
  </div>
);

// 图像内容组件
const ImageContent: React.FC<ImageContentProps> = ({
  zoom,
  rotation,
  imageUrl,
  showCrosshair = true,
  positionX,
  positionY,
  isPanMode,
  bboxes,
  onBboxesChange,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave
}) => (
  <div
    className="bg-black rounded-lg h-full relative overflow-hidden"
    onMouseDown={onMouseDown}
    onMouseMove={onMouseMove}
    onMouseUp={onMouseUp}
    onMouseLeave={onMouseLeave}
    onDragOver={(e) => e.preventDefault()}
    onDrop={(e) => {
      if (!isPanMode && bboxes && onBboxesChange) {
        const index = parseInt(e.dataTransfer.getData('bboxIndex'));
        if (!isNaN(index)) {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          const y = (e.clientY - rect.top) / rect.height;
          const updated = [...bboxes];
          updated[index].x = Math.max(0, Math.min(1 - updated[index].width, x));
          updated[index].y = Math.max(0, Math.min(1 - updated[index].height, y));
          onBboxesChange(updated);
        } else {
          // 添加新bbox
          const rect = e.currentTarget.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          const y = (e.clientY - rect.top) / rect.height;
          const label = prompt('请输入标注区域名称:', '新区域');
          if (label) {
            onBboxesChange([...bboxes, {
              x: Math.max(0, x - 0.075),
              y: Math.max(0, y - 0.05),
              width: 0.15,
              height: 0.1,
              label,
              confidence: 0.5
            }]);
          }
        }
      }
    }}
    style={{ cursor: isPanMode ? 'move' : 'default' }}
  >
    <div
      className="h-full flex items-center justify-center"
      style={{
        transform: `scale(${zoom}) rotate(${rotation}deg) translate(${positionX}px, ${positionY}px)`,
        transition: isPanMode ? 'none' : 'transform 0.3s'
      }}
    >
      <div className="relative">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt="眼底图像"
              className="max-h-full max-w-full"
              style={{ objectFit: 'contain' }}
              draggable="false"
            />
            {bboxes?.map((bbox, index) => (
              <div
                key={index}
                className="absolute border-2 border-red-500 bg-red-500/20 cursor-move"
                style={{
                  left: `${bbox.x * 100}%`,
                  top: `${bbox.y * 100}%`,
                  width: `${bbox.width * 100}%`,
                  height: `${bbox.height * 100}%`
                }}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('bboxIndex', index.toString());
                }}
                onDoubleClick={() => {
                  const newLabel = prompt('请输入标注区域名称:', bbox.label);
                  if (newLabel && bboxes && onBboxesChange) {
                    const updated = [...bboxes];
                    updated[index].label = newLabel;
                    onBboxesChange(updated);
                  }
                }}
              >
                <div className="absolute -top-5 left-0 text-xs bg-red-500 text-white px-1 rounded">
                  {bbox.label} ({(bbox.confidence * 100).toFixed(1)}%)
                  <button
                    className="ml-1 text-xs bg-red-500 text-white px-1 rounded hover:bg-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (bboxes && onBboxesChange) {
                        onBboxesChange(bboxes.filter((_, i) => i !== index));
                      }
                    }}
                  >
                    X
                  </button>
                </div>
                <div
                  className="absolute bottom-0 right-0 w-2 h-2 bg-red-500 cursor-se-resize"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const container = e.currentTarget.closest('.bg-black')?.getBoundingClientRect();
                    if (!container) return;

                    const startX = e.clientX;
                    const startY = e.clientY;
                    const startWidth = bbox.width;
                    const startHeight = bbox.height;

                    const onMouseMove = (e: MouseEvent) => {
                      // 考虑缩放和旋转后的实际容器尺寸
                      const scale = zoom;
                      const dx = (e.clientX - startX) / (container.width * scale);
                      const dy = (e.clientY - startY) / (container.height * scale);

                      const updated = [...bboxes];
                      // 保持左上角固定，只改变右下角位置
                      updated[index].width = Math.max(0.01, Math.min(1 - bbox.x, startWidth + dx));
                      updated[index].height = Math.max(0.01, Math.min(1 - bbox.y, startHeight + dy));

                      if (!bboxes || !onBboxesChange) return;
                      onBboxesChange(updated);
                    };

                    const onMouseUp = () => {
                      document.removeEventListener('mousemove', onMouseMove);
                      document.removeEventListener('mouseup', onMouseUp);
                    };

                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                  }}
                />
              </div>
            ))}
          </>
        ) : (
          <div className="h-full w-full min-h-[100px] flex items-center justify-center text-gray-500">
            <Eye size={24} />
          </div>
        )}
        {showCrosshair && imageUrl && <CenterCrossHair />}
      </div>
    </div>
  </div>
);


// 单个图像窗口组件
interface SingleImageViewProps {
  title: string;
  imageUrl?: string;
  isActive: boolean;
  onClick: () => void;
}

const SingleImageView: React.FC<SingleImageViewProps> = ({ title, imageUrl, isActive, onClick }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isPanMode, setIsPanMode] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [bboxes, setBboxes] = useState<BBox[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { selectedImage } = useImageContext();

  // 切换平移模式
  const togglePanMode = () => {
    setIsPanMode(!isPanMode);
  };

  // 处理鼠标按下事件
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPanMode) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };

  // 处理鼠标移动事件
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanMode && isDragging) {
      // 计算鼠标移动差值
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      // 将屏幕坐标转换为旋转后的图像坐标
      const rad = -rotation * Math.PI / 180; // 转换为弧度并取反(因为CSS旋转是顺时针)
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      // 应用旋转矩阵变换并考虑缩放因子
      const transformedDeltaX = (deltaX * cos - deltaY * sin) / zoom;
      const transformedDeltaY = (deltaX * sin + deltaY * cos) / zoom;

      setPosition(prev => ({
        x: prev.x + transformedDeltaX,
        y: prev.y + transformedDeltaY
      }));

      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  // 处理鼠标释放事件
  const handleMouseUp = () => {
    setIsDragging(false);
  };


  const handleAnalyze = async () => {
    if (!selectedImage || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      // 调用AIAssistant的分析功能
      const messages = [{
        role: "user",
        content: [{
          type: "image_url",
          image_url: { url: selectedImage.base64 || await fileToBase64(selectedImage.path) }
        }, {
          type: "text",
          text: defectPrompt
        }]
      }]

      const response = await invoke<string>('call_llm_api', { messages });
      // 解析为json
      const data = JSON.parse(response)["data"]
      console.log('AI分析结果:', data);

      // 更新bboxes
      const bboxes: BBox[] = data.map((item: any) => ({
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
        label: item.label,
        confidence: item.confidence
      }));
      setBboxes(bboxes);
    } catch (error) {
      console.error('AI分析失败:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div
      className={`relative border-2 ${isActive ? 'border-blue-500' : 'border-gray-700'} rounded-lg overflow-hidden`}
      onClick={onClick}
    >
      <div className="absolute top-0 left-0 right-0 bg-gray-800 p-1 z-10">
        <h3 className="text-center text-sm">{title}</h3>
      </div>

      <div className="mt-6 h-[calc(100%-1.5rem)]">
        <ImageContent
          zoom={zoom}
          rotation={rotation}
          imageUrl={imageUrl}
          showCrosshair={isActive}
          positionX={position.x}
          positionY={position.y}
          isPanMode={isPanMode}
          bboxes={bboxes}
          onBboxesChange={setBboxes}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      {isActive && (
        <>
          <ImageViewerTools
            onZoomIn={() => setZoom(z => Math.min(z + 0.1, 2))}
            onZoomOut={() => setZoom(z => Math.max(z - 0.1, 0.5))}
            onRotate={() => setRotation(r => (r + 90) % 360)}
            onPanMode={togglePanMode}
            onAnalyze={handleAnalyze}
            isPanMode={isPanMode}
            isAnalyzing={isAnalyzing}
            bboxes={bboxes}
            onBboxesChange={setBboxes}
          />

        </>
      )}
    </div>
  );
};

// 主组件 - 使用 ImageContext
export const ImageViewer: React.FC = () => {
  // 使用 Context 来获取图片数据
  const { displayedImages, selectedImage, compareImage } = useImageContext();
  const [activeWindowIndex, setActiveWindowIndex] = useState(0);

  // 根据modal类型设置活动窗口
  const setActiveWindowByModal = (modal: string) => {
    switch (modal) {
      case 'CFP': setActiveWindowIndex(0); break;
      case 'FFA': setActiveWindowIndex(1); break;
      case 'OCT': setActiveWindowIndex(2); break;
      default: setActiveWindowIndex(3); // other
    }
  };

  // 当selectedImage变化时，自动切换到对应窗口
  useEffect(() => {
    if (selectedImage) {
      setActiveWindowByModal(selectedImage.modal);
    }
  }, [selectedImage]);

  // 获取各模态的图片，优先使用selectedImage
  const colorImage = displayedImages['CFP'];
  const redFreeImage = displayedImages['FFA'];
  const faImage = displayedImages['OCT'];

  const octAnImage = compareImage;

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <div className="w-full p-4">
        <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full">
          <SingleImageView
            title="CFP"
            imageUrl={colorImage?.url || colorImage?.base64}
            isActive={activeWindowIndex === 0}
            onClick={() => setActiveWindowIndex(0)}
          />
          <SingleImageView
            title="FFA"
            imageUrl={redFreeImage?.url || redFreeImage?.base64}
            isActive={activeWindowIndex === 1}
            onClick={() => setActiveWindowIndex(1)}
          />
          <SingleImageView
            title="OCT"
            imageUrl={faImage?.url || faImage?.base64}
            isActive={activeWindowIndex === 2}
            onClick={() => setActiveWindowIndex(2)}
          />
          <SingleImageView
            title="other"
            imageUrl={octAnImage?.url || octAnImage?.base64}
            isActive={activeWindowIndex === 3}
            onClick={() => setActiveWindowIndex(3)}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;

