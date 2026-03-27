# Project Nexus — Progress Log

> Maintained by Lead Dev. Updated after each epic gate. Agents and the user read this to understand current state.

---

## Branch Strategy

```
main       ← user-controlled, triggers GitHub Pages deploy
  └── dev  ← integration branch (agents never touch main)
        ├── feature/auth-scaffold   ← COMPLETE, pending PR to dev
        ├── feature/pulse-dashboard ← next
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

**Branch:** `feature/pulse-dashboard` (not started)
**Status:** 🔲 NOT STARTED

### Scope (from spec.md)
- Mapbox GL JS map with project nodes (lat/lng from `projects` table)
- Project health indicators: On-Track / At-Risk / Failing
- Supabase Realtime activity feed
- "The Pulse" indicator component (4px glowing dot)
- Node click → floating glassmorphism panel
- KPI cards with Editorial Offsets

### Key files to create

**Frontend Dev** (`apps/web/src/features/pulse/`):
- `PulseDashboard.tsx`
- `hooks/use-realtime-feed.ts`
- `components/ProjectNode.tsx`
- `components/PulseIndicator.tsx`

**Backend Dev** (`apps/api/src/projects/`, `supabase/`):
- Project queries + realtime subscription module
- Migration: projects table already exists — add indexes if needed

---

## Epic 2 — Enterprise Scheduler

**Branch:** `feature/enterprise-scheduler` (not started)
**Status:** 🔲 NOT STARTED

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
