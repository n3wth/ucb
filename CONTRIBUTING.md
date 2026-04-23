# Contributing

Guide for internal contributors working on this repository.

## Prerequisites

- Node.js 20+
- pnpm (the lockfile is `pnpm-lock.yaml`; CI uses pnpm with a frozen lockfile)

## Getting started

```bash
pnpm install
pnpm dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Project layout

- `app/` — Next.js App Router routes, layouts, and server components
- `components/` — Shared React components (shadcn/ui in `components/ui/`)
- `hooks/` — Custom React hooks
- `lib/` — Utilities and shared server-side code
- `middleware.ts` — Next.js middleware
- `tests/unit/` — Vitest + React Testing Library unit tests
- `tests/e2e/` — Playwright end-to-end tests
- `public/` — Static assets

## v0 integration

This repo is linked to a [v0](https://v0.app) project. v0 can push commits directly
to `main`. When editing locally, assume `main` may advance without warning and
rebase your branch as needed.

## Development workflow

1. Branch from `main`. Use a descriptive branch name.
2. Make your change. Keep the scope tight — do not bundle unrelated edits.
3. Add or update tests when the change is non-trivial.
4. Run the quality gates locally (see below).
5. Open a PR against `main`. CI must pass before merge.

## Quality gates

All of the following must pass locally before you commit:

```bash
pnpm run lint           # ESLint
pnpm exec tsc --noEmit  # TypeScript typecheck
pnpm test               # Vitest unit tests
pnpm exec playwright test  # Playwright e2e tests
```

CI runs the same gates on every pull request (`.github/workflows/ci.yml`).

## Testing

- **Unit**: Vitest + `@testing-library/react`. Put tests in `tests/unit/` or
  colocate as `*.test.ts(x)`. Setup lives in `tests/setup.ts`.
- **E2E**: Playwright. Tests live in `tests/e2e/`. Config in `playwright.config.ts`.

Prefer unit tests for component logic. Reserve e2e for user-visible flows that
cross multiple components or depend on the running app.

## Code style

- TypeScript throughout; no `.js` in `app/`, `components/`, `lib/`, or `hooks/`.
- Follow existing patterns in neighboring files rather than introducing new ones.
- UI: shadcn/ui + Radix primitives + Tailwind v4 (`@import "tailwindcss"`).
- No unrequested abstractions or speculative features. Build only what the
  change requires.

## Commits and PRs

- Write commit messages in the imperative ("add X", "fix Y").
- Keep PRs focused. Smaller diffs review faster and revert cleaner.
- If your change touches behavior, describe the before/after in the PR body.
- Do not commit secrets, `.env*` files, or generated artifacts.

## Getting help

Check the README for v0 and Next.js links. For repo-specific questions, open a
draft PR or an issue so the context is captured.
