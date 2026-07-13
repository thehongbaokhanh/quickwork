# QuickWork Documentation Index

Last updated: 2026-07-09

This directory is the project documentation source of truth. It is written for both developers and AI agents.

## Reading Order

For a new developer or AI agent:

1. `README.md` at repo root.
2. `docs/ai-first-documentation.md`
3. `docs/architecture.md`
4. `docs/business-rules.md`
5. `docs/api.md`
6. `docs/database.md`
7. `docs/conventions.md`
8. `PROJECT_CHANGELOG.md`

For a bugfix:

1. Read the relevant source files.
2. Read the matching docs file below.
3. Make the code change.
4. Update docs and changelog before finishing.

## Document Ownership

| Area | File to update |
| --- | --- |
| System architecture, entry points, module boundaries | `docs/architecture.md` |
| API routes, request/response shape, route caveats | `docs/api.md` |
| Database models, tables, relations, enums, migrations | `docs/database.md` |
| Business rules, roles, permissions, workflow states | `docs/business-rules.md` |
| Code style, docs style, test/build rules, agent workflow | `docs/conventions.md` |
| AI reading workflow, source bundles, prompt templates | `docs/ai-first-documentation.md` |
| Bugs, fixes, verification history | `PROJECT_CHANGELOG.md` |
| Agent-specific mandatory instructions | `AGENTS.md` |

## Source Of Truth Rules

- Backend runtime source of truth: `backend/cmd/api/main.go`.
- Backend route activation is true only if `main.go` registers the route group.
- Frontend API behavior source of truth: `frontend/app/services/api.ts`.
- Frontend auth state source of truth: `frontend/app/stores/auth.ts`.
- Frontend routing guards source of truth: `frontend/app/middleware/*.ts`.
- Database schema source of truth: `backend/internal/models/*` plus `backend/database/migration.go`.

## Do Not Upload Or Rely On

- `.env` files or real secrets.
- `backend/main.exe`.
- `backend/uploads/*` unless debugging upload files.
- Generated Swagger files unless API documentation generation is the task.
- Dependency lock files unless dependency resolution is the task.

