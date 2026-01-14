export interface BondZone {
  depthFrom: number;
  depthTo: number;
  quality: 'Excellent' | 'Good' | 'Moderate' | 'Poor' | 'Free Pipe';
  technicalDescriptionEn: string;
  technicalDescriptionAr: string;
  diagnosisEn: string;
  diagnosisAr: string;
}

export interface AnalysisResult {
  summaryEn: string;
  summaryAr: string;
  zones: BondZone[];
  recommendationsEn: string[];
  recommendationsAr: string[];
  logTypeDetected: string;
  depthUnit: 'Meters' | 'Feet';
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}