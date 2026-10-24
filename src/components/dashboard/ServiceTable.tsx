'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Service } from '@/lib/types';
import { useQAState } from '@/context/QAStateContext';
import { ModeToggleBar } from './ModeToggleBar';
import { ChaosModal } from './ChaosModal';
import { ProtocolBadge, ModeBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Flame, Layers, Send, Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceTableProps {
  services: Service[];
}

export const ServiceTable: React.FC<ServiceTableProps> = ({ services }) => {
  const { 
    updateServiceMode, 
    updateServiceLatency, 
    toggleServiceChaos, 
    executeRequest,
    addToast 
  } = useQAState();
  const [selectedChaosService, setSelectedChaosService] = useState<Service | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  const handleQuickTest = async (service: Service) => {
    setTestingId(service.id);
    try {
      const isRest = service.protocol === 'REST';
      const endpoint = isRest ? '/test/ping' : '/ServiceEndpoint';
      const method = isRest ? 'GET' : 'PingOperation';
      const headers = isRest
        ? { 'Accept': 'application/json' }
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
      setTestingId(null);
    }
  };

  return (
    <div className="w-full overflow-x-auto rounded border border-border bg-[#0f172a] shadow-panel">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="h-8 bg-[#090d16] border-b border-border text-[10px] font-mono uppercase text-slate-400 tracking-wider">
            <th className="px-3">Protocol</th>
            <th className="px-3">Service Name & Base URL</th>
            <th className="px-3">Category</th>
            <th className="px-3">Routing Mode Switch</th>
            <th className="px-3">Latency (ms)</th>
            <th className="px-3">Chaos Injector</th>
            <th className="px-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60 text-xs">
          {services.map((svc) => (
            <tr
              key={svc.id}
              className="h-12 hover:bg-slate-800/40 transition-colors group"
            >
              <td className="px-3 whitespace-nowrap">
                <ProtocolBadge protocol={svc.protocol} />
              </td>

              <td className="px-3">
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-200 group-hover:text-white">
                    {svc.name}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500 truncate max-w-xs" title={svc.baseUrl}>
                    {svc.baseUrl}
                  </span>
                </div>
              </td>

              <td className="px-3 whitespace-nowrap font-mono text-[11px] text-slate-400">
                {svc.category}
              </td>

              <td className="px-3 whitespace-nowrap">
                <ModeToggleBar
                  currentMode={svc.mode}
                  size="sm"
                  onChange={(mode) => updateServiceMode(svc.id, mode)}
                />
              </td>

              <td className="px-3 whitespace-nowrap">
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <Gauge className="w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="number"
                    min="0"
                    max="5000"
                    step="50"
                    value={svc.latencyMs}
                    onChange={(e) => updateServiceLatency(svc.id, Math.max(0, Number(e.target.value)))}
                    className="w-16 px-1.5 py-0.5 rounded bg-[#090d16] border border-border text-slate-200 text-center font-bold focus:border-indigo-500 focus:outline-none"
                  />
                  <span className="text-slate-500">ms</span>
                </div>
              </td>

              <td className="px-3 whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => setSelectedChaosService(svc)}
                  className={cn(
                    'flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono uppercase font-bold border transition-colors',
                    svc.chaosEnabled
                      ? 'bg-rose-950/80 text-rose-300 border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.3)] animate-pulse'
                      : 'bg-[#090d16] text-slate-500 border-border hover:text-slate-300'
                  )}
                >
                  <Flame className={cn('w-3 h-3', svc.chaosEnabled ? 'text-rose-400' : 'text-slate-500')} />
                  <span>{svc.chaosEnabled ? `ACTIVE (${svc.chaosRate}%)` : 'DISABLED'}</span>
                </button>
              </td>

              <td className="px-3 whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    variant="ghost"
                    size="xs"
                    isLoading={testingId === svc.id}
                    onClick={() => handleQuickTest(svc)}
                    className="font-mono text-slate-300"
                    title="Send test ping to service"
                  >
                    <Send className="w-3 h-3 mr-1 text-indigo-400" />
                    <span>Ping</span>
                  </Button>
                  <Link href={`/services?serviceId=${svc.id}`}>
                    <Button
                      variant="secondary"
                      size="xs"
                      className="font-mono text-indigo-300"
                    >
                      <Layers className="w-3 h-3 mr-1" />
                      <span>{svc.rulesCount} Rules</span>
                    </Button>
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedChaosService && (
        <ChaosModal
          service={selectedChaosService}
          isOpen={!!selectedChaosService}
          onClose={() => setSelectedChaosService(null)}
          onSave={toggleServiceChaos}
        />
      )}
    </div>
  );
};
