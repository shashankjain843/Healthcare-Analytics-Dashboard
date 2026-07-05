/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  Stethoscope,
  Activity,
  TrendingUp,
  ClipboardList,
  ShieldCheck,
  Layers,
  FileText,
  LogOut,
  FileBarChart,
  User,
} from "lucide-react";
import { UserRole } from "../types";
import { LoginUser } from "./LoginPage";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentRole: UserRole;
  loggedInUser: LoginUser;
  onLogout: () => void;
  onAddAuditLog: (action: string, details: string) => void;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  currentRole,
  loggedInUser,
  onLogout,
  onAddAuditLog,
}: SidebarProps) {
  const menuItems = [
    { id: "overview",          label: "Hospital Overview",   icon: Layers       },
    { id: "readmissions",      label: "Patient Readmissions", icon: ClipboardList },
    { id: "patient-summaries", label: "Patient Summaries",   icon: FileText     },
    { id: "forecaster",        label: "Outbreak Forecasting", icon: TrendingUp   },
    { id: "treatments",        label: "Treatment Outcomes",  icon: Activity     },
    { id: "fhir",              label: "HIPAA & FHIR Standard", icon: ShieldCheck },
    { id: "report",            label: "Project Report",      icon: FileBarChart },
  ];

  const roleColors: Record<UserRole, { dot: string; badge: string; text: string }> = {
    Doctor: { dot: "bg-blue-500",   badge: "bg-blue-900/40 border-blue-800/40", text: "text-blue-300" },
    Admin:  { dot: "bg-indigo-500", badge: "bg-indigo-900/40 border-indigo-800/40", text: "text-indigo-300" },
    Staff:  { dot: "bg-amber-500",  badge: "bg-amber-900/40 border-amber-800/40", text: "text-amber-300" },
  };
  const rc = roleColors[currentRole];

  const handleLogoutClick = () => {
    onAddAuditLog("User Logout", `${loggedInUser.name} (${loggedInUser.role}) securely logged out of the clinical portal.`);
    onLogout();
  };

  return (
    <div className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen border-r border-slate-800 flex-shrink-0">

      {/* ── Brand Header ── */}
      <div className="p-5 flex items-center gap-3 border-b border-slate-800 bg-slate-950">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
          <Stethoscope className="w-4 h-4" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight text-white leading-none">
            ApexHealth AI
          </h1>
          <span className="text-slate-500 text-[10px] font-mono uppercase tracking-wider">
            EHR Analytics Engine
          </span>
        </div>
      </div>

      {/* ── Navigation Links ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Modules
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          const isReport = item.id === "report";
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                  : isReport
                  ? "text-slate-400 hover:bg-slate-800/60 hover:text-emerald-400 border border-dashed border-slate-800 hover:border-emerald-900/60"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 ${
                  isActive ? "text-white" : isReport && !isActive ? "text-emerald-500/70" : "opacity-60"
                }`}
              />
              <span>{item.label}</span>
              {isReport && !isActive && (
                <span className="ml-auto text-[9px] font-bold text-emerald-500/70 bg-emerald-900/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
                  PDF
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Logged-in User Card + Logout ── */}
      <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-3">
        {/* User info */}
        <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border ${rc.badge}`}>
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-700 flex-shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${rc.dot} animate-pulse flex-shrink-0`} />
              <p className={`text-xs font-bold truncate ${rc.text}`}>{loggedInUser.name}</p>
            </div>
            <p className="text-[10px] text-slate-500 truncate">{loggedInUser.title}</p>
          </div>
        </div>

        {/* Logout button */}
        <button
          id="logout-btn"
          onClick={handleLogoutClick}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-900/50 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
