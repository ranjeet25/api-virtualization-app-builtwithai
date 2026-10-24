'use client';

import React from 'react';
import { useQAState } from '@/context/QAStateContext';
import { LogTable } from '@/components/logs/LogTable';
import { LogDetailDrawer } from '@/components/logs/LogDetailDrawer';
import { Radio, Zap, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function LiveTrafficPage() {
  const { selectedLog, isLogDrawerOpen, selectLog, setIsLogDrawerOpen, trafficLogs } = useQAState();

  const proxiedCount = trafficLogs.filter((l) => l.mode === 'PROXY').length;
  const mockedCount = trafficLogs.filter((l) => l.mode === 'MOCK').length;
  const fallbackCount = trafficLogs.filter((l) => l.mode === 'FALLBACK').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white font-sans">
              Live Traffic Inspector
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 uppercase font-semibold flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Real-Time Interceptor
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Observe inbound payload stream in real-time, inspect headers, debug XML/JSON response transformations, and replay requests.
          </p>
        </div>

        {/* Traffic mode micro metrics */}
        <div className="flex items-center gap-3 bg-[#0f172a] px-3 py-1.5 rounded border border-border text-xs font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{proxiedCount} Proxied</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-rose-400 font-bold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{mockedCount} Mocked</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-amber-400">
            <Zap className="w-3.5 h-3.5" />
            <span>{fallbackCount} Fallback</span>
          </div>
        </div>
      </div>

      {/* Main Table Stream */}
      <LogTable
        onSelectLog={(log) => selectLog(log)}
        selectedLogId={selectedLog?.id}
      />

      {/* Slide-over Detail Drawer */}
      <LogDetailDrawer
        log={selectedLog}
        isOpen={isLogDrawerOpen}
        onClose={() => setIsLogDrawerOpen(false)}
      />
    </div>
  );
}
