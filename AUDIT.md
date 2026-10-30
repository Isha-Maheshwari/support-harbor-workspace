# SupportDesk Pro - Codebase Investigation & Audit Report

**Date:** October 30, 2026  
**Auditor:** Isha-Maheshwari  
**Scope:** Architecture mapping, dependency audit, TanStack Query lifecycle, broken/incomplete interactions, dead code, and candidate cleanups.

---

## 1. Executive Summary

SupportDesk Pro is an enterprise customer support workspace built on **React 19**, **TanStack Start / TanStack Router**, **TanStack Query (React Query v5)**, and **Tailwind CSS v4**. 

Currently, the application runs entirely against an in-memory mock service located in `src/lib/mock-api.ts` with seeded data (tickets, customers, agents, articles, SLAs, activities) and simulated network conditions (latency, failure rate, forced outages).

---

## 2. Architecture Map

## 1. Routes (`src/routes/`)

The routes directory contains the application's page-level components, organized into different functional modules.

### 1.1 App Shell Layout

- `__root.tsx` - Root layout of the application.
  - `AppShell` (`src/components/app/app-shell.tsx`)
    - Navigation Sidebar and Mobile Header
    - `ServiceControls`
      - Latency
      - Failure Rate
      - Force Outage
  - Sonner Toaster
  - Error Boundaries

### 1.2 Dashboard Module

| File | Description |
|---|---|
| `dashboard.index.tsx` | Volume chart, urgent tickets, and KPI stat cards. |
| `dashboard.analytics.tsx` | Breakdowns by channel, status, priority, and agent. |

### 1.3 Tickets Module

| File | Description |
|---|---|
| `tickets.index.tsx` | Ticket list with status, priority, and assignee filters. |
| `tickets.$id.index.tsx` | Ticket conversation, internal notes, status/assignee editor, and SLA tracker. |
| `tickets.$id.edit.tsx` | Ticket property editing form. |
| `tickets.new.tsx` | Create new ticket form. |
| `tickets.assigned.tsx` | Filtered queue for the currently logged-in agent. |
| `tickets.escalations.tsx` | Escalated tickets queue with reason badge. |

### 1.4 Customers Module

| File | Description |
|---|---|
| `customers.index.tsx` | Searchable customer directory with tier filters. |
| `customers.$id.index.tsx` | Customer profile, contact details, and ticket history. |
| `customers.$id.edit.tsx` | Edit customer details. |
| `customers.new.tsx` | Create customer profile. |

### 1.5 Knowledge Base Module

| File | Description |
|---|---|
| `knowledge-base.index.tsx` | Article directory by category. |
| `knowledge-base.$id.index.tsx` | Article view, Markdown-lite renderer, and helpfulness voting. |
| `knowledge-base.$id.edit.tsx` | Edit article content and category. |
| `knowledge-base.new.tsx` | Create new knowledge article. |

### 1.6 Team & SLA Module

| File | Description |
|---|---|
| `team.index.tsx` | Agent roster, status indicators, and workload capacity progress. |
| `team.$id.tsx` | Agent performance statistics and assigned tickets. |
| `sla.policies.tsx` | SLA target policy editor. |
| `sla.breaches.tsx` | Overdue ticket monitor. |

### 1.7 Reports Module

| File | Description |
|---|---|
| `reports.index.tsx` | Reporting overview and navigation. |
| `reports.tickets.tsx` | Volume trends, distributions, and CSV export. |
| `reports.agents.tsx` | Agent resolution, breach, and CSAT breakdown with CSV export. |

### 1.8 Activity Log Module

| File | Description |
|---|---|
| `activity-log.tsx` | Chronological audit log of all system changes. |


## 2. Shared Components (`src/components/app/`)

Shared components provide reusable UI elements, forms, tables, and charts across different application modules.

| File | Components / Functionality | Responsibility |
|---|---|---|
| `ui-bits.tsx` | PageHeader, QueryBoundary, StatCard, Panel, Badges, fmtDate, relTime | Reusable UI elements and utility functions. |
| `ticket-table.tsx` | TicketTable | Reusable ticket data table. |
| `forms.tsx` | TicketForm, CustomerForm, ArticleForm | Reusable forms for tickets, customers, and knowledge base articles. |
| `charts.tsx` | VolumeChart, Donut, Bars | Reusable chart components using Recharts. |


## 3. State & Data Layer (`src/lib/`)

The `src/lib/` directory contains data management, API simulation, query hooks, CSV generation, and page metadata utilities.

| File | Functionality | Responsibility |
|---|---|---|
| `queries.ts` | TanStack Query hooks: useTickets, useCustomer, useStats, useApiMutation | Manages data fetching, caching, and mutations. |
| `mock-api.ts` | In-memory seeded database, CRUD methods, simulated network latency and failures | Provides mock data and simulates backend API operations. |
| `csv.ts` | CSV export generator | Generates CSV files for report exports. |
| `head.ts` | SEO / page title metadata generator | Manages page titles and SEO metadata. |

---

## 3. Incomplete & Broken Interactions

| # | Route / File | Issue Description | Severity | Impact |
|---|---|---|---|---|
| 1 | `src/lib/head.ts` (lines 79, 81) | **Mojibake Character Bug**: Page title separator is corrupted to `A ` (e.g. `Dashboard A SupportDesk Pro`). | Low | Page titles in browser tabs show corrupted text. |
| 2 | `src/routes/tickets.index.tsx` (line 24) | **Un-debounced Route Navigation**: Typing in search bar runs `nav({ search: ... })` on every keystroke, causing rapid router reruns. | Medium | CPU churn and jerky input experience while typing. |
| 3 | `src/routes/customers.index.tsx` & `knowledge-base.index.tsx` | **Search Race Condition**: Direct keystroke state updates against asynchronous mock service with randomized latency (0.6x–1.4x) causes responses to arrive out-of-order. | Medium | Outdated search results overwrite newer keystrokes. |
| 4 | `src/routes/customers.$id.index.tsx` (lines 34–38) | **Layout Shift on Load**: `StatCard` row is hidden until `tickets.data` finishes loading, causing content below to abruptly jump down. | Low | Cumulative Layout Shift (CLS) visual glitch. |
| 5 | `src/routes/customers.$id.index.tsx` & `knowledge-base.$id.index.tsx` | **Missing Delete Functionality**: Tickets support full delete with confirmation dialog; Customers and Articles have no deletion paths in UI or API. | Low | Feature asymmetry across CRUD resources. |
| 6 | `src/routes/tickets.index.tsx` | **Missing Export Action**: Reports pages feature CSV download, but primary tickets queue lacks CSV export despite `downloadCsv` utility being available. | Low | Missing workflow convenience. |

---

## 4. `package.json` Dependency Audit

| Package | Status | Evidence | Action |
|---|---|---|---|
| `date-fns` (`^4.1.0`) | **Unused** | 0 imports in `src/`. Native `Intl` and custom date formatters in `ui-bits.tsx` are used instead. | Safe to uninstall (`npm rm date-fns`). |
| `@hookform/resolvers` (`^5.2.2`) | **Unused** | 0 imports in `src/`. Forms in `forms.tsx` use custom React state validation. | Safe to uninstall (`npm rm @hookform/resolvers`). |
| `cmdk`, `vaul`, `input-otp`, `react-day-picker`, `embla-carousel-react`, `react-resizable-panels` | **Phantom** | Only imported inside unused shadcn UI wrappers (`command.tsx`, `drawer.tsx`, `calendar.tsx`, etc.). | Can be removed if unused UI wrappers are deleted. |
| `@tailwindcss/vite`, `@tanstack/router-plugin`, `tailwindcss`, `vite-tsconfig-paths` | **Required** | Build-time plugins referenced in `vite.config.ts`. | Keep (do not delete). |

---

## 5. TanStack Query Lifecycle & Caching Investigation

### 1. Client Configuration (`src/router.tsx`)
* Instantiated with default options (`const queryClient = new QueryClient()`).
* Default `staleTime` is `0`, causing queries to be immediately stale. Navigating between views triggers automatic background refetching.
* Query retry defaults to 3 attempts with exponential backoff on list queries. Only detail queries (`useTicket`, `useCustomer`, `useArticle`, `useAgent`) explicitly pass `retry: false`.

### 2. Query Key Inconsistency (`src/lib/queries.ts`)
* Structured query key factory (`qk`) is used for `tickets`, `customers`, and `articles`.
* Unstructured inline string arrays are used for `agents` (`["agents"]`), `sla` (`["sla"]`), `breaches` (`["breaches"]`), and `stats` (`["stats"]`).
* *Recommendation:* Centralize all query keys within `qk` for consistency.

### 3. Broad Cache Invalidation (`useApiMutation`)
* In `src/lib/queries.ts`:
  ```ts
  onSuccess: () => { qc.invalidateQueries(); if (success) toast.success(success); }

---
