'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Gauge } from 'lucide-react';

interface LatencySliderProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export const LatencySlider: React.FC<LatencySliderProps> = ({ value, onChange, className }) => {
  let statusColor = 'text-emerald-400';
  let badgeText = 'Nominal';
  let accentColor = 'accent-emerald-500';

  if (value > 1000) {
    statusColor = 'text-rose-400';
    badgeText = 'Severe Lag';
    accentColor = 'accent-rose-500';
  } else if (value > 300) {
    statusColor = 'text-amber-400';
    badgeText = 'Degraded';
    accentColor = 'accent-amber-500';
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
          <Gauge className="w-3.5 h-3.5 text-slate-500" />
          <span>INJECTED LATENCY:</span>
        </span>
        <div className="flex items-center gap-2 font-mono">
          <span className={cn('text-[11px] font-bold', statusColor)}>{value}ms</span>
          <span className="text-[9px] uppercase px-1 rounded bg-slate-900 border border-slate-800 text-slate-400">
            {badgeText}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="range"
          min="0"
          max="5000"
          step="50"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn('w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer', accentColor)}
        />
      </div>

      <div className="flex justify-between text-[9px] font-mono text-slate-500 px-0.5">
        <button
          type="button"
          onClick={() => onChange(50)}
          className="hover:text-slate-300 transition-colors"
        >
          50ms (LAN)
        </button>
        <button
          type="button"
          onClick={() => onChange(350)}
          className="hover:text-slate-300 transition-colors"
        >
          350ms (WAN)
        </button>
        <button
          type="button"
          onClick={() => onChange(1500)}
          className="hover:text-slate-300 transition-colors"
        >
          1.5s (Lag)
        </button>
        <button
          type="button"
          onClick={() => onChange(4000)}
          className="hover:text-slate-300 transition-colors"
        >
          4.0s (Timeout)
        </button>
      </div>
    </div>
  );
};
