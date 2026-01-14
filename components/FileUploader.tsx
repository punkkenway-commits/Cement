import React, { useState, useRef } from 'react';
import { AnalysisStatus } from '../types';

interface FileUploaderProps {
  onFileSelect: (content: string, fileName: string, fileType: 'pdf' | 'las') => void;
  status: AnalysisStatus;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, status }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    const isPDF = file.name.toLowerCase().endsWith('.pdf');
    const isLAS = file.name.toLowerCase().endsWith('.las');
    if (!isPDF && !isLAS) return alert("Only PDF or LAS files are supported.");

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onFileSelect(isPDF ? result.split(',')[1] : result, file.name, isPDF ? 'pdf' : 'las');
    };
    if (isPDF) reader.readAsDataURL(file); else reader.readAsText(file);
  };

  return (
    <div 
      className={`p-10 border-2 border-dashed rounded-3xl text-center transition-all ${dragActive ? 'border-amber-500 bg-amber-500/10' : 'border-gray-800 bg-gray-900/50'}`}
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => { e.preventDefault(); setDragActive(false); e.dataTransfer.files?.[0] && processFile(e.dataTransfer.files[0]); }}
    >
      <input ref={inputRef} type="file" className="hidden" accept=".pdf,.las" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />
      <div className="space-y-6">
        <div className="flex justify-center gap-4">
          <div className="bg-red-500/20 p-4 rounded-xl text-red-500 font-bold">PDF</div>
          <div className="bg-blue-500/20 p-4 rounded-xl text-blue-500 font-bold">LAS</div>
        </div>
        <h3 className="text-2xl font-bold text-white">Drop Well Log Here</h3>
        <p className="text-gray-400">Supported: CBL/VDL PDF or LAS Data files</p>
        <button onClick={() => inputRef.current?.click()} className="px-10 py-4 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-2xl shadow-2xl transition-all active:scale-95">
          Select Log File
        </button>
      </div>
    </div>
  );
};
export default FileUploader;