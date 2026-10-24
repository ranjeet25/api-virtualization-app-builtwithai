'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQAState } from '@/context/QAStateContext';
import { Button } from '@/components/ui/Button';
import { 
  Activity, 
  Layers, 
  Terminal, 
  Radio, 
  ShieldAlert, 
  RotateCcw, 
  Cpu, 
  Flame,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { 
    services, 
    mockRules, 
    emergencyMockAll, 
    resetAllToProxy, 
    resetAllToDefaults 
  } = useQAState();

  const mockCount = services.filter((s) => s.mode === 'MOCK').length;
  const proxyCount = services.filter((s) => s.mode === 'PROXY').length;
  const fallbackCount = services.filter((s) => s.mode === 'FALLBACK').length;

  const navItems = [
    { href: '/', label: 'Control Panel', icon: Activity },
    { href: '/services', label: 'Mock Rule Builder', icon: Layers, badge: `${mockRules.length} rules` },
    { href: '/logs', label: 'Traffic Inspector', icon: Radio, pulse: true },
    { href: '/sandbox', label: 'API Sandbox', icon: Terminal },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-[#090d16]/95 backdrop-blur-md">
      {/* Top micro status bar */}
      <div className="h-6 px-4 bg-[#060e20] border-b border-border/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-slate-300">
            <Cpu className="w-3 h-3 text-indigo-400" />
            <span className="text-slate-500">GATEWAY:</span>
            <span className="text-indigo-300 font-semibold">QA-MESH-NODE-04</span>
          </span>
          <span className="text-slate-700">|</span>
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300">TELEMETRY SYNC:</span>
            <span className="text-emerald-400 font-medium">100% NOMINAL</span>
          </span>
          <span className="text-slate-700">|</span>
          <span className="hidden md:inline-flex items-center gap-1 text-slate-400">
            <span>UPSTREAM LATENCY AVG:</span>
            <span className="text-slate-200">142ms</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-medium">{proxyCount} Proxies</span>
            <span className="text-slate-600">/</span>
            <span className={cn('font-medium', mockCount > 0 ? 'text-rose-400 font-bold' : 'text-slate-400')}>
              {mockCount} Mocks
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-amber-400 font-medium">{fallbackCount} Fallback</span>
          </div>
          <span className="text-slate-700">|</span>
          <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px] tracking-wider uppercase font-semibold">
            STAGING CLUSTER
          </span>
        </div>
      </div>

      {/* Main navigation container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Logo & Product Name */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.4)] group-hover:scale-105 transition-transform">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-white font-sans">
                  QA Telemetry & Outage Switch
                </span>
                <span className="text-[10px] font-mono uppercase bg-indigo-950/80 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.2 rounded font-semibold">
                  Virtualizer
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono -mt-0.5">REST & SOAP Chaos Controller</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative px-3 py-1.5 rounded text-xs font-medium flex items-center gap-2 transition-all',
                    isActive
                      ? 'bg-slate-800 text-white shadow-inner border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  )}
                >
                  <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-indigo-400' : 'text-slate-500')} />
                  <span>{item.label}</span>

                  {item.badge && (
                    <span className="text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800 px-1.5 py-0.2 rounded">
                      {item.badge}
                    </span>
                  )}

                  {item.pulse && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                  )}

                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-indigo-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Global Chaos & Reset Controls */}
        <div className="flex items-center gap-2">
          {mockCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={resetAllToProxy}
              className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/30"
              title="Reset all services to live 3rd-party proxy mode"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              <span>Reset All Proxy</span>
            </Button>
          ) : (
            <Button
              variant="destructive"
              size="sm"
              onClick={emergencyMockAll}
              className="font-mono text-xs uppercase"
              title="Trip master circuit: switch all services to simulated mock outage"
            >
              <ShieldAlert className="w-3.5 h-3.5 mr-1" />
              <span>Outage Mock All</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={resetAllToDefaults}
            title="Reset all state to initial test fixtures"
            className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
