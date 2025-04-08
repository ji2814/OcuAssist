import { createContext, useContext, useState, ReactNode } from 'react';
import { Diagnosis, DiagnosisItem } from '../types/Diagnosis';

type DiagnosisContextType = {
  diagnosis: Diagnosis;
  addDiagnosisItem: (item: DiagnosisItem) => void;
  removeDiagnosisItem: (index: number) => void;
  updateDiagnosisItem: (index: number, item: DiagnosisItem) => void;
  setNotes: (notes: string) => void;
};

const DiagnosisContext = createContext<DiagnosisContextType | undefined>(undefined);

export function DiagnosisProvider({ children }: { children: ReactNode }) {
  const [diagnosis, setDiagnosis] = useState<Diagnosis>({
    Diagnosis: [],
    notes: ''
  });

  const addDiagnosisItem = (item: DiagnosisItem) => {
    setDiagnosis(prev => ({
      ...prev,
      Diagnosis: [...prev.Diagnosis, item]
    }));
  };

  const removeDiagnosisItem = (index: number) => {
    setDiagnosis(prev => ({
      ...prev,
      Diagnosis: prev.Diagnosis.filter((_, i) => i !== index)
    }));
  };

  const updateDiagnosisItem = (index: number, item: DiagnosisItem) => {
    setDiagnosis(prev => {
      const newDiagnosis = [...prev.Diagnosis];
      newDiagnosis[index] = item;
      return {
        ...prev,
        Diagnosis: newDiagnosis
      };
    });
  };

  const setNotes = (notes: string) => {
    setDiagnosis(prev => ({
      ...prev,
      notes
    }));
  };

  return (
    <DiagnosisContext.Provider 
      value={{ diagnosis, addDiagnosisItem, removeDiagnosisItem, updateDiagnosisItem, setNotes }}
    >
      {children}
    </DiagnosisContext.Provider>
  );
}

export function useDiagnosis() {
  const context = useContext(DiagnosisContext);
  if (context === undefined) {
    throw new Error('useDiagnosis must be used within a DiagnosisProvider');
  }
  return context;
}