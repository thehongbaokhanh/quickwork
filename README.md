# QuickWork

QuickWork la nen tang ket noi viec lam ngan han/part-time cho sinh vien va doanh nghiep.

## Tai lieu du an

Bo tai lieu chinh nam trong `docs/` va duoc thiet ke theo huong AI-first documentation: de con nguoi va AI agent co the doc nhanh, biet source-of-truth, va biet can sua tai lieu nao khi code thay doi.

- `docs/README.md`: muc luc va cach dung bo tai lieu.
- `docs/project-overview.md`: tong quan hien trang du an, luong chay, tinh nang, API, database va source-of-truth.
- `docs/ai-first-documentation.md`: quy tac AI-first documentation.
- `docs/architecture.md`: kien truc he thong, entry points, flow doc source.
- `docs/backend-runtime-flow.md`: cach backend khoi dong, dang ky route, chay middleware va xu ly request.
- `docs/message-queue.md`: RabbitMQ, transactional outbox, retry, dead-letter queue va cach chay local.
- `docs/business-rules.md`: nghiep vu va invariant chinh.
- `docs/api.md`: route map, response shape, endpoint caveats.
- `docs/database.md`: model, table, enum, migration.
- `docs/conventions.md`: quy uoc code, docs, test va van hanh.
- `PROJECT_CHANGELOG.md`: lich su loi/thay doi/kiem tra.
- `AGENTS.md`: quy tac bat buoc cho AI agent khi lam viec trong repo.

## Stack chinh

- Backend: Go, Fiber, GORM, MySQL, Redis, RabbitMQ, JWT.
- Frontend: Nuxt/Vue, TypeScript, Pinia, TailwindCSS.
- API base local: `http://localhost:8080/api/v1`.

## Lenh thuong dung

Backend:

```bash
cd backend
go run ./cmd/api
go test ./...
```

RabbitMQ local (optional):

```bash
docker compose -f docker-compose.rabbitmq.yml up -d
```

Sau khi broker healthy, dat `MQ_ENABLED=true` trong bien moi truong backend. Management UI chay tai `http://localhost:15672`; thong tin dev mac dinh nam trong `backend/.env.example` va khong duoc dung cho production.

Frontend:

```bash
cd frontend
npm install
npm run dev
npm run build
```

## Nguyen tac tai lieu

- Doi route/API thi cap nhat `docs/api.md`.
- Doi model/schema/migration thi cap nhat `docs/database.md`.
- Doi luong nghiep vu/role/status/quyen truy cap thi cap nhat `docs/business-rules.md`.
- Doi kien truc/entry point/module boundaries thi cap nhat `docs/architecture.md`.
- Doi quy uoc code/test/docs thi cap nhat `docs/conventions.md` va neu can `AGENTS.md`.
- Sua loi hoac thay doi hanh vi dang ke thi ghi vao `PROJECT_CHANGELOG.md`.
