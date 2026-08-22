import React, { useState, useEffect } from 'react';
import { X, Shield, ShieldAlert, ShieldCheck, ShieldX, Copy, Check, Terminal, FileText, Cpu, AlertTriangle, MessageSquare, Clock, User, Phone, Radio } from 'lucide-react';
import { DecisionBadge, ThreatBadge, RiskScoreBadge } from '../common/StatusBadge';
import { RiskGauge } from '../common/RiskGauge';

export function CallDetailsModal({ call, onClose }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'reasoning', 'raw'

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!call) return null;

  const decision = (call.decision || 'ALLOW').toUpperCase();
  const isBlock = decision === 'BLOCK';
  const isVerify = decision === 'VERIFY';

  const bannerTheme = isBlock
    ? 'bg-rose-950/40 border-rose-500/50 text-rose-300 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
    : isVerify
    ? 'bg-amber-950/40 border-amber-500/50 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
    : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.2)]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Click backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0a0f1d] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10">
        {/* Top Title Bar */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-mono font-bold text-white tracking-wide">
                  SOC CALL INSPECTION: {call.call_id}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                  ID: #{call.id}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Intercepted at {new Date(call.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Decision Status Banner */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${bannerTheme}`}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-black/40 border border-current">
                {isBlock ? (
                  <ShieldX className="w-6 h-6 text-rose-400 animate-pulse" />
                ) : isVerify ? (
                  <ShieldAlert className="w-6 h-6 text-amber-400" />
                ) : (
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                )}
              </div>
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-slate-300">
                  ENFORCED POLICY VERDICT
                </div>
                <div className="text-lg font-bold font-mono text-white mt-0.5 flex items-center gap-2">
                  <DecisionBadge decision={call.decision} size="lg" />
                  <span className="text-xs font-mono text-slate-300 font-normal">
                    ({call.risk_score >= 70 ? 'Attack Mitigated' : call.risk_score >= 35 ? 'Identity Challenge Issued' : 'Session Approved'})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="text-center px-3 py-1 bg-black/40 rounded border border-white/10">
                <div className="text-slate-400 text-[10px]">RISK SCORE</div>
                <div className={`font-bold text-sm ${isBlock ? 'text-rose-400' : isVerify ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {call.risk_score}/100
                </div>
              </div>
              <div className="text-center px-3 py-1 bg-black/40 rounded border border-white/10">
                <div className="text-slate-400 text-[10px]">CONFIDENCE</div>
                <div className="font-bold text-sm text-cyan-400">
                  {Math.round((call.confidence || 0.9) * 100)}%
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs inside Modal */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Security Findings & Transcript
            </button>
            <button
              onClick={() => setActiveTab('reasoning')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                activeTab === 'reasoning'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              LangGraph Multi-Agent Reasoning
            </button>
            <button
              onClick={() => setActiveTab('raw')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                activeTab === 'raw'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Raw Database Record
            </button>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Call Attributes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-500 block mb-1">CALLER IDENTITY</span>
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    {call.caller_id}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-500 block mb-1">REQUESTED ACTION</span>
                  <span className="font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30 inline-block">
                    {call.requested_action}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-500 block mb-1">THREAT CATEGORY</span>
                  <ThreatBadge threat={call.threat_type} />
                </div>
              </div>

              {/* Decoded Transcript */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    Voice Transcript (Faster-Whisper STT)
                  </span>
                </div>
                <div className="p-3.5 rounded-lg bg-black/60 border border-slate-800 text-slate-100 font-mono text-sm leading-relaxed">
                  "{call.transcript}"
                </div>
              </div>

              {/* Security Reasons */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Detected Security Reasons & Triggers
                </span>

                {call.reasons && call.reasons.length > 0 ? (
                  <ul className="space-y-1.5 pt-1">
                    {call.reasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs font-mono text-slate-300">
                        <span className="text-cyan-400 font-bold">›</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs font-mono text-slate-400">
                    Standard caller interaction. Passed all heuristic and model security checks.
                  </p>
                )}
              </div>

              {/* Agent Mitigation / Response */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Autonomous Agent Spoken Response
                  </span>
                </div>
                <div className="p-3.5 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-slate-200 font-mono text-sm leading-relaxed">
                  "{call.agent_response || 'No response recorded'}"
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REASONING */}
          {activeTab === 'reasoning' && (
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-400" />
                <h4 className="text-sm font-mono font-bold text-white uppercase">
                  LangGraph Agent Security Reasoning Trace
                </h4>
              </div>

              <div className="p-4 rounded-lg bg-black/60 border border-purple-500/30 text-slate-200 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                {call.reasoning || 'No deep reasoning trace attached.'}
              </div>
            </div>
          )}

          {/* TAB 3: RAW RECORD */}
          {activeTab === 'raw' && (
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  Supabase CallAnalysis Object
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(call, null, 2));
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1 border border-slate-700"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied JSON' : 'Copy JSON'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-lg bg-black/80 border border-slate-800 text-cyan-300 font-mono text-xs overflow-x-auto max-h-96">
                {JSON.stringify(call, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-500">
            VoiceShield Security Operations Inspector
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-semibold transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
