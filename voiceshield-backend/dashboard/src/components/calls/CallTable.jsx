import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, ChevronRight, PhoneCall, ShieldAlert, SlidersHorizontal, Download } from 'lucide-react';
import { DecisionBadge, ThreatBadge, RiskScoreBadge } from '../common/StatusBadge';

export function CallTable({ calls = [], onSelectCall }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [decisionFilter, setDecisionFilter] = useState('ALL');
  const [threatFilter, setThreatFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('timestamp'); // 'timestamp', 'risk', 'confidence'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

  // Extract unique threat types for dropdown
  const uniqueThreats = useMemo(() => {
    const set = new Set();
    calls.forEach(c => {
      if (c.threat_type) set.add(c.threat_type);
    });
    return Array.from(set);
  }, [calls]);

  // Filter and Sort Calls
  const filteredCalls = useMemo(() => {
    return calls
      .filter((call) => {
        // Search filter
        const matchSearch =
          (call.call_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (call.caller_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (call.requested_action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (call.threat_type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (call.transcript || '').toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchSearch) return false;

        // Decision filter
        if (decisionFilter === 'HIGH_RISK') {
          if ((call.risk_score || 0) < 70) return false;
        } else if (decisionFilter !== 'ALL') {
          if ((call.decision || '').toUpperCase() !== decisionFilter) return false;
        }

        // Threat filter
        if (threatFilter !== 'ALL') {
          if (call.threat_type !== threatFilter) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA = a.created_at;
        let valB = b.created_at;

        if (sortBy === 'risk') {
          valA = a.risk_score || 0;
          valB = b.risk_score || 0;
        } else if (sortBy === 'confidence') {
          valA = a.confidence || 0;
          valB = b.confidence || 0;
        } else if (sortBy === 'timestamp') {
          valA = new Date(a.created_at).getTime();
          valB = new Date(b.created_at).getTime();
        }

        if (sortOrder === 'asc') {
          return valA > valB ? 1 : -1;
        } else {
          return valA < valB ? 1 : -1;
        }
      });
  }, [calls, searchTerm, decisionFilter, threatFilter, sortBy, sortOrder]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const exportCSV = () => {
    const headers = ['Call ID', 'Caller', 'Requested Action', 'Threat', 'Risk Score', 'Decision', 'Confidence', 'Timestamp', 'Transcript'];
    const rows = filteredCalls.map(c => [
      c.call_id,
      c.caller_id,
      c.requested_action,
      c.threat_type,
      c.risk_score,
      c.decision,
      c.confidence,
      c.created_at,
      `"${(c.transcript || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `voiceshield_calls_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search call ID, caller, action, threat, transcript..."
              className="w-full pl-9 pr-4 py-2 bg-black/40 border border-slate-800 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors"
            />
          </div>

          {/* Export CSV */}
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-mono text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
          {/* Decision Quick Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-500 text-[11px] mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            {['ALL', 'BLOCK', 'VERIFY', 'ALLOW', 'HIGH_RISK'].map((d) => {
              const active = decisionFilter === d;
              let activeStyle = 'bg-cyan-950 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]';
              if (d === 'BLOCK') activeStyle = 'bg-rose-950 text-rose-300 border-rose-500/50';
              if (d === 'VERIFY') activeStyle = 'bg-amber-950 text-amber-300 border-amber-500/50';
              if (d === 'ALLOW') activeStyle = 'bg-emerald-950 text-emerald-300 border-emerald-500/50';
              if (d === 'HIGH_RISK') activeStyle = 'bg-red-950 text-red-300 border-red-500/50 font-bold';

              return (
                <button
                  key={d}
                  onClick={() => setDecisionFilter(d)}
                  className={`px-2.5 py-1 rounded-md transition-all border ${
                    active
                      ? activeStyle
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {d === 'HIGH_RISK' ? 'HIGH RISK (>70)' : d}
                </button>
              );
            })}
          </div>

          {/* Threat Select Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[11px]">Threat:</span>
            <select
              value={threatFilter}
              onChange={(e) => setThreatFilter(e.target.value)}
              className="bg-black/50 border border-slate-800 rounded px-2.5 py-1 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500/60"
            >
              <option value="ALL">All Threat Types</option>
              {uniqueThreats.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Calls Table Card */}
      <div className="rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 select-none">
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Call ID</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Caller</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Requested Action</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Threat Category</th>
                <th 
                  onClick={() => toggleSort('risk')}
                  className="py-3 px-4 font-semibold uppercase tracking-wider cursor-pointer hover:text-cyan-400 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Risk Score</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Decision</th>
                <th 
                  onClick={() => toggleSort('confidence')}
                  className="py-3 px-4 font-semibold uppercase tracking-wider cursor-pointer hover:text-cyan-400 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Confidence</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th 
                  onClick={() => toggleSort('timestamp')}
                  className="py-3 px-4 font-semibold uppercase tracking-wider cursor-pointer hover:text-cyan-400 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Timestamp</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right font-semibold uppercase tracking-wider">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCalls.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 font-mono">
                    No voice intercepts matched your search criteria.
                  </td>
                </tr>
              ) : (
                filteredCalls.map((call) => (
                  <tr
                    key={call.id || call.call_id}
                    onClick={() => onSelectCall(call)}
                    className="hover:bg-cyan-950/20 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4 font-bold text-cyan-300 whitespace-nowrap">
                      {call.call_id}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-medium whitespace-nowrap">
                      {call.caller_id}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className="bg-slate-800/80 px-2 py-0.5 rounded text-[11px] text-slate-300 border border-slate-700/60">
                        {call.requested_action}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <ThreatBadge threat={call.threat_type} />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <RiskScoreBadge score={call.risk_score} />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <DecisionBadge decision={call.decision} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {Math.round((call.confidence || 0.9) * 100)}%
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(call.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        className="p-1 rounded bg-slate-800 group-hover:bg-cyan-500 group-hover:text-black text-slate-400 transition-colors"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>Showing {filteredCalls.length} of {calls.length} intercept records</span>
          <span>Click any row to open deep SOC security reasoning</span>
        </div>
      </div>
    </div>
  );
}
