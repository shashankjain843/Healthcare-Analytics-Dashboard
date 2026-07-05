/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Overview from "./components/Overview";
import ReadmissionPredictor from "./components/ReadmissionPredictor";
import PatientSummaries from "./components/PatientSummaries";
import DiseaseForecaster from "./components/DiseaseForecaster";
import TreatmentEffectiveness from "./components/TreatmentEffectiveness";
import FHIRCompliance from "./components/FHIRCompliance";
import LoginPage, { LoginUser } from "./components/LoginPage";
import ProjectReport from "./components/ProjectReport";

import { Patient, DiseaseForecast, SurvivalAnalysis, UserRole, AuditLog } from "./types";
import { INITIAL_PATIENTS, DISEASE_FORECASTS, SURVIVAL_STUDIES, INITIAL_AUDIT_LOGS } from "./data";
import {
  Stethoscope,
  ShieldAlert,
  CheckCircle,
  Clock,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";

// ─── Notification type ────────────────────────────────────────────────────────
interface Notification {
  id: string;
  type: "success" | "info" | "warning" | "error";
  title: string;
  message: string;
  timestamp: string;
}

// ─── localStorage keys ────────────────────────────────────────────────────────
const LS_PATIENTS   = "apexhealth_patients";
const LS_AUDITLOGS  = "apexhealth_auditlogs";
const LS_LOGGED_IN  = "apexhealth_loggedin";
const LS_USER       = "apexhealth_user";

// ─── Helper: safe JSON parse ──────────────────────────────────────────────────
function safeParseJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

// ═════════════════════════════════════════════════════════════════════════════
export default function App() {

  // ── Auth State (persisted in localStorage) ──────────────────────────────
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() =>
    localStorage.getItem(LS_LOGGED_IN) === "true"
  );
  const [loggedInUser, setLoggedInUser] = useState<LoginUser | null>(() =>
    safeParseJSON<LoginUser | null>(LS_USER, null)
  );

  // ── Navigation ────────────────────────────────────────────────────────────
  const [currentTab, setCurrentTab] = useState<string>("overview");

  // ── Derived role (from logged-in user, never from a free dropdown) ────────
  const currentRole: UserRole = loggedInUser?.role ?? "Doctor";

  // ── Core Data (patients persisted in localStorage) ────────────────────────
  const [patients, setPatients] = useState<Patient[]>(() =>
    safeParseJSON<Patient[]>(LS_PATIENTS, INITIAL_PATIENTS)
  );

  const [forecasts]  = useState<DiseaseForecast[]>(DISEASE_FORECASTS);
  const [studies]    = useState<SurvivalAnalysis[]>(SURVIVAL_STUDIES);

  // ── Audit Logs (persisted, capped at 200) ────────────────────────────────
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() =>
    safeParseJSON<AuditLog[]>(LS_AUDITLOGS, INITIAL_AUDIT_LOGS)
  );

  // ── Notifications ─────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // ── Persist patients to localStorage ─────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(LS_PATIENTS, JSON.stringify(patients));
  }, [patients]);

  // ── Persist audit logs to localStorage (keep last 200) ───────────────────
  useEffect(() => {
    localStorage.setItem(LS_AUDITLOGS, JSON.stringify(auditLogs.slice(0, 200)));
  }, [auditLogs]);

  // ── Notification helper ───────────────────────────────────────────────────
  const triggerNotification = (
    title: string,
    message: string,
    type: "success" | "info" | "warning" | "error" = "info"
  ) => {
    const id = `notif-${Math.random().toString(36).substr(2, 9)}`;
    const newNotif: Notification = {
      id, type, title, message,
      timestamp: new Date().toLocaleTimeString(),
    };
    setNotifications((prev) => [newNotif, ...prev].slice(0, 5));
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  // ── Audit Logger ──────────────────────────────────────────────────────────
  const handleAddAuditLog = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      user: loggedInUser?.name ?? "Unknown User",
      role: currentRole,
      action,
      status: "Success",
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // ── Login Handler ─────────────────────────────────────────────────────────
  const handleLogin = (user: LoginUser) => {
    setLoggedInUser(user);
    setIsLoggedIn(true);
    localStorage.setItem(LS_LOGGED_IN, "true");
    localStorage.setItem(LS_USER, JSON.stringify(user));

    // Record login in audit trail
    const loginLog: AuditLog = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      user: user.name,
      role: user.role,
      action: "User Login",
      status: "Success",
      details: `${user.name} (${user.role}) authenticated and accessed the ApexHealth AI Clinical Portal.`,
    };
    setAuditLogs((prev) => [loginLog, ...prev]);

    triggerNotification(
      "Login Successful",
      `Welcome, ${user.name}. ${user.role} session started.`,
      "success"
    );
    setCurrentTab("overview");
  };

  // ── Logout Handler ────────────────────────────────────────────────────────
  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoggedInUser(null);
    setCurrentTab("overview");
    setNotifications([]);
    localStorage.removeItem(LS_LOGGED_IN);
    localStorage.removeItem(LS_USER);
    // Note: patient data and audit logs are intentionally kept in localStorage
  };

  // ── EHR Actions ──────────────────────────────────────────────────────────
  const handleAddPatient = (newPatient: Patient) => {
    setPatients((prev) => [newPatient, ...prev]);
    handleAddAuditLog(
      "Created Patient EHR",
      `Successfully created new EHR record for: ${newPatient.name} (${newPatient.id})`
    );
  };

  const handleUpdatePatient = (updatedPatient: Patient) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
    );
    handleAddAuditLog(
      "Updated Patient EHR",
      `Updated clinical biomarkers and risk classification for: ${updatedPatient.name} (${updatedPatient.id})`
    );
  };

  const handleNavigateTo = (tab: string) => {
    setCurrentTab(tab);
    handleAddAuditLog("Tab Transition", `Navigated to module: ${tab}`);
  };

  // ── Render Active Module ──────────────────────────────────────────────────
  const renderContent = () => {
    switch (currentTab) {
      case "overview":
        return (
          <Overview
            patients={patients}
            forecasts={forecasts}
            auditLogs={auditLogs}
            currentRole={currentRole}
            onNavigateTo={handleNavigateTo}
          />
        );
      case "readmissions":
        return (
          <ReadmissionPredictor
            patients={patients}
            onAddPatient={handleAddPatient}
            onUpdatePatient={handleUpdatePatient}
            currentRole={currentRole}
            onAddAuditLog={handleAddAuditLog}
            triggerNotification={triggerNotification}
          />
        );
      case "patient-summaries":
        return (
          <PatientSummaries
            patients={patients}
            currentRole={currentRole}
            onAddAuditLog={handleAddAuditLog}
            triggerNotification={triggerNotification}
          />
        );
      case "forecaster":
        return (
          <DiseaseForecaster
            forecasts={forecasts}
            currentRole={currentRole}
            onAddAuditLog={handleAddAuditLog}
          />
        );
      case "treatments":
        return (
          <TreatmentEffectiveness
            studies={studies}
            currentRole={currentRole}
            onAddAuditLog={handleAddAuditLog}
          />
        );
      case "fhir":
        return (
          <FHIRCompliance
            patients={patients}
            currentRole={currentRole}
            onAddAuditLog={handleAddAuditLog}
            triggerNotification={triggerNotification}
          />
        );
      case "report":
        return (
          <ProjectReport
            patients={patients}
            currentRole={currentRole}
            onAddAuditLog={handleAddAuditLog}
          />
        );
      default:
        return (
          <div className="p-8 text-center text-slate-500">Module not found.</div>
        );
    }
  };

  // ── Show Login Page if not authenticated ──────────────────────────────────
  if (!isLoggedIn || !loggedInUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // ── Main Dashboard ────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans antialiased text-slate-800">
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
        .animate-slideIn {
          animation: slideIn 0.25s cubic-bezier(0.16,1,0.3,1) forwards;
        }
      `}</style>

      {/* ── Floating Notification Toast Stack ── */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
        {notifications.map((notif) => {
          let bgClass = "bg-white border-slate-200 text-slate-800 shadow-xl";
          let icon    = <Info className="w-4 h-4 text-blue-500" />;
          if (notif.type === "success") {
            bgClass = "bg-emerald-50 border-emerald-200 text-slate-800 shadow-lg shadow-emerald-500/5";
            icon    = <CheckCircle className="w-4 h-4 text-emerald-600" />;
          } else if (notif.type === "warning") {
            bgClass = "bg-amber-50 border-amber-200 text-slate-800 shadow-lg shadow-amber-500/5";
            icon    = <AlertTriangle className="w-4 h-4 text-amber-600" />;
          } else if (notif.type === "error") {
            bgClass = "bg-rose-50 border-rose-200 text-slate-800 shadow-lg shadow-rose-500/5";
            icon    = <ShieldAlert className="w-4 h-4 text-rose-600" />;
          }
          return (
            <div
              key={notif.id}
              className={`p-3.5 rounded-xl border flex gap-3 items-start transition-all duration-300 animate-slideIn ${bgClass}`}
            >
              <div className="flex-shrink-0 mt-0.5">{icon}</div>
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-bold text-slate-900 leading-snug">{notif.title}</h5>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-normal">{notif.message}</p>
                <span className="text-[9px] text-slate-400 font-mono mt-1 block">{notif.timestamp}</span>
              </div>
              <button
                onClick={() => setNotifications((prev) => prev.filter((n) => n.id !== notif.id))}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-100/50 flex-shrink-0 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Sidebar ── */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={handleNavigateTo}
        currentRole={currentRole}
        loggedInUser={loggedInUser}
        onLogout={handleLogout}
        onAddAuditLog={handleAddAuditLog}
      />

      {/* ── Main Content Workspace ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium text-xs font-mono uppercase tracking-wider">
              Clinical Analytics Console
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            {/* Role badge — now shows the login-assigned role */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[11px] font-bold ${
                currentRole === "Admin"
                  ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                  : currentRole === "Doctor"
                  ? "bg-blue-50 text-blue-700 border-blue-100"
                  : "bg-amber-50 text-amber-700 border-amber-100"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  currentRole === "Admin"
                    ? "bg-indigo-500"
                    : currentRole === "Doctor"
                    ? "bg-blue-500"
                    : "bg-amber-500"
                }`}
              />
              <span>
                Privilege:{" "}
                <strong className="capitalize font-extrabold">{currentRole}</strong> Mode
              </span>
            </div>

            <div className="text-slate-300 hidden sm:block">|</div>

            <div className="text-slate-500 font-mono text-[11px] flex items-center gap-1 hidden sm:flex">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>UTC Session</span>
            </div>

            {/* Logged-in user name */}
            <div className="hidden md:flex items-center gap-1.5 text-slate-500 text-[11px] font-mono">
              <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
              <span>{loggedInUser.name}</span>
            </div>
          </div>
        </header>

        {/* Workspace Canvas */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
