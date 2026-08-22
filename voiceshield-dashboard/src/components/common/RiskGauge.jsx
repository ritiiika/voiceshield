import React from 'react';

export function RiskGauge({ score = 0, size = 180 }) {
  const normalizedScore = Math.min(100, Math.max(0, Number(score) || 0));
  
  // Calculate stroke parameters
  const strokeWidth = 12;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  // Semi-gauge or 270-degree arc
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * normalizedScore) / 100;

  // Determine color and status
  let color = '#10b981'; // emerald
  let statusText = 'SAFE / LOW RISK';
  let statusClass = 'text-emerald-400';
  let glowClass = 'shadow-[0_0_20px_rgba(16,185,129,0.3)]';

  if (normalizedScore >= 75) {
    color = '#ef4444'; // rose
    statusText = 'CRITICAL THREAT';
    statusClass = 'text-rose-400';
    glowClass = 'shadow-[0_0_25px_rgba(239,68,68,0.4)]';
  } else if (normalizedScore >= 45) {
    color = '#f59e0b'; // amber
    statusText = 'SUSPICIOUS / ELEVATED';
    statusClass = 'text-amber-400';
    glowClass = 'shadow-[0_0_20px_rgba(245,158,11,0.3)]';
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-135"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Progress Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.5s ease',
            }}
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold font-mono text-white tracking-tight">
            {normalizedScore}
          </span>
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">
            RISK INDEX
          </span>
        </div>
      </div>

      <div className={`mt-2 font-mono text-xs font-bold px-3 py-1 rounded border border-white/10 ${statusClass} ${glowClass}`}>
        {statusText}
      </div>
    </div>
  );
}
