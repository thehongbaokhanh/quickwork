# Database Documentation

Last updated: 2026-07-17

Schema source of truth:

- `backend/internal/models/*`
- `backend/database/migration.go`

Migration behavior:

- Backend calls `database.Migrate(db)` on startup.
- Backend calls `database.Seed(db)` after migration on startup.
- `Migrate` uses GORM `AutoMigrate`.
- Model changes can affect local schema automatically when backend starts.
- Seed data is idempotent and can be rerun without duplicating sample rows.

## Migrated Models

`backend/database/migration.go` currently migrates:

- `User`
- `StudentProfile`
- `EnterpriseProfile`
- `Job`
- `JobApplication`
- `FavoriteJob`
- `Category`
- `Skill`
- `Notification`
- `Transaction`
- `Message`

## users

Model: `backend/internal/models/user.go`

Important fields:

- `id`
- `email`
- `password`
- `role`
- `status`
- `created_at`
- `updated_at`
- `deleted_at`

Enums:

- roles: `ADMIN`, `STUDENT`, `ENTERPRISE`
- statuses: `ACTIVE`, `INACTIVE`, `BANNED`

Relations:

- one `StudentProfile`
- one `EnterpriseProfile`

## student_profiles

Model: `backend/internal/models/student_profile.go`

Important fields:

- `user_id` as primary key,
- `name`,
- `phone`,
- `avatar`,
- `cv_url`,
- timestamps,
- soft delete.

Relations:

- belongs to `users`,
- many-to-many `skills` through `student_profile_skills`.

## enterprise_profiles

Model: `backend/internal/models/enterprise_profile.go`

Important fields:

- `user_id` as primary key,
- `company_name`,
- `tax_code`,
- `gpkd_url`,
- `kyb_status`,
- `status_kyb`,
- timestamps,
- soft delete.

Enums:

- `PENDING`
- `APPROVED`
- `REJECTED`

Caveat:

- Both `kyb_status` and `status_kyb` exist. Middleware falls back from `kyb_status` to `status_kyb` when needed. Keep both in mind during migrations and cleanup.

## jobs

Model: `backend/internal/models/job.go`

Important fields:

- `id`,
- `enterprise_id`,
- `title`,
- `description`,
- `requirements`,
- `salary`,
- `location`,
- `slots`,
- `status`,
- `reject_reason`,
- timestamps.

Enums:

- `DRAFT`
- `PENDING`
- `APPROVED`
- `REJECTED`
- `CLOSED`

Relations:

- enterprise profile via `enterprise_id -> enterprise_profiles.user_id`,
- many-to-many `skills` through `job_skills`.

## job_applications

Model: `backend/internal/models/job_application.go`

Purpose:

- store student applications to approved jobs.

Important fields:

- `id`,
- `student_id`,
- `job_id`,
- `status`,
- `employer_note`,
- `reviewed_at`,
- `interview_at`,
- `interview_method`,
- `interview_location`,
- `interview_note`,
- `interview_scheduled_at`,
- `interview_result`,
- `interview_result_note`,
- `interview_result_at`,
- `created_at`,
- `updated_at`.

Enums:

- `APPLIED`
- `ACCEPTED`
- `REJECTED`

Interview result enums:

- `HIRED`
- `REJECTED`
- `NO_SHOW`

Indexes and relations:

- unique pair `student_id + job_id` through `idx_student_job_application`,
- student via `student_id -> users.id`,
- job via `job_id -> jobs.id`.

## favorite_jobs

Model: `backend/internal/models/favorite_job.go`

Purpose:

- store jobs saved by students.

Important fields:

- `id`,
- `student_id`,
- `job_id`,
- `created_at`.

Indexes and relations:

- unique pair `student_id + job_id` through `idx_student_favorite_job`,
- student via `student_id -> users.id`,
- job via `job_id -> jobs.id`.

## notifications

Model: `backend/internal/models/notification.go`

Purpose:

- store user notifications, currently used for admin request-GPKD flow.

Important fields:

- `id`
- `user_id`
- `type`
- `title`
- `content`
- `is_read`
- `created_at`

Types:

- `INFO`
- `WARNING`
- `ALERT`

## messages

Model: `backend/internal/models/message.go`

Purpose:

- store user-to-user or system-to-user message records, currently used for request-GPKD flow.

Important fields:

- `id`
- `sender_id`
- `receiver_id`
- `content`
- `is_read`
- `created_at`
- `updated_at`

## Other Models

The project also migrates:

- `Category`
- `Skill`
- `Transaction`

Read their model files before changing features that depend on categories, skills, payments, or transactions.

## Seed Data

Source: `backend/database/seed.go`

Startup seed data is for local/demo use and uses the shared sample password:

- `QuickWork@123`

Seeded user/profile data:

- admin: `admin@quickwork.local`
- approved enterprises:
  - `hr@quickwork-labs.vn`
  - `talent@fpt-digital.vn`
  - `jobs@greenlab.vn`
- pending enterprise:
  - `pending@nova-commerce.vn`
- students:
  - `minh.nguyen@student.quickwork.local`
  - `linh.tran@student.quickwork.local`
  - `anh.pham@student.quickwork.local`

Seeded catalog data:

- categories for technology, marketing, sales, and design jobs.
- skills include Go, PostgreSQL, Docker, Vue.js, Nuxt.js, TypeScript, QA, Figma, UI/UX, Content, SEO, Social Ads, CRM, Excel, and data analysis.

Seeded job data:

- approved public jobs used by homepage/student listings,
- one pending job for admin review,
- one rejected job for admin history.

Seeded GPKD sample files are stored under:

- `backend/uploads/sample/gpkd-quickwork-labs.pdf`
- `backend/uploads/sample/gpkd-fpt-digital.jpg`
- `backend/uploads/sample/gpkd-greenlab.jpg`

## Database Update Triggers

Update this file when changing:

- model fields,
- table names,
- indexes,
- relations,
- enum values,
- migrations,
- seed data assumptions,
- soft-delete behavior,
- duplicated or deprecated columns.
