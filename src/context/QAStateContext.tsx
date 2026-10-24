'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Service, MockRule, TrafficLog, SandboxHistoryItem, ServiceMode, Protocol } from '@/lib/types';
import { INITIAL_SERVICES, INITIAL_MOCK_RULES, INITIAL_TRAFFIC_LOGS } from '@/lib/mock-ui-data';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  timestamp: number;
}

interface QAContextType {
  services: Service[];
  mockRules: MockRule[];
  trafficLogs: TrafficLog[];
  sandboxHistory: SandboxHistoryItem[];
  selectedLog: TrafficLog | null;
  isLogDrawerOpen: boolean;
  toasts: ToastNotification[];
  isStreaming: boolean;
  
  // Actions
  updateServiceMode: (serviceId: string, mode: ServiceMode) => void;
  updateServiceLatency: (serviceId: string, latencyMs: number) => void;
  toggleServiceChaos: (serviceId: string, enabled: boolean, rate?: number, statusCode?: number) => void;
  emergencyMockAll: () => void;
  resetAllToProxy: () => void;
  
  // Rules actions
  addMockRule: (rule: Omit<MockRule, 'id' | 'updatedAt'>) => void;
  updateMockRule: (rule: MockRule) => void;
  deleteMockRule: (ruleId: string) => void;
  toggleMockRule: (ruleId: string) => void;
  
  // Logs actions
  selectLog: (log: TrafficLog | null) => void;
  setIsLogDrawerOpen: (open: boolean) => void;
  clearTrafficLogs: () => void;
  addTrafficLog: (log: TrafficLog) => void;
  replayLog: (log: TrafficLog) => Promise<void>;
  setIsStreaming: (streaming: boolean) => void;
  
  // Sandbox execution
  executeRequest: (params: {
    serviceId: string;
    protocol: Protocol;
    method: string;
    endpoint: string;
    headers: Record<string, string>;
    body: string;
  }) => Promise<{
    status: number;
    latencyMs: number;
    mode: ServiceMode;
    headers: Record<string, string>;
    body: string;
    chaosInjected: boolean;
  }>;

  // Utility
  addToast: (toast: Omit<ToastNotification, 'id' | 'timestamp'>) => void;
  dismissToast: (id: string) => void;
  resetAllToDefaults: () => void;
}

const QAContext = createContext<QAContextType | null>(null);

const STORAGE_KEYS = {
  SERVICES: 'qa_virt_services_v1',
  RULES: 'qa_virt_rules_v1',
  LOGS: 'qa_virt_logs_v1',
  HISTORY: 'qa_virt_history_v1',
};

export const QAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [mockRules, setMockRules] = useState<MockRule[]>(INITIAL_MOCK_RULES);
  const [trafficLogs, setTrafficLogs] = useState<TrafficLog[]>(INITIAL_TRAFFIC_LOGS);
  const [sandboxHistory, setSandboxHistory] = useState<SandboxHistoryItem[]>([]);
  const [selectedLog, setSelectedLog] = useState<TrafficLog | null>(null);
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const storedServices = localStorage.getItem(STORAGE_KEYS.SERVICES);
      if (storedServices) setServices(JSON.parse(storedServices));

      const storedRules = localStorage.getItem(STORAGE_KEYS.RULES);
      if (storedRules) setMockRules(JSON.parse(storedRules));

      const storedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (storedLogs) setTrafficLogs(JSON.parse(storedLogs));

      const storedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (storedHistory) setSandboxHistory(JSON.parse(storedHistory));
    } catch {
      // LocalStorage error or SSR, fallback to defaults
    }
  }, []);

  // Save changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    } catch {}
  }, [services]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(mockRules));
    } catch {}
  }, [mockRules]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(trafficLogs));
    } catch {}
  }, [trafficLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(sandboxHistory));
    } catch {}
  }, [sandboxHistory]);

  const addToast = useCallback((toast: Omit<ToastNotification, 'id' | 'timestamp'>) => {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id, timestamp: Date.now() }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateServiceMode = useCallback((serviceId: string, mode: ServiceMode) => {
    setServices((prev) =>
      prev.map((svc) => {
        if (svc.id === serviceId) {
          const healthStatus = mode === 'MOCK' ? 'OUTAGE' : mode === 'FALLBACK' ? 'DEGRADED' : 'HEALTHY';
          return { ...svc, mode, healthStatus, lastPing: 'Just now' };
        }
        return svc;
      })
    );
    const svc = services.find((s) => s.id === serviceId);
    addToast({
      type: mode === 'MOCK' ? 'warning' : mode === 'FALLBACK' ? 'info' : 'success',
      title: `${svc?.name || 'Service'} Mode Shifted`,
      description: `Active state set to ${mode} mode.`
    });
  }, [services, addToast]);

  const updateServiceLatency = useCallback((serviceId: string, latencyMs: number) => {
    setServices((prev) =>
      prev.map((svc) => (svc.id === serviceId ? { ...svc, latencyMs } : svc))
    );
  }, []);

  const toggleServiceChaos = useCallback((serviceId: string, enabled: boolean, rate?: number, statusCode?: number) => {
    setServices((prev) =>
      prev.map((svc) => {
        if (svc.id === serviceId) {
          return {
            ...svc,
            chaosEnabled: enabled,
            chaosRate: rate !== undefined ? rate : svc.chaosRate,
            chaosStatusCode: statusCode !== undefined ? statusCode : svc.chaosStatusCode,
          };
        }
        return svc;
      })
    );
    addToast({
      type: enabled ? 'warning' : 'info',
      title: enabled ? 'Chaos Injection Activated' : 'Chaos Injection Deactivated',
      description: enabled ? `Injecting ${statusCode || 500} synthetic faults at ${rate ?? 25}% rate.` : 'Normal traffic pattern restored.'
    });
  }, [addToast]);

  const emergencyMockAll = useCallback(() => {
    setServices((prev) =>
      prev.map((svc) => ({
        ...svc,
        mode: 'MOCK',
        healthStatus: 'OUTAGE',
        lastPing: 'Emergency Shift'
      }))
    );
    addToast({
      type: 'error',
      title: '🚨 Master Outage Switch Triggered',
      description: 'All 8 integrated services switched to simulated MOCK downtime mode.'
    });
  }, [addToast]);

  const resetAllToProxy = useCallback(() => {
    setServices((prev) =>
      prev.map((svc) => ({
        ...svc,
        mode: 'PROXY',
        healthStatus: 'HEALTHY',
        chaosEnabled: false,
        latencyMs: svc.protocol === 'REST' ? 120 : 450,
        lastPing: 'Reset'
      }))
    );
    addToast({
      type: 'success',
      title: 'Circuit Restored to Live Proxy',
      description: 'All services redirected to live upstream providers; chaos disabled.'
    });
  }, [addToast]);

  const addMockRule = useCallback((rule: Omit<MockRule, 'id' | 'updatedAt'>) => {
    const newRule: MockRule = {
      ...rule,
      id: 'rule-' + Math.random().toString(36).substring(2, 9),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setMockRules((prev) => [newRule, ...prev]);
    setServices((prev) =>
      prev.map((svc) => svc.id === rule.serviceId ? { ...svc, rulesCount: svc.rulesCount + 1 } : svc)
    );
    addToast({
      type: 'success',
      title: 'Mock Rule Created',
      description: `Rule "${rule.name}" is now active in virtualization engine.`
    });
  }, [addToast]);

  const updateMockRule = useCallback((rule: MockRule) => {
    setMockRules((prev) =>
      prev.map((r) => (r.id === rule.id ? { ...rule, updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) } : r))
    );
    addToast({
      type: 'info',
      title: 'Rule Synchronized',
      description: `Updated pattern matching for "${rule.name}".`
    });
  }, [addToast]);

  const deleteMockRule = useCallback((ruleId: string) => {
    const target = mockRules.find((r) => r.id === ruleId);
    setMockRules((prev) => prev.filter((r) => r.id !== ruleId));
    if (target) {
      setServices((prev) =>
        prev.map((svc) => svc.id === target.serviceId ? { ...svc, rulesCount: Math.max(0, svc.rulesCount - 1) } : svc)
      );
    }
    addToast({
      type: 'warning',
      title: 'Rule Deleted',
      description: `Mock rule was removed from cache.`
    });
  }, [mockRules, addToast]);

  const toggleMockRule = useCallback((ruleId: string) => {
    setMockRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
  }, []);

  const selectLog = useCallback((log: TrafficLog | null) => {
    setSelectedLog(log);
    setIsLogDrawerOpen(!!log);
  }, []);

  const clearTrafficLogs = useCallback(() => {
    setTrafficLogs([]);
    setSelectedLog(null);
    setIsLogDrawerOpen(false);
    addToast({
      type: 'info',
      title: 'Traffic Stream Flushed',
      description: 'Log ring buffer cleared.'
    });
  }, [addToast]);

  const addTrafficLog = useCallback((log: TrafficLog) => {
    setTrafficLogs((prev) => [log, ...prev.slice(0, 99)]);
  }, []);

  // Execution engine simulating real proxy / mock / fallback behavior
  const executeRequest = useCallback(async (params: {
    serviceId: string;
    protocol: Protocol;
    method: string;
    endpoint: string;
    headers: Record<string, string>;
    body: string;
  }) => {
    const svc = services.find((s) => s.id === params.serviceId) || services[0];
    const rules = mockRules.filter((r) => r.serviceId === svc.id && r.enabled);
    
    // Check chaos injection first
    const isChaosTriggered = svc.chaosEnabled && (Math.random() * 100 < svc.chaosRate);
    
    // Simulate delay
    const delay = svc.latencyMs + Math.floor(Math.random() * 40);
    await new Promise((resolve) => setTimeout(resolve, Math.min(delay, 2500)));

    let status = 200;
    let responseBody = '';
    let responseHeaders: Record<string, string> = {
      'Content-Type': params.protocol === 'REST' ? 'application/json' : 'text/xml; charset=utf-8',
      'X-Virtual-Latency': `${delay}ms`,
      'X-Virtual-Engine': 'Stitch-QA-Virtualizer-2.0'
    };
    let mode: ServiceMode = svc.mode;

    if (isChaosTriggered) {
      status = svc.chaosStatusCode || 500;
      mode = 'MOCK';
      responseHeaders['X-Chaos-Injected'] = 'true';
      if (params.protocol === 'REST') {
        responseBody = JSON.stringify({
          error: {
            code: "synthetic_chaos_fault",
            status,
            message: `Simulated outage chaos injected by QA Virtualizer. Target service returned ${status}.`,
            timestamp: new Date().toISOString()
          }
        }, null, 2);
      } else {
        responseBody = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <soap:Fault>
      <faultcode>soap:Server</faultcode>
      <faultstring>Simulated Chaos Outage: Service ${svc.name} unavailable (Code: ${status})</faultstring>
    </soap:Fault>
  </soap:Body>
</soap:Envelope>`;
      }
    } else if (svc.mode === 'MOCK' || svc.mode === 'FALLBACK') {
      // Find matching mock rule
      const matchedRule = rules.find((r) => {
        if (params.protocol === 'REST') {
          return !r.method || r.method === params.method || r.pathPattern === params.endpoint;
        } else {
          return !r.soapOperation || r.soapOperation === params.method;
        }
      }) || rules[0];

      if (matchedRule) {
        status = matchedRule.statusCode;
        responseBody = matchedRule.responseBody;
        responseHeaders = { ...responseHeaders, ...matchedRule.headers };
      } else {
        // Fallback default
        status = 200;
        responseBody = params.protocol === 'REST' 
          ? JSON.stringify({ status: "mock_ok", message: `Synthetic mock response for ${params.endpoint}` }, null, 2)
          : `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><Response><Status>OK</Status></Response></soap:Body></soap:Envelope>`;
      }
    } else {
      // PROXY Mode
      status = 200;
      responseHeaders['X-Live-Proxy-Relay'] = svc.baseUrl;
      if (params.protocol === 'REST') {
        responseBody = JSON.stringify({
          status: "proxied_live",
          target: svc.baseUrl + params.endpoint,
          verified: true,
          timestamp: new Date().toISOString(),
          upstream_latency_ms: delay
        }, null, 2);
      } else {
        responseBody = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header>
    <UpstreamRelay xmlns="http://gateway.corp/">${svc.baseUrl}</UpstreamRelay>
  </soap:Header>
  <soap:Body>
    <ProxiedLiveResult>
      <Service>${svc.name}</Service>
      <Operation>${params.method}</Operation>
      <Timestamp>${new Date().toISOString()}</Timestamp>
    </ProxiedLiveResult>
  </soap:Body>
</soap:Envelope>`;
      }
    }

    // Record into live traffic logs
    const newLog: TrafficLog = {
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      serviceId: svc.id,
      serviceName: svc.name,
      protocol: params.protocol,
      mode,
      endpoint: params.endpoint,
      method: params.method,
      statusCode: status,
      latencyMs: delay,
      chaosInjected: isChaosTriggered,
      clientIp: '127.0.0.1 (Sandbox Client)',
      traceId: 'tr-' + Math.random().toString(36).substring(2, 8) + '-' + Math.random().toString(36).substring(2, 4),
      requestHeaders: params.headers,
      requestBody: params.body,
      responseHeaders,
      responseBody
    };

    addTrafficLog(newLog);

    // Record into history
    setSandboxHistory((prev) => [
      {
        id: newLog.id,
        timestamp: new Date().toLocaleTimeString(),
        protocol: params.protocol,
        serviceName: svc.name,
        method: params.method,
        endpoint: params.endpoint,
        status,
        latencyMs: delay,
        mode
      },
      ...prev.slice(0, 19)
    ]);

    return {
      status,
      latencyMs: delay,
      mode,
      headers: responseHeaders,
      body: responseBody,
      chaosInjected: isChaosTriggered
    };
  }, [services, mockRules, addTrafficLog]);

  const replayLog = useCallback(async (log: TrafficLog) => {
    addToast({
      type: 'info',
      title: 'Replaying Request...',
      description: `${log.method} ${log.endpoint} through virtualizer`
    });

    await executeRequest({
      serviceId: log.serviceId,
      protocol: log.protocol,
      method: log.method,
      endpoint: log.endpoint,
      headers: log.requestHeaders,
      body: log.requestBody
    });

    addToast({
      type: 'success',
      title: 'Replay Dispatched & Intercepted',
      description: 'Streamed to live traffic inspector.'
    });
  }, [executeRequest, addToast]);

  const resetAllToDefaults = useCallback(() => {
    setServices(INITIAL_SERVICES);
    setMockRules(INITIAL_MOCK_RULES);
    setTrafficLogs(INITIAL_TRAFFIC_LOGS);
    setSandboxHistory([]);
    setSelectedLog(null);
    setIsLogDrawerOpen(false);
    localStorage.removeItem(STORAGE_KEYS.SERVICES);
    localStorage.removeItem(STORAGE_KEYS.RULES);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    addToast({
      type: 'info',
      title: 'Console Reset to Clean Fixtures',
      description: 'Loaded default services, rules, and realistic test stream logs.'
    });
  }, [addToast]);

  return (
    <QAContext.Provider
      value={{
        services,
        mockRules,
        trafficLogs,
        sandboxHistory,
        selectedLog,
        isLogDrawerOpen,
        toasts,
        isStreaming,
        updateServiceMode,
        updateServiceLatency,
        toggleServiceChaos,
        emergencyMockAll,
        resetAllToProxy,
        addMockRule,
        updateMockRule,
        deleteMockRule,
        toggleMockRule,
        selectLog,
        setIsLogDrawerOpen,
        clearTrafficLogs,
        addTrafficLog,
        replayLog,
        setIsStreaming,
        executeRequest,
        addToast,
        dismissToast,
        resetAllToDefaults
      }}
    >
      {children}
    </QAContext.Provider>
  );
};

export const useQAState = () => {
  const context = useContext(QAContext);
  if (!context) {
    throw new Error('useQAState must be used within a QAProvider');
  }
  return context;
};
