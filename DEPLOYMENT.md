# QuickWork Production Deployment

Tai lieu nay mo ta hai dich den production: mot VPS chay Docker Compose va Render Blueprint. Ca hai dung cung Dockerfile; Render thay Nginx cong khai bang Nuxt server proxy va private network duoc quan ly.

## Kien truc

```text
Nguoi dung
  -> Domain / DNS
  -> IP public cua VPS
  -> Nginx :80/:443
       /          -> frontend:3000
       /api/      -> backend:8080
       /uploads/  -> backend:8080
                       -> mysql:3306
                       -> redis:6379
                       -> rabbitmq:5672
```

Chi Nginx publish cong 80 va 443. MySQL, Redis va RabbitMQ chi nam trong Docker network `data` co `internal: true`. Frontend/backend duoc noi voi Nginx qua network `edge`.

## File production

- `backend/Dockerfile`: build Go binary bang multi-stage build va chay bang user `quickwork`.
- `frontend/Dockerfile`: `npm ci`, `nuxt build`, sau do chay `node .output/server/index.mjs` bang user `node`.
- `compose.yaml`: dinh nghia sau service, healthcheck, network va volume.
- `compose.production.yaml`: publish HTTPS va ap dung restart policy.
- `deploy/nginx/quickwork.conf`: terminate TLS va reverse proxy.
- `.env.production.example`: danh sach bien can dien, khong chua secret that.
- `render.yaml`: Blueprint Render cho frontend public, API private, MySQL, Key Value, RabbitMQ va ClamAV.

Volume duoc giu lai khi container duoc tao lai:

- `mysql_data`
- `redis_data`
- `rabbitmq_data`
- `uploads_data`

## Kiem thu local (giai doan 2)

Dieu kien: Docker Desktop/Docker Engine dang chay va cac cong loopback `80`, `15672` chua bi tien trinh khac chiem dung.

Tao file bien moi truong local bi Git bo qua:

```powershell
Copy-Item .env.local.example .env
```

`compose.override.yaml` duoc Docker Compose nap tu dong khi chay cac lenh ngan ben duoi. Override nay dung Nginx HTTP local, publish `127.0.0.1:80` va RabbitMQ Management `127.0.0.1:15672`; MySQL, Redis va AMQP van khong duoc publish ra host.

```bash
docker compose config --quiet
docker compose build
docker compose up -d
docker compose ps
docker compose logs -f backend
```

Nhan `Ctrl+C` de dung theo doi log; container van tiep tuc chay. Sau khi tat ca service bao `healthy`, kiem tra:

- `http://localhost`
- `http://localhost/api/v1/jobs`
- `http://localhost:15672`

Tai khoan RabbitMQ local nam trong file `.env`; cac gia tri trong `.env.local.example` chi la mac dinh development. Dung lenh sau de xac nhan consumer:

```bash
docker compose exec -T rabbitmq rabbitmqctl list_queues name messages consumers
```

Log `No .env file found in runtime directory` la binh thuong trong container vi Compose inject bien moi truong thay vi copy file `.env` vao image. Log `record not found` trong lan seed dau la truy van kiem tra truoc khi tao du lieu va phai duoc theo sau boi `Database seed completed`. Can cau hinh `CLOUDINARY_URL` neu muon kiem thu upload.

## Chia se demo bang Cloudflare Quick Tunnel

Quick Tunnel chi phu hop demo/nghien cuu. May Windows, Docker Desktop va container QuickWork phai tiep tuc chay trong suot luc nguoi dung truy cap.

Chay mot lenh tu thu muc goc:

```powershell
.\scripts\start-quick-tunnel.ps1
```

Script se:

1. tao `.env` tu `.env.local.example` neu chua co;
2. dat API trinh duyet thanh duong dan cung origin `/api/v1`;
3. dat API SSR thanh hostname Docker noi bo `http://backend:8080/api/v1`;
4. build/khoi dong QuickWork, chi publish Nginx tren loopback;
5. tao lai container `cloudflared`, lay URL HTTPS ngau nhien va kiem tra `/api/v1/jobs` qua Internet.

Lan chay sau co the bo qua build neu code khong thay doi:

```powershell
.\scripts\start-quick-tunnel.ps1 -NoBuild
```

Dung rieng tunnel ma van giu stack local:

```powershell
.\scripts\stop-quick-tunnel.ps1
```

`compose.tunnel.yaml` chi gan `cloudflared` vao network `edge` va proxy `http://nginx:80`. Backend, MySQL, Redis va RabbitMQ khong duoc publish truc tiep. URL `*.trycloudflare.com` thay doi moi khi tao lai container. Quick Tunnel khong co SLA, gioi han 200 request dang xu ly dong thoi va khong ho tro SSE; xem [Cloudflare Quick Tunnels](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/trycloudflare/).

Google OAuth khong phu hop voi hostname ngau nhien neu redirect URI chua duoc dang ky tai Google. Email/mat khau va cac API cung origin van hoat dong; muon OAuth hoat dong on dinh, dung Named Tunnel/domain co dinh va cap nhat `GOOGLE_REDIRECT_URI`.

Khong khoi dong dong thoi `docker-compose.rabbitmq.yml` va full stack vi hai cau hinh cung dung cong `15672`/broker local. Dung `docker compose down` de dung stack ma giu named volume; chi dung `docker compose down -v` khi chu dong muon xoa du lieu local.

## Trien khai bang Render Blueprint

`render.yaml` tao mot topology production trong region Singapore:

```text
Internet
  -> quickwork-web (Render Web Service)
       /api/*, /uploads/* -> Nuxt server proxy
                             -> quickwork-api (private service)
                                  -> MySQL + Key Value + RabbitMQ + ClamAV
                                  -> Cloudinary
```

Backend khong co URL public. Trinh duyet chi goi same-origin `/api/v1`, vi vay cookie `HttpOnly`, `Secure`, `SameSite=Strict` van hoat dong tren hostname `onrender.com`. `NUXT_API_BASE_INTERNAL` va `NUXT_API_PROXY_TARGET` duoc Blueprint lay tu `hostport` private cua backend. Backend tu dong doc `PORT` cua Render, `REDIS_URL` cua managed Key Value, va tao URL AMQP an toan tu cac bien RabbitMQ rieng le.

Blueprint nay tao private service, managed Key Value va persistent disk co tinh phi. Render hien chi phi truoc khi nguoi dung xac nhan; khong deploy neu chua chap nhan chi phi.

1. Commit va push `render.yaml` cung source len GitHub.
2. Trong Render Dashboard, chon **New -> Blueprint**.
3. Ket noi repository QuickWork, chon branch chua thay doi nay va giu Blueprint path la `render.yaml`.
4. Tai man hinh khoi tao, dien hai bien `sync: false`:
   - `ADMIN_IP_ALLOWLIST`: IPv4/CIDR tin cay cua quan tri vien, vi du `203.0.113.10/32`.
   - `CLOUDINARY_URL`: `cloudinary://api_key:api_secret@cloud_name`.
5. Xem danh sach service/chi phi, sau do chon **Deploy Blueprint**.
6. Cho MySQL, Key Value, RabbitMQ va ClamAV san sang; backend se chay migration, sau do frontend moi pass health check.
7. Mo URL cua `quickwork-web` va kiem tra `/api/v1/jobs`. Khong dung URL private cua `quickwork-api` tren trinh duyet.

Secret MySQL, RabbitMQ, JWT va admin duoc Render tao bang `generateValue` va truyen noi bo bang `fromService`; khong copy chung vao Git. `CORS_ALLOWED_ORIGINS` lay hostname public do Render cap cho frontend va backend chuan hoa thanh HTTPS.

Google OAuth va OpenAI la tuy chon, khong dat secret rong trong Blueprint. Neu can, them thu cong vao Environment cua `quickwork-api`:

```text
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI=https://<frontend-host>/auth/google/callback
OPENAI_API_KEY
```

Sau khi gan custom domain, cap nhat Google redirect URI. API van giu same-origin qua proxy frontend; khong doi `NUXT_PUBLIC_API_BASE=/api/v1`.

Rollback code tren Render khong rollback schema MySQL. Truoc migration co rui ro, tao `mysqldump` rieng; snapshot disk khong thay the backup logic cua database.

## Dieu kien tren VPS

1. Docker Engine va Docker Compose v2.
2. Domain co ban ghi A/AAAA tro ve IP public cua VPS.
3. Firewall mo TCP 80 va 443; khong mo 3306, 6379, 5672 hay 15672.
4. Chung chi TLS va private key da ton tai tren host. Duong dan mac dinh trong file mau phu hop voi Certbot, nhung viec cap/gia han chung chi nam ngoai giai doan 1.
5. Thu muc project chi co source; khong copy file `.env` local len image.

## Chuan bi bien moi truong

```bash
cp .env.production.example .env.production
```

Sua tat ca gia tri `CHANGE_ME`, domain, redirect URI va duong dan TLS. Tao secret dai, ngau nhien va khac nhau cho MySQL, Redis, RabbitMQ, admin va JWT.

`CLOUDINARY_URL` la bat buoc va co dang `cloudinary://API_KEY:API_SECRET@CLOUD_NAME`. Khong dua URL that vao Git. Backend production se tu choi khoi dong neu URL rong/sai dinh dang/placeholder.

Tao hai file secret ngoai Git:

```bash
mkdir -p secrets
chmod 700 secrets
openssl rand -base64 48 > secrets/restic_password.txt
chmod 600 secrets/restic_password.txt
```

Tao `secrets/aws_credentials` theo dinh dang credentials cua S3 provider, dat quyen `600`, sau do sua `RESTIC_REPOSITORY` tro den bucket nam ngoai VPS. Khong dat noi dung hai secret nay trong `.env.production`.

`RABBITMQ_URL` phai dung hostname service `rabbitmq`; mat khau trong URL phai dong bo voi `RABBITMQ_DEFAULT_PASS` va URL-encode neu co ky tu dac biet.

`DB_SEED_ENABLED=false` ngan backend chen user/job demo khi khoi dong production. Chi bat bien nay cho moi truong demo duoc kiem soat.

Khong commit file that:

```bash
git check-ignore .env.production
```

## Kiem tra truoc khi khoi dong

```bash
docker compose \
  --env-file .env.production \
  -f compose.yaml \
  -f compose.production.yaml \
  config --quiet
```

Build hai image cua ung dung:

```bash
docker compose \
  --env-file .env.production \
  -f compose.yaml \
  -f compose.production.yaml \
  build backend frontend
```

## Khoi dong

```bash
docker compose \
  --env-file .env.production \
  -f compose.yaml \
  -f compose.production.yaml \
  up -d
```

Theo doi trang thai va log:

```bash
docker compose --env-file .env.production -f compose.yaml -f compose.production.yaml ps
docker compose --env-file .env.production -f compose.yaml -f compose.production.yaml logs -f --tail=200 nginx frontend backend
```

Kiem tra:

```bash
curl --fail --silent --show-error https://jobs.example.com/ > /dev/null
curl --fail --silent --show-error https://jobs.example.com/api/v1/jobs > /dev/null
```

Thay `jobs.example.com` bang domain that.

## Cap nhat phien ban

```bash
git pull
docker compose --env-file .env.production -f compose.yaml -f compose.production.yaml build backend frontend
docker compose --env-file .env.production -f compose.yaml -f compose.production.yaml up -d
```

Compose chi tao lai service co thay doi va giu nguyen named volume.

## Backup va khoi phuc

Service `backup` moi 24 gio tao MySQL dump transaction-consistent, dong goi `uploads_data`, ma hoa va day snapshot bang restic ra repository ngoai VPS. Retention mac dinh: 7 ngay, 4 tuan, 12 thang. Named volume khong duoc xem la backup.

Kiem tra snapshot dinh ky:

```bash
docker compose --env-file .env.production -f compose.yaml -f compose.production.yaml exec backup restic snapshots
```

Can thuc hanh restore tren may rieng dinh ky; mot backup chua tung restore thu chua duoc xem la da xac minh.

RabbitMQ Management image duoc dung de co cong cu quan tri, nhung cong 15672 khong duoc publish. Neu can xem tam thoi, dung SSH tunnel hoac mot override gioi han IP thay vi mo cong cong khai.

## Gioi han giai doan 1

- Chua tu dong hoa cap/gia han TLS.
- Chua co CI/CD, registry image hay rolling deployment.
- Chua co monitoring, alerting, log aggregation hay admin 2FA. Off-site backup da co service, nhung chi hoat dong sau khi operator cung cap repository va secret files that.
- Docker Compose phu hop mot VPS; khi can multi-node/failover can danh gia orchestrator va database managed.
