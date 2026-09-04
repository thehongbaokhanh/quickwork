# API Documentation

## Enterprise profile media and extended fields (2026-08-13)

- `POST /auth/upload` keeps multipart field `gpkd` and accepts optional `kind=gpkd|logo|cover`; it returns the Cloudinary URL in `url`.
- `GET/PUT /enterprise/profile` supports company enum fields plus structured global location fields (`country`, `city`, `district`, `ward`, `address`, `latitude`, `longitude`). Extended fields remain optional for old-client compatibility.

Last updated: 2026-08-29

Base API: `/api/v1`

Runtime source of truth: `backend/cmd/api/main.go`

Login responses include optional `name` and `avatar` fields from the role profile. In production, access and refresh tokens are omitted from JSON and are set as `HttpOnly`, `Secure`, `SameSite=Strict` cookies. Local development may expose token fields only when `AUTH_EXPOSE_TOKENS=true`. Student headers use the returned avatar immediately after login; enterprise `name` comes from `enterprise_profiles.company_name`, while an enterprise avatar/logo is consumed when present in profile data.

`POST /student/profile/upload` accepts student avatars in JPG, JPEG, or PNG format up to 5 MB and CV files in PDF, DOC, or DOCX format up to 10 MB.

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
- `429` after the configured number of failed password attempts for one normalized email; the current single-process limiter locks that email for 15 minutes without a Redis/database write per failure.
- `403` for `INACTIVE` or `BANNED` accounts.
- Enterprise KYB status does not block login. Pending or rejected enterprise users can sign in so they can read KYB notifications and update profile/GPKD data, but protected enterprise business APIs still enforce the current KYB policy. Enterprise login metadata includes `enterprise_kyb_status`, `enterprise_approved`, `enterprise_require_kyb`, `business_license_url`, and optional `enterprise_kyb_reject_reason`. The frontend uses that same login response to align its route guards without another Settings request; backend middleware remains authoritative if policy changes during an existing session.

## Public Auth Routes

Registered by `routes.RegisterAuthRoutes(api, authHandler)`.

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/auth/register-student` | Register student account |
| POST | `/auth/register-enterprise` | Register enterprise account |
| POST | `/auth/login` | Login and establish the authenticated cookie session |
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

Shared Admin Settings are authoritative for new registrations. Student and enterprise endpoints return `403` when their registration switch is off; Google sign-in still works for an existing account but cannot auto-create a new student while student registration is off. When `security.strongPassword` is enabled, both password registration endpoints return `400` unless the password has at least eight characters, uppercase and lowercase letters, a digit or symbol, and no whitespace. `security.sessionMinutes` applies to access tokens issued by the next password or Google login; existing tokens keep their original expiry.

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

Public job responses include the job fields used by the frontend plus preloaded `enterprise_profile`, `skills`, and each skill category. They also expose read-only aggregate fields `application_count` and `favorite_count`, calculated from `job_applications` and `favorite_jobs` in the same list/detail query; these are not writable job columns.

## Protected Common Routes

Middleware: `AuthMiddleware`.

`AuthMiddleware` accepts the `qw_access_session` HttpOnly cookie and retains `Authorization: Bearer` compatibility for non-browser clients. It accepts access tokens only: refresh JWTs cannot authorize protected routes. When initialized with DB access in `cmd/api/main.go`, it also checks the current user row and rejects non-active accounts even when the JWT is still valid.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/profile` | Authenticated profile/test endpoint |
| POST | `/auth/change-password` | Change password for the current authenticated user |
| GET | `/notifications` | List current user's notifications with pagination and filters |
| GET | `/notifications/unread-count` | Count unread notifications for the current user |
| PUT | `/notifications/:id/read` | Mark one owned notification as read |
| PUT | `/notifications/read-all` | Mark all current user's notifications as read |
| GET | `/conversations` | List current user's application conversations |
| GET | `/conversations/unread-count` | Count unread chat messages for the current user |
| GET | `/conversations/:id/messages` | List paginated messages in one owned conversation |
| POST | `/conversations/:id/messages` | Send a message in one owned conversation |
| PUT | `/conversations/:id/read` | Mark messages in one owned conversation as read |
| POST | `/job-applications/:id/conversation` | Open or lazily create the conversation for one application |
| POST | `/job-applications/:id/messages` | Send the first or next message by application id |
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

The endpoint verifies the current password, rejects reusing the same password, hashes the new password, and updates the current `users.password` row. The request DTO always requires at least eight characters. Uppercase/lowercase/digit-or-symbol/no-whitespace complexity is additionally enforced while `security.strongPassword` is enabled.

## Notification Routes

Base group: `/api/v1`

Middleware:

- `AuthMiddleware`

`GET /notifications?page=1&page_size=20&is_read=false&type=MESSAGE` returns:

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 0,
      "total_pages": 0
    }
  }
}
```

`type` is optional and uses backend notification type strings such as `MESSAGE`, `INTERVIEW`, `KYB`, `JOB`, `APPLICATION`, or `SYSTEM`. `is_read` is optional and must be a boolean string when present.

Generated notification events:

- `POST /enterprise/jobs/` and `PUT /enterprise/jobs/:id` create `JOB` notifications for active admins when the submitted job transitions into status `PENDING`.
- `POST /student/jobs/:id/apply` creates `APPLICATION` notifications for active admins when a new application row is created.
- Admin and enterprise dashboard/header notification surfaces request a wider first page from `/notifications` and only display items created in the last 24 hours; the API keeps returning the full paginated notification history.

`GET /notifications/unread-count` returns:

```json
{
  "success": true,
  "data": {
    "unread_count": 0
  }
}
```

`PUT /notifications/:id/read` updates only notifications owned by the current user. `PUT /notifications/read-all` returns `updated_count`.

Frontend mapping:

- `frontend/app/services/notification.service.ts`

## Conversation And Message Routes

Base group: `/api/v1`

Middleware:

- `AuthMiddleware`

Conversation permission is checked in `ConversationService`, not by trusting request body fields. The current user can access a conversation only when they are the student who applied or the enterprise that owns the applied job.

`GET /conversations?page=1&page_size=20` returns the current user's conversations with the other participant, related job summary, application/interview status, last message, unread count, effective locked state, and pagination. Each item includes:

- `can_send_messages`: authoritative UI hint computed from the application, interview result, and explicit conversation close state,
- `is_closed`: `true` when the conversation is effectively read-only,
- `locked_reason`: user-facing reason when sending is blocked,
- `interview_result`: present when an interview result has been recorded.

Frontend still treats the send endpoint as the final authority; these response fields are display hints and cannot be overridden by request data.

`POST /job-applications/:id/conversation` opens or lazily creates the single conversation attached to that application:

```json
{
  "success": true,
  "data": {
    "id": 10,
    "job_application_id": 52
  }
}
```

`GET /conversations/:id/messages?before_id=120&limit=30` uses cursor pagination over message ids:

```json
{
  "success": true,
  "data": {
    "items": [],
    "next_before_id": null,
    "has_more": false
  }
}
```

Messages are returned newest-first by the API page. The frontend shared chat composable normalizes them into chronological display order, de-duplicates by `message.id`, and uses `next_before_id` only while `has_more` is `true`. The backend reads one extra row internally so `has_more` is false when the current page is exactly the final page.

`POST /job-applications/:id/messages` and `POST /conversations/:id/messages` accept:

```json
{
  "content": "Chào bạn, mình muốn hỏi thêm về lịch phỏng vấn."
}
```

Validation:

- content is trimmed,
- content must not be empty,
- content is limited to 2,000 characters,
- `sender_id`, `student_id`, `enterprise_id`, and read state are never accepted from the client.

Sending a message creates the conversation when needed, creates the message, updates last-message/unread counters, and creates a `MESSAGE` notification for the receiver in the same transaction.

`PUT /conversations/:id/read` marks messages from the other participant as read and resets the current user's unread counter for that conversation.

Common error codes include `MESSAGE_CONTENT_REQUIRED`, `MESSAGE_CONTENT_TOO_LONG`, `CONVERSATION_FORBIDDEN`, `CONVERSATION_CLOSED`, and `CONVERSATION_NOT_FOUND`.

Frontend mapping:

- `frontend/app/services/conversation.service.ts`

## Student Job Action Routes

Base group: `/student`

Middleware:

- `AuthMiddleware`
- `RoleMiddleware("STUDENT")`

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/student/profile` | Return the current student account with `student_profile` settings |
| PUT | `/student/profile` | Update the current student's profile, job preferences, or privacy settings |
| POST | `/student/profile/upload` | Upload an authenticated student's avatar or CV to Cloudinary |
| GET | `/student/skills` | Return the skill catalog used by the student profile editor |
| POST | `/student/skills` | Create or reuse a skill for the authenticated student's profile editor; an existing category ID or a new category name is required |
| POST/PUT/DELETE | `/student/profile/experiences[/:id]` | Create, update, or delete the authenticated student's work experience |
| POST/PUT/DELETE | `/student/profile/educations[/:id]` | Create, update, or delete the authenticated student's education |
| POST/PUT/DELETE | `/student/profile/portfolios[/:id]` | Create, update, or delete the authenticated student's portfolio links |
| GET | `/student/job-actions` | Return current student's applied and favorite job ids |
| GET | `/student/applied-jobs` | List jobs the current student has applied to |
| GET | `/student/favorite-jobs` | List jobs the current student has saved |
| GET | `/student/companies/:id` | Return the safe company profile and approved open jobs for an enterprise the current student has applied to |
| POST | `/student/jobs/:id/apply` | Apply current student to an approved job |
| POST | `/student/jobs/:id/favorite` | Save an approved job to current student's favorites |
| DELETE | `/student/jobs/:id/favorite` | Remove an approved job from current student's favorites |

Applying and saving only accept jobs with status `APPROVED` and `slots > 0`. Repeating an apply or save request for the same student/job pair returns the existing record instead of creating duplicates.

`GET /student/companies/:id` requires an existing application from the current student to a job owned by the requested active enterprise. The response contains only presentation fields from `enterprise_profiles`, a boolean verification hint, aggregate open-job totals, and that enterprise's current `APPROVED` jobs with `slots > 0`. It intentionally excludes email, phone, tax code, GPKD URL, coordinates, KYB status/rejection details, and non-public jobs. Frontend mapping: `frontend/app/services/company.service.ts`.

`POST /student/skills` accepts `name` plus either `category_id` or `category_name`. Skill and category names are trimmed and limited to 100 characters. Skill-name matching is case-insensitive: when the skill already exists, the endpoint returns that catalog item with `200`; a newly created skill returns `201`. An unknown category ID returns `400`.

`PUT /student/profile` accepts any subset of the following fields:

```json
{
  "name": "Nguyen Van A",
  "phone": "0912345678",
  "avatar": "https://example.com/avatar.jpg",
  "cv_url": "https://example.com/cv.pdf",
  "cv_file_name": "Nguyen-Van-A-CV.pdf",
  "preferred_location": "Ha Noi",
  "preferred_category": "Cong nghe thong tin",
  "expected_salary": "12 - 18 trieu",
  "preferred_job_type": "FULL_TIME",
  "profile_visible": true,
  "allow_enterprise_contact": true,
  "show_contact_info": false
}
```

`name` cannot be blank when sent. A non-empty `phone` must contain 10-11 digits. `cv_file_name` is normalized to a basename and cannot exceed 255 characters; clearing `cv_url` also clears the persisted filename. The response uses the standard success envelope and returns the authenticated `users` row with its `student_profile` preloaded. Frontend mapping: `frontend/app/services/student.service.ts`.

`POST /student/profile/upload` accepts `multipart/form-data` with `file` and `kind`. `kind=avatar` permits JPG/JPEG/PNG up to 5MB; `kind=cv` permits PDF/DOC/DOCX up to 10MB. The backend verifies the file signature instead of trusting the extension and, when production scanning is required, streams the bytes to ClamAV before Cloudinary receives them. Scanner errors and detections fail closed. The response returns `data.url`, normalized original `data.name`, `data.size`, and `data.kind`. A CV client persists both `data.url` and `data.name` through the subsequent `PUT /student/profile` call so a Cloudinary-generated URL never replaces the user-facing filename.

## Enterprise Routes

Base group: `/enterprise`

Middleware:

- `AuthMiddleware`
- `RoleMiddleware("ENTERPRISE")`
- `EnterpriseApprovedMiddleware(db, settingsService)`

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/enterprise/profile` | Return the current enterprise account and profile |
| PUT | `/enterprise/profile` | Update current enterprise company name, contact phone, and optional GPKD URL |
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
  "phone": "0900000000",
  "gpkd_url": "/uploads/gpkd.pdf"
}
```

`phone` can be blank for existing accounts, but when present it must contain 10-11 digits. `GET /enterprise/profile` and `PUT /enterprise/profile` are available to authenticated enterprise users even while KYB is pending or rejected so they can submit or fix GPKD data. If a non-approved enterprise submits a non-empty `gpkd_url`, the backend stores it, clears the previous `kyb_reject_reason`, and moves KYB back to `PENDING` for admin review. The response returns the current user with preloaded `enterprise_profile`.

Other `/enterprise/*` business routes require approved KYB and a non-empty GPKD URL while `registration.requireKyb` is enabled. Turning that shared setting off bypasses this KYB middleware gate; it does not delete or rewrite existing KYB/GPKD data.

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

Only applications already in `ACCEPTED` status can be scheduled. The response returns the updated application, and the backend creates an `INTERVIEW` notification for the student through `NotificationService`.

`PUT /enterprise/applications/:id/interview-result` accepts:

```json
{
  "result": "HIRED",
  "result_note": "Candidate passed the interview."
}
```

Allowed `result` values are `HIRED`, `REJECTED`, and `NO_SHOW`. The endpoint only accepts applications already in `ACCEPTED` status, with an existing interview time, after that interview time has passed, and before any previous interview result was stored. `REJECTED` requires `result_note`.

When `result` is `HIRED`, the backend decrements the related job `slots` in a transaction. If slots reach `0`, the job status becomes `CLOSED`, so it is no longer returned by public job APIs or accepted by student apply/save checks. The response returns the updated application with preloaded job and student data, and the backend creates an `INTERVIEW` notification for the student through `NotificationService`.

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

Admin moderation settings apply to create/update requests that submit a job:

- `moderation.mode = "manual"` keeps the submitted job in `PENDING` and creates the normal admin notification.
- `moderation.mode = "automatic"` changes a submitted `PENDING` job to `APPROVED` in the same request, so no pending-review notification is created.
- `moderation.draftLimit` is checked inside a transaction after locking the enterprise profile row; a create or transition that would exceed the limit returns `409`.
- `moderation.pendingHours` is persisted but currently marked `stored_only`; there is no expiry scheduler.
- Public job endpoints remain fixed to `APPROVED` jobs with available slots, so rejected jobs are always hidden.

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
| GET | `/admin/reports/summary?period=7d\|30d\|quarter\|year` | Aggregate report KPIs, growth, distributions, rankings, and profile completion from persisted data |
| GET | `/admin/categories?q=` | List skill categories with skills and job-usage counts |
| POST | `/admin/categories` | Create a skill category |
| PUT | `/admin/categories/:id` | Rename a skill category |
| DELETE | `/admin/categories/:id` | Delete an empty skill category |
| GET | `/admin/settings` | Return the shared Settings snapshot, defaults, capabilities, version, and diagnostics |
| PUT | `/admin/settings` | Validate and optimistically replace the complete shared Settings aggregate |

### Shared Admin Settings

Both Settings endpoints require `AuthMiddleware`, the `ADMIN` role, and the configured admin IP allowlist. The frontend performs one `GET` when `/admin/settings` mounts and one `PUT` only when an admin explicitly saves or restores defaults; the `PUT` response is already the new canonical snapshot, so no refetch, polling, or autosave request is needed.

`GET /admin/settings` returns a shared snapshot with `settings`, `defaults`, `capabilities`, `version`, `configured`, `updated_by`, `updated_at`, and one `meta` object. The meta object includes `admin_count`, `app_version`, `uptime_seconds`, `memory_alloc_bytes`, `goroutines`, and `database_status` in that same request.

The complete `settings` object has camelCase fields grouped under `platform`, `registration`, `moderation`, `notifications`, `security`, and `backup`. `capabilities` mirrors those fields and uses `active`, `stored_only`, `unavailable`, or `fixed`. Provider-dependent controls that the runtime cannot execute are normalized safely: email verification, email alerts/digest, reported-job alerts, admin 2FA, and daily backup stay off; rejected public visibility stays fixed hidden.

`PUT /admin/settings` accepts `{ "version": 3, "settings": { ...complete aggregate... } }`. The first persisted update uses `version: 0` and creates version 1. Invalid fields return `422` with a camelCase field-path map in `errors`. An obsolete version returns `409`, code `ADMIN_SETTINGS_VERSION_CONFLICT`, and `data.current` containing the latest full snapshot; clients can resolve the conflict without an extra GET. A non-empty `security.ipAllowlist` must contain the saving admin's current IP/CIDR to prevent self-lockout.

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

`PUT /admin/enterprises/:id/kyb` accepts `{ "status": "PENDING|APPROVED|REJECTED", "reject_reason": "optional reason" }`. It writes both KYB status columns and creates a `KYB` notification for the enterprise user with `action_url = "/enterprise/settings"`. Selecting `REJECTED` stores `kyb_reject_reason` so the enterprise dashboard can show the rejection reason and a resubmit CTA. Selecting `PENDING` or `APPROVED` clears the rejection reason; selecting `APPROVED` informs the enterprise that full recruiting access is available.

`GET /admin/reports/summary` returns a single real-data snapshot containing `summary`, `growth`, `account_distribution`, `job_status_distribution`, `top_enterprises`, `top_categories`, `top_locations`, and `profile_completion_rate`. The `period` query only changes the growth buckets; totals and rankings remain a current database snapshot.

Category create/update accepts `{ "name": "..." }` with a unique, trimmed name of at most 100 characters. Delete returns `409` when the category still contains skills, preventing orphaned catalog data.

## Non-API Runtime Routes

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/swagger/*` | Swagger UI |
| GET | `/uploads/*` | Static uploaded files |

## Frontend Service Mapping

Confirmed against current `main.go`:

- Browser API calls use the same-origin `/api/v1` base. On Render, Nitro routes under `/api/*` and `/uploads/*` proxy to the private backend origin from `NUXT_API_PROXY_TARGET`; SSR requests use `NUXT_API_BASE_INTERNAL`. This keeps strict session cookies first-party and prevents a public client from resolving private service names.
- `AuthService.login` -> `POST /auth/login`
- `AuthService.logout` -> `POST /auth/logout`
- `AuthService.changePassword` -> `POST /auth/change-password`
- `AuthService.registerStudent` -> `POST /auth/register-student`
- `AuthService.registerEnterprise` -> `POST /auth/register-enterprise`
- `AuthService.uploadGPKD` -> `POST /auth/upload`
- `CompanyService.getProfile` -> `GET /enterprise/profile`
- `CompanyService.updateProfile` -> `PUT /enterprise/profile`
- `NotificationService.*` -> `/notifications*` protected routes
- `ConversationService.*` -> `/conversations*` and `/job-applications/:id/*` protected routes
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
- `StudentService.getJobRecommendations` -> `GET /student/job-recommendations?limit=20&refresh=false`
- `StudentService.getCareerGuidance` -> `POST /student/career-guidance`
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
## Student personal profile extensions (2026-08-19)

Authenticated `STUDENT` routes under `/api/student` include:

- `GET /skills`: returns the current skill catalog for profile selection.
- `PUT /profile`: also accepts `summary`, `portfolio_url`, and `skill_ids`; submitted skill IDs replace the student's current skill association after validation.
- `POST /profile/experiences`, `PUT /profile/experiences/:id`, `DELETE /profile/experiences/:id`: create, update, and delete the authenticated student's work experience.
- `POST /profile/educations`, `PUT /profile/educations/:id`, `DELETE /profile/educations/:id`: create, update, and delete the authenticated student's education.

Experience and education mutation routes verify ownership through the authenticated student ID. `GET /profile` preloads skills, work experiences, and education records for refresh-safe profile rendering.

Portfolio mutations accept `{ "title": "Website cá nhân", "url": "https://example.com" }`. The URL must use HTTP or HTTPS. All portfolio mutations are scoped to the authenticated student, and `GET /student/profile` preloads the owned portfolio records. Avatar/CV upload responses return `data.url`; CV uploads also return the normalized original `data.name`, and the frontend persists both values with the subsequent `PUT /student/profile` call.

## Hybrid job recommendations (2026-08-24)

`GET /api/v1/student/job-recommendations` requires authentication and role `STUDENT`.

Query parameters:

- `limit`: optional integer from 1 to 100; default `20`. The homepage requests 20; the full `/student` board requests up to 100.
- `refresh`: optional `true` or `1`; bypasses the current Redis cache entry and recalculates the result.

Only jobs with `status = APPROVED` and `slots > 0` are candidates. The response keeps the final descending match order:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "job": { "id": 24, "title": "Backend Developer" },
        "match_score": 8.7,
        "confidence": 0.86,
        "breakdown": {
          "location": 10,
          "category": 9,
          "salary": 8,
          "job_type": 10,
          "skills": 8.5,
          "experience": 8,
          "education": 7
        },
        "explanation": {
          "strengths": ["Địa điểm phù hợp với mong muốn", "Khớp kỹ năng: Go"],
          "gaps": ["Còn thiếu: Docker"]
        }
      }
    ],
    "ai_used": true,
    "cache_hit": false,
    "profile_completeness": 0.86,
    "generated_at": "2026-08-24T03:00:00Z"
  }
}
```

The deterministic score remains available when OpenAI is not configured or fails. AI is still restricted to the deterministic top 20 in one batch; any additional returned jobs receive deterministic scores only, so requesting the full board does not increase provider calls or AI candidates. `ai_used` reports whether at least one valid semantic result was applied; an AI/provider failure is not returned as an endpoint failure. Redis failures also degrade to an uncached calculation. The cache TTL defaults to 45 minutes, stores a profile/job fingerprint, and is invalidated naturally when relevant profile fields or eligible jobs change.

Runtime variables: `OPENAI_API_KEY` (optional), `OPENAI_MODEL` (default `gpt-4o-mini`), `OPENAI_BASE_URL`, `JOB_MATCH_CANDIDATE_LIMIT` (default `20`), `JOB_MATCH_CACHE_TTL_MINUTES` (default `45`), and `JOB_MATCH_AI_TIMEOUT_SECONDS` (default `12`). No secret belongs in documentation or committed environment files.

## Student career guidance (2026-09-03)

`POST /api/v1/student/career-guidance` requires authentication and role `STUDENT`. It powers the AI assistant inside the public Blog detail dialog and the authenticated student homepage planner; guests can read Blog content but must sign in before sending an AI request.

Request body:

```json
{
  "goal": "Tôi muốn ứng tuyển Backend Intern trong hai tháng tới",
  "article_title": "Lộ trình học Go, Node.js và SQL cho người mới bắt đầu",
  "article_category": "Kỹ năng nghề nghiệp",
  "article_excerpt": "Cách chia giai đoạn học để xây được API hoàn chỉnh.",
  "article_highlights": ["Nắm chắc một ngôn ngữ backend trước", "Học SQL qua bài toán thực tế"]
}
```

`goal` and `article_title` are required. The handler limits goal/title/category/excerpt length, keeps at most six valid highlights, and rejects malformed or oversized input before contacting OpenAI. The request sends only the user's typed goal and public article context; it does not send name, email, phone, profile, CV, application, or chat data.

Success response:

```json
{
  "success": true,
  "data": {
    "direction": "Tập trung hoàn thiện một dự án API có thể trình bày trong phỏng vấn.",
    "next_steps": ["Chọn phạm vi dự án", "Viết API", "Bổ sung kiểm thử"],
    "priority_skills": ["Go", "SQL"],
    "related_topics": ["CV Backend", "Phỏng vấn Backend"],
    "disclaimer": "Gợi ý mang tính tham khảo; hãy đối chiếu với năng lực, mục tiêu và thông tin tuyển dụng thực tế.",
    "ai_used": true
  }
}
```

The provider uses the OpenAI Responses API with `store=false`, the existing `OPENAI_*` runtime variables, the existing AI timeout, and strict JSON Schema output. Missing configuration or provider failure returns `503` with a user-safe message; the endpoint never fabricates a local response and does not persist prompts or results.
