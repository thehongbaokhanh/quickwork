# QuickWork - Project Changelog and Issue Log

Ngay tao: 2026-07-09

Tai lieu nay dung de ghi lai loi, thay doi, cach sua va ket qua kiem tra cua du an QuickWork. Theo yeu cau hien tai, file chi giu thong tin cap nhat cua ngay gan nhat.

## Quy uoc cap nhat

- Loi dang con ton tai de trong muc `Dang mo / Can theo doi`.
- Loi da sua chuyen vao muc `Da xu ly`.
- Moi ban ghi nen co:
  - Hien tuong.
  - Nguyen nhan.
  - Cach sua.
  - File lien quan.
  - Lenh kiem tra.
  - Trang thai.
- Neu mot loi cu da het, khong de no o muc dang mo nua; chuyen sang `Da xu ly` va ghi ngay sua.
- Khi thay doi kien truc/route/model/luong nghiep vu, dong thoi cap nhat tai lieu lien quan trong `docs/`.

## Dang mo / Can theo doi

- Chua co loi dang mo duoc ghi nhan sau thay doi ngay 2026-07-29.

## Da xu ly

### 2026-09-03 - Chuan hoa QuickWork cho Render Blueprint

- Them `render.yaml` production gom Nuxt web public, Go API private, MySQL co disk, managed Key Value, RabbitMQ co disk va ClamAV; secret duoc tao/nhap tren Render va truyen noi bo, khong hardcode.
- Them Nitro proxy same-origin cho `/api/*` va `/uploads/*`, giu cookie `HttpOnly`, `Secure`, `SameSite=Strict` hoat dong khi backend khong public.
- Backend ho tro `PORT` cua Render, `REDIS_URL` cua managed Key Value va bo bien RabbitMQ rieng le; van tuong thich cau hinh Docker Compose cu.
- Production validation kiem tra scheme/host Redis URL va mat khau RabbitMQ khi message queue bat.
- Cap nhat tai lieu API, kien truc va quy trinh deploy Render.

### 2026-09-03 - Khoi phuc Cloudflare Quick Tunnel cho demo

- Nguyen nhan loi tren URL cong khai: frontend container nhan `NUXT_PUBLIC_API_BASE=http://localhost/api/v1`, nen trinh duyet cua nguoi dung goi `localhost` tren chinh thiet bi cua ho thay vi QuickWork backend.
- Chuyen API browser sang same-origin `/api/v1`; them private `NUXT_API_BASE_INTERNAL=http://backend:8080/api/v1` cho Nuxt SSR va de `apiClient` chon base URL theo server/browser.
- Them `compose.tunnel.yaml` voi container `cloudflared` chi o network `edge`, cung script start/stop co build, health check local, URL discovery va DNS-safe public API verification.
- Dung tunnel host cu, tao URL Quick Tunnel moi va xac nhan public `/api/v1/jobs` tra HTTP 200. MySQL, Redis, RabbitMQ va backend khong bi publish truc tiep.
- Verification: PowerShell parser pass; tunnel Compose config pass; `npm run typecheck` pass; Docker images build, sau service local healthy; Cloudflare connectivity pre-check pass va public API HTTP 200.

### 2026-09-03 - Luu ten CV goc va bo sung Blog nghe nghiep sinh vien

- Them `student_profiles.cv_file_name`; upload CV tra ten goc da chuan hoa va frontend luu ten nay cung URL Cloudinary, nen tai lai trang van hien dung tieu de tep. Xoa CV se xoa ca URL va ten hien thi; CV cu van fallback sang basename cua URL.
- `HomeHeader` co mega menu `Cong cu nghe nghiep` tren desktop va danh sach mo rong tren mobile. Dich den da co se dieu huong that; phan tich ky nang va chuan bi phong van hien nhan `Sap co` cung thong bao dang phat trien.
- Them route public `/blog` vao global auth allowlist, voi hero dung tai san QuickWork, loc chu de/tu khoa, bai noi bat, goi y, danh sach doc chi tiet, luu bai trong trinh duyet, sidebar xu huong/lo trinh va trang thai rong.
- Bo khoi ban tin; them bo minh hoa nghe nghiep 6 chu de, icon theo danh muc, lo trinh nhanh co duong tien do va Blog Detail Modal hai cot.
- Sua sprite bai noi bat de moi the chi hien dung mot panel; thay icon `sparkles` khong ton tai bang icon robot duoc Nuxt Icon phuc vu that. Footer the giu phut doc va `Doc ngay` tren mot dong o moi kich thuoc.
- Mega menu `Cong cu nghe nghiep` tren desktop doi thanh danh sach doc dung chung tren moi trang co `HomeHeader`; tieu de, mo ta va badge trang thai khong bi tach dong.
- Bai da luu co nut/khung mau xanh de nhan biet ngay. Chon chu de khong con tu cuon viewport; catalog mac dinh mo rong tu 8 len 16 bai, phu cong nghe, ke toan, ban hang, thiet ke, marketing, dich vu, logistics, nhan su, du lich va noi dung da nganh.
- Tach du lieu/menu `Cong cu nghe nghiep` thanh `careerTools.ts` va `CareerToolsDropdown.vue`; dung cung dropdown tren `HomeHeader` va dashboard header cua Tin nhan, Ung tuyen, Ho so, Cai dat. Lien ket Blog trong dashboard header di den route that `/blog`.
- Them `HomeCareerAI` tren trang chu cho tai khoan `STUDENT`: goi lai endpoint career-guidance that, chi gui muc tieu do sinh vien nhap va ngu canh lap ke hoach cong khai co dinh; hien huong di, buoc hanh dong, ky nang, chu de va loi provider that, khong luu du lieu va khong tra noi dung gia.
- Them protected `POST /student/career-guidance`: chi `STUDENT` duoc gui muc tieu va ngu canh bai viet cong khai toi OpenAI Responses API voi `store=false` va strict JSON Schema. Khong gui ho so/CV/thong tin lien he, khong luu prompt/ket qua, va khong gia lap cau tra loi khi provider chua san sang.
- Kiem tra bo sung cho dropdown dashboard va AI trang chu: frontend `npm run typecheck`, `npm run build`, live `GET /`, live `GET /blog`, tat ca Nuxt Icon moi va unauthenticated `POST /student/career-guidance` tra `401` dung nhu mong doi deu pass.
- Verification: `go test ./...`, `go vet ./...`, frontend `npm run typecheck`, frontend `npm run build`, live `GET /blog`, asset PNG va kiem tra khong con khoi newsletter deu pass. Browser screenshot khong chay duoc do Codex Windows sandbox khong khoi tao duoc.

### 2026-09-03 - Lam noi bat muc dang hoat dong tren headbar sinh vien

- Them trang thai active cho dieu huong chinh cua `HomeHeader` tren desktop va mobile: chu dam mau xanh, desktop co gach chi bao, mobile co nen nhan.
- `Viec lam` nhan dien trang danh sach/chi tiet viec, `Cong ty` nhan dien trang chi tiet doanh nghiep; cac lien ket section tren trang chu dong bo theo hash va vi tri cuon bang `IntersectionObserver`.
- Them `aria-current="page"` cho lien ket dang hoat dong; cac muc chua co dich den nhu `Blog` van hien thong bao dang phat trien va khong bi danh dau active.
- Verification: `npm run typecheck` va `npm run build` pass.

### 2026-08-31 - Thiet ke lai trang thong tin cong ty cho sinh vien

- Thu gon `/companies/:id` theo anh tham chieu: hero xanh dam, logo/ten/trang thai xac minh, thong ke viec va vi tri thuc te, thanh dieu huong noi dung va bo cuc hai cot.
- Giu gioi thieu, thong tin doanh nghiep, ky nang thuong tuyen, luong/dia diem/so vi tri cua tung viec va link quay lai dung hoi thoai. Them card anh cong ty chi khi co anh bia that.
- Danh sach viec hien truoc bon card, co nut xem tat ca/thu gon tren du lieu da tai; khong them API, polling, so lieu danh gia/phuc loi hay nut theo doi gia.
- CSS chi ap dung trong trang cong ty, co breakpoint cho tablet/mobile va trang thai hover/focus ro rang. Du lieu thieu, chua xac minh, loi truy cap va danh sach rong van hien thi ro rang.
- Verification: `npm run typecheck`, `npm run build` pass; chin smoke case render SFC voi API gia lap trong bo nho pass (preview/full/empty/missing media/missing skills/access error/invalid ID/loading/unverified + escaped text). Browser visual QA chua chay duoc do cong cu trinh duyet loi khoi tao sandbox.

### 2026-08-29 - Mo ho so cong ty tu hoi thoai sinh vien

- Nut `Xem trang cong ty` tren `/student/messages` lay enterprise user ID tu conversation response va mo trang `/companies/:id` thay cho thong bao tinh nang dang phat trien; link quay lai giu conversation ID de mo dung hoi thoai cu.
- Them `GET /api/v1/student/companies/:id`; API chi cho sinh vien da ung tuyen vao viec cua doanh nghiep dang hoat dong, tra mot payload ho so an toan va cac tin `APPROVED` con vi tri.
- Khong tra email, so dien thoai, ma so thue, GPKD, toa do, trang thai/ly do KYB hay tin noi bo; badge xac minh chi dung boolean da rut gon.
- Trang cong ty hien anh bia/logo, thong tin tong quan, quy mo/mo hinh/vi tri, ky nang thuong tuyen va danh sach viec lam tu du lieu persisted; khong tao gia danh gia, phuc loi hay hinh anh van hoa khi database chua co.
- Verification: `go test ./...`, `go vet ./...`, `npm run typecheck` va `npm run build` pass.

### 2026-08-28 - Dong bo hieu ung viec lam dac biet va them nhan MOI

- Them `frontend/app/utils/jobSignals.ts` lam nguon dung chung cho tin moi, HOT, ung tuyen nhieu va co hoi it canh tranh.
- Tin co `created_at` trong ba ngay gan nhat hien nhan `MOI`, accent xanh va nen nhan nhe; dung du lieu ngay san co, khong goi them API/AI.
- Trang `/student` va luoi viec lam noi bat tren trang chu dung cung nguong pho bien, badge va card treatment; so luot van chi dung noi bo.
- Verification: `npm run typecheck` va `npm run build` pass.

### 2026-08-28 - Gop toast thao tac va rut gon nhan viec lam dac biet

- Toast ho tro `groupKey`: cac thao tac luu/bo luu, ung tuyen va loi cung loai tren `/student` cap nhat cung mot card va reset thoi gian an thay vi xep chong nhieu card.
- Chuyen hang doi sang mot Nuxt `useState` dung chung, chi hien card moi nhat va tu an sau 2,4 giay; timeout cu duoc huy khi card thay doi.
- Thu gon toast con rong toi da 360px, icon/nut dong nho hon va noi dung phu chi mot dong de khong che danh sach viec lam.
- Chuyen `useToast.js` thanh compatibility shim re-export `useToast.ts`, tranh hai state/logic toast khac nhau khi Nuxt resolve import khong co phan mo rong.
- Rut gon nhan viec lam dac biet thanh `HOT`, `Ung tuyen nhieu` va `Co hoi it canh tranh`; application/favorite count van duoc dung noi bo de phan loai nhung khong hien tren card/tooltip.
- Verification: `npm run typecheck` va `npm run build` pass.

### 2026-08-28 - Ho so day du, avatar dong bo va tin viec lam theo tuong tac that

- Bo Portfolio khoi chin tieu chi bat buoc cua do manh ho so; `/profile` va `/student` dung chung mot ham tinh, nen ho so du chin muc se dat 100% va an card `Tao ho so noi bat`.
- Sau khi luu/tai lai ho so, dong bo ten, avatar va student profile vao auth store/cookie/localStorage de header va menu tai khoan cap nhat ngay.
- API job cong khai, chi tiet va recommendation tra them `application_count`/`favorite_count` bang aggregate subquery trong cung truy van; day la field doc, khong tao cot database moi.
- Thay nhan `Noi bat` gan cung cho card dau tien bang ba tin hieu theo du lieu: `Ung tuyen nhieu`, `HOT` theo luot luu va `Co hoi it canh tranh` cho diem phu hop tu 75 voi toi da mot luot ung tuyen/mot luot luu.
- Cache recommendation doi sang v2 va lam moi rieng engagement count khi cache hit, khong goi lai AI nen khong tang quota.
- Verification: `go test ./...`, `npm run typecheck` va `npm run build` pass.

### 2026-08-28 - Thu gon bo loc, thong bao va preview viec da luu

- Bo nhom `Ky nang` khoi accordion bo loc `/student`; ky nang van duoc tim qua o tu khoa va van hien thi tren tung card viec lam.
- Them che do gop thong bao `JOB` chi tren cac be mat sinh vien: moi nhom gan day/cu chi hien mot card, co tong so va so chua doc; mo nhom danh dau toan bo notification dai dien va quay ve `/student`.
- Thiet ke lai header card `Viec da luu` bang grid co nhan khong xuong dong, giam co tieu de va rut gon hanh dong khi dang o saved view de khong bi dun thanh hai dong trong sidebar 300px.
- Verification: `npm run typecheck` va `npm run build` pass.

### 2026-08-28 - Hoan thien bo loc va trang thai trang viec lam sinh vien

- Chuan hoa dropdown dia diem `/student` ve ten thanh pho/tinh tu du lieu tin tuyen dung, bo cac gia tri `Remote`/chua cap nhat khoi danh sach dia diem va dung cung gia tri chuan hoa khi loc.
- Cac nhom loai viec, kinh nghiem, nganh nghe, ky nang va muc luong cung nhu quick filter nay deu duoc sinh tu danh sach viec lam thuc te; bo gioi han sau dia diem o sidebar va them vung cuon cho nhom dai.
- Sua lop hero de dropdown dia diem/loai hinh co the hien thi day du qua ranh gioi section; artwork van duoc cat trong lop trang tri rieng.
- Khi xem `/student?view=saved`, them nut quay lai `Tat ca viec lam` o hero, header ket qua va preview da luu.
- Tai ho so sinh vien mot lan cung du lieu trang, tinh cung muoi tieu chi voi workspace ho so va an card `Tao ho so noi bat` khi dat 100%.
- Verification: `npm run typecheck` va `npm run build` pass.

### 2026-08-27 - Cloudinary va production security hardening

- Tao `.env.production` bi Git bo qua, chuyen Cloudinary credential hien co ma khong log gia tri, sinh secret production moi va bat startup validation fail-closed cho secret/CORS/cookie/admin IP/Cloudinary/ClamAV/seed.
- Compose production chi publish Nginx 80/443, them ClamAV private, read-only/cap-drop cho app containers va encrypted off-site restic backup cho MySQL + uploads bang Docker secret files.
- Upload enterprise/student kiem tra size, extension va binary signature, scan ClamAV truoc Cloudinary; bo tra raw provider error.
- JWT chi chap nhan HS256 va access token type; browser auth chuyen sang HttpOnly/Secure/SameSite cookies, bo token khoi localStorage/cookie JavaScript; them auth rate limits va bootstrap admin IP allowlist.
- Verification: `go test ./...`, upload security tests, `npm run typecheck`, `npm run build`, production Compose config va topology assertions deu pass.

### 2026-08-27 - Kiem thu local Docker Compose giai doan 2

- Them `.env.local.example`, local `compose.override.yaml` va Nginx HTTP config de cac lenh `docker compose build/up/ps/logs` chay truc tiep tren Windows ma khong can TLS production.
- Chi publish loopback `127.0.0.1:80` va `127.0.0.1:15672`; sua RabbitMQ tham gia `edge` trong local override de Docker thuc su publish Management UI, trong khi production van giu broker o private network.
- Xac nhan ca sau service healthy; `/`, `/api/v1/jobs` va RabbitMQ Management deu tra HTTP 200; API tra sau tin APPROVED da seed; queue `quickwork.notifications` co mot consumer va dead-letter queue san sang.
- Cac dong `record not found` trong lan seed dau la lookup truoc create, khong phai startup failure. `CLOUDINARY_URL` con la canh bao tinh nang: upload can bien nay de kiem thu day du.
- Cap nhat `DEPLOYMENT.md`, `docs/architecture.md`, `docs/message-queue.md` va `docs/conventions.md` voi dieu kien tien quyet, lenh, URL, cach doc log va canh bao khong chay hai RabbitMQ Compose cung luc.
- Verification: `docker compose config --quiet`; `docker compose build`; `docker compose up -d`; `docker compose ps`; live backend logs; HTTP checks; RabbitMQ overview va queue/consumer check.

### 2026-08-26 - Dong goi production Docker Compose giai doan 1

- Them multi-stage Dockerfile cho Go backend va Nuxt frontend; runtime chay bang user khong dac quyen.
- Them Compose gom Nginx, frontend, backend, MySQL, Redis va RabbitMQ; chi Nginx publish 80/443, data services nam trong internal network.
- Them named volume cho MySQL, Redis, RabbitMQ va uploads; them healthcheck va thu tu khoi dong theo dependency.
- Them Nginx HTTPS reverse proxy cho `/`, `/api/`, `/uploads/`, file `.env.production.example` khong chua secret that va huong dan `DEPLOYMENT.md`.
- Them `DB_SEED_ENABLED`; mac dinh local van seed, Compose production tat seed de tranh tao du lieu demo.
- Verification: Compose config/topology assertions, `go test ./...`, `npm run typecheck`, build thanh cong ca hai Docker image va `nginx -t` voi chung chi tam.

### 2026-08-26 - On dinh Nuxt generated types tren Windows

- Hien tuong: `nuxt dev` bao `UNKNOWN: unknown error` khi ghi `.nuxt/tsconfig.app.json` trong `writeTypes()`.
- Nguyen nhan: Nuxt dev mac dinh chay forked mode; tren Windows cac worker khoi dong/restart co the tranh chap file generated trong `.nuxt`.
- Cach sua: doi script `dev` thanh `nuxt dev --no-fork`, dung session cu va chay `nuxt prepare` mot lan de tai tao generated types.
- Verification: `npm run postinstall`, `npm run typecheck`, dev server khoi dong thanh cong va `GET http://127.0.0.1:3000/` tra ve `200`.

### 2026-08-26 - Tich hop RabbitMQ notification queue voi transactional outbox

- Chon RabbitMQ thay vi Kafka vi luong hien tai la task queue notification can ack/retry/DLQ, khong phai event stream khoi luong lon can partition va replay dai han.
- Them `MQ_ENABLED` va cau hinh RabbitMQ; mac dinh tat de giu nguyen hanh vi dong bo va khong bat buoc broker trong local/test hien tai.
- Khi bat MQ, `NotificationService` ghi `notification.create` vao `outbox_events` trong cung transaction; dispatcher publish message persistent, doi publisher confirm va retry exponential khi broker loi.
- Consumer tao notification theo `event_id` unique de xu ly at-least-once khong trung row; payload loi duoc dua vao durable dead-letter queue.
- Them Docker Compose RabbitMQ Management, graceful shutdown, cleanup outbox da publish sau 7 ngay va test idempotency khong can broker that.
- Files chinh: `backend/internal/messaging/notification_queue.go`, `backend/internal/models/outbox_event.go`, `backend/internal/models/notification.go`, `backend/cmd/api/main.go`, `docker-compose.rabbitmq.yml`, `docs/message-queue.md`.
- Verification: `go test ./...`; `go vet ./...`; `docker compose -f docker-compose.rabbitmq.yml config --quiet`; `git diff --check`.

### 2026-08-25 - Hoan thien menu tai khoan va dropdown tin nhan sinh vien

- Hien tuong: dropdown tai khoan chua phan nhom dung nhu thiet ke, cac shortcut chua mo dung che do viec da luu/panel cai dat, va bam icon tin nhan chuyen trang ngay.
- Cach sua: nhom menu thanh `VIEC LAM & TRAO DOI`, `QUAN LY HO SO CA NHAN`, `CA NHAN & BAO MAT`; gan route that cho viec da luu, don ung tuyen, viec phu hop, ho so va bon panel cai dat.
- Them che do `/student?view=saved` loc theo favorite ID da persist; bo luu se loai tin khoi danh sach va empty state co lien ket quay lai viec phu hop.
- Icon tin nhan mo dropdown toi da 6 hoi thoai gan day, co tin cuoi, thoi gian va badge chua doc. Danh sach/count chi goi khi mo lan dau trong vong doi header, duoc cache tai component va khong polling de giam request.
- Them duong phan cach mong giua tung hoi thoai trong dropdown de cac dong de nhan biet hon.
- Ba nhom trong menu tai khoan mac dinh deu dong va duoc dua ve trang thai dong moi lan mo menu.
- Thiet ke lai `/student` theo anh tham chieu: hero xanh dam, form tim kiem, quick filter, badge so viec da luu va bo cuc noi dung ba cot.
- Thiet ke lai the viec lam voi logo lon, cong ty, tieu de, metadata, mo ta, skill, diem phu hop, nut luu va ung tuyen; van giu du lieu/API va phan trang hien co.
- Cot phai hien toi da ba viec da luu that, CTA hoan thien ho so va cap nhat tuy chon tim viec. Nut tim kiem chi cuon den ket qua da loc tai client, khong them API request.
- An shortcut va card `Viec da luu` khi favorite count bang 0; chi render lai khi co du lieu da luu that.
- Doi bo loc trai thanh bon accordion mac dinh thu gon; tieu de mo danh sach option co the tich va hien badge so lua chon.
- Gioi han chieu cao danh sach hoi thoai header, them scrollbar track/thumb bo tron va an native arrow button.
- `/settings?section=account|security|jobs|privacy` mo dung tab chuc nang va dong bo query khi doi tab.
- Khong thay doi route, request/response API, database model hay business rule backend.
- Files chinh: `frontend/app/components/home/HomeHeader.vue`, `frontend/app/pages/student/index.vue`, `frontend/app/components/StudentSettingsWorkspace.vue`, `docs/architecture.md`, `docs/user-flows.md`.
- Trang thai: da hoan thanh ma nguon; typecheck/build duoc ghi nhan trong ban giao.

### 2026-08-22 - Hoan thien Shared Admin Settings va runtime policies

- Hien tuong: trang `/admin/settings` chi luu mot object vao localStorage, nen admin khong chia se cau hinh va cac toggle auth, KYB, moderation, notification, security khong co hieu luc backend.
- Nguyen nhan: backend chua co model/service/route Settings; frontend con goi them danh sach admin va hien nhieu action/provider chua ton tai nhu the da san sang.
- Cach sua: them singleton `system_settings`, aggregate JSON camelCase, optimistic version, validation/normalization, field capabilities va cache runtime mot phut; them `GET/PUT /api/v1/admin/settings` voi conflict snapshot va diagnostics trong cung response.
- Noi runtime: registration switches, KYB gate, manual/automatic job moderation, transaction-safe draft limit, in-app/KYB notifications, strong passwords, access-token duration, bounded process-local login lock va admin IPv4/CIDR allowlist.
- Provider chua co flow (email verification/delivery, reported jobs, admin 2FA, daily backup) bi normalize tat va UI disable co giai thich; pending expiry chi `stored_only`, rejected public visibility co dinh an.
- Giam quota: frontend chi 1 GET khi mount va 1 PUT cho save/reset, khong autosave/polling/refetch/getUsers; backend Settings cache mot phut va bo truy van admin notification khi in-app notification tat.
- Frontend co typed snapshot, dirty/double-submit guards, validation IP, reset qua server, xu ly 409 khong them GET, metrics that trong snapshot va xoa legacy localStorage sau thanh cong.
- Files chinh: `backend/internal/models/system_setting.go`, `backend/internal/services/system_settings_service.go`, `backend/internal/handlers/admin_settings_handler.go`, `backend/internal/middlewares/admin_settings_middleware.go`, `frontend/app/services/admin.service.ts`, `frontend/app/pages/admin/settings.vue`.
- Verification: `cd backend && go test ./...`; `cd frontend && npm run typecheck`; `git diff --check`.

### 2026-08-21 - Can bang chieu cao card Nen tang va Bao mat

- Cho cap `Thong tin nen tang` / `Dang ky & xac minh` va cap `Bao mat & truy cap` / `Sao luu & nhat ky` tu gian bang chieu cao trong tab rieng.
- Can deu cac hang toggle; can giua nhom thong ke, toggle va nut sao luu trong phan than card de loai bo khoang trong lech.
- Dung grid stretch theo noi dung, khong hardcode chieu cao va khong lam thay doi footprint tu nhien cua cac card trong Tong quan.
- Giu responsive khi admin sidebar mo, thu gon hoac khi man hinh hep.
- Verification: frontend typecheck va production build.

### 2026-08-21 - Bo header thua va sua scroll Admin Settings

- Bo header `Van hanh` lap lai ben tren noi dung; dua Kiem duyet va Thong bao ve hai card bo goc doc lap nhu giao dien ban dau.
- Dua thanh hanh dong luu ve document flow, khong con sticky khi cuon.
- Khoa admin shell theo viewport va chi cho main content cuon de tranh hai thanh cuon doc long nhau.
- Thay icon `Luu tru` khong ton tai bang icon database co san de tat ca dong tai nguyen deu co icon.
- Verification: frontend typecheck va production build.

### 2026-08-21 - Gop Kiem duyet va Thong bao thanh tab Van hanh

- Thay hai tab rieng `Kiem duyet`/`Thong bao` bang mot tab `Van hanh`.
- Tab moi hien mot card chung, chia hai vung can doi cho toan bo control kiem duyet noi dung va thong bao he thong, dung lai state va luong luu cuc bo hien co.
- Tong quan van giu cac card compact rieng; Thong tin nen tang va Kiem duyet noi dung tu doi mot/hai cot theo chieu rong card khi sidebar mo hoac thu gon.
- Verification: frontend typecheck va production build.

### 2026-08-21 - On dinh form Admin Settings theo trang thai sidebar

- Ha breakpoint responsive theo chieu rong tung card de `Thong tin nen tang`, `Kiem duyet noi dung` va `Bao mat & truy cap` hien hai cot khi sidebar thu gon tao du khong gian, nhung van ve mot cot khi card hep.
- Giu cac field cung footprint, bo span toan hang cua ngon ngu mac dinh va cho tab Kiem duyet dung cung bo cuc compact hai cot voi Nen tang/Bao mat.
- Giu `Bao mat & truy cap` an khoi Tong quan va chi hien trong tab Bao mat.
- Verification: frontend typecheck va production build.

### 2026-08-21 - Compact Admin Settings va sidebar icon rail

- An card `Bao mat & truy cap` khoi tab Tong quan, giu day du editor trong tab Bao mat.
- Nen giao dien Settings theo visual tham chieu voi tab bar compact, card header co icon tile, ba cot can bang, control va spacing nho gon.
- Chuan hoa sidebar collapse thanh rail 72px voi navigation/logout icon vuong co dinh, trong khi sidebar mo giu nguyen menu va route hien tai.
- Verification: frontend typecheck va production build.

### 2026-08-21 - Can chinh Admin Settings va khoi phuc sidebar truoc lan sua gan nhat

- Hoan tac dung phan shell/footer/navigation sidebar duoc thay doi trong lan sua Admin Settings gan nhat, giu nguyen menu, route, notification va trang thai collapse da co truoc do.
- Chuyen form Settings sang grid phan hoi theo chieu rong cua tung card de label/input thang hang khi sidebar mo hoac thu gon.
- Thay cac native select bang `ScrollSelect`, bo goc option panel, bo sung local option filtering va them danh sach mui gio IANA quoc te co offset hien tai va tim kiem.
- Verification: frontend typecheck va production build.

### 2026-08-21 - Hoan thien Admin Settings va ghep logout vao day sidebar

- Chuyen admin sidebar thanh shell cao theo viewport voi brand/footer co dinh trong cot, navigation cuon doc lap va icon logout van hien khi collapse.
- Thay trang Settings placeholder bang 5 tab va cac card platform, moderation, notification, security, backup/status/resource theo visual Admin Center.
- Them validation, save/reset/check cho mot settings object duy nhat luu cuc bo trong browser; UI ghi ro cac tuy chon chua thay doi business rules backend.
- Tong tai khoan admin va trang thai API lay tu endpoint admin hien co; backup, log va resource metrics khong co provider nen hien `Khong kha dung` thay vi du lieu gia.
- Verification: frontend typecheck va production build.

### 2026-08-21 - Hoan thien Admin Reports va Categories

- Thay hai trang placeholder bang giao dien bao cao responsive va quan ly danh muc co loading, error, empty state.
- Bao cao tong hop du lieu database that cho KPI, tang truong theo ky, co cau tai khoan, trang thai tin, bang xep hang va do hoan thien ho so; ho tro in PDF va xuat CSV.
- Danh muc ho tro tim kiem, xem ky nang/muc su dung, tao, doi ten va xoa an toan; backend chan xoa danh muc dang chua ky nang.
- Bo muc `Ung tuyen` khoi sidebar admin, giu nguyen route va business logic ung tuyen ben ngoai menu.
- Verification: frontend typecheck; backend Go tests.

### 2026-08-20 - Fix enterprise location edit-mode runtime crash

- Fixed the location search placeholder lookup after `locationFields` became a computed hierarchy; script code now reads `locationFields.value` instead of calling `.find()` on the computed ref itself.
- The error previously occurred only when edit mode rendered the searchable location selectors, making the `Chỉnh sửa` action appear unresponsive even though static typecheck passed.
- Verification: frontend typecheck and Nuxt dev compilation.

### 2026-08-19 - Restore enterprise location editing

- Cleared legacy hidden district values for Vietnam before editing, hydrating, or restoring the location form so the save validation cannot block on a field the user cannot access.
- Persisted administrative values may remain as an unchanged backend baseline; only changed administrative values must be reselected and verified before save.
- Added an explicit location-edit entry function that resets stale validation state while preserving the existing map, search, retry, and save flow.
- Verification: frontend typecheck.

### 2026-08-19 - Make enterprise location hierarchy country-aware

- Vietnam now skips the district selector and loads ward/commune/special-zone results directly under the selected province or city.
- Other countries retain structured district/county/state-district/city-district/borough/subdivision support when the provider returns that intermediate level.
- Parent readiness, request scoping, reverse geocoding, hierarchy validation, and saved-address composition tolerate an intentionally empty district without extra separators.
- Verification: frontend typecheck.

### 2026-08-19 - Harden enterprise administrative dropdown search

- Added location-only loading, minimum-query, empty, API-error, and manual-retry states to the reusable `ScrollSelect` without changing existing callers.
- Added per-administrative-level abort controllers and request tokens so stale Nominatim responses cannot overwrite a newer query or changed parent hierarchy.
- Distinguished HTTP 429 from an empty result and stopped automatic retries; parent changes cancel child requests and clear child values/options/errors.
- Normalized administrative level from structured provider components plus type/rank evidence, and treats restored string-only database values as unverified until reselected or reverse-resolved.
- Verification: frontend typecheck.

### 2026-08-19 - Two-way enterprise location map

- Replaced the one-way Google Maps iframe with an interactive Leaflet map using Esri satellite imagery and the existing configurable Nominatim geocoder.
- Country, province/city, district, and ward searches now accept only the matching administrative types and parent components; POIs, streets, and buildings cannot populate these fields.
- Changing a parent resets every descendant, dropdown selection moves the marker, and map click/drag reverse-geocodes only structured address components back into the form.
- Added hierarchy validation before save and normalized the live saved-address preview to detail, ward, district, city, country.
- Verification: frontend typecheck.

### 2026-08-19 - Simplify enterprise Company Profile layout

- Removed the `Thong tin phap ly` UI card from Company Profile without leaving an empty grid row.
- Stacked the company-facts section above the location/map section; both edit modes retain their own cancel/save footer.
- Added matching icons to every company summary chip and made closing an editor restore persisted values.
- Verification: frontend typecheck.

### 2026-08-20 - Complete persisted student personal profile

- Fixed the active profile workspace to unwrap `GET /student/profile` correctly, so the hero, skills, history, education, CV, and contact details render existing database data.
- Persisted uploaded avatar/CV URLs after Cloudinary upload and added client-side file type/size validation plus a working CV drag-and-drop state.
- Added owned multi-record portfolio CRUD with HTTP(S) validation, preloading, migration registration, and refresh-safe frontend editing.
- Profile completion now deterministically includes name, phone, avatar, location, introduction, skills, experience, education, CV, and portfolio.
- Verification: frontend typecheck and backend Go tests.

### 2026-08-19 - Functional student personal profile

- Added persisted student summary/portfolio fields and owned work-experience/education records with authenticated CRUD routes.
- Replaced development-only profile actions with working profile, skills, experience, education, CV, and portfolio editors.
- Student job detail now renders the shared enterprise logo with initials fallback for absent or invalid images.
- Verification: frontend typecheck and backend Go tests.

### 2026-08-17 - Show enterprise logos on student job cards

- Mapped `enterprise_profile.logo_url` into the shared job display model.
- Student homepage/job-list cards now render the employer image and only use company initials when no logo exists.
- Verification: frontend typecheck.

### 2026-08-14 - Prevent Nuxt ESLint generated-config write races on Windows

- Disabled repeated `@nuxt/eslint` config generation inside the development server while retaining generation for prepare/build workflows.
- Prevents concurrent dev refreshes from racing on `.nuxt/eslint.config.mjs`.
- Verification: development-mode Nuxt prepare and frontend typecheck.

### 2026-08-14 - Add real Company Profile dropdowns and geocoded locations

- Replaced editable company enum text fields with `ScrollSelect` option controls.
- Added optional searchable remote options to `ScrollSelect` and Nominatim-backed global location lookup.
- Persisted country, administrative area, ward, latitude, longitude, and recruitment level for refresh-safe map previews.
- Verification: frontend typecheck and backend Go tests.

### 2026-08-14 - Match Enterprise facts/location edit footprint to reference

- Enlarged the paired cards and aligned edit/read-only controls to the same field frames.
- Added icon/value/chevron control presentation, stable summaries, a fixed map region, and a persistent saved-address card.
- Verification: frontend typecheck.

### 2026-08-14 - Stabilize Enterprise facts and location cards

- Reserved equal card body/footer space so view and edit modes keep the same desktop footprint.
- Kept the map in a fixed presentation area and added in-card summaries and save/cancel actions without shifting the surrounding layout.
- Verification: frontend typecheck.

### 2026-08-14 - Stabilize Enterprise logo and cover upload cards

- Fixed both media dropzones to the same height before and after upload.
- Moved each remove action inside its own dropzone and constrained previews and filenames to prevent layout shift.
- Verification: frontend typecheck.

### 2026-08-13 - Complete Enterprise company profile editing and preview

- Added persisted company introduction and structured location fields.
- Added editable company facts/location, synchronized logo and cover uploads/reset, live map embed, and a full-profile preview modal.
- Moved the verified badge beside the account-status heading and removed postal code from the location card.
- Verification: frontend typecheck and backend Go tests.

### 2026-08-13 - Compact Enterprise company profile overview cards

- Placed the company facts and business location cards in one responsive two-column grid.
- Reworked company facts into a compact 2x2 layout and reduced the location map/empty-state height.
- Kept missing profile fields as `Chưa cập nhật` without introducing placeholder business data.
- File: `frontend/app/components/enterprise/EnterpriseCompanyProfileSettings.vue`.
- Verification: `npm run typecheck` in `frontend`.

### 2026-08-13 - Refine Enterprise company profile presentation

- Removed the company image-library placeholder without leaving an empty grid slot.
- Corrected cover/logo layering and added a verified account chip.
- Replaced metadata and location placeholders with real-field fact cells and a responsive address/map preview empty state.
- Added a polished company-introduction editor with character count, cancel, and validation; persistence remains unavailable because the current profile API has no description field.

### 2026-08-13 - Enterprise uploads and Message Center filters

- Removed `Chờ phản hồi` from Enterprise Message Center and evenly redistributed the remaining tabs.
- Added reusable drag/drop upload UI for GPKD, company logo, and cover with preview and upload/error state.
- Persisted logo/cover plus industry, company size, and work model in `EnterpriseProfile`; the three metadata fields remain non-editable in the frontend.
- Preserved existing GPKD/KYB remediation and backward-compatible profile/upload APIs.

### 2026-08-13 - Chan thao tac ho so sinh vien chua ho tro

- Cac nut sua ky nang, them kinh nghiem va them hoc van tren `/profile` khong con dieu huong nham sang trang cai dat.
- Hien toast `Tinh nang dang phat trien` cho cac thao tac chua co API; giu nguyen chia se, chinh sua tai khoan va cap nhat CV dang hoat dong.


### 2026-08-12 - Gop muc bang dieu khien vao Trang chu sinh vien

- Bo muc `Bang dieu khien` rieng khoi sidebar sinh vien.
- Doi icon cua `Trang chu` sang icon outline dashboard, giu nguyen route `/`.


### 2026-08-12 - Redesign ho so ca nhan sinh vien theo FigJam

- Thay trang tam `/profile` bang profile cover co avatar chong mep, thong tin nghe nghiep, dia diem, tags va nut chia se/chinh sua.
- Them bento responsive cho do manh ho so, ky nang, kinh nghiem, hoc van va tai lieu/CV; chi dung du lieu profile hien co va empty state cho truong chua co API.
- Giu header, route va API hien tai; doi muc `Tat ca viec lam` thanh `Bang dieu khien` voi icon outline theo bo cuc sidebar tham chieu.


### 2026-08-12 - Rut gon sidebar sinh vien

- Bo ba muc khong can thiet khoi sidebar sinh vien: `Viec lam da luu`, `Viec lam phu hop` va `CV cua toi`.
- Giu lai cac loi tat dang hoat dong nhu tin nhan, ung tuyen, ho so va cai dat.


### 2026-08-12 - On dinh ghi file generated cua Nuxt tren Windows

- Sua loi Nuxt dev ngau nhien khong mo duoc `.nuxt/eslint.config.mjs` hoac `.nuxt/tsconfig.server.json` trong luc khoi dong.
- Tat type checker chay ben trong Nuxt dev de tranh tranh chap voi cac luong sinh file `.nuxt`; tiep tuc dung `npm run typecheck` rieng theo quy trinh du an.
- Lam sach va sinh lai `.nuxt` bang `npm run postinstall`.


### 2026-08-11 - Dong bo anh dai dien len header

- Phan hoi dang nhap bo sung ten va avatar ho so sinh vien; ten doanh nghiep lay tu ho so doanh nghiep.
- Header cong khai, header sinh vien va header/sidebar nha tuyen dung hien anh dai dien hoac logo khi co URL, neu khong thi giu icon/chu viet tat.
- Sau khi luu ho so, anh va profile duoc dong bo vao auth store de header cap nhat ngay.
- Kiem tra: `go test ./...`, `npm.cmd run typecheck`, `git diff --check`.

### 2026-08-11 - Hoan thien bao mat va tuy chon tim viec sinh vien

#### Da sua

- Chuyen yeu cau, loi mat khau va ket qua doi mat khau xuong duoi cac o nhap; loi sai mat khau hien tai duoc gan truc tiep vao truong tuong ung.
- Giu buoc gui mat khau hien tai den API de backend xac minh truoc khi cap nhat mat khau moi.
- Khoa hanh dong luu ho so trong luc avatar hoac CV dang tai len, sau do luu URL tep cung thong tin tai khoan qua API ho so.
- Thay dropdown hinh thuc lam viec bang menu bo goc va them bo chon dia diem mong muon theo thanh pho, phuong/xa.
- Sua ten prop `ariaLabel` cua `UiScrollSelect` va xu ly gia tri mang dia diem co the rong de `vue-tsc` kiem tra thanh cong.

#### File lien quan

- `frontend/app/components/StudentSettingsWorkspace.vue`
- `frontend/app/components/PasswordField.vue`
- `docs/architecture.md`
- `docs/user-flows.md`

#### Kiem tra

- `npm.cmd run typecheck`.
- `git diff --check`.

#### Trang thai

- Da hoan thanh.

### 2026-08-11 - Thiet ke lai thong tin tai khoan sinh vien

#### Van de

- Muc tai khoan trong trang cai dat chua duoc chia nhom ro rang theo giao dien tham chieu.
- Anh dai dien va CV chi hien duoi dang hai input URL lien tiep, kho nhan biet trang thai hien tai.

#### Da sua

- Chia giao dien thanh the tom tat tai khoan, thong tin ca nhan, anh dai dien va CV ung tuyen.
- Them xem truoc avatar, nut tai/xoa anh, ten va kich thuoc CV, nut xoa CV va vung chon hoac keo-tha tep giong giao dien tham chieu.
- Them route bao ve `POST /student/profile/upload` de tai avatar/CV len Cloudinary, kiem tra dinh dang va gioi han 5MB/10MB.
- URL tra ve duoc gan vao form va chi luu vao ho so sau khi nguoi dung bam `Luu thay doi`.
- Can chinh responsive de phu hop voi sidebar va khung cai dat hien tai.

#### File lien quan

- `frontend/app/components/StudentSettingsWorkspace.vue`
- `frontend/app/services/student.service.ts`
- `backend/internal/handlers/student_job_handler.go`
- `backend/routes/student_routes.go`
- `docs/api.md`
- `docs/architecture.md`
- `docs/user-flows.md`

#### Kiem tra

- `npm.cmd run typecheck`.
- Trinh duyet xac nhan `/settings` van duoc middleware bao ve va chuyen khach toi `/auth/login`; chua the kiem tra truc quan noi dung tai khoan khi khong co phien sinh vien.

#### Trang thai

- Da xu ly.

### 2026-08-11 - Chi hien canh bao dang nhap cho cac hanh dong sinh vien

#### Van de

- Cac hanh dong cong khai can thong tin sinh vien phai thong bao can dang nhap.
- Yeu cau moi la chi hien thong bao, khong tu dong chuyen nguoi dung sang trang dang nhap.

#### Da sua

- Cap nhat `useStudentLoginPrompt.ts` de chi hien canh bao can dang nhap va giu nguyen route hien tai.
- Thay ban JavaScript phat sinh `useHomeJobs.js` dang che khuat composable TypeScript bang shim tai xuat truc tiep nguon TypeScript, de runtime khong con giu hanh vi redirect cu.
- Import truc tiep `useToast` tu nguon TypeScript de canh bao dung chung cung trang thai voi `UiToast`, tranh nham ban JavaScript cu trong qua trinh auto-import.
- Ap dung cho luu/yeu thich, ung tuyen, mo tin nhan va muc `Viec da luu` o footer.
- Dong bo hanh vi tren trang chu, `/student` va trang chi tiet `/jobs/:id`.

#### File lien quan

- `frontend/app/composables/useStudentLoginPrompt.ts`
- `frontend/app/composables/useHomeJobs.ts`
- `frontend/app/composables/useHomeJobs.js`
- `frontend/app/components/home/HomeHeader.vue`
- `frontend/app/components/home/HomeFooter.vue`
- `frontend/app/pages/student/index.vue`
- `frontend/app/pages/jobs/[id].vue`
- `docs/architecture.md`
- `docs/user-flows.md`

#### Kiem tra

- `npm.cmd run typecheck`: dat.
- Trinh duyet: khi bam yeu thich luc chua dang nhap, toast hien tai `/` va route van giu nguyen sau khi doi.
- Trinh duyet: nut `Luu viec lam` tai `/jobs/24` hien dung tieu de/noi dung canh bao va route van giu nguyen.
- Trinh duyet: nut `Luu viec` tai `/student` va muc `Viec da luu` o footer deu hien canh bao, khong doi URL sau hon 1 giay.

#### Trang thai

- Da xu ly.

### 2026-08-07 - Gop thong bao tin nhan theo nguoi gui

#### Van de

- Moi tin nhan tao mot the rieng, lam dropdown thong bao nhanh bi day.
- The thong bao chua phan biet truc quan giua mot va nhieu tin nhan chua doc.

#### Da sua

- Gop cac thong bao `MESSAGE` theo ten nguoi gui trong dropdown dung chung cua sinh vien, doanh nghiep va cac header dang su dung thanh phan nay.
- Gioi han moi nhom trong 24 gio gan nhat; thong bao cu hon khong bi cong vao the moi va tiep tuc hien rieng trong muc lich su.
- Noi dung tom tat va huy hieu tren the chi dem cac tin nhan chua doc trong nhom 24 gio, khong dem tin da doc hoac tin cu.
- Mot tin chua doc hien cham xanh o goc tren phai; tu hai tin chua doc tro len hien huy hieu xanh kem so luong.
- Khi mo the da gop, frontend danh dau da doc tat ca ban ghi chua doc trong nhom va cap nhat dung tong so thong bao chua doc.

#### File lien quan

- `frontend/app/components/ui/NotificationDropdown.vue`
- `frontend/app/components/home/HomeHeader.vue`
- `frontend/app/layouts/student.vue`
- `frontend/app/layouts/enterprise.vue`
- `frontend/app/layouts/admin.vue`
- `docs/architecture.md`
- `docs/user-flows.md`

#### Kiem tra

- `npm.cmd run typecheck`: dat.
- `git diff --check`: dat.

#### Trang thai

- Da cap nhat. Kiem tra truc quan tren route doanh nghiep bi chuyen ve trang dang nhap do phien trinh duyet khong co xac thuc.

### 2026-08-07 - Them cham xanh cho hoi thoai chua doc

#### Van de

- Avatar trong danh sach chat sinh vien chua co dau hieu truc quan theo mau tham chieu.
- Danh sach chat doanh nghiep hien cham xanh duong ke ca khi hoi thoai khong co tin chua doc.

#### Da sua

- Them cham tron xanh la o mep duoi ben trai avatar khi `unread_count > 0` cho trang tin nhan sinh vien.
- Doi cham cua `EnterpriseMessageCenter` thanh xanh la, dat cung vi tri va chi hien khi hoi thoai co tin chua doc.
- Dua huy hieu so luong tin chua doc cua nha tuyen dung len goc tren ben phai avatar, gioi han hien thi toi da `99+`, va bo huy hieu trung lap o dong noi dung.
- Doi avatar chu cai du phong cua nha tuyen dung sang nen toi de bam sat anh tham chieu.
- Tang avatar danh sach chat nha tuyen dung len `68px`, cham xanh len `20px` va huy hieu so len `28px` de dung ty le anh tham chieu va khong de len chu cai.

#### File lien quan

- `frontend/app/pages/student/messages.vue`
- `frontend/app/components/enterprise/EnterpriseMessageCenter.vue`
- `docs/architecture.md`
- `docs/user-flows.md`
- `PROJECT_CHANGELOG.md`

#### Kiem tra

- `npm.cmd run typecheck`: dat.

### 2026-08-07 - Sua loi Nuxt trung lap `$api`

#### Van de

- Trang `/login` tra ve HTTP 500 voi loi `Cannot redefine property: $api` khi Nuxt khoi tao SSR.

#### Nguyen nhan

- `frontend/app/plugins/api.ts` va ban JavaScript phat sinh `frontend/app/plugins/api.js` cung duoc Nuxt tu dong nap.
- Ca hai plugin cung `provide` khoa `api`, nen Nuxt khong the dinh nghia lai `$api` tren cung mot ung dung.

#### Da sua

- Xoa ban JavaScript phat sinh `frontend/app/plugins/api.js`; giu `api.ts` lam plugin duy nhat cung cap `$api`.
- Ghi ro quy tac plugin duy nhat trong tai lieu kien truc de tranh tai tao file JavaScript canh file TypeScript.

#### Kiem tra

- `npm.cmd run typecheck`: dat va khong tai tao `app/plugins/api.js`.
- SSR `GET http://localhost:3000/login`: tra ve HTTP `200`, khong con loi `$api`.

#### File lien quan

- `frontend/app/plugins/api.ts`
- `docs/architecture.md`
- `PROJECT_CHANGELOG.md`

### 2026-08-06 - Hoan thien trang cai dat sinh vien

#### Van de

- Trang `/settings` con nhieu muc gia lap va cac nut chinh sua chi hien thong bao dang phat trien.
- Frontend da khai bao service ho so sinh vien nhung backend chua dang ky route `/student/profile`.

#### Da sua

- Chi giu bon muc `Tai khoan`, `Bao mat`, `Tuy chon tim viec`, `Quyen rieng tu` va thiet ke form responsive cho tung muc.
- Them `GET/PUT /student/profile`; cho phep luu ten, dien thoai, avatar, CV, nhu cau tim viec va quyen rieng tu vao `student_profiles`.
- Noi muc Bao mat vao `POST /auth/change-password`, kiem tra du ba truong, xac nhan trung khop va chinh sach mat khau manh truoc khi gui.
- Them trang thai dang tai/dang luu, thong bao loi API, nut hoan tac va dong bo ho so da luu vao auth store.

#### File lien quan

- `frontend/app/pages/settings.vue`
- `frontend/app/components/StudentSettingsWorkspace.vue`
- `frontend/app/components/SectionHeading.vue`
- `frontend/app/components/FormActions.vue`
- `frontend/app/components/PasswordField.vue`
- `frontend/app/components/ToggleSetting.vue`
- `frontend/app/services/student.service.ts`
- `backend/internal/handlers/student_job_handler.go`
- `backend/internal/models/student_profile.go`
- `backend/internal/services/auth_service.go`
- `backend/routes/student_routes.go`
- `docs/api.md`
- `docs/database.md`
- `docs/business-rules.md`
- `docs/architecture.md`
- `docs/user-flows.md`
- `PROJECT_CHANGELOG.md`

#### Kiem tra

- `npm.cmd run typecheck`: dat.
- `go test ./internal/handlers ./routes ./cmd/api` voi GOCACHE trong workspace: dat.

### 2026-08-06 - On dinh chuyen tab va nang bo cuc chi tiet viec lam

#### Van de

- Chuyen giua ba tab chi tiet goi cuon den phan tu va dung hieu ung dich xuong, lam khung nhin bi giat.
- Cum hanh dong con nam thap hon nut quay lai, con cot thong tin doanh nghiep bat dau sau toan bo hero.
- The thong tin cong viec con nam thap va dong dia diem dang gop thanh mot chuoi dai kho phan cap.
- Logo cong ty dang nam tach roi ben duoi anh, chua tao thanh company hero giong giao dien tham chieu.

#### Da sua

- Bo cuon den phan tu va hieu ung dich theo truc doc; giu lai chinh xac vi tri cuon sau khi DOM cap nhat de tranh browser scroll anchoring.
- Dua nut luu, ung tuyen va chia se len cung hang voi nut quay lai.
- Dua cot ho so doanh nghiep len bat dau ngang khu vuc hero, gan dung vi tri trong anh tham chieu.
- Nang the thong tin cong viec tren man hinh desktop va tach dia diem thanh dong tinh/thanh pho dam o tren, dia chi chi tiet mau nhat o duoi.
- Doi khoi dau the cong ty thanh company hero: logo noi chong mot nua tren mep duoi anh, co vien trang va khoang dem rieng de khong che ten cong ty.

#### File lien quan

- `frontend/app/pages/jobs/[id].vue`
- `docs/architecture.md`
- `docs/user-flows.md`
- `PROJECT_CHANGELOG.md`

#### Kiem tra

- `npm.cmd run typecheck`: dat.
- Trinh duyet localhost: dat; logo chong `32px` len anh hero va van cach ten cong ty `16px`, ngoai cac kiem tra bo cuc/tab/vi tri da dat.

### 2026-08-06 - Sap xep lai trang chi tiet viec lam sinh vien

#### Van de

- Ba hanh dong luu, ung tuyen va chia se chua dong deu tren mot hang; anh doanh nghiep co nguy co de len phan ho so.
- Thong tin viec lam va ky nang luon hien, trong khi yeu cau moi la chi mo hai khoi nay khi nguoi dung chu dong chon.
- Trang con khu vuc yeu cau ung vien rieng va dau xac thuc chua dong nhat voi giao dien tham chieu.

#### Da sua

- Thu gon ba hanh dong ve cung chieu cao `40px`, giu tren mot hang va can ve phia cot doanh nghiep.
- Doi thanh dieu huong thanh ba muc `Mo ta cong viec`, `Thong tin cong ty`, `Thong tin cong viec`; mac dinh an metadata/ky nang va chi hien dong thoi hai khoi khi chon thong tin cong viec.
- Bo khoi yeu cau ung vien, tach anh doanh nghiep khoi noi dung ho so de khong che chu, va dung badge xanh dac cho dau xac thuc.
- Giu toast `Tinh nang dang phat trien` cho cac lien ket ho tro chua co luong xu ly.

#### File lien quan

- `frontend/app/pages/jobs/[id].vue`
- `docs/architecture.md`
- `docs/user-flows.md`
- `PROJECT_CHANGELOG.md`

#### Kiem tra

- `npm.cmd run typecheck`: dat.
- Trinh duyet localhost: dat; ba nut cung hang va cung cao `40px`, anh khong che ten cong ty, metadata/ky nang an mac dinh va hien cung luc sau khi bam tab.

### 2026-08-05 - Can lai trang chi tiet viec lam theo giao dien tham chieu

#### Van de

- Trang `/jobs/:id` da co du lieu day du nhung hero dang nam trong mot the lon, noi dung chi chia hai cot va ty le/khoang cach chua giong anh tham chieu.

#### Da sua

- Chuyen header viec lam sang bo cuc phang voi logo, badge, tieu de, metadata va cac chip thong tin dung ty le nho gon.
- Can nhom nut luu, ung tuyen va chia se o phia tren cot cong ty.
- Chia noi dung desktop thanh ba vung: mo ta/yeu cau, thong tin/ky nang, va ho so cong ty/canh bao an toan.
- Dung he mau `sky` va cac kich thuoc Tailwind chuan cua du an de mau nut va kich thuoc logo hien thi on dinh.

#### File lien quan

- `frontend/app/pages/jobs/[id].vue`
- `docs/architecture.md`
- `PROJECT_CHANGELOG.md`

#### Kiem tra

- `npm run typecheck`: dat.
- `npm run build`: dat.
- Trinh duyet localhost: dat; trang khong tran ngang, logo dung kich thuoc `96x96`, nut ung tuyen co nen sky va cac khoi noi dung hien thi dung thu tu responsive.

### 2026-08-05 - Bo sung trang chi tiet viec lam cong khai

#### Van de

- Ten viec lam tren trang chu chi mo popup xem nhanh, con ten viec lam tren `/student` chua co duong dan den mot trang chi tiet day du.

#### Da sua

- Them route cong khai `/jobs/:id`, doc du lieu that bang `JobService.getJobDetail()` va hien thi mo ta, yeu cau, thong tin viec lam, ky nang, doanh nghiep cung cac hanh dong luu/ung tuyen.
- Gan lien ket vao ten viec lam tren ca the trang chu va danh sach `/student`; van giu popup xem nhanh khi hover ten tren trang chu.
- Mo chinh xac route `/jobs/<id-so>` trong allowlist cua middleware toan cuc de khach xem chi tiet ma khong mo nham cac route viec lam duoc bao ve.
- Tat legacy default layout tren trang chi tiet de khong long them sidebar/header khi dieu huong tu bang viec lam.
- Khach co the doc chi tiet; thao tac luu/ung tuyen van yeu cau tai khoan `STUDENT` va giu redirect dang nhap ve dung trang dang xem.

#### File lien quan

- `frontend/app/pages/jobs/[id].vue`
- `frontend/app/middleware/auth.global.ts`
- `frontend/app/components/HomeJobCard.vue`
- `frontend/app/pages/student/index.vue`
- `docs/architecture.md`
- `docs/user-flows.md`
- `PROJECT_CHANGELOG.md`

#### Kiem tra

- `npm run typecheck`: dat.
- `npm run build`: dat.
- Trinh duyet localhost: dat; bam ten viec lam tu `/` va `/student` deu mo dung `/jobs/:id`, trang chi tiet cong khai co mot header, khong bi long sidebar, va hien du cac khoi noi dung/API.

### 2026-08-05 - Dong bo role popup viec lam va an mui ten scrollbar sinh vien

#### Van de

- Badge loai hinh trong popup chi tiet viec lam van dung mau nen cu, khong trung voi vien popup/the.
- Thanh cuon sidebar cua khu vuc sinh vien con hien nut mui ten len/xuong mac dinh tren trinh duyet WebKit.

#### Da sua

- Cho badge loai hinh trong `HomeJobDetailPanel` dung `jobTypeMeta.border`, dong bo voi vien panel.
- An `::-webkit-scrollbar-button` cua `student-sidebar-scroll`, giu nguyen thumb, track va thao tac cuon.

#### Kiem tra

- `npm run typecheck`: dat.
- `npm run build`: dat.
- Trinh duyet localhost tai `/student/messages`: scrollbar sidebar van `overflow-y: auto`, thumb van hien thi; scrollbar button co `display: none`, rong/cao `0px`.

### 2026-08-05 - Dong bo mau role the viec lam va dropdown kich hoat admin

#### Van de

- Badge role/loai hinh tren the viec lam dung sac nen khac voi mau vien the.
- Dropdown kich hoat tai bang nguoi dung va hoc vien la native select, nen cac option khong co bo goc dong bo voi tieu de dropdown.

#### Da sua

- Cho nen badge loai hinh dung chinh mau vien tu `jobTypeMeta.border`.
- Bo sung bien the `action` cho `ScrollSelect` voi trigger cao `36px`, menu `rounded-lg` va option `rounded-md`.
- Thay native select trong bang `/admin/users` va `/admin/students` bang `ScrollSelect`, giu nguyen luong cap nhat trang thai hien co.

#### Kiem tra

- `npm run typecheck`: dat.
- `npm run build`: dat.
- Trinh duyet localhost: badge loai hinh va vien cua cac the viec lam cung ma mau; dropdown thao tac o ca `/admin/users` va `/admin/students` co trigger/option `6px`, menu `8px`.

### 2026-08-05 - Sua nut yeu thich bi lech tren the viec lam trang chu

#### Van de

- Chieu cao the khong du cho phan noi dung va footer, khien nut tim bi day xuong canh duoi va bi `overflow-hidden` cat mat mot phan.

#### Da sua

- Tang chieu cao co dinh cua `HomeJobCard` va danh rieng khong gian toi thieu cho footer.
- Can nut yeu thich ve goc phai trong footer, giu kich thuoc tron va khong de noi dung phia tren co ep nut.

#### Kiem tra

- `npm run typecheck`: dat.
- `npm run build`: dat.
- Trinh duyet localhost: 9 nut yeu thich dau tien deu co kich thuoc `36x36`, cach canh phai/day the `17px` va nam hoan toan trong the cao `212px`.

### 2026-08-05 - Can giua menu header trang chu sinh vien

#### Van de

- Cac muc `Viec lam`, `Cong ty`, `Muc luong`, `Cong cu nghe nghiep`, `Blog` bi don ve ben trai, sat logo va mat can doi voi cum tai khoan.

#### Da sua

- Chuyen header desktop sang bo cuc ba cot can bang: logo ben trai, menu o giua va cum tai khoan ben phai.
- Giu nguyen bo cuc responsive: menu desktop chi hien tu breakpoint `xl`, nut menu di dong khong thay doi.

#### Kiem tra

- `npm run typecheck`: dat.
- `npm run build`: dat.
- Trinh duyet localhost o viewport `1280px`: tam menu trung tam header (`0px` sai lech), khong chong len logo hoac cum tai khoan.

### 2026-08-05 - Dong bo header va dropdown trang viec lam sinh vien

#### Van de

- Option trong dropdown viec lam chua dong bo do bo goc voi khung dropdown.
- Nut tim tren the viec lam co the bi co keo thanh hinh oval.
- Header sinh vien sau dang nhap van hien loi moi nha tuyen dung va cum tai khoan chua giong mau giao dien.

#### Da sua

- Chuyen cac bo loc va sap xep cua `/student` sang `ScrollSelect`, bo goc menu va tung option cua bien the filter.
- Co dinh nut tim o kich thuoc `40x40`, khong cho co lai va can icon vao chinh giua.
- Dua thong bao, tin nhan va pill tai khoan sang sat phai; pill hien avatar, ten, vai tro va chevron; bo toan bo loi moi `Dang tuyen ngay` khoi header sinh vien da dang nhap.

#### Kiem tra

- `npm run typecheck`: dat.
- `npm run build`: dat.
- Trinh duyet localhost: dropdown co menu bo goc `12px`, option bo goc `8px`; nut tim `40x40`; pill tai khoan `230x56`; khong con `Dang tuyen ngay`.

### 2026-08-05 - Chuan hoa dia diem tren viec lam tot nhat

#### Van de

- Bo loc dia diem lay nguyen chuoi dia chi nen hien ca phuong/quan va tao chip qua dai.
- Dia diem dai xuong dong lam chieu cao va bo cuc cac the viec lam khong dong deu.

#### Da sua

- Bo sung helper dung chung de rut dia chi ve tinh/thanh pho, giu `Remote` va chuan hoa Ho Chi Minh.
- Bo loc va thong ke dia diem dung cung gia tri da chuan hoa; the viec lam co chieu cao co dinh, badge dia diem mot dong va tooltip dia chi day du.
- Dong bo ca source TypeScript va file JavaScript runtime dang duoc Nuxt uu tien trong worktree hien tai.

#### Kiem tra

- `npm run typecheck`: dat.
- Trinh duyet localhost: filter chi con `Remote`, `TP. Ho Chi Minh`, `Ha Noi`, `Da Nang`; 9 the dau deu cao `188px`.

### 2026-08-04 - Hoan thien chat sinh vien va doanh nghiep tren backend hien co

#### Van de

- Hai giao dien chat da goi API that nhung dung `any`, lap logic, va giao dien sinh vien gui sai tham so phan trang lich su.
- Chua co luong cursor khi cuon len, chua giu vi tri scroll, va polling chi co o giao dien doanh nghiep.
- Trang thai khoa do application/interview khong duoc phan anh day du trong conversation list; `has_more` co the sai khi tong tin vua bang gioi han trang.
- Chua co diem mo lazy conversation ro rang tu don ung tuyen.

#### Da sua

- Bo sung TypeScript contracts trong `conversation.service.ts`, helper dung chung trong `utils/conversation.ts`, va `useConversationChat.ts` cho list, cursor pagination, de-duplicate, send, read/unread, error mapping va polling.
- Ca hai giao dien giu nguyen bo cuc hien tai, tai 30 tin moi nhat, tai them khi cuon len, giu scroll khi prepend, cuon xuong sau khi gui, giu draft khi loi, chan gui trung va hien trang thai khoa/qua 2.000 ky tu.
- Polling HTTP moi 5 giay khi chat dang mount, bo qua khi tab bi an, va dung khi component unmount; du an chua co WebSocket/SSE.
- Sinh vien co the mo lazy conversation tu don da ung tuyen trong trang tin nhan; doanh nghiep co nut `Nhan tin` tren bang ung vien.
- Bo loi tat `Tin nhan` bi lap trong menu tai khoan sinh vien; chat van mo duoc tu nut header va sidebar.
- Backend conversation list tra them `interview_result`, `can_send_messages`, `locked_reason`; cursor doc them mot row de tinh `has_more` chinh xac.
- Bo sung unit test cho quy tac `REJECTED`, `NO_SHOW`, `HIRED`, explicit close va job `CLOSED`.
- Sua tai lieu cu: yeu cau GPKD chi tao notification, khong tao message.

#### Kiem tra

- `cd backend && go test ./...`: pass (dung Go cache trong workspace do Windows chan cache mac dinh).
- `cd frontend && npm run typecheck`: pass.
- `cd frontend && npm run build`: pass; con warning co san ve cac file `.js` sidecar trung auto-import va dependency deprecation/sourcemap.

### 2026-08-04 - Lam moi modal tu choi KYB tren trang admin

Hien tuong / Yeu cau:

- Khi admin chon `Tu choi KYB` trong bang doanh nghiep, trinh duyet hien `window.prompt` don gian de nhap ly do.
- Hop thoai cu khong dong bo giao dien admin, khong hien ro doanh nghiep bi tac dong va trang thai dang xu ly.

Nguyen nhan:

- `handleKYBValueChange` goi truc tiep `window.prompt` truoc khi gui request cap nhat KYB.

Cach sua:

- Thay `window.prompt` bang modal xac nhan dong bo voi admin UI.
- Modal hien ten/email doanh nghiep, textarea ly do bat buoc, dem toi da 500 ky tu, thong bao loi inline va ghi chu ve anh huong cua thao tac.
- Nut xac nhan co loading state, khoa thao tac trung lap va chi dong modal khi API cap nhat KYB thanh cong.
- Giu nguyen payload, API va quy tac luu `kyb_reject_reason`.

File lien quan:

- `frontend/app/pages/admin/enterprises.vue`
- `docs/architecture.md`
- `docs/user-flows.md`
- `PROJECT_CHANGELOG.md`

Kiem tra:

- `cd frontend; npm.cmd run typecheck` pass.
- `cd frontend; npm.cmd run build` pass.

Trang thai:

- Da xu ly.

### 2026-08-04 - Rut gon dropdown va phan trang bang viec lam sinh vien

Hien tuong / Yeu cau:

- Dropdown tai khoan tren trang chu lap lai muc `Tin nhan` da co icon rieng tren header.
- Trang `/student` render toan bo ket qua viec lam sau khi loc, lam danh sach qua dai.

Nguyen nhan:

- Nhom `Quan ly tim viec` trong `HomeHeader` khai bao them shortcut `Tin nhan`.
- Template `/student` lap truc tiep tren toan bo `filteredJobs` ma chua co lop phan trang.

Cach sua:

- Bo `Tin nhan` khoi dropdown tai khoan, giu icon chat tren header va dieu huong tin nhan trong student shell.
- Them phan trang client-side co dinh 5 viec lam moi trang sau buoc loc va sap xep.
- Khi tim kiem, bo loc hoac sap xep thay doi, danh sach quay ve trang 1.

File lien quan:

- `frontend/app/components/home/HomeHeader.vue`
- `frontend/app/pages/student/index.vue`
- `docs/architecture.md`
- `docs/user-flows.md`
- `PROJECT_CHANGELOG.md`

Kiem tra:

- `cd frontend; npm.cmd run typecheck` pass.
- `cd frontend; npm.cmd run build` pass.

Trang thai:

- Da xu ly.

### 2026-08-04 - Bo lien ket doi mat khau trung lap cua sinh vien

Hien tuong / Yeu cau:

- Menu tai khoan tren trang chu hien ca `Cai dat mat khau` va `Doi mat khau` du `/settings` da co chuc nang nay.
- Sidebar sinh vien cung hien them mot muc `Doi mat khau` trung voi `Cai dat`.

Nguyen nhan:

- Cac lien ket dieu huong den cung trang cai dat duoc khai bao rieng trong `HomeHeader` va student layout.

Cach sua:

- Bo hai muc lien quan den mat khau khoi dropdown tai khoan trang chu.
- Bo muc `Doi mat khau` khoi sidebar sinh vien, giu muc `Cai dat`.
- Giu nguyen lien ket `Quen mat khau?` tu trang dang nhap den `/forgot-password`.
- Xoa hai file JavaScript phat sinh canh `HomeHeader.vue` va `student.vue` de Nuxt khong con quet ban giao dien cu.

File lien quan:

- `frontend/app/components/home/HomeHeader.vue`
- `frontend/app/layouts/student.vue`
- `frontend/app/components/home/HomeHeader.vue.js` (da xoa)
- `frontend/app/layouts/student.vue.js` (da xoa)
- `docs/architecture.md`
- `docs/user-flows.md`
- `PROJECT_CHANGELOG.md`

Kiem tra:

- `cd frontend; npm.cmd run typecheck` pass.
- `cd frontend; npm.cmd run build` pass.

Trang thai:

- Da xu ly.

### 2026-08-04 - Sua loi Nuxt dang ky trung `$api`

Hien tuong / Yeu cau:

- Tai trang SSR tra ve HTTP 500 voi loi `Cannot redefine property: $api`.

Nguyen nhan:

- `frontend/app/plugins/api.js` la ban JavaScript duoc emit canh file nguon `frontend/app/plugins/api.ts`.
- Nuxt tu dong nap ca hai file plugin, nen ca hai cung cung cap injection key `api` va tao property `$api` hai lan.

Cach sua:

- Xoa file JavaScript phat sinh `frontend/app/plugins/api.js` va giu `frontend/app/plugins/api.ts` lam plugin nguon duy nhat.
- Khong thay doi API client, route, request/response hay hanh vi xac thuc.

File lien quan:

- `frontend/app/plugins/api.js` (da xoa)
- `frontend/app/plugins/api.ts` (giu nguyen)
- `PROJECT_CHANGELOG.md`

Kiem tra:

- `cd frontend; npm.cmd run typecheck` pass.
- `cd frontend; npm.cmd run build` pass.

Trang thai:

- Da xu ly.

### 2026-08-04 - Them student app shell va trang tin nhan sinh vien

Hien tuong / Yeu cau:

- Trang hoat dong cua sinh vien can co giao dien giong trang tin nhan tham chieu, co sidebar phan nhom, co the thu gon, header khong hien nut tim vo dung.
- Bam icon tin nhan tren header hoac muc tuong ung trong dropdown tai khoan phai dieu huong den trang tin nhan sinh vien.

Nguyen nhan:

- `student` layout truoc do chi boc `HomeHeader`/`HomeFooter` cho moi route dung layout nay, chua co app shell rieng cho cac trang hoat dong sau dang nhap.
- Icon chat trong `HomeHeader` dang chi goi toast `Tinh nang dang phat trien`.

Cach sua:

- Giu `/student` la bang viec lam cong khai voi header/footer cu de khong pha luong xem tat ca viec lam.
- Them nhanh app shell trong `frontend/app/layouts/student.vue` cho cac route hoat dong sinh vien, gom header, notification dropdown, chat button, user menu, sidebar phan nhom va sidebar thu gon.
- Them `frontend/app/pages/student/messages.vue` doc hoi thoai/tin nhan bang `ConversationService`, co empty state khi API khong co du lieu.
- Doi icon chat va muc `Tin nhan` trong dropdown `HomeHeader` sang dieu huong `/student/messages` voi tai khoan `STUDENT`, van giu doanh nghiep di ve hoi thoai doanh nghiep.

File lien quan:

- `frontend/app/layouts/student.vue`
- `frontend/app/pages/student/messages.vue`
- `frontend/app/components/home/HomeHeader.vue`
- `docs/architecture.md`
- `docs/user-flows.md`
- `PROJECT_CHANGELOG.md`

Kiem tra:

- `cd frontend; npm.cmd run typecheck` pass.

Trang thai:

- Da xu ly.

### 2026-08-04 - Giu trang thai mo rong dropdown thong bao

Hien tuong / Yeu cau:

- Sau khi bam `Hien thi them` de mo thong bao cu, neu bam ra ngoai dong dropdown roi mo lai thi danh sach cu phai giu nguyen muc da mo.

Nguyen nhan:

- Dropdown thong bao duoc mount lai khi mo/dong o cac header, nen bien dem thong bao cu da hien thi co the quay ve mac dinh.

Cach sua:

- Them `storageKey` cho `NotificationDropdown` va luu so luong thong bao cu da mo vao `sessionStorage` theo tung dropdown.
- Gan key rieng cho HomeHeader, admin header va enterprise header de cac trang khong ghi de trang thai cua nhau.

File lien quan:

- `frontend/app/components/ui/NotificationDropdown.vue`
- `frontend/app/components/home/HomeHeader.vue`
- `frontend/app/layouts/admin.vue`
- `frontend/app/layouts/enterprise.vue`
- `docs/architecture.md`
- `PROJECT_CHANGELOG.md`

Kiem tra:

- `cd frontend; npm.cmd run typecheck` pass.
- `cd frontend; npm.cmd run build` pass. Build con canh bao co san ve duplicate auto-import `useToast`, sourcemap cua `nuxt:module-preload-polyfill`, va deprecation warning tu dependency.

Trang thai:

- Da xu ly.

### 2026-08-04 - Dong bo dropdown thong bao co nut hien thi them

Hien tuong / Yeu cau:

- Nut thong bao tren cac trang can hien thi thong bao trong 1 ngay gan nhat truoc.
- Thong bao cua cac ngay truoc phai duoc rut gon va mo dan bang nut `Hien thi them`.
- Khi van con thong bao cu chua hien thi thi khong duoc an nut `Hien thi them`; neu danh sach qua dai thi dung scroll.

Nguyen nhan:

- Admin va enterprise layout dang loc cung thong bao trong 24 gio va cat ngan danh sach, nen thong bao cu khong co cach mo lai trong dropdown.
- HomeHeader public/student chi goi toast tinh nang dang phat trien khi bam chuong, chua co dropdown thong bao that.

Cach sua:

- Them `frontend/app/components/ui/NotificationDropdown.vue` lam dropdown thong bao dung chung.
- Dropdown tu chia thong bao 24 gio gan nhat va thong bao truoc do, hien thong bao cu theo tung dot 5 muc, giu nut `Hien thi them` cho den khi het muc bi an.
- Admin, enterprise va HomeHeader cung dung component moi; API van la `NotificationService.list`, `unreadCount`, `markAsRead`, va `markAllAsRead`.

File lien quan:

- `frontend/app/components/ui/NotificationDropdown.vue`
- `frontend/app/layouts/admin.vue`
- `frontend/app/layouts/enterprise.vue`
- `frontend/app/components/home/HomeHeader.vue`
- `docs/architecture.md`
- `PROJECT_CHANGELOG.md`

Kiem tra:

- `cd frontend; npm.cmd run typecheck` pass.
- `cd frontend; npm.cmd run build` pass. Build con canh bao co san ve duplicate auto-import `useToast`, sourcemap cua `nuxt:module-preload-polyfill`, va deprecation warning tu dependency.

Trang thai:

- Da xu ly.

### 2026-07-31 - Bo sung rail KYB va vach nhom khi sidebar nha tuyen dung thu gon

Hien tuong / Yeu cau:

- Sidebar nha tuyen dung khi thu gon can van tach ro `Tong quan`, `Quan ly tuyen dung`, va `Tien ich` bang cac vach ngan.
- Tai khoan doanh nghiep chua duyet KYB can co icon canh bao vang tren rail, can bang voi cac icon menu ben duoi.

Nguyen nhan:

- CSS collapsed dang an ca `.enterprise-sidebar-section-divider` va card KYB day du, nen rail bi lien mach va mat canh bao KYB.

Cach sua:

- Them nut KYB mini chi hien khi `showKYBNotice && isSidebarCollapsed`.
- Doi style collapsed de giu lai `.enterprise-sidebar-section-divider` dang vach ngang nho.
- Them style rieng cho `enterprise-sidebar-kyb-rail-card` voi vien vang va nen toi trong suot.

File lien quan:

- `frontend/app/layouts/enterprise.vue`
- `docs/architecture.md`
- `PROJECT_CHANGELOG.md`

Kiem tra:

- `cd frontend; npm.cmd run typecheck` pass.
- `cd frontend; npm.cmd run build` pass. Build con canh bao co san ve duplicate auto-import `useToast`, sourcemap cua `nuxt:module-preload-polyfill`, va deprecation warning tu dependency.

Trang thai:

- Da xu ly.

### 2026-07-31 - Chia nhom sidebar nha tuyen dung va them canh bao KYB

Hien tuong / Yeu cau:

- Sidebar nha tuyen dung can sap xep nhu anh tham chieu: tach `Tong quan`, `Quan ly tuyen dung`, va `Tien ich`.
- Bo muc `Thong bao` trong sidebar.
- Tai khoan doanh nghiep chua duyet KYB can co card canh bao tren sidebar va item bi khoa phoi mau hop voi nen sidebar.

Nguyen nhan:

- Sidebar cu dang gom cac muc thanh mot danh sach lien mach, chua co group heading va separator.
- Item bi khoa KYB dung nen trang/xam nen lac voi dark sidebar.
- `Thong bao` van nam trong `secondaryNavItems` du sidebar da co thong bao tren header.

Cach sua:

- Tach menu thanh 3 group trong `frontend/app/layouts/enterprise.vue`.
- Chi hien `Tong quan` trong group Tong quan; dua tin tuyen dung, tao tin moi, ung vien, lich phong van va hoi thoai vao group Quan ly tuyen dung; dua ho so cong ty va cai dat vao group Tien ich.
- Xoa `Thong bao` khoi `secondaryNavItems`, giu logic thong bao header nhu cu.
- Them sidebar KYB card khi `showKYBNotice` va them style rieng cho locked item.

File lien quan:

- `frontend/app/layouts/enterprise.vue`
- `docs/architecture.md`
- `PROJECT_CHANGELOG.md`

Kiem tra:

- `cd frontend; npm.cmd run typecheck` pass.
- `cd frontend; npm.cmd run build` pass. Build con canh bao co san ve duplicate auto-import `useToast`, sourcemap cua `nuxt:module-preload-polyfill`, va deprecation warning tu dependency.

Trang thai:

- Da xu ly.

### 2026-07-31 - Can logo sidebar nha tuyen dung khop voi header

Hien tuong / Yeu cau:

- Logo trong sidebar nha tuyen dung dang bi tut xuong thap hon header, khong khop voi cach hien thi cua sidebar admin.
- Chi duoc chinh dung vung logo/header sidebar, khong doi mau sac cac thanh phan.

Nguyen nhan:

- Vung scroll cua sidebar nha tuyen dung dang co `py-6`, lam logo bi day xuong 24px so voi dinh sidebar.
- Vung brand chua co hang header 64px rieng nhu layout admin.

Cach sua:

- Doi padding vung scroll thanh `pb-6` de bo khoang trong tren.
- Doi `enterprise-sidebar-brand` thanh hang `h-16` can giua, giu nguyen logo, mau chu va cac mau hien co.

File lien quan:

- `frontend/app/layouts/enterprise.vue`
- `docs/architecture.md`
- `PROJECT_CHANGELOG.md`

Kiem tra:

- `cd frontend; npm.cmd run typecheck` pass.
- `cd frontend; npm.cmd run build` pass. Build con canh bao co san ve duplicate auto-import `useToast`, sourcemap cua `nuxt:module-preload-polyfill`, va deprecation warning tu dependency.

Trang thai:

- Da xu ly.

### 2026-07-30 - Thu nho va can giua nut mui ten sidebar admin/nha tuyen dung

Hien tuong / Yeu cau:

- Nut mui ten thu gon/mo rong sidebar tren trang admin va nha tuyen dung dang qua to.
- Nut can duoc can bang vao giua vung header/brand de nhin gon va de bam hon.

Nguyen nhan:

- Hai layout dung kich thuoc handle va ring lon hon nhu cau hien tai.
- Layout nha tuyen dung dat nut theo `top-6`, nen tam nut chua that su nam giua vung header cao 64px.

Cach sua:

- Giam handle sidebar admin va nha tuyen dung ve 32x32px, icon ve 16x16px, ring ve 2px va shadow nhe hon.
- Can nut nha tuyen dung theo `top-8` kem `-translate-y-1/2` de tam nut trung voi tam header/brand.

File lien quan:

- `frontend/app/layouts/admin.vue`
- `frontend/app/layouts/enterprise.vue`
- `docs/architecture.md`
- `PROJECT_CHANGELOG.md`

Kiem tra:

- `cd frontend; npm.cmd run typecheck` pass.
- `cd frontend; npm.cmd run build` pass. Build con canh bao co san ve duplicate auto-import `useToast`, sourcemap cua `nuxt:module-preload-polyfill`, va deprecation warning tu dependency.

Trang thai:

- Da xu ly.

### 2026-07-30 - Thu gon icon va sua flyout sidebar nha tuyen dung bi vo chu

Hien tuong / Yeu cau:

- Icon sidebar nha tuyen dung khi thu gon dang qua to.
- Flyout `Ung vien` qua lon, tran man hinh va text trong option bi xuong thanh cot doc.
- Cac icon trong sidebar collapsed can duoc day len va giu nhip vi tri gan voi sidebar khi mo rong.

Nguyen nhan:

- CSS `.enterprise-sidebar-collapsed nav a/button` ap kich thuoc tile cho tat ca link/button ben trong nav, bao gom ca link nam trong `application-flyout`.
- Rail collapsed duoc tang len `6.5rem`, tile 66x68px va icon 24-25px nen trong man hinh nho bi qua lon.

Cach sua:

- Dua rail collapsed ve `5rem` va dong bo margin header/main theo kich thuoc nay.
- Giam tile menu collapsed ve 52x52px, icon ve 19px va logo collapsed ve 48px.
- Thu nho flyout `Ung vien` ve `16rem`, giam padding/font/icon trong option.
- Them override rieng cho `.application-flyout a` de no luon full width, min-height auto, can trai va khong bi rule tile cua sidebar collapsed lam vo chu.

File lien quan:

- `frontend/app/layouts/enterprise.vue`
- `docs/architecture.md`
- `PROJECT_CHANGELOG.md`

Kiem tra:

- `cd frontend; npm.cmd run typecheck` pass.
- `cd frontend; npm.cmd run build` pass. Build con canh bao co san ve duplicate auto-import `useToast`, sourcemap cua `nuxt:module-preload-polyfill`, va deprecation warning tu dependency.

Trang thai:

- Da xu ly.

### 2026-07-30 - Can lai sidebar flyout nha tuyen dung theo mockup

Hien tuong / Yeu cau:

- Sidebar nha tuyen dung khi thu gon can co vi tri icon, mau active state va flyout giong anh tham chieu hon.
- Font chu, mau chu va khoang cach cua flyout `Ung vien` can giong TopCV-style card trong mockup.

Nguyen nhan:

- Rail collapsed truoc do con hep, icon item active bi det theo chieu ngang cua menu.
- Flyout da doi sang nen trang nhung kich thuoc, vi tri va typography van chua sat voi anh.

Cach sua:

- Doi rail collapsed sang `6.5rem`, dong bo margin header/main theo kich thuoc rail moi.
- Doi nav item collapsed thanh tile 66x68px, icon 24-25px, active gradient xanh va inactive icon mau xanh trang.
- Doi flyout `Ung vien` thanh panel rong hon, can theo icon active, chu option 16px, mo ta 14px va active item nen xanh rat nhat.
- Giu nguyen viec bo muc `Quan ly danh sach` trong flyout collapsed theo yeu cau truoc.

File lien quan:

- `frontend/app/layouts/enterprise.vue`
- `docs/architecture.md`
- `PROJECT_CHANGELOG.md`

Kiem tra:

- `cd frontend; npm.cmd run typecheck` pass.
- `cd frontend; npm.cmd run build` pass. Build con canh bao co san ve duplicate auto-import `useToast`, sourcemap cua `nuxt:module-preload-polyfill`, va deprecation warning tu dependency.

Trang thai:

- Da xu ly.

### 2026-07-30 - Lam lai flyout Ung vien cua sidebar nha tuyen dung

Hien tuong / Yeu cau:

- Sidebar nha tuyen dung khi thu gon can giu vi tri icon on dinh so voi luc mo rong.
- Flyout `Ung vien` can giong mau tham chieu dang card trang co mui nhon, nhung bo phan `Quan ly danh sach`.
- Khi mo/chon `Ung vien`, chi icon `Ung vien` duoc active; cac muc sidebar khac phai ve mau nen sidebar cu.

Nguyen nhan:

- Flyout collapsed cu dang dung tone navy/sky va CSS cu ep mau chu, khong dung thiet ke tham chieu moi.
- Active state cua cac muc sidebar chi dua vao route hien tai, nen khi mo flyout tu mot route khac co the hien nhieu muc active cung luc.
- Chieu cao item collapsed lon hon item expanded, lam nhip icon trong rail chua dong deu voi trang thai mo rong.

Cach sua:

- Doi flyout `Ung vien` thanh card trang bo tron, co mui nhon canh trai, icon va mo ta cho ba lua chon: danh sach ung vien, ung vien da luu, bi tu choi.
- Bo action `Quan ly danh sach` khoi flyout collapsed.
- Them `isApplicationFlyoutActive` de uu tien active `Ung vien` khi flyout dang mo va tat active cua cac muc sidebar khac.
- Can lai chieu cao item collapsed de vi tri icon gan hon voi nhip sidebar khi mo rong.

File lien quan:

- `frontend/app/layouts/enterprise.vue`
- `docs/architecture.md`
- `PROJECT_CHANGELOG.md`

Kiem tra:

- `cd frontend; npm.cmd run typecheck` pass.
- `cd frontend; npm.cmd run build` pass. Build con canh bao co san ve duplicate auto-import `useToast`, sourcemap cua `nuxt:module-preload-polyfill`, va deprecation warning tu dependency.

Trang thai:

- Da xu ly.

### 2026-07-30 - Dong bo kich thuoc icon va flyout sidebar nha tuyen dung

Hien tuong / Yeu cau:

- Icon sidebar nha tuyen dung khi thu gon can co kich thuoc gan voi sidebar admin.
- Flyout `Ung vien` can phoi mau hop voi nen sidebar toi.
- Khi bam `Ung vien` o sidebar thu gon, icon `Ung vien` can duoc to dam/active dong thoi voi viec hien flyout.

Nguyen nhan:

- Kich thuoc icon collapsed truoc do bi giam qua nho so voi rail admin.
- Flyout dang dung nen trang va CSS override mau chu slate nen tach khoi tone sidebar.
- Trang thai active cua nut `Ung vien` chi dua vao route `/enterprise/applications`, chua tinh luc flyout dang mo tren dashboard.

Cach sua:

- Doi kich thuoc icon sidebar ve 20px va wrapper collapsed ve 40px de gan voi sidebar admin.
- Doi flyout collapsed sang nen slate/navy, vien/ring sky va item active gradient xanh.
- Tinh active state cua `Ung vien` theo `isApplicationsSection` hoac khi `showApplicationFlyout` dang mo trong collapsed mode.

File lien quan:

- `frontend/app/layouts/enterprise.vue`
- `docs/architecture.md`
- `PROJECT_CHANGELOG.md`

Kiem tra:

- `cd frontend; npm.cmd run typecheck` pass.
- `cd frontend; npm.cmd run build` pass. Build con canh bao co san ve duplicate auto-import `useToast`, sourcemap cua `nuxt:module-preload-polyfill`, va deprecation warning tu dependency.

Trang thai:

- Da xu ly.

### 2026-07-30 - Hoan thien sidebar nha tuyen dung khi thu gon

Hien tuong / Yeu cau:

- Khi sidebar nha tuyen dung thu gon, can giu lai duong gach va icon dang xuat.
- Khoi thong tin nguoi dung o cuoi sidebar can an khi collapsed.
- Muc `Ung vien` khong hien mui ten ben canh icon khi sidebar thu gon.
- Icon va item collapsed dang qua lon, can thu gon lai.
- Khi vao `Tao tin moi`, muc `Tin tuyen dung` khong duoc bi active theo.

Nguyen nhan:

- CSS collapsed dang an ca `enterprise-sidebar-footer`, lam mat luon nut dang xuat va border tren footer.
- Active check cua primary menu dung `startsWith`, nen `/enterprise/jobs` cung match `/enterprise/jobs/create`.
- Kich thuoc icon wrapper collapsed duoc tang qua lon trong lan tinh chinh truoc.

Cach sua:

- Tach card thong tin doanh nghiep thanh `enterprise-sidebar-user-card` va label dang xuat thanh `enterprise-sidebar-logout-label`.
- Khi collapsed chi an user card va label, giu footer, border va icon dang xuat.
- Chi render chevron cua `Ung vien` khi sidebar dang mo rong.
- Giam kich thuoc icon/menu item collapsed.
- Doi active check cua `Tin tuyen dung` va `Tao tin moi` sang exact route.

File lien quan:

- `frontend/app/layouts/enterprise.vue`
- `docs/architecture.md`
- `PROJECT_CHANGELOG.md`

Kiem tra:

- `cd frontend; npm.cmd run typecheck` pass.
- `cd frontend; npm.cmd run build` pass. Build con canh bao co san ve duplicate auto-import `useToast`, sourcemap cua `nuxt:module-preload-polyfill`, va deprecation warning tu dependency.

Trang thai:

- Da xu ly.

### 2026-07-30 - Tinh chinh sidebar nha tuyen dung khi thu gon

Hien tuong / Yeu cau:

- Sidebar nha tuyen dung khi thu gon can rong hon de icon `Ung vien` va mui ten/flyout khong bi lech so voi cac icon khac.
- Dropdown/flyout cua muc `Ung vien` can co mau vien phu hop voi nen sidebar.
- Khi sidebar thu gon, khoi thong tin nguoi dung o cuoi sidebar can duoc an di.

Nguyen nhan:

- Rail collapsed dang dung `lg:w-20`, khoang ngang qua chat voi icon va trang thai active cua menu.
- Flyout `Ung vien` dung vien slate trung tinh nen chua dong bo voi tone xanh cua sidebar.
- Footer sidebar chi an text con ben trong, nen the thong tin nguoi dung van con hien khi collapsed.

Cach sua:

- Tang rail collapsed va margin noi dung/header tu `lg:w-20`/`lg:ml-20` len `lg:w-24`/`lg:ml-24`.
- Tang kich thuoc vung icon khi collapsed de can giua cac icon menu deu hon.
- Doi flyout `Ung vien` sang vien/ring/shadow tone sky.
- Gan `enterprise-sidebar-footer` cho khoi footer va an ca khoi khi sidebar thu gon.

File lien quan:

- `frontend/app/layouts/enterprise.vue`
- `PROJECT_CHANGELOG.md`

Kiem tra:

- `cd frontend; npm.cmd run typecheck` pass.
- `cd frontend; npm.cmd run build` pass. Build con canh bao co san ve duplicate auto-import `useToast`, sourcemap cua `nuxt:module-preload-polyfill`, va deprecation warning tu dependency.

Trang thai:

- Da xu ly.

### 2026-07-30 - Sua icon sidebar nha tuyen dung bi an khi thu gon

Hien tuong / Yeu cau:

- Khi sidebar nha tuyen dung bi thu gon, cac icon dieu huong trong menu bi an, chi con nen active dang vien xanh.

Nguyen nhan:

- CSS collapsed dang dung selector rong `nav span:not(.sidebar-badge)` de an chu trong menu.
- Nuxt Icon render icon duoi dang `span`, nen selector nay an luon icon.

Cach sua:

- Gan class `enterprise-sidebar-label` rieng cho text label trong sidebar.
- Gan class rieng cho chevron va badge phu can an khi collapsed.
- Boc tung icon menu bang `enterprise-sidebar-icon` de moi item co o icon rieng khi sidebar thu gon.
- Doi CSS collapsed chi an label/chevron/badge phu, giu nguyen icon cua cac item.

File lien quan:

- `frontend/app/layouts/enterprise.vue`
- `PROJECT_CHANGELOG.md`

Kiem tra:

- `cd frontend; npm.cmd run typecheck` pass.
- `cd frontend; npm.cmd run build` pass. Build con canh bao co san ve duplicate auto-import `useToast`, sourcemap cua `nuxt:module-preload-polyfill`, va deprecation warning tu dependency.

Trang thai:

- Da xu ly.

### 2026-07-30 - Can lai header va scrollbar sidebar nha tuyen dung

Hien tuong / Yeu cau:

- Header trang nha tuyen dung can thu gon ve phia ben phai de logo trong sidebar hien len tren ro rang.
- Sidebar khi thu gon van phai giu cac icon dieu huong phu hop voi tung muc.
- Khi sidebar qua dai, thanh cuon can dong bo mau voi nen sidebar va bo hai nut mui ten cuon.

Nguyen nhan:

- Header enterprise dang chiem full chieu ngang viewport, con sidebar desktop bi day xuong duoi header bang `top-16`.
- Vung scroll sidebar dung scrollbar mac dinh cua trinh duyet nen mau khong hop voi nen toi cua sidebar va con nut mui ten tren mot so moi truong.

Cach sua:

- Doi header enterprise thanh header desktop co margin trai theo do rong sidebar mo/thu gon.
- Doi sidebar enterprise tren desktop thanh panel fixed full-height tu dinh man hinh de khoi brand/logo luon nam o phan tren cung.
- Doi main content enterprise co margin trai dong bo voi trang thai sidebar.
- Them class `enterprise-sidebar-scroll` voi scrollbar mau xanh duong/cyan, track toi, thumb bo tron va an scrollbar button.
- Cap nhat `docs/architecture.md` cho hanh vi shell/sidebar moi.

File lien quan:

- `frontend/app/layouts/enterprise.vue`
- `docs/architecture.md`
- `PROJECT_CHANGELOG.md`

Kiem tra:

- `cd frontend; npm.cmd run typecheck` pass.
- `cd frontend; npm.cmd run build` pass. Build con canh bao co san ve duplicate auto-import `useToast`, sourcemap cua `nuxt:module-preload-polyfill`, va deprecation warning tu dependency.

Trang thai:

- Da xu ly.

### 2026-07-30 - Thiet ke lai logo header va sidebar nha tuyen dung theo mockup

Hien tuong / Yeu cau:

- Trang chu nha tuyen dung can thiet ke lai sidebar, logo va phan header theo anh tham chieu.
- Logo QuickWork can nam trong sidebar thay vi hien nhu cum brand o header desktop.
- Khi sidebar thu gon, muc `Ung vien` van phai mo dropdown/flyout ben phai de chon cac option con.

Nguyen nhan:

- Layout enterprise dang giu brand trong header, con sidebar chi hien menu.
- Sidebar enterprise chua co khoi brand rieng va chua co dang panel bo goc nhu mockup.
- Flyout `Ung vien` nam trong vung scroll cua sidebar co nguy co bi cat khi bung ra ngoai.

Cach sua:

- An brand QuickWork tren header desktop, giu brand header cho mobile.
- Them khoi logo QuickWork + `Nha tuyen dung` vao dau sidebar enterprise.
- Doi sidebar enterprise thanh panel nen toi gradient, bo goc, co shadow va spacing giong mockup hon.
- Doi icon `Tong quan` sang icon home.
- Giu badge tin nhan/thong bao khi sidebar thu gon bang class rieng `sidebar-badge`.
- Doi flyout `Ung vien` sang vi tri fixed ben phai sidebar khi collapsed de khong bi container scroll cat.
- Cap nhat docs architecture cho hanh vi logo/header/sidebar moi.

File lien quan:

- `frontend/app/layouts/enterprise.vue`
- `docs/architecture.md`
- `PROJECT_CHANGELOG.md`

Kiem tra:

- `cd frontend; npm.cmd run typecheck` pass.
- `cd frontend; npm.cmd run build` pass. Build con canh bao co san ve duplicate auto-import `useToast`, sourcemap cua `nuxt:module-preload-polyfill`, va deprecation warning tu dependency.

Trang thai:

- Da xu ly.

### 2026-07-30 - Tinh chinh nut thu gon va flyout sidebar nha tuyen dung

Hien tuong / Yeu cau:

- Nut thu gon sidebar admin can dep va ro hon, khong bi mo/chim khi hover tren nen trang sang.
- Sidebar nha tuyen dung khi thu gon dang xau, can theo phong cach sidebar admin.
- Muc `Ung vien` cua nha tuyen dung khi sidebar thu gon van can chon duoc cac option con bang dropdown/flyout ben canh.

Nguyen nhan:

- Nut thu gon admin dung nen toi va hover nhat, khi nam tren nen trang sang trong khong noi bat.
- Sidebar enterprise con theo nen trang sang, chua dong bo voi rail sidebar admin.
- Logic `Ung vien` chi co dropdown doc ben trong sidebar day du, nen khi an label/menu con trong collapsed mode thi khong co noi chon option con.

Cach sua:

- Doi nut thu gon admin thanh nut tron noi o mep sidebar, nen trang, vien xanh, hover xanh dam ro rang.
- Doi sidebar enterprise sang nen toi/rail icon theo phong cach admin, active va hover co contrast cao.
- Dua nut thu gon enterprise thanh handle noi o mep sidebar.
- Them `showApplicationFlyout` cho enterprise layout; khi sidebar thu gon, click `Ung vien` mo flyout trang sang ben phai sidebar voi cac option con.
- Flyout tu dong dong khi click ngoai, khi doi route, hoac khi mo sidebar day du.
- Cap nhat `docs/architecture.md` ve flyout cua sidebar enterprise.

File lien quan:

- `frontend/app/layouts/admin.vue`
- `frontend/app/layouts/enterprise.vue`
- `docs/architecture.md`
- `PROJECT_CHANGELOG.md`

Kiem tra:

- `cd frontend; npm.cmd run typecheck` pass.
- `cd frontend; npm.cmd run build` pass. Build con canh bao co san ve duplicate auto-import `useToast`, sourcemap cua `nuxt:module-preload-polyfill`, va deprecation warning tu dependency.

Trang thai:

- Da xu ly.

### 2026-07-30 - Them sidebar thu gon mo rong cho dashboard admin va nha tuyen dung

Hien tuong / Yeu cau:

- Cac trang dang co sidebar can co nut thu gon va hien thi day du sidebar.
- Khi sidebar thu gon/mo rong, phan noi dung chinh phai phong to/thu nho deu theo layout, khong bi tach rieng tung page.

Nguyen nhan:

- Sidebar admin va enterprise dang co chieu rong co dinh.
- Layout chua co state `isSidebarCollapsed`, nen noi dung chinh chi nhan phan dien tich con lai cua sidebar day du.

Cach sua:

- Them state thu gon sidebar cho `frontend/app/layouts/admin.vue` va `frontend/app/layouts/enterprise.vue`.
- Them nut icon thu gon/mo rong tren desktop cho ca hai sidebar.
- Khi thu gon, sidebar chuyen sang rail icon-only; label, badge phu, footer text va menu con duoc an gon.
- Giu hanh vi mobile dang co: sidebar mo nhu drawer voi overlay.
- Dung flex layout san co de noi dung chinh tu mo rong khi sidebar thu gon va thu lai khi sidebar hien day du.
- Cap nhat `docs/architecture.md` ve hanh vi dashboard shell moi.

File lien quan:

- `frontend/app/layouts/admin.vue`
- `frontend/app/layouts/enterprise.vue`
- `docs/architecture.md`
- `PROJECT_CHANGELOG.md`

Kiem tra:

- `cd frontend; npm.cmd run typecheck` pass.
- `cd frontend; npm.cmd run build` pass. Build con canh bao co san ve duplicate auto-import `useToast`, sourcemap cua `nuxt:module-preload-polyfill`, va deprecation warning tu dependency.

Trang thai:

- Da xu ly.

### 2026-07-30 - Nhung hoi thoai vao noi dung chinh dashboard nha tuyen dung

Hien tuong / Yeu cau:

- Nha tuyen dung muon bam `Hoi thoai` o sidebar nhung van giu nguyen trang nha tuyen dung, chi thay doi phan thong tin chinh o giua nhu mockup.
- Khong muon sidebar dan sang mot trang `/enterprise/messages` co cam giac tach khoi dashboard hien tai.

Nguyen nhan:

- Sidebar `Hoi thoai` dang tro toi `/enterprise/messages`.
- `EnterpriseMessageCenter` dang cap nhat URL thanh `/enterprise/messages/:id` khi chon mot hoi thoai.

Cach sua:

- Doi sidebar `Hoi thoai` sang `/enterprise?view=messages`.
- Cho `frontend/app/pages/enterprise/index.vue` render `EnterpriseMessageCenter` ngay trong vung noi dung chinh khi query `view=messages`.
- Them che do `embedded` cho `EnterpriseMessageCenter` de khi chon hoi thoai, URL chi cap nhat query `conversation` tren `/enterprise`.
- Doi link notification dang tro toi `/enterprise/messages/:id` sang `/enterprise?view=messages&conversation=:id`.
- Cap nhat `docs/architecture.md` de phan anh luong render moi.

File lien quan:

- `frontend/app/layouts/enterprise.vue`
- `frontend/app/pages/enterprise/index.vue`
- `frontend/app/components/enterprise/EnterpriseMessageCenter.vue`
- `docs/architecture.md`
- `PROJECT_CHANGELOG.md`

Kiem tra:

- `cd frontend; npm.cmd run typecheck` pass.
- `cd frontend; npm.cmd run build` pass.

Trang thai:

- Da xu ly.

### 2026-07-30 - Dua hoi thoai va so cho vao sidebar nha tuyen dung

Hien tuong / Yeu cau:

- Nha tuyen dung muon thay hoi thoai truc tiep trong sidebar dashboard thay vi chi co icon tin nhan tren header.
- Header khong can hien nut tin nhan rieng.
- Sidebar can hien so tin nhan dang cho va so thong bao chua doc ma nha tuyen dung nhan duoc.

Nguyen nhan:

- `frontend/app/layouts/enterprise.vue` da doc unread count cua conversation va notification, nhung tin nhan con hien bang icon tren header.
- Badge thong bao tren layout dang dua theo danh sach header 24 gio, chua phan tach ro so unread tong dung cho sidebar.

Cach sua:

- Bo shortcut tin nhan tren header enterprise.
- Them muc `Hoi thoai` vao sidebar enterprise, tro toi `/enterprise/messages` va hien badge unread tu `ConversationService.unreadCount()`.
- Gan badge unread cho muc `Thong bao` trong sidebar tu `NotificationService.unreadCount()`.
- Them refresh nen 10 giay cho count sidebar de so cho cap nhat ma khong can reload trang.

File lien quan:

- `frontend/app/layouts/enterprise.vue`
- `PROJECT_CHANGELOG.md`

Kiem tra:

- `cd frontend; npm.cmd run typecheck` pass.

Trang thai:

- Da xu ly.

### 2026-07-30 - Thiet ke lai hop thu tin nhan nha tuyen dung

Hien tuong / Yeu cau:

- Trang tin nhan nha tuyen dung can bam sat mockup moi: bo nut loc rieng, mo rong o tim kiem, danh sach hoi thoai moi nhat nam tren dau.
- Tin nhan sinh vien gui can duoc cap nhat tren giao dien ma khong can reload trang.
- Cac thao tac chua hoan thien can hien thi trang thai dang phat trien thay vi trong nhu da san sang.

Nguyen nhan:

- `EnterpriseMessageCenter` da ket noi `ConversationService` de doc/gui tin nhan that, nhung giao dien con toi gian va chi tai lai khi nguoi dung tu thao tac.
- Cac nut thao tac phu chua co backend rieng nen can lam mo va thong bao ro trang thai.

Cach sua:

- Thiet ke lai `EnterpriseMessageCenter` thanh bo cuc 3 cot gom danh sach hoi thoai, khung chat, va thong tin ung vien/tin tuyen dung.
- Bo nut loc rieng, mo rong o tim kiem va them tab loc noi bo.
- Sap xep hoi thoai theo `last_message_at`/tin nhan gan nhat de nguoi nhan moi nhat len tren.
- Them polling nen 5 giay de dong bo danh sach hoi thoai va noi dung hoi thoai dang mo.
- Giu chuc nang gui tin nhan qua `ConversationService.sendByConversation`.
- Lam mo cac nut dinh kem, emoji, mau tin nhan, luu hoi thoai, tuy chon va thao tac nhanh; khi bam se hien toast dang phat trien.

File lien quan:

- `frontend/app/components/enterprise/EnterpriseMessageCenter.vue`
- `PROJECT_CHANGELOG.md`

Kiem tra:

- `cd frontend; npm.cmd run typecheck` pass.

Trang thai:

- Da xu ly.

### 2026-07-29 - Thong bao admin cho tin tuyen dung va don ung tuyen moi

Hien tuong / Yeu cau:

- Admin can nhan thong bao khi doanh nghiep tao tin moi, gui lai ban nhap, hoac dang lai tin sang trang thai cho admin duyet.
- Admin can nhan thong bao khi sinh vien tao don ung tuyen moi.
- Cac thong bao/nhat ky hoat dong tren trang chu va header dashboard hien tai chi nen hien thi du lieu trong 1 ngay gan nhat, du lieu cu khong lam day giao dien.

Nguyen nhan:

- `EnterpriseJobHandler.CreateJob` va `EnterpriseJobHandler.UpdateJob` co the dua tin ve `PENDING` nhung chua tao notification cho admin.
- `StudentJobHandler.ApplyJob` tao `job_applications` truc tiep va chua duoc ket noi voi `NotificationService`.
- Admin/enterprise layout va dashboard lay thong bao theo so luong moi nhat, chua loc theo cua so thoi gian 24 gio.

Cach sua:

- Them `NotifyAdminsJobSubmittedTx` va `NotifyAdminsApplicationSubmittedTx` vao `NotificationService`; cac ham nay tao notification cho cac admin `ACTIVE`.
- Goi notification trong transaction tao/cap nhat tin tuyen dung khi tin chuyen sang `PENDING`, dong thoi tranh tao trung thong bao khi sua noi dung tin da dang cho duyet.
- Doi `StudentJobHandler` de nhan `NotificationService`, preload job/student profile sau khi tao don ung tuyen, roi tao notification admin trong cung transaction.
- Admin header dropdown, enterprise header dropdown va dashboard activity feed chi surface notification/activity duoc tao trong 24 gio gan nhat.
- Dashboard admin doc them notification that tu API vao muc nhip hoat dong, nen co the hien thi ca tin tuyen dung moi va don ung tuyen moi.
- Cap nhat `docs/api.md`, `docs/business-rules.md`, va `docs/architecture.md`.

File lien quan:

- `backend/internal/services/notification_service.go`
- `backend/internal/handlers/enterprise_job_handler.go`
- `backend/internal/handlers/student_job_handler.go`
- `backend/cmd/api/main.go`
- `frontend/app/layouts/admin.vue`
- `frontend/app/layouts/enterprise.vue`
- `frontend/app/pages/admin/dashboard.vue`
- `docs/api.md`
- `docs/business-rules.md`
- `docs/architecture.md`
- `PROJECT_CHANGELOG.md`

Kiem tra:

- `cd backend; go test ./...` pass sau khi chay ngoai sandbox de Go ghi build cache trong `AppData`.
- `cd frontend; npm.cmd run typecheck` pass.
- `cd frontend; npm.cmd run build` pass. Build con canh bao co san ve duplicate auto-import `useToast`, sourcemap cua `nuxt:module-preload-polyfill`, va deprecation warning tu dependency.

Trang thai:

- Da xu ly.

### 2026-07-29 - Cho doanh nghiep PENDING/REJECTED vao dashboard nha tuyen dung

Hien tuong / Yeu cau:

- Tai khoan doanh nghiep KYB `PENDING` dang nhap thay canh bao nhung van bi giu hoac bi da ve trang dang nhap.
- Yeu cau moi: moi `ENTERPRISE` active duoc vao dashboard; chi cac chuc nang quan trong moi can KYB `APPROVED`.

Nguyen nhan:

- `frontend/app/middleware/auth.global.ts` van con rule cu: neu vao bat ky route `/enterprise` nao ma `enterpriseApproved` false thi `authStore.clearAuth()` va redirect ve `/auth/login?error=enterprise_pending`.
- `frontend/app/middleware/guest.ts` van redirect enterprise da dang nhap ve route cu `/enterprise/dashboard`, trong khi dashboard hien tai la `/enterprise`.
- Header trang chu chi mo khu nha tuyen dung khi enterprise da duyet KYB, khong dung voi rule moi.

Cach sua:

- Bo viec xoa phien va redirect login trong `auth.global.ts` cho doanh nghiep chua duyet.
- Chi redirect doanh nghiep chua duyet ve `/enterprise?kyb=pending|rejected` khi ho mo cac route nghiep vu quan trong: jobs, applications, interviews.
- Sua `guest.ts` de enterprise da dang nhap ve `/enterprise`.
- Sua `HomeHeader` de doanh nghiep co role `ENTERPRISE` duoc mo dashboard nha tuyen dung, khong yeu cau `enterpriseApproved`.
- Cap nhat `docs/architecture.md` va `docs/user-flows.md`.

File lien quan:

- `frontend/app/middleware/auth.global.ts`
- `frontend/app/middleware/guest.ts`
- `frontend/app/components/home/HomeHeader.vue`
- `docs/architecture.md`
- `docs/user-flows.md`
- `PROJECT_CHANGELOG.md`

Kiem tra:

- `cd frontend; npm.cmd run typecheck` pass.
- `cd frontend; npm.cmd run build` pass. Build con canh bao co san ve duplicate auto-import `useToast`, sourcemap cua `nuxt:module-preload-polyfill`, va deprecation warning tu dependency.
- `git -c safe.directory=D:/GOLANG/QuickWork diff --check -- frontend/app/middleware/auth.global.ts frontend/app/middleware/guest.ts frontend/app/components/home/HomeHeader.vue docs/architecture.md docs/user-flows.md PROJECT_CHANGELOG.md` pass, chi co canh bao LF/CRLF tren Windows.

Trang thai:

- Da xu ly.

### 2026-07-29 - On dinh lenh typecheck frontend tren Windows

Hien tuong / Yeu cau:

- `vue-tsc` bao `Found 0 errors` nhung watcher lai fail khi ghi `frontend/.nuxt/tsconfig.app.tsbuildinfo`.
- Loi hien thi la `Could not write file ... UNKNOWN: unknown error, open ...tsconfig.app.tsbuildinfo`.

Nguyen nhan:

- Day khong phai loi TypeScript trong source.
- `vue-tsc --watch` dang ghi incremental cache vao `.nuxt/*.tsbuildinfo`; tren Windows file nay de bi watcher/dev server khac giu hoac ghi canh tranh.

Cach sua:

- Them script `typecheck` va `typecheck:watch` trong `frontend/package.json`.
- Cac script nay chay `vue-tsc --noEmit --incremental false` de khong ghi lai `.nuxt/*.tsbuildinfo`.
- Cap nhat `docs/conventions.md` de huong dan dung lenh typecheck moi.

File lien quan:

- `frontend/package.json`
- `docs/conventions.md`
- `PROJECT_CHANGELOG.md`

Kiem tra:

- `cd frontend; npx.cmd vue-tsc --noEmit` pass.
- `cd frontend; npx.cmd vue-tsc --noEmit --incremental false` pass va khong ghi lai `frontend/.nuxt/tsconfig.app.tsbuildinfo`.

Trang thai:

- Da xu ly.

### 2026-07-29 - Dieu chinh luong ENTERPRISE theo trang thai KYB

Hien tuong / Yeu cau:

- Moi tai khoan `ENTERPRISE` can duoc vao dashboard.
- Chi doanh nghiep `APPROVED` moi duoc dung cac chuc nang quan trong nhu dang viec, quan ly ung vien va lich phong van.
- Doanh nghiep `PENDING` can thay thong bao cho duyet.
- Doanh nghiep `REJECTED` can thay ly do tu choi va nut gui lai ho so.

Nguyen nhan:

- Dashboard nha tuyen dung dang goi API danh sach tin ngay khi mount, trong khi backend middleware van chan enterprise business API neu KYB chua duyet.
- He thong chua luu truong ly do tu choi KYB rieng tren ho so doanh nghiep.

Cach sua:

- Them `kyb_reject_reason` vao `EnterpriseProfile`, login metadata va response profile.
- `PUT /admin/enterprises/:id/kyb` nhan them `reject_reason`, luu ly do khi `REJECTED`, xoa ly do khi `PENDING` hoac `APPROVED`, va tao notification KYB kem noi dung ly do.
- `PUT /enterprise/profile` cho phep doanh nghiep chua duyet gui lai GPKD khong rong de dua KYB ve `PENDING` va xoa ly do tu choi cu.
- Them middleware frontend `enterprise-approved` cho `/enterprise/jobs`, `/enterprise/jobs/create`, `/enterprise/applications`, `/enterprise/interviews`.
- Dashboard `/enterprise` tai profile truoc; `PENDING`/`REJECTED` chi hien trang thai KYB, con `APPROVED` moi tai va quan ly tin tuyen dung.
- Layout nha tuyen dung khoa mem cac menu nghiep vu khi KYB chua duyet va hien toast giai thich.
- Admin enterprise UI yeu cau nhap ly do khi chuyen KYB sang `REJECTED`.
- Cap nhat `docs/api.md`, `docs/database.md`, `docs/business-rules.md`, `docs/architecture.md`, `docs/user-flows.md`.

File lien quan:

- `backend/internal/models/enterprise_profile.go`
- `backend/internal/dto/response/login_response.go`
- `backend/internal/services/auth_service.go`
- `backend/internal/handlers/admin_handler.go`
- `backend/internal/handlers/enterprise_job_handler.go`
- `frontend/app/middleware/enterprise-approved.ts`
- `frontend/app/pages/enterprise/index.vue`
- `frontend/app/layouts/enterprise.vue`
- `frontend/app/pages/admin/enterprises.vue`
- `frontend/app/services/admin.service.ts`
- `frontend/app/stores/auth.ts`
- `frontend/app/pages/auth/google/callback.vue`
- `docs/api.md`
- `docs/database.md`
- `docs/business-rules.md`
- `docs/architecture.md`
- `docs/user-flows.md`
- `PROJECT_CHANGELOG.md`

Kiem tra:

- `gofmt` pass cho cac file Go lien quan.
- `cd frontend; npm.cmd run build` pass. Build con canh bao co san ve duplicate auto-import `useToast`, sourcemap cua `nuxt:module-preload-polyfill`, va deprecation warning tu dependency.
- Lan dau `cd backend; go test ./...` fail tai `backend/internal/handlers/admin_handler.go:379` vi request struct trong `UpdateEnterpriseKYB` chua co field `RejectReason` trong khi code da doc `req.RejectReason`.
- Da sua struct request KYB nhan them `json:"reject_reason"`, chay lai `gofmt` va `cd backend; go test ./...` pass.

Trang thai:

- Da xu ly.

### 2026-07-29 - Hien canh bao KYB doanh nghiep ngay sau khi bam dang nhap

Hien tuong / Yeu cau:

- Khi tai khoan doanh nghiep chua duoc duyet KYB dang nhap, canh bao chi hien sau khi trang nha tuyen dung duoc tai lai.
- Nguoi dung can thay thong bao ngay tai trang dang nhap sau khi bam nut dang nhap.

Nguyen nhan:

- `AuthLoginExperience` dang login thanh cong roi dieu huong ngay theo role.
- Canh bao KYB chu yeu nam trong enterprise layout, nen phai doi trang moi thay thong tin.

Cach sua:

- Them trang thai `loginNotice` tren form dang nhap voi giao dien canh bao mau amber.
- Sau khi `authStore.login()` thanh cong, neu role la `ENTERPRISE` va `enterpriseApproved` la false thi hien canh bao inline ngay, dong thoi goi toast warning.
- Doi mot nhip ngan truoc khi dieu huong sang trang nha tuyen dung de thong bao hien ro sau thao tac bam dang nhap.
- Giu nguyen rule backend: KYB chua duyet khong chan login; chi `INACTIVE` va `BANNED` moi chan phien dang nhap.
- Cap nhat `docs/architecture.md` de ghi lai hanh vi frontend auth moi.

File lien quan:

- `frontend/app/components/AuthLoginExperience.vue`
- `docs/architecture.md`
- `PROJECT_CHANGELOG.md`

Kiem tra:

- `cd frontend; npm.cmd run build` pass. Build con canh bao co san ve duplicate auto-import `useToast`, sourcemap cua `nuxt:module-preload-polyfill`, va deprecation warning tu dependency.
- `git -c safe.directory=D:/GOLANG/QuickWork diff --check -- frontend/app/components/AuthLoginExperience.vue docs/architecture.md PROJECT_CHANGELOG.md` pass, chi co canh bao LF/CRLF tren Windows.

Trang thai:

- Da xu ly.
# 2026-08-13 — Enterprise workspace redesign and persisted navigation

- Refined the Enterprise sidebar while preserving active routes, removed the duplicate inactive company-profile item, and persisted collapsed/applicant-group state in the SSR-safe `quickwork:enterprise-ui` record.
- Reworked Enterprise Message Center into a viewport-bound 30/45/25 desktop layout with independent conversation, message, and candidate-panel scrolling.
- Replaced the company-profile placeholder in Enterprise Settings with a responsive company hero, real-field editing, legal/KYB context, calculated completion, and explicit developing states for unsupported backend fields.
- Verified with frontend `npm.cmd run typecheck` and `npm.cmd run build`.

# 2026-08-19 — Recruiter settings cleanup and company logo identity

- Removed the unsupported pre-application CV-download option and the notification-settings accordion from Enterprise account settings.
- Updated the Enterprise layout to load the persisted company profile, normalize relative logo URLs, and reuse the real logo in both header and sidebar identity surfaces.
- Kept company initials as the fallback when no logo exists or an image cannot be loaded.

# 2026-08-19 — Student homepage company logos

- Reused the preloaded `enterprise_profile.logo_url` mapping for homepage job cards and hover detail previews.
- Added a shared homepage company-logo renderer with contained image sizing, backend-relative URL resolution, and automatic initials fallback for missing or failed images.
- Removed the untracked generated `jobDisplay.js` copy that could shadow the current TypeScript mapping at runtime.

# 2026-08-22 — Remove duplicate Nuxt auto-import warnings

- Excluded legacy same-name JavaScript artifacts for maintained TypeScript composables and utilities from Nuxt's auto-import scan.
- Kept the files on disk to avoid deleting unrelated local work while ensuring Nuxt consistently selects the TypeScript sources.
- Verified the backend, public Platform Settings endpoint, authenticated Admin Settings endpoint, frontend typecheck, and production build locally.

# 2026-08-24 — Silence expected empty Admin Settings lookup

- Replaced the singleton `First` lookup with a `Find` plus `RowsAffected` check so an unconfigured `system_settings` table returns defaults without GORM logging `record not found` as an error.
- Added regression coverage that preserves `version = 0`, `configured = false`, and verifies the expected first-run lookup produces no error log.

# 2026-08-24 — Hybrid AI Job Matching for the student homepage

- Added protected `GET /api/v1/student/job-recommendations` for approved jobs with available slots, with `limit` validation and explicit `refresh=true` cache bypass.
- Added a deterministic seven-criterion scorer with centralized weights, neutral missing-data behavior, Vietnamese text/address normalization, formatted VND parsing, and stable descending ordering.
- Added an optional OpenAI Responses provider with strict structured output. One request evaluates the deterministic top-20 batch; no student identity/contact fields or raw CV are sent, and missing configuration/provider failure keeps deterministic results.
- Added Redis caching with a 45-minute default TTL and input fingerprint so profile/job changes invalidate stale output without database persistence or migration.
- Updated the authenticated student homepage to use personalized results, preserve backend rank while filtering, show match score and strengths/gaps, prompt incomplete profiles, and fall back to public jobs if the recommendation endpoint fails. Guest and non-student behavior is unchanged.
- Expanded the authenticated `/student` board to request up to 100 scored jobs while AI remains capped to one top-20 batch. Added default `Phù hợp nhất` sorting and a shared hover/focus score panel showing all seven criterion scores, weights, contributions, strengths, and gaps on both homepage and full-list cards.
- Added unit coverage for scoring weights, neutral values, location normalization, VND salary parsing, AI success/failure, descending sort, cache hit, refresh bypass, and fingerprint invalidation.
- Verification: focused job-matching tests, `go test ./...`, frontend `npm run typecheck`, frontend `npm run build`, and targeted `git diff --check` pass. Nuxt build retains only existing sourcemap/dependency deprecation warnings.

# 2026-08-24 — Stabilize the student match-score panel

- Replaced the card-bound absolute score tooltip with a body-teleported, viewport-aware fixed panel that selects an available position above or below the badge and remains usable inside clipped card/header layouts.
- Simplified criterion details to `score/10`, kept the explanatory subtitle directly below the heading, and removed weighted contribution formulas plus the redundant total formula row.
- Kept the panel open while its badge or content is hovered/focused and paused homepage auto-pagination while any score panel is visible.

# 2026-08-24 — Student application tracking workspace

- Activated the student sidebar `Ứng tuyển của tôi` destination at `/student/applications` and built a responsive master-detail workspace based on the supplied reference.
- Added real summary counts, accent-insensitive search, status/time filters, five-item pagination, persisted application/interview/result timeline, upcoming interview details, offer/rejection states, job skills, and employer notes.
- Reused the existing applied-jobs and conversation APIs: one list request on page mount with no polling, while opening or creating the application conversation only happens after the student presses `Nhắn tin`.
- Added loading, request-error, no-application, and no-filter-result states; production typecheck and Nuxt build pass.

# 2026-08-24 — Student applications and profile editor polish

- Kept the student application status controls visible by bounding the search field, replaced the time filter with the rounded shared select, and hid the submitted-profile update date until persisted employer activity exists.
- Redesigned profile add/edit forms into clearer sections, improved action-button hover/focus states, and replaced native deletion prompts with an accessible application-styled confirmation dialog.
- Hid the experience end-date field while `Tôi đang làm việc tại đây` is selected without discarding its in-dialog value.
- Grouped selected and available skills by category and added authenticated student support for creating or reusing a skill under an existing or newly created category.

# 2026-08-24 — Rounded profile dropdown and explicit skill-category creation

- Replaced the native skill-category select in the student profile editor with the shared rounded dropdown using a dedicated form size; its trigger, menu, and each option now match the rounded input cards.
- Increased label-to-control spacing across profile dialogs so focus rings and input content no longer overlap field labels.
- Added a visible toggle between choosing an existing category and creating a new category with its first skill, with distinct guidance, validation, and action text for each mode.
- Fixed the empty category menu by converting skill-catalog categories to the shared select's `{ value, label }` option contract and accepting both lower- and upper-case relation ID shapes.
- Aligned the skill-name and category columns with equal label, control, and helper rows; moved scrolling inside the clipped rounded dialog shell and added rounded scrollbar tracks/thumbs for profile edit surfaces.

# 2026-08-24 — Student profile action, date, and current-work alignment polish

- Enlarged profile add/edit/delete controls and added stronger color-backed hover/focus states with immediate labels so each icon's purpose is clear.
- Formatted persisted experience and education ranges as `dd/mm/yy – dd/mm/yy`, while current records continue to show `Hiện tại`.
- Vertically centered the current-employment checkbox with its leading icon and explanatory text in the experience editor.

# 2026-08-24 — Make student profile section actions explicit

- Added a blue accent beside profile section headings and replaced icon-only heading actions with labeled `Thêm` or `Chỉnh sửa` pills.
- Added responsive text labels to per-record edit/delete actions; edit turns solid blue and delete turns solid red on hover or keyboard focus.

# 2026-08-24 — Restore compact icon-only student profile actions

- Removed visible `Thêm`, `Sửa`, and `Xóa` text from profile action controls while preserving accessible labels and tooltips.
- Kept 40px rounded icon targets with blue hover/focus feedback for add/edit and red feedback for delete.

# 2026-08-25 — Correct header and student profile title emphasis

- Reduced the public/student header navigation from bold to medium weight so it no longer competes with page content.
- Applied direct heavy-weight utility classes to the `Kỹ năng`, `Kinh nghiệm làm việc`, `Học vấn`, and `Tài liệu & Portfolio` headings so dynamically rendered section titles display consistently.
- Moved icon-action styling to direct utilities and deep tooltip selectors so add/edit/delete hover colors work inside the render-function child components.
