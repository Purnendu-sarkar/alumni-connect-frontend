# AlumniConnect Frontend — Next.js 16 App Router & Institutional UI Suite

[![Next.js Version](https://img.shields.io/badge/Next.js-16.3.4_(Turbopack)-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React Version](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-FF4154?logo=reactquery&logoColor=white)](https://tanstack.com/query/latest)
[![Zustand](https://img.shields.io/badge/State-Zustand-443E38?logo=react&logoColor=white)](https://zustand-demo.pmnd.rs/)
[![Radix UI](https://img.shields.io/badge/Primitives-Radix_UI-161618?logo=radixui&logoColor=white)](https://www.radix-ui.com/)
[![Socket.io Client](https://img.shields.io/badge/Socket.io_Client-4.8-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 1. Executive Overview

**AlumniConnect Frontend** is the official, academic-grade web client engineered exclusively for **North Western University (NWU), Khulna, Bangladesh (`nwu.ac.bd`)**.

Built on **Next.js 16 (App Router)** and **React 19**, the client delivers a privacy-first, role-governed digital campus experience connecting university students, verified alumni, academic moderators, and institutional administrators.

### Core Engineering Guarantees
- **100% Live Telemetry (Zero Mock Data):** All public showcases, dynamic KPI metrics, and directory listings query live PostgreSQL (Neon) and Upstash Redis APIs. Fallback demo arrays (`demoAlumni`, `demoJobs`) have been completely purged from the codebase.
- **165 App Router Routes:** Complete route matrix comprising 11 public discovery routes, 6 authentication routes, and 4 strictly isolated role workspaces.
- **Single-University Scope:** Bound directly to North Western University (`slug: north-western-university`). Multi-tenancy, cross-university switching, and commercial SaaS monetization are deliberately excluded.

---

## 2. Institutional Design System & Identity

The user interface follows the official North Western University design guidelines (`docs/design-system.md`):

```
┌────────────────────────────────────────────────────────────────────────┐
│ PRIMARY BRAND IDENTITY: North Western University (NWU, Khulna)         │
│ • Navy Trust:    #0B1F3A  (Deep corporate authority & header bars)     │
│ • Royal Blue:    #2563EB  (Action CTAs, links, and active badges)      │
│ • Slate Neutral: #F8FAFC - #0F172A (Crisp accessible UI contrast)      │
│ • Emerald Brand: #10B981  (Active mentorship & verification badges)    │
│ • Typography:    Inter (font-sans) across all UI typography            │
└────────────────────────────────────────────────────────────────────────┘
```

- **Accessibility:** Built on headless [Radix UI](https://www.radix-ui.com/) primitives ensuring WCAG 2.1 AA contrast compliance, keyboard navigability (`Tab`, `Esc`, focus trapping), and screen reader accessibility (`aria-*` labels).
- **Hardware-Accelerated Motion:** CSS-driven hardware-accelerated animations (`animate-float`, `animate-pulse-glow`, smooth accordion state transitions) avoiding runtime JavaScript frame drops.
- **Sanitized Rich Text:** All job descriptions, stories, and event agendas pass through DOMPurify via `<SanitizedRichText />` to guarantee zero cross-site scripting (XSS) injection.

---

## 3. Core Architectural Highlights

```
                                  [ Incoming Client Navigation ]
                                                │
                                                ▼
                   ┌─────────────────────────────────────────────────────────┐
                   │ NEXT.JS 16 EDGE PROXY (proxy.ts Matcher)                │
                   │ • Detail Auth Gate: Blocks unauthenticated visitors     │
                   │ • Role-Aware Workspace Directing (/student, /alumni, etc│
                   └────────────────────────────┬────────────────────────────┘
                                                │
                                                ▼
                   ┌─────────────────────────────────────────────────────────┐
                   │ ROLE-ISOLATED DASHBOARD SHELLS                          │
                   │ • Shell-STU: Student Career & Mentorship Desk           │
                   │ • Shell-ALU: Alumni Recruitment & Mentee Workspace      │
                   │ • Shell-MOD: Moderator Content & Screening Console      │
                   │ • Shell-ADM: Super Admin Governance & Department Matrix │
                   └────────────────────────────┬────────────────────────────┘
                                                │
                                                ▼
                   ┌─────────────────────────────────────────────────────────┐
                   │ DATA & STATE CLIENT LAYER                               │
                   │ • TanStack Query: Scoped caching [roleScope, resource]  │
                   │ • Zustand AuthStore: Client session & token management  │
                   │ • Single-Flight 401 Interceptor: Zero logout bouncing   │
                   │ • Socket.io Client: Realtime chat, typing, & presence   │
                   └─────────────────────────────────────────────────────────┘
```

1. **Strict 4-Role Workspace Isolation:**
   - Dedicated shell layouts (`Shell-STU`, `Shell-ALU`, `Shell-MOD`, `Shell-ADM`) prevent cross-role data leaks or navigation confusion.
   - Server-side redirect handlers (`/dashboard` and `/admin`) resolve users dynamically to their role home.
2. **Edge-Gated Authentication & Public Detail Routing (`proxy.ts`):**
   - Public visitors can freely explore list showcases (`/`, `/jobs`, `/events`, `/announcements`, `/stories`, `/giving`).
   - When an unauthenticated visitor attempts to view any detail route (`/jobs/:slug`, `/events/:id`, `/announcements/:id`, `/stories/:id`), `proxy.ts` intercepts the request, redirects them to `/login?returnTo=...`, and upon authentication, routes them directly to their role-prefixed workspace view.
3. **Single-Flight 401 Interceptor:**
   - In `lib/api/client.ts`, parallel network requests receiving a `401 Unauthorized` share a single in-flight refresh promise (`activeRefreshPromise`).
   - Prevents duplicate refresh requests and race conditions, guaranteeing seamless token renewal with zero session loss or redirect bounce loops.
4. **300ms Debounced Directory Search:**
   - Custom `useDebounce` hook buffers directory text queries for 300ms, minimizing network bandwidth and eliminating unnecessary backend Redis cache invalidations.
5. **Real-Time Presence & Direct Chat Client:**
   - Socket.io client manages WebSocket connections, automatically subscribes to personal rooms, tracks online alumni presence, and streams real-time message notifications without page reloads.

---

## 4. Tech Stack Table

| Domain | Technology | Version | Purpose |
| :--- | :--- | :---: | :--- |
| **Framework** | Next.js (App Router) | `16.3.4` | Server Components, dynamic route matching, and Turbopack compiler |
| **Library** | React | `19.2.0` | Declarative component UI and concurrent rendering |
| **Language** | TypeScript | `5.9.3` | End-to-end type safety, interfaces, and DTO contracts |
| **Styling** | Tailwind CSS | `v4.2.0` | Utility-first CSS, custom color tokens, and responsive utilities |
| **UI Primitives** | Radix UI | Latest | Accessible headless dialogs, dropdowns, tabs, and popovers |
| **Icons** | Lucide React | `1.16.0` | Crisp SVG iconography matching institutional themes |
| **Server Cache** | TanStack Query | `v5.90.21` | Role-scoped cache keys `[roleScope, resource, params]`, stale-time sync |
| **Client Store** | Zustand | `5.0.12` | In-memory authentication state and session persistence |
| **Forms & Validation**| React Hook Form & Zod | `7.71.2` / `3.24.2` | High-performance uncontrolled form state and validation |
| **Sanitization** | DOMPurify | `3.3.1` | Client-side HTML sanitization preventing XSS attacks |
| **Realtime** | Socket.io Client | `4.8.3` | Live WebSocket client for notifications, presence, and chat |

---

## 5. Project Directory Structure

```
alumni-connect-frontend/
├── app/
│   ├── (auth)/                   # Authentication route group (6 routes)
│   │   ├── login/                # Sign-in portal with Quick Role Access
│   │   ├── register/             # 3-step institutional registration wizard
│   │   ├── forgot-password/      # Password recovery initiation
│   │   ├── reset-password/       # Secure token-based password reset
│   │   ├── setup-account/        # Invited faculty/moderator setup
│   │   └── verify-email/         # Email verification confirmation
│   ├── (public)/                 # Public discovery showcase (11 routes)
│   │   ├── announcements/        # Public campus notices
│   │   ├── events/               # University events and seminar listings
│   │   ├── giving/               # Department endowment and scholarship funds
│   │   ├── jobs/                 # Public career opportunity board
│   │   ├── mentorship/           # Mentorship overview and alumni spotlight
│   │   ├── stories/              # Alumni career success stories
│   │   └── page.tsx              # High-impact root landing page with NWU metrics
│   ├── admin/                    # Super Admin workspace (Shell-ADM - 44 routes)
│   ├── alumni/                   # Alumni workspace (Shell-ALU - 37 routes)
│   ├── moderator/                # Faculty Moderator workspace (Shell-MOD - 25 routes)
│   ├── student/                  # Student workspace (Shell-STU - 29 routes)
│   ├── layout.tsx                # Root layout with font optimization & QueryProvider
│   └── not-found.tsx             # Contextual 404 error boundary
├── components/
│   ├── dashboard/                # Shared dashboard shells, headers, sidebars, badges
│   ├── layout/                   # Global Navbar, Footer, Brand identity, Wave dividers
│   ├── ui/                       # Reusable Radix/shadcn components (Button, Dialog, etc.)
│   └── shared/                   # Sanitized rich text and media components
├── features/                     # Feature-specific views (directory, jobs, mentorship)
├── hooks/                        # Custom hooks (useDebounce, useSocket, useAuth)
├── lib/
│   ├── api/                      # Typed REST clients (client, auth, directory, mentorship)
│   └── socket/                   # Socket.io connection manager and lifecycle handlers
├── store/                        # Zustand stores (auth-store, socket-store)
├── styles/                       # Tailwind v4 globals and typography styles
├── proxy.ts                      # Next.js 16 Edge proxy, detail auth gates, and redirects
├── next.config.ts                # Next.js configuration and image CDN domains
└── package.json                  # Scripts and dependencies
```

---

## 6. Prerequisites & Installation

### Prerequisites
- **Node.js:** `>= 20.10.0 LTS`
- **npm:** `>= 10.0.0`
- **Backend API:** An active [AlumniConnect Backend](https://github.com/Purnendu-sarkar/alumni-connect-backend) instance running on `http://localhost:5001`.

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Purnendu-sarkar/alumni-connect-frontend.git
   cd alumni-connect-frontend
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure local environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Verify that `.env.local` contains:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
   NEXT_PUBLIC_TENANT_DOMAIN=nwu.ac.bd
   NEXT_PUBLIC_UNIVERSITY_SLUG=north-western-university
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   ```

---

## 7. Running Locally (Port 3001)

The frontend is explicitly configured to launch on **Port 3001** to avoid port collisions with the backend (Port 5001) or other local dev services:

```bash
npm run dev
```

Open your browser and navigate to:
**`http://localhost:3001`**

*(Note: Verify that the backend is running on `http://localhost:5001` so live data, authentication, and WebSocket presence connect seamlessly).*

---

## 8. Production Build & Quality Verification

```bash
# Compile optimized Next.js production build (Turbopack)
npm run build

# Validate TypeScript type integrity (0 errors across 165 routes)
npm run typecheck

# Execute ESLint validation
npm run lint

# Check code formatting with Prettier
npm run format:check
```

---

## 9. Route Hierarchy & 4-Role Workspace Matrix

| Workspace / Group | Route Prefix | Route Count | Primary Functional Responsibilities |
| :--- | :--- | :---: | :--- |
| **Public Discovery** | `app/(public)/*` | **11** | Landing hero, NWU live telemetry, public job board, events, stories, giving, and mentorship overview. |
| **Authentication** | `app/(auth)/*` | **6** | 3-step registration wizard, login with Quick Role Access, email verification, password reset, and account setup. |
| **Student Workspace** | `app/student/*`<br>`(Shell-STU)` | **29** | Career tracking, job applications, alumni directory search, mentorship proposal pipeline, and connections console. |
| **Alumni Workspace** | `app/alumni/*`<br>`(Shell-ALU)` | **37** | Job postings, candidate applicant review, mentorship workspace, active mentees desk, and alumni networking. |
| **Moderator Workspace**| `app/moderator/*`<br>`(Shell-MOD)` | **25** | Job opportunity screening, user report investigations, content moderation, and event queues. |
| **Super Admin** | `app/admin/*`<br>`(Shell-ADM)` | **44** | Alumni degree verification queue, centralized department management with Safe Delete, user roles, and forensic audit logs. |

---

## 10. Showcase Quick Role Access Profiles

For academic demonstrations, lab defenses, and grading evaluations, the `/login` portal includes a **Quick Role Access** showcase bar enabling instant, one-click authentication into any canonical role:

| Role | Canonical Profile Name | Subtitle / Focus Area | Automated Landing Route |
| :--- | :--- | :--- | :--- |
| **`STUDENT`** | **Soumya Miah** | CSE '22 &middot; 8th Semester Undergraduate | `/student/dashboard` |
| **`ALUMNI`** | **Arif Gazi** | BBA '16 &middot; HRBP at Therap | `/alumni/dashboard` |
| **`MODERATOR`** | **Kazi Moinul Islam** | CSE Faculty & Academic Moderator | `/moderator/dashboard` |
| **`SUPER_ADMIN`** | **Platform Super Admin** | Institutional Governance & System Settings | `/admin/dashboard` |

*(Quick Access sessions automatically initialize authentication cookies, synchronize with Zustand, and direct the browser into the corresponding workspace shell with zero password entry required).*

---

## 11. Repository & Contributors

**GitHub Repository:** [https://github.com/Purnendu-sarkar/alumni-connect-frontend](https://github.com/Purnendu-sarkar/alumni-connect-frontend)

### Core Engineering Team
- **Purnendu Sarkar** (`Purnendu-sarkar`) — Lead Full-Stack Software Engineer & Next.js App Router Architect
- **Aishwarya Roy** (`riyaroy123456`) — Core Features, Privacy UI & Directory Architect
- **Jannatul Adon** (`jannatuladon148-ctrl`) — Auth Flow, Radix/shadcn UI Foundation & Shell Architect

**Institutional Partner:** Department of Computer Science & Engineering, North Western University (NWU), Khulna, Bangladesh.

---

## 12. License

This project is licensed under the [MIT License](LICENSE).
