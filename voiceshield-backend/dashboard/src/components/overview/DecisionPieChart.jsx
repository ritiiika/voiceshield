import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Shield } from 'lucide-react';

const COLORS = {
  ALLOW: '#10b981', // emerald
  VERIFY: '#f59e0b', // amber
  BLOCK: '#ef4444', // rose
};

export function DecisionPieChart({ calls = [] }) {
  const counts = {
    ALLOW: 0,
    VERIFY: 0,
    BLOCK: 0,
  };

  calls.forEach((c) => {
    const d = (c.decision || '').toUpperCase();
    if (counts[d] !== undefined) {
      counts[d]++;
    } else {
      counts.ALLOW++;
    }
  });

  const data = [
    { name: 'ALLOW (Safe)', value: counts.ALLOW, key: 'ALLOW' },
    { name: 'VERIFY (Step-up)', value: counts.VERIFY, key: 'VERIFY' },
    { name: 'BLOCK (Attack)', value: counts.BLOCK, key: 'BLOCK' },
  ].filter(d => d.value > 0);

  const total = calls.length || 1;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const percent = Math.round((item.value / total) * 100);
      return (
        <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-lg shadow-xl font-mono text-xs">
          <div className="font-bold text-white mb-1">{item.name}</div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.payload.fill }} />
            <span className="text-slate-300">Volume: <strong className="text-white">{item.value}</strong> calls</span>
            <span className="text-cyan-400 font-bold">({percent}%)</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-mono font-bold text-white">DECISION VERDICT RATIO</h3>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          Total: {calls.length}
        </span>
      </div>

      <div className="h-56 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry) => (
                <Cell key={`cell-${entry.key}`} fill={COLORS[entry.key] || '#94a3b8'} stroke="#0a0f1d" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Donut Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-mono font-extrabold text-white">{calls.length}</span>
          <span className="text-[10px] font-mono text-slate-400 uppercase">CALLS</span>
        </div>
      </div>

      {/* Legend Badges */}
      <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-slate-800/60 text-xs font-mono text-center">
        <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20">
          <div className="text-[10px] text-emerald-400 font-semibold">ALLOW</div>
          <div className="font-bold text-white text-sm">{counts.ALLOW}</div>
        </div>
        <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/20">
          <div className="text-[10px] text-amber-400 font-semibold">VERIFY</div>
          <div className="font-bold text-white text-sm">{counts.VERIFY}</div>
        </div>
        <div className="p-1.5 rounded bg-rose-500/10 border border-rose-500/20">
          <div className="text-[10px] text-rose-400 font-semibold">BLOCK</div>
          <div className="font-bold text-white text-sm">{counts.BLOCK}</div>
        </div>
      </div>
    </div>
  );
}
