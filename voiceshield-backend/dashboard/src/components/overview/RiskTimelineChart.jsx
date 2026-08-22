import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { TrendingUp, ShieldAlert } from 'lucide-react';

export function RiskTimelineChart({ calls = [] }) {
  // Take the most recent 12 calls in chronological order
  const chronologicalCalls = [...calls]
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .slice(-12);

  const chartData = chronologicalCalls.map((c, index) => ({
    index: index + 1,
    id: c.call_id,
    caller: c.caller_id,
    risk: c.risk_score,
    decision: c.decision,
    time: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    threat: c.threat_type,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-lg shadow-xl font-mono text-xs space-y-1">
          <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-1">
            <span className="text-cyan-400 font-bold">{data.id}</span>
            <span className="text-slate-500">{data.time}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-400">Caller:</span>
            <span className="text-white font-semibold">{data.caller}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-400">Risk Score:</span>
            <span className={data.risk >= 70 ? 'text-rose-400 font-bold' : data.risk >= 35 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
              {data.risk}/100
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-400">Decision:</span>
            <span className="text-white font-bold">[{data.decision}]</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-mono font-bold text-white">INTERCEPT RISK SCORE TELEMETRY</h3>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="flex items-center gap-1 text-rose-400">
            <span className="w-2 h-0.5 bg-rose-500"></span> High Risk Threshold (70)
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis 
              dataKey="id" 
              stroke="#64748b" 
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} 
            />
            <YAxis 
              domain={[0, 100]} 
              stroke="#64748b" 
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} 
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="4 4" />
            <ReferenceLine y={35} stroke="#f59e0b" strokeDasharray="3 3" />
            <Area
              type="monotone"
              dataKey="risk"
              stroke="#06b6d4"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#riskGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-[11px] font-mono text-slate-500">
        <span>Timeline: Recent Voice Agent Sessions</span>
        <span className="text-cyan-400 font-semibold">Continuous Threat Graph Analysis</span>
      </div>
    </div>
  );
}
