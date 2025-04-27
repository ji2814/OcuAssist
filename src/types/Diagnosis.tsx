export interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
}

export interface DiagnosisItem {
  condition: string;
  description: string;
  solution: string;
  severity?: 'mild' | 'moderate' | 'severe';
  confidence?: number;
  bboxes?: BBox[];
}

export interface Diagnosis {
  Diagnosis: DiagnosisItem[];
  notes?: string;
}