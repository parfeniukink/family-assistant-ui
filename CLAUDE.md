# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Reference

```bash
npm install          # Install dependencies
npm run dev          # Start dev server with HMR
npm run build        # TypeScript check + production build
npm run lint         # ESLint (no Prettier)
npm run preview      # Preview production build
```

**No test framework is configured.** Do not invent test commands.

## Environment

Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to your backend URL.

## Architecture

React 19 + TypeScript + Vite frontend. No backend in this repo.

### Context Provider Hierarchy

`AppContext` composes all providers in this order (outermost first):

1. `MobileProvider` - viewport detection
2. `UserProvider` - authentication, token in localStorage
3. `EquityProvider` - equity/balance data
4. `CurrencyProvider` - available currencies
5. `CostCategoryProvider` - expense categories
6. `CostShortcutsProvider` - quick-add shortcuts
7. `TransactionsProvider` - transaction list state

### API Layer

All API calls go through `src/data/api/client.ts`:

- `apiCall<T>()` handles auth headers, error toasts, and response parsing
- Token stored in localStorage, attached via Bearer header
- Errors (401/403/400/422/500) are handled centrally with toast notifications

### Routing

`src/router.tsx` uses React Router with lazy-loaded pages. All routes except `/auth` are wrapped in `RequireAuth`.

### Import Alias

`src` is aliased in vite.config.ts — use `import { X } from "src/..."` for absolute imports.

## Conventions

See `AGENTS.md` for detailed code style rules. Key points:

- **TypeScript only** — no `any`, use explicit types from `src/data/types/`
- **Function components only** — named exports, not arrow function exports
- **Plain CSS** — no CSS-in-JS; tokens in `src/styles/tokens.ts` and `tokens.css`
- **No new dependencies** without asking
- **Small, incremental changes** — align with existing patterns
