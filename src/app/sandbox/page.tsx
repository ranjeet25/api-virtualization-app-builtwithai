'use client';

import React, { useState, useEffect } from 'react';
import { useQAState } from '@/context/QAStateContext';
import { Protocol, HttpMethod, ServiceMode } from '@/lib/types';
import { ProtocolBadge, HttpMethodBadge, StatusCodeBadge, ModeBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CodeEditor } from '@/components/editors/CodeEditor';
import { 
  Send, 
  Terminal, 
  Layers, 
  RotateCcw, 
  Clock, 
  FileCode, 
  Check, 
  Plus, 
  Trash2,
  Sparkles,
  Zap,
  Flame,
  ArrowRight
} from 'lucide-react';
import { cn, formatBytes } from '@/lib/utils';

export default function ApiSandboxPage() {
  const { services, executeRequest, sandboxHistory, addToast } = useQAState();

  const [protocol, setProtocol] = useState<Protocol>('REST');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [method, setMethod] = useState<HttpMethod>('POST');
  const [endpoint, setEndpoint] = useState<string>('/v1/charges');
  const [soapOperation, setSoapOperation] = useState<string>('GetCreditScore');
  const [soapAction, setSoapAction] = useState<string>('http://experian.com/webservices/GetCreditScore');

  // Request Tabs: 'body' | 'headers' | 'params'
  const [requestTab, setRequestTab] = useState<'body' | 'headers' | 'params'>('body');
  
  // Headers state
  const [headersList, setHeadersList] = useState<{ id: string; key: string; value: string; enabled: boolean }[]>([
    { id: '1', key: 'Content-Type', value: 'application/json', enabled: true },
    { id: '2', key: 'Accept', value: 'application/json', enabled: true },
    { id: '3', key: 'Authorization', value: 'Bearer sk_test_sandbox_secret', enabled: true },
  ]);

  // Request Body
  const [requestBody, setRequestBody] = useState<string>(
    JSON.stringify({
      amount: 4999,
      currency: "usd",
      source: "tok_visa",
      description: "Sandbox test charge"
    }, null, 2)
  );

  // Response State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseLatency, setResponseLatency] = useState<number>(0);
  const [responseMode, setResponseMode] = useState<ServiceMode>('PROXY');
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [responseBody, setResponseBody] = useState<string>('');
  const [chaosInjected, setChaosInjected] = useState<boolean>(false);
  const [responseTab, setResponseTab] = useState<'body' | 'headers'>('body');

  // Set initial service
  useEffect(() => {
    const available = services.filter((s) => s.protocol === protocol);
    if (available.length > 0 && (!selectedServiceId || !available.find((s) => s.id === selectedServiceId))) {
      handleServiceChange(available[0].id);
    }
  }, [protocol, services]);

  const handleServiceChange = (svcId: string) => {
    setSelectedServiceId(svcId);
    const svc = services.find((s) => s.id === svcId);
    if (!svc) return;

    if (svc.protocol === 'REST') {
      if (svc.id.includes('stripe')) {
        setMethod('POST');
        setEndpoint('/v1/charges');
        setRequestBody(JSON.stringify({ amount: 4999, currency: "usd", source: "tok_visa" }, null, 2));
      } else if (svc.id.includes('sendgrid')) {
        setMethod('POST');
        setEndpoint('/v3/mail/send');
        setRequestBody(JSON.stringify({ personalizations: [{ to: [{ email: "tester@qa.internal" }] }], subject: "QA Sandbox Ping" }, null, 2));
      } else if (svc.id.includes('auth0')) {
        setMethod('POST');
        setEndpoint('/oauth/token');
        setRequestBody(JSON.stringify({ grant_type: "client_credentials", client_id: "test_client_id" }, null, 2));
      } else {
        setMethod('GET');
        setEndpoint('/api/v1/health');
        setRequestBody('');
      }
      setHeadersList([
        { id: '1', key: 'Content-Type', value: 'application/json', enabled: true },
        { id: '2', key: 'Accept', value: 'application/json', enabled: true }
      ]);
    } else {
      // SOAP Service defaults
      if (svc.id.includes('experian')) {
        setSoapOperation('GetCreditScore');
        setSoapAction('http://experian.com/webservices/GetCreditScore');
        setEndpoint('/credit/v4/CreditScoreService');
        setRequestBody(`<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <GetCreditScore xmlns="http://experian.com/webservices/">
      <ApplicantSSN>000-12-3456</ApplicantSSN>
      <PostalCode>94107</PostalCode>
    </GetCreditScore>
  </soap12:Body>
</soap12:Envelope>`);
      } else if (svc.id.includes('fedex')) {
        setSoapOperation('GetRates');
        setSoapAction('http://fedex.com/ws/rate/v28/getRates');
        setEndpoint('/web-services/rate');
        setRequestBody(`<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body>
    <GetRates>
      <OriginZip>90210</OriginZip>
      <DestinationZip>10001</DestinationZip>
    </GetRates>
  </soapenv:Body>
</soapenv:Envelope>`);
      } else {
        setSoapOperation('ExecuteService');
        setSoapAction('http://ws.enterprise.com/ExecuteService');
        setEndpoint('/ws/endpoint');
        setRequestBody(`<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body>
    <RequestData/>
  </soapenv:Body>
</soapenv:Envelope>`);
      }
      setHeadersList([
        { id: '1', key: 'Content-Type', value: 'application/soap+xml; charset=utf-8', enabled: true },
        { id: '2', key: 'SOAPAction', value: soapAction, enabled: true }
      ]);
    }
  };

  const handleSend = async () => {
    const svc = services.find((s) => s.id === selectedServiceId);
    if (!svc) return;

    setIsLoading(true);
    const headersMap: Record<string, string> = {};
    headersList.forEach((h) => {
      if (h.enabled && h.key) headersMap[h.key] = h.value;
    });

    try {
      const result = await executeRequest({
        serviceId: svc.id,
        protocol,
        method: protocol === 'REST' ? method : soapOperation,
        endpoint,
        headers: headersMap,
        body: requestBody
      });

      setResponseStatus(result.status);
      setResponseLatency(result.latencyMs);
      setResponseMode(result.mode);
      setResponseHeaders(result.headers);
      setResponseBody(result.body);
      setChaosInjected(result.chaosInjected);

      addToast({
        type: result.status < 400 ? 'success' : 'warning',
        title: `Sandbox Response ${result.status}`,
        description: `Delivered in ${result.latencyMs}ms via ${result.mode} routing.`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentService = services.find((s) => s.id === selectedServiceId);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white font-sans">
              Interactive API Sandbox
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 uppercase font-semibold">
              Postman & SoapUI Emulator
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Construct and fire synthetic requests directly into the virtualization proxy to verify mock rules, chaos error injections, and latency simulation.
          </p>
        </div>

        {/* Protocol Switch */}
        <div className="inline-flex rounded bg-[#0f172a] border border-border p-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setProtocol('REST');
            }}
            className={cn(
              'px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors',
              protocol === 'REST'
                ? 'bg-indigo-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            REST Sandbox
          </button>
          <button
            type="button"
            onClick={() => {
              setProtocol('SOAP');
            }}
            className={cn(
              'px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors',
              protocol === 'SOAP'
                ? 'bg-cyan-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            SOAP WebService
          </button>
        </div>
      </div>

      {/* Main Grid: Left Request / Response (8 cols), Right History Sidebar (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Client (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Service Picker & URL Bar */}
          <div className="p-4 rounded bg-[#0f172a] border border-border shadow-panel space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400 uppercase">Target Service:</span>
                <select
                  value={selectedServiceId}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="h-8 px-2.5 rounded bg-[#090d16] border border-border text-xs font-mono text-white focus:outline-none focus:border-indigo-500 font-semibold"
                >
                  {services
                    .filter((s) => s.protocol === protocol)
                    .map((svc) => (
                      <option key={svc.id} value={svc.id}>
                        {svc.name} ({svc.mode})
                      </option>
                    ))}
                </select>
              </div>

              {currentService && (
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-500">Current Mode:</span>
                  <ModeBadge mode={currentService.mode} />
                  <span className="text-slate-400">+{currentService.latencyMs}ms delay</span>
                </div>
              )}
            </div>

            {/* Request Address Bar */}
            <div className="flex items-center rounded bg-[#090d16] border border-border overflow-hidden p-1 gap-1">
              {protocol === 'REST' ? (
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as HttpMethod)}
                  className="h-8 px-2.5 rounded bg-[#0f172a] border-0 text-xs font-mono font-bold text-sky-400 focus:outline-none uppercase"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </select>
              ) : (
                <div className="px-3 py-1 font-mono text-xs font-bold text-cyan-400 bg-[#0f172a] rounded uppercase">
                  SOAP 1.2
                </div>
              )}

              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="/v1/charges"
                className="flex-1 h-8 px-3 bg-transparent text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none"
              />

              <Button
                variant="primary"
                size="sm"
                isLoading={isLoading}
                onClick={handleSend}
                className="font-mono text-xs px-4"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                <span>Send</span>
              </Button>
            </div>

            {/* If SOAP, show SOAPAction input */}
            {protocol === 'SOAP' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    SOAP Operation:
                  </label>
                  <input
                    type="text"
                    value={soapOperation}
                    onChange={(e) => setSoapOperation(e.target.value)}
                    className="w-full h-7 px-2.5 rounded bg-[#090d16] border border-border text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    SOAPAction Header:
                  </label>
                  <input
                    type="text"
                    value={soapAction}
                    onChange={(e) => setSoapAction(e.target.value)}
                    className="w-full h-7 px-2.5 rounded bg-[#090d16] border border-border text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Request Construction Tabs */}
          <div className="rounded bg-[#0f172a] border border-border shadow-panel overflow-hidden">
            <div className="flex border-b border-border bg-[#090d16] px-3">
              <button
                onClick={() => setRequestTab('body')}
                className={cn(
                  'px-3 py-2 text-xs font-mono transition-colors border-b-2',
                  requestTab === 'body'
                    ? 'border-indigo-500 text-white font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                )}
              >
                Payload Body ({protocol === 'REST' ? 'JSON' : 'XML'})
              </button>
              <button
                onClick={() => setRequestTab('headers')}
                className={cn(
                  'px-3 py-2 text-xs font-mono transition-colors border-b-2',
                  requestTab === 'headers'
                    ? 'border-indigo-500 text-white font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                )}
              >
                Headers ({headersList.filter((h) => h.enabled).length})
              </button>
            </div>

            <div className="p-3">
              {requestTab === 'body' ? (
                <CodeEditor
                  value={requestBody}
                  onChange={setRequestBody}
                  language={protocol === 'REST' ? 'json' : 'xml'}
                  minHeight="200px"
                />
              ) : (
                <div className="space-y-2">
                  <div className="space-y-1.5">
                    {headersList.map((header, idx) => (
                      <div key={header.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={header.enabled}
                          onChange={(e) => {
                            const updated = [...headersList];
                            updated[idx].enabled = e.target.checked;
                            setHeadersList(updated);
                          }}
                          className="h-3.5 w-3.5 rounded bg-slate-900 border-border text-indigo-600 focus:ring-0"
                        />
                        <input
                          type="text"
                          value={header.key}
                          onChange={(e) => {
                            const updated = [...headersList];
                            updated[idx].key = e.target.value;
                            setHeadersList(updated);
                          }}
                          placeholder="Header Key"
                          className="w-1/3 h-7 px-2 rounded bg-[#090d16] border border-border text-xs font-mono text-slate-200"
                        />
                        <input
                          type="text"
                          value={header.value}
                          onChange={(e) => {
                            const updated = [...headersList];
                            updated[idx].value = e.target.value;
                            setHeadersList(updated);
                          }}
                          placeholder="Header Value"
                          className="flex-1 h-7 px-2 rounded bg-[#090d16] border border-border text-xs font-mono text-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => setHeadersList(headersList.filter((h) => h.id !== header.id))}
                          className="p-1 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() =>
                      setHeadersList([
                        ...headersList,
                        { id: Math.random().toString(), key: '', value: '', enabled: true }
                      ])
                    }
                    className="font-mono text-slate-400 hover:text-white"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    <span>Add Header</span>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Response Inspector */}
          <div className="rounded bg-[#0f172a] border border-border shadow-panel overflow-hidden">
            <div className="p-3 bg-[#090d16] border-b border-border flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-slate-200 uppercase">
                  Virtual Response
                </span>
                {responseStatus && (
                  <div className="flex items-center gap-2">
                    <StatusCodeBadge code={responseStatus} />
                    <ModeBadge mode={responseMode} />
                    {chaosInjected && (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-rose-400 bg-rose-950/60 border border-rose-500/40 px-1.5 py-0.5 rounded font-bold animate-pulse">
                        <Flame className="w-3 h-3" />
                        <span>Chaos Injected</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {responseStatus && (
                <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                  <span>
                    Latency: <strong className="text-emerald-400">{responseLatency}ms</strong>
                  </span>
                  <span className="text-slate-600">|</span>
                  <span>
                    Size: <strong className="text-slate-200">{formatBytes(new Blob([responseBody]).size)}</strong>
                  </span>
                </div>
              )}
            </div>

            {responseStatus ? (
              <div>
                <div className="flex border-b border-border bg-[#070b12] px-3">
                  <button
                    onClick={() => setResponseTab('body')}
                    className={cn(
                      'px-3 py-2 text-xs font-mono transition-colors border-b-2',
                      responseTab === 'body'
                        ? 'border-indigo-500 text-white font-bold'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    )}
                  >
                    Response Body
                  </button>
                  <button
                    onClick={() => setResponseTab('headers')}
                    className={cn(
                      'px-3 py-2 text-xs font-mono transition-colors border-b-2',
                      responseTab === 'headers'
                        ? 'border-indigo-500 text-white font-bold'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    )}
                  >
                    Response Headers ({Object.keys(responseHeaders).length})
                  </button>
                </div>

                <div className="p-3">
                  {responseTab === 'body' ? (
                    <CodeEditor
                      value={responseBody}
                      onChange={() => {}}
                      language={protocol === 'REST' ? 'json' : 'xml'}
                      readOnly
                      minHeight="280px"
                    />
                  ) : (
                    <div className="rounded border border-border bg-[#070b12] overflow-hidden text-xs font-mono">
                      {Object.entries(responseHeaders).map(([k, v]) => (
                        <div key={k} className="flex border-b border-border/50 last:border-none p-2">
                          <span className="w-1/3 text-indigo-400 font-semibold truncate">{k}:</span>
                          <span className="w-2/3 text-slate-300 break-all">{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-xs font-mono text-slate-500">
                Click &quot;Send&quot; above to dispatch a test request into the virtualization engine.
              </div>
            )}
          </div>
        </div>

        {/* Right: History Sidebar (4 cols) */}
        <div className="lg:col-span-4 rounded bg-[#0f172a] border border-border shadow-panel overflow-hidden flex flex-col">
          <div className="p-3 bg-[#090d16] border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-mono font-semibold text-slate-200 uppercase">
                Execution History
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              {sandboxHistory.length} calls
            </span>
          </div>

          <div className="divide-y divide-border/60 max-h-[650px] overflow-y-auto">
            {sandboxHistory.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-slate-500">
                No recent sandbox requests. Requests executed will show up here for 1-click reload.
              </div>
            ) : (
              sandboxHistory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setProtocol(item.protocol);
                    setEndpoint(item.endpoint);
                    if (item.protocol === 'REST') {
                      setMethod(item.method as HttpMethod);
                    } else {
                      setSoapOperation(item.method);
                    }
                  }}
                  className="p-3 hover:bg-slate-800/40 cursor-pointer transition-colors group select-none"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5">
                      <ProtocolBadge protocol={item.protocol} />
                      <HttpMethodBadge method={item.method} />
                      <StatusCodeBadge code={item.status} />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{item.timestamp}</span>
                  </div>

                  <p className="text-xs font-mono text-slate-200 truncate group-hover:text-white mt-1">
                    {item.endpoint}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1">
                    <span>{item.serviceName}</span>
                    <span className="text-emerald-400 font-bold">{item.latencyMs}ms</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
