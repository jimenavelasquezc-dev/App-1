# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start dev server (Vite, localhost:5173)
npm run build      # production build — use this to verify no compile errors
npm run lint       # ESLint check
npm run preview    # serve the production build locally
```

There are no tests. Use `npm run build` to confirm changes compile cleanly.

> **Note:** If you hit npm cache permission errors, run with `--cache /tmp/npm-cache`.

## Architecture

### Stack
- **React 19 + Vite 8** — SPA, no backend, no SSR
- **Tailwind CSS v3** — utility-first; custom tokens defined in `tailwind.config.js`
- **Recharts** — all charts (BarChart, PieChart)
- **React Router v6** — nested routes, role-guarded via `ProtectedRoute`

### Custom Tailwind tokens (`tailwind.config.js`)
```js
rappi: { DEFAULT: '#FF441F', dark: '#e03518', light: '#ff6b4a', bg: '#fff3f0' }
attainment: { low: '#ef4444', mid: '#f59e0b', good: '#22c55e', high: '#059669' }
```
Use `text-rappi`, `bg-rappi`, `border-rappi` etc. When Tailwind class ordering conflicts with a base style (e.g. `bg-white` in Card), override with inline `style={{ backgroundColor: '...' }}`.

The Rappi logo (`/public/Rappi_logo.svg`) is white on the orange header via `className="brightness-0 invert"`.

### Context / State layer (`src/context/`)
Four providers, nested in this order in `App.jsx`:
```
AuthProvider > CommissionsProvider > FiltersProvider > ExceptionsProvider
```
- **AuthContext** — `currentUser`, `role` (`'rep' | 'manager' | 'data_person'`), `login()`, `logout()`. Persisted to `localStorage` (`rappi_auth_user`).
- **CommissionsContext** — all read selectors (`getByPeriod`, `getEarnedStats`, `getAttainmentBuckets`, `getSupervisorBreakdown`, `getAllByPeriod`, `getTeamSummary`, `getForEmployee`). Every selector accepts `(period, filters)` where `filters = { country, supervisorId }`.
- **FiltersContext** — `{ country, supervisorId, setCountry, setSupervisorId, reset }`. Shared across Dashboard and Exception Queue.
- **ExceptionsContext** — `useReducer` with actions `SUBMIT | ADD_COMMENT | SET_STATUS | RESET`. Persisted to `localStorage` (`rappi_exceptions`).

### Data layer (`src/data/`)
All data is generated at module load time — no API calls.
- **`mockEmployees.js`** — generates 20 supervisors (4 per country) + 400 reps. Exports `employees`, `supervisors`, `demoUsers`, `allUsers`, `COUNTRIES`.
- **`mockCommissions.js`** — generates commission records for every employee × 2 periods (`2026-01`, `2026-02`). Applies a post-generation pass to award `bonoExtra = $500` to the top attainer per country per period.
- **`mockExceptions.js`** — 6 seed exceptions. Live exceptions are stored in `localStorage` and loaded by `ExceptionsContext`.

### Business logic (`src/utils/compensationLogic.js`)
Single source of truth for compensation rules. Import constants and `calcPayBreakdown()` from here — never hardcode thresholds elsewhere.
- `R2S_THRESHOLD = 80` — minimum attainment % to unlock variable pay
- `HANDOFF_MAX_DAYS = 14` — days after R2S to complete store handoff
- Pay split: `MONTHLY_WEIGHT = 0.60`, `Q1_WEIGHT = 0.20`, `Q2_WEIGHT = 0.20`
- `BONO_EXTRA = 500` — USD bonus for country top performer

### Routing & role guards (`src/router/ProtectedRoute.jsx`)
Unauthenticated users → `/login`. Unauthorized role → `/dashboard`. Route access:
- `/exceptions/new` — `rep` only
- `/exceptions` and `/exceptions/:id` — `manager` and `data_person` only
- `/dashboard` — all authenticated roles

### Role-conditional rendering
Three roles with distinct UI: `rep` (personal view), `manager` (team view), `data_person` (team view). Dashboard and Exception Queue branch on `role` from `useAuth()`. Role display names: `rep` → "Supervisor", `manager` → "Líder de Inside Sales", `data_person` → "Equipo de Data".

### UI conventions
- **`Card`** (`src/components/ui/Card.jsx`) — base container; accepts `padding={false}` for tables.
- **`FilterBar`** — country + supervisor dropdowns; only shown to non-rep roles. Supervisor options cascade from selected country.
- All UI text is in **Spanish**.
- Rappi Orange (`#FF441F`) is used for primary accents, CTAs, and high-priority alerts. High-urgency states use red (`#ef4444`); success states use green (`#059669`); in-progress states use blue.
