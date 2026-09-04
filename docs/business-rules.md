# Business Rules

## Enterprise company profile media (2026-08-13)

- Logo, cover image, and GPKD use the existing Cloudinary upload flow; returned URLs persist when the enterprise saves its profile.
- Profile APIs store `industry`, `company_size`, and `work_model`, while the current frontend keeps their editing behind a developing-feature notice.
- Updating GPKD for a non-approved enterprise still moves KYB to `PENDING`; logo and cover changes do not alter KYB.

Last updated: 2026-08-28

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
- does not reject enterprise users solely because KYB is `PENDING` or `REJECTED`,
- creates access and refresh tokens,
- returns role and user metadata,
- for enterprise users also returns KYB/GPKD access metadata.

Password change:

- is available only through authenticated protected API access,
- verifies the current password before changing anything,
- rejects a new password that is the same as the current password,
- requires at least 8 characters, uppercase and lowercase letters, a digit or special character, and no whitespace,
- hashes the new password before updating the `users.password` column.

Student settings:

- only an authenticated user with role `STUDENT` can read or update `/student/profile`,
- the account form can update name, phone, avatar URL, default CV URL, and the original CV filename; email remains read-only on the student settings page,
- student avatar uploads accept JPG/JPEG/PNG up to 5 MB; default CV uploads accept PDF/DOC/DOCX up to 10 MB; extension and binary signature must both match and production malware scanning must pass,
- uploaded avatar/CV URLs are persisted only to the authenticated student's profile; a CV also persists its normalized original filename for display after reload, and portfolio links must use a valid HTTP(S) URL,
- skills replace the authenticated student's many-to-many skill selection; experience, education, and portfolio mutations enforce record ownership with both entry ID and authenticated student ID,
- an authenticated student may add a missing catalog skill under an existing category or create a category with its first skill; names are trimmed, limited to 100 characters, and a case-insensitive duplicate skill is reused instead of inserted again,
- a non-empty phone must contain 10-11 digits and name cannot be blank when submitted,
- job preferences and privacy choices are persisted on `student_profiles`,
- new student profiles default to visible and allow enterprise contact, while direct contact details remain hidden until the student enables them,
- student profile completion uses nine required checks: name, phone, avatar, location, summary, skills, work experience, education, and CV; Portfolio is optional and never prevents a 100% complete profile,
- after a profile save, the frontend synchronizes the returned student name/avatar into the shared authenticated-user state so header/account surfaces update without a new login,
- changing the password still requires the current password and the shared protected password policy.

Hybrid job recommendation rules:

- Only authenticated `STUDENT` accounts can call `/student/job-recommendations`.
- Candidate jobs must be `APPROVED` and have `slots > 0`.
- The deterministic score uses centralized weights: location 25%, category 18%, salary 12%, job type 10%, skills 20%, experience 10%, and education 5%.
- Missing profile/job data receives a neutral score instead of being treated as a perfect match or an automatic rejection.
- Exact category matches stay deterministic; semantic category scoring is applied only when the category is not an exact normalized match.
- AI may refine skills, experience, education, and non-exact category evidence. Any matched/missing/related skill returned by AI is checked against the real input skill lists before it can affect the explanation.
- The OpenAI request excludes student identity/contact fields and raw CV content. It sends only minimized job-preference, skill, experience, education, and candidate-job text.
- Missing AI configuration, timeout, provider error, invalid structured output, or Redis failure must degrade gracefully to deterministic recommendations.
- One structured AI request evaluates the deterministic top-20 candidate batch; jobs returned beyond that batch retain deterministic scores, and the backend must not issue one provider request per job.
- Results are sorted by final score descending, with created time and job ID as deterministic tie breakers. Client-side filters preserve this order.
- Redis cache defaults to 45 minutes. A fingerprint of relevant profile and eligible-job inputs prevents stale cached results after those inputs change; `refresh=true` explicitly bypasses cache.
- Recommendation scores and explanations are computed response data only; they are not persisted to database tables.

Student career-guidance rules:

- Blog reading, search, filtering, and browser-local bookmarks remain public; only authenticated `STUDENT` accounts can call `/student/career-guidance` from the Blog dialog or homepage career planner.
- The AI request contains only the goal typed by the student and public guidance context: the selected Blog article or the homepage planner's fixed career-planning context. It must not include student identity, contact details, profile fields, CV content, applications, or conversations.
- Input length and article-highlight count are bounded before the provider is called. Article and goal text are treated as untrusted context so embedded instructions cannot replace the server system prompt.
- The provider must request strict structured output with one direction, actionable next steps, priority skills, and related topics. The backend owns the fixed advisory disclaimer and sets `ai_used=true` only after valid provider output.
- Missing OpenAI configuration, timeout, provider errors, or invalid output return an explicit unavailable response. The frontend must not present deterministic or placeholder text as an AI answer.
- Career-guidance prompts and results are response-only data and are not stored in the database.

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
- While `registration.requireKyb` is enabled, enterprise business APIs also require approved KYB and a non-empty GPKD URL. Disabling it bypasses this gate without rewriting the stored verification state.
- `GET /enterprise/profile` and `PUT /enterprise/profile` are the exception: pending or rejected enterprise accounts can load settings and submit GPKD updates after login.
- If `kyb_status` is blank, backend falls back to `status_kyb`.
- Enterprise dashboard access is allowed for every active `ENTERPRISE` account. `PENDING` accounts see a waiting-for-review notice. `REJECTED` accounts see the latest stored rejection reason and a resubmit CTA.

Admin approval rule:

- Admin must not approve an enterprise if GPKD is missing.
- Admin can request an enterprise to submit GPKD.
- Requesting GPKD creates a `KYB` notification through `NotificationService`.
- Updating KYB status from the admin enterprise table also creates a `KYB` notification for the enterprise with an action link to `/enterprise/settings`.
- Rejected KYB stores `kyb_reject_reason`; non-rejected KYB states clear it.
- Requesting GPKD no longer creates a `messages` row because messages are reserved for student-enterprise application chat.
- If a non-approved enterprise submits a non-empty GPKD URL through profile settings, KYB is moved back to `PENDING` for admin review and the previous rejection reason is cleared.

Frontend access rule:

- Enterprise users without KYB approval are allowed to complete login and open remediation pages such as dashboard, settings, notifications, and messages.
- Login metadata includes the current `enterprise_require_kyb` policy. Frontend guards, warnings, and locked navigation require approval only when that flag is true; a legacy session without the field defaults to the safer required behavior. Backend enterprise business APIs remain the live final KYB/GPKD gate.
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
- Public list/detail and authenticated recommendation payloads expose aggregate application and favorite counts. Student-board popularity visuals must use these persisted aggregates, not card position or fabricated values.
- A HOT label represents high saved-job interest; high-demand represents high application count. A low-competition opportunity requires a personalized score of at least 75 and no more than one application and one favorite.

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
- Scheduling an interview creates an `INTERVIEW` notification for the student tied to that application.
- Enterprises can submit an interview result only after the scheduled interview time has passed.
- Interview results are `HIRED`, `REJECTED`, or `NO_SHOW` and can only be stored once for an application.
- A `REJECTED` interview result requires a note explaining why the candidate was not accepted.
- A `HIRED` interview result decrements the related job `slots` in a transaction. If slots reach `0`, the job status becomes `CLOSED`, preventing new public applications for that job.
- Applications with a `HIRED` interview result are surfaced in the enterprise saved-candidate view so employers can review accepted candidates without searching the full application list.
- Submitting an interview result creates an `INTERVIEW` notification for the student tied to that application.

## Notifications And Chat

Notification rules:

- Protected notification APIs are available to every authenticated active user.
- Users can list, count, mark one, and mark all only for their own notifications.
- Notification ownership must be enforced in update queries with `user_id`.
- Business handlers should call `NotificationService` instead of creating `models.Notification` directly.
- `MQ_ENABLED=false` preserves synchronous notification writes. With `MQ_ENABLED=true`, `NotificationService` writes a `notification.create` outbox event in the caller transaction and the RabbitMQ consumer creates the notification asynchronously.
- Queued notifications are at-least-once messages but must produce at most one database row through the unique `event_id`; broker downtime must delay notification delivery without rolling back an already persisted outbox event.
- Invalid/failed consumer payloads are rejected to the durable dead-letter queue. Outbox publisher failures retry with bounded exponential delay and stop automatically after 20 attempts for operator inspection.
- Disabling in-app notifications prevents both synchronous notification rows and queued outbox notification events.
- Message notifications use `source_type = CONVERSATION` and `source_id = conversation_id`.
- Khi doanh nghiệp gửi tin tuyển dụng sang trạng thái `PENDING`, hệ thống tạo thông báo `JOB` cho các tài khoản admin đang `ACTIVE`.
- Khi học viên tạo đơn ứng tuyển mới, hệ thống tạo thông báo `APPLICATION` cho các tài khoản admin đang `ACTIVE`.
- Các widget thông báo/nhịp hoạt động trên trang chủ và header dashboard chỉ hiển thị dữ liệu được tạo trong 24 giờ gần nhất; dữ liệu cũ vẫn nằm trong database và không bị xóa.

Conversation rules:

- A conversation is always attached to one `JobApplication`.
- One application can have at most one conversation.
- The student participant is the application `student_id`.
- The enterprise participant is inferred from the application's job `enterprise_id`.
- The client never sends `sender_id`, `receiver_id`, `student_user_id`, or `enterprise_user_id`.
- From an owned application conversation, a student may open the related active enterprise's presentation profile. The lookup must verify the persisted student/application/enterprise relationship and must not expose enterprise email, phone, tax code, GPKD, coordinates, KYB internals, or non-approved jobs.
- Students can chat only on their own applications.
- Enterprises can chat only on applications for jobs they own.
- A conversation is created lazily when a participant opens it or sends the first message.
- Chat is allowed immediately after the application exists.
- Applications rejected by the enterprise cannot receive new chat messages, but existing history can still be viewed.
- Interview results `REJECTED` and `NO_SHOW` block new chat messages, but existing history can still be viewed.
- Interview result `HIRED` keeps chat open.
- Closing a job does not automatically close conversations for hired or in-process applications.
- Conversation-list responses expose the effective send state and locked reason computed by the backend. The frontend must disable the composer for read-only conversations but the send API remains the final permission check.

Read/unread rules:

- Sending a message increments the unread counter for the receiver side only.
- Marking a conversation read marks only messages sent by the other participant.
- Marking read also resets the current user's unread counter for that conversation.
- Sending a message, updating unread counters, and creating the receiver notification must happen in one transaction.

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
- Admin can edit enterprise profile fields: company name, contact phone, tax code, GPKD URL, KYB status, and KYB rejection reason when the status is `REJECTED`.
- Admin cannot approve enterprise KYB if GPKD URL is blank.

Admin reporting and category rules:

- Report endpoints are read-only and aggregate persisted users, enterprises, jobs, applications, categories, locations, and student-profile data; they do not generate sample metrics.
- Category names are required, trimmed, limited to 100 characters, and unique without regard to letter case.
- A category that still contains one or more skills cannot be deleted. Skills and existing job-skill relations are never cascaded away by category management.

Admin settings rules:

- Admin Settings are one shared, versioned aggregate persisted in `system_settings`. Only authenticated `ADMIN` users that pass the optional IP allowlist can read or update it.
- The frontend loads one snapshot on mount and writes only on an explicit save/reset. Optimistic `version` conflicts return the current snapshot in the `409` response; clients do not automatically overwrite or refetch.
- Student and enterprise registration switches apply to new password registrations. The student switch also prevents Google OAuth from auto-creating a new student, but never blocks an existing Google-linked account from logging in.
- `requireKyb` controls the enterprise business-route middleware gate. Disabling it allows an active enterprise role through those routes without changing stored KYB/GPKD state; enabling it requires approved KYB and a non-empty GPKD URL except for profile remediation routes. The value is piggybacked on password/Google login responses so frontend guards need no extra request.
- Manual moderation stores submitted jobs as `PENDING` and notifies admins. Automatic moderation stores new submissions as `APPROVED`. The per-enterprise draft limit is enforced inside the create/status-transition transaction under an enterprise-row lock.
- `pendingHours` is stored for forward compatibility but has no scheduler yet. Public reads always require `APPROVED`, so `hideRejected` is fixed true.
- Disabling in-app notifications stops new notification rows while leaving existing rows readable. The KYB alert switch controls the admin notification created for a newly registered pending enterprise.
- Strong-password complexity applies to new password registrations and password changes when enabled. The request DTO still requires at least eight characters for password changes.
- Session minutes apply only to newly issued access tokens; existing access and refresh tokens are not rewritten. Failed password logins are tracked per normalized email in a bounded, process-local map and lock for 15 minutes at the configured threshold, avoiding one Redis/database write per failure.
- A production bootstrap admin IP allowlist is mandatory and is checked before the database-backed IPv4/CIDR allowlist on every `/admin/*` API. An update that would exclude the saving admin's current IP is rejected to reduce self-lockout risk. Auth/bootstrap routes also have per-IP rate limits, while the existing normalized-email lock remains authoritative for repeated password failures.
- Email verification, email alerts/digest, reported-job alerts, and admin 2FA have no provider/flow in this runtime. Their capabilities are `unavailable` and submitted enabled values are normalized back off rather than presented as working. Infrastructure backup is scheduled by the production Compose restic service; the Admin Settings backup card remains unavailable because it does not control that external service.
- Secrets and environment values are never exposed through Admin Settings. Backup and log actions stay disabled; lightweight runtime/database diagnostics are returned in the Settings snapshot instead of fabricated values.

## Uploads And GPKD Files

Upload rules:

- GPKD upload uses `POST /api/v1/auth/upload`.
- Local files are served by backend from `/uploads`.
- Cloudinary is required in production. Every accepted upload must pass size, extension, binary signature and ClamAV checks before Cloudinary receives the stream.

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
