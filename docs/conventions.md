# Project Conventions

Last updated: 2026-07-28

## Documentation Conventions

- Keep docs in `docs/` as the durable project knowledge base.
- Use ASCII Vietnamese or English unless a file already intentionally uses UTF-8 Vietnamese and encoding is verified.
- Mark unverified behavior as `Verify before relying`.
- Keep generated output out of docs unless the task is about generated output.
- When code changes behavior, update docs in the same change.

## Backend Conventions

Preferred flow:

```text
route -> middleware -> handler -> service -> repository -> model
```

Current code has some direct handler-to-DB paths, especially admin handlers. New complex business logic should prefer service/repository separation.

Rules:

- Register active routes from `backend/cmd/api/main.go`.
- Use request/response DTOs for public API payloads.
- Keep role/status strings aligned with model constants.
- Use transactions for multi-table writes.
- Keep secret values in env, not docs.
- Add focused tests for risky business logic or shared helpers.
- Do not create `models.Notification` or `models.Message` directly in business handlers for notification/chat flows. Use `NotificationService` and `ConversationService` so ownership, transaction, source metadata, and unread counters stay consistent.

## Frontend Conventions

- Persisted Enterprise navigation state must go through `useEnterpriseUiState` and the single `quickwork:enterprise-ui` localStorage record. Restore it only on the client to avoid SSR hydration mismatches; do not create a separate storage key per sidebar or accordion.

Rules:

- Use `frontend/app/services/api.ts` instead of raw `$fetch` for app API calls unless there is a clear reason.
- Prefer relative API paths with `apiClient`; avoid manually concatenating `config.public.apiBase` when not needed.
- Store shared auth/session state in `frontend/app/stores/auth.ts`.
- Put route access rules in middleware instead of duplicating checks across pages.
- Use existing UI components in `frontend/app/components` and `frontend/app/components/ui`.
- Keep role/status labels synchronized with backend enums.

## Route Conventions

- Confirm route activation through `backend/cmd/api/main.go`.
- Do not assume code in `backend/routes/*.go` is active unless `main.go` calls it.
- Document new routes in `docs/api.md`.
- Update frontend service mapping when adding/changing backend routes.

## Database Conventions

- Model changes must update `docs/database.md`.
- Business meaning of model fields must update `docs/business-rules.md`.
- Be careful with `AutoMigrate` because startup can alter local schema.
- Avoid adding duplicate semantic fields; if compatibility requires them, document the fallback path and cleanup plan.

## Test And Build Conventions

Backend:

```bash
cd backend
go test ./...
```

Frontend:

```bash
cd frontend
npm run typecheck
npm run build
```

Production container configuration:

```bash
docker compose --env-file .env.production.example -f compose.yaml -f compose.production.yaml config --quiet
```

Use the example file only for static validation. A real deployment must use an ignored `.env.production` with rotated secrets and existing TLS file paths.

Production must fail closed: `APP_ENV=production` requires non-placeholder JWT/admin/database/Redis secrets, explicit HTTPS CORS origins, a real `CLOUDINARY_URL`, `AUTH_COOKIE_SECURE=true`, `AUTH_EXPOSE_TOKENS=false`, a bootstrap admin IP allowlist, disabled seed data and required ClamAV scanning. Do not weaken validation to make an incomplete deployment start.

Off-site backups use Docker secret files under `secrets/` (Git-ignored). Never place restic passwords or cloud credential contents in `.env.production`; it may contain only the paths to those secret files.

Full-stack local container verification:

```powershell
Copy-Item .env.local.example .env
docker compose config --quiet
docker compose build
docker compose up -d
docker compose ps
```

Plain local commands intentionally load `compose.override.yaml`; production validation must keep the explicit `-f compose.yaml -f compose.production.yaml` pair so the local HTTP and RabbitMQ Management bindings are not applied.

`npm run typecheck` and `npm run typecheck:watch` run `vue-tsc` with `--incremental false` so Windows watcher sessions do not compete for `.nuxt/*.tsbuildinfo` cache files.

Nuxt's in-process TypeScript checker remains disabled in `nuxt.config.ts`. Run the dedicated typecheck command separately; enabling both the Nuxt dev checker and generated-type writers can intermittently fail on Windows while writing `.nuxt/eslint.config.mjs` or `.nuxt/tsconfig.server.json`.

The frontend `dev` script runs `nuxt dev --no-fork`. On Windows this keeps one Nuxt runtime responsible for generated `.nuxt` type/config files and avoids forked workers racing on `tsconfig.app.json`. If a previous forked dev session failed during startup, stop that session and run `npm run postinstall` once before restarting `npm run dev`.

Legacy emitted `.js` copies that still sit beside maintained `.ts` composables or utilities are excluded explicitly through `nuxt.config.ts` `ignore`. Add new application behavior to the TypeScript source; do not re-enable a same-name JavaScript copy in Nuxt's auto-import scan.

Run the smallest useful verification first, then broader checks if the change touches shared behavior.

## Change Summary Conventions

When finishing a change, report:

- files changed,
- behavior changed,
- docs updated,
- verification run,
- known limitations or follow-up risks.
