import React, { useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, ShieldX, Copy, Check, Terminal, FileText, Cpu, AlertTriangle, MessageSquare, Database, ArrowRight } from 'lucide-react';
import { DecisionBadge, ThreatBadge, RiskScoreBadge } from '../common/StatusBadge';
import { RiskGauge } from '../common/RiskGauge';

export function AnalysisResultCard({ callRecord, rawResponse }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('summary'); // summary, reasoning, raw

  if (!callRecord) return null;

  const handleCopyAgentResponse = () => {
    if (callRecord.agent_response) {
      navigator.clipboard.writeText(callRecord.agent_response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const decision = (callRecord.decision || 'ALLOW').toUpperCase();
  const isBlock = decision === 'BLOCK';
  const isVerify = decision === 'VERIFY';
  const isAllow = decision === 'ALLOW';

  const bannerTheme = isBlock
    ? 'bg-rose-950/40 border-rose-500/50 text-rose-300 shadow-[0_0_25px_rgba(239,68,68,0.25)]'
    : isVerify
    ? 'bg-amber-950/40 border-amber-500/50 text-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.25)]'
    : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.25)]';

  return (
    <div className="p-6 rounded-2xl bg-[#0a0f1d] border border-cyan-500/30 shadow-2xl space-y-6">
      {/* Header Banner */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${bannerTheme}`}>
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-black/50 border border-current">
            {isBlock ? (
              <ShieldX className="w-7 h-7 text-rose-400 animate-pulse" />
            ) : isVerify ? (
              <ShieldAlert className="w-7 h-7 text-amber-400" />
            ) : (
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider uppercase bg-black/60 px-2 py-0.5 rounded border border-current">
                SECURITY VERDICT
              </span>
              <span className="text-xs font-mono text-slate-300">
                Intercept ID: <strong>{callRecord.call_id}</strong>
              </span>
            </div>
            <div className="text-xl font-extrabold font-mono tracking-tight text-white mt-1 flex items-center gap-2">
              <span>ACTION:</span>
              <DecisionBadge decision={callRecord.decision} size="xl" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-center px-3.5 py-1.5 bg-black/40 rounded-lg border border-white/10">
            <div className="text-slate-400 text-[10px]">RISK SCORE</div>
            <div className={`text-base font-extrabold ${isBlock ? 'text-rose-400' : isVerify ? 'text-amber-400' : 'text-emerald-400'}`}>
              {callRecord.risk_score}/100
            </div>
          </div>
          <div className="text-center px-3.5 py-1.5 bg-black/40 rounded-lg border border-white/10">
            <div className="text-slate-400 text-[10px]">CONFIDENCE</div>
            <div className="text-base font-extrabold text-cyan-400">
              {Math.round((callRecord.confidence || 0.9) * 100)}%
            </div>
          </div>
          {callRecord.id && (
            <div className="text-center px-3.5 py-1.5 bg-black/40 rounded-lg border border-white/10 hidden sm:block">
              <div className="text-slate-400 text-[10px]">SUPABASE DB</div>
              <div className="text-xs font-bold text-slate-300">#{callRecord.id}</div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeTab === 'summary'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Analysis Summary
          </button>
          <button
            onClick={() => setActiveTab('reasoning')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeTab === 'reasoning'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            LangGraph Reasoning Chain
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeTab === 'raw'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Raw API Payload
          </button>
        </div>

        <span className="text-[11px] font-mono text-slate-500">
          Timestamp: {new Date(callRecord.created_at).toLocaleTimeString()}
        </span>
      </div>

      {/* TAB CONTENT: SUMMARY */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Transcript + Analysis Findings */}
          <div className="lg:col-span-2 space-y-4">
            {/* Audio Transcript Card */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  Decoded Voice Transcript (Faster-Whisper STT)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {callRecord.transcript?.length || 0} characters
                </span>
              </div>
              <div className="p-3.5 rounded-lg bg-black/50 border border-slate-800/80 text-slate-200 font-mono text-sm leading-relaxed">
                "{callRecord.transcript}"
              </div>
            </div>

            {/* Classification Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                  Requested Action
                </span>
                <div className="font-mono text-sm font-bold text-cyan-300 bg-cyan-950/40 px-2.5 py-1 rounded border border-cyan-500/30 inline-block">
                  {callRecord.requested_action}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                  Threat Classification
                </span>
                <ThreatBadge threat={callRecord.threat_type} />
              </div>
            </div>

            {/* Detected Security Flags & Reasons */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Security Triggers & Reasons
              </span>

              {callRecord.reasons && callRecord.reasons.length > 0 ? (
                <ul className="space-y-1.5 pt-1">
                  {callRecord.reasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs font-mono text-slate-300">
                      <span className="text-cyan-400 font-bold">›</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs font-mono text-slate-500">
                  No anomalous triggers detected. Request conforms to safe security policy.
                </p>
              )}
            </div>

            {/* Safe Agent Response */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Autonomous Agent Response (Safe Output)
                </span>
                <button
                  onClick={handleCopyAgentResponse}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1 border border-slate-700"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-slate-200 font-mono text-sm leading-relaxed">
                "{callRecord.agent_response || 'No response generated'}"
              </div>
            </div>
          </div>

          {/* Right Col: Risk Score Gauge + Security Metadata */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col items-center justify-center">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                THREAT SEVERITY INDEX
              </span>
              <RiskGauge score={callRecord.risk_score} size={170} />
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2.5 text-xs font-mono">
              <span className="text-slate-400 font-bold uppercase tracking-wider block border-b border-slate-800 pb-1.5">
                Session Telemetry
              </span>

              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Caller ID:</span>
                <span className="text-white font-semibold">{callRecord.caller_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Confidence:</span>
                <span className="text-cyan-400 font-semibold">{Math.round((callRecord.confidence || 0.9) * 100)}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Policy Verdict:</span>
                <span className="text-white font-semibold">{callRecord.decision}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Storage Target:</span>
                <span className="text-emerald-400 font-semibold">Supabase PostgreSQL</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: REASONING */}
      {activeTab === 'reasoning' && (
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            <h4 className="text-sm font-mono font-bold text-white uppercase">
              LangGraph Multi-Agent Security Reasoning Node
            </h4>
          </div>

          <div className="p-4 rounded-lg bg-black/60 border border-purple-500/30 text-slate-200 font-mono text-sm leading-relaxed whitespace-pre-wrap">
            {callRecord.reasoning || 'No deep reasoning chain returned by agent.'}
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
            <div className="text-slate-300 font-bold">LangGraph State Graph Execution:</div>
            <div>• Node 1 (understand_request): Extracted action "{callRecord.requested_action}"</div>
            <div>• Node 2 (security_check): Evaluated threat model "{callRecord.threat_type}" with risk score {callRecord.risk_score}</div>
            <div>• Node 3 (generate_response): Emitted safe agent response for decision [{callRecord.decision}]</div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: RAW JSON */}
      {activeTab === 'raw' && (
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-cyan-400" />
              FastAPI Response Schema (JSON)
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(rawResponse || callRecord, null, 2));
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
            {JSON.stringify(rawResponse || callRecord, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
