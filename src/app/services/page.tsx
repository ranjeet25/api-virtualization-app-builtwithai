'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQAState } from '@/context/QAStateContext';
import { MockRule, Protocol, HttpMethod } from '@/lib/types';
import { CodeEditor } from '@/components/editors/CodeEditor';
import { ProtocolBadge, HttpMethodBadge, StatusCodeBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SOAP_FAULTS_TEMPLATES, REST_PRESET_TEMPLATES } from '@/lib/mock-ui-data';
import { 
  Plus, 
  Trash2, 
  Save, 
  Layers, 
  FileCode, 
  Check, 
  Radio, 
  SlidersHorizontal,
  Flame,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

function MockRuleBuilderContent() {
  const searchParams = useSearchParams();
  const preselectedServiceId = searchParams.get('serviceId');
  const { services, mockRules, addMockRule, updateMockRule, deleteMockRule, toggleMockRule, addToast } = useQAState();

  const [activeProtocolTab, setActiveProtocolTab] = useState<Protocol>('REST');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);

  // Form edit states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [statusCode, setStatusCode] = useState<number>(200);
  const [delayMs, setDelayMs] = useState<number>(150);
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [pathPattern, setPathPattern] = useState('');
  const [soapOperation, setSoapOperation] = useState('');
  const [soapAction, setSoapAction] = useState('');
  const [responseContentType, setResponseContentType] = useState('application/json');
  const [responseBody, setResponseBody] = useState('');
  const [headerKey, setHeaderKey] = useState('');
  const [headerVal, setHeaderVal] = useState('');
  const [headersMap, setHeadersMap] = useState<Record<string, string>>({});
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Set default service
  useEffect(() => {
    if (preselectedServiceId) {
      const match = services.find((s) => s.id === preselectedServiceId);
      if (match) {
        setSelectedServiceId(match.id);
        setActiveProtocolTab(match.protocol);
        return;
      }
    }

    const available = services.filter((s) => s.protocol === activeProtocolTab);
    if (available.length > 0 && (!selectedServiceId || !available.find((s) => s.id === selectedServiceId))) {
      setSelectedServiceId(available[0].id);
    }
  }, [preselectedServiceId, activeProtocolTab, services, selectedServiceId]);

  // Filter rules
  const currentService = services.find((s) => s.id === selectedServiceId);
  const filteredRules = mockRules.filter((r) => r.serviceId === selectedServiceId);

  // Auto-select first rule if none selected
  useEffect(() => {
    if (!isCreatingNew && filteredRules.length > 0 && (!selectedRuleId || !filteredRules.find((r) => r.id === selectedRuleId))) {
      populateRule(filteredRules[0]);
    } else if (filteredRules.length === 0 && !isCreatingNew) {
      resetFormForNewRule();
    }
  }, [filteredRules, selectedRuleId, isCreatingNew]);

  const populateRule = (rule: MockRule) => {
    setIsCreatingNew(false);
    setSelectedRuleId(rule.id);
    setName(rule.name);
    setDescription(rule.description);
    setStatusCode(rule.statusCode);
    setDelayMs(rule.delayMs);
    setMethod(rule.method || 'GET');
    setPathPattern(rule.pathPattern || '');
    setSoapOperation(rule.soapOperation || '');
    setSoapAction(rule.soapAction || '');
    setResponseContentType(rule.responseContentType);
    setResponseBody(rule.responseBody);
    setHeadersMap(rule.headers || {});
  };

  const resetFormForNewRule = () => {
    setIsCreatingNew(true);
    setSelectedRuleId(null);
    setName('New Simulated Response Rule');
    setDescription('Returns synthetic payload when route criteria matches.');
    setStatusCode(200);
    setDelayMs(150);
    setMethod('POST');
    setPathPattern('/v1/custom-endpoint');
    setSoapOperation('CustomOperation');
    setSoapAction(`http://${currentService?.baseUrl.replace('https://', '').split('/')[0] || 'service.com'}/CustomOperation`);
    setResponseContentType(activeProtocolTab === 'REST' ? 'application/json' : 'text/xml');
    setResponseBody(
      activeProtocolTab === 'REST'
        ? REST_PRESET_TEMPLATES.success200
        : SOAP_FAULTS_TEMPLATES.soap12Sender
    );
    setHeadersMap({
      'Content-Type': activeProtocolTab === 'REST' ? 'application/json' : 'text/xml; charset=utf-8',
      'X-Mock-Engine': 'QA-Virtualizer-2.0'
    });
  };

  const handleSave = () => {
    if (!currentService) return;

    if (isCreatingNew) {
      addMockRule({
        serviceId: currentService.id,
        name: name || 'Untitled Rule',
        protocol: activeProtocolTab,
        enabled: true,
        method: activeProtocolTab === 'REST' ? method : undefined,
        pathPattern: activeProtocolTab === 'REST' ? pathPattern : undefined,
        soapOperation: activeProtocolTab === 'SOAP' ? soapOperation : undefined,
        soapAction: activeProtocolTab === 'SOAP' ? soapAction : undefined,
        statusCode,
        delayMs,
        headers: headersMap,
        responseContentType,
        responseBody,
        description: description || 'Custom QA mock rule'
      });
      setIsCreatingNew(false);
    } else if (selectedRuleId) {
      const existing = mockRules.find((r) => r.id === selectedRuleId);
      if (!existing) return;

      updateMockRule({
        ...existing,
        name,
        description,
        statusCode,
        delayMs,
        method: activeProtocolTab === 'REST' ? method : undefined,
        pathPattern: activeProtocolTab === 'REST' ? pathPattern : undefined,
        soapOperation: activeProtocolTab === 'SOAP' ? soapOperation : undefined,
        soapAction: activeProtocolTab === 'SOAP' ? soapAction : undefined,
        headers: headersMap,
        responseContentType,
        responseBody,
      });
    }
  };

  const handleAddHeader = () => {
    if (!headerKey.trim()) return;
    setHeadersMap((prev) => ({ ...prev, [headerKey.trim()]: headerVal.trim() }));
    setHeaderKey('');
    setHeaderVal('');
  };

  const handleRemoveHeader = (k: string) => {
    setHeadersMap((prev) => {
      const copy = { ...prev };
      delete copy[k];
      return copy;
    });
  };

  const restTemplates = [
    { label: '200 OK (Payment Succeeded)', content: REST_PRESET_TEMPLATES.success200 },
    { label: '400 Bad Request (Invalid Args)', content: REST_PRESET_TEMPLATES.badRequest400 },
    { label: '401 Unauthorized (Auth Token Invalid)', content: REST_PRESET_TEMPLATES.unauthorized401 },
    { label: '429 Rate Limit Burst Exceeded', content: REST_PRESET_TEMPLATES.rateLimit429 },
    { label: '500 Outage Switch (Downstream Deadlock)', content: REST_PRESET_TEMPLATES.outage500 },
  ];

  const soapTemplates = [
    { label: 'SOAP 1.2 Sender Fault (Client SSN Mismatch)', content: SOAP_FAULTS_TEMPLATES.soap12Sender },
    { label: 'SOAP 1.2 Receiver Outage (Vendor Maintenance)', content: SOAP_FAULTS_TEMPLATES.soap12Receiver },
    { label: 'SOAP 1.1 Client ValidationError', content: SOAP_FAULTS_TEMPLATES.soap11Client },
    { label: 'SOAP 1.1 Server Timeout (504 Fault)', content: SOAP_FAULTS_TEMPLATES.soap11Server },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white font-sans">
              Mock Rule Builder
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 uppercase font-semibold">
              Rule Configurator
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Build, test, and inject custom response schemas for REST (JSON) routes and SOAP 1.1/1.2 (XML) operations.
          </p>
        </div>

        {/* Protocol Selector Tabs */}
        <div className="inline-flex rounded bg-[#0f172a] border border-border p-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setActiveProtocolTab('REST');
              setIsCreatingNew(false);
            }}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors',
              activeProtocolTab === 'REST'
                ? 'bg-indigo-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <ProtocolBadge protocol="REST" />
            <span>REST Services</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveProtocolTab('SOAP');
              setIsCreatingNew(false);
            }}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors',
              activeProtocolTab === 'SOAP'
                ? 'bg-cyan-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <ProtocolBadge protocol="SOAP" />
            <span>SOAP Services</span>
          </button>
        </div>
      </div>

      {/* Target Service Picker Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-xs font-mono text-slate-500 uppercase tracking-wider shrink-0 mr-1">
          Target Service:
        </span>
        {services
          .filter((s) => s.protocol === activeProtocolTab)
          .map((svc) => (
            <button
              key={svc.id}
              onClick={() => {
                setSelectedServiceId(svc.id);
                setIsCreatingNew(false);
              }}
              className={cn(
                'px-3 py-1.5 rounded text-xs font-mono font-medium whitespace-nowrap transition-all border',
                selectedServiceId === svc.id
                  ? 'bg-slate-800 text-white border-indigo-500/60 shadow-sm'
                  : 'bg-[#0f172a] text-slate-400 border-border hover:bg-slate-800/60 hover:text-slate-200'
              )}
            >
              <div className="flex items-center gap-2">
                <span>{svc.name}</span>
                <span className="text-[10px] bg-slate-900 border border-slate-700 px-1 rounded text-slate-400">
                  {svc.rulesCount}
                </span>
              </div>
            </button>
          ))}
      </div>

      {/* Main Split Layout: Left Rule List, Right Configurator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Rule List (4 cols) */}
        <div className="lg:col-span-4 rounded bg-[#0f172a] border border-border shadow-panel overflow-hidden flex flex-col">
          <div className="p-3 bg-[#090d16] border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-mono font-semibold text-slate-200 uppercase">
                Active Mock Rules
              </span>
            </div>
            <Button
              variant="primary"
              size="xs"
              onClick={resetFormForNewRule}
              className="font-mono text-[11px]"
            >
              <Plus className="w-3 h-3 mr-1" />
              <span>New Rule</span>
            </Button>
          </div>

          <div className="divide-y divide-border/60 max-h-[600px] overflow-y-auto">
            {filteredRules.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-slate-500">
                No mock rules created for this service yet. Click &quot;New Rule&quot; to configure one.
              </div>
            ) : (
              filteredRules.map((rule) => {
                const isSelected = selectedRuleId === rule.id && !isCreatingNew;
                return (
                  <div
                    key={rule.id}
                    onClick={() => populateRule(rule)}
                    className={cn(
                      'p-3 cursor-pointer transition-colors group select-none flex items-start justify-between gap-3',
                      isSelected
                        ? 'bg-indigo-950/40 border-l-2 border-indigo-500'
                        : 'hover:bg-slate-800/40'
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        {rule.protocol === 'REST' ? (
                          <HttpMethodBadge method={rule.method || 'GET'} />
                        ) : (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 uppercase font-bold">
                            {rule.soapOperation || 'SOAP'}
                          </span>
                        )}
                        <StatusCodeBadge code={rule.statusCode} />
                        <span className="text-[10px] font-mono text-slate-500">{rule.delayMs}ms</span>
                      </div>

                      <h4 className="text-xs font-semibold text-slate-200 truncate group-hover:text-white">
                        {rule.name}
                      </h4>

                      <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                        {rule.protocol === 'REST' ? rule.pathPattern : rule.soapAction}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 pt-0.5" onClick={(e) => e.stopPropagation()}>
                      {/* Active toggle */}
                      <button
                        type="button"
                        onClick={() => toggleMockRule(rule.id)}
                        className={cn(
                          'p-1 rounded text-[10px] font-mono transition-colors',
                          rule.enabled ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-600 hover:text-slate-400'
                        )}
                        title={rule.enabled ? 'Rule enabled' : 'Rule disabled'}
                      >
                        <Check className={cn('w-3.5 h-3.5', !rule.enabled && 'opacity-30')} />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => deleteMockRule(rule.id)}
                        className="p-1 text-slate-600 hover:text-rose-400 transition-colors"
                        title="Delete rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Mock Configurator Form (8 cols) */}
        <div className="lg:col-span-8 rounded bg-[#0f172a] border border-border shadow-panel p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{isCreatingNew ? 'Create New Mock Rule' : 'Edit Mock Configuration'}</span>
                <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded uppercase">
                  {activeProtocolTab}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                {currentService?.name} &bull; {currentService?.baseUrl}
              </p>
            </div>

            <Button variant="primary" size="sm" onClick={handleSave} className="font-mono">
              <Save className="w-3.5 h-3.5 mr-1" />
              <span>{isCreatingNew ? 'Create Rule' : 'Save Changes'}</span>
            </Button>
          </div>

          {/* Rule Name & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                Rule Name:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Card Declined Insufficient Funds"
                className="w-full h-8 px-3 rounded bg-[#090d16] border border-border text-xs text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                Description / QA Scenario:
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Simulates Stripe 402 for testing credit card validation"
                className="w-full h-8 px-3 rounded bg-[#090d16] border border-border text-xs text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Protocol-Specific Matchers */}
          {activeProtocolTab === 'REST' ? (
            /* REST Configurator */
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#090d16] rounded border border-border">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  HTTP Method:
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as HttpMethod)}
                  className="w-full h-8 px-2.5 rounded bg-[#0f172a] border border-border text-xs font-mono text-slate-200 focus:border-indigo-500 focus:outline-none font-bold"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Endpoint Path Pattern (Wildcard * supported):
                </label>
                <input
                  type="text"
                  value={pathPattern}
                  onChange={(e) => setPathPattern(e.target.value)}
                  placeholder="/v1/charges"
                  className="w-full h-8 px-3 rounded bg-[#0f172a] border border-border text-xs text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            /* SOAP Configurator */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#090d16] rounded border border-border">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  SOAP Operation Name:
                </label>
                <input
                  type="text"
                  value={soapOperation}
                  onChange={(e) => setSoapOperation(e.target.value)}
                  placeholder="GetCreditScore"
                  className="w-full h-8 px-3 rounded bg-[#0f172a] border border-border text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Expected SOAPAction Header:
                </label>
                <input
                  type="text"
                  value={soapAction}
                  onChange={(e) => setSoapAction(e.target.value)}
                  placeholder="http://experian.com/webservices/GetCreditScore"
                  className="w-full h-8 px-3 rounded bg-[#0f172a] border border-border text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Response Status & Latency Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                Response Status Code:
              </label>
              <select
                value={statusCode}
                onChange={(e) => setStatusCode(Number(e.target.value))}
                className="w-full h-8 px-2.5 rounded bg-[#090d16] border border-border text-xs font-mono text-slate-200 focus:border-indigo-500 focus:outline-none"
              >
                <option value={200}>200 OK (Success)</option>
                <option value={201}>201 Created</option>
                <option value={202}>202 Accepted (Queued)</option>
                <option value={400}>400 Bad Request</option>
                <option value={401}>401 Unauthorized</option>
                <option value={402}>402 Payment Required</option>
                <option value={404}>404 Not Found</option>
                <option value={429}>429 Too Many Requests</option>
                <option value={500}>500 Internal Server Error (Outage)</option>
                <option value={502}>502 Bad Gateway</option>
                <option value={503}>503 Service Unavailable</option>
                <option value={504}>504 Gateway Timeout</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                Virtual Delay (Latency):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="5000"
                  step="50"
                  value={delayMs}
                  onChange={(e) => setDelayMs(Math.max(0, Number(e.target.value)))}
                  className="w-24 h-8 px-2 rounded bg-[#090d16] border border-border text-xs font-mono text-center text-slate-200 font-bold focus:border-indigo-500 focus:outline-none"
                />
                <span className="text-xs font-mono text-slate-400">ms simulated delay</span>
              </div>
            </div>
          </div>

          {/* Headers Customizer */}
          <div>
            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
              Custom Response Headers:
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {Object.entries(headersMap).map(([k, v]) => (
                <span
                  key={k}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#090d16] border border-border text-[11px] font-mono text-slate-300"
                >
                  <span className="text-indigo-400">{k}:</span>
                  <span className="truncate max-w-[150px]">{v}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveHeader(k)}
                    className="text-slate-500 hover:text-rose-400 ml-1"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Header Name (e.g. X-RateLimit-Reset)"
                value={headerKey}
                onChange={(e) => setHeaderKey(e.target.value)}
                className="h-7 px-2 flex-1 rounded bg-[#090d16] border border-border text-xs text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Header Value"
                value={headerVal}
                onChange={(e) => setHeaderVal(e.target.value)}
                className="h-7 px-2 flex-1 rounded bg-[#090d16] border border-border text-xs text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
              />
              <Button variant="secondary" size="xs" onClick={handleAddHeader} className="font-mono">
                Add Header
              </Button>
            </div>
          </div>

          {/* Code Editor for Mock Body */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Synthetic Mock Response Payload:
              </label>
              <span className="text-xs font-mono text-slate-500">
                {activeProtocolTab === 'REST' ? 'JSON Structure' : 'XML Envelope'}
              </span>
            </div>

            <CodeEditor
              value={responseBody}
              onChange={setResponseBody}
              language={activeProtocolTab === 'REST' ? 'json' : 'xml'}
              templates={activeProtocolTab === 'REST' ? restTemplates : soapTemplates}
              minHeight="280px"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MockRuleBuilderPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs font-mono text-slate-500">Loading Mock Configurator...</div>}>
      <MockRuleBuilderContent />
    </Suspense>
  );
}
