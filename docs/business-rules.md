# Business Rules

Last updated: 2026-07-10

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

- requires email, password, company name, tax code, and `gpkd_url`,
- rejects missing or blank `gpkd_url`,
- rejects duplicate email,
- rejects duplicate tax code,
- hashes password,
- creates a `users` row with role `ENTERPRISE`,
- creates an `enterprise_profiles` row with KYB status `PENDING`.

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
- Student area is limited to role `STUDENT`.

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
- Admin reviews pending jobs.

Public job visibility:

- Public job APIs are under `/api/v1/jobs`.
- Homepage and student job-board listings must use persisted backend jobs instead of hardcoded job counts/cards.
- Public APIs only return jobs with status `APPROVED`.
- `PENDING`, `REJECTED`, `DRAFT`, and `CLOSED` jobs stay out of public listings.

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
- Admin can edit enterprise profile fields: company name, tax code, GPKD URL, and KYB status.
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
