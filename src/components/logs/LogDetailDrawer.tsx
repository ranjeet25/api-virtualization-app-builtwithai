'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TrafficLog } from '@/lib/types';
import { useQAState } from '@/context/QAStateContext';
import { ModeBadge, ProtocolBadge, StatusCodeBadge, HttpMethodBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CodeEditor } from '@/components/editors/CodeEditor';
import { 
  X, 
  RotateCcw, 
  Terminal, 
  Copy, 
  Check, 
  Layers, 
  Clock, 
  Network, 
  Fingerprint,
  Flame,
  ArrowRight
} from 'lucide-react';
import { cn, formatTimestamp } from '@/lib/utils';

interface LogDetailDrawerProps {
  log: TrafficLog | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LogDetailDrawer: React.FC<LogDetailDrawerProps> = ({ log, isOpen, onClose }) => {
  const { replayLog, addToast } = useQAState();
  const [activeTab, setActiveTab] = useState<'response' | 'request' | 'headers'>('response');
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);

  if (!isOpen || !log) return null;

  const handleCopyCurl = () => {
    let curl = `curl -X ${log.method} "${log.endpoint}"`;
    Object.entries(log.requestHeaders).forEach(([k, v]) => {
      curl += ` \\\n  -H "${k}: ${v}"`;
    });
    if (log.requestBody) {
      curl += ` \\\n  -d '${log.requestBody.replace(/'/g, "\\'")}'`;
    }

    navigator.clipboard.writeText(curl);
    setCopiedCurl(true);
    addToast({
      type: 'success',
      title: 'cURL Command Copied',
      description: 'Ready to paste into terminal or Postman.'
    });
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleReplay = async () => {
    setIsReplaying(true);
    try {
      await replayLog(log);
    } finally {
      setIsReplaying(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-[#0f172a] border-l border-border-highlight shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="p-4 bg-[#090d16] border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ProtocolBadge protocol={log.protocol} />
          <HttpMethodBadge method={log.method} />
          <StatusCodeBadge code={log.statusCode} />
          <ModeBadge mode={log.mode} />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Target Path Banner */}
      <div className="px-4 py-2.5 bg-[#0b1326] border-b border-border flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-slate-400 font-bold shrink-0">{log.serviceName}:</span>
          <span className="text-slate-200 truncate" title={log.endpoint}>
            {log.endpoint}
          </span>
        </div>
        <span className="text-slate-500 shrink-0">{formatTimestamp(log.timestamp)}</span>
      </div>

      {/* Action Bar */}
      <div className="p-3 bg-[#0d1424] border-b border-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="xs"
            isLoading={isReplaying}
            onClick={handleReplay}
            className="font-mono"
            title="Re-execute this request through the virtual engine"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            <span>Replay Request</span>
          </Button>

          <Button
            variant="secondary"
            size="xs"
            onClick={handleCopyCurl}
            className="font-mono text-slate-300"
          >
            {copiedCurl ? (
              <>
                <Check className="w-3 h-3 mr-1 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Terminal className="w-3 h-3 mr-1" />
                <span>Copy cURL</span>
              </>
            )}
          </Button>
        </div>

        <Link href={`/services?serviceId=${log.serviceId}`}>
          <Button
            variant="ghost"
            size="xs"
            className="font-mono text-indigo-400 hover:text-indigo-300"
          >
            <Layers className="w-3 h-3 mr-1" />
            <span>Edit Mock Rule</span>
          </Button>
        </Link>
      </div>

      {/* Telemetry Overview Metadata */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0f172a] border-b border-border text-[11px] font-mono">
        <div>
          <span className="text-slate-500 block mb-0.5">INJECTED LATENCY</span>
          <span className={cn('font-bold', log.latencyMs > 1000 ? 'text-rose-400' : 'text-emerald-400')}>
            {log.latencyMs}ms
          </span>
        </div>
        <div>
          <span className="text-slate-500 block mb-0.5">CHAOS FAULT</span>
          <span className={cn('font-bold flex items-center gap-1', log.chaosInjected ? 'text-rose-400' : 'text-slate-400')}>
            {log.chaosInjected && <Flame className="w-3 h-3" />}
            {log.chaosInjected ? 'INJECTED (FAIL)' : 'NONE'}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block mb-0.5">CLIENT IP</span>
          <span className="text-slate-300">{log.clientIp}</span>
        </div>
        <div>
          <span className="text-slate-500 block mb-0.5">TRACE ID</span>
          <span className="text-indigo-300 truncate block" title={log.traceId}>
            {log.traceId}
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-border bg-[#090d16] px-4">
        <button
          onClick={() => setActiveTab('response')}
          className={cn(
            'px-4 py-2.5 text-xs font-mono font-medium transition-colors border-b-2',
            activeTab === 'response'
              ? 'border-indigo-500 text-white font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          )}
        >
          Response Payload ({log.protocol === 'REST' ? 'JSON' : 'XML'})
        </button>

        <button
          onClick={() => setActiveTab('request')}
          className={cn(
            'px-4 py-2.5 text-xs font-mono font-medium transition-colors border-b-2',
            activeTab === 'request'
              ? 'border-indigo-500 text-white font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          )}
        >
          Inbound Request Body
        </button>

        <button
          onClick={() => setActiveTab('headers')}
          className={cn(
            'px-4 py-2.5 text-xs font-mono font-medium transition-colors border-b-2',
            activeTab === 'headers'
              ? 'border-indigo-500 text-white font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          )}
        >
          Headers Breakdown
        </button>
      </div>

      {/* Tab Content Panes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'response' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>RESPONSE PAYLOAD RETURNED TO CLIENT:</span>
              <span className="text-emerald-400">Status: {log.statusCode}</span>
            </div>
            <CodeEditor
              value={log.responseBody || '{}'}
              onChange={() => {}}
              language={log.protocol === 'REST' ? 'json' : 'xml'}
              readOnly
              minHeight="350px"
            />
          </div>
        )}

        {activeTab === 'request' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>CLIENT INBOUND PAYLOAD:</span>
              <span className="text-slate-400">{log.method}</span>
            </div>
            {log.requestBody ? (
              <CodeEditor
                value={log.requestBody}
                onChange={() => {}}
                language={log.protocol === 'REST' ? 'json' : 'xml'}
                readOnly
                minHeight="350px"
              />
            ) : (
              <div className="p-8 text-center text-xs font-mono text-slate-500 bg-[#070b12] rounded border border-border">
                No request body was supplied (GET or empty payload).
              </div>
            )}
          </div>
        )}

        {activeTab === 'headers' && (
          <div className="space-y-6">
            {/* Response Headers */}
            <div>
              <h4 className="text-xs font-mono text-slate-300 uppercase tracking-wider mb-2 font-bold">
                Response Headers:
              </h4>
              <div className="rounded border border-border bg-[#070b12] overflow-hidden text-xs font-mono">
                {Object.entries(log.responseHeaders).map(([k, v]) => (
                  <div key={k} className="flex border-b border-border/50 last:border-none p-2">
                    <span className="w-1/3 text-indigo-400 font-semibold truncate">{k}:</span>
                    <span className="w-2/3 text-slate-300 break-all">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Request Headers */}
            <div>
              <h4 className="text-xs font-mono text-slate-300 uppercase tracking-wider mb-2 font-bold">
                Inbound Request Headers:
              </h4>
              <div className="rounded border border-border bg-[#070b12] overflow-hidden text-xs font-mono">
                {Object.entries(log.requestHeaders).map(([k, v]) => (
                  <div key={k} className="flex border-b border-border/50 last:border-none p-2">
                    <span className="w-1/3 text-slate-400 font-semibold truncate">{k}:</span>
                    <span className="w-2/3 text-slate-300 break-all">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
