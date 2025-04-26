import { invoke } from '@tauri-apps/api/core';
import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { DiagnosisItem } from '../types/Diagnosis';
import { useImageContext } from '../context/ImageContext';
import { useDiagnosis } from '../context/DiagnosisContext';

import { fileToBase64 } from '../util/path2base64';
import { analysisPrompt } from '../util/prompts';


const EditableDiagnosisCard: React.FC<{
  item: DiagnosisItem;
  onUpdate: (updated: DiagnosisItem) => void;
  onDelete: () => void;
}> = ({ item, onUpdate, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [edited, setEdited] = useState(item);

  return (
    <div className="p-4 border border-gray-700 rounded-lg mb-4">
      <div className="flex justify-between items-center mb-2">
        {editing ? (
          <input
            value={edited.condition}
            onChange={(e) => setEdited({ ...edited, condition: e.target.value })}
            className="font-semibold text-lg bg-gray-700 px-2 rounded"
          />
        ) : (
          <h3 className="font-semibold text-lg">{edited.condition}</h3>
        )}
        <div className="flex items-center gap-2">
          {editing ? (
            <input
              type="number"
              value={(edited.confidence || 0) * 100}
              onChange={(e) => setEdited({ ...edited, confidence: parseFloat(e.target.value) / 100 })}
              className="text-sm px-2 py-1 bg-gray-700 text-blue-400 rounded w-16"
              min="0"
              max="100"
              step="0.1"
            />
          ) : (
            <span className="text-sm px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
              {((edited.confidence || 0) * 100).toFixed(1)}%
            </span>
          )}
          <button
            onClick={() => {
              if (editing) {
                onUpdate(edited);
              }
              setEditing(!editing);
            }}
            className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded"
          >
            {editing ? 'save' : 'edit'}
          </button>
          <button
            onClick={onDelete}
            className="text-xs px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded"
          >
            delete
          </button>
        </div>
      </div>
      {editing ? (
        <textarea
          value={edited.description}
          onChange={(e) => setEdited({ ...edited, description: e.target.value })}
          className="w-full text-gray-400 text-sm bg-gray-700 px-2 py-1 rounded"
          rows={3}
        />
      ) : (
        <p className="text-gray-400 text-sm">{edited.description}</p>
      )}
    </div>
  );
};

const AIAssistant: React.FC = () => {
  const { selectedImage } = useImageContext();
  const { diagnosis, addDiagnosisItem, removeDiagnosisItem, updateDiagnosisItem } = useDiagnosis();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 分析图片
  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    try {
      if (!selectedImage?.url) {
        throw new Error('请先选择有效的图片');
      }

      if (selectedImage.base64 === "") {
        selectedImage.base64 = await fileToBase64(selectedImage.path);
      }
      const messages = [{
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: selectedImage.base64
            }
          },
          {
            type: "text",
            text: analysisPrompt
          }
        ]
      }];

      const result = await invoke<string>('call_llm_api', { messages });

      // 解析为json
      const data = JSON.parse(result)["data"]

      console.log("LLM respond data:", data);

      const diagnoses: DiagnosisItem[] = data.map((item: any) => ({
        condition: item.condition,
        description: item.description,
        solution: item.solution,
        confidence: item.confidence
      }));

      diagnoses.forEach(item => addDiagnosisItem(item));
    } catch (error) {
      console.error('分析失败:', error);
      addDiagnosisItem({
        condition: "分析错误",
        description: "无法获取分析结果，请稍后重试",
        solution: "请检查网络连接或稍后重试",
        confidence: 0
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // 当选择新图片时重置状态
  useEffect(() => {
    if (selectedImage) {
      diagnosis.Diagnosis.forEach((_, index) => removeDiagnosisItem(index));
    }
  }, [selectedImage]);

  const handleAddDiagnosis = () => {
    addDiagnosisItem({
      condition: "",
      description: "",
      solution: "",
      confidence: 1.0
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 flex-grow flex flex-col">
      {diagnosis.Diagnosis.length > 0 ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {diagnosis.Diagnosis.map((item, index) => (
            <EditableDiagnosisCard
              key={index}
              item={item}
              onUpdate={(updated) => {
                updateDiagnosisItem(index, updated);
              }}
              onDelete={() => {
                removeDiagnosisItem(index);
              }}
            />
          ))}
          <button
            onClick={handleAddDiagnosis}
            className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg"
          >
            + add new diagnosis
          </button>
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center">
          <button
            onClick={analyzeImage}
            disabled={!selectedImage || isAnalyzing}
            className="py-3 px-6 bg-blue-500 text-white rounded-lg text-lg disabled:opacity-50 hover:bg-blue-600 transition-colors"
          >
            {isAnalyzing ? (
              <div className="flex items-center gap-2">
                <Loader className="animate-spin" size={20} />
                Analyzing...
              </div>
            ) : 'Analyze'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;