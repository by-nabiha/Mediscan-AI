export type Language = "en" | "ur";

export interface User {
  id: number;
  name: string;
  email: string;
  preferredLanguage: Language;
  age?: number;
  gender?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type UrgencyLevel = "none" | "routine" | "urgent" | "emergency";

export interface DiseaseScores {
  xray: number | null;
  skin: number | null;
  diabetes: number | null;
  mentalHealth: number | null;
}

export interface ConditionScore {
  condition: string;
  probability: number;
}

export interface Scan {
  id: number;
  userId: number;
  triageDecision: string;
  urgencyLevel: UrgencyLevel;
  compositeScore: number | null;
  thresholdsCrossed: string[];
  isCrisisOverride: boolean;
  explanation: string;
  diseaseScores: {
    xray: number | null;
    skin: number | null;
    diabetes: number | null;
    mentalHealth: number | null;
  };
  xrayConditions?: ConditionScore[] | null;
  skinConditions?: ConditionScore[] | null;
  intakeId: number | null;
  createdAt: string;
}

export interface TriageResult {
  decision: string;
  urgencyLevel: UrgencyLevel;
  compositeScore: number | null;
  overrides: Array<{
    disease: string;
    score: number;
    threshold: number;
  }>;
  thresholdsCrossed: string[];
  isCrisisOverride: boolean;
  explanation: string;
}

export interface TrendPoint {
  scanId: number;
  score: number;
  createdAt: string;
}

export interface TrendsData {
  xray: TrendPoint[];
  skin: TrendPoint[];
  diabetes: TrendPoint[];
  mentalHealth: TrendPoint[];
}

export interface DashboardSummary {
  totalScans: number;
  latestScan: Scan | null;
  urgencyBreakdown: {
    none: number;
    routine: number;
    urgent: number;
    emergency: number;
  };
  recentScans: Scan[];
  averageScores: {
    xray: number;
    skin: number;
    diabetes: number;
    mentalHealth: number;
  };
}

export interface XrayResult {
  confidenceScore: number;
  topCondition: string;
  allConditions: ConditionScore[];
}

export interface SkinResult {
  confidenceScore: number;
  conditions: ConditionScore[];
}

export interface DiabetesResult {
  confidenceScore: number;
  riskLevel: "low" | "moderate" | "high";
}

export interface MentalHealthResult {
  confidenceScore: number;
  severityBuckets: {
    noConcern: number;
    mild: number;
    moderate: number;
    severe: number;
  };
  isCrisis: boolean;
  crisisResources: string[];
}

export interface Intake {
  id: number;
  userId: number;
  primaryConcern: string;
  symptomDuration: string;
  previousEpisodes: boolean;
  currentMedications: string;
  knownAllergies: string;
  createdAt: string;
}
