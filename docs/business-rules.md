# Business Rules

Last updated: 2026-07-17

This file describes business behavior and invariants. Implementation details belong in source files; API paths belong in `docs/api.md`; schema details belong in `docs/database.md`.

## Roles

Supported roles:

- `ADMIN`
- `STUDENT`
- `ENTERPRISE`

Role strings are uppercase in backend models and JWT claims. `RoleMiddleware` compares case-insensitively.

## User Status

Supported user statuses:

- `ACTIVE`
- `INACTIVE`
- `BANNED`

Login is allowed only for active users.

Protected API requests are also allowed only while the current user row remains `ACTIVE`. If an admin changes an account to `INACTIVE` or `BANNED`, existing JWTs are rejected by authenticated API middleware.

## Registration

Student registration:

- requires email, password, name, phone from the request DTO,
- rejects duplicate email,
- hashes password,
- creates a `users` row with role `STUDENT`,
- creates a `student_profiles` row in the same transaction.

Enterprise registration:

- requires email, password, company name, contact phone, tax code, and `gpkd_url`,
- contact phone must contain 10-11 digits,
- rejects missing or blank `gpkd_url`,
- rejects duplicate email,
- rejects duplicate tax code,
- hashes password,
- creates a `users` row with role `ENTERPRISE`,
- creates an `enterprise_profiles` row with contact phone and KYB status `PENDING`.

First admin registration:

- requires the configured admin secret,
- only succeeds if no admin account exists,
- creates a `users` row with role `ADMIN`.

## Login And Logout

Login:

- verifies email and password,
- requires user status `ACTIVE`,
- rejects enterprise users unless KYB is `APPROVED`,
- creates access and refresh tokens,
- returns role and user metadata,
- for enterprise users also returns KYB/GPKD access metadata.

Password change:

- is available only through authenticated protected API access,
- verifies the current password before changing anything,
- rejects a new password that is the same as the current password,
- requires at least 8 characters, uppercase and lowercase letters, a digit or special character, and no whitespace,
- hashes the new password before updating the `users.password` column.

Logout:

- blacklists access and refresh tokens in Redis when the token is valid and unexpired,
- ignores empty, `null`, `undefined`, or expired token values.

## Enterprise KYB And GPKD

KYB statuses:

- `PENDING`
- `APPROVED`
- `REJECTED`

Enterprise access rule:

- Enterprise API group requires authenticated role `ENTERPRISE`.
- Enterprise API group also requires approved KYB and a non-empty GPKD URL.
- If `kyb_status` is blank, backend falls back to `status_kyb`.

Admin approval rule:

- Admin must not approve an enterprise if GPKD is missing.
- Admin can request an enterprise to submit GPKD.
- Requesting GPKD creates records in `notifications` and `messages`.

Frontend access rule:

- Enterprise users without approval are not allowed to complete login.
- Enterprise pages use the company middleware and require role `ENTERPRISE` plus approved enterprise metadata.
- `/student` is the public all-jobs board and is not limited to role `STUDENT`.
- Student-only pages, if added outside the public job board, should continue to use the `student` middleware.

## Jobs

Job statuses:

- `DRAFT`
- `PENDING`
- `APPROVED`
- `REJECTED`
- `CLOSED`

Enterprise job rules:

- Enterprise job APIs are under `/api/v1/enterprise/jobs`.
- Creating a job uses the authenticated enterprise user id as `enterprise_id`.
- Enterprise-created jobs can be submitted as `PENDING`.
- Enterprise-created jobs can attach existing skills by `skill_ids`; backend validates every submitted skill id before writing `job_skills`.
- Enterprise users can add missing skills from the create-job UI. New skills are stored in the shared `skills` catalog and default to category `Kỹ năng khác` when no category is provided.
- The create-job UI separates requirements into skills, experience, and work-time choices, then stores the readable summary in the existing `requirements` text field for compatibility.
- Draft jobs can be submitted to admin review from the enterprise edit screen by changing status to `PENDING`.
- Rejected jobs can be edited and requested for reposting by changing status back to `PENDING`.
- Closing/deleting an enterprise job changes its status to `CLOSED`; it is not a hard delete.
- Closed jobs should not expose edit, repost, or close actions in the enterprise UI. They can only be restored to `DRAFT` before further edits or resubmission.
- Admin reviews pending jobs.

Public job visibility:

- Public job APIs are under `/api/v1/jobs`.
- Homepage and student job-board listings must use persisted backend jobs instead of hardcoded job counts/cards.
- Public APIs only return jobs with status `APPROVED` and `slots > 0`.
- `PENDING`, `REJECTED`, `DRAFT`, and `CLOSED` jobs stay out of public listings.

Student job actions:

- Viewing the homepage and `/student` job board remains public.
- Applying to a job requires authenticated role `STUDENT`.
- Saving or removing a favorite job requires authenticated role `STUDENT`.
- Students can only apply to or save jobs with status `APPROVED` and `slots > 0`.
- A student can apply to the same job only once.
- A student can save the same favorite job only once.
- Repeated apply/save requests return the existing row instead of creating duplicates.
- New applications start as `APPLIED`.
- Applications are visible only to the enterprise that owns the applied job.
- Approved enterprise users can review their applications as `ACCEPTED` or `REJECTED`.
- Enterprise review can store an optional `employer_note` for the latest decision context.
- Enterprises can schedule or update an interview only after an application is `ACCEPTED`.
- Interview scheduling stores the proposed time, method, location/link, note, and schedule timestamp on the application.
- Scheduling an interview creates an `INFO` notification for the student tied to that application.
- Enterprises can submit an interview result only after the scheduled interview time has passed.
- Interview results are `HIRED`, `REJECTED`, or `NO_SHOW` and can only be stored once for an application.
- A `REJECTED` interview result requires a note explaining why the candidate was not accepted.
- A `HIRED` interview result decrements the related job `slots` in a transaction. If slots reach `0`, the job status becomes `CLOSED`, preventing new public applications for that job.
- Applications with a `HIRED` interview result are surfaced in the enterprise saved-candidate view so employers can review accepted candidates without searching the full application list.
- Submitting an interview result creates a notification for the student tied to that application.

Admin job review:

- Admin can list jobs.
- Admin can approve or reject jobs.
- Rejected jobs may carry `reject_reason`.
- Non-rejected review should clear `reject_reason`.

## Admin Protection

Admin accounts are protected:

- admin rows are prioritized in user listing,
- frontend should not expose status-changing controls for admin users,
- backend rejects status changes for users with role `ADMIN`.

Admin account-management rule:

- Admin can view user details from admin user/student/enterprise pages.
- Admin can edit email and status for non-admin accounts.
- Admin can edit student profile fields: name, phone, avatar URL, and CV URL.
- Admin can edit enterprise profile fields: company name, contact phone, tax code, GPKD URL, and KYB status.
- Admin cannot approve enterprise KYB if GPKD URL is blank.

## Uploads And GPKD Files

Upload rules:

- GPKD upload uses `POST /api/v1/auth/upload`.
- Local files are served by backend from `/uploads`.
- Cloudinary can be used when configured.

URL rule:

- Relative file paths such as `/uploads/file.pdf` must be opened through backend origin, not Nuxt frontend origin.
- The frontend should derive backend origin from `NUXT_PUBLIC_API_BASE`.

## Business Rule Update Triggers

Update this file when changing:

- roles or user statuses,
- registration requirements,
- login/logout semantics,
- enterprise approval or GPKD rules,
- job status workflow,
- admin permissions,
- upload/file URL behavior.
