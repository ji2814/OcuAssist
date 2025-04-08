export type DiagnosisItem ={
  condition: string;
  description: string;
  solution: string;
  severity?: 'mild' | 'moderate' | 'severe';
  confidence?: number;
}

export type Diagnosis ={
  Diagnosis: DiagnosisItem[];
  notes?: string;
}