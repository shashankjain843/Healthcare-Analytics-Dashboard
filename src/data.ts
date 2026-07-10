/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Patient, DiseaseForecast, SurvivalAnalysis, AuditLog } from "./types";

/**
 * Calculates a highly realistic readmission risk score using a heuristic clinical model
 * mimicking an XGBoost/TabNet classification approach.
 */
export function calculateReadmissionRisk(
  age: number,
  previousAdmissions: number,
  lengthOfStay: number,
  comorbidities: string[],
  diagnosis: string,
  vitals: {
    hba1c?: string;
    lvef?: number;
    fev1?: number;
    oxygenSat?: number;
    bloodPressure?: string;
  }
): { score: number; category: "High" | "Medium" | "Low"; riskFactors: string[] } {
  let score = 15; // Baseline risk (%)
  const factors: string[] = [];

  // Age risk factor
  if (age > 75) {
    score += 12;
    factors.push("Advanced Age (>75 years)");
  } else if (age > 65) {
    score += 7;
    factors.push("Geriatric Cohort (65-75 years)");
  } else if (age < 18) {
    score += 3;
  }

  // Previous admissions is the strongest readmission predictor (corresponds to prior utilization)
  if (previousAdmissions > 0) {
    const prevRisk = Math.min(previousAdmissions * 12, 40);
    score += prevRisk;
    factors.push(`Frequent Hospitalizations (${previousAdmissions} in past year)`);
  }

  // Comorbidities load
  if (comorbidities.length > 3) {
    score += 15;
    factors.push(`Severe Multimorbidity (${comorbidities.length} chronic conditions)`);
  } else if (comorbidities.length > 1) {
    score += 8;
    factors.push(`Comorbid Burden (${comorbidities.length} conditions)`);
  }

  // Length of stay: Short stay might indicate premature discharge; long stay indicates high severity
  if (lengthOfStay <= 2) {
    score += 6;
    factors.push("Short Index Stay (potential premature discharge risk)");
  } else if (lengthOfStay >= 8) {
    score += 10;
    factors.push("Extended Length of Stay (indicates high clinical severity)");
  }

  // Diagnosis-specific risk and lab analysis
  if (diagnosis === "Congestive Heart Failure") {
    score += 8;
    if (vitals.lvef && vitals.lvef < 40) {
      score += 18;
      factors.push("Systolic Dysfunction (LVEF < 40%)");
    }
  } else if (diagnosis === "Type 2 Diabetes") {
    score += 5;
    if (vitals.hba1c) {
      const hba1cVal = parseFloat(vitals.hba1c);
      if (!isNaN(hba1cVal) && hba1cVal > 8.5) {
        score += 15;
        factors.push(`Uncontrolled Glycemia (HbA1c: ${vitals.hba1c})`);
      }
    }
  } else if (diagnosis === "COPD") {
    score += 10;
    if (vitals.fev1 && vitals.fev1 < 50) {
      score += 16;
      factors.push("Severe Airflow Limitation (FEV1 < 50% predicted)");
    }
    if (vitals.oxygenSat && vitals.oxygenSat < 90) {
      score += 12;
      factors.push(`Chronic Hypoxemia (O2 Saturation: ${vitals.oxygenSat}%)`);
    }
  } else if (diagnosis === "Pneumonia") {
    score += 6;
    if (vitals.oxygenSat && vitals.oxygenSat < 92) {
      score += 14;
      factors.push(`Hypoxemia secondary to Pneumonia (O2 Sat: ${vitals.oxygenSat}%)`);
    }
  }

  // Blood pressure checks (hypertensive crisis or hypotension)
  if (vitals.bloodPressure) {
    const bpParts = vitals.bloodPressure.split("/");
    if (bpParts.length === 2) {
      const systolic = parseInt(bpParts[0]);
      const diastolic = parseInt(bpParts[1]);
      if (!isNaN(systolic) && !isNaN(diastolic)) {
        if (systolic >= 160 || diastolic >= 100) {
          score += 10;
          factors.push(`Severe Hypertension (${vitals.bloodPressure} mmHg)`);
        } else if (systolic <= 90) {
          score += 12;
          factors.push(`Incipient Hypotension (${vitals.bloodPressure} mmHg)`);
        }
      }
    }
  }

  // Cap risk score between 5% and 95%
  score = Math.max(5, Math.min(95, score));

  let category: "High" | "Medium" | "Low" = "Low";
  if (score >= 60) {
    category = "High";
  } else if (score >= 30) {
    category = "Medium";
  }

  return { score, category, riskFactors: factors };
}

/**
 * Feature Engineering Pipeline
 * Derives clinical features from raw patient inputs to enrich the EHR record.
 * These engineered features are used for analysis, insights, and visualization.
 */
export function enrichPatientFeatures(patient: Patient): Patient {
  // BMI Calculation: BMI = weight(kg) / (height(m))^2
  let bmi: number | undefined;
  if (patient.vitals.height && patient.vitals.weight) {
    const heightM = patient.vitals.height / 100;
    bmi = parseFloat((patient.vitals.weight / (heightM * heightM)).toFixed(1));
  }

  // Age Group Categorization
  let ageGroup: Patient["ageGroup"];
  if (patient.age < 18) {
    ageGroup = "Pediatric (<18)";
  } else if (patient.age < 65) {
    ageGroup = "Adult (18-64)";
  } else {
    ageGroup = "Geriatric (≥65)";
  }

  // Length of Stay Category
  let lengthOfStayCategory: Patient["lengthOfStayCategory"];
  if (patient.lengthOfStay <= 2) {
    lengthOfStayCategory = "Short Stay (≤2 days)";
  } else if (patient.lengthOfStay <= 7) {
    lengthOfStayCategory = "Moderate Stay (3-7 days)";
  } else {
    lengthOfStayCategory = "Extended Stay (≥8 days)";
  }

  // Total Comorbidity Count
  const totalComorbidities = patient.comorbidities.length;

  // Average Heart Rate (use existing heart rate as baseline, or estimate from vitals)
  const averageHeartRate = patient.vitals.heartRate;

  return {
    ...patient,
    bmi,
    ageGroup,
    lengthOfStayCategory,
    totalComorbidities,
    averageHeartRate,
  };
}

// Initial Synthetic Patients List
export const INITIAL_PATIENTS: Patient[] = [
  {
    id: "PAT-83291",
    name: "Arthur Pendelton",
    age: 72,
    gender: "Male",
    diagnosis: "Congestive Heart Failure",
    lengthOfStay: 6,
    previousAdmissions: 2,
    comorbidities: ["Hypertension", "Chronic Kidney Disease Stage III", "Hyperlipidemia"],
    vitals: { lvef: 35, bloodPressure: "135/82", heartRate: 78, oxygenSat: 94, height: 175, weight: 92 },
    dischargeMeds: ["Carvedilol 12.5mg BID", "Lisinopril 20mg daily", "Furosemide 40mg daily", "Atorvastatin 40mg daily"],
    riskScore: 78,
    riskCategory: "High",
    admissionDate: "2026-06-15",
    dischargeDate: "2026-06-21",
    notes: "Patient discharged following decompensated HF stabilization. LVEF remains low at 35%. Weight monitoring required daily.",
  },
  {
    id: "PAT-49201",
    name: "Clarissa Vance",
    age: 59,
    gender: "Female",
    diagnosis: "Type 2 Diabetes",
    lengthOfStay: 4,
    previousAdmissions: 0,
    comorbidities: ["Obesity Class II", "Neuropathy"],
    vitals: { hba1c: "9.2%", bloodPressure: "128/78", heartRate: 72, oxygenSat: 98, height: 163, weight: 98 },
    dischargeMeds: ["Metformin 1000mg BID", "Jardiance 10mg daily", "Gabapentin 300mg QHS"],
    riskScore: 32,
    riskCategory: "Medium",
    admissionDate: "2026-06-20",
    dischargeDate: "2026-06-24",
    notes: "Admitted for hyperosmolar hyperglycemic state (HHS). Discharged following insulin stabilization and shift to oral agents.",
  },
  {
    id: "PAT-11842",
    name: "Geraldine Croft",
    age: 81,
    gender: "Female",
    diagnosis: "COPD",
    lengthOfStay: 9,
    previousAdmissions: 3,
    comorbidities: ["Osteoporosis", "Coronary Artery Disease", "Depression"],
    vitals: { fev1: 38, oxygenSat: 89, bloodPressure: "115/70", heartRate: 85, height: 158, weight: 52 },
    dischargeMeds: ["Symbicort 160/4.5 2 puffs BID", "Spiriva Respimat 2.5mcg daily", "Prednisone 10mg daily taper", "Amlodipine 5mg daily"],
    riskScore: 92,
    riskCategory: "High",
    admissionDate: "2026-06-12",
    dischargeDate: "2026-06-21",
    notes: "Severe COPD acute exacerbation. High readmission risk due to multiple prior admissions, geriatric age, and border-line oxygenation.",
  },
  {
    id: "PAT-30491",
    name: "Raymond Chen",
    age: 44,
    gender: "Male",
    diagnosis: "Pneumonia",
    lengthOfStay: 3,
    previousAdmissions: 0,
    comorbidities: ["Asthma"],
    vitals: { oxygenSat: 95, bloodPressure: "120/80", heartRate: 76, height: 178, weight: 74 },
    dischargeMeds: ["Amoxicillin-Clavulanate 875/125mg BID", "Albuterol HFA inhaler PRN"],
    riskScore: 18,
    riskCategory: "Low",
    admissionDate: "2026-06-24",
    dischargeDate: "2026-06-27",
    notes: "Lobar pneumonia successfully treated with IV Ceftriaxone, completed with oral Augmentin courses. Good oxygen sat on room air.",
  },
  {
    id: "PAT-77301",
    name: "Sarah Jenkins",
    age: 68,
    gender: "Female",
    diagnosis: "Congestive Heart Failure",
    lengthOfStay: 5,
    previousAdmissions: 1,
    comorbidities: ["Hypertension", "Type 2 Diabetes"],
    vitals: { lvef: 48, hba1c: "7.8%", bloodPressure: "148/90", heartRate: 80, oxygenSat: 93, height: 165, weight: 76 },
    dischargeMeds: ["Metoprolol Succinate 50mg daily", "Sacubitril-Valsartan 49-51mg BID", "Empagliflozin 10mg daily"],
    riskScore: 54,
    riskCategory: "Medium",
    admissionDate: "2026-06-18",
    dischargeDate: "2026-06-23",
    notes: "Patient stabilized for mild chronic HF exacerbation. Switched standard ACE-i to Entresto to optimize cardiac protection.",
  },
  {
    id: "PAT-22910",
    name: "Frank Kowalski",
    age: 70,
    gender: "Male",
    diagnosis: "COPD",
    lengthOfStay: 4,
    previousAdmissions: 1,
    comorbidities: ["Hypertension", "Gout"],
    vitals: { fev1: 55, oxygenSat: 92, bloodPressure: "130/80", heartRate: 82, height: 180, weight: 88 },
    dischargeMeds: ["Advair Diskus 250/50 1 puff BID", "Allopurinol 100mg daily", "Lisinopril 10mg daily"],
    riskScore: 48,
    riskCategory: "Medium",
    admissionDate: "2026-06-22",
    dischargeDate: "2026-06-26",
    notes: "COPD exacerbation triggered by environmental dust. Discharged on standard maintenance therapy.",
  }
].map(enrichPatientFeatures);

// Historical and Forecast Outbreak Data
export const DISEASE_FORECASTS: DiseaseForecast[] = [
  {
    diseaseName: "Influenza",
    region: "Metropolitan Area A",
    currentTrend: "Rising",
    alertLevel: "High",
    peakCasesCount: 420,
    data: [
      { date: "May 20", historical: 110 },
      { date: "May 27", historical: 145 },
      { date: "Jun 03", historical: 190 },
      { date: "Jun 10", historical: 240 },
      { date: "Jun 17", historical: 295 },
      { date: "Jun 24", historical: 340 },
      { date: "Jul 01", historical: 385 },
      // Forecasted values
      { date: "Jul 08", forecast: 410, confidenceLower: 380, confidenceUpper: 440 },
      { date: "Jul 15", forecast: 420, confidenceLower: 390, confidenceUpper: 450 },
      { date: "Jul 22", forecast: 395, confidenceLower: 360, confidenceUpper: 430 },
      { date: "Jul 29", forecast: 340, confidenceLower: 300, confidenceUpper: 380 },
      { date: "Aug 05", forecast: 270, confidenceLower: 220, confidenceUpper: 320 },
    ],
  },
  {
    diseaseName: "COVID-19",
    region: "Metropolitan Area A",
    currentTrend: "Stable",
    alertLevel: "Medium",
    peakCasesCount: 180,
    data: [
      { date: "May 20", historical: 140 },
      { date: "May 27", historical: 155 },
      { date: "Jun 03", historical: 160 },
      { date: "Jun 10", historical: 158 },
      { date: "Jun 17", historical: 162 },
      { date: "Jun 24", historical: 150 },
      { date: "Jul 01", historical: 148 },
      // Forecasted values
      { date: "Jul 08", forecast: 145, confidenceLower: 125, confidenceUpper: 165 },
      { date: "Jul 15", forecast: 142, confidenceLower: 120, confidenceUpper: 164 },
      { date: "Jul 22", forecast: 139, confidenceLower: 110, confidenceUpper: 168 },
      { date: "Jul 29", forecast: 135, confidenceLower: 100, confidenceUpper: 170 },
      { date: "Aug 05", forecast: 130, confidenceLower: 90, confidenceUpper: 170 },
    ],
  },
  {
    diseaseName: "Dengue Fever",
    region: "Coastal Sector C",
    currentTrend: "Rising",
    alertLevel: "High",
    peakCasesCount: 195,
    data: [
      { date: "May 20", historical: 45 },
      { date: "May 27", historical: 58 },
      { date: "Jun 03", historical: 74 },
      { date: "Jun 10", historical: 95 },
      { date: "Jun 17", historical: 120 },
      { date: "Jun 24", historical: 142 },
      { date: "Jul 01", historical: 165 },
      // Forecasted values
      { date: "Jul 08", forecast: 185, confidenceLower: 165, confidenceUpper: 205 },
      { date: "Jul 15", forecast: 195, confidenceLower: 170, confidenceUpper: 220 },
      { date: "Jul 22", forecast: 190, confidenceLower: 160, confidenceUpper: 220 },
      { date: "Jul 29", forecast: 175, confidenceLower: 140, confidenceUpper: 210 },
      { date: "Aug 05", forecast: 150, confidenceLower: 110, confidenceUpper: 190 },
    ],
  },
  {
    diseaseName: "Norovirus",
    region: "Northern District B",
    currentTrend: "Declining",
    alertLevel: "Low",
    peakCasesCount: 95,
    data: [
      { date: "May 20", historical: 92 },
      { date: "May 27", historical: 95 },
      { date: "Jun 03", historical: 88 },
      { date: "Jun 10", historical: 74 },
      { date: "Jun 17", historical: 62 },
      { date: "Jun 24", historical: 50 },
      { date: "Jul 01", historical: 38 },
      // Forecasted values
      { date: "Jul 08", forecast: 28, confidenceLower: 18, confidenceUpper: 38 },
      { date: "Jul 15", forecast: 22, confidenceLower: 12, confidenceUpper: 32 },
      { date: "Jul 22", forecast: 18, confidenceLower: 8, confidenceUpper: 28 },
      { date: "Jul 29", forecast: 15, confidenceLower: 5, confidenceUpper: 25 },
      { date: "Aug 05", forecast: 12, confidenceLower: 2, confidenceUpper: 22 },
    ],
  },
  {
    diseaseName: "Influenza",
    region: "Northern District B",
    currentTrend: "Stable",
    alertLevel: "Medium",
    peakCasesCount: 160,
    data: [
      { date: "May 20", historical: 80 },
      { date: "May 27", historical: 92 },
      { date: "Jun 03", historical: 105 },
      { date: "Jun 10", historical: 112 },
      { date: "Jun 17", historical: 118 },
      { date: "Jun 24", historical: 124 },
      { date: "Jul 01", historical: 122 },
      // Forecasted values
      { date: "Jul 08", forecast: 125, confidenceLower: 110, confidenceUpper: 140 },
      { date: "Jul 15", forecast: 128, confidenceLower: 112, confidenceUpper: 144 },
      { date: "Jul 22", forecast: 124, confidenceLower: 105, confidenceUpper: 143 },
      { date: "Jul 29", forecast: 115, confidenceLower: 95, confidenceUpper: 135 },
      { date: "Aug 05", forecast: 102, confidenceLower: 80, confidenceUpper: 124 },
    ],
  }
];

// Survival Analysis (Kaplan-Meier + Cox PH Results)
export const SURVIVAL_STUDIES: SurvivalAnalysis[] = [
  {
    condition: "Congestive Heart Failure",
    survivalData: [
      { day: 0, "Standard Care": 100, "Protocol B": 100, "Protocol C": 100 },
      { day: 5, "Standard Care": 95, "Protocol B": 98, "Protocol C": 99 },
      { day: 10, "Standard Care": 88, "Protocol B": 94, "Protocol C": 97 },
      { day: 15, "Standard Care": 80, "Protocol B": 91, "Protocol C": 95 },
      { day: 20, "Standard Care": 73, "Protocol B": 87, "Protocol C": 92 },
      { day: 25, "Standard Care": 68, "Protocol B": 84, "Protocol C": 90 },
      { day: 30, "Standard Care": 63, "Protocol B": 82, "Protocol C": 88 },
      { day: 45, "Standard Care": 55, "Protocol B": 78, "Protocol C": 84 },
      { day: 60, "Standard Care": 48, "Protocol B": 74, "Protocol C": 81 },
      { day: 90, "Standard Care": 41, "Protocol B": 70, "Protocol C": 78 },
    ],
    treatments: [
      {
        name: "Standard Care",
        hazardRatio: 1.0, // Reference
        confidenceInterval: "Reference",
        pValue: 1.0,
        sampleSize: 150,
        medianRecoveryDays: 52,
        description: "Standard diuretic adjustments and Metoprolol titration.",
      },
      {
        name: "Protocol B (SGLT2i Combo)",
        hazardRatio: 0.62,
        confidenceInterval: "0.48 - 0.79",
        pValue: 0.002,
        sampleSize: 148,
        medianRecoveryDays: 34,
        description: "Addition of Empagliflozin/Dapagliflozin to standard guideline-directed medical therapy.",
      },
      {
        name: "Protocol C (Advanced Dual Therapy)",
        hazardRatio: 0.45,
        confidenceInterval: "0.33 - 0.61",
        pValue: 0.0001,
        sampleSize: 152,
        medianRecoveryDays: 21,
        description: "Combined early-initiation of Sacubitril-Valsartan (ARNI) paired with SGLT2 inhibitor.",
      },
    ],
  },
  {
    condition: "Type 2 Diabetes (Severe Glycemia)",
    survivalData: [
      { day: 0, "Standard Care": 100, "Protocol B": 100, "Protocol C": 100 },
      { day: 5, "Standard Care": 92, "Protocol B": 96, "Protocol C": 98 },
      { day: 10, "Standard Care": 82, "Protocol B": 91, "Protocol C": 95 },
      { day: 15, "Standard Care": 72, "Protocol B": 86, "Protocol C": 91 },
      { day: 20, "Standard Care": 62, "Protocol B": 81, "Protocol C": 88 },
      { day: 25, "Standard Care": 55, "Protocol B": 77, "Protocol C": 85 },
      { day: 30, "Standard Care": 50, "Protocol B": 74, "Protocol C": 83 },
      { day: 45, "Standard Care": 42, "Protocol B": 69, "Protocol C": 79 },
      { day: 60, "Standard Care": 36, "Protocol B": 65, "Protocol C": 76 },
      { day: 90, "Standard Care": 30, "Protocol B": 61, "Protocol C": 72 },
    ],
    treatments: [
      {
        name: "Standard Care",
        hazardRatio: 1.0,
        confidenceInterval: "Reference",
        pValue: 1.0,
        sampleSize: 220,
        medianRecoveryDays: 30,
        description: "Basal-bolus insulin sliding scale + Metformin optimization.",
      },
      {
        name: "Protocol B (GLP-1 RA Booster)",
        hazardRatio: 0.71,
        confidenceInterval: "0.58 - 0.87",
        pValue: 0.008,
        sampleSize: 215,
        medianRecoveryDays: 18,
        description: "Standard oral therapies optimized plus weekly subcutaneous Semaglutide/Liraglutide.",
      },
      {
        name: "Protocol C (GLP-1 + SGLT2 Combination)",
        hazardRatio: 0.51,
        confidenceInterval: "0.40 - 0.65",
        pValue: 0.0003,
        sampleSize: 225,
        medianRecoveryDays: 12,
        description: "Dual discharge prescription of GLP-1 receptor agonist and SGLT2 inhibitor (Empagliflozin).",
      },
    ],
  },
  {
    condition: "COPD Exacerbation",
    survivalData: [
      { day: 0, "Standard Care": 100, "Protocol B": 100, "Protocol C": 100 },
      { day: 5, "Standard Care": 90, "Protocol B": 94, "Protocol C": 97 },
      { day: 10, "Standard Care": 78, "Protocol B": 87, "Protocol C": 92 },
      { day: 15, "Standard Care": 68, "Protocol B": 81, "Protocol C": 88 },
      { day: 20, "Standard Care": 60, "Protocol B": 76, "Protocol C": 84 },
      { day: 25, "Standard Care": 53, "Protocol B": 72, "Protocol C": 81 },
      { day: 30, "Standard Care": 48, "Protocol B": 69, "Protocol C": 78 },
      { day: 45, "Standard Care": 41, "Protocol B": 63, "Protocol C": 73 },
      { day: 60, "Standard Care": 35, "Protocol B": 59, "Protocol C": 69 },
      { day: 90, "Standard Care": 29, "Protocol B": 55, "Protocol C": 65 },
    ],
    treatments: [
      {
        name: "Standard Care",
        hazardRatio: 1.0,
        confidenceInterval: "Reference",
        pValue: 1.0,
        sampleSize: 110,
        medianRecoveryDays: 28,
        description: "Inhaled Albuterol/Ipratropium PRN, oral steroids taper.",
      },
      {
        name: "Protocol B (Triple Therapy)",
        hazardRatio: 0.74,
        confidenceInterval: "0.59 - 0.93",
        pValue: 0.012,
        sampleSize: 115,
        medianRecoveryDays: 16,
        description: "Inhaled corticosteroid (ICS) + LAMA + LABA triple combination inhaler.",
      },
      {
        name: "Protocol C (Triple + Early Pulm Rehab)",
        hazardRatio: 0.58,
        confidenceInterval: "0.44 - 0.76",
        pValue: 0.001,
        sampleSize: 112,
        medianRecoveryDays: 11,
        description: "Triple inhaler therapy coupled with supervised post-exacerbation pulmonary rehabilitation within 7 days.",
      },
    ],
  }
];

// Initial Compliance Audit Logs
export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "AUD-9921",
    timestamp: "2026-07-03T08:12:44-07:00",
    user: "Dr. Alice Morgan",
    role: "Doctor",
    action: "EHR Query & Risk Analysis",
    status: "Success",
    details: "Computed readmission risk model score for Patient Arthur Pendelton (78%). Risk factors identified.",
  },
  {
    id: "AUD-9922",
    timestamp: "2026-07-03T08:24:11-07:00",
    user: "Dr. Alice Morgan",
    role: "Doctor",
    action: "Gemini Clinical Consultation",
    status: "Success",
    details: "Triggered server-side Gemini Clinical Advisory LLM to draft post-discharge care protocols.",
  },
  {
    id: "AUD-9923",
    timestamp: "2026-07-03T08:35:50-07:00",
    user: "James Sterling",
    role: "Admin",
    action: "HIPAA Export & Anonymization",
    status: "Success",
    details: "Anonymized 3 clinical patient records into FHIR Patient resources for secondary clinical study.",
  },
  {
    id: "AUD-9924",
    timestamp: "2026-07-03T09:05:00-07:00",
    user: "Nurse Emily Chen",
    role: "Staff",
    action: "Disease Surveillance Analysis",
    status: "Success",
    details: "Accessed Metropolitan Area A infectious outbreak time-series projections for bed allocation review.",
  }
];
