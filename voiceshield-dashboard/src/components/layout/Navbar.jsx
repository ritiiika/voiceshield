import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Cpu, Server, RefreshCw, Radio, Terminal } from 'lucide-react';
import { checkBackendHealth } from '../../services/api';

export function Navbar({ backendOnline, onRefreshData }) {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleManualCheck = async () => {
    setChecking(true);
    await onRefreshData();
    setTimeout(() => setChecking(false), 600);
  };

  return (
    <header className="bg-[#090d16]/95 border-b border-cyan-500/20 backdrop-blur sticky top-0 z-40 px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Shield className="w-6 h-6 text-cyan-400" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold tracking-wider text-white font-mono flex items-center gap-1.5">
                VOICE<span className="text-cyan-400">SHIELD</span>
              </h1>
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono uppercase tracking-wider font-semibold">
                SOC v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono hidden sm:block">
              AI Voice Agent Security & Threat Defense Platform
            </p>
          </div>
        </div>

        {/* Center: System Threat Advisory */}
        <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-slate-300 font-medium">DEFENSE STATUS:</span>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
            ACTIVE SENTINEL
          </span>
          <span className="text-xs text-slate-500 font-mono">|</span>
          <div className="flex items-center gap-1 text-slate-400 font-mono text-xs">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>Whisper + LangGraph + Redis</span>
          </div>
        </div>

        {/* Right: Backend Status & Actions */}
        <div className="flex items-center gap-3">
          {/* Backend Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono">
            <Server className={`w-3.5 h-3.5 ${backendOnline ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="text-slate-400 hidden sm:inline">FASTAPI:</span>
            {backendOnline ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> ONLINE (8000)
              </span>
            ) : (
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span> READY / STANDBY
              </span>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleManualCheck}
            title="Refresh feed and check backend"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Clock */}
          <div className="hidden lg:block font-mono text-xs text-cyan-400 bg-cyan-950/40 px-2.5 py-1.5 rounded border border-cyan-500/20">
            {time}
          </div>
        </div>
      </div>
    </header>
  );
}
