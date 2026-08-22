import React from 'react';
import { Network, Mic, Cpu, Database, Server, ShieldCheck, Zap, ArrowRight, Lock, Activity } from 'lucide-react';

export function ArchitectureView() {
  const nodes = [
    {
      id: 'audio',
      title: '1. Inbound Voice Audio',
      subtitle: 'FastAPI Multipart Ingestion',
      icon: Mic,
      color: 'border-cyan-500/40 bg-cyan-950/30 text-cyan-400',
      details: 'Accepts .wav, .ogg, .mp3 audio streams via POST /voice/analyze with temporary file isolation.'
    },
    {
      id: 'whisper',
      title: '2. Faster-Whisper STT',
      subtitle: 'Neural Speech Transcription',
      icon: Activity,
      color: 'border-blue-500/40 bg-blue-950/30 text-blue-400',
      details: 'High-speed CTranslate2 Whisper model transcribes raw speech into normalized textual utterance.'
    },
    {
      id: 'redis',
      title: '3. Redis Cloud Memory',
      subtitle: 'Historical Risk Cache',
      icon: Zap,
      color: 'border-rose-500/40 bg-rose-950/30 text-rose-400',
      details: 'Fetches persistent caller threat score history to track repeat attack vectors across multiple sessions.'
    },
    {
      id: 'langgraph',
      title: '4. LangGraph Multi-Agent',
      subtitle: 'StateGraph Threat Reasoning',
      icon: Cpu,
      color: 'border-purple-500/40 bg-purple-950/30 text-purple-400',
      details: 'Graph nodes: understand_request -> security_check (Gemini / AI models) -> generate_response.'
    },
    {
      id: 'supabase',
      title: '5. Supabase PostgreSQL',
      subtitle: 'Audit & Telemetry Persistence',
      icon: Database,
      color: 'border-emerald-500/40 bg-emerald-950/30 text-emerald-400',
      details: 'Stores CallAnalysis records with risk scores, transcripts, reasoning chains, and timestamps.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur">
        <div className="flex items-center gap-3 mb-2">
          <Network className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-mono font-bold text-white tracking-wide">
            VOICESHIELD SYSTEM & AGENT ARCHITECTURE
          </h2>
        </div>
        <p className="text-xs text-slate-400 font-mono">
          End-to-end security intelligence pipeline safeguarding AI voice agents from social engineering attacks
        </p>
      </div>

      {/* Pipeline Flow Visualizer */}
      <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur space-y-6">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
          DATA FLOW & ORCHESTRATION GRAPH
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {nodes.map((node, index) => {
            const Icon = node.icon;
            return (
              <div
                key={node.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${node.color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="w-6 h-6" />
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/40 border border-current">
                      STAGE 0{index + 1}
                    </span>
                  </div>
                  <h4 className="text-sm font-mono font-bold text-white">{node.title}</h4>
                  <div className="text-xs font-mono text-slate-400 mb-3">{node.subtitle}</div>
                </div>

                <p className="text-[11px] font-mono text-slate-300 leading-relaxed border-t border-white/10 pt-2">
                  {node.details}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Threat Policy Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-mono font-bold text-white">AUTONOMOUS THREAT ENFORCEMENT</h3>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 rounded bg-rose-950/20 border border-rose-500/30">
              <div className="text-rose-400 font-bold">BLOCK POLICY (Risk &gt;= 70)</div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Authority impersonation, OTP credential harvesting, urgency coercion, high-value wire transfers.
              </p>
            </div>

            <div className="p-2.5 rounded bg-amber-950/20 border border-amber-500/30">
              <div className="text-amber-400 font-bold">VERIFY POLICY (35 &lt;= Risk &lt; 70)</div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Address changes, email/phone updates, disputed invoice refunds requiring step-up identity challenge.
              </p>
            </div>

            <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-500/30">
              <div className="text-emerald-400 font-bold">ALLOW POLICY (Risk &lt; 35)</div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Standard informational queries, schedule booking, balance checks from authenticated sessions.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur space-y-3">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-mono font-bold text-white">API & INTEGRATION ENDPOINTS</h3>
          </div>

          <div className="space-y-2 text-xs font-mono text-slate-300">
            <div className="p-2.5 rounded bg-black/40 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-400">POST /voice/analyze</span>
                <span className="text-emerald-400 text-[10px]">ACTIVE</span>
              </div>
              <div className="text-slate-400 text-[11px]">Audio file upload -&gt; Transcription -&gt; LangGraph -&gt; DB Save</div>
            </div>

            <div className="p-2.5 rounded bg-black/40 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-400">POST /security/analyze</span>
                <span className="text-emerald-400 text-[10px]">ACTIVE</span>
              </div>
              <div className="text-slate-400 text-[11px]">Direct transcript &amp; metadata payload security check</div>
            </div>

            <div className="p-2.5 rounded bg-black/40 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400">GET /voice/calls &amp; /stats</span>
                <span className="text-slate-500 text-[10px]">RECOMMENDED</span>
              </div>
              <div className="text-slate-400 text-[11px]">Historical call querying from Supabase CallAnalysis model</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
