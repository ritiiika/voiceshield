import React from 'react';
import { AlertOctagon, ShieldCheck, ShieldAlert, Zap } from 'lucide-react';

export function ThreatLevelBanner({ blockedCount, verifyCount, totalCalls, avgRisk }) {
  let threatLevel = 'ELEVATED';
  let bannerStyle = 'bg-amber-950/30 border-amber-500/40 text-amber-300';
  let icon = ShieldAlert;
  let summary = `${blockedCount} high-risk voice attacks blocked. LangGraph security reasoning active.`;

  if (blockedCount >= 3 || avgRisk >= 60) {
    threatLevel = 'CRITICAL DEFCON 1';
    bannerStyle = 'bg-rose-950/40 border-rose-500/50 text-rose-300 shadow-[0_0_20px_rgba(239,68,68,0.2)]';
    icon = AlertOctagon;
    summary = `Multiple social engineering & authority spoofing attacks intercepted across voice channels.`;
  } else if (blockedCount === 0 && avgRisk < 30) {
    threatLevel = 'NOMINAL / GUARDED';
    bannerStyle = 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300';
    icon = ShieldCheck;
    summary = `All inbound voice interactions operating within expected security baselines.`;
  }

  const IconComponent = icon;

  return (
    <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${bannerStyle}`}>
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-black/40 border border-current">
          <IconComponent className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold tracking-widest uppercase bg-black/50 px-2 py-0.5 rounded border border-current">
              ADVISORY: {threatLevel}
            </span>
            <span className="text-xs font-mono opacity-80 hidden sm:inline">
              | Redis Memory Sync Active
            </span>
          </div>
          <p className="text-sm font-medium mt-1 text-slate-200">
            {summary}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs font-mono self-stretch md:self-auto justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-white/10">
        <div className="text-center px-3 py-1 bg-black/30 rounded border border-white/10">
          <div className="text-slate-400 text-[10px]">AVG RISK</div>
          <div className="font-bold text-sm text-white">{avgRisk}/100</div>
        </div>
        <div className="text-center px-3 py-1 bg-black/30 rounded border border-white/10">
          <div className="text-slate-400 text-[10px]">INTERCEPT RATE</div>
          <div className="font-bold text-sm text-rose-400">
            {totalCalls > 0 ? `${Math.round((blockedCount / totalCalls) * 100)}%` : '0%'}
          </div>
        </div>
        <div className="text-center px-3 py-1 bg-black/30 rounded border border-white/10">
          <div className="text-slate-400 text-[10px]">AUTH GATED</div>
          <div className="font-bold text-sm text-amber-400">{verifyCount} Calls</div>
        </div>
      </div>
    </div>
  );
}
