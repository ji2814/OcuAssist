import { useState } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { PatientInfoProps } from '../types/PatientInfo';
import { useImageContext } from '../context/ImageContext';
import { useDiagnosis } from '../context/DiagnosisContext';
import DiagnosticReport from './DiagnosticReport';
import { BaseDirectory } from '@tauri-apps/plugin-fs';

const PatientInfo: React.FC<PatientInfoProps> = ({
  name,
  gender,
  age,
  examNumber,
  // onExport,
  onImport,
  onCreate
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [newPatient, setNewPatient] = useState({
    name: '',
    gender: '',
    age: 0,
    examNumber: ''
  });
  const { displayedImages } = useImageContext();

  const { diagnosis } = useDiagnosis();

  const resetForm = () => {
    setNewPatient({
      name: '',
      gender: '',
      age: 0,
      examNumber: ''
    });
    setSearchId('');
  };
  
  return (
    <div className="p-4 bg-black rounded-lg shadow-sm flex-grow">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center space-x-4">
            <span className="font-bold text-lg">{name}</span>
            <span className="text-gray-600">{gender}</span>
            <span className="text-gray-600">{age} age</span>
          </div>
      
          {/* Import/Create Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-6 rounded-lg w-96 text-white">
                <h2 className="text-xl font-bold mb-4 text-white">Patient Management</h2>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 text-gray-200">Search by ID</label>
                  <div className="flex">
                    <input
                      type="text"
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                      className="flex-grow p-2 border border-gray-600 bg-gray-700 text-gray-200 rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter patient ID"
                    />
                    <button
                      onClick={() => onImport?.(searchId)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600"
                    >
                      Search
                    </button>
                  </div>
                </div>
      
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2 text-gray-200">Or Create New Patient</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-200">Name</label>
                      <input
                        type="text"
                        value={newPatient.name}
                        onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                        className="w-full p-2 border border-gray-600 bg-gray-700 text-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex space-x-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium mb-1 text-gray-200">Gender</label>
                        <select
                          value={newPatient.gender}
                          onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                          className="w-full p-2 border border-gray-600 bg-gray-700 text-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                        >
                          <option value="" className="text-gray-400">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium mb-1 text-gray-200">Age</label>
                        <input
                          type="number"
                          value={newPatient.age}
                          onChange={(e) => setNewPatient({...newPatient, age: parseInt(e.target.value) || 0})}
                          className="w-full p-2 border border-gray-600 bg-gray-700 text-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-200">Exam Number</label>
                      <input
                        type="text"
                        value={newPatient.examNumber}
                        onChange={(e) => setNewPatient({...newPatient, examNumber: e.target.value})}
                        className="w-full p-2 border border-gray-600 bg-gray-700 text-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      onClick={() => {
                        setIsModalOpen(false);
                        resetForm();
                      }}
                      className="px-4 py-2 border border-gray-600 rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        onCreate?.(newPatient);
                        setIsModalOpen(false);
                        resetForm();
                      }}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Create
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="text-gray-600">
            id: {examNumber}
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-200"
          >
            Import
          </button>
          <button
            onClick={() => setIsPdfPreviewOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
          >
            Export
          </button>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {isPdfPreviewOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-11/12 h-5/6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Report Preview</h2>
              <div className="flex space-x-2">
                <button
                  onClick={async () => {
                    try {
                      const { save } = await import('@tauri-apps/plugin-dialog');
                      const { writeFile } = await import('@tauri-apps/plugin-fs');
                      const { pdf } = await import('@react-pdf/renderer');
                      
                      const blob = await pdf(
                        <DiagnosticReport 
                          patientInfo={{name, gender, age, examNumber}}
                          displayedImages={displayedImages}
                          diagnosis={diagnosis}
                          date={new Date().toLocaleDateString()}
                        />
                      ).toBlob();
                      
                      const filePath = await save({
                        title: 'Save Report',
                        defaultPath: `Report_${name}_${new Date().toISOString().slice(0,10)}.pdf`,
                        filters: [{
                          name: 'PDF Files',
                          extensions: ['pdf']
                        }]
                      });
                      
                      if (filePath) {
                        const arrayBuffer = await blob.arrayBuffer();
                        const content = new Uint8Array(arrayBuffer);
                        await writeFile( filePath, content, {baseDir: BaseDirectory.Home});
                        setIsPdfPreviewOpen(false);
                      }
                    } catch (error) {
                      console.error('Failed to export PDF:', error);
                    }
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Download Report
                </button>
                <button
                  onClick={() => setIsPdfPreviewOpen(false)}
                  className="px-4 py-2 border border-gray-600 rounded hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="flex-1">
              <PDFViewer width="100%" height="100%">
                <DiagnosticReport 
                  patientInfo={{name, gender, age, examNumber}}
                  displayedImages={displayedImages}
                  diagnosis={diagnosis}
                  date={new Date().toLocaleDateString()}
                />
              </PDFViewer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientInfo;
