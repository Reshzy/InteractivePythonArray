# Python Lists Playground

Interactive site for learning beginner Python **list** methods by watching a list update in real time.

This is a **frontend educational simulator**, not a Python runtime. Operations are modeled in TypeScript so they match Python list behavior within the documented V1 scope. Nothing is executed by CPython.

## Stack

- Next.js 16 (App Router) and React 19
- TypeScript
- Tailwind CSS 4 and shadcn
- Zustand
- GSAP with Flip
- Vitest

## Local setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm test` | Unit tests (Vitest) |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm run build` | Production build |
| `npm start` | Serve the production build |

## Architecture

```text
UI (playground, methods, challenges)
  → Zustand store (history, undo/redo, persistence, share restore)
    → executeOperation() TypeScript engine
      → generated code, return values, structured errors, animation metadata
        → GSAP / Flip visualizer
```

The operation engine in `src/lib/python/` is the source of truth for Python-like behavior. The store does not reimplement list methods. Animations consume semantic metadata from the engine rather than inventing their own mutations.

## Supported Python operations

V1 covers:

- `len`
- `append`
- `extend`
- `insert`
- `remove`
- `pop`
- `clear`
- `count`
- `index`
- `reverse`
- `sort`
- `copy`
- `sorted` (non-mutating)

Supported values are strings, numbers, booleans, and `None`. Nested lists and arbitrary Python objects are out of scope.

## Vercel

No environment variables, database, or auth keys are required.

1. Import the repository in Vercel.
2. Use the default Next.js settings (Node runtime).
3. Deploy.

Routes:

- `/` — home, playground, methods, comparisons, and challenges
- `/playground` — shareable playground-only page

Share query parameters on `/playground`:

- `?preset=` and `?method=` for simple snapshots
- `?s=` for an encoded full playground state

Direct links and hard refresh of those URLs should restore the playground without a backend.
