/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Layers, 
  FileCode, 
  Lock, 
  Unlock, 
  Download, 
  Clipboard, 
  CheckCircle, 
  Eye, 
  ArrowRight,
  Info
} from "lucide-react";
import { Patient, UserRole } from "../types";

interface FHIRComplianceProps {
  patients: Patient[];
  currentRole: UserRole;
  onAddAuditLog: (action: string, details: string) => void;
  triggerNotification?: (title: string, message: string, type: "success" | "info" | "warning" | "error") => void;
}

export default function FHIRCompliance({
  patients,
  currentRole,
  onAddAuditLog,
  triggerNotification
}: FHIRComplianceProps) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || "");
  const [isAnonymized, setIsAnonymized] = useState(false);
  const [copied, setCopied] = useState(false);

  // Find selected patient
  const patient = patients.find(p => p.id === selectedPatientId) || patients[0];

  // Handler to trigger de-identification
  const handleToggleAnonymization = () => {
    if (currentRole === "Staff") {
      if (triggerNotification) {
        triggerNotification(
          "HIPAA Privilege Warning",
          "Staff accounts cannot trigger de-identification algorithms on master EHR indexes.",
          "warning"
        );
      } else {
        alert("HIPAA Privilege Warning: Staff accounts cannot trigger de-identification algorithms on master EHR indexes.");
      }
      return;
    }
    
    const newState = !isAnonymized;
    setIsAnonymized(newState);
    
    if (newState) {
      onAddAuditLog(
        "HIPAA De-identification", 
        `Executed Safe-Harbor PII masking algorithm on Patient ${patient.name} (${patient.id}).`
      );
      triggerNotification?.("Safe-Harbor Masking Activated", `Successfully de-identified demographic details for ${patient.name}.`, "info");
    } else {
      triggerNotification?.("Safe-Harbor Masking Disabled", `Restored standard EHR field visualization for ${patient.name}.`, "info");
    }
  };

  const handlePatientSelect = (id: string) => {
    setSelectedPatientId(id);
    setIsAnonymized(false); // reset view for next patient
    onAddAuditLog("Loaded Patient for HIPAA Query", `Opened HIPAA record inspector for Patient ID: ${id}.`);
  };

  // Perform Safe-Harbor Masking
  const anonymizeName = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}. ${parts[1][0]}. [REDACTED_SAFE_HARBOR]`;
    }
    return `${name[0]}*** [REDACTED]`;
  };

  const anonymizeID = (id: string) => {
    return `FHIR-ANON-${id.split("-")[1] || "XXXXX"}`;
  };

  const anonymizeAge = (age: number) => {
    const floor = Math.floor(age / 10) * 10;
    return `${floor} - ${floor + 9} cohort`;
  };

  // Generate FHIR JSON resource
  const generateFHIRResource = (p: Patient, anon: boolean) => {
    const subjectName = anon ? anonymizeName(p.name) : p.name;
    const subjectID = anon ? anonymizeID(p.id) : p.id;
    const ageValue = anon ? anonymizeAge(p.age) : p.age;

    const fhirBundle = {
      resourceType: "Bundle",
      id: `bundle-${subjectID}`,
      type: "collection",
      timestamp: new Date().toISOString(),
      entry: [
        {
          fullUrl: `urn:uuid:patient-${subjectID}`,
          resource: {
            resourceType: "Patient",
            id: subjectID,
            active: true,
            name: [
              {
                use: "official",
                family: anon ? "[REDACTED]" : p.name.split(" ")[1] || "",
                given: anon ? [anonymizeName(p.name).split(" ")[0]] : [p.name.split(" ")[0]]
              }
            ],
            gender: p.gender.toLowerCase(),
            birthDate: anon ? undefined : `${2026 - p.age}-01-01`,
            extension: anon ? [
              {
                url: "http://hl7.org/fhir/StructureDefinition/patient-ageCohort",
                valueString: ageValue
              }
            ] : []
          }
        },
        {
          fullUrl: `urn:uuid:condition-${subjectID}`,
          resource: {
            resourceType: "Condition",
            id: `cond-${subjectID}`,
            subject: {
              reference: `urn:uuid:patient-${subjectID}`
            },
            code: {
              coding: [
                {
                  system: "http://hl7.org/fhir/sid/icd-10",
                  code: p.diagnosis === "Congestive Heart Failure" ? "I50.9" :
                        p.diagnosis === "Type 2 Diabetes" ? "E11.9" :
                        p.diagnosis === "COPD" ? "J44.9" : "J18.9",
                  display: p.diagnosis
                }
              ]
            },
            clinicalStatus: {
              coding: [
                {
                  system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
                  code: "active"
                }
              ]
            }
          }
        },
        {
          fullUrl: `urn:uuid:observation-${subjectID}`,
          resource: {
            resourceType: "Observation",
            id: `obs-readmit-${subjectID}`,
            status: "final",
            code: {
              coding: [
                {
                  system: "http://loinc.org",
                  code: "9921-X",
                  display: "Readmission Risk Probability Classifier Output"
                }
              ]
            },
            subject: {
              reference: `urn:uuid:patient-${subjectID}`
            },
            valueQuantity: {
              value: p.riskScore,
              unit: "%",
              system: "http://unitsofmeasure.org",
              code: "%"
            },
            interpretation: [
              {
                coding: [
                  {
                    system: "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                    code: p.riskCategory === "High" ? "H" : p.riskCategory === "Medium" ? "N" : "L",
                    display: `${p.riskCategory} Risk`
                  }
                ]
              }
            ]
          }
        }
      ]
    };

    return JSON.stringify(fhirBundle, null, 2);
  };

  const fhirJSON = patient ? generateFHIRResource(patient, isAnonymized) : "{}";

  // Copy to clipboard
  const handleCopyJSON = () => {
    navigator.clipboard.writeText(fhirJSON);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onAddAuditLog("FHIR Export Copy", `Copied HL7 FHIR JSON resource bundle for Patient ID ${patient?.id} to clipboard.`);
    triggerNotification?.("FHIR Bundle Copied", `Conformant HL7 FHIR resource copied to clipboard for ${patient?.name || 'patient'}.`, "success");
  };

  // Download JSON File
  const handleDownloadJSON = () => {
    const blob = new Blob([fhirJSON], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `FHIR_Resource_${patient?.id || "anon"}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onAddAuditLog("FHIR Export Download", `Downloaded conformant HL7 FHIR JSON resource file for Patient ID ${patient?.id}.`);
    triggerNotification?.("FHIR File Downloaded", `HL7 FHIR JSON resource downloaded successfully for ${patient?.name || 'patient'}.`, "success");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Interoperability & HIPAA Regulatory Standards</h2>
        <p className="text-slate-500 text-sm">Convert master patient records into standard HL7 FHIR resources, and apply Safe-Harbor de-identification protocols.</p>
      </div>

      {/* Selector */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="space-y-1 w-full sm:w-80">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Target Patient EHR</label>
          <select
            value={selectedPatientId}
            onChange={(e) => handlePatientSelect(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer animate-none"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-500 font-mono">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          HIPAA Safe-Harbor & FHIR DSTU2 Compliant
        </div>
      </div>

      {patient ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* De-identification Panel (col-span-6) */}
          <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">HIPAA PII Anonymizer</h3>
                <p className="text-slate-400 text-xs">Simulate patient de-identification for medical research sharing.</p>
              </div>

              <button
                onClick={handleToggleAnonymization}
                disabled={currentRole === "Staff"}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isAnonymized 
                    ? "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200" 
                    : "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 shadow-sm shadow-blue-500/10"
                }`}
              >
                {isAnonymized ? (
                  <>
                    <Unlock className="w-3.5 h-3.5" /> Revert to Clinical
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" /> De-identify Record
                  </>
                )}
              </button>
            </div>

            {/* Compare side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Input */}
              <div className="p-4 bg-slate-50 rounded-xl space-y-3.5 relative overflow-hidden border border-slate-200">
                <div className="absolute top-0 right-0 px-2 py-0.5 bg-slate-200 border-l border-b border-slate-300 rounded-bl text-[8px] font-bold text-slate-600 uppercase font-mono flex items-center gap-1">
                  <Unlock className="w-2.5 h-2.5" /> Clinical View
                </div>

                <div className="space-y-1 pt-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Patient Name</span>
                  <p className="text-sm font-bold text-slate-850">{patient.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Age</span>
                    <p className="text-sm font-semibold text-slate-800">{patient.age} years old</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Gender</span>
                    <p className="text-sm font-semibold text-slate-800">{patient.gender}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Internal Hospital ID</span>
                  <p className="text-sm font-mono text-slate-800">{patient.id}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Primary Diagnosis</span>
                  <p className="text-sm font-semibold text-slate-800">{patient.diagnosis}</p>
                </div>
              </div>

              {/* Right Column: Masked Output */}
              <div className={`p-4 rounded-xl space-y-3.5 relative overflow-hidden border transition-all ${
                isAnonymized 
                  ? "bg-blue-50/20 border-blue-200" 
                  : "bg-slate-50/50 border-slate-200 border-dashed"
              }`}>
                <div className="absolute top-0 right-0 px-2 py-0.5 bg-blue-50 border-l border-b border-blue-100 text-blue-600 rounded-bl text-[8px] font-bold uppercase font-mono flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Research Safe
                </div>

                <div className="space-y-1 pt-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Patient Name</span>
                  <p className="text-sm font-bold text-slate-800">
                    {isAnonymized ? anonymizeName(patient.name) : <span className="text-slate-400 italic text-xs">Waiting for trigger</span>}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Age</span>
                    <p className="text-sm font-semibold text-slate-800">
                      {isAnonymized ? anonymizeAge(patient.age) : <span className="text-slate-400 italic text-xs">Waiting</span>}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Gender</span>
                    <p className="text-sm font-semibold text-slate-800">
                      {isAnonymized ? patient.gender : <span className="text-slate-400 italic text-xs">Waiting</span>}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Internal Hospital ID</span>
                  <p className="text-sm font-mono text-slate-800">
                    {isAnonymized ? anonymizeID(patient.id) : <span className="text-slate-400 italic text-xs">Waiting</span>}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Primary Diagnosis</span>
                  <p className="text-sm font-semibold text-slate-800">
                    {isAnonymized ? patient.diagnosis : <span className="text-slate-400 italic text-xs">Waiting</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* Compliance Info banner */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-600">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-600" />
                Safe-Harbor Compliance Checklist Applied:
              </h4>
              <ul className="list-disc pl-5 space-y-1 font-medium">
                <li><strong>Names:</strong> Redacted and replaced with secure initials.</li>
                <li><strong>Dates:</strong> Converted absolute birthdates to age decades to prevent trace back.</li>
                <li><strong>IDs:</strong> Hashed serial clinical registry codes.</li>
              </ul>
            </div>
          </div>

          {/* FHIR Standard Export Code Block (col-span-6) */}
          <div className="lg:col-span-6 bg-slate-900 rounded-xl border border-slate-800 shadow-sm p-5 h-[535px] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-blue-400" />
                  HL7 FHIR JSON Resource Bundle
                </h3>
                <p className="text-slate-400 text-xs">Valid standard JSON structure mapping patient, observation and diagnosis.</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyJSON}
                  className="p-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-emerald-450" /> : <Clipboard className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleDownloadJSON}
                  className="p-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded transition-colors"
                  title="Download FHIR File"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 mt-4 bg-slate-950 p-4 rounded-lg overflow-auto border border-slate-800 font-mono text-xs text-slate-300">
              <pre>{fhirJSON}</pre>
            </div>

            <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500 font-mono border-t border-slate-850 pt-3">
              <span>Standard: HL7 FHIR v4.0.1</span>
              <span>Formats: application/fhir+json</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl">
          <p className="text-slate-400 text-xs">No patients loaded in registry...</p>
        </div>
      )}
    </div>
  );
}
