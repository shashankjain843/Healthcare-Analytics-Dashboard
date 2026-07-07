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
  Percent,
  Sparkles,
  Send,
  RefreshCw,
  Copy,
  Check
} from "lucide-react";
import { Patient, UserRole } from "../types";
import { calculateReadmissionRisk } from "../data";

interface Message {
  role: "user" | "model";
  content: string;
}

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
  
  // AI Clinical Copilot State
  const [copilotTab, setCopilotTab] = useState<"summary" | "chat">("summary");
  const [aiSummaries, setAiSummaries] = useState<{ [patientId: string]: string }>({});
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiSummaryError, setAiSummaryError] = useState<string | null>(null);
  
  const [chatHistories, setChatHistories] = useState<{ [patientId: string]: Message[] }>({});
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  
  const activePatient = patients.find(p => p.id === selectedPatientId);

  const handleGenerateSummary = async (patient: Patient) => {
    if (!patient) return;
    setAiSummaryLoading(true);
    setAiSummaryError(null);
    try {
      const response = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate AI summary");
      }
      setAiSummaries(prev => ({ ...prev, [patient.id]: data.summary }));
      
      onAddAuditLog(
        "Generated Gemini AI Summary", 
        `Generated real-time clinical discharge summary for patient ${patient.name} (${patient.id}).`
      );
      triggerNotification(
        "AI Summary Generated", 
        `Gemini AI successfully synthesized records for ${patient.name}.`,
        "success"
      );
    } catch (err: any) {
      console.error(err);
      setAiSummaryError(err.message || "An unexpected error occurred.");
      triggerNotification(
        "AI Generation Failed", 
        err.message || "Could not connect to Gemini API server.",
        "error"
      );
    } finally {
      setAiSummaryLoading(false);
    }
  };

  const handleSendChatMessage = async (presetMessage?: string) => {
    if (!activePatient) return;
    const textToSend = presetMessage || chatInput;
    if (!textToSend.trim() || chatLoading) return;

    const currentHistory = chatHistories[activePatient.id] || [];
    const updatedHistory: Message[] = [...currentHistory, { role: "user", content: textToSend }];
    
    // Update local state immediately for user bubble
    setChatHistories(prev => ({ ...prev, [activePatient.id]: updatedHistory }));
    if (!presetMessage) setChatInput("");
    setChatLoading(true);

    try {
      const response = await fetch("/api/chat-consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient: activePatient, messages: updatedHistory }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to get response from AI");
      }

      setChatHistories(prev => ({
        ...prev,
        [activePatient.id]: [...updatedHistory, { role: "model", content: data.reply }]
      }));

      onAddAuditLog(
        "Consulted Gemini Assistant", 
        `Clinician queried Gemini clinical assistant regarding patient ${activePatient.name} (${activePatient.id}).`
      );
    } catch (err: any) {
      console.error(err);
      triggerNotification(
        "Chat Consultation Failed",
        err.message || "Could not reach Gemini AI advisor.",
        "error"
      );
    } finally {
      setChatLoading(false);
    }
  };

  const copySummaryToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    triggerNotification("Copied to Clipboard", "AI Summary copied successfully.", "info");
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const downloadSummaryTxt = (patient: Patient, text: string) => {
    const filename = `gemini_summary_${patient.id}.txt`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerNotification("Summary Downloaded", "Summary saved as text file.", "success");
  };

  const renderMarkdownToHtml = (markdown: string) => {
    if (!markdown) return "";
    
    // Replace headers
    let html = markdown
      .replace(/^### (.*$)/gim, '<h5 class="text-xs font-bold text-slate-800 mt-3 mb-1.5">$1</h5>')
      .replace(/^## (.*$)/gim, '<h4 class="text-sm font-bold text-slate-900 mt-4 mb-2">$1</h4>')
      .replace(/^# (.*$)/gim, '<h3 class="text-base font-black text-slate-900 mt-5 mb-3">$1</h3>');
      
    // Replace bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>');
    
    // Replace list items
    html = html.replace(/^\s*[-*+]\s+(.*$)/gim, '<li class="text-[11px] text-slate-600 list-disc ml-5 mb-1">$1</li>');
    
    // Replace horizontal rule
    html = html.replace(/^\s*---(.*$)/gim, '<hr class="border-slate-200 my-3" />');
    
    // Replace paragraphs (lines not starting with tags)
    const lines = html.split('\n');
    const processedLines = lines.map(line => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith('<h') || trimmed.startsWith('<li') || trimmed.startsWith('<hr') || trimmed.startsWith('<ul') || trimmed.startsWith('<ol')) {
        return line;
      }
      return `<p class="text-[11px] text-slate-600 leading-relaxed mb-1.5">${line}</p>`;
    });
    
    return processedLines.filter(l => l !== "").join('\n');
  };

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

                {/* Gemini AI Clinical Copilot */}
                <div className="border-t border-slate-200 pt-6 mt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          Gemini AI Clinical Copilot
                          <span className="px-1.5 py-0.5 text-[8px] font-extrabold bg-blue-50 text-blue-600 border border-blue-100 rounded-full tracking-normal uppercase">
                            v2.5 Flash
                          </span>
                        </h4>
                        <p className="text-[10px] text-slate-500">Real-time clinical insights, summaries, and chat advisory.</p>
                      </div>
                    </div>

                    {/* Tab Selectors */}
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto shadow-inner">
                      <button
                        onClick={() => setCopilotTab("summary")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                          copilotTab === "summary"
                            ? "bg-white text-slate-800 shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Clinical Summary
                      </button>
                      <button
                        onClick={() => setCopilotTab("chat")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                          copilotTab === "chat"
                            ? "bg-white text-slate-800 shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Clinical Assistant
                      </button>
                    </div>
                  </div>

                  {/* Summary Tab Content */}
                  {copilotTab === "summary" && (
                    <div className="space-y-4">
                      {aiSummaryLoading ? (
                        <div className="py-12 px-4 text-center bg-slate-50 border border-slate-200 rounded-xl space-y-4 shadow-xs">
                          <div className="flex justify-center">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin"></div>
                              <Sparkles className="w-5 h-5 text-indigo-600 absolute top-3.5 left-3.5 animate-pulse" />
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">Gemini is synthesizing clinical data...</p>
                            <p className="text-[10px] text-slate-400 mt-1">Analyzing vitals, comorbidities, medications, and admission history.</p>
                          </div>
                        </div>
                      ) : aiSummaryError ? (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3">
                          <div className="flex items-start gap-2.5">
                            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h5 className="text-xs font-bold text-red-800">Generation Error</h5>
                              <p className="text-[11px] text-red-600 mt-0.5">{aiSummaryError}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleGenerateSummary(activePatient)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Retry Summary Generation
                          </button>
                        </div>
                      ) : aiSummaries[activePatient.id] ? (
                        <div className="space-y-3">
                          {/* Summary Action Toolbar */}
                          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-2 rounded-lg">
                            <span className="text-[10px] text-slate-400 font-medium">Generated via Gemini Clinical LLM</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => copySummaryToClipboard(aiSummaries[activePatient.id])}
                                className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-800 text-[10px] font-bold rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                                title="Copy markdown content to clipboard"
                              >
                                {copiedSummary ? (
                                  <>
                                    <Check className="w-3 h-3 text-green-600" />
                                    <span className="text-green-600">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => downloadSummaryTxt(activePatient, aiSummaries[activePatient.id])}
                                className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-800 text-[10px] font-bold rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                                title="Download as .txt file"
                              >
                                <Download className="w-3 h-3" />
                                <span>Download</span>
                              </button>
                              <button
                                onClick={() => handleGenerateSummary(activePatient)}
                                className="p-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-800 rounded-md transition-colors cursor-pointer"
                                title="Regenerate summary"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Rendered Summary Box */}
                          <div 
                            className="p-5 bg-white border border-slate-200 rounded-xl max-h-96 overflow-y-auto shadow-inner text-slate-700 space-y-3"
                            dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(aiSummaries[activePatient.id]) }}
                          />
                        </div>
                      ) : (
                        <div className="text-center py-10 px-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-3">
                          <Sparkles className="w-8 h-8 text-blue-500/70 mx-auto animate-pulse" />
                          <div>
                            <h5 className="font-bold text-slate-700 text-xs">No AI Discharge Summary Generated</h5>
                            <p className="text-[10px] text-slate-400 max-w-sm mx-auto mt-1 leading-normal">
                              Synthesize structured clinical metrics, diagnoses, patient age, risk categories, and medications into a professional discharge report using Gemini.
                            </p>
                          </div>
                          <button
                            onClick={() => handleGenerateSummary(activePatient)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs rounded-lg shadow-md shadow-blue-500/10 hover:opacity-95 transition-opacity flex items-center gap-1.5 mx-auto cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Generate AI Summary
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Chat Tab Content */}
                  {copilotTab === "chat" && (
                    <div className="space-y-4">
                      {/* Chat Messages Log */}
                      <div className="border border-slate-200 rounded-xl bg-slate-50/50 p-4 min-h-[220px] max-h-[350px] overflow-y-auto flex flex-col gap-3 shadow-inner">
                        {(!chatHistories[activePatient.id] || chatHistories[activePatient.id].length === 0) ? (
                          <div className="my-auto text-center py-4 space-y-3">
                            <Clipboard className="w-7 h-7 text-slate-400 mx-auto" />
                            <div>
                              <p className="text-xs font-bold text-slate-600">Consult Gemini Clinical Advisor</p>
                              <p className="text-[10px] text-slate-400 max-w-xs mx-auto mt-0.5 leading-normal">
                                Ask about drug-drug interactions, dietary precautions, outpatient guidelines, or rehabilitation milestones for {activePatient.name}.
                              </p>
                            </div>
                            
                            {/* Preset Buttons */}
                            <div className="flex flex-wrap justify-center gap-1.5 pt-2 max-w-md mx-auto">
                              <button
                                type="button"
                                onClick={() => handleSendChatMessage("Check for potential drug-drug interactions in the discharge medications.")}
                                className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-[9px] font-bold text-slate-600 rounded-full transition-colors cursor-pointer"
                              >
                                💊 Drug Interactions
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSendChatMessage("What are the key physiological warning signs that this patient might deteriorate?")}
                                className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-[9px] font-bold text-slate-600 rounded-full transition-colors cursor-pointer"
                              >
                                ⚠️ Deterioration Warning Signs
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSendChatMessage("Suggest a tailored diet and vital monitoring protocol for home-care.")}
                                className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-[9px] font-bold text-slate-600 rounded-full transition-colors cursor-pointer"
                              >
                                🥗 Diet & Home Care Plan
                              </button>
                            </div>
                          </div>
                        ) : (
                          chatHistories[activePatient.id].map((msg, index) => {
                            const isUser = msg.role === "user";
                            return (
                              <div
                                key={index}
                                className={`flex items-start gap-2 max-w-[85%] ${isUser ? "self-end flex-row-reverse" : "self-start"}`}
                              >
                                {!isUser && (
                                  <div className="w-5 h-5 rounded bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 text-[8px] font-bold shadow-xs">
                                    <Sparkles className="w-2.5 h-2.5" />
                                  </div>
                                )}
                                <div
                                  className={`p-3 rounded-2xl text-[11px] leading-relaxed ${
                                    isUser
                                      ? "bg-blue-600 text-white rounded-tr-none shadow-xs font-semibold"
                                      : "bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-xs text-left"
                                  }`}
                                >
                                  {isUser ? (
                                    msg.content
                                  ) : (
                                    <div 
                                      className="space-y-1.5"
                                      dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(msg.content) }}
                                    />
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}

                        {chatLoading && (
                          <div className="flex items-start gap-2 max-w-[80%] self-start">
                            <div className="w-5 h-5 rounded bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                              <Sparkles className="w-2.5 h-2.5 animate-spin" />
                            </div>
                            <div className="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl rounded-tl-none text-[11px] shadow-xs italic flex items-center gap-1.5">
                              <span>Gemini Clinical Advisor is formulating response...</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Chat Input Container */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSendChatMessage();
                        }}
                        className="flex gap-2"
                      >
                        <input
                          type="text"
                          placeholder={`Ask Gemini about ${activePatient.name}'s case...`}
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
                          disabled={chatLoading}
                        />
                        <button
                          type="submit"
                          disabled={!chatInput.trim() || chatLoading}
                          className="px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md hover:opacity-95 disabled:opacity-50 disabled:shadow-none flex items-center justify-center transition-all cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>
                  )}
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
