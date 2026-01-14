import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from '../types';

const MODEL_NAME = 'gemini-3-pro-preview';

export const analyzeLogData = async (content: string, fileType: 'pdf' | 'las'): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY; 
  if (!apiKey) throw new Error("API Key is missing from environment variables.");

  const ai = new GoogleGenAI({ apiKey });

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      summaryEn: { type: Type.STRING },
      summaryAr: { type: Type.STRING },
      logTypeDetected: { type: Type.STRING },
      depthUnit: { type: Type.STRING, enum: ["Meters", "Feet"] },
      zones: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            depthFrom: { type: Type.NUMBER },
            depthTo: { type: Type.NUMBER },
            quality: { type: Type.STRING, enum: ['Excellent', 'Good', 'Moderate', 'Poor', 'Free Pipe'] },
            technicalDescriptionEn: { type: Type.STRING, description: "Detailed technical explanation of the log readings (CBL, VDL) for this interval." },
            technicalDescriptionAr: { type: Type.STRING, description: "Arabic translation of the technical description." },
            diagnosisEn: { type: Type.STRING, description: "A very brief diagnostic summary, e.g., 'CBL > 90 mV' or 'Good bonding'." },
            diagnosisAr: { type: Type.STRING, description: "Arabic translation of the diagnosis." }
          },
          required: ["depthFrom", "depthTo", "quality", "technicalDescriptionEn", "technicalDescriptionAr", "diagnosisEn", "diagnosisAr"]
        }
      },
      recommendationsEn: { type: Type.ARRAY, items: { type: Type.STRING } },
      recommendationsAr: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["summaryEn", "summaryAr", "zones", "recommendationsEn", "recommendationsAr", "logTypeDetected", "depthUnit"]
  };

  const isLas = fileType === 'las';
  
  const prompt = `
    You are a Senior Petroleum Engineer in the Well Cementing Section (شعبة تسميت الآبار).
    Analyze the provided ${isLas ? 'digital LAS data curves' : 'PDF logs (CBL/VDL images)'} and generate a report.

    **REPORTING PROTOCOL:**
    1.  **Segmentation:** Divide the log into logical intervals based on significant changes in bond quality. DO NOT use fixed 50m intervals if it doesn't make sense.
    2.  **For each interval, provide:**
        *   **Quality:** The overall bond quality rating.
        *   **Technical Description:** A detailed engineering description of what the CBL amplitude and VDL waveforms show.
        *   **Diagnosis:** A very concise summary of the primary indicator, for example: "CBL amplitude avg > 90 mV" or "CBL drops < 30 mV".
    3.  **Terminology:** Use standard Iraqi oil sector Arabic terms (حقن، تخديد، تلاحم، بطانة).
    4.  **Overall Summary & Recommendations:** Provide a comprehensive executive summary and a list of actionable engineering recommendations.
  `;

  const part = isLas 
    ? { text: `LAS DATA:\n${content.substring(0, 45000)}` }
    : { inlineData: { mimeType: "application/pdf", data: content } };

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: { parts: [part, { text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      thinkingConfig: { thinkingBudget: 15000 }
    }
  });

  return JSON.parse(response.text!) as AnalysisResult;
};