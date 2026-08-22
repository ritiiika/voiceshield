import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle } from 'lucide-react';

export function ThreatBarChart({ calls = [] }) {
  const threatCounts = {};

  calls.forEach((c) => {
    const t = c.threat_type || 'normal';
    threatCounts[t] = (threatCounts[t] || 0) + 1;
  });

  const formatThreatName = (str) => {
    return str
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const data = Object.keys(threatCounts).map((key) => ({
    rawKey: key,
    name: formatThreatName(key),
    shortName: formatThreatName(key).split(' ')[0],
    count: threatCounts[key],
  })).sort((a, b) => b.count - a.count);

  const getThreatColor = (key) => {
    if (key.includes('impersonation') || key.includes('urgency') || key.includes('harvesting') || key.includes('attack')) {
      return '#ef4444'; // rose
    }
    if (key.includes('modification') || key.includes('adjustment') || key.includes('credential')) {
      return '#f59e0b'; // amber
    }
    return '#06b6d4'; // cyan
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-slate-700 p-2.5 rounded-lg shadow-xl font-mono text-xs">
          <div className="font-bold text-white mb-1">{item.name}</div>
          <div className="text-cyan-400">
            Detected: <strong className="text-white">{item.count}</strong> occurrences
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
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-mono font-bold text-white">THREAT VECTOR CLASSIFICATION</h3>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          {data.length} Categories
        </span>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <XAxis type="number" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={110} 
              stroke="#64748b" 
              tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} 
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`bar-${index}`} fill={getThreatColor(entry.rawKey)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-[11px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded bg-rose-500"></span> High Exploit
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded bg-amber-500"></span> Step-up Gate
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded bg-cyan-500"></span> Normal Request
        </span>
      </div>
    </div>
  );
}
