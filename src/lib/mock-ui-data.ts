import { Service, MockRule, TrafficLog } from './types';

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'svc-stripe-rest',
    name: 'Stripe Payment Gateway',
    category: 'Billing & Payments',
    description: 'Processes credit card charges, subscriptions, and refund webhooks.',
    protocol: 'REST',
    baseUrl: 'https://api.stripe.com/v1',
    mode: 'PROXY',
    latencyMs: 145,
    chaosEnabled: false,
    chaosRate: 15,
    chaosStatusCode: 500,
    healthStatus: 'HEALTHY',
    rulesCount: 5,
    uptime24h: 99.98,
    totalRequests24h: 18450,
    lastPing: '2s ago',
  },
  {
    id: 'svc-experian-soap',
    name: 'Experian Credit Bureau',
    category: 'Risk & Underwriting',
    description: 'SOAP 1.2 WebService providing FICO 8 score pulls & credit dispute flags.',
    protocol: 'SOAP',
    baseUrl: 'https://ws.experian.com/credit/v4/CreditScoreService',
    mode: 'MOCK',
    latencyMs: 820,
    chaosEnabled: true,
    chaosRate: 30,
    chaosStatusCode: 503,
    healthStatus: 'OUTAGE',
    rulesCount: 3,
    uptime24h: 84.12,
    totalRequests24h: 7320,
    lastPing: 'Just now',
  },
  {
    id: 'svc-sendgrid-rest',
    name: 'SendGrid Email Relay',
    category: 'Communications',
    description: 'Transactional email API for user onboarding & password recovery OTPs.',
    protocol: 'REST',
    baseUrl: 'https://api.sendgrid.com/v3/mail/send',
    mode: 'AUTO-FALLBACK' as any || 'FALLBACK',
    latencyMs: 310,
    chaosEnabled: false,
    chaosRate: 10,
    chaosStatusCode: 502,
    healthStatus: 'DEGRADED',
    rulesCount: 4,
    uptime24h: 96.45,
    totalRequests24h: 12900,
    lastPing: '12s ago',
  },
  {
    id: 'svc-fedex-soap',
    name: 'FedEx Shipping & Rating',
    category: 'Logistics',
    description: 'SOAP XML API calculating dimensional shipping rates and customs labels.',
    protocol: 'SOAP',
    baseUrl: 'https://ws.fedex.com:443/web-services/rate',
    mode: 'PROXY',
    latencyMs: 460,
    chaosEnabled: false,
    chaosRate: 5,
    chaosStatusCode: 504,
    healthStatus: 'HEALTHY',
    rulesCount: 3,
    uptime24h: 99.85,
    totalRequests24h: 9810,
    lastPing: '5s ago',
  },
  {
    id: 'svc-auth0-rest',
    name: 'Auth0 Identity Provider',
    category: 'Authentication',
    description: 'OIDC/OAuth 2.0 token issuance, SSO exchange, and MFA verification.',
    protocol: 'REST',
    baseUrl: 'https://auth.enterprise.io/oauth/token',
    mode: 'PROXY',
    latencyMs: 95,
    chaosEnabled: false,
    chaosRate: 0,
    chaosStatusCode: 500,
    healthStatus: 'HEALTHY',
    rulesCount: 4,
    uptime24h: 100.0,
    totalRequests24h: 42100,
    lastPing: '1s ago',
  },
  {
    id: 'svc-workday-soap',
    name: 'Workday HR Staffing Service',
    category: 'Enterprise ERP',
    description: 'Enterprise SOAP endpoint for payroll sync and worker organizational trees.',
    protocol: 'SOAP',
    baseUrl: 'https://wd5-impl-services1.workday.com/ccx/service/Staffing/v39.0',
    mode: 'MOCK',
    latencyMs: 1250,
    chaosEnabled: true,
    chaosRate: 50,
    chaosStatusCode: 500,
    healthStatus: 'OUTAGE',
    rulesCount: 2,
    uptime24h: 76.50,
    totalRequests24h: 3410,
    lastPing: '45s ago',
  },
  {
    id: 'svc-twilio-rest',
    name: 'Twilio Programmable SMS',
    category: 'Communications',
    description: 'Global cellular SMS dispatch and carrier delivery confirmation webhooks.',
    protocol: 'REST',
    baseUrl: 'https://api.twilio.com/2010-04-01/Accounts',
    mode: 'FALLBACK',
    latencyMs: 280,
    chaosEnabled: false,
    chaosRate: 20,
    chaosStatusCode: 429,
    healthStatus: 'DEGRADED',
    rulesCount: 3,
    uptime24h: 97.90,
    totalRequests24h: 15400,
    lastPing: '8s ago',
  },
  {
    id: 'svc-vertex-soap',
    name: 'Vertex O Series Tax Calc',
    category: 'Finance & Compliance',
    description: 'SOAP engine for municipal, county, state, and cross-border VAT assessment.',
    protocol: 'SOAP',
    baseUrl: 'https://connect.vertexsmb.com/vertex-ws/services/CalculateTax70',
    mode: 'PROXY',
    latencyMs: 510,
    chaosEnabled: false,
    chaosRate: 5,
    chaosStatusCode: 500,
    healthStatus: 'HEALTHY',
    rulesCount: 2,
    uptime24h: 99.40,
    totalRequests24h: 8120,
    lastPing: '14s ago',
  }
];

export const INITIAL_MOCK_RULES: MockRule[] = [
  // REST Rules
  {
    id: 'rule-stripe-charge-success',
    serviceId: 'svc-stripe-rest',
    name: 'Successful Charge (Token tok_visa)',
    protocol: 'REST',
    enabled: true,
    method: 'POST',
    pathPattern: '/v1/charges',
    statusCode: 200,
    delayMs: 180,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Stripe-Version': '2023-10-16',
      'X-Mock-Engine': 'QA-Virtualizer-v2.4'
    },
    responseContentType: 'application/json',
    responseBody: JSON.stringify({
      id: "ch_3Nxy82LkdIwHu7ix1r8V4mQs",
      object: "charge",
      amount: 4999,
      amount_captured: 4999,
      currency: "usd",
      paid: true,
      status: "succeeded",
      captured: true,
      payment_method_details: {
        type: "card",
        card: {
          brand: "visa",
          last4: "4242",
          exp_month: 12,
          exp_year: 2028,
          funding: "credit"
        }
      },
      receipt_url: "https://pay.stripe.com/receipts/mock_00192837482"
    }, null, 2),
    description: 'Returns instant synthetic 200 OK for standard test card charges.',
    updatedAt: '2026-10-24 14:22:10'
  },
  {
    id: 'rule-stripe-card-declined',
    serviceId: 'svc-stripe-rest',
    name: 'Card Declined - Insufficient Funds (402)',
    protocol: 'REST',
    enabled: true,
    method: 'POST',
    pathPattern: '/v1/charges/declined',
    statusCode: 402,
    delayMs: 250,
    headers: {
      'Content-Type': 'application/json',
      'X-Mock-Engine': 'QA-Virtualizer-v2.4'
    },
    responseContentType: 'application/json',
    responseBody: JSON.stringify({
      error: {
        code: "card_declined",
        doc_url: "https://stripe.com/docs/error-codes/card-declined",
        message: "Your card has insufficient funds for this transaction.",
        param: "card",
        type: "card_error",
        decline_code: "insufficient_funds"
      }
    }, null, 2),
    description: 'Simulates card decline scenario for testing UI error banners.',
    updatedAt: '2026-10-23 11:05:00'
  },
  {
    id: 'rule-stripe-rate-limit',
    serviceId: 'svc-stripe-rest',
    name: 'Rate Limit 429 Throttle Burst',
    protocol: 'REST',
    enabled: false,
    method: 'GET',
    pathPattern: '/v1/charges/*',
    statusCode: 429,
    delayMs: 50,
    headers: {
      'Content-Type': 'application/json',
      'Retry-After': '30',
      'X-RateLimit-Remaining': '0'
    },
    responseContentType: 'application/json',
    responseBody: JSON.stringify({
      error: {
        type: "rate_limit_error",
        message: "Too many requests hit the API too quickly. Back off and retry."
      }
    }, null, 2),
    description: 'Trigger 429 bursts to verify exponential backoff retries in frontend code.',
    updatedAt: '2026-10-22 09:14:32'
  },
  {
    id: 'rule-sendgrid-mail-send',
    serviceId: 'svc-sendgrid-rest',
    name: 'Accepted Mail Dispatch (202)',
    protocol: 'REST',
    enabled: true,
    method: 'POST',
    pathPattern: '/v3/mail/send',
    statusCode: 202,
    delayMs: 320,
    headers: {
      'Content-Type': 'application/json',
      'X-Message-Id': 'msg_01JBX998A729A10091'
    },
    responseContentType: 'application/json',
    responseBody: JSON.stringify({
      status: "queued",
      message_id: "msg_01JBX998A729A10091",
      recipients: 1,
      estimated_delivery_time: "2026-10-24T16:15:30Z"
    }, null, 2),
    description: 'Queued status response mock for SendGrid.',
    updatedAt: '2026-10-24 10:15:00'
  },
  {
    id: 'rule-auth0-token',
    serviceId: 'svc-auth0-rest',
    name: 'OIDC Access Token Grant (200)',
    protocol: 'REST',
    enabled: true,
    method: 'POST',
    pathPattern: '/oauth/token',
    statusCode: 200,
    delayMs: 90,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    },
    responseContentType: 'application/json',
    responseBody: JSON.stringify({
      access_token: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.mock_qa_token_jwt",
      id_token: "eyJhbGciOiJSUzI1NiJ9.mock_qa_id_token",
      token_type: "Bearer",
      expires_in: 86400,
      scope: "openid profile email read:virtual_services"
    }, null, 2),
    description: 'Provides instant synthetic JWT for developer authentication bypass.',
    updatedAt: '2026-10-24 08:30:00'
  },
  // SOAP Rules
  {
    id: 'rule-experian-credit-score',
    serviceId: 'svc-experian-soap',
    name: 'GetCreditScore - Tier 1 Excellent (785)',
    protocol: 'SOAP',
    enabled: true,
    soapAction: 'http://experian.com/webservices/GetCreditScore',
    soapOperation: 'GetCreditScore',
    statusCode: 200,
    delayMs: 450,
    headers: {
      'Content-Type': 'application/soap+xml; charset=utf-8',
      'X-SOAP-Virtual-Engine': 'Stitch-QA-Core'
    },
    responseContentType: 'application/soap+xml',
    responseBody: `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Header>
    <TransactionContext xmlns="http://experian.com/webservices/">
      <TraceId>EXP-TX-99812401</TraceId>
      <Timestamp>2026-10-24T16:15:00Z</Timestamp>
    </TransactionContext>
  </soap12:Header>
  <soap12:Body>
    <GetCreditScoreResponse xmlns="http://experian.com/webservices/">
      <CreditBureauResult>
        <Status>APPROVED</Status>
        <BureauName>EXPERIAN_US</BureauName>
        <ScoreModel>FICO_SCORE_8</ScoreModel>
        <ScoreValue>785</ScoreValue>
        <RiskBand>TIER_1_PRIME_PLUS</RiskBand>
        <DelinquenciesLast24Mo>0</DelinquenciesLast24Mo>
        <CreditInquiriesCount>1</CreditInquiriesCount>
        <SummaryText>Credit profile exhibits exemplary repayment history across all revolving lines.</SummaryText>
      </CreditBureauResult>
    </GetCreditScoreResponse>
  </soap12:Body>
</soap12:Envelope>`,
    description: 'High credit score XML payload for automated loan approval happy paths.',
    updatedAt: '2026-10-24 15:40:12'
  },
  {
    id: 'rule-experian-soap-fault',
    serviceId: 'svc-experian-soap',
    name: 'Experian SOAP Fault: SSN Validation Failed',
    protocol: 'SOAP',
    enabled: true,
    soapAction: 'http://experian.com/webservices/GetCreditScore',
    soapOperation: 'GetCreditScore',
    statusCode: 500,
    delayMs: 750,
    headers: {
      'Content-Type': 'application/soap+xml; charset=utf-8',
      'X-SOAP-Fault': 'Receiver'
    },
    responseContentType: 'application/soap+xml',
    responseBody: `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <soap12:Fault>
      <soap12:Code>
        <soap12:Value>soap12:Sender</soap12:Value>
        <soap12:Subcode>
          <soap12:Value xmlns:exp="http://experian.com/faults">exp:InvalidSSNChecksum</soap12:Value>
        </soap12:Subcode>
      </soap12:Code>
      <soap12:Reason>
        <soap12:Text xml:lang="en-US">The Social Security Number supplied failed national registry modulus verification.</soap12:Text>
      </soap12:Reason>
      <soap12:Detail>
        <exp:ErrorContext xmlns:exp="http://experian.com/faults">
          <exp:ErrorCode>ERR_SSN_FORMAT_MISMATCH</exp:ErrorCode>
          <exp:Timestamp>2026-10-24T16:15:00Z</exp:Timestamp>
          <exp:Remediation>Prompt the customer to re-enter valid 9-digit tax identifier.</exp:Remediation>
        </exp:ErrorContext>
      </soap12:Detail>
    </soap12:Fault>
  </soap12:Body>
</soap12:Envelope>`,
    description: 'Simulates SOAP 1.2 Sender Fault for negative QA test cases.',
    updatedAt: '2026-10-23 16:10:00'
  },
  {
    id: 'rule-fedex-rate-request',
    serviceId: 'svc-fedex-soap',
    name: 'RateReply - Overnight Priority (200)',
    protocol: 'SOAP',
    enabled: true,
    soapAction: 'http://fedex.com/ws/rate/v28/getRates',
    soapOperation: 'GetRates',
    statusCode: 200,
    delayMs: 380,
    headers: {
      'Content-Type': 'text/xml; charset=utf-8'
    },
    responseContentType: 'text/xml',
    responseBody: `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v28="http://fedex.com/ws/rate/v28">
  <soapenv:Header/>
  <soapenv:Body>
    <v28:RateReply>
      <v28:HighestSeverity>SUCCESS</v28:HighestSeverity>
      <v28:Notifications>
        <v28:Severity>NOTE</v28:Severity>
        <v28:Source>crs</v28:Source>
        <v28:Code>824</v28:Code>
        <v28:Message>Estimated delivery time guaranteed by 10:30 AM tomorrow.</v28:Message>
      </v28:Notifications>
      <v28:RateReplyDetails>
        <v28:ServiceType>PRIORITY_OVERNIGHT</v28:ServiceType>
        <v28:PackagingType>FEDEX_BOX</v28:PackagingType>
        <v28:RatedShipmentDetails>
          <v28:TotalNetCharge>
            <v28:Currency>USD</v28:Currency>
            <v28:Amount>48.75</v28:Amount>
          </v28:TotalNetCharge>
        </v28:RatedShipmentDetails>
      </v28:RateReplyDetails>
    </v28:RateReply>
  </soapenv:Body>
</soapenv:Envelope>`,
    description: 'SOAP 1.1 Envelope with FedEx Overnight Shipping Calculation.',
    updatedAt: '2026-10-24 11:20:00'
  },
  {
    id: 'rule-workday-staffing-fault',
    serviceId: 'svc-workday-soap',
    name: 'Workday SOAP Fault: Downstream Database Lock (500)',
    protocol: 'SOAP',
    enabled: true,
    soapAction: 'http://workday.com/ccx/service/Staffing/Get_Workers',
    soapOperation: 'Get_Workers',
    statusCode: 500,
    delayMs: 1100,
    headers: {
      'Content-Type': 'text/xml; charset=utf-8'
    },
    responseContentType: 'text/xml',
    responseBody: `<?xml version="1.0" encoding="utf-8"?>
<env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/">
  <env:Body>
    <env:Fault>
      <faultcode>env:Server</faultcode>
      <faultstring>Workday HCM tenant connection pool exhausted during batch reconciliation.</faultstring>
      <detail>
        <wd:Validation_Fault xmlns:wd="urn:com.workday/bsvc">
          <wd:ErrorCode>TENANT_DB_DEADLOCK_RETRY_LATER</wd:ErrorCode>
          <wd:IncidentId>WD-INC-9021881</wd:IncidentId>
        </wd:Validation_Fault>
      </detail>
    </env:Fault>
  </env:Body>
</env:Envelope>`,
    description: 'Workday ERP downtime response with realistic enterprise fault string.',
    updatedAt: '2026-10-24 13:50:00'
  }
];

export const INITIAL_TRAFFIC_LOGS: TrafficLog[] = [
  {
    id: 'log-101',
    timestamp: '2026-10-24T16:14:52.102Z',
    serviceId: 'svc-experian-soap',
    serviceName: 'Experian Credit Bureau',
    protocol: 'SOAP',
    mode: 'MOCK',
    endpoint: '/credit/v4/CreditScoreService',
    method: 'GetCreditScore',
    statusCode: 200,
    latencyMs: 452,
    chaosInjected: false,
    clientIp: '10.240.12.89',
    traceId: 'tr-exp-990184-b0',
    requestHeaders: {
      'Host': 'ws.experian.com',
      'Content-Type': 'application/soap+xml; charset=utf-8',
      'SOAPAction': 'http://experian.com/webservices/GetCreditScore',
      'User-Agent': 'UnderwritingEngine/4.1 (Java-21)'
    },
    requestBody: `<soap12:Envelope xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">\n  <soap12:Body>\n    <GetCreditScore xmlns="http://experian.com/webservices/">\n      <ApplicantSSN>***-**-4910</ApplicantSSN>\n      <PostalCode>94107</PostalCode>\n    </GetCreditScore>\n  </soap12:Body>\n</soap12:Envelope>`,
    responseHeaders: {
      'Content-Type': 'application/soap+xml; charset=utf-8',
      'X-Mock-Engine': 'QA-Virtualizer-Stitch',
      'X-Simulated-Latency': '450ms'
    },
    responseBody: `<soap12:Envelope xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">\n  <soap12:Body>\n    <GetCreditScoreResponse xmlns="http://experian.com/webservices/">\n      <ScoreValue>785</ScoreValue>\n      <RiskBand>TIER_1_PRIME_PLUS</RiskBand>\n      <Status>APPROVED</Status>\n    </GetCreditScoreResponse>\n  </soap12:Body>\n</soap12:Envelope>`
  },
  {
    id: 'log-102',
    timestamp: '2026-10-24T16:14:48.330Z',
    serviceId: 'svc-stripe-rest',
    serviceName: 'Stripe Payment Gateway',
    protocol: 'REST',
    mode: 'PROXY',
    endpoint: '/v1/charges',
    method: 'POST',
    statusCode: 200,
    latencyMs: 142,
    chaosInjected: false,
    clientIp: '192.168.1.105',
    traceId: 'tr-strp-01889a-f4',
    requestHeaders: {
      'Authorization': 'Bearer sk_test_***',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'CheckoutSvc/3.0'
    },
    requestBody: 'amount=4999&currency=usd&source=tok_visa&description=Pro+Tier+Annual+Subscription',
    responseHeaders: {
      'Content-Type': 'application/json',
      'Stripe-Version': '2023-10-16',
      'Access-Control-Allow-Origin': '*'
    },
    responseBody: JSON.stringify({
      id: "ch_3Nxy82LkdIwHu7ix1r8V4mQs",
      amount: 4999,
      currency: "usd",
      status: "succeeded",
      captured: true
    }, null, 2)
  },
  {
    id: 'log-103',
    timestamp: '2026-10-24T16:14:39.112Z',
    serviceId: 'svc-workday-soap',
    serviceName: 'Workday HR Staffing Service',
    protocol: 'SOAP',
    mode: 'MOCK',
    endpoint: '/ccx/service/Staffing/v39.0',
    method: 'Get_Workers',
    statusCode: 500,
    latencyMs: 1248,
    chaosInjected: true,
    clientIp: '10.240.18.204',
    traceId: 'tr-wd-chaos-fail-91',
    requestHeaders: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': 'http://workday.com/ccx/service/Staffing/Get_Workers'
    },
    requestBody: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">\n  <soapenv:Body>\n    <Get_Workers_Request>\n      <Department>ENGINEERING</Department>\n    </Get_Workers_Request>\n  </soapenv:Body>\n</soapenv:Envelope>`,
    responseHeaders: {
      'Content-Type': 'text/xml; charset=utf-8',
      'X-Chaos-Fault-Injected': 'true',
      'X-Chaos-Code': '500'
    },
    responseBody: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">\n  <soapenv:Body>\n    <soapenv:Fault>\n      <faultcode>env:Server</faultcode>\n      <faultstring>Workday HCM tenant connection pool exhausted during batch reconciliation.</faultstring>\n    </soapenv:Fault>\n  </soapenv:Body>\n</soapenv:Envelope>`
  },
  {
    id: 'log-104',
    timestamp: '2026-10-24T16:14:25.840Z',
    serviceId: 'svc-sendgrid-rest',
    serviceName: 'SendGrid Email Relay',
    protocol: 'REST',
    mode: 'FALLBACK',
    endpoint: '/v3/mail/send',
    method: 'POST',
    statusCode: 202,
    latencyMs: 298,
    chaosInjected: false,
    clientIp: '172.16.4.12',
    traceId: 'tr-sg-fb-8827',
    requestHeaders: {
      'Authorization': 'Bearer SG.mock_token_77812',
      'Content-Type': 'application/json'
    },
    requestBody: JSON.stringify({
      personalizations: [{ to: [{ email: "qa-lead@enterprise.com" }] }],
      from: { email: "no-reply@app.com" },
      subject: "Your OTP Verification Code is 849201"
    }, null, 2),
    responseHeaders: {
      'Content-Type': 'application/json',
      'X-Fallback-Triggered': 'Upstream-504-Timeout'
    },
    responseBody: JSON.stringify({
      status: "queued",
      message_id: "msg_fallback_01JBX998A",
      note: "Served from virtual fallback pool due to upstream degraded state."
    }, null, 2)
  },
  {
    id: 'log-105',
    timestamp: '2026-10-24T16:14:10.050Z',
    serviceId: 'svc-auth0-rest',
    serviceName: 'Auth0 Identity Provider',
    protocol: 'REST',
    mode: 'PROXY',
    endpoint: '/oauth/token',
    method: 'POST',
    statusCode: 200,
    latencyMs: 88,
    chaosInjected: false,
    clientIp: '192.168.1.14',
    traceId: 'tr-auth-202941-c7',
    requestHeaders: {
      'Content-Type': 'application/json'
    },
    requestBody: JSON.stringify({
      grant_type: "client_credentials",
      client_id: "client_qa_web_client_99",
      audience: "https://api.enterprise.internal"
    }, null, 2),
    responseHeaders: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    },
    responseBody: JSON.stringify({
      access_token: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.live_upstream_token",
      token_type: "Bearer",
      expires_in: 86400
    }, null, 2)
  },
  {
    id: 'log-106',
    timestamp: '2026-10-24T16:13:55.720Z',
    serviceId: 'svc-fedex-soap',
    serviceName: 'FedEx Shipping & Rating',
    protocol: 'SOAP',
    mode: 'PROXY',
    endpoint: '/web-services/rate',
    method: 'GetRates',
    statusCode: 200,
    latencyMs: 440,
    chaosInjected: false,
    clientIp: '10.240.8.11',
    traceId: 'tr-fdx-rt-1092',
    requestHeaders: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': 'http://fedex.com/ws/rate/v28/getRates'
    },
    requestBody: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">\n  <soapenv:Body>\n    <GetRates>\n      <OriginZip>90210</OriginZip>\n      <DestinationZip>10001</DestinationZip>\n      <WeightLbs>5.2</WeightLbs>\n    </GetRates>\n  </soapenv:Body>\n</soapenv:Envelope>`,
    responseHeaders: {
      'Content-Type': 'text/xml; charset=utf-8',
      'Server': 'FedEx-WSE/8.1'
    },
    responseBody: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">\n  <soapenv:Body>\n    <RateReply>\n      <ServiceType>PRIORITY_OVERNIGHT</ServiceType>\n      <TotalNetCharge>48.75 USD</TotalNetCharge>\n    </RateReply>\n  </soapenv:Body>\n</soapenv:Envelope>`
  },
  {
    id: 'log-107',
    timestamp: '2026-10-24T16:13:40.210Z',
    serviceId: 'svc-twilio-rest',
    serviceName: 'Twilio Programmable SMS',
    protocol: 'REST',
    mode: 'FALLBACK',
    endpoint: '/2010-04-01/Accounts/ACmock/Messages',
    method: 'POST',
    statusCode: 201,
    latencyMs: 275,
    chaosInjected: false,
    clientIp: '192.168.1.180',
    traceId: 'tr-tw-sms-7712',
    requestHeaders: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic QUNtb2NrOlNTYWZl'
    },
    requestBody: 'To=%2B15559876543&From=%2B15551234567&Body=Your+verification+code+is+552199',
    responseHeaders: {
      'Content-Type': 'application/json'
    },
    responseBody: JSON.stringify({
      sid: "SM88219901823901bca9",
      status: "sent",
      direction: "outbound-api",
      price: "-0.0079",
      price_unit: "USD"
    }, null, 2)
  },
  {
    id: 'log-108',
    timestamp: '2026-10-24T16:13:22.610Z',
    serviceId: 'svc-vertex-soap',
    serviceName: 'Vertex O Series Tax Calc',
    protocol: 'SOAP',
    mode: 'PROXY',
    endpoint: '/vertex-ws/services/CalculateTax70',
    method: 'CalculateTax',
    statusCode: 200,
    latencyMs: 508,
    chaosInjected: false,
    clientIp: '10.240.12.89',
    traceId: 'tr-vtx-calc-4410',
    requestHeaders: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': 'http://vertex.com/CalculateTax70'
    },
    requestBody: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">\n  <soapenv:Body>\n    <CalculateTaxRequest subtotal="120.00" jurisdiction="CA" />\n  </soapenv:Body>\n</soapenv:Envelope>`,
    responseHeaders: {
      'Content-Type': 'text/xml; charset=utf-8'
    },
    responseBody: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">\n  <soapenv:Body>\n    <CalculateTaxResponse totalTax="10.80" rate="0.09" jurisdiction="CA-LOS_ANGELES" />\n  </soapenv:Body>\n</soapenv:Envelope>`
  }
];

export const SOAP_FAULTS_TEMPLATES = {
  soap11Client: `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body>
    <soapenv:Fault>
      <faultcode>soapenv:Client</faultcode>
      <faultstring>Invalid request payload: Missing mandatory element &lt;CustomerIdentifier&gt;</faultstring>
      <detail>
        <error:ValidationError xmlns:error="http://enterprise.org/faults">
          <error:Field>CustomerIdentifier</error:Field>
          <error:Reason>REQUIRED_FIELD_EMPTY</error:Reason>
        </error:ValidationError>
      </detail>
    </soapenv:Fault>
  </soapenv:Body>
</soapenv:Envelope>`,

  soap11Server: `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body>
    <soapenv:Fault>
      <faultcode>soapenv:Server</faultcode>
      <faultstring>Backend ERP Service Timeout: Downstream mainframe cluster did not respond within 5000ms</faultstring>
      <detail>
        <svc:Exception xmlns:svc="http://enterprise.org/exceptions">
          <svc:IncidentRef>INC-2026-90928</svc:IncidentRef>
          <svc:HTTPStatus>504 Gateway Timeout</svc:HTTPStatus>
        </svc:Exception>
      </detail>
    </soapenv:Fault>
  </soapenv:Body>
</soapenv:Envelope>`,

  soap12Sender: `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <soap12:Fault>
      <soap12:Code>
        <soap12:Value>soap12:Sender</soap12:Value>
      </soap12:Code>
      <soap12:Reason>
        <soap12:Text xml:lang="en">Authorization token provided has expired or has been revoked.</soap12:Text>
      </soap12:Reason>
    </soap12:Fault>
  </soap12:Body>
</soap12:Envelope>`,

  soap12Receiver: `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <soap12:Fault>
      <soap12:Code>
        <soap12:Value>soap12:Receiver</soap12:Value>
      </soap12:Code>
      <soap12:Reason>
        <soap12:Text xml:lang="en">Simulated Outage: Third-party upstream SOAP endpoint is currently undergoing scheduled maintenance.</soap12:Text>
      </soap12:Reason>
    </soap12:Fault>
  </soap12:Body>
</soap12:Envelope>`
};

export const REST_PRESET_TEMPLATES = {
  success200: JSON.stringify({
    status: "success",
    timestamp: new Date().toISOString(),
    data: {
      id: "res_99210",
      processed: true,
      message: "Virtual mock simulated response completed successfully."
    }
  }, null, 2),

  badRequest400: JSON.stringify({
    error: {
      code: "invalid_request_error",
      message: "Missing mandatory query parameter 'account_id'.",
      status: 400
    }
  }, null, 2),

  unauthorized401: JSON.stringify({
    error: {
      code: "unauthorized",
      message: "API key is missing or invalid. Check your Bearer token.",
      status: 401
    }
  }, null, 2),

  outage500: JSON.stringify({
    error: {
      code: "internal_server_error",
      message: "Third-party vendor database cluster unreachable. Active Outage Switch tripped.",
      incident_id: "OUTAGE-SW-88129",
      status: 500
    }
  }, null, 2),

  rateLimit429: JSON.stringify({
    error: {
      code: "rate_limit_exceeded",
      message: "You have exceeded your 100 req/sec quota. Throttling applied.",
      retry_after_seconds: 60,
      status: 429
    }
  }, null, 2)
};
