'use client';

import React, { useState, useEffect } from 'react';
import { TrafficLog, Protocol, ServiceMode } from '@/lib/types';
import { useQAState } from '@/context/QAStateContext';
import { ModeBadge, ProtocolBadge, StatusCodeBadge, HttpMethodBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Search, 
  Trash2, 
  Download, 
  Radio, 
  Pause, 
  Play, 
  Filter, 
  Flame,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { cn, formatTimestamp } from '@/lib/utils';

interface LogTableProps {
  onSelectLog: (log: TrafficLog) => void;
  selectedLogId?: string;
}

export const LogTable: React.FC<LogTableProps> = ({ onSelectLog, selectedLogId }) => {
  const { trafficLogs, clearTrafficLogs, isStreaming, setIsStreaming, addTrafficLog, services } = useQAState();
  const [searchTerm, setSearchTerm] = useState('');
  const [protocolFilter, setProtocolFilter] = useState<'ALL' | Protocol>('ALL');
  const [modeFilter, setModeFilter] = useState<'ALL' | ServiceMode>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | '2xx' | '4xx' | '5xx'>('ALL');

  // Simulated real-time incoming traffic generator when isStreaming is on
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      // Pick random service
      const svc = services[Math.floor(Math.random() * services.length)];
      if (!svc) return;

      const isRest = svc.protocol === 'REST';
      const endpointsRest = ['/v1/charges', '/v1/customers/cus_99', '/v3/mail/send', '/oauth/token'];
      const endpointsSoap = ['/credit/v4/CreditScoreService', '/web-services/rate', '/ccx/service/Staffing/v39.0'];
      const methodsRest = ['GET', 'POST', 'POST', 'POST'];
      const methodsSoap = ['GetCreditScore', 'GetRates', 'Get_Workers'];

      const endpoint = isRest
        ? endpointsRest[Math.floor(Math.random() * endpointsRest.length)]
        : endpointsSoap[Math.floor(Math.random() * endpointsSoap.length)];
      
      const method = isRest
        ? methodsRest[Math.floor(Math.random() * methodsRest.length)]
        : methodsSoap[Math.floor(Math.random() * methodsSoap.length)];

      const isChaos = svc.chaosEnabled && Math.random() * 100 < svc.chaosRate;
      let statusCode = 200;
      if (isChaos) {
        statusCode = svc.chaosStatusCode || 500;
      } else if (svc.mode === 'MOCK') {
        statusCode = svc.healthStatus === 'OUTAGE' ? 500 : 200;
      }

      const randomLatency = svc.latencyMs + Math.floor(Math.random() * 60);

      const generatedLog: TrafficLog = {
        id: 'log-stream-' + Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        serviceId: svc.id,
        serviceName: svc.name,
        protocol: svc.protocol,
        mode: isChaos ? 'MOCK' : svc.mode,
        endpoint,
        method,
        statusCode,
        latencyMs: randomLatency,
        chaosInjected: isChaos,
        clientIp: `10.240.${Math.floor(Math.random() * 20)}.${Math.floor(Math.random() * 250)}`,
        traceId: 'tr-live-' + Math.random().toString(36).substring(2, 8),
        requestHeaders: {
          'Host': svc.baseUrl.replace('https://', '').split('/')[0],
          'User-Agent': 'StagingClient/2.4',
          'Content-Type': isRest ? 'application/json' : 'text/xml'
        },
        requestBody: isRest ? '{"stream_event": true}' : `<soapenv:Envelope><soapenv:Body><Event/></soapenv:Body></soapenv:Envelope>`,
        responseHeaders: {
          'Content-Type': isRest ? 'application/json' : 'text/xml',
          'X-Virtual-Engine': 'Stream-QA-Node'
        },
        responseBody: isRest
          ? JSON.stringify({ event: "telemetry_ping", status: statusCode }, null, 2)
          : `<soap:Envelope><soap:Body><PingResponse status="${statusCode}"/></soap:Body></soap:Envelope>`
      };

      addTrafficLog(generatedLog);
    }, 4500);

    return () => clearInterval(interval);
  }, [isStreaming, services, addTrafficLog]);

  // Filter logs
  const filteredLogs = trafficLogs.filter((log) => {
    if (protocolFilter !== 'ALL' && log.protocol !== protocolFilter) return false;
    if (modeFilter !== 'ALL' && log.mode !== modeFilter) return false;
    if (statusFilter === '2xx' && (log.statusCode < 200 || log.statusCode >= 300)) return false;
    if (statusFilter === '4xx' && (log.statusCode < 400 || log.statusCode >= 500)) return false;
    if (statusFilter === '5xx' && log.statusCode < 500) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        log.serviceName.toLowerCase().includes(q) ||
        log.endpoint.toLowerCase().includes(q) ||
        log.method.toLowerCase().includes(q) ||
        log.traceId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Protocol', 'Service', 'Method', 'Endpoint', 'Mode', 'Status', 'LatencyMs', 'ChaosInjected'];
    const rows = filteredLogs.map((l) => [
      l.timestamp,
      l.protocol,
      `"${l.serviceName}"`,
      l.method,
      `"${l.endpoint}"`,
      l.mode,
      l.statusCode,
      l.latencyMs,
      l.chaosInjected
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `qa-traffic-logs-${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col rounded border border-border bg-[#0f172a] shadow-panel overflow-hidden">
      {/* Stream Controls Toolbar */}
      <div className="p-3 bg-[#090d16] border-b border-border flex flex-wrap items-center justify-between gap-3">
        {/* Left side: Search & filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Filter by endpoint, trace, service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pl-8 pr-3 w-56 sm:w-64 rounded bg-[#070b12] border border-border text-xs text-slate-200 placeholder:text-slate-500 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Protocol filter */}
          <select
            value={protocolFilter}
            onChange={(e) => setProtocolFilter(e.target.value as any)}
            className="h-8 px-2.5 rounded bg-[#070b12] border border-border text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Protocols</option>
            <option value="REST">REST Only</option>
            <option value="SOAP">SOAP Only</option>
          </select>

          {/* Mode filter */}
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value as any)}
            className="h-8 px-2.5 rounded bg-[#070b12] border border-border text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Modes</option>
            <option value="PROXY">Proxy Live</option>
            <option value="MOCK">Mock Outage</option>
            <option value="FALLBACK">Auto-Fallback</option>
          </select>

          {/* Status code filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-8 px-2.5 rounded bg-[#070b12] border border-border text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Status</option>
            <option value="2xx">2xx Success</option>
            <option value="4xx">4xx Client Errors</option>
            <option value="5xx">5xx Outages / Server</option>
          </select>
        </div>

        {/* Right side: Stream toggle, export, clear */}
        <div className="flex items-center gap-2">
          <Button
            variant={isStreaming ? 'outline' : 'secondary'}
            size="sm"
            onClick={() => setIsStreaming(!isStreaming)}
            className={cn('font-mono', isStreaming && 'text-emerald-400 border-emerald-500/30')}
          >
            {isStreaming ? (
              <>
                <span className="relative flex h-2 w-2 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Streaming</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 mr-1 text-slate-400" />
                <span>Paused</span>
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleExportCSV}
            className="font-mono text-slate-400 hover:text-white"
            title="Download CSV log"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={clearTrafficLogs}
            className="font-mono text-slate-400 hover:text-rose-400"
            title="Clear buffer"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        </div>
      </div>

      {/* Table view */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="h-7 bg-[#090d16] border-b border-border text-[10px] font-mono uppercase text-slate-500 tracking-wider">
              <th className="px-3 w-28">Timestamp</th>
              <th className="px-2 w-16">Protocol</th>
              <th className="px-2 w-20">Method</th>
              <th className="px-3">Operation / Target Path</th>
              <th className="px-3">Service</th>
              <th className="px-2 w-28">Mode</th>
              <th className="px-2 w-16">Status</th>
              <th className="px-2 w-20 text-right">Latency</th>
              <th className="px-2 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-xs">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500 font-mono">
                  No intercepted traffic matching current filter criteria.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                const isSelected = selectedLogId === log.id;
                return (
                  <tr
                    key={log.id}
                    onClick={() => onSelectLog(log)}
                    className={cn(
                      'h-9 cursor-pointer transition-colors group select-none',
                      isSelected
                        ? 'bg-indigo-950/40 border-l-2 border-indigo-500'
                        : 'hover:bg-slate-800/50'
                    )}
                  >
                    <td className="px-3 whitespace-nowrap font-mono text-[11px] text-slate-400">
                      {formatTimestamp(log.timestamp)}
                    </td>

                    <td className="px-2 whitespace-nowrap">
                      <ProtocolBadge protocol={log.protocol} />
                    </td>

                    <td className="px-2 whitespace-nowrap">
                      <HttpMethodBadge method={log.method} />
                    </td>

                    <td className="px-3 font-mono text-[11px] text-slate-200">
                      <div className="flex items-center gap-1.5 truncate max-w-md">
                        <span className="truncate">{log.endpoint}</span>
                        {log.chaosInjected && (
                          <span title="Chaos fault injected">
                            <Flame className="w-3 h-3 text-rose-400 shrink-0" />
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-3 whitespace-nowrap font-mono text-[11px] text-slate-400">
                      {log.serviceName}
                    </td>

                    <td className="px-2 whitespace-nowrap">
                      <ModeBadge mode={log.mode} />
                    </td>

                    <td className="px-2 whitespace-nowrap">
                      <StatusCodeBadge code={log.statusCode} />
                    </td>

                    <td className="px-2 whitespace-nowrap text-right font-mono text-[11px]">
                      <span
                        className={cn(
                          'font-bold',
                          log.latencyMs > 1000
                            ? 'text-rose-400'
                            : log.latencyMs > 300
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        )}
                      >
                        {log.latencyMs}ms
                      </span>
                    </td>

                    <td className="px-2 text-right">
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer info */}
      <div className="px-3 py-2 bg-[#090d16] border-t border-border flex items-center justify-between text-[11px] font-mono text-slate-500">
        <span>
          Showing {filteredLogs.length} of {trafficLogs.length} intercepted calls in memory buffer
        </span>
        <span>Click any row to inspect full headers, payload diff, and replay cURL</span>
      </div>
    </div>
  );
};
