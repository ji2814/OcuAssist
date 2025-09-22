export interface RecognitionResult {
  modalType: 'OCT' | 'FFA' | 'CFP';
  imageDescription: string;      // 图像描述
  lesionType: string;          // 病灶类型
  diseaseType: string;       // 疾病类型
  diagnosticBasis: string[];   // 诊断依据
  confidence: number;
  timestamp: Date;
}