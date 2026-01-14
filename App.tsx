import React, { useState } from 'react';
import FileUploader from './components/FileUploader';
import ResultView from './components/ResultView';
import { AnalysisResult, AnalysisStatus } from './types';
import { analyzeLogData } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleFile = async (content: string, name: string, type: 'pdf' | 'las') => {
    setStatus(AnalysisStatus.ANALYZING);
    try {
      const data = await analyzeLogData(content, type);
      setResult(data);
      setStatus(AnalysisStatus.COMPLETED);
    } catch (e) { 
      console.error(e);
      setStatus(AnalysisStatus.ERROR); 
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 selection:bg-amber-500/30">
      <header className="p-8 border-b border-gray-900/50 bg-gray-950/80 backdrop-blur-xl sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center text-black font-black text-xl shadow-lg shadow-amber-500/20">
              C
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white">CementLog AI</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Well Cementing Section • Iraq</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-8">
        {status === AnalysisStatus.IDLE && (
          <div className="max-w-4xl mx-auto py-16 space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-5xl font-black text-white leading-tight">Intelligent Bond Log <br/>Analysis System</h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">Upload CBL/VDL logs in PDF or LAS format for automated Zonal Isolation assessment and bilingual reporting.</p>
            </div>
            <FileUploader onFileSelect={handleFile} status={status} />
          </div>
        )}
        
        {status === AnalysisStatus.ANALYZING && (
          <div className="h-[60vh] flex flex-col items-center justify-center space-y-8">
            <div className="relative">
              <div className="w-24 h-24 border-8 border-gray-800 rounded-full"></div>
              <div className="w-24 h-24 border-8 border-amber-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-white animate-pulse">Analyzing Geophysical Data</p>
              <p className="text-gray-500 text-sm mt-2">Processing CBL curves and VDL waveforms in 50m intervals...</p>
            </div>
          </div>
        )}

        {status === AnalysisStatus.COMPLETED && result && (
          <div className="space-y-8">
            <button onClick={() => { setResult(null); setStatus(AnalysisStatus.IDLE); }} className="group flex items-center text-xs text-gray-500 hover:text-white transition-all font-bold no-print">
              <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> START NEW ANALYSIS
            </button>
            <ResultView result={result} />
          </div>
        )}

        {status === AnalysisStatus.ERROR && (
          <div className="bg-red-500/5 border border-red-500/10 p-12 rounded-[40px] text-center max-w-lg mx-auto mt-20">
            <div className="text-4xl mb-6">⚠️</div>
            <h3 className="text-red-500 font-black text-2xl mb-4">Analysis Interrupted</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">The AI could not process the file. Please ensure it's a valid LAS or high-quality CBL PDF log.</p>
            <button onClick={() => setStatus(AnalysisStatus.IDLE)} className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl transition-all">Try Again</button>
          </div>
        )}
      </main>
      
      <footer className="p-12 text-center text-gray-700 text-[10px] font-bold uppercase tracking-[0.3em] border-t border-gray-900/50 mt-20 no-print">
        Professional Engineering Solution for Oil & Gas Sector
      </footer>
    </div>
  );
};
export default App;