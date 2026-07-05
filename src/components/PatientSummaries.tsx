/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  FileText, 
  Search, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  Calendar, 
  Clock, 
  User, 
  FileCheck, 
  FileSpreadsheet, 
  Clipboard, 
  ChevronRight,
  Heart,
  Thermometer,
  Percent
} from "lucide-react";
import { Patient, UserRole } from "../types";
import { calculateReadmissionRisk } from "../data";

interface PatientSummariesProps {
  patients: Patient[];
  currentRole: UserRole;
  onAddAuditLog: (action: string, details: string) => void;
  triggerNotification: (title: string, message: string, type: "success" | "info" | "warning" | "error") => void;
}

export default function PatientSummaries({
  patients,
  currentRole,
  onAddAuditLog,
  triggerNotification
}: PatientSummariesProps) {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(patients[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const activePatient = patients.find(p => p.id === selectedPatientId);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to trigger report download
  const handleExtractReport = (format: "txt" | "csv" | "fhir") => {
    if (!activePatient) return;
    
    let content = "";
    let filename = "";
    let mimeType = "text/plain";

    const timestamp = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "") + " UTC";

    if (format === "txt") {
      filename = `clinical_summary_${activePatient.id}.txt`;
      mimeType = "text/plain";
      content = `======================================================================
         APEXHEALTH CLINICAL DECISION PORTAL - DISCHARGE DOSSIER
         CONFIDENTIAL MEDICAL RECORD - RESTRICTED ACCESS (HIPAA RULES APPLY)
======================================================================

GENERATED TIMESTAMP : ${timestamp}
SIMULATED ENVIRONMENT: ApexHealth AI Sandbox Node
EHR REGISTRY RECORD : ${activePatient.id}

----------------------------------------------------------------------
1. PATIENT DEMOGRAPHICS & CLINICAL METRICS
----------------------------------------------------------------------
Patient Full Name  : ${activePatient.name}
Patient Age / Sex  : ${activePatient.age} years / ${activePatient.gender}
Admitting Diagnosis : ${activePatient.diagnosis}
Duration of Stay   : ${activePatient.lengthOfStay} Days
Index Admission    : ${activePatient.admissionDate}
Discharge Date     : ${activePatient.dischargeDate}
Prior Hospitalizations (12M): ${activePatient.previousAdmissions}

----------------------------------------------------------------------
2. RE-ESTIMATED CLINICAL BIOMARKERS
----------------------------------------------------------------------
Blood Pressure     : ${activePatient.vitals.bloodPressure || "120/80 mmHg"}
Heart Rate         : ${activePatient.vitals.heartRate || "N/A"} bpm
Oxygen Saturation  : ${activePatient.vitals.oxygenSat || "N/A"}%
HbA1c Level        : ${activePatient.vitals.hba1c || "N/A"}
LVEF Score         : ${activePatient.vitals.lvef ? `${activePatient.vitals.lvef}%` : "N/A"}
FEV1 Lung Volume   : ${activePatient.vitals.fev1 ? `${activePatient.vitals.fev1}%` : "N/A"}

----------------------------------------------------------------------
3. RISK ASSESSMENT MATRIX (30-DAY CRITICAL READMISSION WINDOW)
----------------------------------------------------------------------
Algorithmic Risk % : ${activePatient.riskScore}% Probability of Readmission
Risk Stratum Card  : ${activePatient.riskCategory.toUpperCase()} ALERT LEVEL
Comorbid Load Count: ${activePatient.comorbidities.length} chronic conditions
Chronic Diseases   : ${activePatient.comorbidities.join(", ") || "None Logged"}

----------------------------------------------------------------------
4. PRESCRIBED DISCHARGE MEDICATION THERAPY (GDMT)
----------------------------------------------------------------------
Active Prescriptions:
${activePatient.dischargeMeds.map((med, idx) => `  [${idx + 1}] ${med}`).join("\n") || "  No discharge medications prescribed."}

----------------------------------------------------------------------
5. DISCHARGE CLINICAL INSTRUCTIONS & CASEWORKER SUMMARY
----------------------------------------------------------------------
Clinical Synopsis  : ${activePatient.notes || "No acute discharge notes provided by attending physician."}

======================================================================
              END OF MEDICAL DISCHARGE RECORD REPORT
======================================================================
`;
    } else if (format === "csv") {
      filename = `patient_summary_${activePatient.id}.csv`;
      mimeType = "text/csv";
      const headers = ["Patient ID", "Name", "Age", "Gender", "Diagnosis", "LOS_Days", "Previous_Admissions", "Risk_Score", "Risk_Category", "Discharge_Date"].join(",");
      const row = [
        activePatient.id,
        `"${activePatient.name}"`,
        activePatient.age,
        activePatient.gender,
        `"${activePatient.diagnosis}"`,
        activePatient.lengthOfStay,
        activePatient.previousAdmissions,
        activePatient.riskScore,
        activePatient.riskCategory,
        activePatient.dischargeDate
      ].join(",");
      content = `${headers}\n${row}\n`;
    } else {
      filename = `fhir_record_${activePatient.id}.json`;
      mimeType = "application/json";
      const fhirResource = {
        resourceType: "Bundle",
        id: `bundle-${activePatient.id}`,
        type: "document",
        timestamp: new Date().toISOString(),
        entry: [
          {
            fullUrl: `Patient/${activePatient.id}`,
            resource: {
              resourceType: "Patient",
              id: activePatient.id,
              active: true,
              name: [{ family: activePatient.name.split(" ").pop(), given: [activePatient.name.split(" ")[0]] }],
              gender: activePatient.gender.toLowerCase()
            }
          },
          {
            fullUrl: `Observation/risk-${activePatient.id}`,
            resource: {
              resourceType: "Observation",
              id: `risk-${activePatient.id}`,
              status: "final",
              code: { text: "Rehospitalization risk probability" },
              subject: { reference: `Patient/${activePatient.id}` },
              valueQuantity: { value: activePatient.riskScore, unit: "%" }
            }
          }
        ]
      };
      content = JSON.stringify(fhirResource, null, 2);
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Audit Log & Toast Notification
    const formatLabel = format === "txt" ? "Clinical Report PDF/Text" : format === "csv" ? "Analytical CSV Record" : "Standard HL7 FHIR JSON";
    onAddAuditLog("Extracted Patient Summary", `Extracted discharge dossier of ${activePatient.name} (${activePatient.id}) in ${formatLabel} format.`);
    triggerNotification(
      "Report Extracted Successfully", 
      `Discharge dossier for ${activePatient.name} downloaded in ${format.toUpperCase()} format.`,
      "success"
    );
  };

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Patient Summaries & Reporting</h2>
          <p className="text-slate-500 text-sm">Visualize complete patient discharge profiles, check physiological health limits, and extract medical records.</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 text-blue-800 border border-blue-100 rounded-lg px-3 py-1.5 text-xs font-semibold self-start md:self-auto">
          <FileCheck className="w-4 h-4 text-blue-600" />
          Dossier Exporter Ready
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Side: Selectable Patient Index */}
        <div className="xl:col-span-4 bg-white border border-slate-200 shadow-sm rounded-xl flex flex-col h-[calc(100vh-140px)]">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70">
            <h3 className="font-bold text-slate-800 text-sm">Active Patient Dossiers</h3>
            <p className="text-[11px] text-slate-400">Search patient data files to generate analytical charts.</p>
          </div>

          {/* Search bar */}
          <div className="p-3 border-b border-slate-200 bg-slate-50">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search dossiers by name, ID, or condition..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 w-full bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Patient Index List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredPatients.length === 0 ? (
              <p className="p-8 text-center text-xs text-slate-400">No dossiers found matching query.</p>
            ) : (
              filteredPatients.map((p) => {
                const isActive = p.id === selectedPatientId;
                let riskColorBadge = "text-emerald-700 bg-emerald-50 border border-emerald-100";
                if (p.riskCategory === "High") {
                  riskColorBadge = "text-red-700 bg-red-50 border-red-100";
                } else if (p.riskCategory === "Medium") {
                  riskColorBadge = "text-amber-700 bg-amber-50 border-amber-100";
                }

                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPatientId(p.id)}
                    className={`w-full text-left p-4 transition-all flex items-center justify-between border-b border-slate-100 ${
                      isActive ? "bg-blue-50/40 border-l-4 border-blue-600" : "hover:bg-slate-50/30"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-slate-800 text-xs truncate">{p.name}</span>
                        <span className="font-mono text-[9px] text-slate-400">{p.id}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                        <span>{p.diagnosis}</span>
                        <span>•</span>
                        <span>LOS: {p.lengthOfStay}d</span>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${isActive ? "text-blue-600 translate-x-1" : ""}`} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Active Dossier & Report Exporter Hub */}
        <div className="xl:col-span-8 space-y-6">
          {activePatient ? (
            <>
              {/* Primary Patient Card */}
              <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                      {activePatient.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">{activePatient.name}</h3>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-mono text-[9px] rounded border border-slate-200">
                          {activePatient.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {activePatient.age} y/o {activePatient.gender} • Admitted: {activePatient.admissionDate} • Discharged: {activePatient.dischargeDate}
                      </p>
                    </div>
                  </div>

                  {/* Extract Options Button Hub */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:block">Extract:</span>
                    <button
                      onClick={() => handleExtractReport("txt")}
                      className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="Download full clinical formatted text dossier"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span className="hidden sm:inline">Clinical Report</span>
                    </button>
                    <button
                      onClick={() => handleExtractReport("csv")}
                      className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="Download compact analytical CSV"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="hidden sm:inline">CSV</span>
                    </button>
                    <button
                      onClick={() => handleExtractReport("fhir")}
                      className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="Download official FHIR JSON Bundle"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="hidden sm:inline">FHIR JSON</span>
                    </button>
                  </div>
                </div>

                {/* Patient Dossier Content Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Column: Diagnostics and Admissions */}
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Clinical Context</h4>
                    
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Attending Condition</span>
                        <p className="text-xs font-bold text-slate-800 mt-0.5">{activePatient.diagnosis}</p>
                      </div>
                      
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Length of Stay (Index)</span>
                        <p className="text-xs font-bold text-slate-800 mt-0.5">{activePatient.lengthOfStay} Days</p>
                      </div>

                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Previous Admissions (12M)</span>
                        <p className="text-xs font-bold text-slate-800 mt-0.5">
                          {activePatient.previousAdmissions === 0 ? "None (First Index Stay)" : `${activePatient.previousAdmissions} admissions`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Lab Indicators & Biomarkers */}
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Physiological Markers</h4>
                    
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase block flex justify-between">
                          <span>Blood Pressure</span>
                          <span className="text-[8px] font-mono text-slate-500 font-semibold">Goal: &lt;130/80</span>
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Activity className="w-3.5 h-3.5 text-rose-500" />
                          <p className="text-xs font-bold text-slate-800">{activePatient.vitals.bloodPressure || "120/80"}</p>
                          <span className="text-[9px] text-slate-400">mmHg</span>
                        </div>
                      </div>

                      {activePatient.vitals.oxygenSat && (
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase block flex justify-between">
                            <span>Oxygen Saturation</span>
                            <span className="text-[8px] font-mono text-slate-500 font-semibold">Goal: &gt;92%</span>
                          </span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Percent className="w-3.5 h-3.5 text-blue-500" />
                            <p className="text-xs font-bold text-slate-800">{activePatient.vitals.oxygenSat}%</p>
                            <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${activePatient.vitals.oxygenSat < 92 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                              {activePatient.vitals.oxygenSat < 92 ? "Hypoxemic" : "Normal"}
                            </span>
                          </div>
                        </div>
                      )}

                      {activePatient.vitals.hba1c && (
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase block flex justify-between">
                            <span>HbA1c Biomarker</span>
                            <span className="text-[8px] font-mono text-slate-500 font-semibold">Goal: &lt;7.0%</span>
                          </span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                            <p className="text-xs font-bold text-slate-800">{activePatient.vitals.hba1c}</p>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${parseFloat(activePatient.vitals.hba1c) > 8.0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                              {parseFloat(activePatient.vitals.hba1c) > 8.0 ? "Severe Glycemia" : "Controlled"}
                            </span>
                          </div>
                        </div>
                      )}

                      {activePatient.vitals.lvef && (
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase block flex justify-between">
                            <span>LVEF Fraction</span>
                            <span className="text-[8px] font-mono text-slate-500 font-semibold">Goal: &gt;50%</span>
                          </span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                            <p className="text-xs font-bold text-slate-800">{activePatient.vitals.lvef}%</p>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${activePatient.vitals.lvef < 40 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                              {activePatient.vitals.lvef < 40 ? "Systolic Dysf." : "Compensated"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Risk Status Indicator */}
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Algorithmic Risk Stratum</h4>
                    
                    <div className="p-4 border rounded-xl flex flex-col justify-between h-[155px] shadow-sm relative overflow-hidden bg-slate-50/50 border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400">Risk Model Confidence: 94%</span>
                        <div className={`w-2 h-2 rounded-full animate-ping ${
                          activePatient.riskCategory === "High" ? "bg-red-500" :
                          activePatient.riskCategory === "Medium" ? "bg-amber-500" : "bg-emerald-500"
                        }`} />
                      </div>
                      
                      <div className="my-auto text-center">
                        <p className="text-2xl font-black text-slate-900">{activePatient.riskScore}%</p>
                        <p className={`text-[9px] font-bold uppercase tracking-wider mt-1 px-2.5 py-0.5 rounded-full inline-block border ${
                          activePatient.riskCategory === "High" ? "bg-red-50 border-red-100 text-red-700" :
                          activePatient.riskCategory === "Medium" ? "bg-amber-50 border-amber-100 text-amber-700" :
                          "bg-emerald-50 border-emerald-100 text-emerald-700"
                        }`}>
                          {activePatient.riskCategory} Risk Group
                        </p>
                      </div>

                      <div className="text-[9px] text-slate-400 text-center">
                        Calculated probability of 30-day index readmit.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comorbidities & Medications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Diagnosed Comorbid Burden</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {activePatient.comorbidities.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">No historical chronic diagnoses catalogued.</span>
                      ) : (
                        activePatient.comorbidities.map((c) => (
                          <span key={c} className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            {c}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Discharge Medical Regimen</h4>
                    <div className="space-y-1.5">
                      {activePatient.dischargeMeds.map((med, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs font-medium text-slate-700">
                          <span className="text-blue-500 font-bold text-[10px]">{i + 1}.</span>
                          <span className="truncate">{med}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Discharge Case Notes */}
                <div className="pt-2">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Physician Discharge Notes Summary</h4>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed italic">
                    "{activePatient.notes || "No standard notes provided. ATTN: Attending caseworker requested follow up appointment setup."}"
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-8 text-center text-slate-400 text-xs">
              Select a patient record dossier on the left index panel to view summaries.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
