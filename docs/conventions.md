# Project Conventions

Last updated: 2026-07-09

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

## Frontend Conventions

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
npm run build
```

Run the smallest useful verification first, then broader checks if the change touches shared behavior.

## Change Summary Conventions

When finishing a change, report:

- files changed,
- behavior changed,
- docs updated,
- verification run,
- known limitations or follow-up risks.

