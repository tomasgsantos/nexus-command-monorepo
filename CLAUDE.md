# CLAUDE.md — Project Nexus Agent Protocol

> This file is read by all agents at spawn time. These rules are non-negotiable and apply to every agent on the team regardless of task.

---

## 1. Team Structure & Communication

**Lead Dev** is the sole point of contact with the user. No agent communicates with the user directly.

Agents may communicate directly with each other when it is more efficient (e.g. Frontend Dev asking Backend Dev for a type definition). However:
- All task assignments come from the Lead
- All feature completions are reported to the Lead
- The Tester always reports findings to the Lead, who decides what gets fixed and by whom

### Agent Responsibilities

| Agent | Owns | Never Touches |
|---|---|---|
| Backend Dev | `apps/api/`, `supabase/`, migrations, RLS policies, edge functions, shared types | `apps/web/`, `packages/ui/` |
| Frontend Dev | `apps/web/`, `packages/ui/` | `apps/api/`, `supabase/` |
| Tester | `*.test.ts`, `*.spec.ts`, QA reports | Production code (review only, no edits) |
| Lead Dev | Orchestration, task assignment, quality gate decisions | Direct file editing |

---

## 2. Quality Gate

No feature is marked complete until the Tester has:

1. Written unit tests (Jest/Vitest) covering the feature's core logic
2. Performed a code review of the implementation
3. Confirmed QA passes (no regressions, no broken contracts)
4. Reported a signed-off status to the Lead

The Lead marks the feature complete only after Tester sign-off. Features are never self-certified by the agent who built them.

---

## 3. Atomic Extraction (Non-Negotiable)

> 99% of performance issues are solved by extraction.

All agents must follow this rule without exception:

- Complex state logic must be extracted into its own hook or service file
- Heavy computations must be isolated into atomic utility functions
- No component or function should handle more than one concern
- If a file is growing beyond ~150 lines, it is a signal to extract
- Shared types and interfaces live in `packages/api/src/types/` — never duplicated

**Backend Dev:** Database query logic, RLS policy builders, and edge function handlers must each live in their own isolated module.

**Frontend Dev:** Every feature epic gets its own folder. No cross-epic imports except through `packages/ui/` or `packages/api/`.

---

## 4. Build Order

The Lead enforces this sequence to prevent blocked work:

1. **Backend Dev** scaffolds Supabase schema, RLS policies, and `apps/api` contracts first
2. **Frontend Dev** begins only after receiving typed API contracts from the Lead
3. Features are built epic-by-epic, not layer-by-layer
4. **Tester** gates each epic before the next one begins

---

## 5. Demo Login & RBAC

The app must support a one-click Demo login at all times. This is a first-class feature, not an afterthought.

- Demo mode must be wired up as part of the auth scaffold in Sprint 1
- RBAC roles: `admin`, `consultant`, `viewer`, `demo`
- The `demo` role has read-only access to all seeded sample data
- Demo login must never require environment secrets from the user

---

## 6. Existing Repository Context

**Repo:** `https://github.com/tomasgsantos/nexus-command-monorepo`  
**Live URL:** `https://tomasgsantos.github.io/nexus-command-monorepo/`  
**Package manager:** Yarn workspaces  
**Branch:** `main`

### What already exists
- `apps/web/` — Vite + React + TypeScript web app, already scaffolded and deployed
- `.github/workflows/deploy-web.yml` — GitHub Actions pipeline, deploys on push to `main` when `apps/web/**` changes
- `apps/mobile/` — planned, not yet created
- `packages/*` — planned, not yet created
- `apps/api/` — planned, not yet created
- `supabase/` — planned, not yet created

### What needs to be created by agents
Backend Dev creates: `apps/api/`, `supabase/`, `packages/ui/`  
Frontend Dev extends: `apps/web/` (already exists — do not reinitialise or overwrite config)  
Lead coordinates: `apps/mobile/` scaffold when mobile work begins

### Git Branching Strategy (Non-Negotiable)

- **Never push directly to `main`**
- All work branches off `dev`
- Branch naming: `feature/<epic-name>`, `fix/<description>`, `chore/<description>`
- When a feature is complete and Tester has signed off, the Lead creates a PR from the feature branch into `dev`
- Merges from `dev` into `main` are done by the user after code review — agents do not touch this
- The GitHub Pages deployment triggers on `main` — agents never trigger it directly

```
main          ← user-controlled, triggers deploy
  └── dev ← integration branch
        ├── feature/auth-scaffold
        ├── feature/pulse-dashboard
        ├── feature/enterprise-scheduler
        └── ...
```

### Local Dev Commands
```bash
yarn install        # install all workspace deps
yarn dev            # run all workspace dev tasks
yarn web:dev        # run only the web app
yarn web:build      # build only the web app
```

---

## 7. Login Page — Full Redesign, Design System Applies

The existing login page in `apps/web` must be **fully replaced**. The Obsidian Lens design system applies to the login page without exception — it is not exempt.

The login page must include:
- Email/password login form wired to Supabase Auth
- A prominent **"Enter Demo"** one-click button that logs in with the demo account (no credentials required from the user)
- RBAC role assignment from the `profiles` table on successful auth
- Redirect to the main dashboard after login
- Full Obsidian Lens styling per DESIGN.md — glassmorphism panel, Space Grotesk headline, Sora body, obsidian background

---

## 9. Tech Stack Reference

| Concern | Solution |
|---|---|
| Monorepo | Turborepo |
| Web App | Vite + React (`apps/web`) |
| Mobile | Expo (`apps/mobile`) |
| Shared Logic | `apps/api` |
| UI Primitives | `packages/ui` with PostCSS |
| Backend | Supabase (Auth, Realtime, PostgreSQL) |
| Global State | Redux |
| Local UI State | Custom lightweight hooks |
| Styling | PostCSS — no Tailwind |
| Fonts | Sora (body/labels), Space Grotesk (display/headlines) |
| Animation | Framer Motion (staggered entrances), Lottie (feedback) |
| Interactions | Mouse/click tracking |

---

## 10. File Naming Conventions

- Components: `PascalCase.tsx`
- Hooks: `use-kebab-case.ts`
- Utilities: `kebab-case.ts`
- Tests: `ComponentName.test.ts` or `utility-name.spec.ts`
- Supabase migrations: `YYYYMMDD_description.sql`

---

## 11. Definition of Done

A task is done when:
- [ ] Implementation matches the spec in `spec.md`
- [ ] Atomic Extraction rule is followed
- [ ] File ownership boundaries were respected
- [ ] Tester has signed off (tests written, QA passed, review complete)
- [ ] Lead has marked it complete
