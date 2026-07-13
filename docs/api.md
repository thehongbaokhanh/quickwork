# API Documentation

Last updated: 2026-07-10

Base API: `/api/v1`

Runtime source of truth: `backend/cmd/api/main.go`

## Response Shape

Common success:

```json
{
  "success": true,
  "message": "optional message",
  "data": {}
}
```

Common error:

```json
{
  "success": false,
  "message": "error message",
  "errors": "optional validation detail"
}
```

Caveat: some handlers return inline `fiber.Map`, so inspect the specific handler before changing response contracts.

Login error behavior:

- `401` for invalid email/password.
- `403` for `INACTIVE`, `BANNED`, enterprise `PENDING`, or enterprise `REJECTED` accounts.
- Enterprise accounts must be KYB approved before a login response is issued.

## Public Auth Routes

Registered by `routes.RegisterAuthRoutes(api, authHandler)`.

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/auth/register-student` | Register student account |
| POST | `/auth/register-enterprise` | Register enterprise account |
| POST | `/auth/login` | Login and return tokens |
| POST | `/auth/logout` | Logout and blacklist tokens |
| POST | `/auth/register-admin` | Register first admin |
| POST | `/auth/upload` | Upload GPKD file |
| POST | `/auth/google` | Login/register through Google flow |
| GET | `/auth/google/config` | Return Google OAuth config/mock config |

## Public Job Routes

Registered directly in `backend/cmd/api/main.go`.

Only jobs with status `APPROVED` are returned.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/jobs` | List public approved jobs |
| GET | `/jobs/:id` | Get one public approved job |

`GET /jobs` query params:

| Param | Purpose |
| --- | --- |
| `q` | Search title, description, requirements, location, or salary |
| `location` | Filter by location text |
| `salary` | Filter by salary text |

Public job responses include the job fields used by the frontend plus preloaded `enterprise_profile`, `skills`, and each skill category.

## Protected Common Routes

Middleware: `AuthMiddleware`.

When initialized with DB access in `cmd/api/main.go`, `AuthMiddleware` also checks the current user row and rejects non-active accounts even when the JWT is still valid.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/profile` | Authenticated profile/test endpoint |
| GET | `/admin/test` | Admin test endpoint |
| GET | `/student/test` | Student test endpoint |
| GET | `/enterprise/test` | Enterprise test endpoint |

## Enterprise Routes

Base group: `/enterprise`

Middleware:

- `AuthMiddleware`
- `RoleMiddleware("ENTERPRISE")`
- `EnterpriseApprovedMiddleware(db)`

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/enterprise/jobs/` | Create enterprise job |
| GET | `/enterprise/jobs/` | List current enterprise jobs |
| PUT | `/enterprise/jobs/:id` | Update enterprise job |
| DELETE | `/enterprise/jobs/:id` | Delete/close enterprise job |

## Admin Routes

Base group: `/admin`

Middleware:

- `AuthMiddleware`
- `RoleMiddleware("ADMIN")`

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/admin/users` | List users |
| GET | `/admin/students` | List students |
| GET | `/admin/enterprises` | List enterprises |
| PUT | `/admin/users/:id` | Update user email/status and role-specific profile fields |
| PUT | `/admin/users/:id/status` | Update user status, except admin accounts |
| PUT | `/admin/enterprises/:id/kyb` | Update enterprise KYB status |
| POST | `/admin/enterprises/:id/request-gpkd` | Request enterprise GPKD submission |
| GET | `/admin/jobs` | List jobs for admin review |
| PUT | `/admin/jobs/:id/review` | Review a job |
| GET | `/admin/dashboard/stats` | Dashboard stats |
| GET | `/admin/users/recent` | Recent users |

`PUT /admin/users/:id` request body uses optional fields:

```json
{
  "email": "user@example.com",
  "status": "ACTIVE",
  "student_profile": {
    "name": "Student name",
    "phone": "0900000000",
    "avatar": "/uploads/avatar.png",
    "cv_url": "/uploads/cv.pdf"
  },
  "enterprise_profile": {
    "company_name": "Company name",
    "tax_code": "0100000000",
    "gpkd_url": "/uploads/gpkd.pdf",
    "kyb_status": "APPROVED"
  }
}
```

Only the profile object matching the user's role is accepted. Admin account status remains protected.

## Non-API Runtime Routes

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/swagger/*` | Swagger UI |
| GET | `/uploads/*` | Static uploaded files |

## Frontend Service Mapping

Confirmed against current `main.go`:

- `AuthService.login` -> `POST /auth/login`
- `AuthService.logout` -> `POST /auth/logout`
- `AuthService.registerStudent` -> `POST /auth/register-student`
- `AuthService.registerEnterprise` -> `POST /auth/register-enterprise`
- `AuthService.uploadGPKD` -> `POST /auth/upload`
- `AdminService.updateUser` -> `PUT /admin/users/:id`
- `AdminService.*` -> `/admin/*` routes listed above
- `JobService.getAllJobs` -> `GET /jobs`
- `JobService.getJobDetail` -> `GET /jobs/:id`
- `JobService.getEnterpriseJobs` -> `GET /enterprise/jobs`
- `JobService.createEnterpriseJob` -> `POST /enterprise/jobs`
- `JobService.updateEnterpriseJob` -> `PUT /enterprise/jobs/:id`
- `JobService.deleteEnterpriseJob` -> `DELETE /enterprise/jobs/:id`

Verify before relying:

- `AuthService.forgotPassword` -> `POST /auth/forgot-password`
- `StudentService.getProfile` -> `GET /student/profile`
- `StudentService.updateProfile` -> `PUT /student/profile`
- `StudentService.getAppliedJobs` -> `GET /student/applied-jobs`
- `CompanyService.getProfile` -> `GET /company/profile`

Legacy/alternate route caveat:

- `backend/routes/job_routes.go` has routes that are not called by current `main.go`.
- `backend/routes/routes.go` has `SetupRoutes`, but current `main.go` does not call it.

## API Update Triggers

Update this file when changing:

- route method/path,
- middleware/auth requirement,
- request body,
- response shape,
- query params,
- error behavior,
- frontend service mapping.
