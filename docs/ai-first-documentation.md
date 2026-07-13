# AI-First Documentation

Last updated: 2026-07-09

AI-first documentation means every important project decision is easy for an AI agent and a human developer to locate, verify against source, and update safely.

## Goals

- Reduce time spent rediscovering project structure.
- Make source-of-truth files explicit.
- Keep business rules separate from implementation detail.
- Mark uncertainty instead of hiding it.
- Keep docs small enough to read, but precise enough to guide source inspection.

## Required Pattern

Every important doc should answer:

- What is this area responsible for?
- Which source files are authoritative?
- What flows or invariants matter?
- What changes require this doc to be updated?
- What is known, what is deprecated, and what needs verification?

## Source Bundle Pattern

When asking an AI tool to analyze a feature, attach this order:

1. The relevant docs file from `docs/`.
2. The route or page entry point.
3. The handler/service/repository or frontend service/store.
4. The model/DTO files involved.
5. The changelog entry if the question relates to a prior bug.

Example for auth:

- `docs/architecture.md`
- `docs/business-rules.md`
- `docs/api.md`
- `frontend/app/pages/auth/login.vue`
- `frontend/app/services/auth.service.ts`
- `frontend/app/stores/auth.ts`
- `backend/routes/auth.go`
- `backend/internal/handlers/auth_handler.go`
- `backend/internal/services/auth_service.go`
- `backend/internal/models/user.go`

## Documentation Update Contract

Any code change must update docs when it changes:

- API path, method, auth requirement, request body, response body, or error behavior.
- Database model, relation, enum, migration, or stored field meaning.
- Role, permission, KYB, GPKD, job status, registration, login, or admin workflow.
- Runtime entry point, dependency, environment variable, or startup behavior.
- Reusable frontend service, store, middleware, layout, or component convention.

If no docs update is needed, the final work summary should say why.

## How To Mark Uncertainty

Use clear labels:

- `Confirmed`: verified in currently registered source.
- `Verify before relying`: present in code but not confirmed in runtime registration.
- `Legacy/alternate`: code exists but current entry point does not use it.
- `Generated`: generated artifact, not the authoring source.

Do not delete a caveat just because it is inconvenient. Delete it only after verifying source and updating the relevant docs.

## Good AI Prompts

- "Using docs/architecture.md and backend/cmd/api/main.go, explain the backend request flow."
- "Compare docs/api.md with frontend/app/services and list routes that need verification."
- "Using docs/business-rules.md, identify files enforcing enterprise KYB and GPKD access."
- "Using docs/database.md, list schema impacts of adding a new job application model."
- "Review this change and tell me which docs need updates before the work is complete."

