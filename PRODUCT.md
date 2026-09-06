# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are beginner Python learners — high-school students, first-year college students, and self-taught programmers — who already know variables, strings, and numbers. They sit down to understand list methods, not to write a full program.

They typically do not yet understand mutation, return values, indices, copies, references, error states, or the difference between built-ins (`len`, `sorted`) and list methods. Their job is to see what a method does to a list, then reuse that understanding in homework, class, or practice.

Teachers may demo the site, but the product is not a classroom admin tool.

## Product Purpose

Python Lists Playground is an interactive visual playground for learning beginner Python **lists**. Learners create or edit a list, pick an operation, run it, and watch the list update in real time while seeing generated Python code, the return value or error, and a short explanation.

Success is a learner who can predict what a supported method will do — including what it mutates, what it returns, and when it errors — because they watched it happen, not because they memorized a docs page.

The site must remain a playground first. It is not a generic documentation website, a full Python course, or a Python runtime.

## Positioning

The product is a **frontend educational simulator**, not CPython. A TypeScript operation engine models beginner list behavior within a documented V1 scope so every run can produce code, structured errors, before/after state, and semantic animation — without executing Python on a server.

Neighboring tools (language docs, REPL sandboxes, whole-program tracers) cannot truthfully claim this combination: list-method-focused visual teaching, playground-first interaction, and motion that explains mutation rather than decorating it.

## Operating Context

Learners use the site in a browser on their own, or while a teacher projects it. There are no accounts, databases, or cloud progress.

- Home (`/`) is a single-page learning flow: hero, playground, methods, comparisons, challenges.
- `/playground` is the shareable playground-only page (`?preset=` / `?method=` for simple snapshots, `?s=` for encoded full state).
- Playground state persists locally; undo/redo, history, reset, presets, animation speed, step mode, X-ray indices, and dark mode are part of using it.
- `PYTHON_LISTS_PLAYGROUND_MASTER.md` is the product source of truth for later work.
- Deploy target is Vercel with no required environment variables, auth, or APIs.

## Capabilities and Constraints

Confirmed V1 operations: `len`, `append`, `extend`, `insert`, `remove`, `pop`, `clear`, `count`, `index`, `reverse`, `sort`, `copy`, and `sorted`.

Confirmed value types: strings, numbers, booleans, and `None`. Nested lists, dicts, and arbitrary Python objects are out of scope.

Every supported operation must communicate through Python code, visual list state, motion, explanation, return value or error, and before/after state. Animations teach meaning; they are not decoration.

Also shipping: editable list, presets, method explorer, comparison lessons (`append` vs `extend`, `remove` vs `pop`, `sort` vs `sorted`, `copy` vs assignment, `index` vs `count`), short challenges without accounts, generated code, structured educational errors (`ValueError`, `IndexError`, `TypeError`), and GSAP-driven visualization fed by engine metadata.

Hard constraints:

- Do not execute real Python.
- Do not add authentication, accounts, a database, teacher dashboards, multiplayer, or cloud progress.
- Do not turn challenges into a gamified platform that requires accounts.
- Do not bypass the operation engine in `src/lib/python/` when implementing list behavior.
- `index(value)` has no `start` / `stop`. Mixed-type `sort` / `sorted` errors. `True == 1` is false here (bool is not treated as a subclass of int). Variable names fall back to `items` when they are not simple identifiers.
- Learner-facing copy may mention “array” because beginners search that way, but it must teach that the features shown are Python **lists**.

Undecided: production URL / public launch details beyond local and Vercel-capable hosting.

## Brand Commitments

- Name: **Python Lists Playground**
- Binding subtitle: *Learn Python lists by playing with them.*
- Exact footer signature: **Made by kuya Rodge <3** — keep lowercase `kuya`. Small creator easter egg in the footer only; never in the hero, beside the primary CTA, sticky, or large.
- Voice: warm, intelligent, modern, friendly, sophisticated, and developer-tool inspired. Avoid jargon. Do not sound like a childish classroom product.
- Clarifying line already in the product: in beginner Python, what people often call an “array” is usually a `list`.

## Evidence on Hand

- Product and implementation truth: `PYTHON_LISTS_PLAYGROUND_MASTER.md`, `README.md`, and the running Next.js app.
- Real UI copy, method metadata, comparison lessons, challenges, and presets live in `src/`.
- No testimonials, student quotes, case studies, press, usage metrics, or third-party endorsements exist. Future work must not fabricate them.

## Product Principles

1. **Show the operation.** Do not only tell learners what a list method does; show code, state, motion, explanation, and the return or error together.
2. **Playground over encyclopedia.** Exploration is the product. Extra reading supports the playground; it never replaces it.
3. **Honest beginner Python.** Stay accurate within V1, name the limits, and keep lists distinct from arrays, mutation distinct from returns, and methods distinct from built-ins.
4. **Teach without a backend.** Local, shareable, and frontend-only is a feature, not a missing phase.
5. **Quiet creator, loud learning.** Personality is allowed; the signature and warmth must never compete with the list.

## Accessibility & Inclusion

Target **WCAG 2.2 AA**.

Required in this product: keyboard navigation, visible focus, semantic controls, sufficient contrast, screen-reader-accessible results (including live announcements when an operation completes), reduced motion that preserves educational state changes (fade/highlight instead of travel, never disabled function), and no color-only status.
