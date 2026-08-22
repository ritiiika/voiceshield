import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LiveTicker } from './components/common/LiveTicker';
import { StatCard } from './components/overview/StatCard';
import { ThreatLevelBanner } from './components/overview/ThreatLevelBanner';
import { DecisionPieChart } from './components/overview/DecisionPieChart';
import { ThreatBarChart } from './components/overview/ThreatBarChart';
import { RiskTimelineChart } from './components/overview/RiskTimelineChart';
import { VoiceAnalyzer } from './components/voiceLab/VoiceAnalyzer';
import { AnalysisResultCard } from './components/voiceLab/AnalysisResultCard';
import { CallTable } from './components/calls/CallTable';
import { CallDetailsModal } from './components/calls/CallDetailsModal';
import { ArchitectureView } from './components/policy/ArchitectureView';
import { getCallHistory, checkBackendHealth } from './services/api';
import { PhoneCall, ShieldCheck, ShieldAlert, ShieldX, Activity, AlertTriangle, Mic, Radio } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'voicelab', 'calls', 'architecture'
  const [calls, setCalls] = useState([]);
  const [selectedCall, setSelectedCall] = useState(null);
  const [lastAnalysis, setLastAnalysis] = useState(null);
  const [lastRawResponse, setLastRawResponse] = useState(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load initial data and health check
  const refreshData = async () => {
    try {
      const health = await checkBackendHealth();
      setBackendOnline(health.online);

      const history = await getCallHistory();
      setCalls(history);
    } catch (err) {
      console.error('Error refreshing dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    // Poll backend health every 15 seconds
    const interval = setInterval(async () => {
      const health = await checkBackendHealth();
      setBackendOnline(health.online);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Handler when a new voice sample is analyzed
  const handleAnalysisComplete = (newCallRecord, rawResponse) => {
    setLastAnalysis(newCallRecord);
    setLastRawResponse(rawResponse);
    setCalls((prev) => [newCallRecord, ...prev.filter(c => c.id !== newCallRecord.id && c.call_id !== newCallRecord.call_id)]);
  };

  // Aggregated KPI Stats
  const stats = useMemo(() => {
    const total = calls.length;
    let allowed = 0;
    let verify = 0;
    let blocked = 0;
    let totalRisk = 0;
    let highRisk = 0;

    calls.forEach((c) => {
      const d = (c.decision || '').toUpperCase();
      const risk = Number(c.risk_score) || 0;
      if (d === 'ALLOW') allowed++;
      else if (d === 'VERIFY') verify++;
      else if (d === 'BLOCK') blocked++;
      else allowed++;

      totalRisk += risk;
      if (risk >= 70) highRisk++;
    });

    const avgRisk = total > 0 ? Math.round(totalRisk / total) : 0;

    return {
      total,
      allowed,
      verify,
      blocked,
      avgRisk,
      highRisk,
    };
  }, [calls]);

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col font-sans cyber-grid">
      {/* Top SOC Navbar */}
      <Navbar backendOnline={backendOnline} onRefreshData={refreshData} />

      {/* Live Security Intercept Ticker */}
      <LiveTicker calls={calls} />

      {/* Main Layout Body */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          blockedCount={stats.blocked}
          verifyCount={stats.verify}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Threat Level Advisory Banner */}
              <ThreatLevelBanner
                blockedCount={stats.blocked}
                verifyCount={stats.verify}
                totalCalls={stats.total}
                avgRisk={stats.avgRisk}
              />

              {/* KPI Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatCard
                  title="Total Inbound"
                  value={stats.total}
                  subvalue="calls"
                  icon={PhoneCall}
                  variant="cyan"
                  trend="+14% today"
                  trendPositive={true}
                />
                <StatCard
                  title="Allowed"
                  value={stats.allowed}
                  subvalue="safe"
                  icon={ShieldCheck}
                  variant="emerald"
                  trend={`${stats.total > 0 ? Math.round((stats.allowed / stats.total) * 100) : 0}% rate`}
                  trendPositive={true}
                  badgeText="PASSED"
                />
                <StatCard
                  title="Verify Required"
                  value={stats.verify}
                  subvalue="step-up"
                  icon={ShieldAlert}
                  variant="amber"
                  trend="MFA Challenge"
                  trendPositive={true}
                  badgeText="GATED"
                />
                <StatCard
                  title="Blocked Calls"
                  value={stats.blocked}
                  subvalue="exploits"
                  icon={ShieldX}
                  variant="rose"
                  trend="100% Mitigated"
                  trendPositive={false}
                  badgeText="BLOCKED"
                />
                <StatCard
                  title="Average Risk"
                  value={stats.avgRisk}
                  subvalue="/100"
                  icon={Activity}
                  variant={stats.avgRisk >= 70 ? 'rose' : stats.avgRisk >= 40 ? 'amber' : 'emerald'}
                  trend="Dynamic Mean"
                  badgeText={stats.avgRisk >= 70 ? 'CRITICAL' : stats.avgRisk >= 40 ? 'ELEVATED' : 'NOMINAL'}
                />
                <StatCard
                  title="High Risk Calls"
                  value={stats.highRisk}
                  subvalue="alerts"
                  icon={AlertTriangle}
                  variant="rose"
                  trend="Risk ≥ 70"
                  trendPositive={false}
                  badgeText="PRIORITY"
                />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DecisionPieChart calls={calls} />
                <ThreatBarChart calls={calls} />
              </div>

              {/* Risk Timeline Chart */}
              <RiskTimelineChart calls={calls} />

              {/* Quick Jump Action Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-purple-950/40 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    <Mic className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-mono font-bold text-white">
                      Live Voice Threat Testing Lab
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">
                      Test audio uploads or record live voice against FastAPI & LangGraph agent pipeline
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('voicelab')}
                  className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-extrabold tracking-wider transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] whitespace-nowrap"
                >
                  LAUNCH VOICE LAB →
                </button>
              </div>

              {/* Recent Calls Preview Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Radio className="w-4 h-4 text-cyan-400" />
                    Recent Voice Intercept Log
                  </h3>
                  <button
                    onClick={() => setActiveTab('calls')}
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    View All {calls.length} Records →
                  </button>
                </div>
                <CallTable calls={calls.slice(0, 5)} onSelectCall={setSelectedCall} />
              </div>
            </div>
          )}

          {/* TAB 2: LIVE VOICE LAB */}
          {activeTab === 'voicelab' && (
            <div className="space-y-6">
              <VoiceAnalyzer
                onAnalysisComplete={handleAnalysisComplete}
                backendOnline={backendOnline}
              />

              {lastAnalysis && (
                <div className="space-y-3 animate-fadeIn">
                  <h3 className="text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    LATEST VOICE ANALYSIS VERDICT
                  </h3>
                  <AnalysisResultCard
                    callRecord={lastAnalysis}
                    rawResponse={lastRawResponse}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CALL RECORDS TABLE */}
          {activeTab === 'calls' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-mono font-bold text-white tracking-wide">
                    SECURITY INTERCEPT ARCHIVE
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">
                    Filterable historical log of processed voice interactions and autonomous security actions
                  </p>
                </div>
              </div>

              <CallTable calls={calls} onSelectCall={setSelectedCall} />
            </div>
          )}

          {/* TAB 4: ARCHITECTURE VIEW */}
          {activeTab === 'architecture' && (
            <ArchitectureView />
          )}
        </main>
      </div>

      {/* Call Details Modal */}
      {selectedCall && (
        <CallDetailsModal
          call={selectedCall}
          onClose={() => setSelectedCall(null)}
        />
      )}
    </div>
  );
}
