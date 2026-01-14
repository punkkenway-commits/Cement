import React, { useState } from 'react';
import { AnalysisResult } from '../types';

// Let TypeScript know about the global variables from the script tags in index.html
declare global {
  interface Window {
    jspdf: any;
  }
}

interface ResultViewProps { result: AnalysisResult; }

const ResultView: React.FC<ResultViewProps> = ({ result }) => {
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  
  const downloadPDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const isArabic = lang === 'ar';

    // NOTE: Built-in jsPDF fonts do not support Arabic characters well.
    // For a production application, a font like Amiri would need to be embedded.
    // The report structure and data are correctly set for bilingual output.

    const title = 'CementLog AI - Technical Analysis Report';
    const logType = `Log Type: ${result.logTypeDetected}`;
    const generated = `Generated: ${new Date().toLocaleString()}`;
    const units = `Units: ${result.depthUnit}`;
    const summaryTitle = isArabic ? 'الخلاصة التنفيذية' : 'Executive Summary';
    const summaryBody = isArabic ? result.summaryAr : result.summaryEn;
    const recommendationsTitle = isArabic ? 'التوصيات' : 'Recommendations';
    const recommendationsBody = isArabic ? result.recommendationsAr : result.recommendationsEn;

    // --- Header ---
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(logType, 14, 32);
    doc.text(generated, 14, 38);
    doc.text(units, 14, 44);

    // --- Summary ---
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(summaryTitle, 14, 60);
    doc.setFontSize(10);
    const summaryLines = doc.splitTextToSize(summaryBody, 180); // 180mm width
    doc.text(summaryLines, 14, 68);
    const summaryHeight = summaryLines.length * 5;

    // --- Table ---
    const tableHeaders = isArabic
      ? ['التشخيص', 'الوصف الفني', 'الجودة', 'العمق'] // Reversed for RTL
      : ['Depth', 'Quality', 'Technical Description', 'Diagnosis'];

    const tableBody = result.zones.map(zone => isArabic
      ? [zone.diagnosisAr, zone.technicalDescriptionAr, zone.quality, `${zone.depthFrom} - ${zone.depthTo}`]
      : [`${zone.depthFrom} - ${zone.depthTo}`, zone.quality, zone.technicalDescriptionEn, zone.diagnosisEn]
    );

    (doc as any).autoTable({
        startY: 68 + summaryHeight + 5,
        head: [tableHeaders],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [202, 138, 4] }, // Amber-500 color
    });
    
    // --- Recommendations ---
    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(14);
    doc.text(recommendationsTitle, 14, finalY + 15);
    doc.setFontSize(10);
    let recommendationY = finalY + 23;
    recommendationsBody.forEach(rec => {
        const lines = doc.splitTextToSize(`• ${rec}`, 180);
        doc.text(lines, 14, recommendationY);
        recommendationY += (lines.length * 5) + 2; // Move Y for next item
    });

    // --- Save ---
    doc.save(`CementLog_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in bg-gray-900 border border-gray-700 rounded-2xl">
      {/* Report Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-white">CementLog AI - Technical Analysis Report</h2>
          <div className="flex items-center gap-4 no-print">
            <button
              onClick={downloadPDF}
              className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl text-xs border border-gray-600 font-bold transition-all active:scale-95"
            >
              Download Report
            </button>
            <div className="flex bg-gray-950 rounded-xl p-1 border border-gray-800">
              <button onClick={() => setLang('en')} className={`px-5 py-1.5 rounded-lg text-xs font-black transition-all ${lang === 'en' ? 'bg-amber-500 text-black' : 'text-gray-500'}`}>ENGLISH</button>
              <button onClick={() => setLang('ar')} className={`px-5 py-1.5 rounded-lg text-xs font-black font-arabic transition-all ${lang === 'ar' ? 'bg-amber-500 text-black' : 'text-gray-500'}`}>عربي</button>
            </div>
          </div>
        </div>
        <div className="flex gap-x-6 gap-y-2 mt-3 text-sm text-gray-400 flex-wrap">
            <p><strong>Log Type:</strong> {result.logTypeDetected}</p>
            <p><strong>Generated:</strong> {new Date().toLocaleString()}</p>
            <p><strong>Units:</strong> {result.depthUnit}</p>
        </div>
      </div>

      {/* Executive Summary */}
      <section className="px-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <h3 className={`text-2xl font-bold text-white mb-3 ${lang === 'ar' ? 'font-arabic' : ''}`}>
          {lang === 'en' ? 'Executive Summary' : 'الخلاصة التنفيذية'}
        </h3>
        <p className={`text-gray-300 leading-relaxed ${lang === 'ar' ? 'font-arabic' : ''}`}>
          {lang === 'en' ? result.summaryEn : result.summaryAr}
        </p>
      </section>

      {/* Analysis Table */}
      <section className="px-6">
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="w-full text-sm text-left" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <thead className="bg-amber-600 text-black text-xs uppercase">
              <tr>
                <th className="p-3 font-bold">{lang==='en'?'Depth':'العمق'}</th>
                <th className="p-3 font-bold">{lang==='en'?'Quality':'الجودة'}</th>
                <th className="p-3 font-bold w-5/12">{lang==='en'?'Technical Description':'الوصف الفني'}</th>
                <th className="p-3 font-bold">{lang==='en'?'Diagnosis':' التشخيص'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {result.zones.map((zone, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700/50'}>
                  <td className="p-3 font-mono text-white whitespace-nowrap">{zone.depthFrom} - {zone.depthTo}</td>
                  <td className="p-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        zone.quality === 'Excellent' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        zone.quality === 'Good' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        zone.quality === 'Moderate' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>{zone.quality}</span>
                  </td>
                  <td className={`p-3 text-gray-300 leading-snug ${lang === 'ar' ? 'font-arabic' : ''}`}>
                    {lang === 'en' ? zone.technicalDescriptionEn : zone.technicalDescriptionAr}
                  </td>
                   <td className={`p-3 text-gray-200 ${lang === 'ar' ? 'font-arabic' : ''}`}>
                    {lang === 'en' ? zone.diagnosisEn : zone.diagnosisAr}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recommendations */}
      <section className="px-6 pb-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <h3 className={`text-2xl font-bold text-white mb-3 ${lang === 'ar' ? 'font-arabic' : ''}`}>
          {lang === 'en' ? 'Recommendations' : 'التوصيات'}
        </h3>
        <ul className={`list-disc list-inside space-y-2 text-gray-300 ${lang === 'ar' ? 'font-arabic' : ''}`}>
            {(lang === 'en' ? result.recommendationsEn : result.recommendationsAr).map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
        </ul>
      </section>

    </div>
  );
};
export default ResultView;