'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Service } from '@/lib/types';
import { useQAState } from '@/context/QAStateContext';
import { ModeToggleBar } from './ModeToggleBar';
import { LatencySlider } from './LatencySlider';
import { ChaosModal } from './ChaosModal';
import { ProtocolBadge, ModeBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Flame, 
  ExternalLink, 
  Layers, 
  Send, 
  Check, 
  Copy,
  Clock,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
  service: Service;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const { 
    updateServiceMode, 
    updateServiceLatency, 
    toggleServiceChaos, 
    executeRequest,
    addToast 
  } = useQAState();
  const [isChaosOpen, setIsChaosOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(service.baseUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleQuickTest = async () => {
    setIsTesting(true);
    try {
      const isRest = service.protocol === 'REST';
      const endpoint = isRest ? '/test/ping' : '/ServiceEndpoint';
      const method = isRest ? 'GET' : 'PingOperation';
      const headers = isRest
        ? { 'Accept': 'application/json', 'User-Agent': 'QA-TestRunner/1.0' }
        : { 'SOAPAction': `${service.baseUrl}/${method}`, 'Content-Type': 'text/xml' };
      const body = isRest ? '' : `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"><soapenv:Body><Ping/></soapenv:Body></soapenv:Envelope>`;

      const res = await executeRequest({
        serviceId: service.id,
        protocol: service.protocol,
        method,
        endpoint,
        headers,
        body
      });

      addToast({
        type: res.status < 400 ? 'success' : 'warning',
        title: `Test Call to ${service.name} completed`,
        description: `Returned ${res.status} in ${res.latencyMs}ms (${res.mode} mode).`
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded bg-[#0f172a] border transition-all duration-200 hover:border-slate-700 shadow-panel p-4',
        service.mode === 'MOCK' && 'border-rose-950/80 shadow-[0_4px_20px_rgba(244,63,94,0.06)]',
        service.mode === 'PROXY' && 'border-border',
        service.mode === 'FALLBACK' && 'border-amber-950/60'
      )}
    >
      {/* Top row: Badges & Chaos quick button */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <ProtocolBadge protocol={service.protocol} />
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              {service.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Chaos Fault Button */}
            <button
              onClick={() => setIsChaosOpen(true)}
              title={service.chaosEnabled ? `Chaos Fault Injector active (${service.chaosRate}%)` : 'Configure Chaos Injection'}
              className={cn(
                'flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border transition-colors',
                service.chaosEnabled
                  ? 'bg-rose-950/80 text-rose-300 border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.3)] animate-pulse'
                  : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300 hover:border-slate-700'
              )}
            >
              <Flame className={cn('w-3 h-3', service.chaosEnabled ? 'text-rose-400' : 'text-slate-500')} />
              <span>CHAOS {service.chaosEnabled ? `${service.chaosRate}%` : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* Title and description */}
        <div className="mb-3">
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors">
              {service.name}
            </h3>
            <ModeBadge mode={service.mode} />
          </div>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {service.description}
          </p>
        </div>

        {/* Base URL bar */}
        <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded bg-[#090d16] border border-border text-[11px] font-mono text-slate-400 mb-4">
          <span className="truncate" title={service.baseUrl}>
            {service.baseUrl}
          </span>
          <button
            onClick={handleCopyUrl}
            className="text-slate-500 hover:text-slate-300 transition-colors shrink-0"
            title="Copy URL"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* 3-State Mode Toggle Bar */}
        <div className="mb-4">
          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
            Routing Mode Controller:
          </label>
          <div className="w-full">
            <ModeToggleBar
              currentMode={service.mode}
              onChange={(newMode) => updateServiceMode(service.id, newMode)}
            />
          </div>
        </div>

        {/* Latency Slider */}
        <div className="mb-4 pt-2 border-t border-border/60">
          <LatencySlider
            value={service.latencyMs}
            onChange={(val) => updateServiceLatency(service.id, val)}
          />
        </div>
      </div>

      {/* Footer / Quick Actions */}
      <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{service.lastPing}</span>
          </span>
          <span className="text-slate-700">|</span>
          <span className="text-slate-400">
            {service.uptime24h}% Uptime
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="xs"
            isLoading={isTesting}
            onClick={handleQuickTest}
            className="font-mono text-slate-300 hover:text-white"
            title="Send synthetic test request through virtualizer"
          >
            <Send className="w-3 h-3 mr-1 text-indigo-400" />
            <span>Ping</span>
          </Button>

          <Link href={`/services?serviceId=${service.id}`}>
            <Button
              variant="secondary"
              size="xs"
              className="font-mono text-indigo-300 hover:text-indigo-200 border-indigo-500/20"
            >
              <Layers className="w-3 h-3 mr-1" />
              <span>{service.rulesCount} Rules</span>
            </Button>
          </Link>
        </div>
      </div>

      <ChaosModal
        service={service}
        isOpen={isChaosOpen}
        onClose={() => setIsChaosOpen(false)}
        onSave={toggleServiceChaos}
      />
    </div>
  );
};
