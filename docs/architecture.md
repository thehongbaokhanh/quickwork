# Architecture

Last updated: 2026-07-16

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
- Student job actions use `StudentJobHandler` with direct `*gorm.DB` queries.
- Enterprise application review uses `EnterpriseJobHandler` with direct `*gorm.DB` queries scoped to the current enterprise's jobs.
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

Frontend auth UI:

- `/login` and `/auth/login` render the shared `AuthLoginExperience` login surface.
- `/register` and `/auth/register` render the shared `AuthRegisterExperience` registration surface.
- Normal login without a `redirect` query and Google callback login now land on `/`; protected-route password login still returns to the requested `redirect`.
- The shared auth page shell/input/brand structure lives in:
  - `frontend/app/components/AuthShell.vue`
  - `frontend/app/components/AuthField.vue`
  - `frontend/app/components/AuthBrandMark.vue`
  - `frontend/app/components/FooterBrandMark.vue`
- `frontend/app/middleware/auth.global.ts` treats all four auth entry routes as public pages. Existing unauthenticated protected-route redirects still go to `/auth/login`.

Public homepage UI:

- `/` renders `frontend/app/pages/index.vue`, which delegates to `frontend/app/components/HomeLandingPage.vue`.
- `HomeHeader` is auth-aware: guests see saved/login/register actions, authenticated users see notification/chat/avatar controls plus the account dropdown.
- `HomeLandingPage` is now an orchestrator only; section UI lives under `frontend/app/components/home/`.
- Homepage data and derived public statistics live in `frontend/app/composables/useHomeJobs.ts`.
- Public jobs still come from `JobService.getAllJobs()` and are mapped with `frontend/app/utils/jobDisplay.ts`; the homepage must not use mock job/company/category data.
- When an authenticated student is present, `useHomeJobs.ts` also loads `/student/job-actions` and drives homepage favorite/apply state through `StudentService`.
- The public homepage structure is:
  - `HomeHeader`
  - `HomeHero` plus `HomeSearchBar`
  - `HomeQuickStats`
  - `HomeFeaturedJobs`
  - `HomeJobDetailPanel`
  - `HomeCategories`
  - `HomeEmployerCta`
  - `HomeCareerCta`
  - `HomeFooter`
- The homepage intentionally does not show admin role selection, market-dashboard charts, or duplicated impact-stat sections.
- `HomeCareerCta` is shown only to unauthenticated visitors; authenticated users stay on the job discovery flow after login.
- `HomeFeaturedJobs` renders the full scored public job list in pages of nine jobs, with dropdown filters for location, salary, experience, category, and job type. The section auto-advances pages after a longer idle period, pauses while a job title or hover preview popup is active, and renders `HomeJobDetailPanel` beside the hovered job card only when the job title is hovered or focused, using existing `DisplayJob` data only.
- Public and auth footers share `frontend/app/components/FooterBrandMark.vue` so the QuickWork footer logo stays visible and consistent on dark backgrounds.

Public job board:

- `/student` is now the public all-jobs board reached from homepage "Xem tất cả" and ngành nghề links.
- `/student` keeps using persisted approved jobs from `JobService.getAllJobs()` and no longer requires the `student` middleware.
- `/student` job actions call `StudentService` and require authenticated role `STUDENT`; unauthenticated users are prompted to log in before applying or saving.
- The `student` layout uses the same `HomeHeader` and `HomeFooter` as the public homepage.
- `/profile` and `/settings` are authenticated account pages surfaced from the user dropdown, not top-level student nav tabs.

Enterprise applications UI:

- `/enterprise/applications` is the primary applicant list for enterprise accounts.
- `/enterprise/applications/saved` and `/enterprise/applications/rejected` reuse `frontend/app/components/enterprise/CandidateCollectionView.vue` to keep saved/rejected candidate tables visually consistent with the main applicant list.
- Saved candidates are displayed only when `JobService.getEnterpriseApplications()` returns persisted saved/bookmarked flags; the frontend does not create placeholder candidates.
- `/enterprise/interviews` and `/enterprise/notifications` are enterprise sidebar pages prepared for real scheduling/notification data and currently render empty states instead of mock lists.

## Runtime Route Groups

Registered in `backend/cmd/api/main.go`:

- public auth group under `/api/v1/auth`,
- public approved job routes under `/api/v1/jobs`,
- protected common group under `/api/v1`,
- student group under `/api/v1/student` with auth and role `STUDENT`,
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
- `frontend/app/middleware/auth.global.ts`
- `frontend/app/components/AuthShell.vue`
- `frontend/app/components/AuthField.vue`
- `frontend/app/components/AuthBrandMark.vue`
- `frontend/app/components/FooterBrandMark.vue`
- `frontend/app/components/AuthLoginExperience.vue`
- `frontend/app/components/AuthRegisterExperience.vue`
- `frontend/app/pages/login.vue`
- `frontend/app/pages/register.vue`
- `frontend/app/pages/auth/login.vue`
- `frontend/app/pages/auth/register.vue`

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

Student job actions:

- `backend/routes/student_routes.go`
- `backend/internal/handlers/student_job_handler.go`
- `backend/internal/models/job_application.go`
- `backend/internal/models/favorite_job.go`
- `frontend/app/services/student.service.ts`
- `frontend/app/composables/useHomeJobs.ts`
- `frontend/app/pages/student/index.vue`

Enterprise applications:

- `backend/routes/enterprise_routes.go`
- `backend/internal/handlers/enterprise_job_handler.go`
- `backend/internal/models/job_application.go`
- `frontend/app/services/job.service.ts`
- `frontend/app/layouts/enterprise.vue`
- `frontend/app/components/enterprise/CandidateCollectionView.vue`
- `frontend/app/pages/enterprise/applications.vue`
- `frontend/app/pages/enterprise/applications/saved.vue`
- `frontend/app/pages/enterprise/applications/rejected.vue`
- `frontend/app/pages/enterprise/interviews.vue`
- `frontend/app/pages/enterprise/notifications.vue`

Admin:

- `backend/routes/admin_routes.go`
- `backend/internal/handlers/admin_handler.go`
- `frontend/app/services/admin.service.ts`
- `frontend/app/layouts/admin.vue`
- `frontend/app/pages/admin/*.vue`

Public homepage:

- `frontend/app/pages/index.vue`
- `frontend/app/components/HomeLandingPage.vue`
- `frontend/app/components/HomeJobCard.vue`
- `frontend/app/components/HomeCategoryCard.vue`
- `frontend/app/components/home/HomeHeader.vue`
- `frontend/app/components/home/HomeHero.vue`
- `frontend/app/components/home/HomeSearchBar.vue`
- `frontend/app/components/home/HomeQuickStats.vue`
- `frontend/app/components/home/HomeFeaturedJobs.vue`
- `frontend/app/components/home/HomeJobDetailPanel.vue`
- `frontend/app/components/home/HomeCategories.vue`
- `frontend/app/components/home/HomeEmployerCta.vue`
- `frontend/app/components/home/HomeCareerCta.vue`
- `frontend/app/components/home/HomeFooter.vue`
- `frontend/app/components/FooterBrandMark.vue`
- `frontend/app/composables/useHomeJobs.ts`
- `frontend/app/services/job.service.ts`
- `frontend/app/services/student.service.ts`
- `frontend/app/utils/jobDisplay.ts`

Public job board:

- `frontend/app/pages/student/index.vue`
- `frontend/app/layouts/student.vue`
- `frontend/app/components/home/HomeHeader.vue`
- `frontend/app/components/home/HomeFooter.vue`
- `frontend/app/services/job.service.ts`
- `frontend/app/services/student.service.ts`
- `frontend/app/utils/jobDisplay.ts`
