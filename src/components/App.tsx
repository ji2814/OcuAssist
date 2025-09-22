import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import MenuBar from "./MenuBar";
import ThumbnailPanel from "./ThumbnailPanel";
import AIRecognitionPanel from "./RecognitionPanel";
import DiagnosisPanel from "./DiagnosisPanel";
import PatientInfoForm from "./MenuBar/Dialogs/PatientInfoForm";
import { PatientInfoProvider } from "../context/PatientInfo";
import { FundImageProvider } from "../context/FundImage";
import { DiagnosisProvider } from "../context/Diagnosis";
import { AIChatProvider } from "../context/AIChat";
import { DoctorSettingsProvider } from "../context/DoctorInfo";
import { AppSettingsProvider } from "../context/AppSettings";

function MainApp() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* 顶部菜单栏 */}
      <MenuBar />

      {/* 主体内容 */}
      <main className="flex-1 flex bg-gray-100 gap-1 p-2 overflow-hidden">
        <ThumbnailPanel className="flex-1 min-w-0" />
        <AIRecognitionPanel className="flex-5 min-w-0" />
        <DiagnosisPanel className="flex-3 min-w-0" />
      </main>
    </div>
  );
}

function App() {
  return (
    <AppSettingsProvider>
      <PatientInfoProvider>
        <DoctorSettingsProvider>
          <FundImageProvider>
            <DiagnosisProvider>
              <AIChatProvider>
                <Router>
                  <Routes>
                    <Route path="/" element={<MainApp />} />
                    <Route path="/new-patient" element={<PatientInfoForm />} />
                  </Routes>
                </Router>
              </AIChatProvider>
            </DiagnosisProvider>
          </FundImageProvider>
        </DoctorSettingsProvider>
      </PatientInfoProvider>
    </AppSettingsProvider>
  );
}

export default App;
