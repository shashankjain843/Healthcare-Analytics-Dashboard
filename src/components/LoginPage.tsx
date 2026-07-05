/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Stethoscope,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Lock,
} from "lucide-react";
import { UserRole } from "../types";

// ─── Exported type (used by App.tsx and Sidebar.tsx) ────────────────────────
export interface LoginUser {
  name: string;
  email: string;
  role: UserRole;
  title: string;
}

// ─── Credential Registry ─────────────────────────────────────────────────────
interface CredEntry {
  password: string;
  user: LoginUser;
}

const CREDENTIALS: Record<string, CredEntry> = {
  "doctor@apexhealth.com": {
    password: "Doctor@123",
    user: {
      name: "Dr. Alice Morgan",
      email: "doctor@apexhealth.com",
      role: "Doctor",
      title: "Chief Medical Officer",
    },
  },
  "admin@apexhealth.com": {
    password: "Admin@123",
    user: {
      name: "James Sterling",
      email: "admin@apexhealth.com",
      role: "Admin",
      title: "System Administrator",
    },
  },
  "staff@apexhealth.com": {
    password: "Staff@123",
    user: {
      name: "Emily Chen",
      email: "staff@apexhealth.com",
      role: "Staff",
      title: "Clinical Staff Assistant",
    },
  },
};

// ─── Demo credential cards config ────────────────────────────────────────────
const DEMO_USERS = [
  {
    role: "Doctor",
    colorClass: "bg-blue-500",
    ringClass: "ring-blue-500/30",
    email: "doctor@apexhealth.com",
    password: "Doctor@123",
    desc: "Dr. Alice Morgan · Chief Medical Officer",
    badge: "Full clinical access · AI summaries · EHR write",
  },
  {
    role: "Admin",
    colorClass: "bg-indigo-500",
    ringClass: "ring-indigo-500/30",
    email: "admin@apexhealth.com",
    password: "Admin@123",
    desc: "James Sterling · System Administrator",
    badge: "Audit logs · All views · User management",
  },
  {
    role: "Staff",
    colorClass: "bg-amber-500",
    ringClass: "ring-amber-500/30",
    email: "staff@apexhealth.com",
    password: "Staff@123",
    desc: "Emily Chen · Clinical Staff Assistant",
    badge: "Read-only access · No sensitive data",
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface LoginPageProps {
  onLogin: (user: LoginUser) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    // Simulate auth network delay for realism
    setTimeout(() => {
      const cred = CREDENTIALS[email.toLowerCase().trim()];
      if (cred && cred.password === password) {
        onLogin(cred.user);
      } else {
        setError("Invalid email or password. Please check your credentials and try again.");
        setShaking(true);
        setTimeout(() => setShaking(false), 650);
        setLoading(false);
      }
    }, 750);
  };

  const fillCredentials = (em: string, pw: string) => {
    setEmail(em);
    setPassword(pw);
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <style>{`
        @keyframes loginShake {
          0%,100% { transform: translateX(0); }
          15%      { transform: translateX(-10px); }
          30%      { transform: translateX(10px); }
          45%      { transform: translateX(-8px); }
          60%      { transform: translateX(8px); }
          75%      { transform: translateX(-4px); }
          90%      { transform: translateX(4px); }
        }
        .login-shake { animation: loginShake 0.65s ease-in-out; }

        @keyframes loginFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .login-fade-up { animation: loginFadeUp 0.55s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

      {/* Background ambient blobs */}
      <div className="absolute -top-52 -right-52 w-[520px] h-[520px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-52 -left-52 w-[520px] h-[520px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className={`w-full max-w-md relative z-10 login-fade-up ${shaking ? "login-shake" : ""}`}>

        {/* ── Brand Header ── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-xl shadow-blue-900/50 ring-4 ring-blue-500/20">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            ApexHealth <span className="text-blue-400">AI</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1.5 flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            HIPAA-Compliant EHR Analytics Portal
          </p>
        </div>

        {/* ── Login Card ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-black/50">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Secure Sign In</h2>
            <p className="text-slate-500 text-sm mt-0.5">
              Enter your institutional credentials to access the clinical dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Institutional Email Address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="you@apexhealth.com"
                required
                autoComplete="email"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 pr-12 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <button
                  type="button"
                  id="toggle-password-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />
                  }
                </button>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-2.5 bg-rose-950/60 border border-rose-800/50 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <p className="text-rose-300 text-xs font-medium leading-relaxed">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl py-3 text-sm transition-all duration-200 shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 mt-1 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Access Clinical Dashboard
                </>
              )}
            </button>
          </form>

          {/* ── Demo Credentials ── */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 text-center">
              ↓ Demo Credentials — Click any card to auto-fill ↓
            </p>
            <div className="space-y-2">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.role}
                  id={`demo-login-${u.role.toLowerCase()}`}
                  type="button"
                  onClick={() => fillCredentials(u.email, u.password)}
                  className={`w-full flex items-center gap-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 rounded-xl px-3.5 py-2.5 transition-all text-left cursor-pointer group ring-0 hover:ring-2 ${u.ringClass}`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${u.colorClass} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-xs font-semibold">{u.role} Access</p>
                    <p className="text-slate-500 text-[10px] truncate">{u.desc}</p>
                  </div>
                  <span className="text-slate-600 group-hover:text-slate-400 text-[10px] font-mono flex-shrink-0 hidden sm:block">
                    {u.email.split("@")[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-700 text-[10px] mt-5 font-mono tracking-wider">
          PROTECTED SYSTEM · UNAUTHORIZED ACCESS IS PROHIBITED · ApexHealth AI © 2026
        </p>
      </div>
    </div>
  );
}
