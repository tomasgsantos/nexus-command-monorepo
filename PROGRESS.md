# Project Nexus — Progress Log

> Maintained by Lead Dev. Updated after each epic gate. Agents and the user read this to understand current state.

---

## Branch Strategy

```
main       ← user-controlled, triggers GitHub Pages deploy
  └── dev  ← integration branch (agents never touch main)
        ├── feature/auth-scaffold          ← MERGED ✅
        ├── feature/pulse-dashboard        ← MERGED ✅
        ├── feature/sidebar                ← MERGED ✅
        ├── feature/enterprise-scheduler   ← IN PROGRESS
        └── ...
```

---

## Sprint 1 — Auth Scaffold

**Branch:** `feature/auth-scaffold`
**Status:** ✅ COMPLETE — Tester signed off. Pending user PR review into `dev`.

### What was built

| Package | Contents | Status |
|---|---|---|
| `packages/ui` (`@nexus/ui`) | PostCSS design token file — full Obsidian Lens palette, typography, spacing, glass vars | ✅ |
| `apps/api` (`@nexus/api`) | `UserRole`, `Profile`, `AuthUser` types · `Database` schema type · `signIn`, `signInDemo`, `signOut`, `getSession` · typed Supabase client | ✅ |
| `supabase/migrations/` | `20260325_initial_schema.sql` — 7 tables, RLS enabled · `20260325_rls_policies.sql` — access policies · `20260325_demo_seed.sql` — demo user + sample data | ✅ |
| `apps/web/src/features/auth/` | `LoginPage.tsx` · `LoginCard.tsx` · `use-login-form.ts` · `use-demo-login.ts` · `auth.css` | ✅ |

### Test results
- 14 / 14 unit tests passing (`LoginPage.test.ts`)

### Post-scaffold fixes applied
- `supabase-client.ts` — removed `process.env` (browser crash), added `import.meta.env` with placeholder fallbacks
- `variables.css` — cleared conflicting `--color-primary` override
- `base.css` — added Space Grotesk font import, `box-sizing` reset
- `App.tsx` — all inline styles moved to `App.css`
- `components/Login/` — deleted (dead code)

### Known non-blocking issues (backlog)
- `fetchAuthUser` doesn't distinguish DB error from missing profile row — minor UX issue
- Demo seed events have no `ON CONFLICT` guard — duplicates on re-run

---

## Epic 1 — Pulse Dashboard

**Branch:** `feature/pulse-dashboard`
**Status:** ✅ COMPLETE — Tester signed off. Pending user PR review into `dev`.

### What was built

| Layer | Contents | Status |
|---|---|---|
| `apps/api/src/projects/` | `project-queries.ts` · `realtime-subscriptions.ts` · `index.ts` | ✅ |
| `supabase/migrations/` | `20260327_pulse_indexes.sql` — indexes on `owner_id`, `health_status` | ✅ |
| `apps/web/src/features/pulse/` | `PulseDashboard.tsx` · `pulse.css` · `ProjectNode.tsx` · `PulseIndicator.tsx` · `ProjectPanel.tsx` · `KpiCard.tsx` · `use-realtime-feed.ts` · `use-pulse-map.ts` | ✅ |

### Contracts exported from `@nexus/api`
- `Project` type
- `fetchProjects()`, `fetchProject(id)`
- `subscribeToProjects(callback)` → `RealtimeChannel`

### Dependencies added
- `mapbox-gl`, `react-map-gl`, `@reduxjs/toolkit`, `redux`, `react-redux`

---

## Epic 1 Enhancement — Admin Project CRUD

**Branch:** `feature/pulse-dashboard`
**Status:** ✅ COMPLETE — Tester signed off (35/35 tests passing). Pending user PR review into `dev`.

### What was built

| Layer | Contents | Status |
|---|---|---|
| `supabase/migrations/` | `20260329090000_project_write_rls.sql` — admin-only INSERT/UPDATE/DELETE policies on `projects` | ✅ |
| `apps/api/src/types/` | `Project.ts` — `Project`, `HealthStatus`, `CreateProjectInput`, `UpdateProjectInput` types | ✅ |
| `apps/api/src/projects/` | `project-mutations.ts` · `geocoding.ts` — createProject, updateProject, deleteProject, geocodeAddress | ✅ |
| `apps/web/src/features/pulse/` | `ProjectFormModal.tsx` · `use-project-form.ts` · `utils/submit-project.ts` · `utils/reverse-geocode.ts` | ✅ |
| `apps/web/src/features/pulse/` | `ProjectPanel.tsx` updated (Edit/Delete, admin-only) · `PulseDashboard.tsx` updated (New Project button, map-pick mode) · `use-realtime-feed.ts` updated (refresh()) | ✅ |

### New contracts exported from `@nexus/api`
- `createProject(data)`, `updateProject(id, data)`, `deleteProject(id)`
- `geocodeAddress(address)` → `{ lat, lng }`
- `CreateProjectInput`, `UpdateProjectInput`, `HealthStatus` types

### Features
- Admin-only "New Project" button on Pulse Dashboard
- ProjectFormModal: title, health status dropdown, location via address input or map-click
- Edit/Delete controls on ProjectPanel (admin-only, delete requires confirmation)
- Realtime propagation automatic via existing subscribeToProjects channel

---

## App Shell — Sidebar, Routing & Central Command

**Branch:** `feature/sidebar`
**Status:** ✅ COMPLETE — Pending user PR review into `dev`.

### What was built

| Layer | Contents | Status |
|---|---|---|
| `apps/web/src/constants/` | `routes.ts` — `AppRoute` enum (`/pulse`, `/map`) | ✅ |
| `apps/web/src/components/App.tsx` | HashRouter shell · auth gate · lazy-loaded routes · session check on mount | ✅ |
| `apps/web/src/components/App.css` | App shell layout — `.app-shell` flex container, `.app-shell__main` | ✅ |
| `apps/web/src/components/Sidebar/` | `Sidebar.tsx` · `Sidebar.css` · `use-sidebar.ts` · `Sidebar.test.ts` · `use-sidebar.test.ts` | ✅ |
| `apps/web/src/features/central-command/` | `CentralCommand.tsx` · `CentralCommand.css` · `CentralCommand.test.ts` | ✅ |

### Features

- **Sidebar:** Collapsible (60px → 220px), glassmorphism, framer-motion width animation, active route highlighting, live pulse dot on "The Pulse" nav item, sign-out button
- **Routing:** HashRouter, auth-gated shell, lazy-loaded `CentralCommand` and `PulseDashboard`, wildcard redirect to `/pulse`
- **Central Command (`/pulse`):** Dashboard overview page — "CENTRAL COMMAND" header with system status indicator, framer-motion entrance, CSS grid layout scaffolded for future epic widgets, currently hosts `ProjectNodesWidget` (miniaturised live map)
- **Nav items:** "The Pulse" → `/pulse` (CentralCommand), "Map" → `/map` (PulseDashboard)

### Notes
- `CentralCommand.css` grid is currently single-column; comment marks where Epic 2 scheduler widget slots in
- Sidebar nav items will need extending as each new epic lands (Scheduler, Playbook, Identity Lab, Marketplace)

---

## Epic 2 — Enterprise Scheduler

**Branch:** `feature/enterprise-scheduler`
**Status:** 🔄 IN PROGRESS

---

## Epic 3 — Strategy Playbook Engine

**Branch:** `feature/playbook-engine` (not started)
**Status:** 🔲 NOT STARTED

---

## Epic 4 — Team Identity Lab

**Branch:** `feature/identity-lab` (not started)
**Status:** 🔲 NOT STARTED

---

## Epic 5 — Service Marketplace

**Branch:** `feature/service-marketplace` (not started)
**Status:** 🔲 NOT STARTED

---

## Agent Responsibilities (reference)

| Agent | Owns | Never Touches |
|---|---|---|
| `backend-dev` | `apps/api/`, `supabase/`, migrations, RLS, edge functions, shared types | `apps/web/`, `packages/ui/` |
| `frontend-dev` | `apps/web/`, `packages/ui/` | `apps/api/`, `supabase/` |
| `tester` | `*.test.ts`, `*.spec.ts`, QA reports | Production code (review only) |
| `lead-dev` | Orchestration, task assignment, PR creation, PROGRESS.md | Direct file editing |

---

## Quality Gate (per epic)

An epic is complete when:
- [ ] Backend contracts published and typed
- [ ] Frontend implementation matches spec.md
- [ ] Atomic Extraction rule followed (no file >150 lines)
- [ ] Tester: unit tests written, QA passed, signed off
- [ ] Lead: PR created from feature branch into `dev`
- [ ] PROGRESS.md updated
