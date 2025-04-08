import React, { useState } from 'react';
import { Calendar, Plus, X, Tag } from 'lucide-react';

import { convertFileSrc } from '@tauri-apps/api/core';
// import { readFile } from '@tauri-apps/plugin-fs';
import { message, open } from '@tauri-apps/plugin-dialog';

import { FundusImage } from '../types/FundusImage';
import { useImageContext } from '../context/ImageContext';

// 定义模态标签样式和颜色
const modalStyles = {
  'CFP': { bg: 'bg-blue-600', text: 'text-white', label: 'CFP' },
  'FFA': { bg: 'bg-green-600', text: 'text-white', label: 'FFA' },
  'OCT': { bg: 'bg-amber-600', text: 'text-white', label: 'OCT' }
};

// 图像预览卡片组件
const ImagePreviewCard: React.FC<{
  image?: FundusImage;
  isSelected?: boolean;
  isUpload?: boolean;
  onClick: () => void;
  onDoubleClick?: () => void;
  onDelete?: () => void;
}> = ({ image, isSelected, isUpload, onClick, onDoubleClick, onDelete }) => {
  // 上传卡片
  if (isUpload) {
    return (
      <div
        onClick={onClick}
        className="p-4 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-green-500 flex flex-col items-center justify-center h-[160px]"
      >
        <Plus size={24} className="text-gray-400 mb-2" />
        <span className="text-sm text-gray-400">upload</span>
      </div>
    );
  }

  // 获取模态样式，默认为CFP
  const modal = image?.modal || 'CFP';
  const modalStyle = modalStyles[modal as keyof typeof modalStyles] || modalStyles.CFP;

  // 防止冒泡，使删除按钮点击不会触发卡片点击
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete && onDelete();
  };

  return (
    <div
      className={`p-2 border-2 rounded-lg cursor-pointer transition-colors relative ${isSelected ? 'border-green-500' : 'border-gray-600'}`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {/* 模态标签，左上角 */}
      <div className={`absolute top-0 left-0 m-2 px-2 py-0.5 ${modalStyle.bg} ${modalStyle.text} text-xs rounded-md z-10 flex items-center`}>
        <Tag size={10} className="mr-1" />
        {modalStyle.label}
      </div>

      {/* 删除按钮，右上角 */}
      <button 
        className="absolute top-0 right-0 m-1 p-1 bg-red-500 hover:bg-red-600 rounded-full text-white z-10"
        onClick={handleDeleteClick}
      >
        <X size={14} />
      </button>

      <div className="bg-gray-700 h-24 rounded-lg mb-2">
        <img
          src={image?.url}
          alt="眼底图像"
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-300">
        <Calendar size={14} />
        <span>{image?.date?.toLocaleString()}</span>
      </div>
      <div className="flex justify-between text-sm text-gray-400 mt-1">
        <span>{image?.eye === 'left' ? 'left' : 'right'}</span>
      </div>
    </div>
  );
};

const TimeFilter: React.FC<{
  selected: string;
  onChange: (value: string) => void;
}> = ({ selected, onChange }) => {
  const options = [
    { label: 'all', value: 'all' },
    { label: 'today', value: 'today' },
  ];

  return (
    <div className="flex gap-4">
      {options.map(option => (
        <label
          key={option.value}
          className="flex items-center gap-2 cursor-pointer"
        >
          <input
            type="radio"
            name="timeFilter"
            value={option.value}
            checked={selected === option.value}
            onChange={(e) => onChange(e.target.value)}
            className="form-radio text-green-500"
          />
          <span className="text-gray-300">{option.label}</span>
        </label>
      ))}
    </div>
  );
};

const EyeFilter: React.FC<{
  selected: string[];
  onChange: (values: string[]) => void;
}> = ({ selected, onChange }) => {
  const options = [
    { label: 'left', value: 'left' },
    { label: 'right', value: 'right' },
  ];

  const handleChange = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  return (
    <div className="flex gap-4">
      {options.map(option => (
        <label
          key={option.value}
          className="flex items-center gap-2 cursor-pointer"
        >
          <input
            type="checkbox"
            value={option.value}
            checked={selected.includes(option.value)}
            onChange={() => handleChange(option.value)}
            className="form-checkbox text-green-500"
          />
          <span className="text-gray-300">{option.label}</span>
        </label>
      ))}
    </div>
  );
};

const ModalFilter: React.FC<{
  selected: string;
  onChange: (value: string) => void;
}> = ({ selected, onChange }) => {
  const options = [
    { label: 'all', value: 'all' },
    { label: 'CFP', value: 'CFP' },
    { label: 'FFA', value: 'FFA' },
    { label: 'OCT', value: 'OCT' }
  ];

  return (
    <div className="flex gap-4 flex-wrap">
      {options.map(option => (
        <label
          key={option.value}
          className="flex items-center gap-2 cursor-pointer"
        >
          <input
            type="radio"
            name="modalFilter"
            value={option.value}
            checked={selected === option.value}
            onChange={(e) => onChange(e.target.value)}
            className="form-radio text-green-500"
          />
          <span className="text-gray-300">{option.label}</span>
        </label>
      ))}
    </div>
  );
};

const ImageSelector: React.FC = () => {
  const { imageList, addImage, selectImage, removeImage, selectedImage, setCompareImage } = useImageContext();
  
  const [timeFilter, setTimeFilter] = useState('all');
  const [eyeFilter, setEyeFilter] = useState<string[]>(['left', 'right']);
  const [modalFilter, setModalFilter] = useState('all'); // 模态筛选状态

  // 处理图片点击事件
  const handleImageSelect = (image: FundusImage) => {
    selectImage(image); // Use context's selectImage
  };

  // 处理图片双击事件
  const handleImageDoubleClick = (image: FundusImage) => {
    selectImage(image); // 选中图片
    setCompareImage(image); // 设置为对比图片
  };

  const [showModalDialog, setShowModalDialog] = useState(false);
  const [selectedEye, setSelectedEye] = useState<'left' | 'right'>('left');
  const [selectedModal, setSelectedModal] = useState<'CFP' | 'FFA' | 'OCT'>('CFP');
  const [tempImagePath, setTempImagePath] = useState<string | null>(null);

  const handleUpload = async () => {
    try {
      const selectedPath = await open({
        multiple: false,
        directory: false,
        filters: [{
          name: 'Image',
          extensions: ['png', 'jpg', 'jpeg']
        }]
      });

      if (!selectedPath || typeof selectedPath !== 'string') return;

      // 保存图片路径并显示对话框
      setTempImagePath(selectedPath);
      setShowModalDialog(true);
    } catch (error) {
      console.error('Error selecting image:', error);
      await message('选择图片失败', { title: '错误' });
    }
  };

  const handleConfirmSelection = async () => {
    if (!tempImagePath) return;

    try {
      // 生成唯一 ID
      const newId = Date.now().toString();
      // 转换图片为 base64

      // 创建新的图片对象
      const newImage: FundusImage = {
        id: newId,
        path: tempImagePath,
        url: convertFileSrc(tempImagePath),
        fileName: tempImagePath.split('/').pop() || '',
        patientId: '123456',
        base64: '',
        date: new Date(),
        eye: selectedEye,
        modal: selectedModal
      };

      // 使用 context 中的 addImage 添加新图片并获取返回的对象
      const addedImage = addImage(newImage);
      console.log('New image added:', addedImage);
      // 自动选择新上传的图片
      handleImageSelect(addedImage);
      
      // 重置状态
      setShowModalDialog(false);
      setTempImagePath(null);
    } catch (error) {
      console.error('Error uploading image:', error);
      await message('上传图片失败', { title: '错误' });
    }
  };

  const ModalDialog = () => {
    if (!showModalDialog) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-lg w-96">
          <h3 className="text-white text-lg font-medium mb-4">Select Eye and Modal</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-white block mb-2">Eye:</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="eye"
                    value="left"
                    checked={selectedEye === 'left'}
                    onChange={() => setSelectedEye('left')}
                    className="form-radio text-green-500"
                  />
                  <span className="text-gray-300">Left</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="eye"
                    value="right"
                    checked={selectedEye === 'right'}
                    onChange={() => setSelectedEye('right')}
                    className="form-radio text-green-500"
                  />
                  <span className="text-gray-300">Right</span>
                </label>
              </div>
            </div>

            <div>
              <label className="text-white block mb-2">Modal:</label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="modal"
                    value="CFP"
                    checked={selectedModal === 'CFP'}
                    onChange={() => setSelectedModal('CFP')}
                    className="form-radio text-green-500"
                  />
                  <span className="text-gray-300">CFP</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="modal"
                    value="FFA"
                    checked={selectedModal === 'FFA'}
                    onChange={() => setSelectedModal('FFA')}
                    className="form-radio text-green-500"
                  />
                  <span className="text-gray-300">FFA</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="modal"
                    value="OCT"
                    checked={selectedModal === 'OCT'}
                    onChange={() => setSelectedModal('OCT')}
                    className="form-radio text-green-500"
                  />
                  <span className="text-gray-300">OCT</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={() => setShowModalDialog(false)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSelection}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 删除图片
  const handleDeleteImage = async (image: FundusImage) => {
    try {
      removeImage(image.id);
      console.log('删除图片成功:', image);
    } catch (error) {
      console.error('删除图片失败:', error);
    }
  };

  // 根据筛选条件过滤图片
  const filteredImages = imageList.filter(image => {
    // 眼部过滤
    const matchesEye = eyeFilter.includes(image.eye);
    if (!matchesEye) return false;
    
    // 时间过滤
    if (timeFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      const imageDate = image.date?.toISOString().split('T')[0];
      if (imageDate !== today) return false;
    }
    
    // 模态过滤
    if (modalFilter !== 'all' && image.modal !== modalFilter) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="bg-gray-800 p-6 rounded-lg flex-grow flex flex-col relative">
      <ModalDialog />
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <h3 className="text-white font-medium">date:</h3>
          <TimeFilter selected={timeFilter} onChange={setTimeFilter} />
        </div>
        
        <div className="flex justify-between items-center">
          <h3 className="text-white font-medium">eye:</h3>
          <EyeFilter selected={eyeFilter} onChange={setEyeFilter} />
        </div>
        
        <div className="flex justify-between items-center">
          <h3 className="text-white font-medium">modal:</h3>
          <ModalFilter selected={modalFilter} onChange={setModalFilter} />
        </div>
      </div>

      <div className="flex flex-col gap-4 flex-grow overflow-y-auto pr-2">
        <div className="grid grid-cols-4 gap-4">
          {filteredImages.map(image => (
            <ImagePreviewCard
              key={image.id}
              image={image}
              isSelected={selectedImage?.id === image.id}
              onClick={() => handleImageSelect(image)}
              onDoubleClick={() => handleImageDoubleClick(image)}
              onDelete={() => handleDeleteImage(image)}
            />
          ))}
          <ImagePreviewCard
            isUpload
            onClick={handleUpload}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageSelector;
