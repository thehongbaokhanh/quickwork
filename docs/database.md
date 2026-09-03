# Database Documentation

## Enterprise public profile fields (2026-08-13)

`enterprise_profiles` stores the optional company introduction and structured business location in `description`, `address`, `city`, and `district`. Auto-migration adds these columns without changing KYB state or existing records.

Global location selection additionally persists `country`, `ward`, `latitude`, and `longitude`; `recruitment_level` stores the selected primary hiring level.

## Enterprise profile media fields (2026-08-13)

The existing AutoMigrate path adds `logo_url varchar(500)`, `cover_image_url varchar(500)`, `industry varchar(255)`, `company_size varchar(100)`, and `work_model varchar(100)` to `enterprise_profiles`. Existing tax/GPKD/KYB columns remain unchanged.

Last updated: 2026-08-26

Schema source of truth:

- `backend/internal/models/*`
- `backend/database/migration.go`

Migration behavior:

- Backend calls `database.Migrate(db)` on startup.
- Backend calls `database.Seed(db)` after migration only when `DB_SEED_ENABLED=true`.
- `Migrate` uses GORM `AutoMigrate`.
- Model changes can affect local schema automatically when backend starts.
- Seed data is idempotent and can be rerun without duplicating sample rows. Local defaults to enabled; production Compose defaults to disabled.

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
- `Conversation`
- `Notification`
- `OutboxEvent`
- `Transaction`
- `Message`
- `SystemSetting`

## system_settings

Model: `backend/internal/models/system_setting.go`

Purpose:

- persist one shared Admin Settings aggregate for every browser/admin,
- keep the aggregate as normalized JSON while preserving an optimistic version,
- record the admin user id and timestamp of the latest successful update.

Important fields:

- `id` is the fixed singleton primary key `1` with auto-increment disabled,
- `settings_json` is the complete camelCase settings document in `longtext`,
- `version` starts at `1` on the first write and increments for each successful compare-and-update,
- `updated_by` stores the updating admin user id,
- `created_at` and `updated_at`.

There is no seed row. An absent row is represented by the service as canonical defaults with `version = 0` and `configured = false`; the first `PUT /admin/settings` creates the singleton. Unsupported provider fields are normalized before JSON persistence rather than stored as misleading enabled values.

## users

Model: `backend/internal/models/user.go`

Important fields:

- `id`
- `event_id` nullable/unique; populated only by queued deliveries to make at-least-once consumption idempotent,
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
- `cv_file_name` for the original user-facing CV title,
- job preferences: `preferred_location`, `preferred_category`, `expected_salary`, `preferred_job_type`,
- privacy flags: `profile_visible`, `allow_enterprise_contact`, `show_contact_info`,
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
- `phone`,
- `tax_code`,
- `gpkd_url`,
- `kyb_status`,
- `status_kyb`,
- `kyb_reject_reason`,
- timestamps,
- soft delete.

Enums:

- `PENDING`
- `APPROVED`
- `REJECTED`

Caveat:

- Both `kyb_status` and `status_kyb` exist. Middleware falls back from `kyb_status` to `status_kyb` when needed. Keep both in mind during migrations and cleanup.
- `kyb_reject_reason` stores the latest admin rejection reason for `REJECTED` enterprise KYB. It is cleared when KYB moves back to `PENDING` or `APPROVED`.

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

The `models.Job` response also has read-only `application_count` and `favorite_count` fields. Repositories derive them with aggregate subqueries over `job_applications` and `favorite_jobs`; `-:migration` keeps them out of the `jobs` table schema.

Enums:

- `DRAFT`
- `PENDING`
- `APPROVED`
- `REJECTED`
- `CLOSED`

Relations:

- enterprise profile via `enterprise_id -> enterprise_profiles.user_id`,
- many-to-many `skills` through `job_skills`.
- enterprise create/update job APIs can populate `job_skills` from submitted `skill_ids`.

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

## conversations

Model: `backend/internal/models/conversation.go`

Purpose:

- store one chat conversation for one `job_applications` row.

Important fields:

- `id`
- `job_application_id`
- `student_user_id`
- `enterprise_user_id`
- `last_message_id`
- `last_message_at`
- `student_unread_count`
- `enterprise_unread_count`
- `is_closed`
- `closed_at`
- `closed_reason`
- timestamps.

Indexes and constraints:

- `job_application_id` is unique, so one application can have at most one conversation.
- participant ids are indexed together with `last_message_at` for conversation list ordering.
- `is_closed` is indexed with `last_message_at` for future moderation/cleanup views.

Relations:

- belongs to `job_applications`,
- belongs to the student `users` row through `student_user_id`,
- belongs to the enterprise `users` row through `enterprise_user_id`.

## notifications

Model: `backend/internal/models/notification.go`

Purpose:

- store user notifications for system, KYB, interview, job, application, and message events.

Important fields:

- `id`
- `user_id`
- `type`
- `title`
- `content`
- `source_type`
- `source_id`
- `action_url`
- `is_read`
- `read_at`
- `created_at`

Types:

- `APPLICATION`
- `INTERVIEW`
- `JOB`
- `KYB`
- `MESSAGE`
- `SYSTEM`
- `INFO`
- `WARNING`
- `ALERT`

Compatibility note:

- `INFO`, `WARNING`, and `ALERT` remain valid legacy type strings while newer business flows use the more specific type constants.

## outbox_events

Model: `backend/internal/models/outbox_event.go`

Purpose:

- persist a `notification.create` event in the same MySQL transaction as the business mutation,
- allow RabbitMQ publishing to retry without losing a committed business event,
- retain published records for seven days for short operational traceability.

Important fields:

- `id` is a UUID and is copied into the eventual notification `event_id`,
- `event_type` currently uses `notification.create`,
- `payload` is the internal JSON event body and is not returned by public APIs,
- `attempts`, `available_at`, and `last_error` control exponential publish retry,
- `published_at` is set only after RabbitMQ publisher confirmation.

Rows with 20 failed publish attempts remain unpublished for operator inspection. Successfully published rows are removed by the worker after seven days.

## messages

Model: `backend/internal/models/message.go`

Purpose:

- store chat messages inside application conversations.
- during the transition, legacy `receiver_id` and `is_read` fields remain for compatibility with existing data.

Important fields:

- `id`
- `conversation_id`
- `sender_id`
- `receiver_id`
- `type`
- `content`
- `is_read`
- `read_at`
- `created_at`
- `updated_at`

Message types:

- `TEXT`
- `SYSTEM`

Compatibility note:

- `conversation_id` is nullable during the first migration phase so old rows that were created before conversations existed do not break startup.
- `receiver_id` is nullable for the same reason. New chat messages infer the receiver from the conversation and still fill `receiver_id` only as transition metadata.

## Other Models

The project also migrates:

- `Category`
- `Skill`
- `Transaction`

Read their model files before changing features that depend on categories, skills, payments, or transactions.

Runtime skill catalog behavior:

- approved enterprise accounts can read skills through `/api/v1/enterprise/skills`.
- approved enterprise accounts can add a missing skill through `/api/v1/enterprise/skills`.
- when a new skill is created without an explicit category, backend creates or reuses the default category `Kỹ năng khác`.
- job creation/update stores selected skills in `job_skills`; the textual `requirements` field remains the compatibility summary shown in job details.

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
## Student profile history (2026-08-19)

- `student_profiles` stores the student's `summary`, optional `portfolio_url`, CV storage URL, and original CV filename in addition to the existing avatar, preference, and privacy fields.
- `student_work_experiences` belongs to a student user and stores position, company, start/end dates, current-role state, and description.
- `student_educations` belongs to a student user and stores school, major, degree, start/end dates, and description.
- `student_portfolios` belongs to a student user and stores a required display title and validated HTTP(S) URL.
- All three child tables are included in the active `AutoMigrate` bundle and are deleted with their owning student through the declared relation.
