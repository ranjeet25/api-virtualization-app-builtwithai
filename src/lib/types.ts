export type ServiceMode = 'PROXY' | 'MOCK' | 'FALLBACK';
export type Protocol = 'REST' | 'SOAP';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  protocol: Protocol;
  baseUrl: string;
  mode: ServiceMode;
  latencyMs: number;
  chaosEnabled: boolean;
  chaosRate: number; // Percentage 0-100
  chaosStatusCode: number; // e.g., 500, 502, 503, 504
  healthStatus: 'HEALTHY' | 'DEGRADED' | 'OUTAGE';
  rulesCount: number;
  uptime24h: number; // percentage
  totalRequests24h: number;
  lastPing: string;
}

export interface MockRule {
  id: string;
  serviceId: string;
  name: string;
  protocol: Protocol;
  enabled: boolean;
  // REST specific
  method?: HttpMethod;
  pathPattern?: string;
  // SOAP specific
  soapAction?: string;
  soapOperation?: string;
  // Response details
  statusCode: number;
  delayMs: number;
  headers: Record<string, string>;
  responseContentType: string;
  responseBody: string;
  description: string;
  updatedAt: string;
}

export interface TrafficLog {
  id: string;
  timestamp: string;
  serviceId: string;
  serviceName: string;
  protocol: Protocol;
  mode: ServiceMode;
  endpoint: string;
  method: string; // HTTP verb or SOAP operation
  statusCode: number;
  latencyMs: number;
  chaosInjected: boolean;
  requestHeaders: Record<string, string>;
  requestBody: string;
  responseHeaders: Record<string, string>;
  responseBody: string;
  clientIp: string;
  traceId: string;
}

export interface SandboxHistoryItem {
  id: string;
  timestamp: string;
  protocol: Protocol;
  serviceName: string;
  method: string;
  endpoint: string;
  status: number;
  latencyMs: number;
  mode: ServiceMode;
}
