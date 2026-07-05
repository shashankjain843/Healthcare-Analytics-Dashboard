/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  ComposedChart,
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  ShieldAlert, 
  Calendar,
  Activity,
  PlusCircle,
  Clock,
  Sparkles
} from "lucide-react";
import { DiseaseForecast, UserRole } from "../types";

interface DiseaseForecasterProps {
  forecasts: DiseaseForecast[];
  currentRole: UserRole;
  onAddAuditLog: (action: string, details: string) => void;
}

export default function DiseaseForecaster({
  forecasts,
  currentRole,
  onAddAuditLog
}: DiseaseForecasterProps) {
  // Filters
  const [selectedRegion, setSelectedRegion] = useState("Metropolitan Area A");
  const [selectedDisease, setSelectedDisease] = useState("Influenza");

  // Get regions & diseases from forecasts data
  const regions = Array.from(new Set(forecasts.map(f => f.region)));
  const diseases = Array.from(new Set(forecasts.map(f => f.diseaseName)));

  // Filter forecasts
  const activeForecast = forecasts.find(f => 
    f.region === selectedRegion && f.diseaseName === selectedDisease
  ) || forecasts[0];

  const handleFilterChange = (region: string, disease: string) => {
    setSelectedRegion(region);
    setSelectedDisease(disease);
    onAddAuditLog("Filtered Outbreak Forecast", `Viewed surveillance trends for ${disease} in ${region}.`);
  };

  // Recommendations mapping
  const getResourcePlanningAdvice = (alertLevel: string, disease: string) => {
    if (alertLevel === "High") {
      switch (disease) {
        case "Influenza":
          return [
            "Mandate high-risk inpatient masks in geriatric wings.",
            "Pre-allocate 15% emergency bed buffer in General Medicine.",
            "Accelerate community vaccination campaigns.",
            "Audit hospital stockpiles of Oseltamivir (Tamiflu) and IV fluids."
          ];
        case "Dengue Fever":
          return [
            "Trigger regional municipal vector spraying procedures.",
            "Equip primary care screens for mosquito protection.",
            "Verify blood transfusion platelets reserves.",
            "Establish diagnostic PCR sorting for early febrile patients."
          ];
        case "COVID-19":
          return [
            "Reinstate respiratory screening in Emergency Department.",
            "Check ventilation exchanges in negative-pressure suites.",
            "Increase testing kit inventories.",
            "Optimize Paxlovid anti-viral outpatient prescriptions."
          ];
        default:
          return [
            "Increase quarantine isolation unit capacity.",
            "Deploy staff sanitization refreshers.",
            "Inform county health authorities of surge rates."
          ];
      }
    } else if (alertLevel === "Medium") {
      return [
        "Monitor emergency admissions trends weekly.",
        "Ensure standard clinician sanitization protocol compliance.",
        "Assess auxiliary staffing schedules."
      ];
    } else {
      return [
        "Normal baseline operations. Retain standard epidemiological surveillance metrics."
      ];
    }
  };

  const planningAdvice = activeForecast 
    ? getResourcePlanningAdvice(activeForecast.alertLevel, activeForecast.diseaseName)
    : ["No active advice."];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Epidemiological Outbreak Forecasting</h2>
        <p className="text-slate-500 text-sm">Time-series forecasting models (ARIMA/Prophet style) predicting caseload trends over the next 30 days.</p>
      </div>

      {/* Control Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="space-y-1 w-full sm:w-64">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Surveillance Region</label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <select
                value={selectedRegion}
                onChange={(e) => handleFilterChange(e.target.value, selectedDisease)}
                className="pl-9 pr-4 py-1.5 w-full bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer animate-none"
              >
                {regions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1 w-full sm:w-64">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Target Pathogen</label>
            <div className="relative">
              <Activity className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <select
                value={selectedDisease}
                onChange={(e) => handleFilterChange(selectedRegion, e.target.value)}
                className="pl-9 pr-4 py-1.5 w-full bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer animate-none"
              >
                {diseases.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-[11px] text-slate-500 font-medium">Model Last Retrained: Today, 04:00 AM</span>
        </div>
      </div>

      {activeForecast ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Outbreak Status Cards (col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Surge Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="font-bold text-slate-800 text-sm">Epidemiological Profile</h3>
                <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider border ${
                  activeForecast.alertLevel === "High" ? "bg-red-50 text-red-700 border-red-100" :
                  activeForecast.alertLevel === "Medium" ? "bg-amber-50 text-amber-700 border-amber-100" :
                  "bg-emerald-50 text-emerald-700 border-emerald-100"
                }`}>
                  {activeForecast.alertLevel} Alert Level
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Estimated Peak</p>
                  <p className="text-xl font-black text-slate-900 mt-1">{activeForecast.peakCasesCount}</p>
                  <p className="text-[9px] text-slate-500 mt-0.5">weekly cases</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Trend Direction</p>
                  <div className="flex items-center gap-1 mt-1">
                    {activeForecast.currentTrend === "Rising" ? (
                      <>
                        <TrendingUp className="w-5 h-5 text-red-500" />
                        <span className="font-bold text-red-600 text-sm">Rising Surge</span>
                      </>
                    ) : activeForecast.currentTrend === "Declining" ? (
                      <>
                        <TrendingDown className="w-5 h-5 text-emerald-500" />
                        <span className="font-bold text-emerald-600 text-sm">Declining</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-5 h-5 text-slate-400" />
                        <span className="font-bold text-slate-600 text-sm">Stable Plateau</span>
                      </>
                    )}
                  </div>
                  <p className="text-[9px] text-slate-500 mt-0.5">from prior 4 weeks</p>
                </div>
              </div>

              <div className="p-3 bg-slate-900 text-slate-300 rounded-lg text-xs space-y-1 font-mono">
                <div className="flex items-center justify-between text-[11px]">
                  <span>Model Type:</span>
                  <span className="text-blue-400 font-bold">Facebook Prophet</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Seasonality:</span>
                  <span className="text-blue-400">Additive Weekly</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>MAPE Error Rate:</span>
                  <span className="text-blue-400 font-bold">4.82% (Excellent)</span>
                </div>
              </div>
            </div>

            {/* Recommendations Panel */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-blue-600" />
                Resource Allocation Protocol
              </h3>
              <p className="text-slate-400 text-xs">Guidelines triggered by forecasted caseload increases.</p>

              <div className="space-y-2.5 mt-3">
                {planningAdvice.map((advice, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                    <span className="text-blue-600 font-bold flex-shrink-0 mt-0.5">✓</span>
                    <p className="font-medium">{advice}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Composed Time-Series Forecasting Chart (col-span-8) */}
          <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-[450px]">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Case Incidence & 14-Day Outbreak Forecast Curve</h3>
              <p className="text-slate-400 text-xs mt-0.5">Solid curve represents documented clinical counts; dashed represents machine-forecast boundaries.</p>
            </div>

            <div className="h-72 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={activeForecast.data} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} label={{ value: 'Cases Count', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#64748b' } }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1e293b", color: "#f8fafc", borderRadius: 8, border: "none" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  {/* Shaded Confidence Intervals */}
                  <Area 
                    type="monotone" 
                    dataKey="confidenceUpper" 
                    stroke="none" 
                    fill="#2563eb" 
                    fillOpacity={0.06} 
                    name="95% CI Upper Boundary"
                    legendType="none"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="confidenceLower" 
                    stroke="none" 
                    fill="#2563eb" 
                    fillOpacity={0.06} 
                    name="95% CI Lower Boundary"
                    legendType="none"
                  />
                  
                  {/* Historical Cases */}
                  <Line 
                    type="monotone" 
                    dataKey="historical" 
                    stroke="#6366f1" 
                    strokeWidth={3} 
                    dot={{ r: 4, strokeWidth: 1 }} 
                    name="Observed Clinical Count" 
                  />
                  
                  {/* Projected Forecast */}
                  <Line 
                    type="monotone" 
                    dataKey="forecast" 
                    stroke="#2563eb" 
                    strokeWidth={2.5} 
                    strokeDasharray="5 5" 
                    dot={{ r: 3, strokeWidth: 1 }} 
                    name="Predicted Forecast" 
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-800 border border-blue-100 rounded-lg text-xs">
              <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <p className="text-[11px] leading-snug">
                <strong>Epidemiological insight:</strong> Current forecasting model displays peak surge during the <strong>mid-July</strong> cycle. Consider pre-positioning nursing reserves during this bracket.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl">
          <p className="text-slate-400 text-xs">Loading surveillance profile...</p>
        </div>
      )}
    </div>
  );
}
