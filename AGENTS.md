# Agent Instructions

This repo follows AI-first documentation. Do not finish a code change until the relevant docs are synchronized.

## Required Reading

Before changing code, read:

- `docs/README.md`
- the docs file that matches the area being changed
- the source files listed in that docs file

Always use CodeGraph before reading source files.

Only read source files returned by CodeGraph unless the graph does not contain the required information.

Do not scan the repository sequentially.

## Documentation Update Rules

- API route, request, response, auth, or frontend service mapping changed -> update `docs/api.md`.
- Database model, relation, enum, migration, or seed assumption changed -> update `docs/database.md`.
- Role, status, KYB, GPKD, job workflow, permission, registration, login, or admin rule changed -> update `docs/business-rules.md`.
- Entry point, module boundary, dependency flow, or source reading path changed -> update `docs/architecture.md`.
- Code style, test/build process, docs process, or agent workflow changed -> update `docs/conventions.md` and this file if needed.
- Any bugfix or behavior change worth remembering -> update `PROJECT_CHANGELOG.md`.

If no docs update is needed, explicitly say why in the final summary.

## Source-Of-Truth Rules

- Backend runtime route registration is determined by `backend/cmd/api/main.go`.
- Database schema is determined by `backend/internal/models/*` and `backend/database/migration.go`.
- Frontend API behavior is determined by `frontend/app/services/api.ts`.
- Frontend auth state is determined by `frontend/app/stores/auth.ts`.
- Frontend route guards are determined by `frontend/app/middleware/*.ts`.

## Safety Rules

- Never add real `.env` values or secrets to docs.
- Do not treat generated files as source of truth unless the task is about generation.
- Do not rely on routes that exist in `backend/routes/*.go` unless `main.go` registers them.
- Preserve user changes in the working tree.

