# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Arcade Vault — a platform for playing games online and competing for the highest score (per README.md, in Spanish). Currently a fresh `create-next-app` scaffold with no game features implemented yet.

## Critical: Next.js version

This repo runs **Next.js 16.3.5** with React 19. `AGENTS.md` (imported above) requires reading the relevant guide under `node_modules/next/dist/docs/` before writing App Router code — APIs and conventions may differ from training data. Key doc locations:
- `node_modules/next/dist/docs/01-app/01-getting-started/` — routing, layouts, data fetching, caching, server/client components
- `node_modules/next/dist/docs/01-app/03-api-reference/` — config, functions, file conventions

There is no test runner configured yet.

## Architecture

- App Router under `app/` (no `src/` directory, no `pages/` directory).
- `app/layout.tsx` — root layout; `app/page.tsx` — `/` route.
- Styling via Tailwind CSS v4 (`@tailwindcss/postcss`, `app/globals.css`).
- Path alias `@/*` maps to the repo root (`tsconfig.json`).
- TypeScript strict mode is on.

## Spec-driven workflow

Per README.md, this project follows Spec Driven Design using `/spec` and `/spec-impl` commands from the `Klerith/fernando-skills` skill pack (installed via `npx skills@latest add Klerith/fernando-skills`). These are not yet present in this checkout — if the user invokes `/spec` or `/spec-impl` and they're missing, point them to that install command rather than improvising equivalent behavior.

## Skills

Always use the `/frontend-design` skill when designing or modifying this project's user interface.
