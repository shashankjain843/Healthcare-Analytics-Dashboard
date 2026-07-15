# Healthcare Analytics Dashboard (with Gemini AI Clinical Copilot)

An interactive, premium hospital analytics dashboard designed to support clinical decision-making. The application integrates advanced medical heuristics, role-based security access, interactive forecasting, and clinical AI consulting.

This project was built and audited against strict academic standards for a **B.Tech Data Science** project submission (Student: **Shashank Jain**, Roll No. **TCA2265036**, Teerthanker Mahaveer University).

---

## 🚀 Key Features & Modules

### 1. **Gemini AI Clinical Copilot**
Powered by the Google Gemini API (`gemini-2.5-flash`), this module acts as a secure server-side clinical assistant:
- **AI Clinical Summaries:** Instantly synthesizes complex patient parameters (vitals, diagnoses, comorbidities, and medications) into a structured discharge report containing key health summaries, potential risks, and post-discharge protocols.
- **Interactive Clinical Advisor Chat:** A real-time chat interface that allows doctors to consult Gemini regarding drug-drug interactions, tailored diet plans, and patient-specific vital warning signs.
- **Quick-Start Preset Prompts:** One-click shortcuts for standard clinical tasks (e.g., *Check Drug Interactions*, *Deterioration Warnings*, *Home Care & Diet Plan*).
- **Utility Actions & Export:** Export summaries directly as `.txt` files or copy them to the clipboard with visual success indicators.
- **Per-Patient Memory:** Stores generated summaries and chat histories per patient dynamically, preventing repetitive API calls.

### 2. **Hospital Overview Hub**
- **7-KPI Metrics Grid:** Renders real-time hospital parameters: *Total Active Cohort*, *Average Age*, *Estimated Readmission Rate*, *Bed Occupancy Rate* (with high occupancy alerts), *Avg Length of Stay*, *Estimated Mortality Rate*, and *High Risk Patients Count*.
- **Dynamic Charts:** Renders risk cohort distributions (Pie chart) and primary admitting diagnoses (Bar chart).
- **Clinical Insight Panels:** Shaded insight boxes that update dynamically to guide hospital administrators on bed capacities and prioritization.
- **HIPAA Audit Log Table:** A searchable, paginated compliance table logging all user actions (logins, exports, page views, edits) to maintain security compliance.
  > **Role Restriction:** The Audit Log table is hidden from Staff users, enforcing least-privilege access.

### 3. **Readmission Risk Predictor (ML Heuristic & Feature Engineering)**
- **XGBoost-Inspired Scoring Heuristic:** Computes 30-day readmission risk probabilities (0–100%) and stratifies patients into High/Medium/Low risk.
- **BMI Feature Engineering:** Captures raw height (cm) and weight (kg) to dynamically calculate Body Mass Index ($kg/m^2$).
- **Feature Engineering Pipeline Panel:** Displays real-time calculations deriving:
  - *BMI* (derived from Height/Weight)
  - *Age Group* (Pediatric, Adult, Geriatric)
  - *Stay Category* (Short, Moderate, Extended)
  - *Comorbidity Burden* (Low, Burden, Severe Multimorbidity)
  - *Avg Heart Rate* (baseline vitals)
- **Risk Cards:** Renders color-coded, expandable cards displaying patient risk metrics and factors.

### 4. **Epidemiological Disease Forecaster**
- **Time-Series Area Charts:** Projects future trends for Influenza, COVID-19, Dengue, and Norovirus.
- **Confidence Intervals:** Shades upper and lower boundaries of predicted trends, visually communicating statistical margins of error.
- **Region & Pathogen Filtering:** Drills down trends by Metropolitan Area or specific diseases.

### 5. **Treatment Effectiveness Explorer**
- **Kaplan-Meier Survival Curves:** Compares recovery rates between clinical protocols (Standard Care vs. Protocol B vs. Protocol C).
- **Research Statistics:** Computes Cox Proportional Hazard Ratios, Log-Rank test P-values, sample sizes, and median recovery days.

### 6. **Academic Project Report Module (Checklist Compliant)**
A dedicated on-screen project documentation module that generates a printable report matching TMU examiner guidelines. It includes:
* **Data Collection & Schema:** Full tabular layout of clinical records, field names, and column types.
* **Data Understanding (EDA):** In-depth analysis detailing condition-specific missing values (e.g. LVEF, HbA1c, FEV1), vital sign outlier thresholds, and distribution analysis.
* **Data Preprocessing & Cleaning:** Explanation of Safe-Harbor PII anonymization, default value imputation (e.g., BP fallbacks), and feature engineering calculations.
* **Data Visualization:** The purpose and clinical insights derived from each analytical chart.
* **Dashboard & Business Use-Cases:** Value delivery maps for clinical ROI, resource optimization, and regulatory compliance.

### 7. **FHIR R4 & HIPAA Security**
- **Safe-Harbor Anonymization Toggle:** Dynamically redacts patient names to initials (e.g. "Arthur Pendelton" -> "A. P. [REDACTED_SAFE_HARBOR]") and masks IDs throughout the UI.
- **FHIR R4 JSON Export:** Exports patient demographics, diagnostics, and vitals as standardized HL7 FHIR JSON Bundles.

---

## 🛠️ Technology Stack

- **Frontend Framework:** React 19 + TypeScript + Vite
- **Styling System:** Tailwind CSS v4 + Framer Motion (for premium UI micro-animations and transitions)
- **Visual Charts:** Recharts (SVG data visualizations)
- **Icons:** Lucide React
- **Backend Server:** Node.js + Express (serving React SPA static assets + HMR middlewares)
- **AI Integration:** Google Gen AI SDK (`@google/genai`) using the `gemini-2.5-flash` model.
- **Configuration & Security:** Dotenv (environment variable management)

---

## ⚙️ Setup & Installation

### 1. Clone & Install Dependencies
Navigate to the project root directory and install npm packages:
```bash
npm install
```

### 2. Configure Environment Variables
Create a file named `.env` in the root directory (refer to `.env.example` as a template):
```env
GEMINI_API_KEY=your_actual_gemini_api_key_from_google_ai_studio
PORT=3000
```
> **Security Reminder:** The `.env` file is excluded from Git tracking via `.gitignore` to prevent secret key leaks to public repositories. Do not commit your active `.env` file.

### 3. Run the Project
To launch both the frontend and backend server concurrently:

- **Via Batch File (Windows):**
  Simply double-click or run `start.bat` from your file explorer/terminal:
  ```cmd
  .\start.bat
  ```
- **Via Terminal Commands:**
  ```bash
  npm run dev
  ```

Open your browser and navigate to **`http://localhost:3000`** to view the dashboard.