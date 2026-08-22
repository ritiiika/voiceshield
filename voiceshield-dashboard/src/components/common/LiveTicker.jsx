import React from 'react';
import { Activity, ShieldAlert, Zap, Radio } from 'lucide-react';

export function LiveTicker({ calls = [] }) {
  const latestCalls = calls.slice(0, 5);

  return (
    <div className="w-full bg-[#0a0f1d]/90 border-y border-cyan-500/20 px-4 py-2 flex items-center gap-4 overflow-hidden shadow-inner text-xs">
      <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold whitespace-nowrap pr-3 border-r border-slate-800">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
        </span>
        <Radio className="w-3.5 h-3.5" />
        <span>SOC LIVE INTERCEPT</span>
      </div>

      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar whitespace-nowrap text-slate-300 font-mono">
        {latestCalls.map((call, idx) => (
          <div key={call.id || idx} className="inline-flex items-center gap-2">
            <span className="text-slate-500">{new Date(call.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span className="text-cyan-300 font-semibold">{call.call_id}</span>
            <span className="text-slate-400">({call.caller_id})</span>
            <span className={call.decision === 'BLOCK' ? 'text-rose-400 font-bold' : call.decision === 'VERIFY' ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
              [{call.decision}]
            </span>
            <span className="text-slate-400 truncate max-w-[200px]">"{call.transcript}"</span>
            <span className="text-slate-600">|</span>
          </div>
        ))}
      </div>
    </div>
  );
}
