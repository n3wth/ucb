# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- Next.js 16 App Router on React 19, TypeScript, pnpm 10 (frozen lockfile in CI)
- Tailwind v4 (`@import "tailwindcss"` + `@theme` in `app/globals.css`), shadcn/ui in `components/ui/` over Radix primitives, `lucide-react` icons, `next-themes` for theme switching
- `@t3-oss/env-nextjs` + Zod for validated env (`lib/env.ts`)
- Supabase JS for persistence (audit log, ASSSSCAT lineup log); Google APIs (`googleapis`) for Calendar / Drive / Sign-In
- Vitest + Testing Library + jsdom for unit tests; Playwright (chromium only) for e2e

## Common commands

```bash
pnpm install              # install deps (CI uses --frozen-lockfile)
pnpm dev                  # next dev on :3000
pnpm run build            # production build (next build)
pnpm test                 # vitest run (tests/unit/**)
pnpm test:watch           # vitest watch
pnpm test -- path/to.test.ts        # run a single unit test file
pnpm test -- -t "name"              # filter by test name
pnpm exec playwright test           # e2e (auto-starts `next start` per playwright.config.ts)
pnpm exec playwright test path.spec.ts        # single e2e file
pnpm exec tsc --noEmit              # typecheck
pnpm run lint                       # currently a no-op echo; lint is disabled pending eslint flat-config migration
```

CI (`.github/workflows/ci.yml`) runs lint → typecheck → unit → e2e on pnpm 10 / Node 20. The e2e step requires `SESSION_SECRET` and `UCB_APP_PASSWORD` to be set; locally they come from `.env.local` and are validated by `lib/env.ts`.

Playwright's `webServer` runs `next start`, so e2e requires a prior `pnpm run build`.

## Architecture

### Auth and middleware

`middleware.ts` is the global gate. It maintains an explicit `PROTECTED_PREFIXES` allowlist (`/tools`, `/settings`, `/api/confirm-show`, `/api/shows`, `/api/audit`, `/api/asssscat`, `/api/auth/logout`, `/api/auth/status`); everything else (`/`, `/login`, `/api/auth/login`, `/api/auth/callback/*`, `/api/auth/google`, `/api/health`) is public. Authed users hitting `/login` are redirected to `/tools`. Unauthed protected requests redirect to `/login?next=…` for pages and return JSON 401 for `/api/*`.

Sessions are HMAC-signed cookies (no DB-backed session store), implemented edge-safe in `lib/session.ts` using Web Crypto: `payload.signature` where payload is base64url JSON `{ exp, v: 1, email? }` and signature is HMAC-SHA-256 over the encoded payload using `SESSION_SECRET`. `verifySession` is constant-time. The cookie is `ucb_session`, 7-day default. Two sign-in paths write this cookie:

1. `POST /api/auth/login` — shared-password gate against `UCB_APP_PASSWORD`.
2. Google OAuth flow under `/api/auth/google` → `/api/auth/callback/google` (and `/api/auth/signin/*` variants), gated to `UCB_ALLOWED_EMAIL_DOMAIN` when set.

When adding a new protected route, also add its prefix to `PROTECTED_PREFIXES` — middleware does not auto-protect new paths.

### Tool registry

`lib/tools.ts` is the **single source of truth** for tools. The hub page, the secondary `ToolsNav`, the header breadcrumb (`getActiveToolByPathname` does longest-prefix match for nested routes), and per-route `metadata` (`getToolMeta(id)`) all read from `TOOLS`. To add a tool: create `app/tools/<id>/page.tsx` using `<ToolPage>` and append an entry with matching `href`. `getToolMeta` throws on unknown ids so typos fail at build time.

### Layout chrome

`app/tools/layout.tsx` composes `ToolsHeaderWrapper` → `SiteStatusStrip` → `ToolsNav` → page content → `SiteFooter`. The marketing/landing route (`app/page.tsx`) renders `SiteHeader` directly with its own `HeaderAuth` slot. All chrome rows align to the `.app-shell` utility (`max-w-[var(--content-max)]` + horizontal padding) defined in `app/globals.css`. Shared CTA / link styles live in `lib/site-chrome.ts`.

Themes (`light`, `dark`, `gay`) are CSS-variable palettes in `app/globals.css`. Default is monochrome (foreground = primary/accent/ring); `gay` is the only theme with a chromatic accent run. Custom variants `@custom-variant dark` and `@custom-variant gay` let utilities target specific themes.

### Server actions and API surface

API routes under `app/api/`:
- `confirm-show/` — orchestrates the show-confirmation flow: producer email + Google Calendar event + Drive folder. Schemas in `lib/schemas.ts`; calendar/drive helpers in `lib/google.ts` / `lib/google-actions.ts` / `lib/calendar-event.ts`.
- `asssscat/{send,lineup-log}` — ASSSSCAT cast email + Supabase-persisted lineup log; server-only logic in `lib/asssscat-lineup-log-server.ts`.
- `audit/` — read endpoint for the audit log.
- `shows/list/` — upcoming-shows feed for the read-only Show List tool.
- `auth/{login,logout,status,google,callback,signin}` — session lifecycle.
- `health/` — public liveness check.

Persistence is split: Supabase (`lib/supabase.ts`, migrations in `supabase/migrations/`) for `audit_log` and `asssscat_lineup_log`; Google Drive/Calendar for show artifacts; HMAC cookie for sessions (no user table).

### Environment

Validated by `lib/env.ts` via `@t3-oss/env-nextjs`. `SESSION_SECRET` and `UCB_APP_PASSWORD` are required; everything else is optional and gates a feature (Google OAuth, Drive folder writes, calendar writes, allowed-domain enforcement, Supabase). `skipValidation` is on for `lint` and when `SKIP_ENV_VALIDATION=1` is set.

## Project conventions

- TypeScript only in `app/`, `components/`, `lib/`, `hooks/`. Two-space indent, single quotes, no semicolons (matches existing files).
- Prefer existing patterns in neighboring files over introducing new ones.
- Keep imports under the `@/*` path alias (`tsconfig.json`).
- Tailwind v4: use `@import "tailwindcss"` and CSS variables; do not add `tailwind.config.*`.
- Do not bundle unrelated edits into a single PR — `main` advances often (v0 pushes directly), so smaller branches rebase cleaner.
- `pnpm-lock.yaml` is authoritative; `package-lock.json` exists but CI uses pnpm.

## v0 integration

`main` is shared with v0 (https://v0.app), which can push commits directly. Assume `main` may move under your feet and rebase before pushing.
