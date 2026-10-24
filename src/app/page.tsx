'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQAState } from '@/context/QAStateContext';
import { SummaryStats } from '@/components/dashboard/SummaryStats';
import { ServiceCard } from '@/components/dashboard/ServiceCard';
import { ServiceTable } from '@/components/dashboard/ServiceTable';
import { Button } from '@/components/ui/Button';
import { Protocol, ServiceMode } from '@/lib/types';
import { 
  LayoutGrid, 
  Table as TableIcon, 
  Search, 
  Terminal, 
  Radio, 
  SlidersHorizontal,
  Flame,
  ShieldAlert,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MasterDashboardPage() {
  const { services, emergencyMockAll, resetAllToProxy } = useQAState();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [protocolFilter, setProtocolFilter] = useState<'ALL' | Protocol>('ALL');
  const [modeFilter, setModeFilter] = useState<'ALL' | ServiceMode>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const restCount = services.filter((s) => s.protocol === 'REST').length;
  const soapCount = services.filter((s) => s.protocol === 'SOAP').length;

  const filteredServices = services.filter((svc) => {
    if (protocolFilter !== 'ALL' && svc.protocol !== protocolFilter) return false;
    if (modeFilter !== 'ALL' && svc.mode !== modeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        svc.name.toLowerCase().includes(q) ||
        svc.category.toLowerCase().includes(q) ||
        svc.baseUrl.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white font-sans">
              Master QA Control Panel
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 uppercase font-semibold">
              Live Virtualization Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time circuit management, outage simulation switches, and latency injection across third-party REST and SOAP dependencies.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href="/sandbox">
            <Button variant="secondary" size="sm" className="font-mono text-xs">
              <Terminal className="w-3.5 h-3.5 mr-1 text-cyan-400" />
              <span>API Sandbox</span>
            </Button>
          </Link>
          <Link href="/logs">
            <Button variant="secondary" size="sm" className="font-mono text-xs">
              <Radio className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              <span>Live Traffic</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Top 4 Summary Telemetry Cards */}
      <SummaryStats />

      {/* Service Switcher Board Section */}
      <div className="space-y-4 pt-2">
        {/* Switcher Board Header with Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-[#0f172a] rounded border border-border">
          {/* Left: Search & Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 pr-3 w-48 sm:w-56 rounded bg-[#070b12] border border-border text-xs text-slate-200 placeholder:text-slate-500 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Protocol Tabs */}
            <div className="inline-flex rounded bg-[#070b12] border border-border p-0.5">
              <button
                type="button"
                onClick={() => setProtocolFilter('ALL')}
                className={cn(
                  'px-2.5 py-1 text-xs font-mono rounded transition-colors',
                  protocolFilter === 'ALL'
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                All ({services.length})
              </button>
              <button
                type="button"
                onClick={() => setProtocolFilter('REST')}
                className={cn(
                  'px-2.5 py-1 text-xs font-mono rounded transition-colors',
                  protocolFilter === 'REST'
                    ? 'bg-indigo-950 text-indigo-300 font-bold border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                REST ({restCount})
              </button>
              <button
                type="button"
                onClick={() => setProtocolFilter('SOAP')}
                className={cn(
                  'px-2.5 py-1 text-xs font-mono rounded transition-colors',
                  protocolFilter === 'SOAP'
                    ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                SOAP ({soapCount})
              </button>
            </div>

            {/* Mode Filter */}
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value as any)}
              className="h-8 px-2.5 rounded bg-[#070b12] border border-border text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Modes</option>
              <option value="PROXY">Proxy Only (Live)</option>
              <option value="MOCK">Mock Only (Outage)</option>
              <option value="FALLBACK">Auto-Fallback</option>
            </select>
          </div>

          {/* Right: Grid vs Table view switch */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">VIEW:</span>
            <div className="inline-flex rounded bg-[#070b12] border border-border p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-1.5 rounded transition-colors',
                  viewMode === 'grid'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                )}
                title="Grid Card View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={cn(
                  'p-1.5 rounded transition-colors',
                  viewMode === 'table'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                )}
                title="Compact Table View"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Board Content */}
        {filteredServices.length === 0 ? (
          <div className="p-12 text-center rounded border border-border bg-[#0f172a] shadow-panel">
            <p className="text-sm font-mono text-slate-400">
              No services found matching &ldquo;{searchQuery}&rdquo;.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setProtocolFilter('ALL');
                setModeFilter('ALL');
              }}
              className="mt-3 font-mono text-xs"
            >
              Reset Filters
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <ServiceTable services={filteredServices} />
        )}
      </div>
    </div>
  );
}
