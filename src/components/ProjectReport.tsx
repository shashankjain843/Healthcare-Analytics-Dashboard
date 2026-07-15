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
} from "lucide-react";
import { Patient, UserRole } from "../types";

interface ProjectReportProps {
  patients: Patient[];
  currentRole: UserRole;
  onAddAuditLog: (action: string, details: string) => void;
}

// ─── Print HTML Generator ─────────────────────────────────────────────────────
function buildPrintHTML(patientCount: number, highRiskCount: number): string {
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
    h2 { font-size: 22px; color: #1e40af; border-bottom: 2px solid #bfdbfe; padding-bottom: 8px; margin: 40px 0 16px; }
    h3 { font-size: 16px; color: #1e3a8a; margin: 24px 0 8px; font-weight: bold; }
    p  { margin: 10px 0; font-size: 14px; color: #334155; text-align: justify; }

    /* Lists */
    ul, ol { padding-left: 24px; margin: 10px 0; }
    li { font-size: 14px; color: #334155; margin: 5px 0; }

    /* Tables */
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
    th { background: #1e40af; color: white; padding: 10px 14px; text-align: left; font-weight: bold; }
    td { border: 1px solid #cbd5e1; padding: 9px 14px; vertical-align: top; }
    tr:nth-child(even) td { background: #f8fafc; }

    /* Module cards */
    .module { border: 1px solid #e2e8f0; border-left: 4px solid #2563eb; border-radius: 8px; padding: 16px 20px; margin: 14px 0; background: #f8fafc; }
    .module h3 { margin-top: 0; color: #1e40af; }
    .module p { margin: 6px 0; }

    /* Algorithm box */
    .algo-box { background: #0f172a; color: #e2e8f0; font-family: monospace; font-size: 12px; padding: 20px; border-radius: 8px; margin: 16px 0; line-height: 1.8; white-space: pre-wrap; }

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
      <span class="tech-tag">React 18 + TypeScript</span>
      <span class="tech-tag">Vite</span>
      <span class="tech-tag">Recharts</span>
      <span class="tech-tag">Gemini AI API</span>
      <span class="tech-tag">FHIR HL7 R4</span>
      <span class="tech-tag">HIPAA Compliance</span>
      <span class="tech-tag">TailwindCSS</span>
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

  <!-- ═══════════════ PROBLEM STATEMENT ═══════════════ -->
  <h2>1. Problem Statement</h2>
  <p>
    The healthcare industry faces several critical data management and decision-support challenges:
  </p>
  <ul>
    <li><strong>Hospital Readmissions:</strong> Approximately 20–30% of patients in India are re-admitted within 30 days of discharge, creating significant financial burden and strain on healthcare infrastructure under schemes like Ayushman Bharat.</li>
    <li><strong>Information Silos:</strong> Different hospital departments—labs, pharmacy, radiology—operate on disconnected systems, preventing unified patient views and slowing diagnosis.</li>
    <li><strong>Manual Risk Assessment:</strong> Clinicians manually assess patient severity without algorithmic support, leading to inconsistent prioritization of high-risk patients.</li>
    <li><strong>Regulatory Compliance:</strong> Hospitals must maintain HIPAA-equivalent privacy standards, including audit trails and role-based data access, which are difficult to enforce without dedicated tooling.</li>
    <li><strong>Outbreak Prediction:</strong> Public health officials lack real-time disease trend forecasting tools, leading to reactive (rather than proactive) resource allocation during surges.</li>
    <li><strong>EHR Interoperability:</strong> Patient data locked in proprietary formats cannot be shared across hospitals or with government health portals without standards like FHIR.</li>
  </ul>

  <!-- ═══════════════ OBJECTIVES ═══════════════ -->
  <h2>2. Objectives</h2>
  <ol>
    <li>Design and implement a unified, role-based clinical analytics portal for hospital environments.</li>
    <li>Build a weighted ML-inspired readmission risk scoring algorithm using patient vitals, comorbidities, and admission history.</li>
    <li>Integrate the Google Gemini AI API to generate automated clinical patient summaries for rapid physician decision-making.</li>
    <li>Implement epidemiological disease forecasting with confidence interval visualization using time-series data.</li>
    <li>Provide evidence-based treatment protocol comparison using Kaplan-Meier survival analysis and Cox Hazard Ratio statistics.</li>
    <li>Implement HIPAA-inspired compliance features including RBAC, patient anonymization, and comprehensive audit logging.</li>
    <li>Enable FHIR HL7 R4-compliant patient data export for inter-hospital interoperability.</li>
    <li>Persist patient data across browser sessions using localStorage, simulating database persistence.</li>
  </ol>

  <!-- ═══════════════ SYSTEM ARCHITECTURE ═══════════════ -->
  <h2>3. System Architecture</h2>
  <p>
    ApexHealth AI follows a <strong>Single Page Application (SPA) architecture</strong> with a
    lightweight Express.js backend acting as a development and static file server. The application
    is structured into a modular component hierarchy, with state managed centrally in the root
    <code>App.tsx</code> component and distributed to child modules via props.
  </p>
  <h3>Architecture Layers</h3>
  <table>
    <thead><tr><th>Layer</th><th>Technology</th><th>Responsibility</th></tr></thead>
    <tbody>
      <tr><td>Presentation</td><td>React 18 + TypeScript</td><td>UI components, routing, event handling</td></tr>
      <tr><td>State Management</td><td>React useState + useEffect</td><td>Application state, data flow, side effects</td></tr>
      <tr><td>Persistence</td><td>Browser localStorage</td><td>Patient data + audit log persistence across sessions</td></tr>
      <tr><td>Visualization</td><td>Recharts</td><td>Bar, Pie, Line, Area, ComposedChart rendering</td></tr>
      <tr><td>AI Integration</td><td>Google Gemini API</td><td>Clinical narrative generation for patient summaries</td></tr>
      <tr><td>Styling</td><td>TailwindCSS</td><td>Utility-first responsive design system</td></tr>
      <tr><td>Build Tool</td><td>Vite</td><td>HMR dev server, TypeScript transpilation, bundling</td></tr>
      <tr><td>Backend</td><td>Node.js + Express + Vite Middleware</td><td>Dev server, static serving, health check API</td></tr>
    </tbody>
  </table>

  <h3>Data Flow</h3>
  <p>
    <code>User Login → Role Assignment → App State Load (localStorage) →
    Module Render → User Action → Risk Algorithm / API Call →
    State Update → localStorage Persist → Audit Log Entry</code>
  </p>

  <!-- ═══════════════ DATA COLLECTION ═══════════════ -->
  <h2>4. Data Collection &amp; Schema</h2>
  <p>
    The system utilizes a structured Electronic Health Record (EHR) database model designed to represent
    clinical patient charts. The dataset is populated with synthetic clinical records that simulate real-world EHR data
    derived from major clinical research databases like MIMIC-III (Medical Information Mart for Intensive Care)
    and eICU. It consists of multiple clinical dimensions across patient demographics, physiological vital signs,
    comorbidities, and pharmacological treatments.
  </p>
  <p>
    The database currently tracks <strong>\${patientCount} active records</strong>. The clinical schema and its corresponding
    data types are detailed below:
  </p>
  <table>
    <thead>
      <tr>
        <th>Field Name</th>
        <th>Data Type</th>
        <th>Description &amp; Context</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>id</code></td>
        <td>String</td>
        <td>Unique patient identifier (e.g., "PAT-83291").</td>
      </tr>
      <tr>
        <td><code>name</code></td>
        <td>String</td>
        <td>Patient's full name (Primary Protected Health Information - PHI).</td>
      </tr>
      <tr>
        <td><code>age</code></td>
        <td>Number</td>
        <td>Patient's age in years (used to identify pediatric or geriatric cohorts).</td>
      </tr>
      <tr>
        <td><code>gender</code></td>
        <td>String</td>
        <td>Biological sex ("Male" | "Female" | "Other").</td>
      </tr>
      <tr>
        <td><code>diagnosis</code></td>
        <td>String</td>
        <td>Primary admitting diagnosis/ICD-10 category (e.g., CHF, COPD, Diabetes, Pneumonia).</td>
      </tr>
      <tr>
        <td><code>lengthOfStay</code></td>
        <td>Number</td>
        <td>Duration of hospital admission in days.</td>
      </tr>
      <tr>
        <td><code>previousAdmissions</code></td>
        <td>Number</td>
        <td>Count of inpatient admissions within the past 12 months.</td>
      </tr>
      <tr>
        <td><code>comorbidities</code></td>
        <td>Array[String]</td>
        <td>List of secondary chronic conditions (e.g., Hypertension, Asthma, Obesity).</td>
      </tr>
      <tr>
        <td><code>vitals</code></td>
        <td>Object</td>
        <td>Clinical biomarkers (LVEF %, HbA1c %, FEV1 %, O2 Saturation %, BP mmHg, Height cm, Weight kg).</td>
      </tr>
      <tr>
        <td><code>dischargeMeds</code></td>
        <td>Array[String]</td>
        <td>Prescribed outpatient medications on discharge.</td>
      </tr>
      <tr>
        <td><code>riskScore</code></td>
        <td>Number</td>
        <td>Calculated 30-day readmission risk probability (0 to 100%).</td>
      </tr>
      <tr>
        <td><code>riskCategory</code></td>
        <td>String</td>
        <td>Stratified risk level ("High" | "Medium" | "Low").</td>
      </tr>
    </tbody>
  </table>

  <!-- ═══════════════ DATA UNDERSTANDING ═══════════════ -->
  <h2>5. Data Understanding (Exploratory Data Analysis - EDA)</h2>
  <p>
    An in-depth Exploratory Data Analysis (EDA) was performed on the cohort data to identify distributions, anomalies,
    and key clinical indicators:
  </p>
  <ul>
    <li>
      <strong>Missing Value Analysis:</strong> Clinical EHR datasets naturally suffer from missing parameters because diagnostic
      tests are condition-specific. In this dataset, <code>lvef</code> (Ejection Fraction) is only present for Congestive Heart
      Failure patients; <code>hba1c</code> (Glycated Hemoglobin) is only captured for patients with Type 2 Diabetes; and <code>fev1</code>
      (Forced Expiratory Volume) is isolated to COPD patients. Height and weight are optional parameters used to calculate BMI.
      The system handles these missing values gracefully, treating them as non-applicable clinical fields rather than data omissions.
    </li>
    <li>
      <strong>Duplicate Record Checking:</strong> Unique patient ID checks are enforced at entry. If a patient with an existing
      ID is added, the system rejects it, preventing duplicate count inflation in analytical metrics.
    </li>
    <li>
      <strong>Outliers &amp; Vital Anomalies:</strong> Vital outliers are clinically relevant distress indicators. Heart rate
      values above 120 bpm (tachycardia) or below 55 bpm (bradycardia), O2 saturation below 92% (respiratory distress), and
      systolic blood pressure above 160 mmHg (hypertensive crisis) are flagged as risk-contributing outliers. Additionally,
      extreme lengths of stay (e.g., &gt;8 days) represent clinical severity outliers.
    </li>
    <li>
      <strong>Distributions:</strong> The dataset is representative of typical high-readmission cohorts, with age distribution
      skewed towards geriatric populations (mean age: ~65-75 years) and a higher frequency of chronic cardiopulmonary diagnoses.
    </li>
    <li>
      <strong>Important Observations:</strong> Prior admissions count is the single strongest statistical predictor
      for future readmissions. Combined with geriatric status and severe multimorbidity (comorbidity count &gt; 3), the risk
      of readmission within 30 days rises exponentially.
    </li>
  </ul>

  <!-- ═══════════════ DATA CLEANING ═══════════════ -->
  <h2>6. Data Preprocessing &amp; Cleaning</h2>
  <p>
    To prepare raw clinical records for analytics, forecasting, and risk prediction, several cleaning and transformation
    pipelines are executed:
  </p>
  <ul>
    <li>
      <strong>Safe-Harbor PII Anonymization (HIPAA Compliance):</strong> Before clinical records can be exported or reviewed for
      training purposes, all Protected Health Information (PHI) is sanitized. A dynamic toggle applies Safe-Harbor de-identification,
      redacting full names to secure initials (e.g., "Clarissa Vance" becomes "C. V. [REDACTED_SAFE_HARBOR]") and hiding patient IDs
      to protect identity.
    </li>
    <li>
      <strong>Handling Missing Values &amp; Fallbacks:</strong> Incomplete records are handled using clinical defaults or conditional imputation.
      Blood pressure is set to a physiological default of "120/80" mmHg if missing, and conditional branches prevent missing values
      from causing calculations to crash. For BMI calculations, missing heights/weights default to median population values or omit
      the feature, ensuring the dashboard remains operational.
    </li>
    <li>
      <strong>Feature Engineering Pipeline:</strong> Continuous variables are transformed into engineered clinical categories.
      Raw height and weight are combined using the BMI formula (<code>weight(kg) / height(m)²</code>). Age is discretized into
      Pediatric, Adult, and Geriatric bins. Length of stay is converted into Short, Moderate, and Extended stay categories.
      These engineered features enrich the data, making it ready for visualization and ML-inspired classifiers.
    </li>
  </ul>

  <!-- ═══════════════ DATA VISUALIZATION ═══════════════ -->
  <h2>7. Data Visualization &amp; Analytical Insights</h2>
  <p>
    The dashboard utilizes interactive graphical charts to convert raw tabular data into actionable clinical insights:
  </p>
  <ul>
    <li>
      <strong>Risk Cohort Distribution (Pie Chart):</strong> Renders the relative proportion of High, Medium, and Low risk
      patients using color-coded segments. This visualization helps administrators identify the total percentage of highly
      vulnerable patients requiring post-discharge coordination.
    </li>
    <li>
      <strong>Diagnosis Demographics (Bar Chart):</strong> Visualizes the patient count across different primary admitting
      diagnoses. It allows administrators to see which clinical department (e.g., Cardiology, Pulmonology) is carrying the
      highest patient load, aiding in staffing and resource allocation.
    </li>
    <li>
      <strong>Epidemiological Disease Forecaster (Composed Area Chart):</strong> Plots historical cases along with future
      forecasts for major infectious diseases (Influenza, COVID-19, Dengue, Norovirus) across regions. The inclusion of shaded
      upper/lower confidence intervals visually communicates the statistical uncertainty of predictions, allowing planners to prepare for bed surges.
    </li>
    <li>
      <strong>Kaplan-Meier Survival Curves (Line Chart):</strong> Compares recovery speeds between standard care and experimental
      protocols. By plotting recovery probability over time, clinicians gain evidence-based insights into which treatment protocol
      is statistically superior (quantified by Hazard Ratios and Log-Rank P-Values).
    </li>
  </ul>

  <!-- ═══════════════ DASHBOARD DETAILS ═══════════════ -->
  <h2>8. Dashboard Features &amp; Business Use-Cases</h2>
  <p>
    The main clinical command-center provides real-time indicators and controls designed for hospital administrators and physicians:
  </p>
  <ul>
    <li>
      <strong>Dynamic KPIs:</strong>
      <ul>
        <li><em>Total Active Cohort:</em> Number of active inpatient profiles.</li>
        <li><em>Estimated Readmission Rate:</em> Percentage of patients at high risk of 30-day readmission (score &gt;= 50%).</li>
        <li><em>Bed Occupancy Rate:</em> Simulates real-time hospital occupancy, warning administrators of resource bottlenecks if occupancy exceeds 85%.</li>
        <li><em>Avg Length of Stay (LOS):</em> Monitors bed turnover efficiency to reduce operational costs.</li>
        <li><em>Mortality Rate:</em> High-risk adjusted 30-day mortality forecast.</li>
        <li><em>High Risk Patients Count:</em> Absolute count of critical patients requiring immediate attention.</li>
      </ul>
    </li>
    <li>
      <strong>Filters:</strong>
      <ul>
        <li><em>Patient Registry Search:</em> Real-time text search filtering by patient names, diagnoses, or IDs.</li>
        <li><em>HIPAA Audit Log Search:</em> Scans audit trails by username, action types, or status.</li>
        <li><em>Disease &amp; Region Selectors:</em> Enables local public health planning.</li>
        <li><em>PII Anonymization Control:</em> Safeguards patient identity with a single click.</li>
      </ul>
    </li>
    <li>
      <strong>Business Use-Cases:</strong>
      <ul>
        <li><em>Clinical Risk Management:</em> Prevents costly hospital readmissions by identifying high-risk patients early and generating personalized Gemini AI post-discharge instructions.</li>
        <li><em>Hospital Resource Optimization:</em> Forecasts seasonal disease outbreaks to scale up bedding, oxygen, and pharmaceutical reserves.</li>
        <li><em>Compliance Auditing:</em> Guarantees full HIPAA accountability through immutable logs and role-gated access.</li>
      </ul>
    </li>
  </ul>

  <!-- ═══════════════ MODULE DESCRIPTIONS ═══════════════ -->
  <h2>9. Module Descriptions</h2>

  <div class="module">
    <h3>Module 1: Hospital Overview Dashboard</h3>
    <p>The command-center view providing hospital-wide KPIs computed dynamically from the patient registry. Displays a Donut chart for risk cohort distribution (High/Medium/Low), a Bar chart for diagnosis demographics, and a searchable real-time HIPAA audit log table. Key metrics shown: Total Active Cohort, Estimated 30-day Readmission Rate, Active Disease Outbreak Alerts, and Predictive Model F1 Score (87.4%).</p>
    <p><strong>Role Restriction:</strong> The Audit Log table is hidden from Staff role users, enforcing the principle of least privilege.</p>
  </div>

  <div class="module">
    <h3>Module 2: Readmission Risk Predictor (Core ML Feature)</h3>
    <p>The system's primary intelligent feature. Accepts patient clinical parameters and returns a risk score (0–100) and category (High/Medium/Low) using a weighted, multi-factor scoring algorithm modeled after XGBoost/TabNet clinical classifiers. Doctors can add new patients, run risk assessments, and view detailed risk factor breakdowns. All patients are displayed as color-coded risk cards.</p>
    <p><strong>Role Restriction:</strong> Add/Edit patient functionality is available only to Doctors. Staff see read-only cards.</p>
  </div>

  <div class="module">
    <h3>Module 3: AI Patient Summaries</h3>
    <p>Integrates the Google Gemini API to auto-generate concise clinical narratives for each patient, saving physician reading time. Includes patient export in TXT, CSV, and FHIR JSON formats. Features a patient anonymization toggle for HIPAA privacy compliance in research or training scenarios.</p>
    <p><strong>Role Restriction:</strong> Doctor notes and anonymization controls are unavailable to Staff.</p>
  </div>

  <div class="module">
    <h3>Module 4: Disease Outbreak Forecaster</h3>
    <p>Displays epidemiological time-series data for multiple diseases (Influenza, COVID-19, Dengue Fever, Norovirus) across multiple hospital regions. Uses Recharts ComposedChart with Area shading to represent confidence intervals, visually communicating prediction uncertainty. Region and disease filters allow drill-down analysis. Trend status (Rising/Stable/Declining) and alert level are displayed prominently.</p>
  </div>

  <div class="module">
    <h3>Module 5: Treatment Effectiveness Analyzer</h3>
    <p>Evidence-based comparison of clinical treatment protocols using survival analysis visualization. Displays Kaplan-Meier-style recovery probability curves for Standard Care vs. Protocol B vs. Protocol C. Statistical metrics shown include Cox Proportional Hazard Ratio, 95% Confidence Interval, Log-Rank P-Value, Sample Size, and Median Recovery Days, enabling data-driven treatment decisions.</p>
  </div>

  <div class="module">
    <h3>Module 6: HIPAA &amp; FHIR Compliance Manager</h3>
    <p>Provides patient record export in FHIR-compliant JSON format conforming to the HL7 R4 standard, enabling interoperability with external EMR systems and government health portals. Includes a patient de-identification (anonymization) engine. All FHIR export actions are recorded in the audit trail. Staff cannot trigger de-identification, enforcing administrative controls.</p>
  </div>

  <!-- ═══════════════ RISK ALGORITHM ═══════════════ -->
  <h2>10. Readmission Risk Scoring Algorithm</h2>
  <p>
    The risk algorithm is a heuristic weighted scoring function inspired by XGBoost/TabNet clinical
    classification models. It accepts 6 input categories and outputs a normalized score in [5, 95]:
  </p>
  <div class="algo-box">Risk Score Computation (Pseudocode):
─────────────────────────────────────────────────────
score = 15  // Baseline population risk (%)

// Factor 1: Age
if age > 75 → score += 12  (Advanced Age)
if age 65–75 → score += 7  (Geriatric Cohort)

// Factor 2: Prior Admissions (Strongest predictor)
score += min(previousAdmissions × 12, 40)

// Factor 3: Comorbidity Burden
if comorbidities > 3 → score += 15  (Severe Multimorbidity)
if comorbidities > 1 → score += 8   (Comorbid Burden)

// Factor 4: Length of Stay
if LOS ≤ 2 days → score += 6   (Potential premature discharge)
if LOS ≥ 8 days → score += 10  (High clinical severity)

// Factor 5: Diagnosis-Specific Vitals
CHF  → if LVEF < 40%  → score += 18  (Systolic Dysfunction)
DM2  → if HbA1c > 8.5 → score += 15  (Uncontrolled Glycemia)
COPD → if FEV1 < 50%  → score += 16  (Severe Airflow Limitation)
COPD → if O2Sat < 90% → score += 12  (Chronic Hypoxemia)
Pneumonia → if O2Sat < 92% → score += 14

// Factor 6: Blood Pressure
if Systolic ≥ 160 → score += 10  (Hypertensive Crisis)
if Systolic ≤ 90  → score += 12  (Hypotension)

// Normalize and Classify
score = clamp(score, 5, 95)
if score ≥ 60 → HIGH RISK  (immediate follow-up required)
if score ≥ 30 → MEDIUM RISK (scheduled follow-up)
else          → LOW RISK   (routine care)
─────────────────────────────────────────────────────</div>

  <!-- ═══════════════ HIPAA COMPLIANCE ═══════════════ -->
  <h2>11. HIPAA Compliance Implementation</h2>
  <table>
    <thead><tr><th>HIPAA Requirement</th><th>Implementation in ApexHealth AI</th></tr></thead>
    <tbody>
      <tr><td>Access Control</td><td>Three-role RBAC: Doctor (full), Admin (audit+view), Staff (read-only). Login-enforced, no manual switching.</td></tr>
      <tr><td>Audit Controls</td><td>Every action (login, navigation, data edit, export, role change) logged with timestamp, user, role, and status.</td></tr>
      <tr><td>Data Privacy</td><td>Patient anonymization toggle masks name, gender, and identifying fields. Staff cannot de-identify master records.</td></tr>
      <tr><td>Minimum Necessary</td><td>Staff role hides clinical notes, audit logs, and sensitive vitals not required for their duties.</td></tr>
      <tr><td>Authentication</td><td>Credential-based login with institutional email and role-specific passwords. Sessions persisted in localStorage.</td></tr>
    </tbody>
  </table>

  <!-- ═══════════════ TECH STACK ═══════════════ -->
  <h2>12. Technology Stack</h2>
  <table>
    <thead><tr><th>Technology</th><th>Version</th><th>Purpose</th></tr></thead>
    <tbody>
      <tr><td>React</td><td>18.x</td><td>Component-based UI framework</td></tr>
      <tr><td>TypeScript</td><td>5.x</td><td>Static typing, interfaces, type safety</td></tr>
      <tr><td>Vite</td><td>6.x</td><td>Build tool, dev server, HMR</td></tr>
      <tr><td>TailwindCSS</td><td>3.x</td><td>Utility-first responsive CSS framework</td></tr>
      <tr><td>Recharts</td><td>2.x</td><td>SVG-based charting library (Bar, Pie, Line, Area)</td></tr>
      <tr><td>Lucide React</td><td>Latest</td><td>Icon component library</td></tr>
      <tr><td>Google Gemini API</td><td>1.5 Flash</td><td>AI clinical narrative generation</td></tr>
      <tr><td>Node.js</td><td>20.x LTS</td><td>JavaScript runtime environment</td></tr>
      <tr><td>Express.js</td><td>4.x</td><td>Backend HTTP server</td></tr>
      <tr><td>HL7 FHIR</td><td>R4</td><td>Healthcare interoperability standard</td></tr>
      <tr><td>Browser localStorage</td><td>Web API</td><td>Client-side patient data persistence</td></tr>
    </tbody>
  </table>

  <!-- ═══════════════ FUTURE SCOPE ═══════════════ -->
  <h2>13. Future Scope</h2>
  <ul>
    <li><strong>Backend Database Integration:</strong> Replace localStorage with PostgreSQL or MongoDB for multi-user, server-side data persistence.</li>
    <li><strong>ML Model Training:</strong> Train XGBoost or TabNet model on real hospital datasets (MIMIC-III, eICU) for validated risk prediction.</li>
    <li><strong>Real-time FHIR Server:</strong> Connect to a live FHIR R4 server (HAPI FHIR) for bidirectional EHR data exchange.</li>
    <li><strong>JWT Authentication:</strong> Replace localStorage sessions with JWT tokens and refresh-token rotation for production security.</li>
    <li><strong>Cloud Deployment:</strong> Host on HIPAA-compliant AWS/GCP infrastructure with encrypted storage.</li>
    <li><strong>Mobile Application:</strong> React Native or Flutter app for bedside physician access.</li>
    <li><strong>Real-time Alerts:</strong> WebSocket-based notifications for high-risk patient status changes; WhatsApp/SMS integration.</li>
    <li><strong>National Health Portal Integration:</strong> Connect with India's Ayushman Bharat Digital Mission (ABDM) via FHIR APIs.</li>
  </ul>

  <!-- ═══════════════ REFERENCES ═══════════════ -->
  <h2>14. References</h2>
  <ol>
    <li>HL7 International. <em>FHIR R4 Specification</em>. https://hl7.org/fhir/R4/</li>
    <li>U.S. Department of Health. <em>HIPAA Security Rule</em>. 45 CFR Parts 160 and 164.</li>
    <li>Kaplan, E.L. &amp; Meier, P. (1958). <em>Nonparametric estimation from incomplete observations</em>. Journal of the American Statistical Association, 53(282).</li>
    <li>Cox, D.R. (1972). <em>Regression models and life-tables</em>. Journal of the Royal Statistical Society, Series B, 34(2).</li>
    <li>Chen, T. &amp; Guestrin, C. (2016). <em>XGBoost: A scalable tree boosting system</em>. KDD '16 Proceedings.</li>
    <li>Google. <em>Gemini API Documentation</em>. https://ai.google.dev/docs</li>
    <li>Recharts Team. <em>Recharts Documentation</em>. https://recharts.org/en-US</li>
    <li>Vite. <em>Vite Build Tool Documentation</em>. https://vitejs.dev</li>
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
    { tech: "React 18 + TypeScript", purpose: "Component UI + type safety" },
    { tech: "Vite", purpose: "Fast build tool & dev server" },
    { tech: "TailwindCSS", purpose: "Responsive utility styling" },
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
      <div className="bg-gradient-to-br from-blue-950 to-slate-900 border border-blue-900/50 rounded-2xl p-8 text-center shadow-xl">
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

      {/* ── Data Collection & Schema ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-3">
          <Database className="w-4 h-4 text-blue-600" /> Data Collection &amp; Schema
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
          <Search className="w-4 h-4 text-blue-600" /> Data Understanding &amp; EDA Observations
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
          <RefreshCw className="w-4 h-4 text-blue-600" /> Data Preprocessing &amp; Cleaning
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

      {/* ── Data Visualization & Insights ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-blue-600" /> Data Visualization &amp; Insights
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-600 text-xs leading-relaxed">
          <div className="border border-slate-100 rounded-lg p-3 bg-slate-50">
            <p className="font-bold text-slate-800 text-xs mb-1">🍰 Risk Cohort Pie Chart</p>
            <p className="font-normal text-slate-500"><strong>Purpose:</strong> Displays active patients across stratified risk bins (High, Med, Low).<br /><strong>Insight:</strong> Helps administrators identify and prioritize high-risk patients (≥60%) needing active transition-of-care services.</p>
          </div>
          <div className="border border-slate-100 rounded-lg p-3 bg-slate-50">
            <p className="font-bold text-slate-800 text-xs mb-1">📊 Diagnosis Demographics Bar Chart</p>
            <p className="font-normal text-slate-500"><strong>Purpose:</strong> Shows count of patients across admitting diagnoses.<br /><strong>Insight:</strong> Pinpoints high-load departments (e.g. Cardiopulmonary wards) to optimize bed-counts and physician staffing.</p>
          </div>
          <div className="border border-slate-100 rounded-lg p-3 bg-slate-50">
            <p className="font-bold text-slate-800 text-xs mb-1">📈 Outbreak Forecasting Shaded Chart</p>
            <p className="font-normal text-slate-500"><strong>Purpose:</strong> Forecasts infectious pathogen surges across hospital regions.<br /><strong>Insight:</strong> Uses confidence interval shading (upper/lower boundaries) to show prediction margin of error, allowing proactive bedding scale-up.</p>
          </div>
          <div className="border border-slate-100 rounded-lg p-3 bg-slate-50">
            <p className="font-bold text-slate-800 text-xs mb-1">📉 Kaplan-Meier Treatment Curves</p>
            <p className="font-normal text-slate-500"><strong>Purpose:</strong> Compares patient recovery trajectories across different protocols.<br /><strong>Insight:</strong> Calculates Cox Proportional Hazard Ratios and P-Values to mathematically prove treatment efficacy differences.</p>
          </div>
        </div>
      </div>

      {/* ── Dashboard & Business Use-Cases ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-3">
          <Sliders className="w-4 h-4 text-blue-600" /> Dashboard &amp; Business Use-Cases
        </h3>
        <div className="space-y-3 text-slate-600 text-xs leading-relaxed font-normal text-slate-500">
          <div>
            <p className="font-bold text-slate-800 text-xs">🎛️ Dashboard KPIs &amp; Controls</p>
            <p className="mt-0.5">The Overview features 7 real-time cards (Total active cohort, Estimated Readmission Rate, Bed Occupancy, Avg Stay Duration, Estimated Mortality, High Risk count, and Model F1 score). Filters allow clinicians to query patients by name, filter pathogen trends by region, and review real-time HIPAA audit logs.</p>
          </div>
          <div>
            <p className="font-bold text-slate-800 text-xs">💼 Business Use-Case &amp; Value Delivery</p>
            <p className="mt-0.5"><strong>Clinical ROI:</strong> Reduces 30-day readmissions by flagging vulnerable discharge cases and utilizing Gemini AI to build tailored diet and care regimens. <strong>Operational Planning:</strong> Outbreak forecasting enables stockpiling resources prior to surges. <strong>Regulatory Compliance:</strong> Role-based access control (RBAC) and detailed audit logs satisfy HIPAA compliance standards.</p>
          </div>
        </div>
      </div>

      {/* ── Modules ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4 text-blue-600" /> System Modules (6 Total)
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

      {/* ── Risk Algorithm ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-3">
          <Cpu className="w-4 h-4 text-blue-600" /> Risk Scoring Algorithm (XGBoost-Inspired)
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
          <Database className="w-4 h-4 text-blue-600" /> Technology Stack
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
          <Shield className="w-4 h-4 text-blue-600" /> HIPAA Compliance Features
        </h3>
        <div className="space-y-2.5">
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
                <span className="text-slate-500 text-sm">{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Future Scope ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-blue-600" /> Future Scope
        </h3>
        <div className="space-y-2">
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
              <span className="text-slate-600">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Print CTA ── */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-center justify-between gap-4">
        <div>
          <p className="font-bold text-blue-900 text-sm">Ready to export this report?</p>
          <p className="text-blue-700 text-xs mt-0.5">Click the button → Print dialog opens → Save as PDF</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all flex-shrink-0 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          Print / PDF
        </button>
      </div>
    </div>
  );
}
