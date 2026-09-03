# Architecture

Last updated: 2026-09-03

## Product Context

QuickWork connects students with enterprises posting short-term or part-time jobs.

Main roles:

- `STUDENT`: register, log in, access student area, manage profile, view job-related pages.
- `ENTERPRISE`: register company, enter the recruiter dashboard after login, upload/update GPKD, read KYB notifications/messages, and create/manage jobs only after approval.
- `ADMIN`: manage users, enterprises, KYB, jobs, dashboard data.

## High-Level Runtime Flow

```text
Nuxt/Vue page
  -> frontend/app/services/*
  -> frontend/app/services/api.ts
  -> HTTP /api/v1
  -> Go Fiber route
  -> AuthMiddleware / RoleMiddleware / EnterpriseApprovedMiddleware
  -> handler
  -> service or repository
  -> GORM
  -> MySQL
  -> Redis for token blacklist/refresh-token support
  -> RabbitMQ for optional asynchronous notification delivery
```

## Backend Entry Point

Source of truth: `backend/cmd/api/main.go`

Detailed backend startup and request lifecycle notes live in `docs/backend-runtime-flow.md`.

Runtime responsibilities:

- load config from `.env` or environment,
- validate production configuration and initialize Cloudinary,
- initialize Redis,
- set JWT secret,
- connect to MySQL,
- run `database.Migrate(db)`,
- run `database.Seed(db)` for idempotent local/demo data only when `DB_SEED_ENABLED=true`,
- start the optional RabbitMQ notification outbox dispatcher and consumer,
- build repositories/services/handlers,
- configure Fiber and CORS,
- serve static uploads at `/uploads`,
- register `/api/v1` routes,
- register Swagger at `/swagger/*` outside production only,
- listen on `APP_PORT` defaulting to `8080`, then gracefully stop HTTP and background workers on `SIGINT`/`SIGTERM`.

Important: a route is runtime-active only if it is registered by `main.go`.

## Production Container Topology

Phase-one VPS packaging uses `compose.yaml` plus `compose.production.yaml`:

```text
public :80/:443 -> nginx
                    -> frontend:3000
                    -> backend:8080
                          -> mysql
                          -> redis
                          -> rabbitmq
                          -> clamav
off-site object storage <- backup (MySQL dump + uploads, encrypted by restic)
```

Only Nginx publishes host ports. MySQL, Redis, RabbitMQ and ClamAV share an internal Docker network; named volumes persist database, broker, cache, antivirus signatures and local upload data. Backend/frontend production filesystems are read-only except explicit volumes/tmpfs and Linux capabilities are dropped. Nginx terminates TLS, adds HSTS/security headers, and preserves `/api/` and `/uploads/` when proxying to Fiber. The backup container creates transaction-consistent MySQL dumps, archives uploads and sends encrypted restic snapshots to storage outside the VPS. See `DEPLOYMENT.md` for the operator workflow.

Local verification uses the automatically loaded `compose.override.yaml`. It replaces the TLS virtual host with `deploy/nginx/quickwork.local.conf`, binds HTTP and RabbitMQ Management to loopback only, and attaches RabbitMQ to `edge` only so Docker can publish the local management port. Explicit production commands use `-f compose.yaml -f compose.production.yaml`, so they do not load this local override and keep RabbitMQ private.

Cloudflare demo sharing adds the explicit `compose.tunnel.yaml` overlay. Its locked-down `cloudflared` container joins only `edge` and exposes the existing Nginx origin through a temporary `trycloudflare.com` hostname; it cannot reach the private `data` network directly. Browser API requests use the same-origin `/api/v1` base so a remote browser never resolves `localhost` on the visitor device. Nuxt server rendering uses private runtime config `apiBaseInternal` (`http://backend:8080/api/v1` in Compose), while `apiClient` selects the internal base on the server and the public base in the browser. `scripts/start-quick-tunnel.ps1` owns rebuild, tunnel recreation, URL discovery, DNS-safe public health verification and output; `scripts/stop-quick-tunnel.ps1` stops only the tunnel service.

Render production deployment is defined by root `render.yaml`. Only the Nuxt web service is public. Nitro catch-all routes proxy `/api/*` and `/uploads/*` to the private Go service using server-only `apiProxyTarget`; browser API configuration remains `/api/v1`, preserving first-party strict cookies. SSR API requests normalize Render's scheme-less private `hostport` and append `/api/v1`. The Go config accepts Render's `PORT`, managed Key Value `REDIS_URL`, and discrete RabbitMQ host/credential variables while retaining the existing Compose variables. MySQL, RabbitMQ and ClamAV run as disk-backed/private image services; Key Value uses its private connection string.

## Backend Layering

Common path:

```text
routes -> middlewares -> handlers -> services/repositories -> models -> database
```

Current patterns:

- Auth uses handler plus service plus repositories.
- Enterprise jobs use handler plus job repository.
- Student job actions use `StudentJobHandler` with direct `*gorm.DB` queries and `NotificationService` for admin-facing application events.
- Student job recommendations use `StudentRecommendationHandler -> JobRecommendationService -> RecommendationRepository`, with a deterministic scorer, optional `JobMatchAI` provider, and Redis cache adapter.
- Student career guidance from the Blog dialog or authenticated homepage planner uses `StudentCareerGuidanceHandler -> CareerGuidanceService -> CareerGuidanceAI`. The OpenAI adapter shares the existing runtime model/base URL/timeout configuration, requests strict Responses API output, and has no database repository because prompts and results are not persisted.
- Enterprise application review uses `EnterpriseJobHandler` with direct `*gorm.DB` queries scoped to the current enterprise's jobs.
- Admin currently uses handler with direct `*gorm.DB` queries.
- Notifications use `NotificationHandler -> NotificationService -> NotificationRepository` when RabbitMQ is disabled. When enabled, writes use `NotificationService -> outbox_events -> RabbitMQ -> idempotent consumer -> notifications`; reads still use `NotificationRepository`.
- Student-enterprise application chat uses `ConversationHandler -> ConversationService -> ConversationRepository/MessageRepository -> NotificationService`.
- Business handlers that need to notify users should call `NotificationService`; they should not create notification/message rows directly.
- Shared helpers live under `backend/pkg`.

Main backend directories:

- `backend/internal/handlers`: Fiber handlers/controllers.
- `backend/internal/messaging`: RabbitMQ topology, outbox dispatcher, notification consumer, retry and dead-letter handling.
- `backend/internal/services`: business logic, especially auth and job service variants.
- `backend/internal/repositories`: DB/Redis access wrappers.
- `backend/internal/models`: GORM models and enums.
- `backend/internal/middlewares`: auth, role, enterprise KYB access.
- `backend/routes`: route registration helpers.
- `backend/pkg`: shared utilities.
- `backend/database`: MySQL/Redis initialization and migrations.

## Frontend Entry Points

Source files:

- `frontend/nuxt.config.ts`
- `frontend/app/app.vue`
- `frontend/app/plugins/api.ts`
- `frontend/app/services/api.ts`
- `frontend/app/stores/auth.ts`
- `frontend/app/middleware/*.ts`
- `frontend/app/pages/**/*.vue`

Frontend request flow:

```text
page/layout/component
  -> service in frontend/app/services
  -> apiClient
  -> runtime config public.apiBase
  -> backend /api/v1
```

Admin system settings are now a shared backend aggregate rather than browser-local state:

```text
frontend/app/pages/admin/settings.vue
  -> AdminService.getSettings/updateSettings
  -> GET/PUT /api/v1/admin/settings
  -> AuthMiddleware
  -> RoleMiddleware("ADMIN")
  -> AdminIPAllowlistMiddleware
  -> AdminSettingsHandler
  -> SystemSettingsService (one-minute process cache + optimistic version)
  -> models.SystemSetting singleton
```

`cmd/api/main.go` constructs `SystemSettingsService` before auth and notification services, then injects the same instance into auth, notifications, enterprise job moderation, KYB middleware, admin IP middleware, and the Settings handler. This keeps one normalized snapshot and avoids separate APIs/queries for every settings card. The page makes one GET on mount and one PUT per explicit save/reset; PUT and 409 responses carry the canonical snapshot so no refetch, polling, or autosave is required. Legacy `quickwork:admin-settings-local` data is removed only after a successful server snapshot.

The API returns field-level capabilities. Active fields are consumed by runtime policy points; `stored_only`, `unavailable`, and `fixed` controls are labelled or disabled in the UI. The platform, moderation, and security forms retain card-width container queries so fields switch between one and two columns independently of the expanded/collapsed admin sidebar. Dedicated Platform/Security card pairs stretch without fixed heights; `Van hanh` keeps moderation and notifications as two responsive cards; Overview keeps compact cards and same-response diagnostics. The save bar remains in normal document flow, and the timezone selector uses runtime-supported IANA identifiers with a curated fallback.

`frontend/app/plugins/api.ts` is the single Nuxt plugin that provides `$api`. Compiled JavaScript copies must not be emitted beside this source file because Nuxt auto-loads both `.ts` and `.js` plugins and duplicate `provide.api` registrations fail during SSR.

`apiClient` behavior:

- relative URLs use `config.public.apiBase`,
- absolute URLs bypass baseURL,
- browser requests use `credentials: include`; access and refresh JWT cookies are HttpOnly and cannot be read by application JavaScript,
- JSON content type is default,
- `FormData` removes content type so browser can set multipart boundary.

Frontend auth UI:

- `/login` and `/auth/login` render the shared `AuthLoginExperience` login surface.
- `/register` and `/auth/register` render the shared `AuthRegisterExperience` registration surface.
- Password login and Google callback use role-based redirects: `ADMIN` lands on `/admin/dashboard`, `ENTERPRISE` lands on `/enterprise`, and `STUDENT` lands on the requested redirect or `/`.
- When password login succeeds for an enterprise account whose KYB is not approved and `registration.requireKyb` is enabled, `AuthLoginExperience` shows an immediate warning state and toast before redirecting to the enterprise area.
- `frontend/app/middleware/auth.global.ts` and `frontend/app/middleware/company.ts` allow every active `ENTERPRISE` account into `/enterprise`, `/enterprise/settings`, `/enterprise/notifications`, and `/enterprise/messages`; they must not clear the session solely because KYB is not approved.
- Password and Google login responses carry `enterprise_require_kyb`. The auth store combines it with the real approval state, and `frontend/app/middleware/enterprise-approved.ts` protects jobs, applications, and interviews only when the policy requires KYB. This reuses the existing login response instead of spending another Settings API request; backend middleware remains the live source of truth.
- The shared auth page shell/input/brand structure lives in:
  - `frontend/app/components/AuthShell.vue`
  - `frontend/app/components/AuthField.vue`
  - `frontend/app/components/AuthBrandMark.vue`
  - `frontend/app/components/FooterBrandMark.vue`
- `frontend/app/middleware/auth.global.ts` treats all four auth entry routes as public pages. Existing unauthenticated protected-route redirects still go to `/auth/login`.

Dashboard shell behavior:

- Admin and enterprise dashboard pages use shared sidebars from `frontend/app/layouts/admin.vue` and `frontend/app/layouts/enterprise.vue`.
- On desktop, both sidebars can collapse to an icon-only rail and expand back to the full menu. The main content area is flex-based, so page content grows when the sidebar collapses and shrinks evenly when the full sidebar is shown. The desktop collapse handles are compact 32px circular controls, aligned to the vertical center of the sidebar/header identity area.
- The enterprise sidebar keeps the recruiter brand/logo inside the dark sidebar shell. On desktop, the sidebar is fixed full-height from the top of the viewport, while the enterprise header and main content are offset to the right and shrink/expand with the sidebar width. The recruiter logo row is a 64px header-aligned identity area so it lines up with the top app header and collapse handle. The top header is reduced to notification and account actions, while the sidebar carries the QuickWork recruiter identity. Expanded enterprise navigation is grouped into `Tong quan`, `Quan ly tuyen dung`, and `Tien ich`; the notification destination is no longer listed in the sidebar because notifications stay available from the header. When KYB is required, non-approved accounts see a compact amber KYB card and locked recruiting actions use dark translucent styling with KYB badges; disabling the shared KYB gate removes those client-side locks without marking the account itself as approved. When collapsed, the sidebar becomes a compact icon rail with smaller square blue active tiles and visible group divider dashes. The `Ung vien` item opens a compact white TopCV-style flyout card with a small pointer, three applicant destinations, and short descriptions; the previous list-management action is not shown in this flyout. Opening the flyout highlights only the `Ung vien` rail icon and suppresses other sidebar active states until a destination is chosen. The account card is hidden, but the divider and logout icon remain visible. The enterprise sidebar uses a dark themed scrollbar without arrow buttons for long navigation lists.
- On mobile, the sidebar still behaves as an overlay drawer opened from the header menu button.

Frontend search behavior:

- Text search in the public homepage, public job board, enterprise job/application tables, saved/rejected candidate views, and admin user/student/enterprise tables uses `frontend/app/utils/searchText.ts`.
- `normalizeSearchText` removes Vietnamese accents, converts `đ/Đ` to `d/D`, lowercases, and collapses spaces before client-side `includes` matching. Users can type `ha noi`, `thuc tap`, or `ke toan` and still match `Hà Nội`, `Thực tập`, or `Kế toán` without changing API routes or stored data.

Public homepage UI:

- `/` renders `frontend/app/pages/index.vue`, which delegates to `frontend/app/components/HomeLandingPage.vue`.
- `HomeHeader` is auth-aware: guests see saved/login/register actions, while authenticated students see a right-aligned notification button, chat button, and compact account pill with avatar, name, role, and chevron. On desktop, the header uses three balanced columns so the primary navigation remains centered between the brand and account actions instead of bunching beside the logo. The authenticated student header does not show the recruiter `Dang tuyen ngay` prompt. Its notification button loads protected notifications when a session exists and uses the shared notification dropdown behavior. The student account dropdown does not duplicate the header chat action and does not expose separate password-setting or change-password shortcuts.
- `frontend/app/data/careerTools.ts` owns the career-tool destinations and presentation metadata, while `frontend/app/components/home/CareerToolsDropdown.vue` owns the single-column desktop menu. `HomeHeader` and the authenticated student dashboard header both render this component, so `Cong cu nghe nghiep` behaves consistently on public pages, messages, applications, profile, and settings. Implemented destinations route to jobs/profile while unavailable skill-analysis and interview-preparation entries use the shared development notice. `HomeHeader` retains its separate mobile disclosure.
- `/blog` is a public student career-content page rendered from `frontend/app/pages/blog.vue` and the static typed catalog in `frontend/app/data/blogArticles.ts`; `auth.global.ts` explicitly allowlists it for guests. It reuses `HomeHeader`/`HomeFooter`, uses the project-owned six-panel career illustration sheet with exact three-column/two-row card cropping, supports category and keyword filtering without changing the viewport on category selection, a two-column article/AI detail dialog, and browser-local saved articles with an explicit highlighted state. The default catalog and recommendation set cover technology, accounting, sales, design, marketing, customer service, logistics, HR, tourism and cross-industry guidance. The newsletter surface was removed. Authenticated students can submit a goal from the detail dialog to protected `POST /student/career-guidance`; guests receive a login action, and missing provider configuration is shown as unavailable rather than a fabricated AI result.
- The authenticated `HomeHeader` account menu groups real student destinations into job/exchange, profile management, and personal/security sections. All three groups start collapsed each time the menu opens and expand only after the user selects a heading. Saved jobs use `/student?view=saved`, applications use `/student/applications`, matching jobs use `/student`, the profile uses `/profile`, and the four settings shortcuts deep-link to `/settings?section=account|security|jobs|privacy`. The message icon opens a recent-conversation dropdown instead of navigating immediately; its six-item list uses a subtle divider between conversations, while the list and unread count are requested lazily on the first open, cached for the current header mount, and never polled.
- `HomeLandingPage` is an orchestrator only; section UI lives under `frontend/app/components/home/`. Authenticated `STUDENT` users additionally see `HomeCareerAI`, a functional career-plan workspace that reuses `POST /student/career-guidance`, sends the typed goal plus fixed public planning context, and renders only validated structured provider output. Guests and other roles do not render this protected tool.
- Homepage data and derived public statistics live in `frontend/app/composables/useHomeJobs.ts`.
- `frontend/app/composables/useHomeJobs.js` is a runtime compatibility shim that only re-exports `useHomeJobs.ts`; it must not contain an independent generated copy of the composable because extensionless Nuxt imports can otherwise execute stale behavior.
- Guest and non-student homepage jobs come from `JobService.getAllJobs()` and are mapped with `frontend/app/utils/jobDisplay.ts`; the homepage must not use mock job/company/category data. The public job response already preloads `enterprise_profile`, so homepage cards and hover previews render its persisted `logo_url` with contained sizing and use company initials when the logo is missing or cannot be loaded.
- For an authenticated student, `useHomeJobs.ts` loads `/student/job-recommendations` and `/student/job-actions`. Recommendation failure falls back to `JobService.getAllJobs()` so the homepage remains usable; favorite/apply state continues through `StudentService`.
- `JobRecommendationService` first applies the seven centrally weighted deterministic criteria to every eligible job, keeps the best configured batch (20 by default), then optionally sends that whole batch through one `JobMatchAI` request. The OpenAI Responses adapter requests strict JSON Schema output and sends no name, email, phone, CV content, or other student identity data. Missing configuration/provider failure keeps the deterministic result.
- Recommendation cache entries use `recommendations:student:<id>:v2`, a 45-minute default TTL, and a SHA-256 fingerprint over relevant profile/job inputs. A Redis outage is non-fatal; `refresh=true` bypasses reads. On a cache hit, current application/favorite aggregates are refreshed from the already-loaded candidates without calling the AI provider again. This avoids per-job AI calls and repeated provider calls while keeping popularity badges current.
- `frontend/app/composables/useStudentLoginPrompt.ts` centralizes login-required notifications for unauthenticated student actions. Public student surfaces show a warning toast and remain on the current page; they do not navigate to `/auth/login` automatically. Homepage save/apply actions, public job-detail save/apply actions, the message entry action, and the footer saved-jobs action use this shared flow.
- `frontend/app/composables/useToast.ts` is the toast state source of truth; its `.js` sibling is only a compatibility re-export. The queue uses one Nuxt `useState` key so extension or module-resolution differences cannot create separate client stores. Toasts may carry a `groupKey`: another event in the same group updates the existing card and resets its expiry instead of stacking. The global queue shows only the latest card, defaults to a 2.4-second expiry, and renders a compact one-line detail below the header. `/student` groups favorite, apply, and their failure feedback independently.
- The public homepage structure is:
  - `HomeHeader`
  - `HomeHero` plus `HomeSearchBar`
  - `HomeQuickStats`
  - `HomeFeaturedJobs`
  - `HomeJobDetailPanel`
  - `HomeCategories`
  - `HomeEmployerCta`
  - `HomeCareerCta`
  - `HomeFooter`
- The homepage intentionally does not show admin role selection, market-dashboard charts, or duplicated impact-stat sections.
- `HomeCareerCta` is shown only to unauthenticated visitors; authenticated users stay on the job discovery flow after login.
- `HomeFeaturedJobs` renders the full job list in pages of nine jobs, with dropdown filters for location, salary, experience, category, and job type. Personalized student results retain backend match order through filtering and use `JobMatchScoreBadge` to expose the total score, each of the seven criterion scores on a 10-point scale, strengths, and gaps on hover/focus; generic public results retain the existing client-side ranking. The shared score panel is teleported to `body`, uses fixed viewport-aware placement above or below its trigger, and remains open while the trigger or panel is hovered/focused so card/header overflow cannot clip it. Selecting a category card in `HomeCategories` sends a validated one-time category filter request into `HomeFeaturedJobs`; users can still switch to any other filter or clear the value because `useHomeJobs.ts` does not apply a separate hard category filter. The filter dropdown closes on outside click, and the filter hint can be dismissed. The section auto-advances pages after a longer idle period, pauses while a job title, hover preview popup, or any match-score panel is active, and renders `HomeJobDetailPanel` beside the hovered job card only when the job title is hovered or focused, using existing `DisplayJob` data only. Clicking the title opens the full public detail route `/jobs/:id`.
- Homepage location chips and job-card location badges normalize detailed addresses to the province/city segment. Job-type badges on both the card and hover detail panel use the same color token as the card/panel border so each surface has one consistent role/type color. Cards use a fixed height with reserved footer space so the favorite control stays fully visible and aligned, plus a single-line truncated location badge while the full stored address remains available as a tooltip.
- Public and auth footers share `frontend/app/components/FooterBrandMark.vue` so the QuickWork footer logo stays visible and consistent on dark backgrounds.

Public job board:

- `/student` is now the public all-jobs board reached from homepage "Xem tất cả" and ngành nghề links.
- `/student` remains a public board and does not require the `student` middleware. Guests/non-students use `JobService.getAllJobs()`; an authenticated student requests up to 100 recommendation results, defaults sorting to match score, and shows the same viewport-aware seven-criterion hover/focus panel on every returned card. Recommendation failure falls back to the public list.
- The recommendation service deterministically scores all returned jobs but sends only its top 20 deterministic candidates to the optional AI provider in one request. This lets the full board show scores without increasing AI quota.
- `/student` job actions call `StudentService` and require authenticated role `STUDENT`; unauthenticated users see the shared login-required warning before the delayed redirect to the login page.
- `/student?view=saved` reuses the public job board and persisted `GET /student/job-actions` favorite IDs to show only jobs saved by the current student. Removing a favorite removes it from that view. The saved view exposes a persistent `Tất cả việc làm` control in both the hero and results header, so returning to the complete board does not depend on reaching an empty state.
- Job-title links on `/student` also open `/jobs/:id`. The public detail page uses its own `HomeHeader`/`HomeFooter` surface without the legacy default sidebar, loads the persisted job through `JobService.getJobDetail()`, and reuses the authenticated student save/apply APIs without requiring login merely to read the job. Its top utility row keeps the back control on the left and compact save/apply/share controls on the right. The desktop enterprise column starts beside the job hero instead of below it. The content selector exposes only description, company, and job-information views; description is the default, while selecting job information reveals both the metadata and skill cards without changing the current viewport position. On extra-large screens the job-information card is raised beside the hero, and its location row presents the normalized city/province first with the stored detailed area in muted text underneath. The separate candidate-requirements surface is omitted. The company card uses a dedicated hero image with the logo overlapping half of the image's lower edge; reserved profile padding keeps the logo clear of the company name and details. Verification marks use a solid green badge, and unavailable supporting links use the shared development toast. `auth.global.ts` recognizes only numeric `/jobs/:id` paths as public; protected job collections are not broadly allowlisted.
- The filtered and sorted `/student` job list is paginated client-side with a fixed maximum of five jobs per page. Changing search, filters, or sorting returns the list to page one.
- The `/student` presentation follows the supplied three-column job-board direction: a dark personalized hero contains the live keyword/location/type search, quick filters, and a saved-job shortcut only when at least one persisted favorite exists. The content area places collapsed-by-default accordion filters on the left, responsive job cards in the center, and a persisted saved-job preview plus profile/preference calls to action on the right; the saved preview is omitted entirely when its count is zero. The profile-completion call to action loads the authenticated student profile once with the page and is omitted when the same nine required checks used by the active profile workspace reach 100%; Portfolio remains editable but optional. Filter headings expand to checkbox/location options and show the current selected count. The search submit scrolls to the already client-filtered results without adding an API request. Job cards retain match-score detail, save/apply state, skills, metadata, and direct detail links. `frontend/app/utils/jobSignals.ts` is the shared visual-signal source for both `/student` and the homepage featured-job grid: jobs created within the latest three days receive `MỚI`; the upper quartile (with minimum safeguards) of application/favorite aggregates receives `Ứng tuyển nhiều`/`HOT`; and a personalized score of at least 75 with at most one application and one favorite receives `Cơ hội ít cạnh tranh`. Aggregate counts remain internal to classification, while each surface renders the same badges, accent rail, and signal-specific card treatment without another API or AI request.
- The `/student` filter and sort controls use the shared rounded `ScrollSelect` option panel. Location choices are derived from the normalized city/province portion of persisted job locations, while type, experience, category, salary, and quick-filter availability/counts are derived from the currently loaded real jobs; skills remain searchable through the keyword field but are intentionally omitted as a separate accordion filter. Long accordion option groups use an internal rounded scrollbar instead of truncating options. The hero keeps decorative artwork clipped in its own layer but allows the select menus to overflow above the result section, preventing dropdown content from being hidden. Save-job buttons reserve a fixed square size and circular shape so surrounding badge content cannot distort the heart control. The saved-job preview uses a fixed two-column header with non-wrapping labels so its title/count and navigation action stay on one line at the 300-pixel sidebar width.
- The `student` layout keeps the public `HomeHeader` and `HomeFooter` only for the `/student` all-jobs board so homepage "Xem tat ca" behavior stays unchanged.
- Authenticated student activity pages that use the `student` layout, such as `/student/applications`, `/student/messages`, `/profile`, and `/settings`, render a dashboard-style shell with a full-width header, grouped sidebar sections, a collapsible desktop rail, notification dropdown, message/user controls, and the shared desktop career-tools dropdown. The overview group exposes only `Trang chu` and uses the outline dashboard icon from the FigJam direction; the separate `Bang dieu khien` item is omitted. The sidebar links `Ứng tuyển của tôi` to the real application workspace and omits the inactive `Viec lam da luu`, `Viec lam phu hop`, and `CV cua toi` destinations. It keeps a thin custom scrollbar but hides native WebKit up/down arrow buttons. The student app header intentionally does not include the inactive heart/saved button.
- `/student/applications` loads the existing protected applied-jobs endpoint once on mount without polling. It derives the presentation stages from persisted application status, interview schedule, and interview result; search, status/time filters, five-item pagination, summary counts, timeline, interview details, result state, job skills, and employer notes are client-side views over that response. The search field keeps a bounded desktop width so the `Tất cả` status remains visible, and the time filter uses the shared rounded `ScrollSelect`. The submitted-profile `Cập nhật` row is shown only after persisted employer activity exists. Opening chat remains user-initiated through `ConversationService.openByApplication()` and routes to the existing student message center; viewing a job routes to `/jobs/:id`.
- `/profile` and `/settings` are authenticated account pages surfaced from the user dropdown and student sidebar. `/profile` loads the existing student profile API and presents persisted identity, job preferences, skills and CV in a compact FigJam-aligned cover/profile card plus responsive bento layout; unavailable experience and education data remain explicit empty states rather than mock records. Profile, experience, education, document, portfolio, and skill edits use local sectioned dialogs with labeled fields, consistent label/control/help rows, accessible color-backed action hover/focus states with short tooltips, and an application-styled delete confirmation. Persisted experience and education periods are normalized for display as `dd/mm/yy – dd/mm/yy`; current records end with `Hiện tại`. The dialog shell clips its internal rounded scrolling surface so native scroll tracks cannot square off the outer corners. Form dropdowns use the shared `ScrollSelect` `form` size so the trigger, menu, scrollbar, and individual options remain rounded. Skill-category data is adapted from catalog `{id,name}` semantics to the select's required `{value,label}` contract before rendering. Selecting current employment hides the end-date input without discarding its unsaved value, while the checkbox, leading icon, and copy remain vertically centered. Skills are grouped by category; the editor can call the protected student skill endpoint to reuse a category or enter an explicit create-category mode that creates the category together with its first skill. Sharing uses the browser share/clipboard capability. `/settings` keeps four functional sections—account, security, job preferences, and privacy—in its settings menu. The account view separates the account summary, personal information, avatar upload and default-CV upload into clear cards. Avatar and CV files upload through the protected `POST /student/profile/upload` route to Cloudinary; the returned URL remains in the form until the user presses save, while removal clears the corresponding profile URL before save. Save is disabled while a file is uploading. It loads and persists settings through `StudentService.getProfile()`/`updateProfile()`, synchronizes the saved display name/profile back into the auth store, and uses `AuthService.changePassword()` for the protected password flow. `PasswordField` renders validation beneath each input and the backend validates the current password before updating. Job preferences use the shared rounded `UiScrollSelect`; preferred location is composed from city and ward selections. The student sidebar keeps only the general settings destination and does not show a separate change-password item; password recovery remains linked from the login flow.
- `StudentSettingsWorkspace` reads and synchronizes the optional `section` query, accepting only `account`, `security`, `jobs`, or `privacy` and falling back to `account`. This keeps account-menu deep links on the requested functional settings panel without introducing duplicate pages.
- CV uploads persist the normalized original filename beside the Cloudinary storage URL. Profile document cards prefer that filename after reload, fall back to the URL basename for legacy rows, and clear both values when the student removes a CV.
- `HomeHeader`, student layout and enterprise layout resolve avatar/logo URLs from the auth user and nested role profile. Real images use `object-cover`; the previous user icon or company initials remain as fallback. Login persists profile `name`/`avatar`, and profile-save flows refresh the same auth-store data so header identity updates immediately.
- The `HomeHeader` recent-conversation area is capped to a compact internal height and uses its own thin rounded scrollbar track/thumb, with native WebKit arrow buttons hidden, so the dropdown keeps its rounded outer shape when more conversations are available.
- `/student/messages` uses `ConversationService` to load persisted conversations/messages and keeps empty states when the API returns no conversation data; it does not render mock conversations. Students can open the single lazy conversation for any owned application from the existing message screen. Conversation avatars show a green bottom-left status dot only while `unread_count > 0`, alongside the existing unread-number badge.

Enterprise jobs UI:

- `/enterprise` is the allowed dashboard for all active enterprise accounts. It loads `/enterprise/profile` first; `PENDING` accounts see a waiting notice, `REJECTED` accounts see `kyb_reject_reason` plus a resubmit CTA, and only `APPROVED` accounts load enterprise jobs.
- `/enterprise/jobs` renders enterprise job posts in a paginated table with `10 / trang`, `20 / trang`, and `50 / trang` page-size options. Pagination is client-side over the API result returned by the current status filter, matching the enterprise applicant table behavior.
- `/enterprise/jobs/create` keeps submitting the legacy `location` string to `JobService.createEnterpriseJob()`, but the UI now builds that string through a progressive dropdown flow: city -> ward/commune -> detailed address.
- The static location dropdown is a reduced, verified administrative list based on 2025 commune-level reorganization data. Non-address values such as `Remote` are not used as location options; remote/hybrid work should be represented by job type or description instead of the `location` string.
- `/enterprise/jobs/create` loads the skill catalog from `JobService.getEnterpriseSkills()`, lets the recruiter add a missing skill through `JobService.createEnterpriseSkill()`, submits selected skills as `skill_ids`, and still sends a composed `requirements` string so existing job detail surfaces keep working.
- `/enterprise/jobs/create` keeps the summary sidebar sticky below the enterprise header, shows the entered title, salary, slots, location, publish status, selected skills, experience, work time, requirement note, and job description, and exposes the publish-status note through a compact info tooltip inside the summary card.

Enterprise applications UI:

- `/enterprise/applications` is the primary applicant list for enterprise accounts.
- Saved and rejected applicant views are rendered inside `/enterprise/applications` via the `view=saved` and `view=rejected` query states so the sidebar dropdown changes the central dashboard content instead of opening visually separate pages.
- `/enterprise/applications/saved` and `/enterprise/applications/rejected` are compatibility redirects back to `/enterprise/applications?view=saved` and `/enterprise/applications?view=rejected`.
- `CandidateCollectionView` renders mode-specific metric cards, filters, source/reason distributions, and table columns while still reading only from `JobService.getEnterpriseApplications()`.
- Empty saved/rejected datasets keep the same dashboard table shell and show the empty state inside the table body.
- Saved candidates are displayed when `JobService.getEnterpriseApplications()` returns persisted saved/bookmarked flags, and also include applications whose interview result is `HIRED` so accepted hires remain easy to review. The frontend does not create placeholder candidates.
- `/enterprise/interviews` is an enterprise sidebar page prepared for real scheduling data.
- `/enterprise/notifications` is API-backed through `NotificationService` and shows summary cards, KYB remediation alerts, read/unread filters, and action links such as `/enterprise/settings` or `/enterprise/messages/:id`.
- Sidebar `Hoi thoai` opens `EnterpriseMessageCenter` inside `/enterprise?view=messages`, so the enterprise layout stays in place and only the central dashboard content changes. `/enterprise/messages` and `/enterprise/messages/:id` remain compatibility routes that render the same component directly. On desktop the workspace uses the available viewport height and a responsive 30/45/25 grid; conversation, message, and candidate-information regions own their scrolling while the search/header and composer stay fixed. Its 68px conversation-list avatars use a conditional green bottom-left unread dot plus a blue top-right badge containing the unread count.
- The enterprise application table opens or reuses the application conversation through `POST /job-applications/:id/conversation` before navigating into `EnterpriseMessageCenter`.

Enterprise settings UI:

- The company profile hero keeps the cover in its own rounded overflow boundary and layers the logo above the white identity panel without clipping the image. The media-library and legal-information cards are omitted. Industry, company size, work model, and recruitment level render as persisted fact fields above the full-width business-location section.

- `EnterpriseFileUploadField` provides the shared picker/drag-drop UI for logo and cover. `AuthService.uploadGPKD()` keeps sending a backward-compatible upload `kind`; returned URLs stay in the profile form until save. Company facts and structured location fields are editable and each section owns its cancel/save actions.
- `EnterpriseLocationMap` uses Leaflet with Esri World Imagery and reference labels as the default satellite map. The parent Company Profile component continues to use `runtimeConfig.public.geocodingBaseUrl` (Nominatim by default) for debounced administrative search, forward geocoding, and reverse geocoding. Administrative normalization combines structured address components, provider type/rank evidence, and verified parent relationships instead of trusting raw labels or a single strict allowlist. The hierarchy is country-aware: Vietnam uses country -> province/city -> ward/commune/special zone, while countries with a supported intermediate level keep district/county between city and ward. Per-level AbortControllers plus request tokens prevent stale search responses from replacing newer results. Dropdown selection updates coordinates and map zoom; map click, marker drag, or map drag emits coordinates back to structured address components. No map API key is stored in source.

- `/enterprise/settings` is reachable from the enterprise sidebar. It renders the recruiter settings shell with two compact sections: account information and company profile. The previous standalone security tab is no longer shown.
- The account-information section loads and saves the enterprise `company_name`, contact `phone`, and optional `gpkd_url` through `CompanyService.getProfile()` / `CompanyService.updateProfile()` and the protected `/enterprise/profile` routes. It still uses `authStore.user` for session email and to keep the displayed company name, KYB state, and GPKD URL fresh after saving, then shows an inline success status plus the global toast after a successful save.
- The company-profile tab renders a compact company hero, basic information, company facts, interactive location, real-field completion status, optimization guidance, and account state. Persisted extended profile fields use the existing enterprise profile service and save flow.
- Enterprise navigation UI state is client-restored from one `quickwork:enterprise-ui` localStorage record through `useEnterpriseUiState`. It persists the sidebar collapsed state and applicant accordion state without changing routes or SSR auth/KYB behavior. The duplicate inactive `Hồ sơ công ty` sidebar item is removed; the profile remains available from the settings tab.
- The account tab includes a password-change screen that calls `AuthService.changePassword()` against the protected `POST /auth/change-password` route. It validates password strength on the client, and the backend verifies the current password before hashing and storing the new password.
- The settings tab control uses the simple underline tab style, not a segmented-control card, so it stays visually aligned with the original enterprise settings direction.
- The account tab uses a two-column settings layout: the account form and advanced settings are on the main column, while account summary, recent activity, and support are stacked in the right sidebar.
- Display preferences now live inside the advanced settings accordion and keep accessible checkbox-backed toggle switches.
- Advanced recruiter settings are grouped as large accordion sections in the account tab: display preferences, recruitment defaults, and interview scheduling. The standalone notification-settings group and the unsupported pre-application CV-download display option are omitted. The remaining section headers expand/collapse locally; every currently inactive child item calls the shared developing-feature toast instead of touching an API.
- The enterprise layout loads the current company profile once and resolves relative logo paths against the backend origin. Both the header account control and sidebar account card prefer the persisted company logo, while missing or failed images fall back to company initials.
- The timezone and language fields use custom rounded dropdown lists with scrollable option panels when the option set is long.
- Recent activity on the settings page reads current enterprise jobs and applications through existing `JobService.getEnterpriseJobs()` and `JobService.getEnterpriseApplications()` calls, then merges the newest created jobs and applicant submissions into one sidebar feed.

Admin UI:

- `/admin/dashboard` loads admin notifications through `NotificationService`, merges them into the activity feed with recent pending jobs and recent users, and only surfaces items created in the last 24 hours.
- `frontend/app/components/ui/NotificationDropdown.vue` is the shared header notification menu for public/student, admin, and enterprise headers. It shows notifications from the last 24 hours by default, keeps older notifications collapsed behind a repeated `Hien thi them` action while hidden items remain, stores the expanded older-notification count per dropdown in the current browser session, and uses an internal scroll area when the menu grows too tall. Message notifications from the same sender within the latest 24 hours are condensed into one card. Student surfaces additionally condense `JOB` notifications into one recent card and one older card, exposing their total/unread counts and linking the group back to `/student`; admin and enterprise surfaces keep individual job notifications. Opening a condensed card marks every represented unread notification before navigating to the grouped target.
- `frontend/app/layouts/admin.vue` loads admin notifications through `NotificationService` for the header dropdown; the shared dropdown separates recent and older items so older notification history no longer crowds the current admin home.
- `frontend/app/layouts/enterprise.vue` loads recruiter notifications through `NotificationService` for the header dropdown; the shared dropdown separates recent and older items, while `/enterprise/notifications` remains the full notification history page.
- `/admin/students` renders profile-completion status above the student table, then shows a paginated one-line table for student rows. The student column keeps name and email as two lines, while other columns are constrained to a single row. The skills column shows only `Da cap nhat` or `Chua cap nhat`; hover/focus exposes the full skill list or the missing-skill note.
- `/admin/users` and `/admin/students` use the shared compact action variant of `ScrollSelect` for per-row account activation/status changes. Its trigger, menu, and individual options have matching compact rounded corners.
- `/admin/enterprises` replaces the browser prompt used by the table KYB rejection action with a styled modal. The modal identifies the enterprise, requires a rejection reason, shows a 500-character counter and blocks duplicate submission while the existing KYB update request is running.

Shared table dropdown behavior:

- `frontend/app/components/ui/ScrollSelect.vue` is used by admin filters, admin pagination controls, per-row admin status actions, and enterprise tables. It measures viewport space when opening and flips the option list above the trigger near the bottom of the screen so page-size/filter menus are not clipped.

## Runtime Route Groups

Registered in `backend/cmd/api/main.go`:

- public auth group under `/api/v1/auth`,
- public approved job routes under `/api/v1/jobs`,
- protected common group under `/api/v1`,
- protected notification routes under `/api/v1/notifications`,
- protected conversation/message routes under `/api/v1/conversations` and `/api/v1/job-applications/:id/messages`,
- student group under `/api/v1/student` with auth and role `STUDENT`,
- enterprise group under `/api/v1/enterprise` with auth, role `ENTERPRISE`, and approved enterprise middleware; profile read/update is explicitly allowed before approval so enterprises can submit GPKD, while jobs, skills, and applications endpoints still require approved KYB plus a non-empty GPKD URL,
- admin group under `/api/v1/admin` with auth and role `ADMIN`.

Notification and conversation dependency flow:

```text
protected route
  -> AuthMiddleware
  -> NotificationHandler
  -> NotificationService
  -> NotificationRepository
  -> notifications

business transaction (when MQ_ENABLED=true)
  -> NotificationService
  -> outbox_events in the same MySQL transaction
  -> RabbitMQ durable exchange/queue with publisher confirm
  -> idempotent notification consumer
  -> notifications

protected route
  -> AuthMiddleware
  -> ConversationHandler
  -> ConversationService
  -> ConversationRepository + MessageRepository
  -> NotificationService for message notifications
  -> conversations + messages + notifications
```

Frontend service mapping:

- `frontend/app/services/notification.service.ts` wraps protected notification APIs.
- `frontend/app/services/conversation.service.ts` wraps protected conversation/message APIs.
- `frontend/app/services/conversation.service.ts` also owns the shared TypeScript API contracts. `frontend/app/composables/useConversationChat.ts` centralizes conversation loading, cursor message pagination, de-duplication, sending, mark-read, unread updates, and visibility-aware polling for both role-specific UIs. `frontend/app/utils/conversation.ts` owns shared mapping, ownership, error, sorting, and time-format helpers.
- `frontend/app/layouts/admin.vue` and `frontend/app/layouts/enterprise.vue` read notification counts/lists for header dropdowns; the enterprise layout also reads unread conversation count for the message icon.
- `frontend/app/layouts/student.vue` reads notification counts/lists for the student activity header and reads conversation unread count for the message icon; `/student/messages` reads conversation lists/messages through `ConversationService`.
- The `Xem trang công ty` action on `/student/messages` uses the selected conversation's backend-owned enterprise participant ID and opens `/companies/:id`, carrying the conversation ID so every back-to-message action restores the same chat. That page calls `CompanyService.getStudentCompanyProfile`, while `StudentJobHandler.GetCompanyProfile` verifies an existing application relationship and returns one safe profile payload plus approved open jobs; no extra public-job list request or per-job request is needed.
- Chat currently uses five-second HTTP polling because no WebSocket, Socket.IO, or SSE runtime exists. Polling runs only while the chat component is mounted and skips requests while the browser tab is hidden.
- `/companies/:id` uses a compact navy company hero with real open-job/open-position statistics, followed by a two-column profile layout. Anchor navigation connects the introduction, company facts, and jobs; an IntersectionObserver tracks the current section and disconnects on unmount. Job cards preview four results with a local expand/collapse control over the same fetched payload. The sidebar keeps persisted company facts, skills derived from open jobs, an optional real cover image, and student guidance. Missing verification/recruitment information is explicit; no ratings, response rates, benefits, founding year, or follow actions are fabricated. Styles are page-scoped, and the layout collapses for tablet/mobile without changing the shared header, access rules, API mapping, or return-conversation link.

Legacy/alternate route caveat:

- `backend/routes/job_routes.go` exists but current `main.go` does not call `RegisterJobRoutes`.
- `backend/routes/routes.go` exists but current `main.go` does not call `SetupRoutes`.

## Source Reading Bundles

Auth:

- `backend/cmd/api/main.go`
- `backend/routes/auth.go`
- `backend/internal/dto/request/change_password_request.go`
- `backend/internal/handlers/auth_handler.go`
- `backend/internal/services/auth_service.go`
- `backend/internal/repositories/user_repository.go`
- `backend/internal/repositories/student_repository.go`
- `backend/internal/repositories/enterprise_repository.go`
- `backend/internal/repositories/auth_redis_repository.go`
- `backend/pkg/jwt/jwt.go`
- `backend/pkg/password/password.go`
- `backend/pkg/redis/redis.go`
- `frontend/app/services/auth.service.ts`
- `frontend/app/stores/auth.ts`
- `frontend/app/middleware/auth.global.ts`
- `frontend/app/components/AuthShell.vue`
- `frontend/app/components/AuthField.vue`
- `frontend/app/components/AuthBrandMark.vue`
- `frontend/app/components/FooterBrandMark.vue`
- `frontend/app/components/AuthLoginExperience.vue`
- `frontend/app/components/AuthRegisterExperience.vue`
- `frontend/app/pages/login.vue`
- `frontend/app/pages/register.vue`
- `frontend/app/pages/auth/login.vue`
- `frontend/app/pages/auth/register.vue`

Enterprise access:

- `backend/internal/middlewares/auth_middleware.go`
- `backend/internal/middlewares/role_middleware.go`
- `backend/internal/middlewares/enterprise_kyb_middleware.go`
- `frontend/app/middleware/company.ts`
- `frontend/app/middleware/enterprise-approved.ts`
- `frontend/app/middleware/student.ts`
- `frontend/app/middleware/auth.global.ts`

Enterprise jobs:

- `backend/routes/enterprise_routes.go`
- `backend/internal/handlers/enterprise_job_handler.go`
- `backend/internal/repositories/job_repository.go`
- `backend/internal/models/job.go`
- `frontend/app/services/job.service.ts`
- `frontend/app/pages/enterprise/index.vue`
- `frontend/app/pages/enterprise/jobs/index.vue`
- `frontend/app/pages/enterprise/jobs/create.vue`

Student job actions:

- `backend/routes/student_routes.go`
- `backend/internal/handlers/student_job_handler.go`
- `backend/internal/models/job_application.go`
- `backend/internal/models/favorite_job.go`
- `frontend/app/services/student.service.ts`
- `frontend/app/services/company.service.ts`
- `frontend/app/composables/useHomeJobs.ts`
- `frontend/app/composables/useStudentLoginPrompt.ts`
- `frontend/app/pages/student/index.vue`
- `frontend/app/pages/student/messages.vue`
- `frontend/app/pages/companies/[id].vue`

Student hybrid job recommendations:

- `backend/internal/repositories/recommendation_repository.go`
- `backend/internal/services/job_match_scorer.go`
- `backend/internal/services/job_match_ai.go`
- `backend/internal/services/job_recommendation_service.go`
- `backend/internal/handlers/student_recommendation_handler.go`
- `backend/routes/student_routes.go`
- `frontend/app/services/student.service.ts`
- `frontend/app/composables/useHomeJobs.ts`
- `frontend/app/components/home/HomeFeaturedJobs.vue`
- `frontend/app/components/HomeJobCard.vue`
- `frontend/app/components/JobMatchScoreBadge.vue`

Enterprise applications:

- `backend/routes/enterprise_routes.go`
- `backend/internal/handlers/enterprise_job_handler.go`
- `backend/internal/models/job_application.go`
- `frontend/app/services/company.service.ts`
- `frontend/app/services/job.service.ts`
- `frontend/app/layouts/enterprise.vue`
- `frontend/app/components/enterprise/CandidateCollectionView.vue`
- `frontend/app/components/enterprise/EnterpriseMessageCenter.vue`
- `frontend/app/pages/enterprise/applications.vue`
- `frontend/app/pages/enterprise/applications/saved.vue`
- `frontend/app/pages/enterprise/applications/rejected.vue`
- `frontend/app/pages/enterprise/interviews.vue`
- `frontend/app/pages/enterprise/messages/index.vue`
- `frontend/app/pages/enterprise/messages/[id].vue`
- `frontend/app/pages/enterprise/notifications.vue`
- `frontend/app/pages/enterprise/settings.vue`
- `frontend/app/utils/searchText.ts`

Admin:

- `backend/routes/admin_routes.go`
- `backend/routes/admin_settings_routes.go`
- `backend/internal/handlers/admin_handler.go`
- `backend/internal/handlers/admin_settings_handler.go`
- `backend/internal/middlewares/admin_settings_middleware.go`
- `backend/internal/services/system_settings_service.go`
- `backend/internal/models/system_setting.go`
- `frontend/app/services/admin.service.ts`
- `frontend/app/layouts/admin.vue`
- `frontend/app/pages/admin/*.vue`
- `frontend/app/components/admin/AdminTablePagination.vue`
- `frontend/app/components/ui/ScrollSelect.vue`
- `frontend/app/utils/searchText.ts`

Public homepage:

- `frontend/app/pages/index.vue`
- `frontend/app/components/HomeLandingPage.vue`
- `frontend/app/components/HomeJobCard.vue`
- `frontend/app/components/HomeCategoryCard.vue`
- `frontend/app/components/home/HomeHeader.vue`
- `frontend/app/components/home/CareerToolsDropdown.vue`
- `frontend/app/components/home/HomeCareerAI.vue`
- `frontend/app/data/careerTools.ts`
- `frontend/app/pages/blog.vue`
- `frontend/app/data/blogArticles.ts`
- `frontend/app/components/home/HomeHero.vue`
- `frontend/app/components/home/HomeSearchBar.vue`
- `frontend/app/components/home/HomeQuickStats.vue`
- `frontend/app/components/home/HomeFeaturedJobs.vue`
- `frontend/app/components/home/HomeJobDetailPanel.vue`
- `frontend/app/components/home/HomeCategories.vue`
- `frontend/app/components/home/HomeEmployerCta.vue`
- `frontend/app/components/home/HomeCareerCta.vue`
- `frontend/app/components/home/HomeFooter.vue`
- `frontend/app/components/FooterBrandMark.vue`
- `frontend/app/composables/useHomeJobs.ts`
- `frontend/app/services/job.service.ts`
- `frontend/app/services/student.service.ts`
- `frontend/app/utils/searchText.ts`
- `frontend/app/utils/jobDisplay.ts`
- `frontend/app/utils/jobSignals.ts`

Public job board:

- `frontend/app/pages/student/index.vue`
- `frontend/app/layouts/student.vue`
- `frontend/app/components/home/HomeHeader.vue`
- `frontend/app/components/home/HomeFooter.vue`
- `frontend/app/pages/student/messages.vue`
- `frontend/app/services/job.service.ts`
- `frontend/app/services/student.service.ts`
- `frontend/app/utils/jobDisplay.ts`
- `frontend/app/utils/jobSignals.ts`
- `frontend/app/utils/studentProfileCompletion.ts`
- `frontend/app/utils/searchText.ts`
