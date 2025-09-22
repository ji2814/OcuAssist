import { ChatMessage } from './AIChatType';
export type { ChatMessage };

// AI诊断结果接口
export interface DiagnosisResult {
  modalType: 'OCT' | 'FFA' | 'CFP';
  imageDescription: string;      // 图像描述
  lesionType: string[];          // 病灶类型
  diseaseType: string;       // 疾病类型
  diagnosticBasis: string[];   // 诊断依据
  confidence: number;
  timestamp: Date;
}

// AI诊断请求接口
export interface AIDiagnosisRequest {
  modalType: 'OCT' | 'FFA' | 'CFP';
  imageUrl: string;
  imageBase64?: string;
  patientID: string;
  metadata?: any;
}

// 诊断上下文类型
export interface DiagnosisContextType {
  diagnosisResults: {
    OCT: DiagnosisResult | null;
    FFA: DiagnosisResult | null;
    CFP: DiagnosisResult | null;
  };
  isLoading: {
    OCT: boolean;
    FFA: boolean;
    CFP: boolean;
  };
  errors: {
    OCT: string | null;
    FFA: string | null;
    CFP: string | null;
  };
  diagnoseImage: (request: AIDiagnosisRequest) => Promise<void>;
  clearDiagnosis: (modalType: 'OCT' | 'FFA' | 'CFP') => void;
  clearAllDiagnoses: () => void;
}