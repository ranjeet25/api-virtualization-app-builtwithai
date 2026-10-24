'use client';

import React from 'react';
import { useQAState } from '@/context/QAStateContext';
import { Activity, Radio, ShieldAlert, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SummaryStats: React.FC = () => {
  const { services, trafficLogs } = useQAState();

  const totalServices = services.length;
  const proxyCount = services.filter((s) => s.mode === 'PROXY').length;
  const mockCount = services.filter((s) => s.mode === 'MOCK').length;
  const fallbackCount = services.filter((s) => s.mode === 'FALLBACK').length;
  const chaosCount = services.filter((s) => s.chaosEnabled).length;
  const total24hRequests = services.reduce((acc, s) => acc + s.totalRequests24h, 0);

  return (
    <div className="space-y-4">
      {/* Alert Banner when Mocks or Chaos are active */}
      {mockCount > 0 && (
        <div className="p-3 rounded bg-rose-950/40 border border-rose-500/40 flex items-center justify-between text-xs text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.15)] animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <span className="p-1 rounded bg-rose-900/60 text-rose-300">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <div>
              <span className="font-bold text-rose-300">ACTIVE OUTAGE SWITCH:</span>{' '}
              <span>
                {mockCount} of {totalServices} services currently intercepting upstream traffic with synthetic mock responses.
              </span>
            </div>
          </div>
          <span className="font-mono text-[11px] uppercase bg-rose-900/40 border border-rose-500/30 px-2 py-0.5 rounded text-rose-300 font-bold">
            Simulated Downtime Active
          </span>
        </div>
      )}

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Total Services */}
        <div className="p-4 rounded bg-[#0f172a] border border-border shadow-panel flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
              Integrated Services
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-sans text-white">{totalServices}</span>
              <span className="text-xs font-mono text-slate-400">
                (4 REST / 4 SOAP)
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded bg-indigo-950/50 border border-indigo-500/30 text-indigo-400">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Active Proxies */}
        <div className="p-4 rounded bg-[#0f172a] border border-border shadow-panel flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Active Proxies (Live)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-sans text-emerald-400">{proxyCount}</span>
              <span className="text-xs font-mono text-slate-400">
                / {totalServices} Live Passing
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded bg-emerald-950/50 border border-emerald-500/30 text-emerald-400">
            <Radio className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Active Mocks */}
        <div className="p-4 rounded bg-[#0f172a] border border-border shadow-panel flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-rose-400 tracking-wider flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500"></span>
              Active Mocks (Outage)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={cn('text-2xl font-bold font-sans', mockCount > 0 ? 'text-rose-400' : 'text-slate-300')}>
                {mockCount}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {fallbackCount > 0 ? `+ ${fallbackCount} Auto-Fallback` : '0 Degraded'}
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded bg-rose-950/50 border border-rose-500/30 text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Intercepted Requests */}
        <div className="p-4 rounded bg-[#0f172a] border border-border shadow-panel flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
              Intercepted Requests (24h)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-sans text-white">
                {total24hRequests.toLocaleString()}
              </span>
              <span className="text-xs font-mono text-indigo-400 font-semibold">
                {trafficLogs.length} in buffer
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded bg-cyan-950/50 border border-cyan-500/30 text-cyan-400">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
