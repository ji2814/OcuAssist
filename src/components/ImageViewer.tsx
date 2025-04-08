// components/ImageViewer.tsx
import { useState, useEffect } from 'react'
import {
  ZoomIn, ZoomOut, RotateCw, Move,
  Square, Circle, Pen, Eraser, Eye
} from 'lucide-react';
import { useImageContext } from '../context/ImageContext';


interface ImageViewerToolsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotate: () => void;
  onPanMode: () => void;
  isPanMode: boolean;
}

interface MarkingToolsProps {
  activeTool: 'rectangle' | 'circle' | 'free' | 'eraser';
  onToolChange: (tool: 'rectangle' | 'circle' | 'free' | 'eraser') => void;
}

interface ImageContentProps {
  zoom: number;
  rotation: number;
  imageUrl?: string;
  showCrosshair?: boolean;
  positionX: number;
  positionY: number;
  isPanMode: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseMove?: (e: React.MouseEvent) => void;
  onMouseUp?: () => void;
  onMouseLeave?: () => void;
}


// 图像查看器工具栏组件
const ImageViewerTools: React.FC<ImageViewerToolsProps> = ({ onZoomIn, onZoomOut, onRotate, onPanMode, isPanMode }) => (
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
);

const MarkingTools: React.FC<MarkingToolsProps> = ({ activeTool, onToolChange }) => (
  <div className="absolute top-2 right-2 bg-gray-800 rounded-full p-1 z-10">
    <div className="flex flex-row gap-1"> 
      <button 
        onClick={() => onToolChange('rectangle')}
        className={`p-1 hover:bg-gray-700 rounded-full ${activeTool === 'rectangle' ? 'bg-gray-700' : ''}`}
      >
        <Square size={16} />
      </button>
      <button 
        onClick={() => onToolChange('circle')}
        className={`p-1 hover:bg-gray-700 rounded-full ${activeTool === 'circle' ? 'bg-gray-700' : ''}`}
      >
        <Circle size={16} />
      </button>
      <button 
        onClick={() => onToolChange('free')}
        className={`p-1 hover:bg-gray-700 rounded-full ${activeTool === 'free' ? 'bg-gray-700' : ''}`}
      >
        <Pen size={16} />
      </button>
      <button 
        onClick={() => onToolChange('eraser')}
        className={`p-1 hover:bg-gray-700 rounded-full ${activeTool === 'eraser' ? 'bg-gray-700' : ''}`}
      >
        <Eraser size={16} />
      </button>
    </div>
  </div>
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
          <img
            src={imageUrl}
            alt="眼底图像"
            className="max-h-full max-w-full"
            style={{ objectFit: 'contain' }}
            draggable="false"
          />
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
  const [activeTool, setActiveTool] = useState<'rectangle' | 'circle' | 'free' | 'eraser'>('rectangle');
  const [isPanMode, setIsPanMode] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
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
            isPanMode={isPanMode}
          />
          <MarkingTools activeTool={activeTool} onToolChange={setActiveTool} />
          
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
    switch(modal) {
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

