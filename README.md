# TransitOps — Smart Transport Operations Platform

> **Odoo Hackathon Project** · End-to-end fleet, dispatch, maintenance & expense control tower  
> **Live Demo:** [https://transitops-odoo.vercel.app/](https://transitops-odoo.vercel.app/)  
> **Duration:** 8 Hours · **Tagline:** *One console for fleet, dispatch, and depot operations.*

TransitOps digitizes the complete lifecycle of transport operations—vehicle registration, driver compliance, trip dispatch, maintenance, fuel logging, expense tracking, and operational analytics—while enforcing mandatory business rules that spreadsheets cannot guarantee.

Many logistics companies still rely on manual logbooks. That leads to scheduling conflicts, underutilized vehicles, missed maintenance, expired licenses, inaccurate expense tracking, and zero operational visibility. TransitOps replaces that chaos with a centralized, role-aware Control Tower.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Problem Statement](#2-problem-statement)
3. [Hackathon Brief & Objectives](#3-hackathon-brief--objectives)
4. [Target Users & Personas](#4-target-users--personas)
5. [Live Demo & Quick Links](#5-live-demo--quick-links)
6. [Feature Highlights](#6-feature-highlights)
7. [Mandatory Deliverables Checklist](#7-mandatory-deliverables-checklist)
8. [Bonus Features Implemented](#8-bonus-features-implemented)
9. [Technology Stack](#9-technology-stack)
10. [System Architecture](#10-system-architecture)
11. [Repository Structure](#11-repository-structure)
12. [Database Design](#12-database-design)
13. [Database Screenshots (pgAdmin)](#13-database-screenshots-pgadmin)
14. [Authentication & Security](#14-authentication--security)
15. [Role-Based Access Control (RBAC)](#15-role-based-access-control-rbac)
16. [Application Modules](#16-application-modules)
    - [16.1 Login](#161-login)
    - [16.2 Operations Dashboard](#162-operations-dashboard)
    - [16.3 Vehicle Registry (Fleet)](#163-vehicle-registry-fleet)
    - [16.4 Driver Management](#164-driver-management)
    - [16.5 Trip Management](#165-trip-management)
    - [16.6 Maintenance Workflow](#166-maintenance-workflow)
    - [16.7 Fuel & Expense Management](#167-fuel--expense-management)
    - [16.8 Reports & Analytics](#168-reports--analytics)
    - [16.9 Settings & Live RBAC Matrix](#169-settings--live-rbac-matrix)
17. [Mandatory Business Rules](#17-mandatory-business-rules)
18. [Automatic Status Transitions](#18-automatic-status-transitions)
19. [End-to-End Example Workflow (9 Steps)](#19-end-to-end-example-workflow-9-steps)
20. [Negative Path Demonstrations](#20-negative-path-demonstrations)
21. [API Reference](#21-api-reference)
22. [Frontend State & Data Flow](#22-frontend-state--data-flow)
23. [Analytics Formulas](#23-analytics-formulas)
24. [Exports (CSV & PDF)](#24-exports-csv--pdf)
25. [UI / UX Design System](#25-ui--ux-design-system)
26. [Seed Data & Demo Credentials](#26-seed-data--demo-credentials)
27. [Local Setup & Development](#27-local-setup--development)
28. [Environment Variables](#28-environment-variables)
29. [Deployment (Vercel)](#29-deployment-vercel)
30. [Judge Walkthrough Script (5 Minutes)](#30-judge-walkthrough-script-5-minutes)
31. [Testing Scenarios](#31-testing-scenarios)
32. [Project Timeline (8-Hour Hackathon)](#32-project-timeline-8-hour-hackathon)
33. [Future Enhancements](#33-future-enhancements)
34. [Team & Acknowledgements](#34-team--acknowledgements)
35. [License](#35-license)

---

## 1. Overview

**TransitOps** (also branded in-app as **TransitOps Control Tower**) is a full-stack web application built for the Odoo Hackathon. It provides a single operational console where depot staff can:

| Capability | What it does |
|---|---|
| **Fleet registry** | Master list of vehicles with unique registration, capacity, odometer, cost, and status |
| **Driver compliance** | License tracking, safety scores, duty status, expiry alerts |
| **Dispatch** | Create → Dispatch → Complete / Cancel trips with capacity & eligibility checks |
| **Maintenance** | Service logs that automatically pull vehicles out of the dispatch pool |
| **Fuel & expenses** | Liters, cost, tolls, misc — rolled into operational cost |
| **Analytics** | Fuel efficiency, utilization, operational cost, vehicle ROI + charts |
| **RBAC** | Four roles with full / view / none access per module |

The platform is production-shaped: PostgreSQL via Prisma, Express REST API, React SPA with Vite, Zustand client state, Recharts analytics, CSV/PDF exports, dark mode, and license-expiry notifications.

---

## 2. Problem Statement

Logistics SMEs commonly manage operations with:

- Spreadsheets for vehicle lists and driver rosters  
- Paper logbooks for trips and fuel  
- Ad-hoc WhatsApp messages for dispatch  
- No automated check that cargo fits the van  
- No enforcement when a license expires or a vehicle is in the shop  

**Consequences:**

1. **Double-booking** — a vehicle already On Trip gets assigned again  
2. **Overloading** — cargo exceeds max capacity  
3. **Compliance risk** — suspended / expired-license drivers still get runs  
4. **Missed maintenance** — shop vehicles stay “available” on paper  
5. **Blind finance** — no single view of fuel + maintenance vs acquisition cost  

TransitOps solves this by encoding business rules in the API and UI so invalid operations are blocked *before* they hit the database.

---

## 3. Hackathon Brief & Objectives

| Item | Detail |
|---|---|
| **Event** | Odoo Hackathon |
| **Product name** | TransitOps — Smart Transport Operations Platform |
| **Duration** | 8 hours |
| **Objective** | Build an end-to-end transport operations platform that digitizes vehicle, driver, dispatch, maintenance, and expense management while enforcing business rules and providing operational insights |
| **Mockup reference** | [Excalidraw mockup](https://link.excalidraw.com/l/65VNwvy7c4X/1FHGDNgD2td) |
| **Deployed URL** | [https://transitops-odoo.vercel.app/](https://transitops-odoo.vercel.app/) |

### Functional requirement map (brief → product)

| Brief § | Requirement | Implemented in |
|---|---|---|
| 3.1 | Auth + RBAC | `login.tsx`, `rbac.ts`, `User` model, `/api/login` |
| 3.2 | Dashboard KPIs + filters | `_app.dashboard.tsx` |
| 3.3 | Vehicle Registry | `_app.fleet.tsx`, `Vehicle` model |
| 3.4 | Driver Management | `_app.drivers.tsx`, `Driver` model |
| 3.5 | Trip Management | `_app.trips.tsx`, trip lifecycle APIs |
| 3.6 | Maintenance | `_app.maintenance.tsx`, status → InShop |
| 3.7 | Fuel & Expenses | `_app.expenses.tsx`, `FuelLog` / `Expense` |
| 3.8 | Reports & Analytics | `_app.analytics.tsx`, Recharts + ROI formula |

---

## 4. Target Users & Personas

| Persona | Role key | Primary job | Default landing page |
|---|---|---|---|
| **Fleet Manager** | `FleetManager` | Oversees fleet assets, maintenance, vehicle lifecycle, operational efficiency | `/fleet` |
| **Dispatcher** | `Dispatcher` | Creates trips, assigns vehicles & drivers, monitors active deliveries | `/dashboard` |
| **Safety Officer** | `SafetyOfficer` | Driver compliance, license validity, safety scores | `/drivers` |
| **Financial Analyst** | `FinancialAnalyst` | Expenses, fuel, maintenance costs, profitability / ROI | `/expenses` |

Each persona sees a **filtered sidebar**: modules with `none` access are hidden; modules with `view` show a small **VIEW** badge and hide mutating actions (e.g. Add Vehicle).

---

## 5. Live Demo & Quick Links

| Resource | Link |
|---|---|
| **Production app** | [https://transitops-odoo.vercel.app/](https://transitops-odoo.vercel.app/) |
| **Design mockup** | [Excalidraw](https://link.excalidraw.com/l/65VNwvy7c4X/1FHGDNgD2td) |
| **Local frontend** | `http://127.0.0.1:5173` |
| **Local API** | `http://localhost:3000` |

**Fastest path for judges:** open the live URL → pick **Dispatcher** → walk the Operations Dashboard → Trips → then switch to **Financial Analyst** for Expenses & Analytics.

---

## 6. Feature Highlights

### Core (mandatory)

- Secure email/password login with role selection  
- Role-Based Access Control across Fleet, Drivers, Trips, Expenses, Analytics  
- Operations Dashboard with 7 KPIs + vehicle-type / status / region filters  
- Full CRUD-style Vehicle Registry (unique `regNo`)  
- Driver profiles with license category, expiry, safety score, status  
- Trip lifecycle: **Draft → Dispatched → Completed / Cancelled**  
- Capacity, availability, and license validations on dispatch  
- Automatic vehicle/driver status transitions  
- Maintenance logs that force **In Shop** and hide vehicles from dispatch  
- Fuel logs + trip-linked expenses with auto total operational cost  
- Analytics: efficiency, utilization, op cost, ROI + charts  
- CSV export across modules  

### Bonus / polish

- **PDF export** (jsPDF + autotable) for fuel & expenses  
- **Dark mode** (persisted in `localStorage`)  
- **License expiry alerts** (bell + 30-day window)  
- **Vehicle document attachment** UI (paperclip / docs column)  
- Search, filters, and sorting on registry / trips / drivers  
- Account lockout after **5 failed login attempts**  
- Live editable RBAC matrix in Settings  
- Responsive Control Tower shell (sidebar + glass topbar)  

---

## 7. Mandatory Deliverables Checklist

| Deliverable | Status |
|---|---|
| Responsive web interface | Done |
| Authentication with RBAC | Done |
| CRUD for Vehicles and Drivers | Done |
| Trip Management with validations | Done |
| Automatic status transitions | Done |
| Maintenance workflow | Done |
| Fuel & Expense tracking | Done |
| Dashboard with KPIs | Done |
| Charts and visual analytics | Done |

---

## 8. Bonus Features Implemented

| Bonus (from brief) | Implementation |
|---|---|
| PDF export | `src/lib/pdf.ts` + Expenses page buttons |
| Email reminders for expiring licenses | In-app notification center (bell) for licenses ≤ 30 days / expired |
| Vehicle document management | Fleet table **Docs** column with attach affordance |
| Search, filters, and sorting | Fleet, Drivers, Trips, Dashboard filters |
| Dark mode | Theme toggle in app shell |

---

## 9. Technology Stack

### Frontend

| Layer | Technology | Why |
|---|---|---|
| UI library | **React 19** | Component model for Control Tower pages |
| Bundler / DX | **Vite 8** | Fast HMR; `/api` proxy to Express |
| Routing | **React Router 7** | Nested layout (`_app`) + login gate |
| Styling | **Tailwind CSS 4** + `@tailwindcss/vite` | Utility-first, dark mode via class |
| Components | **Radix UI** + shadcn-style primitives | Accessible dialogs, tables, selects |
| Icons | **Lucide React** | Consistent operational iconography |
| Charts | **Recharts** | Monthly revenue + cost bars |
| Forms / validation | **react-hook-form**, **Zod**, `@hookform/resolvers` | Structured forms where used |
| Client state | **Zustand** (+ persist for auth) | Auth session + operational datasets |
| Toasts | **Sonner** | Success / error feedback |
| PDF | **jspdf** + **jspdf-autotable** | Branded PDF tables |
| Language | **TypeScript 5.8** | Shared types with Prisma models |

### Backend

| Layer | Technology | Why |
|---|---|---|
| Runtime | **Node.js** + **tsx** | TypeScript Express without separate compile step |
| HTTP | **Express 5** | REST API under `/api/*` |
| ORM | **Prisma 6** | Schema-first models, enums, transactions |
| Database | **PostgreSQL** | Relational integrity for fleet entities |
| Adapter | `@prisma/adapter-pg` + `pg` Pool | Prisma driver adapter for Postgres |
| CORS | `cors` | Local Vite ↔ API during development |
| Config | `dotenv` | `DATABASE_URL`, `PORT` |

### Tooling & quality

| Tool | Role |
|---|---|
| ESLint + Prettier | Lint / format |
| concurrently | Run Vite + Express together (`npm run dev`) |
| prisma seed script | `server/seed.ts` loads demo depot data |

### Deployment

| Platform | Usage |
|---|---|
| **Vercel** | Hosted SPA at [transitops-odoo.vercel.app](https://transitops-odoo.vercel.app/) |

---

## 10. System Architecture

### High-level diagram

```text
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                          │
│  React Router · Zustand (useAuth / useData) · AppShell · Pages   │
│  fetch("/api/...")  ←── Vite proxy (dev) ──→  Express :3000      │
└───────────────────────────────┬─────────────────────────────────┘
                                │ JSON REST
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Express API (server/index.ts)                │
│  /api/login  /api/vehicles  /api/drivers  /api/trips             │
│  /api/maintenance  /api/fuel  /api/expenses                      │
│  Business rules + Prisma $transaction for status transitions     │
└───────────────────────────────┬─────────────────────────────────┘
                                │ Prisma Client + pg adapter
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PostgreSQL (transitops01)                      │
│  User · Vehicle · Driver · Trip · MaintenanceLog · FuelLog       │
│  Expense · Enums (VehicleStatus, DriverStatus, TripStatus, …)    │
└─────────────────────────────────────────────────────────────────┘
```

### Request lifecycle (example: Dispatch trip)

```text
Dispatcher clicks Dispatch
        │
        ▼
Zustand createTrip / dispatchTrip
        │
        ▼
POST /api/trips/:id/dispatch
        │
        ├─ Load trip, vehicle, driver
        ├─ Validate vehicle.status === Available
        ├─ Validate cargoWeightKg ≤ maxCapacityKg
        ├─ Validate driver.status === Available
        ├─ Validate licenseExpiry >= today
        │
        ▼
prisma.$transaction
  · trip.status = Dispatched
  · vehicle.status = OnTrip
  · driver.status = OnTrip
        │
        ▼
Client loadData() refreshes all entities
Dashboard KPIs / Live Board update immediately
```

### Architectural principles

1. **Server enforces truth** — capacity, availability, and license checks live in Express, not only in the UI.  
2. **UI mirrors rules** — dropdowns only list eligible vehicles/drivers for better UX.  
3. **Transactional status changes** — trip + vehicle + driver update atomically.  
4. **RBAC at the shell** — sidebar and page-level `can(role, module)` hide or soft-lock features.  
5. **Service boundary** — `src/services/index.ts` provides a thin façade over the store (swap-friendly for future backends).

---

## 11. Repository Structure

```text
TransitOps-Odoo/
├── public/                          # Static assets & README screenshots
│   ├── dispatch_dashboard.png       # Operations Dashboard UI
│   ├── dispatch_trip.png            # Trip Dispatcher UI
│   ├── fleet.png                    # Vehicle Registry UI
│   ├── maintainance_dashboard.png   # Maintenance UI
│   ├── Expense_dashboard.png        # Fuel & Expenses UI
│   ├── finance_analytics.png        # Analytics UI
│   ├── vehicle_db.png               # pgAdmin · Vehicle table
│   ├── trip_db.png                  # pgAdmin · Trip table
│   ├── maintaince_db.png            # pgAdmin · MaintenanceLog
│   └── expense.png                  # pgAdmin · Expense table
├── prisma/
│   └── schema.prisma                # Models, enums, relations
├── server/
│   ├── index.ts                     # Express REST API + business rules
│   └── seed.ts                      # Upsert seed users & operational data
├── src/
│   ├── App.tsx                      # Route tree
│   ├── main.tsx                     # React entry
│   ├── components/
│   │   ├── app-shell.tsx            # Sidebar, topbar, theme, alerts
│   │   ├── kpi-card.tsx
│   │   ├── status-pill.tsx
│   │   └── ui/                      # shadcn/Radix primitives
│   ├── lib/
│   │   ├── store.ts                 # Zustand auth + data stores
│   │   ├── rbac.ts                  # Access matrix helpers
│   │   ├── types.ts                 # Shared domain types
│   │   ├── mock-data.ts             # Seed payloads
│   │   ├── csv.ts                   # CSV download helper
│   │   └── pdf.ts                   # PDF download helper
│   ├── routes/
│   │   ├── login.tsx
│   │   ├── _app.tsx                 # Auth-gated layout
│   │   ├── _app.dashboard.tsx
│   │   ├── _app.fleet.tsx
│   │   ├── _app.drivers.tsx
│   │   ├── _app.trips.tsx
│   │   ├── _app.maintenance.tsx
│   │   ├── _app.expenses.tsx
│   │   ├── _app.analytics.tsx
│   │   └── _app.settings.tsx
│   └── services/
│       └── index.ts                 # Service façade over store
├── package.json
├── vite.config.ts                   # React + Tailwind + /api proxy
├── prisma.config.ts
└── README.md                        # This document
```

---

## 12. Database Design

### Entity overview

TransitOps uses **7 core tables** (matching the hackathon “Expected Database Entities”):

| Entity | Purpose |
|---|---|
| `User` | Authentication + RBAC role |
| `Vehicle` | Fleet master registry |
| `Driver` | Driver profiles & compliance |
| `Trip` | Dispatch lifecycle |
| `MaintenanceLog` | Service records & shop status |
| `FuelLog` | Fuel liters & cost per vehicle |
| `Expense` | Toll / misc / linked maintenance per trip |

### Enums (`prisma/schema.prisma`)

| Enum | Values |
|---|---|
| `VehicleStatus` | `Available`, `OnTrip`, `InShop`, `Retired` |
| `DriverStatus` | `Available`, `OnTrip`, `OffDuty`, `Suspended` |
| `TripStatus` | `Draft`, `Dispatched`, `Completed`, `Cancelled` |
| `Role` | `FleetManager`, `Dispatcher`, `SafetyOfficer`, `FinancialAnalyst` |
| `MaintenanceStatus` | `InShop`, `Completed` |
| `ExpenseStatus` | `Pending`, `Approved` |

### Entity-relationship (textual ERD)

```text
User (1) ───────────────────────────────────────────── (auth only)

Vehicle (1) ────< Trip >──── (1) Driver
   │                │
   │                └───< Expense
   ├───< MaintenanceLog
   ├───< FuelLog
   └───< Expense
```

### Model field reference

#### User
| Field | Type | Notes |
|---|---|---|
| `id` | UUID / text | PK |
| `name` | string | Display name |
| `email` | string | **Unique** |
| `password` | string | Demo plaintext (hackathon scope) |
| `role` | `Role` | RBAC |

#### Vehicle
| Field | Type | Notes |
|---|---|---|
| `id` | text | PK |
| `regNo` | string | **Unique** registration number |
| `nameModel` | string | Make / model |
| `type` | string | Van / Truck / Mini |
| `maxCapacityKg` | float | Capacity gate for cargo |
| `odometerKm` | float | Updated on trip complete |
| `acquisitionCost` | float | ROI denominator |
| `status` | `VehicleStatus` | Lifecycle |

#### Driver
| Field | Type | Notes |
|---|---|---|
| `id` | text | PK |
| `name` | string | |
| `licenseNo` | string | **Unique** |
| `category` | string | LMV / HMV |
| `licenseExpiry` | DateTime | Blocks dispatch if past |
| `contact` | string | Phone |
| `safetyScore` | float | Default 100 |
| `status` | `DriverStatus` | Duty / suspension |

#### Trip
| Field | Type | Notes |
|---|---|---|
| `id` | text | e.g. `TR001` |
| `source` / `destination` | string | Route |
| `cargoWeightKg` | float | Validated vs capacity |
| `plannedDistanceKm` | float | Planning |
| `finalOdometerKm` | float? | On complete |
| `actualDistanceKm` | float? | `final − start` |
| `fuelConsumedL` | float? | On complete |
| `status` | `TripStatus` | Lifecycle |
| `etaMinutes` | int? | Live board |
| `note` | string? | Cancel reason |
| `vehicleId` / `driverId` | FK nullable | Assignments |

#### MaintenanceLog / FuelLog / Expense
See Prisma schema and screenshots in the next section for column-level detail. Expense `total` is computed as:

```text
total = toll + other + maintenanceLinkedCost
```

---

## 13. Database Screenshots (pgAdmin)

The following screenshots were captured from **pgAdmin** against the PostgreSQL database **`transitops01`** (`public` schema). They prove that the Prisma models are materialized as real relational tables with live seed / operational data.

### Vehicle table

Master fleet registry: registration numbers, capacity, odometer, acquisition cost, and `VehicleStatus` enum values (`Available`, `OnTrip`, `InShop`, `Retired`).

![Vehicle table in pgAdmin](./public/vehicle_db.png)

### Trip table

Trip lifecycle rows with cargo weight, distances, fuel consumed, ETA, and statuses across `Draft` / `Dispatched` / `Completed` / `Cancelled`.

![Trip table in pgAdmin](./public/trip_db.png)

### MaintenanceLog & Expense tables (side by side)

Service records that drive **In Shop** transitions, and trip-linked expense rollups used by finance.

<table>
  <tr>
    <td width="50%" valign="top">
      <p><strong>MaintenanceLog</strong> — service type, cost, date, <code>InShop</code> / <code>Completed</code></p>
      <img src="./public/maintaince_db.png" alt="MaintenanceLog table in pgAdmin" />
    </td>
    <td width="50%" valign="top">
      <p><strong>Expense</strong> — toll, other, linked maintenance, total, approval status</p>
      <img src="./public/expense.png" alt="Expense table in pgAdmin" />
    </td>
  </tr>
</table>

### Tables present in `transitops01`

From the Object Explorer:

1. `Driver`  
2. `Expense`  
3. `FuelLog`  
4. `MaintenanceLog`  
5. `Trip`  
6. `User`  
7. `Vehicle`  

These seven entities map 1:1 to the hackathon brief’s expected database entities.

---

## 14. Authentication & Security

### Login flow

1. User opens `/login`  
2. Selects a **Role (RBAC)** — email auto-fills for that demo persona  
3. Submits email + password + role  
4. Client `POST /api/login`  
5. Server finds `User` by email and checks `password` **and** `role` match  
6. On success, Zustand `useAuth` persists session (`transitops-auth`)  
7. User is redirected to the role’s home route  

### Route protection

`src/routes/_app.tsx` wraps all Control Tower pages:

- If no authenticated user → redirect to `/login`  
- Only then render `AppShell` + nested routes  

### Lockout (demo hardening)

The login page tracks failed attempts **per email**. After **5** failures:

```text
❌ Account locked after 5 failed attempts.
```

Successful login resets the counter for that email.

### Security notes (hackathon scope)

| Topic | Current approach | Production recommendation |
|---|---|---|
| Password storage | Plaintext in seed (demo) | bcrypt / argon2 hashes |
| Session | localStorage via Zustand persist | HTTP-only JWT / session cookies |
| Authorization | UI RBAC + role on login | Server middleware verifying JWT claims |
| HTTPS | Provided by Vercel | Keep TLS everywhere |

---

## 15. Role-Based Access Control (RBAC)

### Access levels

| Level | Meaning in UI |
|---|---|
| `full` | View + create/update actions |
| `view` | Read-only; **VIEW** badge on nav; mutate buttons hidden/disabled |
| `none` | Module hidden from sidebar; page shows “no access” if navigated |

### Default matrix (`src/lib/rbac.ts`)

| Role | Fleet | Drivers | Trips | Expenses | Analytics |
|---|---|---|---|---|---|
| **Fleet Manager** | full | full | full | full | full |
| **Dispatcher** | view | none | full | none | none |
| **Safety Officer** | none | full | view | none | none |
| **Financial Analyst** | view | none | none | full | full |

> Maintenance uses the **fleet** module key for access (shop work is a fleet concern). Settings & Dashboard remain available to authenticated users.

### Dynamic matrix

Settings allows live edits via `updateRBAC(role, module, access)`. The `can()` helper prefers the Zustand matrix when present, so judges can demonstrate permission changes without redeploying.

### Role → landing redirects

| Role | Redirect after login |
|---|---|
| FleetManager | `/fleet` |
| Dispatcher | `/dashboard` |
| SafetyOfficer | `/drivers` |
| FinancialAnalyst | `/expenses` |

---

## 16. Application Modules

### 16.1 Login

Split layout: brand story + RBAC role list on the left; credential form on the right. Demo credentials are pre-filled; changing the Role select swaps the email to the matching persona.

---

### 16.2 Operations Dashboard

**Route:** `/dashboard` · **Primary persona:** Dispatcher  

![Operations Dashboard](./public/dispatch_dashboard.png)

#### KPI cards (7)

| KPI | Computation |
|---|---|
| Active Vehicles | Non-retired vehicles (after filters) |
| Available | `status === Available` |
| In Maintenance | `status === InShop` |
| Active Trips | Trips with `Dispatched` |
| Pending Trips | Trips with `Draft` |
| Drivers on Duty | Drivers with `OnTrip` |
| Fleet Utilization % | `OnTrip / Active × 100` (rounded) |

KPIs zero-pad numeric displays (`05`, `02`, …) for a control-room aesthetic.

#### Filters

- Vehicle Type: All / Van / Truck / Mini  
- Status: All / Available / OnTrip / InShop / Retired  
- Region: All / North / South (UI filter hook for depot expansion)  

Changing type/status **synchronously** updates KPI cards, recent trips context, and the Vehicle Status distribution bars.

#### Panels

- **Recent Trips** — last 6 trips with reg no, driver, status pill, ETA  
- **Vehicle Status** — horizontal bars for Available / On Trip / In Shop / Retired  

---

### 16.3 Vehicle Registry (Fleet)

**Route:** `/fleet` · **Primary persona:** Fleet Manager (Dispatcher = view)  

![Vehicle Registry](./public/fleet.png)

#### Fields captured

Registration Number (unique), Name/Model, Type, Max Capacity (kg), Odometer (km), Acquisition Cost (₹), Status.

#### Status values

`Available` · `OnTrip` · `InShop` · `Retired`

#### UX details

- Type / status filters + search by registration  
- **Docs** column for vehicle document management (bonus)  
- Export CSV of the filtered registry  
- **Add Vehicle** only when access is `full`  
- Footer rule callout: *Registration No. must be unique · Retired/In Shop vehicles are hidden from Trip Dispatcher*

---

### 16.4 Driver Management

**Route:** `/drivers` · **Primary persona:** Safety Officer  

#### Profile fields

Name, License Number, Category (LMV/HMV), License Expiry, Contact, Safety Score, Status.

#### Status values

`Available` · `OnTrip` · `OffDuty` · `Suspended`

#### Compliance UX

- Expired licenses highlighted; expiring ≤ 30 days flagged  
- Safety score badges: Excellent / Good / Fair / Poor  
- Suspended + expired drivers are **excluded** from trip driver dropdowns  
- Global bell alerts list drivers with licenses expired or expiring soon  

Seed intentionally includes **John** (expired + Suspended) so judges can prove negative eligibility.

---

### 16.5 Trip Management

**Route:** `/trips` · **Primary persona:** Dispatcher  

![Trip Dispatcher](./public/dispatch_trip.png)

#### Create Trip form

| Field | Behavior |
|---|---|
| Source / Destination | Free text (default source: Gandhinagar Depot) |
| Vehicle | Dropdown of **Available only** |
| Driver | Dropdown of **Available + non-expired license** |
| Cargo Weight (kg) | Live over-capacity warning vs selected vehicle |
| Planned Distance (km) | Planning input |

Actions: **Dispatch** (immediate Dispatched path), **Save Draft**, **Clear**.

#### Trip lifecycle stepper

Visual stepper: **Draft → Dispatched → Completed** with terminal **Cancelled**. Selecting a Live Board card reflects that trip’s real state.

#### Live Board

Search + status filter; cards show route, vehicle, driver, cargo, ETA / odometer. Actions:

- Draft → Dispatch / Cancel  
- Dispatched → Complete (final odo + fuel L + fuel cost) / Cancel  
- Completed / Cancelled → read-only history  

#### Server validations on dispatch / create-as-dispatched

1. Cargo ≤ vehicle `maxCapacityKg`  
2. Vehicle must be `Available`  
3. Driver must be `Available`  
4. Driver license must not be expired  
5. On success: vehicle & driver → `OnTrip` (transaction)  

#### Complete trip

- Final odometer must be **strictly greater** than current vehicle odometer  
- Computes `actualDistanceKm`  
- Writes `FuelLog`  
- Restores vehicle & driver to `Available`  
- Updates vehicle odometer  

#### Cancel trip

- Sets status `Cancelled` + reason note  
- If not Draft: restores vehicle/driver to Available (unless vehicle is already `InShop`)  

---

### 16.6 Maintenance Workflow

**Route:** `/maintenance`  

![Maintenance](./public/maintainance_dashboard.png)

#### Log Service Record

Vehicle (non-retired), Service Type, Cost (₹), Date, Status (`InShop` / `Completed`).

UI shows transition strip: **Available → In Shop → Available** and warns that In Shop vehicles leave the dispatch pool.

#### Business effects

| Action | Effect |
|---|---|
| Create with `InShop` | Vehicle status → `InShop`; hidden from trip vehicle list |
| Close maintenance | Log → `Completed`; if no other open shop logs and not Retired → `Available` |
| Create while `OnTrip` | **Rejected** by API |

Service Log table lists vehicle, service, date, cost, status with CSV export.

---

### 16.7 Fuel & Expense Management

**Route:** `/expenses` · **Primary persona:** Financial Analyst  

![Fuel & Expense Management](./public/Expense_dashboard.png)

#### Fuel Logs

Vehicle, Date, Liters, Fuel Cost — also auto-created when a trip is completed.

#### Other Expenses (Toll / Misc)

Trip, Vehicle, Toll, Other, Maint. (Linked), Total, Status (`Pending` / `Approved`).

#### Operational summary banner

```text
TOTAL OPERATIONAL COST (AUTO) = FUEL + MAINT
```

Displayed as a live ₹ total (fuel cost sum + maintenance cost sum).

#### Exports

CSV and PDF for both fuel logs and other expenses.

---

### 16.8 Reports & Analytics

**Route:** `/analytics` · **Primary persona:** Financial Analyst  

![Reports & Analytics](./public/finance_analytics.png)

#### KPI strip

| Metric | Formula / source |
|---|---|
| Fuel Efficiency | Distance / Fuel (km/l) from completed trips vs fuel liters |
| Fleet Utilization | OnTrip / Active non-retired vehicles |
| Operational Cost | Σ Fuel cost + Σ Maintenance cost |
| Vehicle ROI | See [§23](#23-analytics-formulas) |

#### Charts

1. **Monthly Revenue** — Recharts bar chart (Feb–Jul)  
2. **Top Costliest Vehicles** — horizontal bars (fuel + maintenance per vehicle)  

CSV export of trip report rows is available from this page.

---

### 16.9 Settings & Live RBAC Matrix

**Route:** `/settings`  

- Depot identity (e.g. Gandhinagar Depot GJ4)  
- Currency / distance unit preferences  
- **Live RBAC Matrix** — cells show and update access levels per role × module  

Useful for judges to prove that Dispatcher cannot add vehicles while Fleet Manager can.

---

## 17. Mandatory Business Rules

Every rule from the hackathon brief is enforced in UI and/or API:

| # | Rule | Enforcement |
|---|---|---|
| BR-01 | Vehicle registration number must be unique | Prisma `@unique` on `regNo` + create error surfacing |
| BR-02 | Retired or In Shop vehicles never appear in dispatch selection | Client filters `status === Available`; server rejects non-Available |
| BR-03 | Expired license or Suspended drivers cannot be assigned | Client filter + server license/status checks |
| BR-04 | Driver or vehicle already On Trip cannot be assigned again | Only `Available` entities selectable / acceptable |
| BR-05 | Cargo weight ≤ vehicle max capacity | Live UI warning + API reject |
| BR-06 | Dispatching sets vehicle & driver to On Trip | `$transaction` on dispatch |
| BR-07 | Completing sets vehicle & driver back to Available | Complete endpoint transaction |
| BR-08 | Cancelling a dispatched trip restores Available | Cancel endpoint (respects InShop) |
| BR-09 | Active maintenance → vehicle In Shop | Maintenance create transaction |
| BR-10 | Closing maintenance restores Available (unless Retired) | Close endpoint + open-log check |

---

## 18. Automatic Status Transitions

### Vehicle state machine

```text
                 ┌──────────────┐
                 │   Retired    │◄──── (manual / registry)
                 └──────────────┘

 Available ◄──────────────► OnTrip
     │   dispatch / complete│
     │   cancel             │
     │                      │
     └──────► InShop ◄──────┘
         open maintenance
         (blocked if OnTrip)
         close maintenance → Available
         (if no other InShop logs)
```

### Driver state machine

```text
 Available ◄──► OnTrip
     │            │
     │            │ dispatch / complete / cancel
     ▼            │
 OffDuty          │
 Suspended ───────┴── (blocked from dispatch)
```

### Trip state machine

```text
 Draft ──dispatch──► Dispatched ──complete──► Completed
   │                      │
   └──── cancel ──────────┴──── cancel ─────► Cancelled
```

---

## 19. End-to-End Example Workflow (9 Steps)

This mirrors the brief’s example scenario (Van-05 / Alex / 450 kg):

| Step | Action | Expected result |
|---|---|---|
| 1 | Register vehicle (e.g. Van / max 500 kg) as Available | Appears in Fleet registry |
| 2 | Register driver Alex with valid license | Appears in Drivers; eligible for dispatch |
| 3 | Create trip with Cargo Weight = 450 kg | Form accepts input |
| 4 | System validates 450 ≤ 500 | Dispatch enabled; no capacity error |
| 5 | Dispatch | Vehicle & Driver → **On Trip** |
| 6 | Complete with final odometer + fuel consumed | FuelLog written; odometer updated |
| 7 | System restores statuses | Vehicle & Driver → **Available** |
| 8 | Create maintenance (Oil Change) | Vehicle → **In Shop**; hidden from dispatch |
| 9 | Open Reports | Op cost & fuel efficiency reflect latest fuel/maintenance |

---

## 20. Negative Path Demonstrations

| Path | How to demo | Expected |
|---|---|---|
| **Capacity limit** | Assign cargo 700 kg to a 500 kg van | Blocked / over-capacity warning |
| **Driver eligibility** | Open Driver dropdown | Suspended/expired drivers (e.g. John) absent |
| **RBAC UI** | Login as Dispatcher → Fleet | **Add Vehicle** hidden; VIEW badge |
| **Login lockout** | Fail password 5 times | Account locked message |
| **Maintenance while OnTrip** | Try shop log on OnTrip vehicle | API error |

---

## 21. API Reference

Base URL (dev): `http://localhost:3000` · Proxied as `/api` from Vite.

### Auth

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/api/login` | `{ email, password, role }` | `{ ok, user }` or `{ ok:false, error }` |

### Vehicles

| Method | Path | Notes |
|---|---|---|
| GET | `/api/vehicles` | List all |
| POST | `/api/vehicles` | Create; unique `regNo` |
| PUT | `/api/vehicles/:id/status` | `{ status }` |

### Drivers

| Method | Path | Notes |
|---|---|---|
| GET | `/api/drivers` | List all |
| POST | `/api/drivers` | Create; parses `licenseExpiry` |
| PUT | `/api/drivers/:id/status` | `{ status }` |

### Trips

| Method | Path | Notes |
|---|---|---|
| GET | `/api/trips` | List all |
| POST | `/api/trips` | Create Draft or Dispatched (with validations) |
| POST | `/api/trips/:id/dispatch` | Draft → Dispatched + OnTrip |
| POST | `/api/trips/:id/complete` | `{ finalOdo, fuelL, fuelCost }` |
| POST | `/api/trips/:id/cancel` | `{ reason }` |

### Maintenance

| Method | Path | Notes |
|---|---|---|
| GET | `/api/maintenance` | List |
| POST | `/api/maintenance` | Create; may set InShop |
| POST | `/api/maintenance/:id/close` | Complete log; maybe Available |

### Fuel & Expenses

| Method | Path | Notes |
|---|---|---|
| GET/POST | `/api/fuel` | Fuel logs |
| GET/POST | `/api/expenses` | Auto-computes `total` |

---

## 22. Frontend State & Data Flow

### Stores (`src/lib/store.ts`)

| Store | Persistence | Responsibility |
|---|---|---|
| `useAuth` | `localStorage` (`transitops-auth`) | Current user, login/logout |
| `useData` | Memory | Vehicles, drivers, trips, maintenance, fuel, expenses, settings, rbacMatrix |

### Bootstrap

On authenticated layout mount:

```text
AppLayout / AppShell → useData.loadData()
  → Promise.all([vehicles, drivers, trips, maintenance, fuel, expenses])
  → set() into Zustand
```

Mutations that affect multiple entities (dispatch, complete, cancel, maintenance) call `loadData()` again so KPIs stay consistent.

### Service façade (`src/services/index.ts`)

Provides `vehicleService`, `driverService`, `tripService`, `maintenanceService`, `fuelService`, `analyticsService`, `settingsService` — each wrapping the store with a short delay. Components can migrate to pure HTTP later without rewriting pages.

---

## 23. Analytics Formulas

### Fuel Efficiency

\[
\text{Fuel Efficiency (km/l)} = \frac{\sum \text{plannedDistanceKm of Completed trips}}{\sum \text{fuel liters}}
\]

### Fleet Utilization

\[
\text{Utilization \%} = \frac{\text{Vehicles OnTrip}}{\text{Active (non-Retired) Vehicles}} \times 100
\]

### Operational Cost

\[
\text{Operational Cost} = \sum \text{Fuel cost} + \sum \text{Maintenance cost}
\]

### Vehicle ROI (hackathon formula)

\[
\text{ROI} = \frac{\text{Revenue} - (\text{Maintenance} + \text{Fuel})}{\text{Acquisition Cost}}
\]

In the current build, revenue is approximated as:

```text
revenue = (count of Completed trips) × ₹12,500
```

The Analytics page displays the formula under the KPI strip for transparency.

---

## 24. Exports (CSV & PDF)

### CSV (`src/lib/csv.ts`)

Generic `downloadCSV(data, columns, filename)`:

- Quoted fields with escaped quotes  
- Optional per-column `transform` (e.g. vehicleId → regNo)  
- Triggers browser download  

Used on Fleet, Drivers, Trips, Maintenance, Expenses, Analytics.

### PDF (`src/lib/pdf.ts`)

`downloadPDF` uses jsPDF + autoTable with TransitOps purple header styling (`#6D28D9`) and a generated date stamp. Wired on the Fuel & Expenses module (bonus deliverable).

---

## 25. UI / UX Design System

| Token / pattern | Usage |
|---|---|
| Brand gradient | Purple `#6D28D9` → Cyan `#06B6D4` on logo, active nav, CTAs |
| Surfaces | `bg-surface`, `border-line`, soft elevation `--shadow-e1` |
| Status colors | Green Available/Completed · Blue OnTrip/Dispatched · Amber InShop · Red Retired/Cancelled |
| Typography | Display headings with `gradient-text`; mono for IDs / money / odometer |
| Shell | Sticky glass topbar, dashed-route accents, fade-in page transitions |
| Dark mode | `document.documentElement.classList` + `localStorage.theme` |
| Feedback | Sonner toasts; pulse rings on active lifecycle steps |

Screenshots throughout this README (`public/*.png`) reflect the production UI aesthetic used in the live demo.

---

## 26. Seed Data & Demo Credentials

Seed source: `src/lib/mock-data.ts` · Loader: `server/seed.ts` (upsert by id/email).

### Demo users

| Role | Email | Password |
|---|---|---|
| Fleet Manager | `fleet@transitops.demo` | `Transit@123` |
| Dispatcher | `dispatch@transitops.demo` | `Transit@123` |
| Safety Officer | `safety@transitops.demo` | `Transit@123` |
| Financial Analyst | `finance@transitops.demo` | `Transit@123` |

### Sample fleet (abridged)

| ID | Reg / Model | Type | Capacity | Status |
|---|---|---|---|---|
| v1 | Tata Ace Gold | Van | 500 kg | Available |
| v2 | Ashok Leyland Dost | Truck | 5000 kg | OnTrip |
| v3 | Mahindra Bolero Pik-Up | Mini | 1000 kg | InShop |
| v4 | Maruti Super Carry | Van | 750 kg | Retired |
| v5 | Eicher Pro 2049 | Truck | 3000 kg | OnTrip |
| v6 | Mahindra Jeeto | Mini | 700 kg | Available |

### Sample drivers (abridged)

| Name | Status | Notes |
|---|---|---|
| Alex | Available | Valid license — happy path |
| John | Suspended | Expired license — negative path |
| Priya | OnTrip | Active dispatch |
| Suresh | OffDuty | Not in dispatch pool |

### Sample trips

| ID | Status | Note |
|---|---|---|
| TR001 | Dispatched | Live ETA |
| TR002 | Draft | Ready to dispatch |
| TR003 | Completed | Has fuel / expense linkage |
| TR006 | Cancelled | “Vehicle went to shop” |

---

## 27. Local Setup & Development

### Prerequisites

- Node.js 18+ (recommended 20+)  
- PostgreSQL instance with an empty database (e.g. `transitops01`)  
- npm  

### Install

```bash
cd TransitOps-Odoo
npm install
```

### Configure environment

Create `.env` in the project root (see [§28](#28-environment-variables)).

### Prisma migrate / generate & seed

```bash
npx prisma generate
npx prisma db push
npx tsx server/seed.ts
```

### Run (frontend + backend)

```bash
npm run dev
```

This runs:

- `vite dev` → `http://127.0.0.1:5173` (proxies `/api` → `:3000`)  
- `tsx watch server/index.ts` → Express on `PORT` (default `3000`)  

### Other scripts

| Script | Purpose |
|---|---|
| `npm run build` | Production Vite build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |

---

## 28. Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/transitops01` |
| `PORT` | Express listen port | `3000` |

Vite uses the proxy in `vite.config.ts` so the browser always calls relative `/api/...` in development.

---

## 29. Deployment (Vercel)

**Live:** [https://transitops-odoo.vercel.app/](https://transitops-odoo.vercel.app/)

Typical flow:

1. Build frontend with `vite build`  
2. Serve static assets on Vercel  
3. Point API / database to the hosted PostgreSQL used for the demo  

Judges can evaluate the full Control Tower experience without local setup.

---

## 30. Judge Walkthrough Script (5 Minutes)

### A. Authenticate as Fleet Manager

1. Open [https://transitops-odoo.vercel.app/](https://transitops-odoo.vercel.app/)  
2. Sign in as **Fleet Manager** (`fleet@transitops.demo` / `Transit@123`)  
3. Land on **Fleet** → show registry, unique reg rule, docs column  
4. Open **Settings** → point out depot + **Live RBAC Matrix**  
5. Optionally register a new vehicle  

### B. Drivers & compliance

1. Open **Drivers**  
2. Highlight Alex (valid) vs John (suspended / expired)  
3. Mention bell alerts for licence windows  

### C. Dispatch happy path

1. Sign out → sign in as **Dispatcher**  
2. Show **Operations Dashboard** KPIs + filters  
3. Open **Trips** → create trip (cargo within capacity) → **Dispatch**  
4. Show lifecycle stepper + Live Board On Trip states  
5. **Complete** with odometer + fuel  

### D. Maintenance effect

1. Log Oil Change as In Shop  
2. Confirm vehicle disappears from dispatch vehicle list  

### E. Finance & analytics

1. Sign in as **Financial Analyst**  
2. **Fuel & Expenses** → show auto operational cost + CSV/PDF  
3. **Analytics** → efficiency, utilization, ROI formula, charts  

### F. Negative paths (must demo)

1. Over-capacity cargo  
2. Missing suspended driver in dropdown  
3. Dispatcher cannot **Add Vehicle**  

---

## 31. Testing Scenarios

| ID | Scenario | Pass criteria |
|---|---|---|
| T01 | Login each role | Lands on correct home; sidebar matches matrix |
| T02 | Unique regNo | Duplicate create fails |
| T03 | Dispatch eligible pair | Both become OnTrip |
| T04 | Over capacity | Rejected |
| T05 | Expired license driver | Not listed / rejected |
| T06 | Complete trip | Available + FuelLog + odometer↑ |
| T07 | Cancel dispatched | Available restored |
| T08 | Maintenance InShop | Vehicle hidden from dispatch |
| T09 | Close maintenance | Available unless Retired |
| T10 | Analytics math | Op cost = fuel + maint; ROI formula visible |
| T11 | CSV / PDF | Files download with expected columns |
| T12 | Dark mode | Theme persists across reload |
| T13 | Lockout | 5 bad passwords lock account |

---

## 32. Project Timeline (8-Hour Hackathon)

| Phase | Hours (approx.) | Focus |
|---|---|---|
| 0 | 0.5 | Brief, Excalidraw mockup alignment, role matrix |
| 1 | 1.0 | Prisma schema, Postgres, seed |
| 2 | 1.5 | Express APIs + transactional business rules |
| 3 | 2.0 | React shell, auth, RBAC, Fleet & Drivers |
| 4 | 1.5 | Trips lifecycle + validations UX |
| 5 | 0.75 | Maintenance + Expenses |
| 6 | 0.5 | Dashboard KPIs + Analytics charts |
| 7 | 0.25 | CSV/PDF, dark mode, alerts, deploy polish |

---

## 33. Future Enhancements

- Hashed passwords + JWT auth middleware on every `/api` route  
- Real email / SMS reminders for license & fitness certificate expiry  
- Map-based routing / live GPS ETA  
- Multi-depot region filter backed by geo data  
- Document storage (S3) for RC, insurance, PUC  
- Audit trail of status transitions  
- Mobile-first driver companion app  
- Deeper Odoo ERP sync (accounting, inventory, HR)  

---

## 34. Team & Acknowledgements

Built for the **Odoo Hackathon** as **TransitOps — Smart Transport Operations Platform**.

Acknowledgements:

- Hackathon organizers for the problem brief and evaluation criteria  
- Excalidraw mockup for early UX alignment  
- PostgreSQL + Prisma + React/Vite ecosystem  

---

## 35. License

Hackathon demonstration project. All rights reserved by the authors unless otherwise agreed with the organizers. Demo credentials are public by design for judging; do not reuse these passwords in production systems.

---

### Quick reference card

| Need | Go to |
|---|---|
| Live app | https://transitops-odoo.vercel.app/ |
| Dashboard screenshot | `public/dispatch_dashboard.png` |
| Trip UI screenshot | `public/dispatch_trip.png` |
| Fleet UI screenshot | `public/fleet.png` |
| Maintenance UI screenshot | `public/maintainance_dashboard.png` |
| Expenses UI screenshot | `public/Expense_dashboard.png` |
| Analytics UI screenshot | `public/finance_analytics.png` |
| DB · Vehicle | `public/vehicle_db.png` |
| DB · Trip | `public/trip_db.png` |
| DB · Maintenance | `public/maintaince_db.png` |
| DB · Expense | `public/expense.png` |
| Schema | `prisma/schema.prisma` |
| API | `server/index.ts` |
| RBAC | `src/lib/rbac.ts` |

---

**TransitOps Control Tower** — *Smart Transport Operations Platform* · Built for Odoo Hackathon · [Open Live Demo](https://transitops-odoo.vercel.app/)
