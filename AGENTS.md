# AGENTS.md

This file documents how agentic coding tools should work in this repository. Follow these rules strictly to avoid breaking conventions or wasting cycles.

---

## Project Overview

- Frontend-only React application built with **Vite**, **TypeScript**, and **React 19**
- Uses **ES modules** (`"type": "module"`)
- No backend in this repo; API calls live under `src/data/api/`
- State management is primarily via React Contexts in `src/context/`
- Styling is plain CSS with design tokens (`src/styles/`), not a CSS-in-JS system

---

## Install & Environment

- Node.js >= 20 recommended
- Package manager: npm (lockfile not enforced, but prefer npm)

```bash
npm install
```

---

## Common Commands

### Development

```bash
npm run dev
```

- Starts Vite dev server with HMR
- Default port is shown in terminal

### Production Build

```bash
npm run build
```

- Runs `tsc -b` (TypeScript project references)
- Then runs `vite build`
- Type errors must be fixed before build succeeds

### Preview Production Build

```bash
npm run preview
```

---

## Linting

```bash
npm run lint
```

- Uses ESLint v9 flat config (`eslint.config.js`)
- Lints all `.ts` and `.tsx` files
- Ignored: `dist/`

There is **no separate format command** (Prettier is not used).
Formatting relies on ESLint defaults and developer discipline.

---

## Testing

- **No test framework is currently configured**
- There are no unit, integration, or e2e tests in this repo

### Implications for Agents

- Do NOT invent Jest/Vitest commands
- If tests are requested, clarify scope before adding infrastructure
- Prefer pure-function extraction for logic validation when needed

---

## Code Style Guidelines

### Language & Types

- Use **TypeScript everywhere** (`.ts` / `.tsx` only)
- Avoid `any`; prefer:
  - explicit interfaces
  - union types
  - `unknown` with narrowing
- Domain types live in `src/data/types/` and `src/domain/`
- Reuse existing types before creating new ones

### Imports

- Use **ES module imports only**
- Import order (no blank lines between groups unless it improves clarity):
  1. React / react-router
  2. External libraries
  3. Internal absolute imports

Example:

```ts
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { Card } from "@/components";
import { Transaction } from "@/data/types";
```

- Prefer absolute imports when already used in nearby files
- Index files (`index.ts`) are used intentionally — do not bypass them

---

### Components

- Components are **function components only**
- Prefer named functions over anonymous arrow exports

```ts
export function Dashboard() {
  // ...
}
```

- Hooks go at the top, before conditionals
- Keep render logic readable; extract helpers if JSX becomes dense

---

### Naming Conventions

- Components: `PascalCase`
- Hooks: `useSomething`
- Files:
  - Components/pages: `PascalCase.tsx`
  - Utilities/domain logic: `camelCase.ts`
- Contexts: `SomethingContext.tsx`

---

### State & Context

- Contexts live in `src/context/`
- Context providers should:
  - expose a typed value
  - throw or guard if used outside provider
- Avoid prop drilling when a context already exists

---

### Error Handling

- UI-level errors:

  - Prefer graceful empty states (`<NoData />`) or inline messages
  - Toasts are allowed (`react-hot-toast`)

- Data / domain validation:

  - Lives in `src/domain/validation.ts`
  - Prefer explicit validation functions over silent failures

- Do NOT swallow errors with empty `catch` blocks

---

### Styling

- CSS only (no styled-components, no Tailwind)
- Global styles:
  - `src/index.css`
  - `src/styles/base.css`
- Design tokens:
  - `src/styles/tokens.ts`
  - `src/styles/tokens.css`

Rules:

- Reuse tokens; do not hardcode colors/sizes when tokens exist
- Keep component-specific styles close to usage when possible

---

### Formatting

- Follow existing file formatting
- 2-space indentation
- No trailing commas where they are not already used
- Semicolons are optional but be consistent within a file

---

## File Organization

- `src/pages/` – routed pages and page sections
- `src/components/` – reusable UI components
- `src/context/` – React context providers
- `src/domain/` – business logic, validation, transformations
- `src/data/` – API clients, DTOs, mock data
- `src/styles/` – CSS and design tokens

Do not blur these boundaries.

---

## Cursor / Copilot Rules

- No `.cursor/rules`, `.cursorrules`, or Copilot instruction files are present
- Default to repository conventions documented here

---

## Agent Behavior Rules (Important)

- Do NOT add dependencies without asking
- Do NOT reformat unrelated files
- Do NOT introduce new architectural patterns casually
- Prefer small, incremental changes
- Always align with existing patterns in nearby code

If unsure, stop and ask before proceeding.
