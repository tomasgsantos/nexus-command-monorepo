# Nexus Consultant Command

High-end project management dashboard for elite consultants, built for perceived performance, high-trust UX, and universal React delivery (Web + Mobile).

## Objective

`Nexus Consultant Command` is a vertical slice of a premium B2B command center.  
The goal is to prove product quality across:

- fast, polished frontend experience
- credible architecture for multi-platform scale
- real-time operations and data visualization
- delivery discipline (CI/CD + documentation + roadmap)

## Product Vision

- **Web app**: React + Vite + TypeScript + PostCSS
- **Mobile companion**: React Native (Expo)
- **Backend**: Supabase (Auth, DB, Realtime)
- **Platform**: Monorepo managed with Turborepo

## Monorepo Architecture

This repository is a monorepo with separate apps and (future) shared packages.

- `apps/consultant-command-center`: primary React + Vite web app
- `apps/mobile` (planned): Expo React Native app
- `packages/`* (planned): shared API/services/state/design tokens for web + mobile reuse

Why monorepo:

- enables shared business logic between web/mobile
- keeps tooling and versioning consistent
- supports filtered CI tasks and targeted deployments
- reduces duplicated setup and dependency drift

## Stack Decisions

### Why Vite over CRA

- faster dev server startup and HMR
- leaner, modern ESM pipeline
- simpler configuration for static-host deployments (GitHub Pages)
- better fit for a performance-first frontend workflow

### Why PostCSS for styling system

- supports a token-first design system via `variables.css`
- keeps CSS output optimized and predictable
- allows progressive enhancements (autoprefixer, future plugins)
- works cleanly with utility classes, components, and animation layers

## Delivery Pipeline

The web app is deployed with GitHub Actions and GitHub Pages.

- Workflow: `.github/workflows/deploy-consultant-command-center.yml`
- Trigger: pushes to `main` affecting `apps/consultant-command-center/`**
- Deploy target: GitHub Pages at  
[https://tomasgsantos.github.io/nexus-command-monorepo/](https://tomasgsantos.github.io/nexus-command-monorepo/)

## Local Development

Install dependencies:

```sh
yarn install
```

Run all workspace dev tasks:

```sh
yarn dev
```

Run only consultant web app:

```sh
yarn workspace consultant-command-center dev
```

Build only consultant web app:

```sh
yarn workspace consultant-command-center build
```

