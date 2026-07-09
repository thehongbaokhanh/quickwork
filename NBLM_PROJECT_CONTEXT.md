# QuickWork - NBLM Project Context

Ngay cap nhat: 2026-07-09

Tai lieu nay la ban nguon gon cho NotebookLM/NBLM doc de hieu du an QuickWork. Muc tieu la giu dung luong nho nhung van du thong tin ve kien truc, cau truc thu muc, luong chay, API, model, file quan trong va cac diem can luu y khi phan tich code.

## Cach dung tai lieu nay trong NBLM

- Dung tai lieu nay nhu "ban do du an", khong phai ban sao toan bo source code.
- Khi hoi NBLM ve code, hay dua them file source lien quan neu can chi tiet implementation.
- Neu NBLM can sua tinh nang, hay bat dau tu muc "File quan trong theo tac vu".
- Khong upload cac file chua secret that len NBLM. Tai lieu nay chi neu ten bien moi truong, khong dua gia tri secret.
- Moi lan co sua code, cap nhat kien truc, them route, doi luong nghiep vu hoac fix loi quan trong, can cap nhat file nay.
- Lich su loi va thay doi chi tiet duoc ghi trong `PROJECT_CHANGELOG.md`. Neu loi cu da het, chuyen loi do vao muc "Da xu ly" thay vi de trong muc loi dang mo.

## Quy uoc cap nhat tai lieu

- `NBLM_PROJECT_CONTEXT.md`: luu ban do hien tai cua du an, kien truc, route, model, luong chay, file quan trong.
- `PROJECT_CHANGELOG.md`: luu loi, nguyen nhan, cach sua, file da sua, ket qua test/build va cac thay doi theo ngay.
- `AGENTS.md`: luu quy tac lam viec cho agent. Khi thay doi code, phai dong bo tai lieu lien quan truoc khi ket thuc cong viec.
- Tai lieu chuyen biet neu co:
  - `api.md` cho thay doi API.
  - `database.md` cho thay doi database/schema.
  - `business-rules.md` cho thay doi business logic.
- Khi sua code, uu tien cap nhat ca hai file neu thay doi anh huong den hanh vi he thong hoac cach van hanh.
- Khi sua loi, ghi ro:
  - Hien tuong loi.
  - Nguyen nhan.
  - Cach sua.
  - File lien quan.
  - Lenh da dung de kiem tra.
  - Trang thai: dang mo, da xu ly, hay can theo doi.

## Thay doi gan day can nho

Ngay 2026-07-09:

- Them bao ve tai khoan ADMIN: admin duoc dua len dau bang nguoi dung va khong hien nut/select thay doi trang thai admin.
- Backend cung chan API doi trang thai tai khoan ADMIN.
- Doanh nghiep can co GPKD va KYB `APPROVED` moi truy cap duoc khu `/enterprise`.
- Doanh nghiep chua duyet sau khi dang nhap se duoc dua ve khu `/student`.
- Dang ky doanh nghiep bat buoc co `gpkd_url`; backend reject neu thieu GPKD.
- Admin khong the duyet KYB neu doanh nghiep chua co GPKD.
- Them endpoint admin de gui yeu cau doanh nghiep nop GPKD, tao ban ghi `notifications` va `messages`.
- Nut xem GPKD trong admin enterprise detail se check GPKD truoc; neu thieu thi hien thong bao, neu co thi mo file.
- Fix loi frontend mo `/uploads/...` bang origin Nuxt gay 404; URL tuong doi se duoc resolve sang backend origin lay tu `NUXT_PUBLIC_API_BASE`.
- Them `AGENTS.md` de ap dung quy trinh CodeGraph + AI-first documentation: khi thay doi code phai cap nhat tai lieu lien quan, API/database/business logic co file tai lieu rieng neu phat sinh.

## Tong quan san pham

QuickWork la nen tang ket noi viec lam ngan han/part-time cho sinh vien va doanh nghiep.

Nhom nguoi dung:

- STUDENT: dang ky, dang nhap, xem/tim viec, quan ly ho so.
- ENTERPRISE: dang ky doanh nghiep, upload GPKD, tao va quan ly tin tuyen dung.
- ADMIN: quan ly user, sinh vien, doanh nghiep, KYB, viec lam, thong ke dashboard.

Kien truc tong the:

```text
Nuxt/Vue UI
  -> frontend app/services/*
  -> apiClient ($fetch, baseURL /api/v1, gan Bearer token)
  -> Go Fiber routes
  -> AuthMiddleware / RoleMiddleware
  -> Handler
  -> Service
  -> Repository
  -> MySQL / Redis
```

## Cong nghe chinh

Backend:

- Go module: `quickwork.local/backend`
- Framework: Fiber v2
- ORM: GORM
- Database: MySQL
- Cache/token blacklist: Redis
- Auth: JWT access token + refresh token
- Docs: Swagger tai `/swagger/*`
- Upload: static `/uploads`, Cloudinary neu co `CLOUDINARY_URL`

Frontend:

- Nuxt 4 compatibility, Vue 3, TypeScript strict
- SSR bat: `ssr: true`
- State: Pinia
- CSS/UI: TailwindCSS, Nuxt Icon, custom components
- API client: `$fetch` qua `frontend/app/services/api.ts`
- Default API base: `http://localhost:8080/api/v1`

## Entry points

Backend entry point:

- `backend/cmd/api/main.go`
- Load config tu `.env`/environment.
- Init Cloudinary, Redis, JWT secret, MySQL.
- Chay `database.Migrate(db)`.
- Khoi tao repository, service, handler.
- Tao Fiber app, CORS cho `localhost:3000`.
- Static files: `/uploads`.
- Base API group: `/api/v1`.
- Register routes: auth, protected profile/test, enterprise jobs, admin.
- Swagger: `/swagger/*`.
- Listen tren `APP_PORT`, default `8080`.

Frontend entry/config:

- `frontend/nuxt.config.ts`
- Runtime config public: `NUXT_PUBLIC_API_BASE` hoac default `http://localhost:8080/api/v1`.
- Modules: Pinia, ESLint, Nuxt Icon, Nuxt Fonts, TailwindCSS.
- Store directory: `frontend/app/stores/**`.
- CSS chinh: `frontend/app/assets/css/main.css`.

## Cau truc thu muc rut gon

```text
QuickWork/
  backend/
    cmd/api/main.go                  # backend entry point
    config/
      config.go                      # env config
      cloudinary.go                  # Cloudinary client
    database/
      mysql.go                       # GORM MySQL connection
      migration.go                   # AutoMigrate models
      redis.go, seed.go              # legacy/seed helpers
    docs/                            # Swagger generated docs
    internal/
      dto/request/                   # request DTO + validation tags
      dto/response/                  # response DTO
      handlers/                      # Fiber handlers/controllers
      middlewares/                   # auth + role middleware
      models/                        # GORM models
      repositories/                  # DB/Redis access layer
      services/                      # business logic
    pkg/
      jwt/                           # generate/verify/decode JWT
      password/                      # bcrypt helpers
      redis/                         # Redis singleton + token helpers
      response/                      # standard response helpers
      pagination/, validator/, upload/, logger/
    routes/                          # route registration
    go.mod, go.sum

  frontend/
    app/
      app.vue
      assets/css/main.css
      components/                    # shared components
      components/ui/                 # Button, Input, Modal, Select...
      composables/useToast.ts
      layouts/                       # default, auth, student, enterprise, admin
      middleware/                    # route guards
      pages/                         # Nuxt file-based routes
      plugins/api.ts                 # provides $api
      services/                      # API service wrappers
      stores/auth.ts                 # Pinia auth store
    public/
    nuxt.config.ts
    package.json
    tsconfig.json
```

Luu y: trong `frontend/app` co mot so file `.vue.js` song song voi `.vue`. Khi phan tich hoac sua code, uu tien file source `.vue` va `.ts`.

## File quan trong theo tac vu

Auth/register/login:

- Backend route: `backend/routes/auth.go`
- Backend handler: `backend/internal/handlers/auth_handler.go`
- Backend service: `backend/internal/services/auth_service.go`
- Backend middleware: `backend/internal/middlewares/auth_middleware.go`, `role_middleware.go`
- JWT helper: `backend/pkg/jwt/jwt.go`
- Redis blacklist: `backend/pkg/redis/redis.go`, `backend/internal/repositories/auth_redis_repository.go`
- Frontend service: `frontend/app/services/auth.service.ts`
- Frontend store: `frontend/app/stores/auth.ts`
- Pages: `frontend/app/pages/auth/login.vue`, `frontend/app/pages/auth/register.vue`, `frontend/app/pages/auth/google/callback.vue`

Enterprise jobs:

- Backend route: `backend/routes/enterprise_routes.go`
- Backend handler: `backend/internal/handlers/enterprise_job_handler.go`
- Backend repository: `backend/internal/repositories/job_repository.go`
- Backend model: `backend/internal/models/job.go`
- Frontend service: `frontend/app/services/job.service.ts`
- Pages: `frontend/app/pages/enterprise/index.vue`, `frontend/app/pages/enterprise/jobs/index.vue`, `frontend/app/pages/enterprise/jobs/create.vue`

Admin:

- Backend route: `backend/routes/admin_routes.go`
- Backend handler: `backend/internal/handlers/admin_handler.go`
- Frontend service: `frontend/app/services/admin.service.ts`
- Layout: `frontend/app/layouts/admin.vue`
- Pages: `frontend/app/pages/admin/*.vue`

Frontend auth/role navigation:

- Store: `frontend/app/stores/auth.ts`
- API client: `frontend/app/services/api.ts`
- Middleware: `frontend/app/middleware/auth.ts`, `admin.ts`, `student.ts`, `company.ts`, `guest.ts`, `auth.global.ts`
- Layouts: `auth.vue`, `student.vue`, `enterprise.vue`, `admin.vue`

Config/runtime:

- Backend env: `backend/config/config.go`
- MySQL: `backend/database/mysql.go`
- Redis: `backend/pkg/redis/redis.go`
- Nuxt API base: `frontend/nuxt.config.ts`

Tests hien co:

- `backend/pkg/validator/validate_test.go`
- `backend/pkg/pagination/pagination_test.go`
- `backend/pkg/logger/logger_test.go`
- `backend/pkg/response/response_test.go`
- `backend/internal/repositories/base_repository_test.go`
- `backend/internal/repositories/job_repository_test.go`

## Backend route map hien tai

Base API: `/api/v1`

Public auth routes:

- `POST /auth/register-student`
- `POST /auth/register-enterprise`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/register-admin`
- `POST /auth/upload`
- `POST /auth/google`
- `GET /auth/google/config`

Protected common routes:

- `GET /profile`
- `GET /admin/test` with role ADMIN
- `GET /student/test` with role STUDENT
- `GET /enterprise/test` with role ENTERPRISE

Enterprise routes, protected by JWT + role ENTERPRISE:

- `POST /enterprise/jobs/`
- `GET /enterprise/jobs/`
- `PUT /enterprise/jobs/:id`
- `DELETE /enterprise/jobs/:id`

Admin routes, protected by JWT + role ADMIN:

- `GET /admin/users`
- `GET /admin/students`
- `GET /admin/enterprises`
- `PUT /admin/users/:id/status`
- `PUT /admin/enterprises/:id/kyb`
- `POST /admin/enterprises/:id/request-gpkd`
- `GET /admin/jobs`
- `PUT /admin/jobs/:id/review`
- `GET /admin/dashboard/stats`
- `GET /admin/users/recent`

Other backend endpoints:

- `GET /swagger/*`
- Static files: `/uploads/*`

Important caveat:

- `backend/routes/job_routes.go` and `backend/routes/routes.go` contain older/alternate route setup, but current `backend/cmd/api/main.go` does not call `RegisterJobRoutes` or `SetupRoutes`.
- Frontend `JobService` has `getAllJobs('/jobs')` and `getJobDetail('/jobs/:id')`; verify backend registration before relying on public job listing/detail APIs.

## Response shape

Backend handlers mostly return JSON in this style:

```json
{
  "success": true,
  "message": "optional human message",
  "data": {}
}
```

Error shape:

```json
{
  "success": false,
  "message": "error message",
  "errors": "optional validation detail"
}
```

Some handlers return direct `fiber.Map` inline instead of shared response helpers.

## Data models chinh

`User` (`backend/internal/models/user.go`)

- Table: `users`
- Fields: `id`, `email`, `password`, `role`, `status`, timestamps, soft delete.
- Roles: `ADMIN`, `STUDENT`, `ENTERPRISE`.
- Statuses: `ACTIVE`, `INACTIVE`, `BANNED`.
- Relations: one student profile, one enterprise profile.

`StudentProfile` (`backend/internal/models/student_profile.go`)

- Table: `student_profiles`
- Primary key: `user_id`
- Fields: `name`, `phone`, `avatar`, `cv_url`, timestamps, soft delete.
- Relations: belongs to user, many-to-many skills.

`EnterpriseProfile` (`backend/internal/models/enterprise_profile.go`)

- Table: `enterprise_profiles`
- Primary key: `user_id`
- Fields: `company_name`, `tax_code`, `gpkd_url`, `kyb_status`, `status_kyb`, timestamps, soft delete.
- KYB statuses: `PENDING`, `APPROVED`, `REJECTED`.

`Job` (`backend/internal/models/job.go`)

- Table: `jobs`
- Fields: `id`, `enterprise_id`, `title`, `description`, `requirements`, `salary`, `location`, `slots`, `status`, `reject_reason`, timestamps.
- Statuses: `DRAFT`, `PENDING`, `APPROVED`, `REJECTED`, `CLOSED`.
- Relations: enterprise profile by `enterprise_id -> enterprise_profiles.user_id`, many-to-many skills.

Other migrated models:

- `Category`
- `Skill`
- `Notification`
- `Transaction`
- `Message`

Migration:

- `backend/database/migration.go` calls `db.AutoMigrate(...)` for all models above.

## Auth va token flow

Register student:

- `POST /auth/register-student`
- Creates `users` row with role STUDENT and status ACTIVE.
- Creates `student_profiles` row in same DB transaction.
- Password is hashed with bcrypt helper in `pkg/password`.

Register enterprise:

- `POST /auth/register-enterprise`
- Checks duplicate email and duplicate tax code.
- Creates `users` row with role ENTERPRISE and status ACTIVE.
- Creates `enterprise_profiles` row with KYB PENDING.

Register first admin:

- `POST /auth/register-admin`
- Requires admin secret from config.
- Only allows admin creation if no admin exists.

Login:

- `POST /auth/login`
- Checks email, password, user status ACTIVE.
- Generates access token and refresh token.
- Frontend stores:
  - `access_token` cookie
  - `refresh_token` cookie
  - `user_profile` cookie
  - legacy localStorage keys for compatibility
- Login response for enterprise also includes:
  - `enterprise_kyb_status`
  - `enterprise_approved`
  - `business_license_url`

Request auth:

- `frontend/app/services/api.ts` reads `access_token` cookie.
- If token exists, it sets `Authorization: Bearer <token>`.
- Backend `AuthMiddleware` checks:
  - Authorization header exists.
  - Header starts with `Bearer `.
  - Token not in Redis blacklist.
  - JWT verifies.
  - Sets `c.Locals("user_id")` and `c.Locals("role")`.

Logout:

- Frontend calls `POST /auth/logout`, then clears cookies/localStorage.
- Backend blacklists access and refresh token in Redis until token expiration.

Google login:

- Frontend gets `GET /auth/google/config`.
- If Google client ID exists, redirects to Google OAuth.
- Otherwise code path can use mock redirect code.
- Callback page should call backend `POST /auth/google`.

## Frontend route/layout map

Nuxt pages:

- `/` -> `frontend/app/pages/index.vue`
- `/auth/login` -> login page with `auth` layout
- `/auth/register` -> register page with `auth` layout
- `/auth/google/callback` -> Google callback
- `/student` -> student dashboard/index with `student` layout
- `/enterprise` -> enterprise dashboard/index with `enterprise` layout
- `/enterprise/jobs` -> enterprise job list
- `/enterprise/jobs/create` -> create job page
- `/admin` and `/admin/dashboard` -> admin overview
- `/admin/users`, `/admin/students`, `/admin/enterprises`, `/admin/jobs`, `/admin/categories`, `/admin/applications`, `/admin/reports`, `/admin/settings`
- Error pages: `/403`, `/404`, `/500`
- Shared pages: `/profile`, `/settings`, `/forgot-password`

Layouts:

- `auth.vue`: login/register shell.
- `student.vue`: student navbar, notification/user dropdown.
- `enterprise.vue`: enterprise shell.
- `admin.vue`: admin sidebar/topbar and admin navigation.
- `default.vue`: default public shell.

Route middleware:

- `auth.ts`: requires login.
- `admin.ts`: requires role ADMIN.
- `student.ts`: requires role STUDENT.
- `company.ts`: intended for enterprise/company role guard.
- `guest.ts`: intended for unauthenticated-only pages.
- `auth.global.ts`: global auth behavior; inspect when debugging redirects.

## Frontend API service map

`frontend/app/services/api.ts`

- Core wrapper around `$fetch`.
- Uses `config.public.apiBase` for relative URLs.
- Sets JSON Content-Type by default.
- Removes Content-Type for `FormData`.
- Adds Bearer token from `access_token` cookie.

`AuthService`

- `login` -> `POST /auth/login`
- `logout` -> `POST /auth/logout`
- `registerStudent` -> `POST /auth/register-student`
- `registerEnterprise` -> `POST /auth/register-enterprise`
- `uploadGPKD` -> `POST /auth/upload`
- `forgotPassword` -> `POST /auth/forgot-password` (backend route not visible in current main route map; verify before relying on it)

`AdminService`

- `getDashboardStats` -> `GET /admin/dashboard/stats`
- `getUsers` -> `GET /admin/users`
- `getStudents` -> `GET /admin/students`
- `getEnterprises` -> `GET /admin/enterprises`
- `getRecentUsers` -> `GET /admin/users/recent`
- `getPendingJobs` -> `GET /admin/jobs`
- `updateUserStatus` -> `PUT /admin/users/:id/status`
- `updateEnterpriseKYB` -> `PUT /admin/enterprises/:id/kyb`
- `requestEnterpriseGPKD` -> `POST /admin/enterprises/:id/request-gpkd`
- `reviewJob` -> `PUT /admin/jobs/:id/review`

`JobService`

- `getEnterpriseJobs` -> `GET /enterprise/jobs`
- `createEnterpriseJob` -> `POST /enterprise/jobs`
- `updateEnterpriseJob` -> `PUT /enterprise/jobs/:id`
- `deleteEnterpriseJob` -> `DELETE /enterprise/jobs/:id`
- `getAllJobs` -> `GET /jobs` (verify backend registration)
- `getJobDetail` -> `GET /jobs/:id` (verify backend registration)

`StudentService`

- `getProfile` -> `GET /student/profile` (verify backend registration)
- `updateProfile` -> `PUT /student/profile` (verify backend registration)
- `getAppliedJobs` -> `GET /student/applied-jobs` (verify backend registration)

`CompanyService`

- `getProfile` -> `GET /company/profile` (verify backend registration)

## Bien moi truong can biet

Backend config fields in `backend/config/config.go`:

- `APP_NAME`
- `APP_PORT`
- `APP_ENV`
- `ADMIN_SECRET`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `REDIS_HOST`
- `REDIS_PORT`
- `REDIS_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRY_HOURS`
- `JWT_REFRESH_EXPIRY_HOURS`
- `UPLOAD_DIR`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `CLOUDINARY_URL` for Cloudinary init

Frontend env:

- `NUXT_PUBLIC_API_BASE`, default `http://localhost:8080/api/v1`

Security note:

- Do not upload real `.env` values or production secrets to NBLM.
- If config source has development fallback secrets, treat them as local-only and replace with environment variables for real deployment.

## Lenh chay thuong dung

Backend:

```bash
cd backend
go run ./cmd/api
go test ./...
```

Frontend:

```bash
cd frontend
npm install
npm run dev
npm run build
```

Local defaults:

- Backend: `http://localhost:8080`
- API base: `http://localhost:8080/api/v1`
- Frontend dev: usually `http://localhost:3000`
- MySQL and Redis must be running before backend starts.

## Quy tac mo rong tinh nang

Them backend feature moi:

1. Them/doi model trong `backend/internal/models` neu can schema.
2. Them DTO trong `backend/internal/dto/request` va/hoac `response`.
3. Them repository method neu can query DB.
4. Them service logic trong `backend/internal/services`.
5. Them handler trong `backend/internal/handlers`.
6. Register route trong `backend/routes`.
7. Dam bao `backend/cmd/api/main.go` thuc su goi route registration.
8. Them test neu logic co risk cao.

Them frontend feature moi:

1. Tao/cap nhat API wrapper trong `frontend/app/services`.
2. Dung `apiClient` de duoc gan baseURL va Bearer token tu dong.
3. Tao/cap nhat Pinia store neu state dung lai nhieu noi.
4. Tao/cap nhat page trong `frontend/app/pages`.
5. Gan layout/middleware bang `definePageMeta`.
6. Dung component san co trong `frontend/app/components` va `components/ui`.

## Diem can luu y cho NBLM

- `PROJECT_OVERVIEW.md` cu trong repo co noi dung dai va co dau hieu loi encoding tieng Viet; file nay la ban goc nen uu tien hon khi hoi tong quan.
- `backend/main.exe`, `frontend/package-lock.json`, `backend/go.sum`, `backend/docs/*` la artifact/generated hoac dependency lock; khong can doc de hieu kien truc.
- Cac endpoint frontend service goi nhung khong thay route trong current `main.go` can duoc xem la "can verify", khong mac dinh da hoat dong.
- Role backend dung gia tri uppercase (`ADMIN`, `STUDENT`, `ENTERPRISE`), middleware role so sanh case-insensitive.
- Job status va KYB status la cac enum string; can giu dong bo backend/frontend.
- API response khong hoan toan tap trung qua helper, nen khi sua loi response format can kiem tra tung handler.
- Redis la bat buoc trong current `main.go`; neu Redis init fail backend se `log.Fatal`.
- MySQL migration chay khi backend start; thay doi model co the tu dong anh huong schema local.
- Cac URL file dang dang `/uploads/...` phai duoc mo qua backend origin, khong mo truc tiep qua Nuxt frontend origin.
- Tai khoan ADMIN la protected account; khong tao UI hoac API cho phep khoa/cam admin neu khong co yeu cau ro rang.

## Cau hoi mau nen hoi NBLM

- "Hay giai thich luong dang nhap tu frontend den backend trong QuickWork."
- "Neu them endpoint cap nhat profile sinh vien, can sua nhung file nao?"
- "Hay kiem tra frontend service nao dang goi endpoint chua co trong backend route map."
- "Hay de xuat test cases cho enterprise job CRUD."
- "Hay lap danh sach model va quan he database chinh cua QuickWork."
