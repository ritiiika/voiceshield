import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, AlertTriangle, CheckCircle, Shield } from 'lucide-react';

export function DecisionBadge({ decision, size = 'md' }) {
  const d = (decision || '').toUpperCase();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-mono font-medium',
    md: 'text-xs px-2.5 py-1 font-mono font-semibold tracking-wider',
    lg: 'text-sm px-4 py-1.5 font-mono font-bold tracking-wider',
    xl: 'text-base px-5 py-2 font-mono font-extrabold tracking-widest',
  }[size] || 'text-xs px-2.5 py-1 font-mono font-semibold';

  if (d === 'ALLOW') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)] ${sizeClasses}`}>
        <ShieldCheck className={size === 'xl' ? 'w-5 h-5' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
        <span>ALLOW</span>
      </span>
    );
  }

  if (d === 'VERIFY') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)] ${sizeClasses}`}>
        <ShieldAlert className={size === 'xl' ? 'w-5 h-5' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
        <span>VERIFY</span>
      </span>
    );
  }

  if (d === 'BLOCK') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)] animate-pulse-slow ${sizeClasses}`}>
        <ShieldX className={size === 'xl' ? 'w-5 h-5' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
        <span>BLOCK</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 ${sizeClasses}`}>
      <Shield className="w-3.5 h-3.5" />
      <span>{decision || 'UNKNOWN'}</span>
    </span>
  );
}

export function ThreatBadge({ threat }) {
  const t = (threat || 'normal').toLowerCase();

  const colorMap = {
    authority_impersonation: 'bg-red-500/10 text-red-300 border-red-500/30',
    urgency_pressure: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    credential_harvesting: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
    account_takeover: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    account_modification: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    financial_adjustment: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    social_engineering: 'bg-red-500/10 text-red-300 border-red-500/30',
    normal: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  };

  const formattedName = t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const classes = colorMap[t] || 'bg-slate-800 text-slate-300 border-slate-700';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono border ${classes}`}>
      {formattedName}
    </span>
  );
}

export function RiskScoreBadge({ score }) {
  const numScore = Number(score) || 0;
  
  let colorClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  let barColor = 'bg-emerald-500';

  if (numScore >= 70) {
    colorClass = 'text-rose-400 bg-rose-500/10 border-rose-500/40';
    barColor = 'bg-rose-500';
  } else if (numScore >= 35) {
    colorClass = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    barColor = 'bg-amber-500';
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden border border-slate-700/50">
        <div 
          className={`h-full rounded-full ${barColor}`} 
          style={{ width: `${Math.min(100, Math.max(0, numScore))}%` }}
        />
      </div>
      <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-mono font-bold border ${colorClass}`}>
        {numScore}/100
      </span>
    </div>
  );
}
