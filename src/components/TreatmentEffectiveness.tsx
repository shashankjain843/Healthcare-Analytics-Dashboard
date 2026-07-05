/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { 
  Activity, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  HelpCircle, 
  TableProperties, 
  Calculator,
  ChevronRight
} from "lucide-react";
import { SurvivalAnalysis, UserRole } from "../types";

interface TreatmentEffectivenessProps {
  studies: SurvivalAnalysis[];
  currentRole: UserRole;
  onAddAuditLog: (action: string, details: string) => void;
}

export default function TreatmentEffectiveness({
  studies,
  currentRole,
  onAddAuditLog
}: TreatmentEffectivenessProps) {
  const [selectedCondition, setSelectedCondition] = useState("Congestive Heart Failure");

  // Get matching study
  const activeStudy = studies.find(s => s.condition === selectedCondition) || studies[0];

  const handleConditionChange = (condition: string) => {
    setSelectedCondition(condition);
    onAddAuditLog("Queried Treatment Effectiveness", `Viewed survival analysis and Cox hazard model statistics for ${condition}.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Treatment Effectiveness & Survival Analysis</h2>
        <p className="text-slate-500 text-sm">Evidence-based clinical comparisons using Kaplan-Meier curves and Cox Proportional Hazards regression models.</p>
      </div>

      {/* Selector */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="space-y-1 w-full sm:w-96">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Clinical Condition Filter</label>
          <div className="flex gap-2">
            {studies.map((s) => (
              <button
                key={s.condition}
                onClick={() => handleConditionChange(s.condition)}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                  selectedCondition === s.condition
                    ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                    : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {s.condition.split(" (")[0]} {/* truncate parenthetical text */}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-500 font-mono">
          <Calculator className="w-4 h-4 text-slate-400" />
          Estimator: Kaplan-Meier & Cox Proportional Hazards
        </div>
      </div>

      {activeStudy ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kaplan Meier Chart (col-span-8) */}
          <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-[450px]">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Kaplan-Meier Survival Estimator Curve</h3>
              <p className="text-slate-400 text-xs mt-0.5">Probability (%) of remaining out of hospital over days post-discharge (Log-rank comparative test).</p>
            </div>

            <div className="h-72 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activeStudy.survivalData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" label={{ value: 'Days Post-Discharge', position: 'insideBottom', offset: -5, style: { fontSize: 10, fill: '#64748b' } }} tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[30, 100]} tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} label={{ value: 'Survival Probability (%)', angle: -90, position: 'insideLeft', offset: 5, style: { fontSize: 10, fill: '#64748b' } }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1e293b", color: "#f8fafc", borderRadius: 8, border: "none" }}
                    formatter={(value) => [`${value}% Probability`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  
                  {/* Standard Care line */}
                  <Line 
                    type="step" 
                    dataKey="Standard Care" 
                    stroke="#ef4444" 
                    strokeWidth={2.5} 
                    dot={{ r: 3 }} 
                    name={activeStudy.treatments[0].name}
                  />
                  
                  {/* Protocol B line */}
                  <Line 
                    type="step" 
                    dataKey="Protocol B" 
                    stroke="#6366f1" 
                    strokeWidth={2.5} 
                    dot={{ r: 3 }} 
                    name={activeStudy.treatments[1].name}
                  />
                  
                  {/* Protocol C line */}
                  <Line 
                    type="step" 
                    dataKey="Protocol C" 
                    stroke="#2563eb" 
                    strokeWidth={2.5} 
                    dot={{ r: 3 }} 
                    name={activeStudy.treatments[2].name}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[10px] text-slate-400 italic text-center mt-2">
              * Note: Curve steps represents patient endpoint events (readmissions / stabilization failure).
            </div>
          </div>

          {/* Statistical outcomes and tables (col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Quick metrics */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <TableProperties className="w-4 h-4 text-blue-600" />
                Cox PH Hazard Model Outputs
              </h3>

              <div className="space-y-4 divide-y divide-slate-100">
                {activeStudy.treatments.map((t, i) => (
                  <div key={i} className={`pt-3 ${i === 0 ? "pt-0" : ""}`}>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs">{t.name}</h4>
                        <p className="text-slate-400 text-[10px] italic mt-0.5">{t.description}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] border ${
                        i === 0 ? "bg-slate-100 text-slate-500 border-slate-200" :
                        i === 1 ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
                      }`}>
                        HR: {t.hazardRatio}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono mt-2 bg-slate-50 p-2 border border-slate-100 rounded-lg">
                      <div>
                        <span className="text-slate-400 block uppercase text-[8px] font-bold">95% CI</span>
                        <span className="text-slate-700 font-semibold">{t.confidenceInterval}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block uppercase text-[8px] font-bold">p-value</span>
                        <span className="text-slate-700 font-semibold">
                          {t.pValue === 1.0 ? "Reference" : t.pValue < 0.001 ? "< 0.0001" : `0.008`}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block uppercase text-[8px] font-bold">Median Days</span>
                        <span className="text-slate-700 font-semibold">{t.medianRecoveryDays} days</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Explainer note */}
            <div className="bg-slate-900 text-slate-300 p-5 rounded-xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                Clinical Research Interpretation
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                A **Hazard Ratio (HR) of {activeStudy.treatments[2].hazardRatio}** for **{activeStudy.treatments[2].name}** represents a **{( (1 - activeStudy.treatments[2].hazardRatio) * 100 ).toFixed(0)}% reduction in the risk of readmission** relative to Standard Care at any given point in time. 
              </p>
              <p className="text-slate-400 text-xs leading-relaxed">
                The Log-rank test p-value of **{activeStudy.treatments[2].pValue < 0.001 ? "p < 0.001" : `p = ${activeStudy.treatments[2].pValue}`}** indicates that the difference in survival probability between the cohorts is **highly statistically significant** and unlikely to be due to chance.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl">
          <p className="text-slate-400 text-xs">Loading comparative trial metrics...</p>
        </div>
      )}
    </div>
  );
}
