// App.tsx

import { useState } from 'react'
import { ImageProvider } from './context/ImageContext'
import { DiagnosisProvider } from './context/DiagnosisContext'
import { ImageViewer } from './components/ImageViewer'
import PatientInfo from './components/PatientInfo'
import ImageSelector from './components/ImageSelector'
import AIAssistant from './components/AIAssistant'

import './App.css'

function App() {

  const [patientInfo, setPatientInfo] = useState({
    name: 'Demo',
    gender: 'Male',
    age: 30,
    examNumber: 'examNumber'
  })

  const handleCreate = (newPatient: any) => {
    setPatientInfo(newPatient)
  }

  return (
    <div className="app-container">
      <DiagnosisProvider>
        <ImageProvider>
          <div className="left-panel">
          <ImageViewer />
        </div>

        <div className="right-panel flex h-screen bg-gray-900 text-white">
          <PatientInfo {...patientInfo} onCreate={handleCreate} />
          <ImageSelector />
          <AIAssistant />
        </div>
      </ImageProvider>
    </DiagnosisProvider>
    </div>
  )
}

export default App
