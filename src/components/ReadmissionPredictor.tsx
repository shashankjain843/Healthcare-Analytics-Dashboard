/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  PlusCircle, 
  Search, 
  Cpu, 
  AlertTriangle, 
  CheckCircle, 
  HelpCircle,
  FileText,
  UserPlus,
  TrendingDown
} from "lucide-react";
import { Patient, UserRole } from "../types";
import { calculateReadmissionRisk } from "../data";

interface ReadmissionPredictorProps {
  patients: Patient[];
  onAddPatient: (p: Patient) => void;
  onUpdatePatient: (p: Patient) => void;
  currentRole: UserRole;
  onAddAuditLog: (action: string, details: string) => void;
  triggerNotification?: (title: string, message: string, type: "success" | "info" | "warning" | "error") => void;
}

// Simple Markdown Parser to avoid dependency breakage on React 19
function CustomMarkdownRenderer({ text }: { text: string }) {
  if (!text) return null;
  
  const lines = text.split("\n");
  return (
    <div className="space-y-3 text-slate-700 text-sm leading-relaxed">
      {lines.map((line, idx) => {
        // Headers
        if (line.startsWith("###")) {
          return <h4 key={idx} className="font-bold text-slate-900 text-base mt-4 border-b border-slate-100 pb-1">{line.replace("###", "").trim()}</h4>;
        }
        if (line.startsWith("##")) {
          return <h3 key={idx} className="font-bold text-slate-900 text-lg mt-5 border-b border-slate-100 pb-1.5">{line.replace("##", "").trim()}</h3>;
        }
        if (line.startsWith("#")) {
          return <h2 key={idx} className="font-bold text-slate-900 text-xl mt-6 pb-2">{line.replace("#", "").trim()}</h2>;
        }
        
        // Bullet Lists
        if (line.trim().startsWith("-") || line.trim().startsWith("*")) {
          const content = line.replace(/^[-*]\s*/, "");
          return (
            <div key={idx} className="flex items-start gap-2 pl-3">
              <span className="text-emerald-500 mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{parseBoldText(content)}</span>
            </div>
          );
        }

        // Standard Paragraphs
        if (line.trim() === "") return <div key={idx} className="h-2" />;
        return <p key={idx}>{parseBoldText(line)}</p>;
      })}
    </div>
  );
}

function parseBoldText(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-semibold text-slate-900">{part}</strong> : part);
}

export default function ReadmissionPredictor({
  patients,
  onAddPatient,
  onUpdatePatient,
  currentRole,
  onAddAuditLog,
  triggerNotification
}: ReadmissionPredictorProps) {
  // States
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(patients[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form fields
  const [formName, setFormName] = useState("");
  const [formAge, setFormAge] = useState(65);
  const [formGender, setFormGender] = useState<"Male" | "Female" | "Other">("Male");
  const [formDiagnosis, setFormDiagnosis] = useState("Congestive Heart Failure");
  const [formLengthOfStay, setFormLengthOfStay] = useState(4);
  const [formPrevAdmissions, setFormPrevAdmissions] = useState(0);
  const [formComorbidities, setFormComorbidities] = useState<string[]>([]);
  const [formNotes, setFormNotes] = useState("");
  
  // Vitals
  const [vitalHbA1c, setVitalHbA1c] = useState("");
  const [vitalLVEF, setVitalLVEF] = useState<number | undefined>(undefined);
  const [vitalFEV1, setVitalFEV1] = useState<number | undefined>(undefined);
  const [vitalO2Sat, setVitalO2Sat] = useState<number | undefined>(undefined);
  const [vitalBP, setVitalBP] = useState("120/80");
  const [vitalHeight, setVitalHeight] = useState<number | undefined>(undefined);
  const [vitalWeight, setVitalWeight] = useState<number | undefined>(undefined);
  
  // Model output state
  const [computedResult, setComputedResult] = useState<{
    score: number;
    category: "High" | "Medium" | "Low";
    riskFactors: string[];
  } | null>(null);

  // Available Diagnoses & Comorbidities options
  const diagnoses = ["Congestive Heart Failure", "Type 2 Diabetes", "COPD", "Pneumonia", "Hypertension"];
  const comorbidityOptions = [
    "Hypertension", 
    "Chronic Kidney Disease Stage III", 
    "Hyperlipidemia", 
    "Obesity Class II", 
    "Neuropathy", 
    "Osteoporosis", 
    "Coronary Artery Disease", 
    "Depression", 
    "Asthma",
    "Anemia",
    "Gout"
  ];

  // Get active selected patient object
  const activePatient = patients.find(p => p.id === selectedPatientId);

  // Load patient data into the editor
  const handleLoadPatient = (p: Patient) => {
    setSelectedPatientId(p.id);
    setFormName(p.name);
    setFormAge(p.age);
    setFormGender(p.gender);
    setFormDiagnosis(p.diagnosis);
    setFormLengthOfStay(p.lengthOfStay);
    setFormPrevAdmissions(p.previousAdmissions);
    setFormComorbidities(p.comorbidities);
    setFormNotes(p.notes || "");
    setVitalHbA1c(p.vitals.hba1c || "");
    setVitalLVEF(p.vitals.lvef);
    setVitalFEV1(p.vitals.fev1);
    setVitalO2Sat(p.vitals.oxygenSat);
    setVitalBP(p.vitals.bloodPressure || "120/80");
    setVitalHeight(p.vitals.height);
    setVitalWeight(p.vitals.weight);

    // Pre-calculate
    const res = calculateReadmissionRisk(
      p.age,
      p.previousAdmissions,
      p.lengthOfStay,
      p.comorbidities,
      p.diagnosis,
      { hba1c: p.vitals.hba1c, lvef: p.vitals.lvef, fev1: p.vitals.fev1, oxygenSat: p.vitals.oxygenSat, bloodPressure: p.vitals.bloodPressure }
    );
    setComputedResult(res);

    onAddAuditLog("Loaded Patient EHR", `Loaded record of patient ${p.name} (${p.id}) for clinical readmission testing.`);
  };

  // Toggle comorbidity
  const handleToggleComorbidity = (comorb: string) => {
    if (formComorbidities.includes(comorb)) {
      setFormComorbidities(formComorbidities.filter(c => c !== comorb));
    } else {
      setFormComorbidities([...formComorbidities, comorb]);
    }
  };

  // Trigger Local Risk Scoring (XGBoost/TabNet Emulator)
  const handleCalculateRisk = (e: React.FormEvent) => {
    e.preventDefault();

    if (currentRole === "Staff") {
      if (triggerNotification) {
        triggerNotification(
          "HIPAA Privilege Warning", 
          "Staff accounts have read-only permissions and cannot run new predictive models.", 
          "warning"
        );
      } else {
        alert("HIPAA Privilege Warning: Staff accounts have read-only permissions and cannot update patient EHR algorithms or run new predictions.");
      }
      return;
    }

    const calculated = calculateReadmissionRisk(
      formAge,
      formPrevAdmissions,
      formLengthOfStay,
      formComorbidities,
      formDiagnosis,
      { hba1c: vitalHbA1c, lvef: vitalLVEF, fev1: vitalFEV1, oxygenSat: vitalO2Sat, bloodPressure: vitalBP }
    );

    setComputedResult(calculated);

    // Create updated patient record
    const updatedPatient: Patient = {
      id: selectedPatientId || `PAT-${Math.floor(10000 + Math.random() * 90000)}`,
      name: formName || "Anonymous Patient",
      age: formAge,
      gender: formGender,
      diagnosis: formDiagnosis,
      lengthOfStay: formLengthOfStay,
      previousAdmissions: formPrevAdmissions,
      comorbidities: formComorbidities,
      vitals: { hba1c: vitalHbA1c, lvef: vitalLVEF, fev1: vitalFEV1, oxygenSat: vitalO2Sat, bloodPressure: vitalBP, height: vitalHeight, weight: vitalWeight },
      dischargeMeds: activePatient?.dischargeMeds || ["Guideline-directed medical therapy (GDMT)"],
      riskScore: calculated.score,
      riskCategory: calculated.category,
      dischargeDate: new Date().toISOString().split("T")[0],
      admissionDate: new Date(Date.now() - formLengthOfStay * 86400000).toISOString().split("T")[0],
      notes: formNotes
    };

    if (selectedPatientId) {
      onUpdatePatient(updatedPatient);
      onAddAuditLog("Re-scored Patient EHR", `Re-ran ML readmission classifier for ${updatedPatient.name} (${updatedPatient.id}). Score: ${calculated.score}%.`);
      triggerNotification?.("Risk Score Updated", `Successfully re-scored readmission probability for ${updatedPatient.name} (${calculated.score}%).`, "success");
    } else {
      onAddPatient(updatedPatient);
      setSelectedPatientId(updatedPatient.id);
      onAddAuditLog("Created Patient EHR Record", `Logged new discharge patient ${updatedPatient.name} (${updatedPatient.id}) with clinical risk classification: ${calculated.score}%.`);
      triggerNotification?.("Dossier Saved Successfully", `Registered EHR file for ${updatedPatient.name} and calculated a readmission risk of ${calculated.score}%.`, "success");
    }
  };

  // Prepare a blank patient form
  const handlePrepareNewPatient = () => {
    setSelectedPatientId(null);
    setFormName("");
    setFormAge(55);
    setFormGender("Male");
    setFormDiagnosis("Congestive Heart Failure");
    setFormLengthOfStay(3);
    setFormPrevAdmissions(0);
    setFormComorbidities([]);
    setFormNotes("");
    setVitalHbA1c("");
    triggerNotification?.("Form Initialized", "Prepared clinical inputs editor for new patient entry.", "info");
    setVitalLVEF(undefined);
    setVitalFEV1(undefined);
    setVitalO2Sat(95);
    setVitalBP("120/80");
    setVitalHeight(undefined);
    setVitalWeight(undefined);
    setComputedResult(null);
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
      {/* Patient registry panel (col-span-4) */}
      <div className="xl:col-span-4 bg-white border border-slate-100 shadow-sm rounded-xl flex flex-col h-[calc(100vh-140px)]">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Discharged Patient Registry</h3>
            <p className="text-[11px] text-slate-400">Select records to test model sensitivity.</p>
          </div>
          <button
            onClick={handlePrepareNewPatient}
            disabled={currentRole === "Staff"}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-xs font-semibold rounded-lg transition-all shadow-sm shadow-blue-500/10 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            New
          </button>
        </div>

        {/* Search bar */}
        <div className="p-3 border-b border-slate-200 bg-slate-50">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by patient name, ID, condition..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 w-full bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Patient records list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredPatients.length === 0 ? (
            <p className="p-8 text-center text-xs text-slate-400">No records found matching query.</p>
          ) : (
            filteredPatients.map((p) => {
              const isActive = p.id === selectedPatientId;
              let riskColorBadge = "text-emerald-700 bg-emerald-50 border border-emerald-100";
              if (p.riskCategory === "High") {
                riskColorBadge = "text-red-700 bg-red-50 border border-red-100";
              } else if (p.riskCategory === "Medium") {
                riskColorBadge = "text-amber-700 bg-amber-50 border border-amber-100";
              }

              return (
                <button
                  key={p.id}
                  onClick={() => handleLoadPatient(p)}
                  className={`w-full text-left p-4 transition-all flex items-center justify-between ${
                    isActive ? "bg-blue-50/40 border-l-4 border-blue-600" : "hover:bg-slate-50/50"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-slate-800 text-sm truncate">{p.name}</span>
                      <span className="font-mono text-[9px] text-slate-400">{p.id}</span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                      <span>{p.age} y/o {p.gender}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className="truncate">{p.diagnosis}</span>
                    </div>
                  </div>
                  <div className={`text-center px-2 py-1 rounded-lg flex-shrink-0 ${riskColorBadge}`}>
                    <p className="text-[10px] font-bold uppercase tracking-wider leading-none">Risk</p>
                    <p className="text-sm font-black mt-0.5 leading-none">{p.riskScore}%</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Inputs and Output details panel (col-span-8) */}
      <div className="xl:col-span-8 space-y-6">
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-5">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {selectedPatientId ? `Edit Patient Record: ${formName || 'Anonymous'}` : "Create New EHR Entry & Risk Simulation"}
              </h3>
              <p className="text-slate-400 text-xs">Run predictive classification scores on demographic and physiological inputs.</p>
            </div>
            {selectedPatientId && (
              <span className="px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded font-mono text-[10px]">
                Active: {selectedPatientId}
              </span>
            )}
          </div>

          <form onSubmit={handleCalculateRisk} className="space-y-6">
            {/* Demographic Block */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Age</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={120}
                  value={formAge}
                  onChange={(e) => setFormAge(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Gender</label>
                <select
                  value={formGender}
                  onChange={(e) => setFormGender(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Stay and Diagnosis Block */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Primary Diagnosis Code</label>
                <select
                  value={formDiagnosis}
                  onChange={(e) => setFormDiagnosis(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {diagnoses.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Length of Index Stay (Days)</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={60}
                  value={formLengthOfStay}
                  onChange={(e) => setFormLengthOfStay(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Prior Admissions (Past Year)</label>
                <input
                  type="number"
                  required
                  min={0}
                  max={20}
                  value={formPrevAdmissions}
                  onChange={(e) => setFormPrevAdmissions(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Vital Signs (Dynamic dependent on Diagnosis) */}
            <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-200 space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                Laboratory Biomarkers & Physiological Vitals
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* HbA1c for Diabetes */}
                {formDiagnosis === "Type 2 Diabetes" && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1.5">HbA1c Levels (%)</label>
                    <input
                      type="text"
                      value={vitalHbA1c}
                      onChange={(e) => setVitalHbA1c(e.target.value)}
                      placeholder="e.g. 9.1%"
                      className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* LVEF for Congestive Heart Failure */}
                {formDiagnosis === "Congestive Heart Failure" && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1.5">LVEF (%)</label>
                    <input
                      type="number"
                      min={10}
                      max={80}
                      value={vitalLVEF || ""}
                      onChange={(e) => setVitalLVEF(parseInt(e.target.value) || undefined)}
                      placeholder="e.g. 35%"
                      className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* FEV1 for COPD */}
                {formDiagnosis === "COPD" && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1.5">FEV1 / FVC Ratio (%)</label>
                    <input
                      type="number"
                      min={10}
                      max={100}
                      value={vitalFEV1 || ""}
                      onChange={(e) => setVitalFEV1(parseInt(e.target.value) || undefined)}
                      placeholder="e.g. 45"
                      className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* Oxygen Sat for COPD, Pneumonia */}
                {(formDiagnosis === "COPD" || formDiagnosis === "Pneumonia") && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1.5">Oxygen Saturation (%)</label>
                    <input
                      type="number"
                      min={50}
                      max={100}
                      value={vitalO2Sat || ""}
                      onChange={(e) => setVitalO2Sat(parseInt(e.target.value) || undefined)}
                      placeholder="e.g. 94"
                      className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* Blood Pressure */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1.5">Blood Pressure (mmHg)</label>
                  <input
                    type="text"
                    value={vitalBP}
                    onChange={(e) => setVitalBP(e.target.value)}
                    placeholder="e.g. 132/85"
                    className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Height & Weight — for BMI Feature Engineering */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1.5">Height (cm) <span className="text-blue-500">— BMI</span></label>
                  <input
                    type="number"
                    min={100}
                    max={250}
                    value={vitalHeight || ""}
                    onChange={(e) => setVitalHeight(parseInt(e.target.value) || undefined)}
                    placeholder="e.g. 175"
                    className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1.5">Weight (kg) <span className="text-blue-500">— BMI</span></label>
                  <input
                    type="number"
                    min={20}
                    max={300}
                    value={vitalWeight || ""}
                    onChange={(e) => setVitalWeight(parseInt(e.target.value) || undefined)}
                    placeholder="e.g. 82"
                    className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Comorbidities checkboxes */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Comorbidities / Chronic Diagnoses</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {comorbidityOptions.map((c) => {
                  const isChecked = formComorbidities.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleToggleComorbidity(c)}
                      className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center justify-between ${
                        isChecked
                          ? "bg-blue-50 border-blue-300 text-blue-800"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className="truncate pr-1">{c}</span>
                      {isChecked && <span className="text-blue-600 font-bold">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Discharge Summary / Clinical Notes</label>
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={3}
                placeholder="Enter patient notes, clinical summary, follow up plans..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Action Button */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={currentRole === "Staff"}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-blue-500/10 cursor-pointer"
              >
                <Cpu className="w-4 h-4" />
                Calculate Predictive Risk Score
              </button>
            </div>
          </form>
        </div>

        {/* Prediction Outputs */}
        {computedResult && (
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Classification Output & Feature Importance</h4>
                <p className="text-xs text-slate-400">Heuristics mapping to clinical readmission risk model constraints.</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 font-medium">Readmission Risk Probability:</span>
                <div className={`px-3 py-1 rounded-full font-bold text-sm border ${
                  computedResult.category === "High" ? "bg-red-50 text-red-700 border-red-100" :
                  computedResult.category === "Medium" ? "bg-amber-50 text-amber-700 border-amber-100" :
                  "bg-emerald-50 text-emerald-700 border-emerald-100"
                }`}>
                  {computedResult.score}% ({computedResult.category})
                </div>
              </div>
            </div>

            {/* Risk Factors / SHAP Explainer */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Key Model Risk Driver Attribution
              </h5>
              
              {computedResult.riskFactors.length === 0 ? (
                <div className="flex items-center gap-2 p-3 bg-emerald-50/50 border border-emerald-100 text-emerald-800 rounded-lg text-xs">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  No high severity clinical markers detected. Patient displays low overall readmission risk drivers.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {computedResult.riskFactors.map((factor, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                       <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                       <span className="font-semibold">{factor}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feature Engineering Breakdown Panel */}
        {computedResult && (
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 border border-blue-200/60 shadow-sm rounded-xl p-5 space-y-4">
            <div className="border-b border-blue-200/40 pb-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Feature Engineering Pipeline — Derived Clinical Features
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">Engineered features computed from raw patient inputs. These improve model accuracy and explainability.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                {
                  label: "BMI",
                  raw: vitalHeight && vitalWeight ? `${vitalHeight}cm / ${vitalWeight}kg` : "—",
                  engineered: vitalHeight && vitalWeight
                    ? (() => { const h = vitalHeight / 100; const b = vitalWeight / (h * h); return `${b.toFixed(1)} kg/m²`; })()
                    : "N/A",
                  formula: "w(kg) / h(m)²",
                  color: "bg-blue-100 text-blue-800",
                },
                {
                  label: "Age Group",
                  raw: `${formAge} years`,
                  engineered: formAge < 18 ? "Pediatric (<18)" : formAge < 65 ? "Adult (18–64)" : "Geriatric (≥65)",
                  formula: "Threshold bins",
                  color: "bg-purple-100 text-purple-800",
                },
                {
                  label: "Stay Category",
                  raw: `${formLengthOfStay} days`,
                  engineered: formLengthOfStay <= 2 ? "Short Stay (≤2d)" : formLengthOfStay <= 7 ? "Moderate (3–7d)" : "Extended (≥8d)",
                  formula: "Ordinal binning",
                  color: "bg-amber-100 text-amber-800",
                },
                {
                  label: "Comorbidity Count",
                  raw: `${formComorbidities.length} condition(s)`,
                  engineered: formComorbidities.length > 3 ? "Severe Multimorbidity" : formComorbidities.length > 1 ? "Comorbid Burden" : "Low Burden",
                  formula: "count(comorbidities)",
                  color: "bg-rose-100 text-rose-800",
                },
                {
                  label: "Avg Heart Rate",
                  raw: vitalO2Sat ? `O2 Sat: ${vitalO2Sat}%` : "—",
                  engineered: activePatient?.vitals.heartRate ? `${activePatient.vitals.heartRate} bpm` : "—",
                  formula: "From vitals record",
                  color: "bg-emerald-100 text-emerald-800",
                },
              ].map((feat) => (
                <div key={feat.label} className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-1.5">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{feat.label}</p>
                  <p className={`text-[10px] font-bold px-2 py-0.5 rounded-full self-start ${feat.color}`}>{feat.engineered}</p>
                  <p className="text-[9px] text-slate-400">Raw: {feat.raw}</p>
                  <p className="text-[9px] text-slate-300 font-mono border-t border-slate-100 pt-1 mt-auto">{feat.formula}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
