# QA API Virtualization & Outage Switch Dashboard

A developer and QA engineering console built with **Next.js 14+ (App Router)**, **Tailwind CSS**, and **React Client State** matching the design system retrieved from **Stitch MCP** (`QA Telemetry & Outage Routing Console`).

Designed for QA Testers and Developers to monitor, mock, inject chaos, and inspect third-party REST (JSON) and SOAP (XML) API dependencies without needing external backend dependencies.

---

## 🚀 Key Features

### 1. Master QA Control Panel (`/`)
- **Top Summary Cards**: Integrated Services count, Active Live Proxies (🟢), Active Outage Mocks (🔴), and Total Intercepted Requests (24h).
- **Service Switcher Board (Dual View)**:
  - Toggle between **Card Grid View** and high-density **Table View**.
  - **3-State Mode Toggle Bar**:
    - 🟢 `Proxy Mode` — Direct pass-through to real third-party API.
    - 🔴 `Mock Mode` — Synthetic outage response and fault interception.
    - 🟡 `Auto-Fallback` — Live API pass-through with automatic fallback to mock on degraded upstream states.
  - **Latency Slider** (0ms – 5000ms) with nominal, degraded, and lag tiering.
  - **Chaos Error Injector Modal** with failure probability (5%–100%) and selectable status codes (`500 Internal Error`, `502 Bad Gateway`, `503 Unavailable`, `504 Timeout`, `429 Rate Limit`).
  - **Quick Ping Trigger**: Dispatches test call and streams telemetry immediately into the Live Traffic Inspector.
  - **Master Outage Switch**: One-click "Emergency Mock All" and "Reset All to Proxy".

### 2. Mock Rule Builder (`/services`)
- **Dual Protocol Support**: Seamlessly switch between `REST Services` and `SOAP Services`.
- **REST Mock Configurator**:
  - HTTP Verb selection (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`).
  - Route pattern matching (supports wildcards, e.g. `/v1/charges/*`).
  - Status Code selector & custom header key-value editor.
  - JSON response editor with line numbers, syntax validation, format/beautify, copy-to-clipboard, and quick preset templates (`200 OK`, `400 Bad Request`, `401 Unauthorized`, `429 Rate Limit`, `500 Outage`).
- **SOAP Mock Configurator**:
  - SOAP Operation Name & `SOAPAction` header pattern matching.
  - XML envelope editor with preset SOAP Fault templates (SOAP 1.1 Client/Server fault, SOAP 1.2 Sender/Receiver fault).
- Rule lifecycle: Add, Edit, Toggle On/Off, and Delete rules with persistent synchronization.

### 3. Live Traffic Inspector (`/logs`)
- **Real-Time Interceptor Stream**:
  - Columns: Timestamp, Protocol (`REST` vs `SOAP`), HTTP Verb / SOAP Operation, Endpoint, Service, Mode (`PROXIED`, `MOCKED`, `FALLBACK`), Status Code, and Injected Latency.
  - Built-in live stream simulator with pause/resume toggle, query search, protocol filters, status code filters, and CSV export.
- **Request / Response Detail Drawer**:
  - Slide-over panel displaying complete Request & Response headers, bodies, trace ID, and client IP.
  - **Replay Request**: Dispatches the request through the virtual engine and appends a fresh telemetry entry.
  - **Copy cURL**: Generates a valid executable cURL command for terminal or Postman testing.

### 4. Interactive API Sandbox (`/sandbox`)
- Mini Postman / SoapUI developer tool interface.
- REST & SOAP request constructor with customizable headers, body payloads, and endpoint selection.
- Send request directly against virtualizer engine with visual loading state.
- Response inspector displaying Status, Injected Latency, Payload Size, Route Mode, Headers, and formatted syntax-highlighted Body.
- Left-hand **Execution History** drawer for 1-click test reproduction.

---

## 🎨 Stitch Design System Specifications
- **Base Canvas Void**: `#090d16`
- **Panel Surface**: `#0f172a` (Slate-900)
- **Sub-panel / Cell Hover**: `#1e293b` (Slate-800)
- **Structural Boundaries**: `#1e293b` default border, transitioning to `#334155` on headers
- **Functional Accents**:
  - Primary Control: `#6366f1` (Indigo-500)
  - Secondary SOAP Telemetry: `#06b6d4` (Cyan-500)
  - Proxy Mode (Healthy): `#10b981` (Emerald-500)
  - Mock Mode (Outage Fault): `#f43f5e` (Rose-500)
  - Auto-Fallback / Latency: `#f59e0b` (Amber-500)
- **Typography**: Geist / Inter for structural UI, JetBrains Mono for verbs, status codes, route patterns, and latency metrics.

---

## 🛠️ Getting Started

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

### Production Build
```bash
npm run build
npm start
```
