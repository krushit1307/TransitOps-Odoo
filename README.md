<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:6D28D9,50:7C3AED,100:06B6D4&height=210&section=header&text=TransitOps&fontSize=66&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=Smart%20Transport%20Operations%20Platform&descAlignY=56&descSize=18" width="100%" alt="TransitOps banner" />

<br/>

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=20&duration=3200&pause=900&color=7C3AED&center=true&vCenter=true&multiline=true&repeat=true&width=760&height=75&lines=One+console+for+fleet%2C+dispatch+%26+depot.;RBAC+%C2%B7+Live+KPIs+%C2%B7+Auto+status+transitions.;Odoo+Hackathon+%C2%B7+8+Hours)](https://transitops-odoo.vercel.app/)

<br/>

<a href="https://transitops-odoo.vercel.app/">
  <img src="https://img.shields.io/badge/%F0%9F%96%A5%EF%B8%8F_UI_Preview-transitops--odoo.vercel.app-6D28D9?style=for-the-badge&labelColor=0f172a" alt="UI Preview"/>
</a>
&nbsp;
<a href="https://link.excalidraw.com/l/65VNwvy7c4X/1FHGDNgD2td">
  <img src="https://img.shields.io/badge/%F0%9F%96%8A%EF%B8%8F_Mockup-Excalidraw-06B6D4?style=for-the-badge&labelColor=0f172a" alt="Mockup"/>
</a>

<br/><br/>

<img src="https://img.shields.io/badge/Odoo_Hackathon-8_Hours-FF6B35?style=flat-square" alt="Hackathon"/>
<img src="https://img.shields.io/badge/Status-UI_Preview_on_Vercel-22C55E?style=flat-square" alt="Status"/>
<img src="https://img.shields.io/badge/RBAC-4_Roles-7C3AED?style=flat-square" alt="RBAC"/>
<img src="https://img.shields.io/badge/DB-Local_Postgres_Only-336791?style=flat-square&logo=postgresql&logoColor=white" alt="DB"/>
<img src="https://img.shields.io/badge/Frontend-React_19_%2B_Vite-61DAFB?style=flat-square&logo=react&logoColor=black" alt="Frontend"/>
<img src="https://img.shields.io/badge/API-Express_5-000000?style=flat-square&logo=express&logoColor=white" alt="API"/>
<img src="https://img.shields.io/badge/UI_Hosted-Vercel-black?style=flat-square&logo=vercel&logoColor=white" alt="Vercel"/>

<br/><br/>

```text
🚛  FLEET  →  🧑‍✈️ DRIVERS  →  🗺️ DISPATCH  →  🔧 SHOP  →  ⛽ FUEL  →  📊 ROI
```

</div>

---

> **Odoo Hackathon** · Smart Transport Operations Platform  
> **UI Preview (Vercel):** [https://transitops-odoo.vercel.app/](https://transitops-odoo.vercel.app/) — frontend only  
> **Full stack (API + PostgreSQL):** **local only** — database is not connected on Vercel

TransitOps digitizes vehicle, driver, dispatch, maintenance, fuel, and expense operations while enforcing business rules and surfacing operational insights — built as a Control Tower for depot teams.

<div align="center">

| 🚚 Fleet | 🧭 Dispatch | 🛡️ Safety | 💰 Finance |
|:---:|:---:|:---:|:---:|
| Unique registry | Draft → Done | License & scores | Fuel + Maint |
| Capacity / odo | Auto OnTrip | Suspended blocked | CSV / PDF |
| Docs · In Shop | Live Board | Expiry alerts | ROI charts |

</div>

---

## Table of Contents

<details open>
<summary><b>Navigate</b></summary>

| # | Section | # | Section |
|---:|---|---:|---|
| 1 | [Overview](#1-overview) | 10 | [Modules (UI)](#10-modules-ui) |
| 2 | [Problem & Goal](#2-problem--goal) | 11 | [Database Design](#11-database-design) |
| 3 | [Links & Credentials](#3-links--credentials) | 12 | [Database Screenshots](#12-database-screenshots) |
| 4 | [Features & Deliverables](#4-features--deliverables) | 13 | [Business Rules](#13-business-rules) |
| 5 | [Technology Stack](#5-technology-stack) | 14 | [Workflows](#14-workflows) |
| 6 | [Architecture](#6-architecture) | 15 | [API Reference](#15-api-reference) |
| 7 | [Repository Structure](#7-repository-structure) | 16 | [Analytics Formulas](#16-analytics-formulas) |
| 8 | [Authentication](#8-authentication) | 17 | [Setup (Local)](#17-setup-local) |
| 9 | [RBAC Matrix](#9-rbac-matrix) | 18 | [Judge Walkthrough](#18-judge-walkthrough) |

</details>

---

## 1. Overview

**TransitOps Control Tower** is a full-stack web app for the Odoo Hackathon (8 hours). It covers the transport lifecycle end-to-end:

| Capability | What it does |
|---|---|
| Fleet registry | Unique registration, capacity, odometer, cost, status |
| Driver compliance | License, category, expiry, safety score, duty status |
| Dispatch | Create → Dispatch → Complete / Cancel with validations |
| Maintenance | Service logs that pull vehicles out of the dispatch pool |
| Fuel & expenses | Liters, cost, tolls, misc — rolled into operational cost |
| Analytics | Efficiency, utilization, op cost, vehicle ROI + charts |
| RBAC | Four roles with full / view / none per module |

Stack shape: **React + Vite** frontend · **Express** REST API · **Prisma + PostgreSQL** (local) · Zustand · Recharts · CSV/PDF · dark mode · license alerts.

> End-to-end data workflows need local Postgres + API. The Vercel URL is a **UI preview** only.

---

## 2. Problem & Goal

| Pain (spreadsheets / logbooks) | TransitOps fix |
|---|---|
| Double-booked vehicles / drivers | Only `Available` entities can be assigned |
| Overloading | Cargo ≤ max capacity enforced in UI + API |
| Expired / suspended drivers still assigned | Filtered out + server checks |
| Shop vehicles still “available” | Maintenance → `InShop`, hidden from dispatch |
| Blind finance | Fuel + Maint rolled into cost & ROI |

**Hackathon objective:** digitize fleet, drivers, dispatch, maintenance, and expenses while enforcing rules and providing operational insights.

| Item | Detail |
|---|---|
| Event | Odoo Hackathon |
| Duration | 8 hours |
| UI Preview | [transitops-odoo.vercel.app](https://transitops-odoo.vercel.app/) |
| Mockup | [Excalidraw](https://link.excalidraw.com/l/65VNwvy7c4X/1FHGDNgD2td) |
| Full stack + DB | Local only |

### Brief → product map

| Brief | Implemented in |
|---|---|
| 3.1 Auth + RBAC | `login.tsx`, `rbac.ts`, `/api/login` |
| 3.2 Dashboard KPIs | `_app.dashboard.tsx` |
| 3.3 Vehicle Registry | `_app.fleet.tsx`, `Vehicle` |
| 3.4 Drivers | `_app.drivers.tsx`, `Driver` |
| 3.5 Trips | `_app.trips.tsx` + trip APIs |
| 3.6 Maintenance | `_app.maintenance.tsx` |
| 3.7 Fuel & Expenses | `_app.expenses.tsx` |
| 3.8 Reports | `_app.analytics.tsx` |

---

## 3. Links & Credentials

| Resource | Link / note |
|---|---|
| UI Preview (Vercel) | [https://transitops-odoo.vercel.app/](https://transitops-odoo.vercel.app/) — **no live Postgres** |
| Full stack + database | Local — Express `:3000` + PostgreSQL `transitops01` |
| Design mockup | [Excalidraw](https://link.excalidraw.com/l/65VNwvy7c4X/1FHGDNgD2td) |
| Local frontend | `http://127.0.0.1:5173` |
| Local API | `http://localhost:3000` |

### Demo users

| Role | Email | Password | Landing |
|---|---|---|---|
| Fleet Manager | `fleet@transitops.demo` | `Transit@123` | `/fleet` |
| Dispatcher | `dispatch@transitops.demo` | `Transit@123` | `/dashboard` |
| Safety Officer | `safety@transitops.demo` | `Transit@123` | `/drivers` |
| Financial Analyst | `finance@transitops.demo` | `Transit@123` | `/expenses` |

Login also locks after **5 failed attempts** (per email).

---

## 4. Features & Deliverables

### Mandatory

| # | Feature | Status |
|---:|---|:---:|
| 01 | Email/password login + role selection | ✅ |
| 02 | RBAC across Fleet, Drivers, Trips, Expenses, Analytics | ✅ |
| 03 | Dashboard with 7 KPIs + filters | ✅ |
| 04 | Vehicle registry (unique `regNo`) | ✅ |
| 05 | Driver profiles + safety / license | ✅ |
| 06 | Trip lifecycle Draft → Dispatched → Completed / Cancelled | ✅ |
| 07 | Capacity, availability, license validations | ✅ |
| 08 | Automatic vehicle/driver status transitions | ✅ |
| 09 | Maintenance → In Shop (hidden from dispatch) | ✅ |
| 10 | Fuel logs + expenses + auto op cost | ✅ |
| 11 | Analytics charts + ROI | ✅ |
| 12 | CSV export | ✅ |

### Bonus

| # | Feature | Status |
|---:|---|:---:|
| B1 | PDF export (jsPDF) | ✅ |
| B2 | Dark mode | ✅ |
| B3 | License expiry alerts (≤ 30 days) | ✅ |
| B4 | Vehicle document column | ✅ |
| B5 | Search / filters / sorting | ✅ |
| B6 | Live editable RBAC matrix | ✅ |
| B7 | Account lockout (5 fails) | ✅ |

---

## 5. Technology Stack

<div align="center">
<img src="https://skillicons.dev/icons?i=react,ts,vite,tailwind,nodejs,express,postgres,prisma,vercel&theme=dark" alt="Stack icons"/>
</div>

<br/>

<div align="center">

<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
<img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TS"/>
<img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
<img src="https://img.shields.io/badge/Tailwind-4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind"/>
<img src="https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express"/>
<img src="https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma"/>
<img src="https://img.shields.io/badge/PostgreSQL-Local-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="Postgres"/>

</div>

### Frontend

| Layer | Technology |
|---|---|
| UI | React 19 |
| Bundler | Vite 8 (`/api` proxy → Express) |
| Routing | React Router 7 |
| Styling | Tailwind CSS 4 + Radix / shadcn UI |
| State | Zustand (+ persist for auth) |
| Charts | Recharts |
| Exports | CSV helper · jsPDF + autotable |
| Icons / toasts | Lucide · Sonner |

### Backend

| Layer | Technology |
|---|---|
| Runtime | Node.js + tsx |
| HTTP | Express 5 |
| ORM | Prisma 6 + `@prisma/adapter-pg` |
| Database | PostgreSQL (**local** `transitops01`) |
| Config | dotenv · CORS |

### Deploy

| Target | What runs there |
|---|---|
| **Vercel** | Frontend UI preview only |
| **Local** | Express API + PostgreSQL (required for real data) |

---

## 6. Architecture

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Users_%E2%86%92_Client_%E2%86%92_API_%E2%86%92_Local_DB-6D28D9?style=for-the-badge" alt="Architecture"/>
</p>

Full system view — RBAC users, React client, Express business rules, and **local PostgreSQL** (explicitly not on Vercel):

<p align="center">
  <img src="./public/architecturediagram.png" alt="TransitOps Architecture Diagram" width="100%"/>
</p>

### Layer summary

| Layer | Contents |
|---|---|
| Users (RBAC) | Fleet Manager · Dispatcher · Safety Officer · Financial Analyst |
| Client | Responsive web · React 19 + Vite · Zustand · Recharts · jsPDF · Tailwind |
| Backend | Auth · RBAC gates · Vehicle / Driver / Trip / Maintenance / Fuel / Expense / Analytics APIs |
| Rules engine | Capacity · license · availability · auto status · Prisma `$transaction` |
| Database | Local PostgreSQL `transitops01` · 7 entities |

### Request flow (text)

```text
Browser (React + Zustand)
        │  HTTP JSON  /api/*
        ▼
Express (validations + $transaction)
        │  Prisma
        ▼
PostgreSQL · transitops01   ← local only
```

### Dispatch lifecycle (API)

```text
Create / Dispatch
  → validate Available + capacity + license
  → $transaction: trip Dispatched, vehicle+driver OnTrip

Complete
  → final odo > start · write FuelLog
  → vehicle+driver Available · odometer updated

Cancel
  → Cancelled + reason
  → restore Available (unless vehicle InShop)

Maintenance open → InShop (hidden from dispatch)
Maintenance close → Available (unless Retired)
```

---

## 7. Repository Structure

```text
TransitOps-Odoo/
├── public/
│   ├── architecturediagram.png
│   ├── dispatch_dashboard.png
│   ├── dispatch_trip.png
│   ├── fleet.png
│   ├── maintainance_dashboard.png
│   ├── Expense_dashboard.png
│   ├── finance_analytics.png
│   ├── vehicle_db.png
│   ├── trip_db.png
│   ├── maintaince_db.png
│   └── expense.png
├── prisma/schema.prisma
├── server/
│   ├── index.ts          # REST API + rules
│   └── seed.ts
├── src/
│   ├── App.tsx
│   ├── components/       # app-shell, kpi-card, ui/*
│   ├── lib/              # store, rbac, types, csv, pdf, mock-data
│   ├── routes/           # login + module pages
│   └── services/
├── vite.config.ts
└── package.json
```

---

## 8. Authentication

```text
/login  →  POST /api/login { email, password, role }
        →  match User  →  Zustand persist (transitops-auth)
        →  redirect by role
```

| Topic | Behavior |
|---|---|
| Gate | `_app.tsx` redirects unauthenticated users to `/login` |
| Role check | Email + password + **selected role** must match |
| Lockout | 5 failed attempts → locked for that email |
| Session | Client persist (hackathon demo scope) |

---

## 9. RBAC Matrix

| Module | Fleet Manager | Dispatcher | Safety Officer | Financial Analyst |
|---|:---:|:---:|:---:|:---:|
| Fleet / Maintenance | full | view | — | view |
| Drivers | full | — | full | — |
| Trips | full | full | view | — |
| Expenses | full | — | — | full |
| Analytics | full | — | — | full |

| Access | UI behavior |
|---|---|
| `full` | View + create / update |
| `view` | Read-only · **VIEW** badge · mutate actions hidden |
| `none` / — | Module hidden from sidebar |

Settings includes a **live editable RBAC matrix** for demos.

---

## 10. Modules (UI)

```text
Login → Dashboard → Fleet → Drivers → Trips → Maintenance → Expenses → Analytics → Settings
```

### 10.1 Operations Dashboard

**Route:** `/dashboard` · **Persona:** Dispatcher

<p align="center">
  <img src="./public/dispatch_dashboard.png" alt="Operations Dashboard" width="92%"/>
</p>

| KPI | Source |
|---|---|
| Active Vehicles | Non-retired (after filters) |
| Available | `Available` |
| In Maintenance | `InShop` |
| Active Trips | `Dispatched` |
| Pending Trips | `Draft` |
| Drivers on Duty | Drivers `OnTrip` |
| Fleet Utilization % | OnTrip / Active × 100 |

Filters: Vehicle Type · Status · Region. Also shows Recent Trips + Vehicle Status bars.

---

### 10.2 Vehicle Registry (Fleet)

**Route:** `/fleet` · **Persona:** Fleet Manager (Dispatcher = view)

<p align="center">
  <img src="./public/fleet.png" alt="Vehicle Registry" width="92%"/>
</p>

| Field | Notes |
|---|---|
| Registration No. | **Unique** |
| Name / Model · Type | Van / Truck / Mini |
| Capacity · Odometer · Acq. Cost | kg · km · ₹ |
| Status | Available · OnTrip · InShop · Retired |
| Docs | Document attach column (bonus) |

Retired / In Shop vehicles are **hidden from Trip Dispatcher**.

---

### 10.3 Drivers & Safety

**Route:** `/drivers` · **Persona:** Safety Officer

| Field | Notes |
|---|---|
| Name · License No. · Category | LMV / HMV |
| License Expiry | Blocks dispatch if expired |
| Contact · Safety Score | Excellent / Good / Fair / Poor badges |
| Status | Available · OnTrip · OffDuty · Suspended |

Bell alerts for licenses expired or expiring within **30 days**. Seed includes **John** (expired + Suspended) for negative demos.

---

### 10.4 Trip Dispatcher

**Route:** `/trips` · **Persona:** Dispatcher

<p align="center">
  <img src="./public/dispatch_trip.png" alt="Trip Dispatcher" width="92%"/>
</p>

```text
Draft ──► Dispatched ──► Completed
              │
              └──► Cancelled
```

| Form field | Behavior |
|---|---|
| Source / Destination | Route |
| Vehicle | **Available only** |
| Driver | **Available + non-expired license** |
| Cargo Weight | Live over-capacity warning |
| Planned Distance | Planning input |

Live Board: search · status filter · Complete (odo + fuel) · Cancel (reason).

---

### 10.5 Maintenance

**Route:** `/maintenance`

<p align="center">
  <img src="./public/maintainance_dashboard.png" alt="Maintenance" width="92%"/>
</p>

```text
Available → In Shop → Available
```

| Action | Effect |
|---|---|
| Log with `InShop` | Vehicle → InShop · removed from dispatch pool |
| Close log | Completed · Available if no other open shop logs |
| Vehicle OnTrip | Create maintenance **rejected** |

---

### 10.6 Fuel & Expenses

**Route:** `/expenses` · **Persona:** Financial Analyst

<p align="center">
  <img src="./public/Expense_dashboard.png" alt="Fuel & Expenses" width="92%"/>
</p>

| Block | Contents |
|---|---|
| Fuel Logs | Vehicle · date · liters · cost (also auto on trip complete) |
| Other Expenses | Trip · toll · other · linked maint · total · Pending/Approved |
| Summary | **TOTAL OPERATIONAL COST = FUEL + MAINT** |
| Export | CSV + PDF |

---

### 10.7 Reports & Analytics

**Route:** `/analytics` · **Persona:** Financial Analyst

<p align="center">
  <img src="./public/finance_analytics.png" alt="Analytics" width="92%"/>
</p>

KPI strip: Fuel Efficiency · Fleet Utilization · Operational Cost · Vehicle ROI  
Charts: Monthly Revenue · Top Costliest Vehicles · CSV export

---

### 10.8 Settings

Depot identity (e.g. Gandhinagar Depot GJ4) · currency / units · **Live RBAC Matrix**.

---

## 11. Database Design

> All entities live in **local** PostgreSQL `transitops01`. Vercel does not host this database.

### Entities (7)

| Entity | Purpose |
|---|---|
| `User` | Auth + RBAC role |
| `Vehicle` | Fleet master |
| `Driver` | Profiles & compliance |
| `Trip` | Dispatch lifecycle |
| `MaintenanceLog` | Service / shop |
| `FuelLog` | Fuel liters & cost |
| `Expense` | Toll / misc / linked maint |

### Enums

| Enum | Values |
|---|---|
| `VehicleStatus` | Available · OnTrip · InShop · Retired |
| `DriverStatus` | Available · OnTrip · OffDuty · Suspended |
| `TripStatus` | Draft · Dispatched · Completed · Cancelled |
| `Role` | FleetManager · Dispatcher · SafetyOfficer · FinancialAnalyst |
| `MaintenanceStatus` | InShop · Completed |
| `ExpenseStatus` | Pending · Approved |

### Relations

```text
Vehicle (1) ──< Trip >── (1) Driver
   │              └──< Expense
   ├──< MaintenanceLog
   ├──< FuelLog
   └──< Expense
```

### Key fields

| Model | Important columns |
|---|---|
| Vehicle | `regNo` (unique), `maxCapacityKg`, `odometerKm`, `acquisitionCost`, `status` |
| Driver | `licenseNo` (unique), `licenseExpiry`, `safetyScore`, `status` |
| Trip | `cargoWeightKg`, distances, `fuelConsumedL`, `status`, FKs |
| Expense | `toll` + `other` + `maintenanceLinkedCost` → `total` |

---

## 12. Database Screenshots

Captured from **local pgAdmin** against `transitops01` (not Vercel).

### Vehicle

<p align="center"><img src="./public/vehicle_db.png" alt="Vehicle table" width="92%"/></p>

### Trip

<p align="center"><img src="./public/trip_db.png" alt="Trip table" width="92%"/></p>

### MaintenanceLog · Expense (side by side)

<table>
  <tr>
    <td width="50%" align="center">
      <b>MaintenanceLog</b><br/>
      <img src="./public/maintaince_db.png" alt="MaintenanceLog"/>
    </td>
    <td width="50%" align="center">
      <b>Expense</b><br/>
      <img src="./public/expense.png" alt="Expense"/>
    </td>
  </tr>
</table>

---

## 13. Business Rules

| # | Rule | Enforcement |
|---|---|---|
| BR-01 | Unique vehicle registration | Prisma `@unique` + API error |
| BR-02 | Retired / InShop never in dispatch | UI filter + API reject |
| BR-03 | Expired license / Suspended cannot assign | UI filter + API check |
| BR-04 | OnTrip vehicle/driver cannot re-assign | Only `Available` accepted |
| BR-05 | Cargo ≤ max capacity | Live warning + API reject |
| BR-06 | Dispatch → both OnTrip | `$transaction` |
| BR-07 | Complete → both Available | Complete endpoint |
| BR-08 | Cancel dispatched → Available* | Cancel endpoint |
| BR-09 | Active maintenance → InShop | Maintenance create |
| BR-10 | Close maintenance → Available (not Retired) | Close + open-log check |

\* Unless vehicle is already `InShop`.

---

## 14. Workflows

### Status machines

**Vehicle**

```text
Available ◄──► OnTrip
    │
    └──► InShop ──► Available
Retired (terminal from registry)
```

**Driver**

```text
Available ◄──► OnTrip
OffDuty · Suspended  (blocked from dispatch)
```

**Trip**

```text
Draft → Dispatched → Completed
          └──► Cancelled
```

### 9-step example (hackathon brief)

| Step | Action | Result |
|---:|---|---|
| 1 | Register van, max 500 kg, Available | In registry |
| 2 | Register Alex, valid license | Eligible |
| 3 | Trip cargo 450 kg | Form accepts |
| 4 | Validate 450 ≤ 500 | Dispatch OK |
| 5 | Dispatch | Both → OnTrip |
| 6 | Complete (odo + fuel) | FuelLog written |
| 7 | Status restore | Both → Available |
| 8 | Oil Change maintenance | Vehicle → InShop (hidden) |
| 9 | Reports | Cost & efficiency update |

### Negative paths (demo these)

| Path | Demo | Expected |
|---|---|---|
| Capacity | Cargo 700 kg on 500 kg van | Blocked |
| Eligibility | Open driver dropdown | John missing |
| RBAC | Dispatcher → Fleet | Add Vehicle hidden |

---

## 15. API Reference

Base (local): `http://localhost:3000` · Vite proxies `/api` → Express.

| Area | Methods |
|---|---|
| Auth | `POST /api/login` |
| Vehicles | `GET/POST /api/vehicles` · `PUT /api/vehicles/:id/status` |
| Drivers | `GET/POST /api/drivers` · `PUT /api/drivers/:id/status` |
| Trips | `GET/POST /api/trips` · `POST .../dispatch` · `.../complete` · `.../cancel` |
| Maintenance | `GET/POST /api/maintenance` · `POST .../close` |
| Fuel | `GET/POST /api/fuel` |
| Expenses | `GET/POST /api/expenses` (auto `total`) |

### Complete body

```json
{ "finalOdo": 74120, "fuelL": 12.5, "fuelCost": 1250 }
```

### Frontend state

| Store | Role |
|---|---|
| `useAuth` | Session (persisted) |
| `useData` | Vehicles, drivers, trips, maintenance, fuel, expenses, RBAC matrix |

`loadData()` refreshes all entities after multi-entity mutations (dispatch, complete, cancel, maintenance).

---

## 16. Analytics Formulas

| Metric | Formula |
|---|---|
| Fuel efficiency | Completed distance ÷ fuel liters (km/l) |
| Fleet utilization | OnTrip ÷ Active (non-Retired) × 100 |
| Operational cost | Σ Fuel cost + Σ Maintenance cost |
| Vehicle ROI | `(Revenue − (Maintenance + Fuel)) / Acquisition Cost` |

Demo revenue approximation: `completedTrips × ₹12,500`.

Exports: **CSV** across modules · **PDF** on Fuel & Expenses (`src/lib/csv.ts`, `src/lib/pdf.ts`).

---

## 17. Setup (Local)

### Prerequisites

- Node.js 18+  
- Local PostgreSQL with database `transitops01`

### Commands

```bash
cd TransitOps-Odoo
npm install

# .env
# DATABASE_URL=postgresql://USER:PASS@localhost:5432/transitops01
# PORT=3000

npx prisma generate
npx prisma db push
npx tsx server/seed.ts
npm run dev
```

| Script | Purpose |
|---|---|
| `npm run dev` | Vite `:5173` + Express `:3000` |
| `npm run build` | Production frontend build |
| `npm run lint` / `format` | ESLint / Prettier |

### Environment

| Variable | Example |
|---|---|
| `DATABASE_URL` | `postgresql://user:pass@localhost:5432/transitops01` |
| `PORT` | `3000` |

### Vercel note

[transitops-odoo.vercel.app](https://transitops-odoo.vercel.app/) hosts the **UI preview** only.  
CRUD, transactions, seed data, and pgAdmin screenshots require the **local** stack above.

### Seed snapshot

| Vehicles | Drivers | Trips |
|---|---|---|
| Tata Ace (Available) · Dost/Eicher (OnTrip) · Bolero (InShop) · Super Carry (Retired) | Alex Available · John Suspended/expired · Priya OnTrip · Suresh OffDuty | TR001 Dispatched · TR002 Draft · TR003 Completed · TR006 Cancelled |

---

## 18. Judge Walkthrough

> Prefer **local full stack** for this path. Use Vercel only for a quick UI tour.

| Min | Action |
|---:|---|
| 1 | Login Fleet Manager → registry + Settings RBAC matrix |
| 2 | Drivers → Alex vs John (compliance) |
| 3 | Login Dispatcher → Dashboard KPIs + filters |
| 4 | Trips → create within capacity → Dispatch → Complete |
| 5 | Maintenance → InShop → vehicle missing from picker |
| 6 | Login Finance → Expenses op cost + Analytics ROI |
| 7 | Show 3 negative paths (capacity · John · RBAC) |

### Quick test checklist

| ID | Check |
|---|---|
| T01 | Each role lands correctly / sidebar matches matrix |
| T02 | Duplicate `regNo` fails |
| T03 | Dispatch → both OnTrip |
| T04 | Over capacity rejected |
| T05 | Complete → Available + FuelLog |
| T06 | Maintenance hides vehicle |
| T07 | CSV / PDF download |
| T08 | Dark mode persists |

---

### Design tokens (quick)

| Token | Use |
|---|---|
| Purple `#6D28D9` → Cyan `#06B6D4` | Brand gradient |
| Green / Blue / Amber / Red | Available · OnTrip · InShop · Retired/Cancelled |
| Glass topbar · dashed-route accents | Control Tower shell |

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:06B6D4,50:7C3AED,100:6D28D9&height=130&section=footer&text=TransitOps%20Control%20Tower&fontSize=26&fontColor=ffffff&animation=twinkling&fontAlignY=70" width="100%" alt="Footer"/>

<br/>

**TransitOps** — Smart Transport Operations Platform  
Odoo Hackathon · [UI Preview](https://transitops-odoo.vercel.app/) · Full DB locally

<br/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=14&duration=3800&pause=1000&color=A78BFA&center=true&vCenter=true&width=560&lines=UI+on+Vercel+%C2%B7+Postgres+%2B+API+on+localhost;Rules+enforced.+Insights+delivered." alt="Footer typing"/>

</div>
