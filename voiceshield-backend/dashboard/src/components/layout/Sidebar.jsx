import React from 'react';
import { LayoutDashboard, Mic, PhoneCall, Network, ShieldCheck, Zap, Database, Cpu } from 'lucide-react';

export function Sidebar({ activeTab, setActiveTab, blockedCount = 0, verifyCount = 0 }) {
  const navItems = [
    {
      id: 'overview',
      label: 'SOC Overview',
      icon: LayoutDashboard,
      desc: 'Real-time telemetry & threats',
    },
    {
      id: 'voicelab',
      label: 'Live Voice Lab',
      icon: Mic,
      desc: 'POST /voice/analyze testbed',
      badge: 'LIVE',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    {
      id: 'calls',
      label: 'Security Call Log',
      icon: PhoneCall,
      desc: 'Historical intercept records',
      badge: blockedCount > 0 ? `${blockedCount} BLOCKED` : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    {
      id: 'architecture',
      label: 'System Architecture',
      icon: Network,
      desc: 'LangGraph & Security Engine',
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-[#080c17] border-r border-slate-800/80 flex flex-col justify-between p-4 flex-shrink-0">
      <div className="space-y-6">
        <div>
          <span className="text-[11px] font-mono font-semibold tracking-wider text-slate-500 uppercase px-3">
            Operations Navigation
          </span>
          <nav className="mt-3 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg font-medium transition-all text-left group ${
                    isActive
                      ? 'bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <div>
                      <div className="text-sm font-mono font-semibold leading-tight">{item.label}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Security Engine Specs */}
        <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs font-mono space-y-2">
          <div className="flex items-center justify-between text-slate-400 font-semibold border-b border-slate-800 pb-1.5">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>ACTIVE POLICIES</span>
            </span>
            <span className="text-emerald-400 text-[10px]">ENFORCING</span>
          </div>

          <div className="space-y-1 text-[11px] text-slate-400">
            <div className="flex justify-between">
              <span>Authority Spoofing:</span>
              <span className="text-rose-400 font-semibold">BLOCK</span>
            </div>
            <div className="flex justify-between">
              <span>OTP Exfiltration:</span>
              <span className="text-rose-400 font-semibold">BLOCK</span>
            </div>
            <div className="flex justify-between">
              <span>Urgency Pressure:</span>
              <span className="text-rose-400 font-semibold">BLOCK</span>
            </div>
            <div className="flex justify-between">
              <span>Account Changes:</span>
              <span className="text-amber-400 font-semibold">VERIFY</span>
            </div>
            <div className="flex justify-between">
              <span>Informational Queries:</span>
              <span className="text-emerald-400 font-semibold">ALLOW</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer System Node Info */}
      <div className="pt-4 border-t border-slate-800/80 text-[11px] font-mono text-slate-500 space-y-1">
        <div className="flex items-center justify-between">
          <span>PIPELINE:</span>
          <span className="text-slate-300">FastAPI + LangGraph</span>
        </div>
        <div className="flex items-center justify-between">
          <span>SPEECH-TO-TEXT:</span>
          <span className="text-slate-300">Faster-Whisper</span>
        </div>
        <div className="flex items-center justify-between">
          <span>RISK MEMORY:</span>
          <span className="text-slate-300">Redis Cloud</span>
        </div>
        <div className="flex items-center justify-between">
          <span>DATABASE:</span>
          <span className="text-slate-300">Supabase PostgreSQL</span>
        </div>
      </div>
    </aside>
  );
}
