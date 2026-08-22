import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function StatCard({
  title,
  value,
  subvalue,
  icon: Icon,
  variant = 'cyan', // cyan, emerald, amber, rose, purple
  trend,
  trendPositive = true,
  badgeText
}) {
  const variantStyles = {
    cyan: {
      bg: 'bg-cyan-950/20 border-cyan-500/30 hover:border-cyan-500/50',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30',
      text: 'text-cyan-400',
      glow: 'shadow-[0_0_15px_rgba(6,182,212,0.1)]',
    },
    emerald: {
      bg: 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/50',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
      text: 'text-emerald-400',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.1)]',
    },
    amber: {
      bg: 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50',
      iconBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
      text: 'text-amber-400',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.1)]',
    },
    rose: {
      bg: 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50',
      iconBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
      text: 'text-rose-400',
      glow: 'shadow-[0_0_15px_rgba(239,68,68,0.15)]',
    },
    purple: {
      bg: 'bg-purple-950/20 border-purple-500/30 hover:border-purple-500/50',
      iconBg: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
      text: 'text-purple-400',
      glow: 'shadow-[0_0_15px_rgba(168,85,247,0.1)]',
    },
  }[variant] || {
    bg: 'bg-slate-900/60 border-slate-800',
    iconBg: 'bg-slate-800 text-slate-300',
    text: 'text-white',
    glow: '',
  };

  return (
    <div className={`p-4 sm:p-5 rounded-xl border backdrop-blur transition-all duration-200 ${variantStyles.bg} ${variantStyles.glow}`}>
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-medium">
            {title}
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
              {value}
            </span>
            {subvalue && (
              <span className="text-xs font-mono text-slate-400">
                {subvalue}
              </span>
            )}
          </div>
        </div>

        <div className={`p-2.5 rounded-lg ${variantStyles.iconBg}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/5 text-xs font-mono">
        {trend ? (
          <div className={`flex items-center gap-1 font-semibold ${trendPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trendPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>{trend}</span>
          </div>
        ) : (
          <span className="text-slate-500">Live telemetry</span>
        )}

        {badgeText && (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${variantStyles.iconBg}`}>
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}
