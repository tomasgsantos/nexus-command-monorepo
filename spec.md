# spec.md — Project Nexus: Full Specification

## Overview

Project Nexus is a high-end, high-performance project management ecosystem for elite B2B consultants. It is a Universal Monorepo (Web + Mobile) designed to showcase complex engineering integrations with a focus on **Perceived Performance** and **User Delight**.

The aesthetic direction is **The Obsidian Lens** — a precision instrument, not a SaaS product. Every interaction should feel like operating a command center. See `DESIGN.md` for the full design system.

---

## Monorepo Structure

**Repo:** `https://github.com/tomasgsantos/nexus-command-monorepo`  
**Package manager:** Yarn workspaces + Turborepo  
**Deployed at:** `https://tomasgsantos.github.io/nexus-command-monorepo/`

```
nexus-command-monorepo/
├── .github/
│   └── workflows/
│       └── deploy-web.yml     # ← EXISTS. Do not modify. Deploys on push to main.
├── apps/
│   ├── web/                   # ← EXISTS. Vite + React + TS. Do not reinitialise.
│   ├── mobile/                # ← TO BE CREATED. Expo (@nexus/mobile)
│   └── api/                   # ← TO BE CREATED. Shared logic & types (@nexus/api)
├── packages/
│   └── ui/                    # ← TO BE CREATED. PostCSS tokens (@nexus/ui)
├── supabase/
│   ├── migrations/            # ← TO BE CREATED.
│   └── functions/             # ← TO BE CREATED.
├── CLAUDE.md
├── spec.md
├── DESIGN.md
└── README.md                  # ← EXISTS.
```

### Deployment Pipeline & Branching
- Trigger: push to `main` affecting `apps/web/**`
- Build: `yarn web:build`
- The `vite.config.ts` base path is `/nexus-command-monorepo/` — never change this
- **Agents never push to `main`**. All work branches off `dev`. The user reviews and merges to `main`.
- Branch naming: `feature/<epic-name>`, `fix/<description>`, `chore/<description>`

---

## Login Page — Full Redesign

The existing login page in `apps/web` must be fully replaced. The Obsidian Lens design system applies here without exception.

**Requirements:**
- Full-screen obsidian background (`--color-surface-lowest`)
- Centered glassmorphism card (`--color-surface-variant` at 40% opacity, `backdrop-filter: blur(12px)`)
- Space Grotesk headline, Sora body/labels
- Email/password fields using the input pattern from DESIGN.md (bottom-border only, primary highlight on focus)
- Primary "Sign In" button (flat `--color-primary`, 4px radius)
- Prominent **"Enter Demo"** ghost button or secondary CTA — one click, no credentials, immediately authenticates as `demo` role
- Supabase Auth wired up for email/password
- RBAC role loaded from `profiles` table on successful auth
- Redirect to main dashboard post-login
- Framer Motion entrance animation on the card (staggered: background fades, card slides up, fields stagger in)

**Key files:**
- `apps/web/src/features/auth/LoginPage.tsx`
- `apps/web/src/features/auth/hooks/use-auth.ts`
- `apps/web/src/features/auth/hooks/use-demo-login.ts`

---

## Auth & Access Control

### RBAC Roles
| Role | Access |
|---|---|
| `admin` | Full read/write across all projects and users |
| `consultant` | Read/write on assigned projects only |
| `viewer` | Read-only on assigned projects |
| `demo` | Read-only on all seeded sample data, no writes |

### Demo Login
- One-click login, no credentials required
- Loads a pre-seeded dataset covering all 5 epics
- Must be available at the login screen as a prominent CTA
- No environment secrets required from the user

---

## Epic 1: Pulse Dashboard

**Purpose:** A real-time global overview of all active projects.

**Features:**
- Mapbox GL JS map with project nodes plotted by location
- Each node displays project health indicator (On-Track / At-Risk / Failing)
- Supabase Realtime activity feed — live updates without page refresh
- "The Pulse" indicator component (4px glowing dot) next to live data
- Node click opens a floating glassmorphism panel with project summary
- KPI cards use Editorial Offsets — critical metrics break the grid alignment of secondary data

**Key Files (Frontend Dev):**
- `apps/web/src/features/pulse/`
- `apps/web/src/features/pulse/PulseDashboard.tsx`
- `apps/web/src/features/pulse/hooks/use-realtime-feed.ts`
- `apps/web/src/features/pulse/components/ProjectNode.tsx`
- `apps/web/src/features/pulse/components/PulseIndicator.tsx`

**Key Files (Backend Dev):**
- `supabase/migrations/` — projects table with lat/lng, health status
- `apps/api/src/projects/` — project queries, realtime subscriptions

---

## Epic 2: Enterprise Scheduler

**Purpose:** A professional calendar with CalDAV interoperability.

**Features:**
- React FullCalendar as the base component
- CalDAV protocol implementation for external calendar sync
- `.ics` file formatting and export
- Event creation with project tagging
- Drag-and-drop rescheduling
- Week/Month/Agenda views

**Key Files (Frontend Dev):**
- `apps/web/src/features/scheduler/`
- `apps/web/src/features/scheduler/EnterpriseScheduler.tsx`
- `apps/web/src/features/scheduler/hooks/use-caldav-sync.ts`
- `apps/web/src/features/scheduler/utils/ics-formatter.ts`

**Key Files (Backend Dev):**
- `apps/api/src/scheduler/` — CalDAV adapter, event persistence
- `supabase/migrations/` — events table

---

## Epic 3: Strategy Playbook Engine

**Purpose:** A complex routine builder for consultant workflows.

**Features:**
- Multi-tier filter system (by client, project type, phase, tag)
- Routine builder with drag-and-drop step sequencing
- Rest timers and sequence timers between steps
- Video SOP previews embedded per step
- Export playbook as structured PDF or shareable link
- State is complex — must be fully extracted into atomic hooks and reducers

**Key Files (Frontend Dev):**
- `apps/web/src/features/playbook/`
- `apps/web/src/features/playbook/PlaybookEngine.tsx`
- `apps/web/src/features/playbook/hooks/use-playbook-builder.ts`
- `apps/web/src/features/playbook/hooks/use-sequence-timer.ts`
- `apps/web/src/features/playbook/components/StepCard.tsx`
- `apps/web/src/features/playbook/components/FilterPanel.tsx`

**Key Files (Backend Dev):**
- `apps/api/src/playbooks/` — playbook CRUD, sharing logic
- `supabase/migrations/` — playbooks, steps, filters tables

---

## Epic 4: Team Identity Lab

**Purpose:** A custom logo and badge generation tool using Canvas API.

**Features:**
- Canvas API for image manipulation and badge layering
- Upload base logo or select from template library
- Layer overlays: client initials, project phase badge, status indicator
- Export as PNG or SVG
- Real-time canvas preview as user adjusts parameters
- Manipulation logic must be extracted into isolated canvas utility functions

**Key Files (Frontend Dev):**
- `apps/web/src/features/identity/`
- `apps/web/src/features/identity/IdentityLab.tsx`
- `apps/web/src/features/identity/hooks/use-canvas-editor.ts`
- `apps/web/src/features/identity/utils/canvas-layers.ts`
- `apps/web/src/features/identity/utils/export-canvas.ts`

**Key Files (Backend Dev):**
- `apps/api/src/identity/` — template storage, export persistence
- `supabase/` — storage bucket for logo assets

---

## Epic 5: Service Marketplace

**Purpose:** A full B2B checkout flow for consultant services.

**Features:**
- Service listing page with high-fidelity card UI
- Service detail page with pricing tiers
- Cart and checkout flow
- High-fidelity UI/UX transitions between steps (Framer Motion)
- Order confirmation with Lottie success animation
- Stripe-ready payment scaffold (no live keys required for demo)

**Key Files (Frontend Dev):**
- `apps/web/src/features/marketplace/`
- `apps/web/src/features/marketplace/Marketplace.tsx`
- `apps/web/src/features/marketplace/hooks/use-cart.ts`
- `apps/web/src/features/marketplace/components/ServiceCard.tsx`
- `apps/web/src/features/marketplace/components/CheckoutFlow.tsx`

**Key Files (Backend Dev):**
- `apps/api/src/marketplace/` — service listings, order logic
- `supabase/migrations/` — services, orders, line_items tables

---

## Animation & Interaction Standards

All animated interactions follow these rules:

- **Page/feature entrances:** Framer Motion staggered reveals (children animate in sequentially, 60–80ms delay between items)
- **Feedback moments:** Lottie animations (success, error, loading states)
- **Interactions:** Mouse and click position tracking for subtle parallax/magnetic effects on interactive elements
- **No animation on data tables** — performance over decoration in dense data views
- **Reduced motion:** Respect `prefers-reduced-motion` — all animations must have a static fallback

---

## Supabase Schema Overview

| Table | Key Columns |
|---|---|
| `profiles` | id, role, display_name, avatar_url |
| `projects` | id, title, health_status, lat, lng, owner_id |
| `events` | id, title, start_at, end_at, project_id, caldav_uid |
| `playbooks` | id, title, owner_id, steps (jsonb) |
| `services` | id, title, description, price_tiers (jsonb) |
| `orders` | id, user_id, service_id, status, total |
| `identity_templates` | id, name, canvas_config (jsonb) |

RLS must be enabled on all tables. The `demo` role uses a separate seeded schema or view layer — never touches real user data.

---

## Performance Constraints

- First Contentful Paint target: < 1.2s
- No blocking renders — all data fetching is async with skeleton states
- Heavy components (Mapbox, FullCalendar, Canvas) are lazy-loaded
- Redux store is normalized — no nested state trees
- PostCSS is the only styling solution — no runtime CSS-in-JS
