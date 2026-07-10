/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend,
  CartesianGrid
} from "recharts";
import { 
  Users, 
  Activity, 
  AlertOctagon, 
  Cpu, 
  ShieldAlert, 
  Clock, 
  Search,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { Patient, DiseaseForecast, AuditLog, UserRole } from "../types";

interface OverviewProps {
  patients: Patient[];
  forecasts: DiseaseForecast[];
  auditLogs: AuditLog[];
  currentRole: UserRole;
  onNavigateTo: (tab: string) => void;
}

export default function Overview({
  patients,
  forecasts,
  auditLogs,
  currentRole,
  onNavigateTo
}: OverviewProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Aggregate Data
  const totalPatients = patients.length;
  
  const highRiskPatientsCount = patients.filter(p => p.riskCategory === "High").length;
  const medRiskPatientsCount = patients.filter(p => p.riskCategory === "Medium").length;
  const lowRiskPatientsCount = patients.filter(p => p.riskCategory === "Low").length;

  const readmissionRate = ((patients.filter(p => p.riskScore >= 50).length / totalPatients) * 100).toFixed(1);
  const activeSurges = forecasts.filter(f => f.alertLevel === "High").length;

  // ── Derived KPIs (Feature-Engineered) ──────────────────────────────────────
  const avgAge = totalPatients > 0
    ? (patients.reduce((sum, p) => sum + p.age, 0) / totalPatients).toFixed(1)
    : "0";

  const avgLengthOfStay = totalPatients > 0
    ? (patients.reduce((sum, p) => sum + p.lengthOfStay, 0) / totalPatients).toFixed(1)
    : "0";

  // Bed Occupancy: assume 20 total beds for simulation; occupied = patients admitted in last 30 days
  const totalBeds = 20;
  const occupiedBeds = Math.min(totalPatients, totalBeds);
  const bedOccupancyRate = ((occupiedBeds / totalBeds) * 100).toFixed(0);

  // Mortality Rate Estimate: Risk-adjusted (high risk patients × 3% mortality estimate)
  const mortalityRateEstimate = ((highRiskPatientsCount * 3) / totalPatients).toFixed(1);

  // Pie chart data for risk cohorts
  const riskCohortData = [
    { name: "High Risk (≥60%)", value: highRiskPatientsCount, color: "#f43f5e" }, // rose-500
    { name: "Moderate Risk (30-59%)", value: medRiskPatientsCount, color: "#f59e0b" }, // amber-500
    { name: "Low Risk (<30%)", value: lowRiskPatientsCount, color: "#10b981" } // emerald-500
  ];

  // Bar chart data for diagnosis distribution
  const diagnosisCounts = patients.reduce((acc: { [key: string]: number }, p) => {
    acc[p.diagnosis] = (acc[p.diagnosis] || 0) + 1;
    return acc;
  }, {});

  const diagnosisChartData = Object.keys(diagnosisCounts).map(key => ({
    name: key,
    "Patient Count": diagnosisCounts[key]
  }));

  const filteredLogs = auditLogs.filter(log => 
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // KPI Card config for all 7 metrics
  const kpiCards = [
    {
      id: "total-patients",
      label: "Total Patients",
      value: String(totalPatients),
      subLabel: "Active EHR profiles",
      badge: "↑ Active",
      badgeColor: "text-emerald-600",
      onClick: undefined,
    },
    {
      id: "avg-age",
      label: "Average Age",
      value: `${avgAge} yrs`,
      subLabel: "Mean patient age in cohort",
      badge: "Geriatric Risk",
      badgeColor: "text-amber-600",
      onClick: undefined,
    },
    {
      id: "readmission-rate",
      label: "Readmission Rate",
      value: `${readmissionRate}%`,
      subLabel: "30-day predicted risk (≥50%)",
      badge: `${highRiskPatientsCount} Critical`,
      badgeColor: "text-rose-600",
      onClick: () => onNavigateTo("readmissions"),
    },
    {
      id: "bed-occupancy",
      label: "Bed Occupancy Rate",
      value: `${bedOccupancyRate}%`,
      subLabel: `${occupiedBeds}/${totalBeds} beds occupied`,
      badge: bedOccupancyRate >= "85" ? "⚠ High" : "Stable",
      badgeColor: parseInt(bedOccupancyRate) >= 85 ? "text-rose-600" : "text-emerald-600",
      onClick: undefined,
    },
    {
      id: "avg-los",
      label: "Avg Length of Stay",
      value: `${avgLengthOfStay} days`,
      subLabel: "Mean inpatient stay duration",
      badge: "Discharge Metric",
      badgeColor: "text-blue-600",
      onClick: undefined,
    },
    {
      id: "mortality-rate",
      label: "Mortality Rate (Est.)",
      value: `${mortalityRateEstimate}%`,
      subLabel: "Risk-adjusted 30-day estimate",
      badge: "Clinical KPI",
      badgeColor: "text-slate-500",
      onClick: undefined,
    },
    {
      id: "high-risk",
      label: "High Risk Patients",
      value: String(highRiskPatientsCount),
      subLabel: "Immediate follow-up required",
      badge: `${activeSurges} Outbreaks Active`,
      badgeColor: "text-amber-600",
      onClick: () => onNavigateTo("forecaster"),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Hospital Command Center</h2>
          <p className="text-slate-500 text-sm">Real-time analytical metrics, active disease monitoring, and compliance logs.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg px-3 py-1.5 text-xs font-semibold self-start md:self-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live EHR Sync Active
        </div>
      </div>

      {/* 7 KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {kpiCards.map((card) => {
          const Tag = card.onClick ? "button" : "div";
          return (
            <Tag
              key={card.id}
              id={`kpi-${card.id}`}
              onClick={card.onClick}
              className={`bg-white p-4 border border-slate-200 rounded-xl shadow-sm flex flex-col justify-between text-left transition-all ${
                card.onClick ? "hover:border-blue-400 hover:shadow-md cursor-pointer group" : ""
              }`}
            >
              <p className={`text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 ${card.onClick ? "group-hover:text-blue-600 transition-colors" : ""}`}>
                {card.label}
              </p>
              <div className="mt-1">
                <span className="text-2xl font-extrabold text-slate-900 leading-none">{card.value}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-[9px] text-slate-400 leading-tight">{card.subLabel}</p>
                <span className={`text-[9px] font-bold ${card.badgeColor}`}>{card.badge}</span>
              </div>
            </Tag>
          );
        })}
      </div>


      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Readmission Risk Distribution (Pie) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Readmission Risk Cohort Distribution</h3>
            <p className="text-slate-400 text-xs mt-0.5">Calculated probabilities across full patient registry.</p>
          </div>
          <div className="h-60 mt-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskCohortData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskCohortData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} Patients`, 'Registry Size']} 
                  contentStyle={{ backgroundColor: "#1e293b", color: "#f8fafc", borderRadius: 8, border: "none" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Custom legend */}
          <div className="space-y-1.5 mt-2">
            {riskCohortData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="text-slate-900 font-bold">{item.value} ({((item.value / totalPatients)*100).toFixed(0)}%)</span>
              </div>
            ))}
          </div>
          {/* Chart Insight Panel */}
          <div className="mt-3 p-2.5 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-[10px] text-blue-800 font-semibold uppercase tracking-wide mb-1">📊 Clinical Insight</p>
            <p className="text-[10px] text-blue-700 leading-relaxed">
              {highRiskPatientsCount > 0
                ? `${highRiskPatientsCount} patient(s) are classified as HIGH RISK (≥60%) and require priority discharge follow-up to reduce hospital readmission burden.`
                : "All patients are currently at low-to-moderate risk. Continue standard monitoring protocols."}
            </p>
          </div>
        </div>

        {/* Diagnosis Demographics (Bar) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-3 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Clinical Cohorts by Primary Diagnosis</h3>
            <p className="text-slate-400 text-xs mt-0.5">Distribution of clinical pathways logged in system.</p>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diagnosisChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1e293b", color: "#f8fafc", borderRadius: 8, border: "none" }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="Patient Count" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-400 italic text-center mt-2">
            * Note: Patient categories map directly to primary hospital admission ICD-10 codings.
          </div>
          {/* Chart Insight Panel */}
          <div className="mt-2 p-2.5 bg-amber-50 border border-amber-100 rounded-lg">
            <p className="text-[10px] text-amber-800 font-semibold uppercase tracking-wide mb-1">📊 Visualization Insight</p>
            <p className="text-[10px] text-amber-700 leading-relaxed">
              Diagnosis distribution helps hospital administrators allocate specialist resources. Departments with the highest patient volumes may require additional staffing or dedicated ward capacity.
            </p>
          </div>
        </div>
      </div>

      {/* HIPAA Compliance Audit Logs */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4 mb-4">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              HIPAA Privacy & Compliance Access Logs
            </h3>
            <p className="text-slate-400 text-xs">Real-time simulation of system audits for active patient record reads and writes.</p>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {currentRole === "Staff" ? (
          <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2">
            <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="font-bold text-slate-700 text-sm">Elevated Privileges Required</h4>
            <p className="text-slate-500 text-xs max-w-md mx-auto">
              Your simulated role (<strong>Staff</strong>) is restricted. Only <strong>Doctors</strong> and <strong>Administrators</strong> can review active HIPAA system audit trails.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-3">Log ID</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">User (Role)</th>
                  <th className="py-2.5 px-3">System Action</th>
                  <th className="py-2.5 px-3">Details</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-slate-400">No logs found matching filter.</td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">{log.id}</td>
                      <td className="py-2.5 px-3 text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-slate-800">{log.user}</span>
                        <span className="ml-1.5 px-1.5 py-0.5 bg-slate-100 text-[10px] text-slate-600 border border-slate-200 rounded font-mono capitalize">{log.role}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-800 font-semibold">{log.action}</td>
                      <td className="py-2.5 px-3 text-slate-500 truncate max-w-xs">{log.details}</td>
                      <td className="py-2.5 px-3">
                        {log.status === "Success" ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] border border-emerald-100">
                            <CheckCircle className="w-3 h-3" /> OK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded-full text-[10px] border border-red-100">
                            <AlertTriangle className="w-3 h-3" /> FAILED
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
