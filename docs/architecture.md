# Architecture

Last updated: 2026-07-10

## Product Context

QuickWork connects students with enterprises posting short-term or part-time jobs.

Main roles:

- `STUDENT`: register, log in, access student area, manage profile, view job-related pages.
- `ENTERPRISE`: register company, upload GPKD, create/manage jobs after approval.
- `ADMIN`: manage users, enterprises, KYB, jobs, dashboard data.

## High-Level Runtime Flow

```text
Nuxt/Vue page
  -> frontend/app/services/*
  -> frontend/app/services/api.ts
  -> HTTP /api/v1
  -> Go Fiber route
  -> AuthMiddleware / RoleMiddleware / EnterpriseApprovedMiddleware
  -> handler
  -> service or repository
  -> GORM
  -> MySQL
  -> Redis for token blacklist/refresh-token support
```

## Backend Entry Point

Source of truth: `backend/cmd/api/main.go`

Runtime responsibilities:

- load config from `.env` or environment,
- initialize Cloudinary,
- initialize Redis,
- set JWT secret,
- connect to MySQL,
- run `database.Migrate(db)`,
- run `database.Seed(db)` for idempotent local/demo data,
- build repositories/services/handlers,
- configure Fiber and CORS,
- serve static uploads at `/uploads`,
- register `/api/v1` routes,
- register Swagger at `/swagger/*`,
- listen on `APP_PORT` defaulting to `8080`.

Important: a route is runtime-active only if it is registered by `main.go`.

## Backend Layering

Common path:

```text
routes -> middlewares -> handlers -> services/repositories -> models -> database
```

Current patterns:

- Auth uses handler plus service plus repositories.
- Enterprise jobs use handler plus job repository.
- Admin currently uses handler with direct `*gorm.DB` queries.
- Shared helpers live under `backend/pkg`.

Main backend directories:

- `backend/internal/handlers`: Fiber handlers/controllers.
- `backend/internal/services`: business logic, especially auth and job service variants.
- `backend/internal/repositories`: DB/Redis access wrappers.
- `backend/internal/models`: GORM models and enums.
- `backend/internal/middlewares`: auth, role, enterprise KYB access.
- `backend/routes`: route registration helpers.
- `backend/pkg`: shared utilities.
- `backend/database`: MySQL/Redis initialization and migrations.

## Frontend Entry Points

Source files:

- `frontend/nuxt.config.ts`
- `frontend/app/app.vue`
- `frontend/app/plugins/api.ts`
- `frontend/app/services/api.ts`
- `frontend/app/stores/auth.ts`
- `frontend/app/middleware/*.ts`
- `frontend/app/pages/**/*.vue`

Frontend request flow:

```text
page/layout/component
  -> service in frontend/app/services
  -> apiClient
  -> runtime config public.apiBase
  -> backend /api/v1
```

`apiClient` behavior:

- relative URLs use `config.public.apiBase`,
- absolute URLs bypass baseURL,
- cookie `access_token` becomes `Authorization: Bearer <token>`,
- JSON content type is default,
- `FormData` removes content type so browser can set multipart boundary.

## Runtime Route Groups

Registered in `backend/cmd/api/main.go`:

- public auth group under `/api/v1/auth`,
- public approved job routes under `/api/v1/jobs`,
- protected common group under `/api/v1`,
- enterprise group under `/api/v1/enterprise` with auth, role `ENTERPRISE`, and approved enterprise middleware,
- admin group under `/api/v1/admin` with auth and role `ADMIN`.

Legacy/alternate route caveat:

- `backend/routes/job_routes.go` exists but current `main.go` does not call `RegisterJobRoutes`.
- `backend/routes/routes.go` exists but current `main.go` does not call `SetupRoutes`.

## Source Reading Bundles

Auth:

- `backend/cmd/api/main.go`
- `backend/routes/auth.go`
- `backend/internal/handlers/auth_handler.go`
- `backend/internal/services/auth_service.go`
- `backend/internal/repositories/user_repository.go`
- `backend/internal/repositories/student_repository.go`
- `backend/internal/repositories/enterprise_repository.go`
- `backend/internal/repositories/auth_redis_repository.go`
- `backend/pkg/jwt/jwt.go`
- `backend/pkg/password/password.go`
- `backend/pkg/redis/redis.go`
- `frontend/app/services/auth.service.ts`
- `frontend/app/stores/auth.ts`

Enterprise access:

- `backend/internal/middlewares/auth_middleware.go`
- `backend/internal/middlewares/role_middleware.go`
- `backend/internal/middlewares/enterprise_kyb_middleware.go`
- `frontend/app/middleware/company.ts`
- `frontend/app/middleware/student.ts`
- `frontend/app/middleware/auth.global.ts`

Enterprise jobs:

- `backend/routes/enterprise_routes.go`
- `backend/internal/handlers/enterprise_job_handler.go`
- `backend/internal/repositories/job_repository.go`
- `backend/internal/models/job.go`
- `frontend/app/services/job.service.ts`
- `frontend/app/pages/enterprise/index.vue`
- `frontend/app/pages/enterprise/jobs/index.vue`
- `frontend/app/pages/enterprise/jobs/create.vue`

Admin:

- `backend/routes/admin_routes.go`
- `backend/internal/handlers/admin_handler.go`
- `frontend/app/services/admin.service.ts`
- `frontend/app/layouts/admin.vue`
- `frontend/app/pages/admin/*.vue`
