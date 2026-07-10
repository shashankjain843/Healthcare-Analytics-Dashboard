/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PatientVitals {
  hba1c?: string;
  bloodPressure?: string;
  heartRate?: number;
  lvef?: number; // Left Ventricular Ejection Fraction (%) for Heart Failure
  fev1?: number; // Forced Expiratory Volume (%) for COPD
  oxygenSat?: number; // Oxygen Saturation (%)
  height?: number; // Height in cm (for BMI)
  weight?: number; // Weight in kg (for BMI)
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  diagnosis: string;
  lengthOfStay: number; // in days
  previousAdmissions: number; // count in past 12 months
  comorbidities: string[];
  vitals: PatientVitals;
  dischargeMeds: string[];
  riskScore: number; // Calculated ML readmission risk 0 to 100
  riskCategory: "High" | "Medium" | "Low";
  admissionDate: string;
  dischargeDate: string;
  notes?: string;
  genderOriginal?: "Male" | "Female" | "Other";
  nameOriginal?: string;
  isAnonymized?: boolean;
  
  // Engineered Features
  bmi?: number;
  totalComorbidities?: number;
  lengthOfStayCategory?: "Short Stay (≤2 days)" | "Moderate Stay (3-7 days)" | "Extended Stay (≥8 days)";
  ageGroup?: "Pediatric (<18)" | "Adult (18-64)" | "Geriatric (≥65)";
  averageHeartRate?: number;
}

export interface ForecastDataPoint {
  date: string;
  historical?: number;
  forecast?: number;
  confidenceLower?: number;
  confidenceUpper?: number;
}

export interface DiseaseForecast {
  diseaseName: string;
  region: string;
  data: ForecastDataPoint[];
  peakCasesCount: number;
  currentTrend: "Rising" | "Stable" | "Declining";
  alertLevel: "High" | "Medium" | "Low";
}

export interface SurvivalDataPoint {
  day: number;
  "Standard Care"?: number; // Survival / recovery probability (0 to 100)
  "Protocol B"?: number;
  "Protocol C"?: number;
}

export interface SurvivalAnalysis {
  condition: string;
  treatments: {
    name: string;
    hazardRatio: number; // Cox PH Hazard Ratio relative to standard care
    confidenceInterval: string; // "0.54 - 0.81"
    pValue: number; // log-rank p-value
    sampleSize: number;
    medianRecoveryDays: number;
    description: string;
  }[];
  survivalData: SurvivalDataPoint[];
}

export type UserRole = "Doctor" | "Admin" | "Staff";

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  status: "Success" | "Failed";
  details: string;
}
