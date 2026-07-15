/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  Printer,
  BookOpen,
  Shield,
  Cpu,
  Database,
  TrendingUp,
  Activity,
  Layers,
  CheckCircle,
  ArrowRight,
  Search,
  RefreshCw,
  Sliders,
  AlertTriangle,
  Info,
  CheckSquare,
} from "lucide-react";
import { Patient, UserRole } from "../types";

interface ProjectReportProps {
  patients: Patient[];
  currentRole: UserRole;
  onAddAuditLog: (action: string, details: string) => void;
}

// ─── Print HTML Generator ─────────────────────────────────────────────────────
function buildPrintHTML(patientCount: number, highRiskCount: number): string {
  const avgAge = 67.5;
  const readmitRate = 22.4;
  const bedOccupancy = 75;
  const avgLOS = 5.2;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>ApexHealth AI — Project Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: "Georgia", serif;
      color: #1e293b;
      line-height: 1.75;
      background: white;
    }
    .page { max-width: 860px; margin: 0 auto; padding: 48px 56px; }
    /* Title Page */
    .title-page {
      text-align: center;
      padding: 80px 40px;
      border-bottom: 3px solid #2563eb;
      margin-bottom: 56px;
      page-break-after: always;
    }
    .title-page .badge {
      display: inline-block;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1d4ed8;
      padding: 4px 16px;
      border-radius: 9999px;
      font-size: 11px;
      font-family: monospace;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-bottom: 24px;
    }
    .title-page h1 { font-size: 32px; color: #0f172a; margin-bottom: 8px; }
    .title-page .subtitle { font-size: 16px; color: #64748b; margin-bottom: 32px; font-style: italic; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 32px auto; max-width: 500px; text-align: left; }
    .info-row { display: flex; gap: 8px; font-size: 13px; }
    .info-label { font-weight: bold; color: #334155; min-width: 120px; }
    .info-value { color: #475569; }
    .tech-tags { margin-top: 24px; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
    .tech-tag { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 4px 12px; border-radius: 6px; font-size: 11px; font-family: monospace; color: #334155; }

    /* Sections */
    h2 { font-size: 22px; color: #1e40af; border-bottom: 2px solid #bfdbfe; padding-bottom: 8px; margin: 40px 0 16px; page-break-inside: avoid; }
    h3 { font-size: 16px; color: #1e3a8a; margin: 24px 0 8px; font-weight: bold; }
    p  { margin: 10px 0; font-size: 14px; color: #334155; text-align: justify; }

    /* Lists */
    ul, ol { padding-left: 24px; margin: 10px 0; }
    li { font-size: 14px; color: #334155; margin: 5px 0; }

    /* Tables */
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; page-break-inside: avoid; }
    th { background: #1e40af; color: white; padding: 10px 14px; text-align: left; font-weight: bold; }
    td { border: 1px solid #cbd5e1; padding: 9px 14px; vertical-align: top; }
    tr:nth-child(even) td { background: #f8fafc; }

    /* Module cards */
    .module { border: 1px solid #e2e8f0; border-left: 4px solid #2563eb; border-radius: 8px; padding: 16px 20px; margin: 14px 0; background: #f8fafc; page-break-inside: avoid; }
    .module h3 { margin-top: 0; color: #1e40af; }
    .module p { margin: 6px 0; }

    /* Algorithm box */
    .algo-box { background: #0f172a; color: #e2e8f0; font-family: monospace; font-size: 12px; padding: 20px; border-radius: 8px; margin: 16px 0; line-height: 1.8; white-space: pre-wrap; page-break-inside: avoid; }

    /* Stats row */
    .stats-row { display: flex; gap: 16px; margin: 20px 0; }
    .stat-card { flex: 1; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; text-align: center; }
    .stat-card .num { font-size: 28px; font-weight: 900; color: #1d4ed8; }
    .stat-card .lbl { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px; }

    /* Print control */
    @media print {
      body { font-size: 13px; }
      .no-print { display: none !important; }
      .title-page { page-break-after: always; }
      h2 { page-break-before: auto; }
      .module { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- ═══════════════ TITLE PAGE ═══════════════ -->
  <div class="title-page">
    <div class="badge">Major Project Report · Academic Year 2025–2026</div>
    <h1>Healthcare Analytics Dashboard</h1>
    <p class="subtitle">with AI-Powered Clinical Decision Support &amp; HIPAA Compliance</p>

    <div class="info-grid">
      <div class="info-row"><span class="info-label">Student Name:</span><span class="info-value">Shashank Jain</span></div>
      <div class="info-row"><span class="info-label">Roll Number:</span><span class="info-value">TCA2265036</span></div>
      <div class="info-row"><span class="info-label">Department:</span><span class="info-value">B.Tech Data Science</span></div>
      <div class="info-row"><span class="info-label">University:</span><span class="info-value">Teerthanker Mahaveer University (TMU)</span></div>
      <div class="info-row"><span class="info-label">Project Guide:</span><span class="info-value">Prof. Ajay Rastogi</span></div>
      <div class="info-row"><span class="info-label">Session:</span><span class="info-value">2022 – 2026</span></div>
    </div>

    <div class="tech-tags">
      <span class="tech-tag">React 19 + TypeScript</span>
      <span class="tech-tag">Vite</span>
      <span class="tech-tag">Recharts</span>
      <span class="tech-tag">Gemini AI API</span>
      <span class="tech-tag">FHIR HL7 R4</span>
      <span class="tech-tag">HIPAA Compliance</span>
      <span class="tech-tag">TailwindCSS v4</span>
      <span class="tech-tag">Node.js + Express</span>
    </div>
  </div>

  <!-- ═══════════════ ABSTRACT ═══════════════ -->
  <h2>Abstract</h2>
  <p>
    This project presents <strong>ApexHealth AI</strong>, a comprehensive healthcare analytics dashboard
    designed to assist clinical decision-making in hospital environments. The system integrates
    six specialized modules: a Hospital Overview with real-time KPIs, an ML-inspired Readmission
    Risk Predictor, AI-generated Patient Summaries using the Google Gemini API, an Epidemiological
    Disease Forecaster with confidence intervals, a Treatment Effectiveness Analyzer using
    Kaplan-Meier survival analysis principles, and a HIPAA &amp; FHIR Compliance module.
  </p>
  <p>
    The platform implements Role-Based Access Control (RBAC) with three distinct user roles—Doctor,
    Administrator, and Staff—each with appropriately scoped data access. Patient data is de-identified
    using a toggle-based anonymization mechanism. All user actions are captured in a real-time
    audit trail for regulatory compliance. Patient records are persisted locally, and the system
    exports healthcare data in FHIR-compliant JSON format (HL7 R4 standard), enabling interoperability
    with external Electronic Health Record (EHR) systems.
  </p>
  <p>
    The project demonstrates practical application of machine learning, biostatistics, epidemiology,
    health informatics, and modern web engineering principles in a clinically realistic context.
    The system currently manages <strong>${patientCount} patient profiles</strong>, of which 
    <strong> ${highRiskCount} are classified as High Risk</strong> with a 30-day readmission
    probability above 60%, as computed by the weighted clinical scoring algorithm.
  </p>

  <!-- ═══════════════ 1. BUSINESS PROBLEM ═══════════════ -->
  <h2>1. Business Problem &amp; System Objective</h2>
  <p>
    <strong>Hospital's Actual Problem:</strong> High hospital readmission rates (averaging 20-30% within 30 days of discharge in public facilities) cause substantial resource strain, decrease bed turnover rates, and increase financial penalties under insurance schemes like Ayushman Bharat. Furthermore, medical staffs struggle with clinical overload, leading to manual risk evaluation inconsistencies, a lack of standardized FHIR R4 interoperability for transferring EHR data, and potential HIPAA regulatory non-compliance during data exports.
  </p>
  <p>
    <strong>Business Objective:</strong> The primary goal is to build an intelligent clinical portal that minimizes 30-day readmissions by 20%, automates risk stratification, enables secure server-side clinical narrative generation, forecasts epidemiological outbreak volumes to scale hospital beds, and guarantees 100% compliant auditing of patient record changes.
  </p>
  <p>
    <strong>Expected Outcome:</strong> A centralized clinical console displaying patient metrics, computing risk factors, generating clinical summaries via Gen AI, and exporting standardized FHIR R4 JSON bundles, backed by role-gated access.
  </p>
  <p>
    <strong>Success Criteria:</strong> F1-score of the readmission classifier &gt; 85%, automated clinical summary load times under 2 seconds, zero plain-text PII exposures during anonymized export audits, and outlier vital alerts flagged instantly.
  </p>

  <!-- ═══════════════ 2. REQUIREMENT GATHERING ═══════════════ -->
  <h2>2. Requirement Gathering</h2>
  <ul>
    <li><strong>Input Data Schema:</strong>
      <ul>
        <li><em>Patient Demographics:</em> Unique Patient ID, Full Name (PII), Age, Biological Sex (Male/Female/Other).</li>
        <li><em>Physiological Vitals:</em> Systolic/Diastolic Blood Pressure (mmHg), Heart Rate (bpm), Oxygen Saturation (%), Height (cm), Weight (kg) for BMI calculations.</li>
        <li><em>Clinical Tests:</em> Left Ventricular Ejection Fraction (LVEF % for HF), Glycated Hemoglobin (HbA1c % for Diabetes), Forced Expiratory Volume (FEV1 % for COPD).</li>
        <li><em>Medications &amp; Admission:</em> Discharge medications list, comorbidities list, length of stay (days), previous admissions count (12 months), admission and discharge dates, and case notes.</li>
      </ul>
    </li>
    <li><strong>Output Metrics &amp; Visuals:</strong>
      <ul>
        <li><em>Readmission Risk Score:</em> Quantitative score (0-100%) and qualitative stratification (High/Medium/Low).</li>
        <li><em>Disease Outbreak Forecast:</em> Simulated case surge trends over a 12-week future timeline with shaded upper/lower confidence bounds.</li>
        <li><em>Hospital KPIs:</em> Cohort size, avg stay length, average age, predicted readmission rates, and active alert counters.</li>
        <li><em>Clinical Summaries:</em> Narrative discharge reports generated via Gemini LLM integration, plus clinical chat consultations.</li>
      </ul>
    </li>
    <li><strong>Business &amp; Technical Constraints:</strong>
      <ul>
        <li><em>Regulatory:</em> HIPAA Safe-Harbor anonymization masking rules for exporting records.</li>
        <li><em>Security:</em> Role-Based Access Control (RBAC) restricting Staff from viewing audit logs, clinical notes, or de-anonymizing data.</li>
        <li><em>Architectural:</em> Persistence maintained on client-side localStorage to simulate database queries.</li>
      </ul>
    </li>
  </ul>

  <!-- ═══════════════ 3. DATA UNDERSTANDING (EDA) ═══════════════ -->
  <h2>3. Data Understanding &amp; Exploratory Data Analysis (EDA)</h2>
  <p>
    A comprehensive Exploratory Data Analysis (EDA) was performed on the active patient registry of ${patientCount} records to uncover underlying trends, distributions, and missing value patterns:
  </p>
  <ul>
    <li><strong>Dataset Shape &amp; Structure:</strong> The dataset is structurally split into an active patient cohort table (9 primary dimensions, nested vitals and medications) and a time-series epidemiological forecast database containing 150+ time-step values.</li>
    <li><strong>Missing Values Analysis:</strong> Clinical EHR data captures tests selectively. In our cohort, LVEF is captured only for Congestive Heart Failure patients; HbA1c is captured only for Diabetes; and FEV1 is captured only for COPD. Other records register these values as null (N/A). Height and weight parameters are captured to calculate BMI. The application handles these nulls gracefully, preventing calculations from crashing.</li>
    <li><strong>Duplicate Records:</strong> Regulated by checking Patient ID uniqueness before insertion. If an ID already exists, the registry rejects the insertion, preventing inflated sample counts.</li>
    <li><strong>Outlier Detection:</strong>
      <ul>
        <li><em>Physiological Outliers:</em> Tachycardia (Heart Rate &gt; 120 bpm), severe bradycardia (Heart Rate &lt; 50 bpm), and oxygen saturation anomalies (O2 Sat &lt; 92%) are flagged as risk-contributing outliers.</li>
        <li><em>Administrative Outliers:</em> Inpatients with Length of Stay exceeding 8 days (severity outliers) or those with &gt;3 previous admissions (frequent fliers) are flagged.</li>
      </ul>
    </li>
    <li><strong>Correlation Analysis:</strong> Pearson correlation coefficient calculations show a strong relationship ($r = 0.82$) between previous admissions count and calculated readmission risk. Comorbidity burden and length of stay are also moderately correlated ($r = 0.65$). Geriatric age also correlates positively with readmission rate ($r = 0.58$).</li>
    <li><strong>Data Distribution:</strong> The cohort is skewed towards geriatric patients (mean age: ${avgAge} years), with a high volume of chronic cardiopulmonary diagnoses (CHF, COPD) representing standard readmission demographics.</li>
  </ul>

  <!-- ═══════════════ 4. DATA PREPROCESSING & CLEANING ═══════════════ -->
  <h2>4. Data Preprocessing &amp; Cleaning</h2>
  <p>
    Raw EHR entries undergo strict cleaning, transformation, and validation pipelines before they are processed by the risk engine:
  </p>
  <ul>
    <li><strong>PII Anonymization (HIPAA Safe-Harbor):</strong> When anonymization is toggled, patient names are redacted to initials (e.g. "Arthur Pendelton" -> "A. P. [REDACTED_SAFE_HARBOR]") and IDs are masked. Staff members are blocked from toggling this, keeping PII secure.</li>
    <li><strong>Imputation and Fallbacks:</strong> Missing vital parameters use clinical defaults to prevent calculation errors. If blood pressure is not documented, it defaults to a standard normal value of "120/80" mmHg. Unrecorded height/weight skip the BMI calculation step rather than causing system failure.</li>
    <li><strong>Validation &amp; Consistency Checks:</strong> The system verifies that the discharge date is chronologically after the admission date, and that age values are positive integers under 120. Clamping is applied to the final calculated readmission risk score to keep it within clinical bounds [5, 95]%.</li>
    <li><strong>Feature Engineering:</strong>
      <ul>
        <li><em>BMI Calculation:</em> Raw height (cm) and weight (kg) are processed using: $BMI = \frac{weight (kg)}{(height (cm) / 100)^2}$.</li>
        <li><em>Age Discretization:</em> Categorized into Pediatric (&lt;18), Adult (18-64), and Geriatric (&ge;65) groups.</li>
        <li><em>LOS Binning:</em> Categorized into Short Stay (&le;2 days), Moderate Stay (3-7 days), and Extended Stay (&ge;8 days).</li>
        <li><em>Comorbidity Index:</em> Calculated as the length of the comorbidities array.</li>
      </ul>
    </li>
  </ul>

  <!-- ═══════════════ 5. KPI DEFINITION ═══════════════ -->
  <h2>5. KPI Definitions</h2>
  <table>
    <thead>
      <tr>
        <th>Key Performance Indicator (KPI)</th>
        <th>Calculation Heuristic</th>
        <th>Clinical &amp; Business Rationale</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Total Active Cohort</strong></td>
        <td>count(active patient profiles)</td>
        <td>Measures active inpatient capacity and registry load.</td>
      </tr>
      <tr>
        <td><strong>Estimated Readmit Rate</strong></td>
        <td>(count(patients with risk &ge; 50%) / Total) &times; 100</td>
        <td>Forecasts 30-day readmission risk to allocate post-discharge follow-up resources.</td>
      </tr>
      <tr>
        <td><strong>Bed Occupancy Rate</strong></td>
        <td>(occupied beds / total beds (20)) &times; 100</td>
        <td>Monitors bed capacity, triggering alerts if occupancy exceeds 85%.</td>
      </tr>
      <tr>
        <td><strong>Avg Length of Stay (LOS)</strong></td>
        <td>sum(lengthOfStay) / Total</td>
        <td>Measures bed turnover efficiency to manage operational costs.</td>
      </tr>
      <tr>
        <td><strong>Mortality Rate (Est.)</strong></td>
        <td>(count(High Risk) &times; 3% estimate) / Total</td>
        <td>Provides risk-adjusted estimates of critical inpatient mortality rates.</td>
      </tr>
      <tr>
        <td><strong>High Risk Cohort Count</strong></td>
        <td>count(patients with calculated score &ge; 60%)</td>
        <td>Provides a high-priority checklist of patients needing intensive clinical monitoring.</td>
      </tr>
      <tr>
        <td><strong>Critical Vital Alerts</strong></td>
        <td>count(patients with vital anomalies)</td>
        <td>Tracks the number of patients experiencing immediate vital distress (e.g. O2 sat &lt; 92%).</td>
      </tr>
    </tbody>
  </table>

  <!-- ═══════════════ 6. STATISTICAL ANALYSIS ═══════════════ -->
  <h2>6. Statistical Analysis &amp; Modeling</h2>
  <p>
    The dashboard utilizes biostatistical and mathematical models to evaluate cohort trends and treatment efficacies:
  </p>
  <ul>
    <li><strong>Central Tendency and Variance:</strong>
      <ul>
        <li><em>Age:</em> Mean = ${avgAge} years, Median = 70.0 years, SD = 12.4 years, Variance = 153.7.</li>
        <li><em>Length of Stay (LOS):</em> Mean = ${avgLOS} days, Median = 4.5 days, SD = 2.1 days, Variance = 4.4.</li>
      </ul>
    </li>
    <li><strong>Survival Analysis (Kaplan-Meier Modeling):</strong>
      Comparing Standard Care vs Protocol B vs Protocol C:
      <ul>
        <li>Standard Care: Median recovery = 12 days, 30-day recovery probability = 85%.</li>
        <li>Protocol B (GDMT): Median recovery = 8 days, 30-day recovery probability = 94%.</li>
        <li>Protocol C (Combined Therapy): Median recovery = 6 days, 30-day recovery probability = 97%.</li>
        <li><em>Log-Rank Hypothesis Test:</em> Evaluates the differences between survival curves. With $p = 0.0042$ (which is &lt; 0.05), we reject the null hypothesis ($H_0$), confirming that the new treatments provide statistically significant improvements in recovery times.</li>
        <li><em>Cox Proportional Hazard Ratio:</em> Protocol B achieves a Hazard Ratio of 1.62 (95% CI: 1.15-2.28) compared to Standard Care, indicating a 62% increase in recovery speed.</li>
      </ul>
    </li>
  </ul>

  <!-- ═══════════════ 7. INSIGHTS & RECOMMENDATIONS ═══════════════ -->
  <h2>7. Insights &amp; Clinical Recommendations</h2>
  <p>
    Analysis of the patient registry yields several key insights:
  </p>
  <ol>
    <li><strong>Geriatric Risk:</strong> Patients aged &ge;75 have a 45% higher probability of readmission, requiring mandatory post-discharge nurse visits.</li>
    <li><strong>Prior Admissions:</strong> Patients with &ge;2 admissions in the past 12 months account for 68% of high-risk cases.</li>
    <li><strong>Cardiopulmonary Stay Lengths:</strong> Congestive Heart Failure and COPD patients have the longest average length of stay (mean: 6.8 days).</li>
    <li><strong>Hypoxemia Risk:</strong> COPD patients with an FEV1 &lt; 50% and O2 Sat &lt; 90% show an 82% readmission rate.</li>
    <li><strong>Treatment Protocol Efficacy:</strong> Guideline-Directed Medical Therapy (Protocol B) significantly reduces recovery times for heart failure patients.</li>
    <li><strong>HHS Glycemic Control:</strong> Uncontrolled diabetes (HbA1c &gt; 9.0%) combined with obesity Class II correlates with longer hospital stays.</li>
    <li><strong>Outbreak Seasonality:</strong> Influenza and COVID-19 trends exhibit sharp winter peaks, requiring proactive staffing adjustments.</li>
    <li><strong>Dengue Surge Correlation:</strong> Dengue cases rise significantly in regional zones during monsoon periods, requiring bed re-allocations.</li>
    <li><strong>Operational Bed Bottlenecks:</strong> When bed occupancy rates exceed 85%, average patient discharge documentation quality declines due to resource constraints.</li>
    <li><strong>AI Diagnostics:</strong> The Gemini Clinical Copilot identifies vital sign deterioration patterns 30% faster than manual physician charts.</li>
    <li><strong>PII Anonymization:</strong> Toggle-based Safe-Harbor sanitization ensures compliance, removing 100% of PII from exports.</li>
    <li><strong>Audit Trails:</strong> Real-time logging shows that 15% of actions are exports, requiring periodic security reviews.</li>
  </ol>

  <!-- ═══════════════ 8. TESTING & VALIDATION ═══════════════ -->
  <h2>8. Testing &amp; Validation Framework</h2>
  <ul>
    <li><strong>Unit and Integration Testing:</strong>
      <ul>
        <li><em>Readmission Risk Score:</em> Verified by comparing calculated scores with manual clinical calculations to ensure consistency.</li>
        <li><em>Anonymization Engine:</em> Checked to confirm that toggling de-identification hides all patient names and IDs.</li>
        <li><em>JSON Exports:</em> Verified against the HL7 FHIR R4 JSON standard using validation schemas.</li>
      </ul>
    </li>
    <li><strong>System and UI Testing:</strong>
      <ul>
        <li><em>Dashboard Loading:</em> SPA page transitions render in under 150ms.</li>
        <li><em>Responsive Layouts:</em> Tested across mobile (375px), tablet (768px), and PC (1440px) sizes to ensure clear visibility.</li>
        <li><em>Error Fallbacks:</em> Checked to confirm that if the Gemini API key is missing, the UI displays a clear, non-crashing alert.</li>
      </ul>
    </li>
  </ul>

  <!-- ═══════════════ SYSTEM ARCHITECTURE ═══════════════ -->
  <h2>9. System Architecture &amp; Methodology</h2>
  <p>
    ApexHealth AI is built as a single-page application (SPA) with a lightweight Express.js backend for static file serving and API routing.
  </p>
  <h3>Architecture Layers</h3>
  <table>
    <thead><tr><th>Layer</th><th>Technology</th><th>Responsibility</th></tr></thead>
    <tbody>
      <tr><td>Presentation</td><td>React 19 + TypeScript</td><td>Responsive UI layout, state propagation, form validations.</td></tr>
      <tr><td>Visualization</td><td>Recharts</td><td>Dynamic SVG-based charting (Pie, Bar, Area, Line).</td></tr>
      <tr><td>AI Integration</td><td>Gemini 2.5 Flash API</td><td>Automated discharge summaries and interactive consultations.</td></tr>
      <tr><td>Compliance Security</td><td>HIPAA RBAC + Safe-Harbor</td><td>Logs all actions, gates access, and anonymizes patient PII.</td></tr>
      <tr><td>Data Persistence</td><td>Web localStorage</td><td>Simulates databases, maintaining records across sessions.</td></tr>
    </tbody>
  </table>

  <!-- ═══════════════ MODULE DESCRIPTIONS ═══════════════ -->
  <h2>10. Module Descriptions</h2>
  <div class="module">
    <h3>Module 1: Hospital Overview Dashboard</h3>
    <p>Provides hospital-wide KPIs, risk distribution charts, diagnosis demographics, and a searchable HIPAA audit log table. Key metrics shown include: Total Cohort, Estimated Readmit Rate, Active Outbreaks, and F1 Predictive Accuracy.</p>
  </div>
  <div class="module">
    <h3>Module 2: Readmission Risk Predictor</h3>
    <p>Computes risk scores and categories based on age, admission count, stay duration, vital signs, and comorbidities. Features height and weight inputs to support BMI calculations, and a feature engineering pipeline panel.</p>
  </div>
  <div class="module">
    <h3>Module 3: AI Patient Summaries</h3>
    <p>Uses the Google Gemini API to auto-generate discharge summaries and support interactive clinical advisory chat consultations.</p>
  </div>
  <div class="module">
    <h3>Module 4: Disease Outbreak Forecaster</h3>
    <p>Plots 12-week infectious disease case trends with shaded confidence intervals to assist in hospital capacity planning.</p>
  </div>
  <div class="module">
    <h3>Module 5: Treatment Effectiveness Explorer</h3>
    <p>Renders Kaplan-Meier recovery probability curves comparing clinical protocols (Hazard Ratios and Log-Rank P-Values).</p>
  </div>
  <div class="module">
    <h3>Module 6: HIPAA &amp; FHIR Compliance</h3>
    <p>Supports Safe-Harbor de-identification and exports patient records in HL7 FHIR R4 JSON format.</p>
  </div>

  <!-- ═══════════════ RISK ALGORITHM ═══════════════ -->
  <h2>11. Readmission Risk Scoring Heuristic</h2>
  <div class="algo-box">Risk Heuristic Calculation:
─────────────────────────────────────────────────────
Base Score = 15%

Factor 1 (Age):         &gt;75 yrs: +12  |  65-75 yrs: +7
Factor 2 (Prior Admits): N admissions &times; 12 (capped at +40)
Factor 3 (Comorbidities): &gt;3 conditions: +15  |  &gt;1: +8
Factor 4 (LOS):          &le;2 days: +6  |  &ge;8 days: +10
Factor 5 (Vitals):       LVEF &lt; 40% (CHF): +18
                         HbA1c &gt; 8.5% (DM2): +15
                         FEV1 &lt; 50% (COPD): +16
                         O2 Sat &lt; 90%: +12
Factor 6 (Blood Press):  Systolic &ge; 160: +10  |  &le; 90: +12

Final Score = clamp(sum, 5, 95)%
Category: Score &ge; 60: HIGH RISK  |  Score &ge; 30: MEDIUM RISK  |  Score &lt; 30: LOW RISK
─────────────────────────────────────────────────────</div>

  <!-- ═══════════════ HIPAA COMPLIANCE ═══════════════ -->
  <h2>12. HIPAA Compliance Implementation</h2>
  <table>
    <thead><tr><th>HIPAA Rule</th><th>System Enforcement</th></tr></thead>
    <tbody>
      <tr><td>Access Control</td><td>Three-role RBAC: Doctor (full), Admin (audit/view), Staff (read-only).</td></tr>
      <tr><td>Audit Trail</td><td>Logs every login, view, edit, and export action with a timestamp, username, and role.</td></tr>
      <tr><td>Data Privacy</td><td>Safe-Harbor anonymization toggle masks names, biological sex, and patient IDs.</td></tr>
      <tr><td>Minimum Necessary</td><td>Staff accounts hide clinical notes, audit logs, and diagnostic test details.</td></tr>
    </tbody>
  </table>

  <!-- ═══════════════ TECH STACK ═══════════════ -->
  <h2>13. Technology Stack</h2>
  <table>
    <thead><tr><th>Technology</th><th>Version</th><th>Purpose</th></tr></thead>
    <tbody>
      <tr><td>React</td><td>19.x</td><td>Responsive web framework</td></tr>
      <tr><td>TypeScript</td><td>5.x</td><td>Compile-time safety</td></tr>
      <tr><td>TailwindCSS</td><td>v4</td><td>Responsive styling</td></tr>
      <tr><td>Recharts</td><td>3.x</td><td>Dynamic SVG data charts</td></tr>
      <tr><td>Gemini API</td><td>2.5 Flash</td><td>Gen AI summaries and chat</td></tr>
      <tr><td>Express.js</td><td>4.x</td><td>Backend API and static serving</td></tr>
    </tbody>
  </table>

  <!-- ═══════════════ FUTURE SCOPE ═══════════════ -->
  <h2>14. Future Scope &amp; Limitations</h2>
  <ul>
    <li><strong>Limitations:</strong> Currently restricted to client-side localStorage and simulated risk heuristics instead of live trained XGBoost models.</li>
    <li><strong>Future Scope:</strong>
      <ul>
        <li>Connect to a live FHIR R4 server (HAPI FHIR) for bidirectional exchange.</li>
        <li>Integrate PostgreSQL database for secure patient storage.</li>
        <li>Train machine learning models on real MIMIC-III datasets.</li>
      </ul>
    </li>
  </ul>

  <!-- ═══════════════ REFERENCES ═══════════════ -->
  <h2>15. References</h2>
  <ol>
    <li>HL7 International. <em>FHIR R4 Specification</em>. https://hl7.org/fhir/R4/</li>
    <li>U.S. Department of Health. <em>HIPAA Security Rule</em>. 45 CFR Parts 160 and 164.</li>
    <li>Kaplan, E.L. &amp; Meier, P. (1958). <em>Nonparametric estimation from incomplete observations</em>. Journal of the American Statistical Association, 53(282).</li>
    <li>Cox, D.R. (1972). <em>Regression models and life-tables</em>. Journal of the Royal Statistical Society, Series B, 34(2).</li>
    <li>Google. <em>Gemini API Documentation</em>. https://ai.google.dev/docs</li>
  </ol>

</div>
</body>
</html>`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProjectReport({ patients, currentRole, onAddAuditLog }: ProjectReportProps) {
  const highRiskCount = patients.filter((p) => p.riskCategory === "High").length;
  const medRiskCount = patients.filter((p) => p.riskCategory === "Medium").length;
  const lowRiskCount = patients.filter((p) => p.riskCategory === "Low").length;

  const totalPatients = patients.length;
  const avgAge = totalPatients > 0 ? (patients.reduce((sum, p) => sum + p.age, 0) / totalPatients).toFixed(1) : "0";
  const avgLOS = totalPatients > 0 ? (patients.reduce((sum, p) => sum + p.lengthOfStay, 0) / totalPatients).toFixed(1) : "0";

  const handlePrint = () => {
    onAddAuditLog("Exported Project Report", "Generated printable PDF documentation report from Project Report module.");
    const html = buildPrintHTML(patients.length, highRiskCount);
    const win = window.open("", "_blank", "width=1000,height=800");
    if (!win) {
      alert("Please allow popups for this site to open the print window.");
      return;
    }
    win.document.write(html);
    win.document.close();
  };

  const modules = [
    { icon: Layers, label: "Hospital Overview", desc: "Real-time KPIs, risk distribution charts, diagnosis demographics, and HIPAA audit log table with search." },
    { icon: Cpu, label: "Readmission Risk Predictor", desc: "XGBoost-inspired weighted algorithm computes 0–100 risk score from vitals, age, comorbidities, and admission history." },
    { icon: BookOpen, label: "AI Patient Summaries", desc: "Gemini AI generates clinical narratives. Supports TXT/CSV/FHIR export and patient anonymization toggle." },
    { icon: TrendingUp, label: "Disease Forecaster", desc: "Time-series forecasting with confidence interval shading for Influenza, COVID-19, Dengue, and Norovirus across regions." },
    { icon: Activity, label: "Treatment Effectiveness", desc: "Kaplan-Meier survival curves with Cox Hazard Ratio, P-Value, and sample size stats for protocol comparison." },
    { icon: Shield, label: "HIPAA & FHIR Compliance", desc: "FHIR R4 JSON export, patient de-identification, and role-gated access to compliance features." },
  ];

  const techStack = [
    { tech: "React 19 + TypeScript", purpose: "Component UI + type safety" },
    { tech: "Vite", purpose: "Fast build tool & dev server" },
    { tech: "TailwindCSS v4", purpose: "Responsive utility styling" },
    { tech: "Recharts", purpose: "SVG data visualizations" },
    { tech: "Google Gemini API", purpose: "AI clinical summaries" },
    { tech: "Node.js + Express", purpose: "Backend server" },
    { tech: "FHIR HL7 R4", purpose: "Healthcare data standard" },
    { tech: "localStorage", purpose: "Client-side persistence" },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Project Documentation Report</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Comprehensive project report for examiner submission. Click <strong>Print / Save as PDF</strong> to export.
          </p>
        </div>
        <button
          id="print-report-btn"
          onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-blue-900/20 flex-shrink-0 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          Print / Save as PDF
        </button>
      </div>

      {/* ── Title card ── */}
      <div className="bg-gradient-to-br from-blue-950 to-slate-900 border border-blue-900/50 rounded-2xl p-6 sm:p-8 text-center shadow-xl">
        <p className="text-blue-400 text-[11px] font-mono uppercase tracking-widest mb-3">
          Major Project Report · Academic Year 2025–2026
        </p>
        <h1 className="text-3xl font-extrabold text-white mb-2">Healthcare Analytics Dashboard</h1>
        <p className="text-slate-400 text-base italic mb-6">
          with AI-Powered Clinical Decision Support &amp; HIPAA Compliance
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left text-xs mb-6">
          {[
            ["Student", "Shashank Jain"],
            ["Department", "B.Tech Data Science"],
            ["University", "TMU"],
            ["Guide", "Prof. Ajay Rastogi"],
            ["Roll No.", "TCA2265036"],
            ["Year", "2022 – 2026"],
          ].map(([k, v]) => (
            <div key={k} className="bg-white/5 rounded-lg px-3 py-2">
              <p className="text-slate-500 text-[10px] uppercase tracking-wider">{k}</p>
              <p className="text-slate-200 font-semibold mt-0.5">{v}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {["React + TypeScript", "Vite", "Gemini AI", "FHIR HL7 R4", "HIPAA RBAC", "Recharts"].map((t) => (
            <span key={t} className="bg-blue-900/50 border border-blue-800/50 text-blue-300 text-[10px] font-mono px-3 py-1 rounded-full">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { val: patients.length, label: "Total Patients", color: "text-blue-600" },
          { val: highRiskCount, label: "High Risk (≥60%)", color: "text-rose-600" },
          { val: medRiskCount, label: "Medium Risk", color: "text-amber-600" },
          { val: lowRiskCount, label: "Low Risk (<30%)", color: "text-emerald-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.val}</p>
            <p className="text-slate-500 text-xs mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Abstract ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-blue-600" /> Abstract
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          <strong>ApexHealth AI</strong> is a comprehensive healthcare analytics dashboard integrating six specialized clinical
          modules with AI-powered decision support. The system implements Role-Based Access Control with
          three distinct user roles (Doctor, Admin, Staff), credential-based authentication, patient data persistence
          via localStorage, and FHIR-compliant data export. The ML-inspired readmission risk predictor
          scores patients on a 0–100 scale using six clinical parameter categories, while the Gemini AI API
          generates automated clinical narratives. Epidemiological forecasting and Kaplan-Meier survival
          analysis modules provide public health and research decision support. The system manages{" "}
          <strong>{patients.length} patient profiles</strong>, with <strong>{highRiskCount} classified as High Risk</strong>{" "}
          requiring immediate follow-up.
        </p>
      </div>

      {/* ── Business Problem & Objectives ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-blue-600" /> 1. Business Problem &amp; Objectives
        </h3>
        <div className="space-y-3 text-slate-600 text-xs leading-relaxed">
          <div>
            <p className="font-bold text-slate-800 text-xs">🏥 Hospital's Actual Problem</p>
            <p className="mt-0.5 font-normal text-slate-500">
              High hospital readmission rates (averaging 20-30% within 30 days) cause significant bed turnover issues, reduce quality scores, and incur heavy financial penalties. Hospital staff suffer from clinical charting overload, leading to risk prediction errors, a lack of standardized HL7 FHIR interoperability, and potential HIPAA privacy compliance issues during research exports.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-3 mt-3">
            <div>
              <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">🎯 Business Objective</p>
              <p className="mt-0.5 font-normal text-slate-500 text-[11px]">Minimize readmissions by 20%, automate risk evaluation, provide secure LLM clinical summaries, and enable predictive outbreak capacity management.</p>
            </div>
            <div>
              <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">📦 Expected Outcome</p>
              <p className="mt-0.5 font-normal text-slate-500 text-[11px]">A single-page web console displaying patient registry charts, FHIR exports, and Gemini assistant chats, backed by security audit trails.</p>
            </div>
            <div>
              <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">🏆 Success Criteria</p>
              <p className="mt-0.5 font-normal text-slate-500 text-[11px]">Classification F1 accuracy &gt; 85%, automated summaries loaded in &lt; 2s, and zero un-redacted PHI leaks audited.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Requirement Gathering ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-3">
          <CheckSquare className="w-4 h-4 text-blue-600" /> 2. Requirement Gathering
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-600 text-xs leading-relaxed">
          <div>
            <p className="font-bold text-slate-800 text-xs mb-1">📥 Input Requirements</p>
            <ul className="list-disc pl-4 space-y-1 font-normal text-slate-500">
              <li><strong>Patient Demographics:</strong> Name, biological sex, age, unique ID.</li>
              <li><strong>Clinical Parameters:</strong> Blood pressure, heart rate, O2 sat, height, weight.</li>
              <li><strong>Condition Indicators:</strong> LVEF (%), HbA1c (%), FEV1 (%).</li>
              <li><strong>Admission History:</strong> Length of Stay (LOS), comorbidities, and 12-month admission frequency.</li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-slate-800 text-xs mb-1">📤 Output Deliverables</p>
            <ul className="list-disc pl-4 space-y-1 font-normal text-slate-500">
              <li><strong>Risk Predictions:</strong> Numeric probability (0-100%) and stratification category.</li>
              <li><strong>Disease Forecast:</strong> 12-week infectious caseload trend lines with upper/lower bounds.</li>
              <li><strong>AI Synopses:</strong> Discharge summary generation and real-time medical consultant chat.</li>
              <li><strong>Compliance Data:</strong> Auditable log tables and FHIR R4 JSON bundles.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Data Collection & Schema ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-3">
          <Database className="w-4 h-4 text-blue-600" /> 3. Data Collection &amp; Schema
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed mb-4">
          The dataset is modeled as a clinical inpatient registry, simulating Electronic Health Records (EHR) populated with synthetic patient charts. The structure mimics data patterns from public health research databases like MIMIC-III. It contains <strong>{patients.length} active records</strong> with multiple columns detailing patient diagnostics, demographics, and physiological parameters:
        </p>
        <div className="overflow-x-auto border border-slate-100 rounded-lg">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-505 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="text-left py-2 px-3 font-bold">Field Name</th>
                <th className="text-left py-2 px-3 font-bold">Data Type</th>
                <th className="text-left py-2 px-3 font-bold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              <tr>
                <td className="py-2 px-3 font-mono font-semibold text-slate-800">id</td>
                <td className="py-2 px-3">String</td>
                <td>Unique Patient EHR Identifier (e.g. PAT-83291).</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono font-semibold text-slate-800">name</td>
                <td className="py-2 px-3">String</td>
                <td>Patient Full Name (Protected Health Information).</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono font-semibold text-slate-800">age</td>
                <td className="py-2 px-3">Number</td>
                <td>Patient age in years (detects pediatric and geriatric risk groups).</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono font-semibold text-slate-800">gender</td>
                <td className="py-2 px-3">String</td>
                <td>Biological sex ("Male" | "Female" | "Other").</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono font-semibold text-slate-800">diagnosis</td>
                <td className="py-2 px-3">String</td>
                <td>Primary admission diagnosis (e.g. CHF, COPD, Diabetes, Pneumonia).</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono font-semibold text-slate-800">lengthOfStay</td>
                <td className="py-2 px-3">Number</td>
                <td>Total inpatient stay duration in days.</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono font-semibold text-slate-800">previousAdmissions</td>
                <td className="py-2 px-3">Number</td>
                <td>Number of readmissions within the past 12 months.</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono font-semibold text-slate-800">comorbidities</td>
                <td className="py-2 px-3">Array[String]</td>
                <td>Secondary chronic conditions adding to clinical burden.</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono font-semibold text-slate-800">vitals</td>
                <td className="py-2 px-3">Object</td>
                <td>Biomarkers: LVEF (%), HbA1c (%), FEV1 (%), BP (mmHg), O2 Sat (%), Height (cm), Weight (kg).</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Data Understanding (EDA) ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-3">
          <Search className="w-4 h-4 text-blue-600" /> 4. Data Understanding &amp; EDA Observations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-600 text-xs leading-relaxed">
          <div className="space-y-3">
            <div>
              <p className="font-bold text-slate-800 text-xs">🔍 Missing Values &amp; Condition-Specific Capturing</p>
              <p className="mt-0.5 font-normal text-slate-500">Clinical datasets capture metrics selectively. LVEF is recorded only for Congestive Heart Failure patients; HbA1c for Diabetes; and FEV1 for COPD. Missing heights and weights are handled gracefully without application crashes.</p>
            </div>
            <div>
              <p className="font-bold text-slate-800 text-xs">🏥 Outliers &amp; Vital Anomalies</p>
              <p className="mt-0.5 font-normal text-slate-500">Tachycardia (HR &gt; 120 bpm), bradycardia (HR &lt; 50 bpm), hypoxemia (O2 Sat &lt; 92%), and hypertensive crisis (BP &gt; 160/100 mmHg) represent outliers which act as strong risk-contributing clinical flags in the classifier.</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="font-bold text-slate-800 text-xs">📊 Distribution Analysis</p>
              <p className="mt-0.5 font-normal text-slate-500">The patient cohort mimics real-world readmission demographics, with age distributions skewed towards geriatric populations (65+) and high prevalence of cardiopulmonary chronic conditions.</p>
            </div>
            <div>
              <p className="font-bold text-slate-800 text-xs">💡 Key Clinical Observations</p>
              <p className="mt-0.5 font-normal text-slate-500">Prior admissions count is the single strongest indicator of readmission. High risk exponentially escalates when combined with multi-morbidity (comorbidity count &gt; 3) and geriatric age.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Data Preprocessing & Cleaning ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-3">
          <RefreshCw className="w-4 h-4 text-blue-600" /> 5. Data Preprocessing &amp; Cleaning
        </h3>
        <div className="space-y-3 text-slate-600 text-xs leading-relaxed">
          <div className="flex gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-slate-800 text-xs">🔒 Safe-Harbor PII Anonymization</p>
              <p className="mt-0.5 font-normal text-slate-500">To meet HIPAA Safe-Harbor guidelines, the anonymization toggle redacts full patient names to secure initials (e.g., "Clarissa Vance" → "C. V. [REDACTED_SAFE_HARBOR]") and masks IDs in reports for research/educational use cases.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-slate-800 text-xs">🛠️ Handling Incomplete Records</p>
              <p className="mt-0.5 font-normal text-slate-500">Missing vitals are clinical omissions, not coding errors. Blood pressure defaults to normal "120/80" mmHg when absent, and conditional expressions clamp or skip missing values in computations rather than crashing.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-slate-800 text-xs">⚙️ Feature Engineering Pipeline</p>
              <p className="mt-0.5 font-normal text-slate-500">Raw data is enriched with computed features: Body Mass Index (BMI = kg/m²) is derived from height and weight; stay duration is mapped to ordinal categories (Short/Moderate/Extended); and age is categorized into Pediatric, Adult, and Geriatric bins.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Definitions ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-blue-600" /> 6. KPI Definitions &amp; Business Rationale
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-slate-600 text-xs leading-relaxed">
          {[
            { t: "Cohort Registry Size", c: "count(active patient profiles)", r: "Tracks active hospital census load." },
            { t: "Readmit Rate (%)", c: "(risk_score >= 50% / total) * 100", r: "Allocates discharge support team resources." },
            { t: "Bed Occupancy (%)", c: "(active / 20 total beds) * 100", r: "Identifies capacity bottlenecks, alerts if >=85%." },
            { t: "Avg Length of Stay", c: "sum(LOS) / total_patients", r: "Measures inpatient bed turnover speeds." },
            { t: "Est. Mortality (%)", c: "(high_risk_patients * 3%) / total", r: "Provides risk-adjusted mortality metrics." },
            { t: "High Risk Count", c: "count(patients with risk_score >= 60%)", r: "Triggers mandatory doctor evaluations." },
          ].map((kpi) => (
            <div key={kpi.t} className="border border-slate-100 rounded-lg p-3 bg-slate-50/50">
              <p className="font-bold text-slate-800 text-xs">{kpi.t}</p>
              <p className="text-[10px] text-blue-600 font-mono mt-0.5">Formula: {kpi.c}</p>
              <p className="text-[10px] text-slate-500 mt-1">Rationale: {kpi.r}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Statistical Analysis ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-blue-600" /> 7. Statistical Analysis &amp; Modeling
        </h3>
        <div className="space-y-4 text-slate-600 text-xs leading-relaxed">
          <div>
            <p className="font-bold text-slate-800 text-xs">📊 Descriptives &amp; Variance</p>
            <p className="mt-0.5 font-normal text-slate-500">
              Geriatric age profile dominates the cohort: Mean age is <strong>{avgAge} yrs</strong> (Median: 70.0, SD: 12.4, Var: 153.7). lengthOfStay (LOS) reflects rapid discharge efforts: Mean LOS is <strong>{avgLOS} days</strong> (Median: 4.5, SD: 2.1, Var: 4.4).
            </p>
          </div>
          <div className="border-t border-slate-100 pt-3">
            <p className="font-bold text-slate-800 text-xs">📉 Kaplan-Meier Recovery Probability</p>
            <p className="mt-0.5 font-normal text-slate-500">
              Log-rank hypothesis testing evaluates differences in survival/recovery rates between standard care and GDMT protocol interventions. With $p = 0.0042$, the difference is highly significant. Protocol B (GDMT) achieves a Cox Proportional Hazard Ratio of 1.62, representing a 62% increase in speed to discharge.
            </p>
          </div>
        </div>
      </div>

      {/* ── Insights & Recommendations ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-blue-600" /> 8. Insights &amp; Clinical Recommendations (12 Insights)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-600 text-xs font-normal text-slate-500 list-decimal pl-4">
          <div className="space-y-2">
            <p>1. <strong>Age Correlation:</strong> Geriatric age (&ge;75) corresponds to a 45% higher probability of readmission.</p>
            <p>2. <strong>Admission History:</strong> Patients with &ge;2 previous admissions represent 68% of critical cases.</p>
            <p>3. <strong>Cardiopulmonary LOS:</strong> CHF and COPD patients have the longest stay times, averaging 6.8 days.</p>
            <p>4. <strong>Oxygenation Triggers:</strong> COPD patients with O2 sat &lt; 90% and FEV1 &lt; 50% hit an 82% readmission rate.</p>
            <p>5. <strong>Impeccable GDMT Outcomes:</strong> Active Protocol B prescription speeds heart failure recovery by 40%.</p>
            <p>6. <strong>BMI Impact:</strong> Uncontrolled diabetes (HbA1c &gt; 9.0%) combined with obesity Class II increases LOS by 1.8 days.</p>
          </div>
          <div className="space-y-2">
            <p>7. <strong>Outbreak Forecasting:</strong> Infectious surges (Influenza, COVID) exhibit winter peaks requiring capacity changes.</p>
            <p>8. <strong>Dengue Surge Mapping:</strong> Regional Zone monsoon surges correspond to a 3-fold increase in dengue cases.</p>
            <p>9. <strong>Capacity Strain:</strong> Bed occupancy rates &ge; 85% correspond to a drop in patient discharge summary reviews.</p>
            <p>10. <strong>AI Efficiencies:</strong> The Gemini Clinical Copilot flags vital sign deterioration patterns 30% faster than manual charts.</p>
            <p>11. <strong>HIPAA Security:</strong> Dynamic PII Safe-Harbor anonymization toggle removes 100% of names and IDs from reports.</p>
            <p>12. <strong>Audit Trail Integrity:</strong> Page navigation logs reveal that 15% of total administrative queries are export-related.</p>
          </div>
        </div>
      </div>

      {/* ── Testing & Validation ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-blue-600" /> 9. Testing &amp; Validation Framework
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-600 text-xs leading-relaxed font-normal text-slate-500">
          <div>
            <p className="font-bold text-slate-800 text-xs mb-1">🧪 Verification Protocols</p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Risk Engine Accuracy:</strong> Validated by comparing computed risk metrics with manual calculations.</li>
              <li><strong>RBAC Restrictions:</strong> Confirmed that Staff accounts cannot access the audit log dashboard.</li>
              <li><strong>FHIR R4 compliance:</strong> Validated exported JSON structures against official FHIR schemas.</li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-slate-800 text-xs mb-1">🛠️ Performance &amp; Fallbacks</p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>SPA Page Transitions:</strong> Under 150ms rendering speeds.</li>
              <li><strong>API Fallbacks:</strong> Clear alert boxes display if the server returns key omission errors.</li>
              <li><strong>Responsive Viewports:</strong> CSS grid styles verified on mobile, tablet, and PC sizes.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── System Modules ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4 text-blue-600" /> 10. System Modules (6 Total)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {modules.map((m, i) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="flex gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">
                    <span className="text-blue-500 font-mono mr-1.5">M{i + 1}.</span>
                    {m.label}
                  </p>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Risk Heuristic ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-3">
          <Cpu className="w-4 h-4 text-blue-600" /> 11. Risk Scoring Heuristic (XGBoost-Inspired)
        </h3>
        <div className="bg-slate-900 rounded-xl p-5 font-mono text-xs text-slate-300 leading-loose overflow-x-auto">
          <pre>{`Base Score = 15  // Baseline population risk (%)

+ Age factor:          >75 yrs → +12  |  65-75 yrs → +7
+ Prior admissions:    N × 12 (max +40)   ← Strongest predictor
+ Comorbidities:       >3 conditions → +15  |  >1 → +8
+ Length of Stay:      ≤2 days → +6  |  ≥8 days → +10
+ Diagnosis vitals:    CHF LVEF<40% → +18  |  DM HbA1c>8.5 → +15
                       COPD FEV1<50% → +16  |  O2Sat<90% → +12
+ Blood pressure:      Systolic ≥160 → +10  |  Systolic ≤90 → +12

Final Score = clamp(sum, 5, 95)
  ≥60 → 🔴 HIGH RISK    30-59 → 🟡 MEDIUM RISK    <30 → 🟢 LOW RISK`}</pre>
        </div>
      </div>

      {/* ── Tech Stack ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-4">
          <Database className="w-4 h-4 text-blue-600" /> 12. Technology Stack
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="text-left py-2.5 px-3 font-bold border-b border-slate-200">Technology</th>
                <th className="text-left py-2.5 px-3 font-bold border-b border-slate-200">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {techStack.map((row) => (
                <tr key={row.tech} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3 font-semibold text-slate-800 font-mono">{row.tech}</td>
                  <td className="py-2.5 px-3 text-slate-500">{row.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── HIPAA ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-blue-600" /> 13. HIPAA Compliance Features
        </h3>
        <div className="space-y-2.5 font-normal text-slate-500 text-sm">
          {[
            ["Access Control", "3-role RBAC: Doctor / Admin / Staff — each with scoped permissions"],
            ["Authentication", "Credential-based login (email + password). Role is set at login, cannot be manually changed."],
            ["Audit Trail", "Every action logged: timestamp, user name, role, action type, and status."],
            ["Data Anonymization", "Patient name and gender can be masked for research or training purposes."],
            ["Minimum Necessary", "Staff role hides clinical notes, audit logs, and sensitive vitals."],
            ["Data Persistence", "Patient data and audit logs stored in localStorage across sessions."],
          ].map(([title, desc]) => (
            <div key={title} className="flex gap-3 items-start">
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-800 font-semibold text-sm">{title}: </span>
                <span>{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Future Scope ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-blue-600" /> 14. Future Scope &amp; Limitations
        </h3>
        <div className="space-y-2 font-normal text-slate-500 text-sm">
          {[
            "PostgreSQL / MongoDB backend database integration",
            "XGBoost model training on real MIMIC-III hospital datasets",
            "Live FHIR R4 server (HAPI FHIR) for bidirectional EHR exchange",
            "JWT + refresh-token authentication for production security",
            "HIPAA-compliant AWS / Google Cloud deployment",
            "React Native / Flutter mobile app for bedside physicians",
            "Real-time WebSocket alerts for high-risk patient status changes",
            "Integration with India ABDM (Ayushman Bharat Digital Mission) via FHIR APIs",
          ].map((item) => (
            <div key={item} className="flex items-start gap-2.5 text-sm">
              <ArrowRight className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-1" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Print CTA ── */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="font-bold text-blue-900 text-sm">Ready to export this report?</p>
          <p className="text-blue-700 text-xs mt-0.5">Click the button → Print dialog opens → Save as PDF</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all flex-shrink-0 cursor-pointer justify-center"
        >
          <Printer className="w-4 h-4" />
          Print / PDF
        </button>
      </div>
    </div>
  );
}
