# API Documentation

Last updated: 2026-07-17

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

`POST /auth/register-enterprise` accepts enterprise contact phone as required profile data:

```json
{
  "email": "company@example.com",
  "password": "secret123",
  "company_name": "Company name",
  "phone": "0900000000",
  "tax_code": "0100000000",
  "gpkd_url": "/uploads/gpkd.pdf"
}
```

## Public Job Routes

Registered directly in `backend/cmd/api/main.go`.

Only jobs with status `APPROVED` and `slots > 0` are returned.

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
| POST | `/auth/change-password` | Change password for the current authenticated user |
| GET | `/admin/test` | Admin test endpoint |
| GET | `/student/test` | Student test endpoint |
| GET | `/enterprise/test` | Enterprise test endpoint |

`POST /auth/change-password` accepts:

```json
{
  "current_password": "CurrentPass123",
  "new_password": "NewPass123",
  "confirm_password": "NewPass123"
}
```

The endpoint verifies the current password, rejects reusing the same password, hashes the new password, and updates the current `users.password` row. The new password must be at least 8 characters, include uppercase and lowercase letters, include a digit or special character, and contain no whitespace.

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

Applying and saving only accept jobs with status `APPROVED` and `slots > 0`. Repeating an apply or save request for the same student/job pair returns the existing record instead of creating duplicates.

## Enterprise Routes

Base group: `/enterprise`

Middleware:

- `AuthMiddleware`
- `RoleMiddleware("ENTERPRISE")`
- `EnterpriseApprovedMiddleware(db)`

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/enterprise/profile` | Return the current enterprise account and profile |
| PUT | `/enterprise/profile` | Update current enterprise company name and contact phone |
| GET | `/enterprise/applications` | List applications submitted to current enterprise's jobs |
| PUT | `/enterprise/applications/:id/status` | Accept or reject an application for current enterprise's job |
| PUT | `/enterprise/applications/:id/interview` | Schedule or update an interview for an accepted application |
| PUT | `/enterprise/applications/:id/interview-result` | Submit the final result for an interview after its scheduled time |
| GET | `/enterprise/skills` | List skills available for enterprise job requirements |
| POST | `/enterprise/skills` | Create a skill in the catalog for enterprise job requirements |
| POST | `/enterprise/jobs/` | Create enterprise job |
| GET | `/enterprise/jobs/` | List current enterprise jobs |
| PUT | `/enterprise/jobs/:id` | Update enterprise job |
| DELETE | `/enterprise/jobs/:id` | Delete/close enterprise job |

`PUT /enterprise/profile` accepts:

```json
{
  "company_name": "Company name",
  "phone": "0900000000"
}
```

`phone` can be blank for existing accounts, but when present it must contain 10-11 digits. The response returns the current user with preloaded `enterprise_profile`.

`GET /enterprise/applications` supports optional `status` and `job_id` query params. Responses preload the applied job plus the student's user profile, phone, CV URL, and skills.

`PUT /enterprise/applications/:id/status` accepts:

```json
{
  "status": "ACCEPTED",
  "employer_note": "Ứng viên phù hợp, hẹn phỏng vấn."
}
```

Allowed statuses for enterprise review are `ACCEPTED` and `REJECTED`.

`PUT /enterprise/applications/:id/interview` accepts:

```json
{
  "interview_at": "2026-07-20T09:30:00Z",
  "interview_method": "ONLINE",
  "interview_location": "Google Meet link or office address",
  "interview_note": "Bring CV and portfolio."
}
```

Only applications already in `ACCEPTED` status can be scheduled. The response returns the updated application, and the backend creates an `INFO` notification for the student.

`PUT /enterprise/applications/:id/interview-result` accepts:

```json
{
  "result": "HIRED",
  "result_note": "Candidate passed the interview."
}
```

Allowed `result` values are `HIRED`, `REJECTED`, and `NO_SHOW`. The endpoint only accepts applications already in `ACCEPTED` status, with an existing interview time, after that interview time has passed, and before any previous interview result was stored. `REJECTED` requires `result_note`.

When `result` is `HIRED`, the backend decrements the related job `slots` in a transaction. If slots reach `0`, the job status becomes `CLOSED`, so it is no longer returned by public job APIs or accepted by student apply/save checks. The response returns the updated application with preloaded job and student data, and the backend creates a notification for the student.

`PUT /enterprise/jobs/:id` accepts the editable job fields used by the enterprise UI, including `title`, `description`, `requirements`, `salary`, `location`, `slots`, and optional `status`.

`POST /enterprise/jobs/` and `PUT /enterprise/jobs/:id` also accept optional `skill_ids`:

```json
{
  "title": "Backend Developer",
  "description": "Build APIs",
  "requirements": "Kỹ năng: Go, PostgreSQL\nKinh nghiệm: Junior (1-2 năm)",
  "salary": "15 - 25 triệu",
  "location": "Phường Cầu Giấy, Thành phố Hà Nội",
  "slots": 2,
  "status": "PENDING",
  "skill_ids": [1, 2]
}
```

When `skill_ids` is present, the backend validates that every skill exists and stores the relation in `job_skills`. `PUT /enterprise/jobs/:id` replaces the existing skill list when `skill_ids` is sent.

`POST /enterprise/skills` accepts:

```json
{
  "name": "Laravel",
  "category_id": 1,
  "category_name": "Kỹ năng khác"
}
```

`name` is required. `category_id` is optional; without it, the backend uses `category_name` or creates/uses the default `Kỹ năng khác` category. If a skill with the same name already exists, the existing skill is returned.

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
    "phone": "0900000000",
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
- `AuthService.changePassword` -> `POST /auth/change-password`
- `AuthService.registerStudent` -> `POST /auth/register-student`
- `AuthService.registerEnterprise` -> `POST /auth/register-enterprise`
- `AuthService.uploadGPKD` -> `POST /auth/upload`
- `CompanyService.getProfile` -> `GET /enterprise/profile`
- `CompanyService.updateProfile` -> `PUT /enterprise/profile`
- `AdminService.updateUser` -> `PUT /admin/users/:id`
- `AdminService.*` -> `/admin/*` routes listed above
- `JobService.getAllJobs` -> `GET /jobs`
- `JobService.getJobDetail` -> `GET /jobs/:id`
- `JobService.getEnterpriseJobs` -> `GET /enterprise/jobs`
- `JobService.createEnterpriseJob` -> `POST /enterprise/jobs`
- `JobService.getEnterpriseSkills` -> `GET /enterprise/skills`
- `JobService.createEnterpriseSkill` -> `POST /enterprise/skills`
- `JobService.updateEnterpriseJob` -> `PUT /enterprise/jobs/:id`
- `JobService.deleteEnterpriseJob` -> `DELETE /enterprise/jobs/:id`
- `JobService.getEnterpriseApplications` -> `GET /enterprise/applications`
- `JobService.reviewEnterpriseApplication` -> `PUT /enterprise/applications/:id/status`
- `JobService.scheduleEnterpriseInterview` -> `PUT /enterprise/applications/:id/interview`
- `JobService.submitEnterpriseInterviewResult` -> `PUT /enterprise/applications/:id/interview-result`
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
