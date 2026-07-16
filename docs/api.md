# API Documentation

Last updated: 2026-07-16

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

## Student Job Action Routes

Base group: `/student`

Middleware:

- `AuthMiddleware`
- `RoleMiddleware("STUDENT")`

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/student/job-actions` | Return current student's applied and favorite job ids |
| GET | `/student/applied-jobs` | List jobs the current student has applied to |
| GET | `/student/favorite-jobs` | List jobs the current student has saved |
| POST | `/student/jobs/:id/apply` | Apply current student to an approved job |
| POST | `/student/jobs/:id/favorite` | Save an approved job to current student's favorites |
| DELETE | `/student/jobs/:id/favorite` | Remove an approved job from current student's favorites |

Applying and saving only accept jobs with status `APPROVED`. Repeating an apply or save request for the same student/job pair returns the existing record instead of creating duplicates.

## Enterprise Routes

Base group: `/enterprise`

Middleware:

- `AuthMiddleware`
- `RoleMiddleware("ENTERPRISE")`
- `EnterpriseApprovedMiddleware(db)`

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/enterprise/applications` | List applications submitted to current enterprise's jobs |
| PUT | `/enterprise/applications/:id/status` | Accept or reject an application for current enterprise's job |
| POST | `/enterprise/jobs/` | Create enterprise job |
| GET | `/enterprise/jobs/` | List current enterprise jobs |
| PUT | `/enterprise/jobs/:id` | Update enterprise job |
| DELETE | `/enterprise/jobs/:id` | Delete/close enterprise job |

`GET /enterprise/applications` supports optional `status` and `job_id` query params. Responses preload the applied job plus the student's user profile, phone, CV URL, and skills.

`PUT /enterprise/applications/:id/status` accepts:

```json
{
  "status": "ACCEPTED",
  "employer_note": "Ứng viên phù hợp, hẹn phỏng vấn."
}
```

Allowed statuses for enterprise review are `ACCEPTED` and `REJECTED`.

`PUT /enterprise/jobs/:id` accepts the editable job fields used by the enterprise UI, including `title`, `description`, `requirements`, `salary`, `location`, `slots`, and optional `status`.

`DELETE /enterprise/jobs/:id` is a soft close: it sets the job status to `CLOSED` instead of physically deleting the row. The enterprise UI can restore a closed job by sending `status: "DRAFT"` through the update endpoint.

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
- `JobService.getEnterpriseApplications` -> `GET /enterprise/applications`
- `JobService.reviewEnterpriseApplication` -> `PUT /enterprise/applications/:id/status`
- `StudentService.getAppliedJobs` -> `GET /student/applied-jobs`
- `StudentService.getFavoriteJobs` -> `GET /student/favorite-jobs`
- `StudentService.getJobActions` -> `GET /student/job-actions`
- `StudentService.applyJob` -> `POST /student/jobs/:id/apply`
- `StudentService.saveFavoriteJob` -> `POST /student/jobs/:id/favorite`
- `StudentService.removeFavoriteJob` -> `DELETE /student/jobs/:id/favorite`

Verify before relying:

- `AuthService.forgotPassword` -> `POST /auth/forgot-password`
- `StudentService.getProfile` -> `GET /student/profile`
- `StudentService.updateProfile` -> `PUT /student/profile`
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
