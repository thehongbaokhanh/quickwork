# QuickWork Frontend

Nuxt/Vue frontend for QuickWork.

Project-level documentation lives in `../docs/`.

Useful docs:

- `../docs/architecture.md`
- `../docs/api.md`
- `../docs/business-rules.md`
- `../docs/conventions.md`

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Default dev URL: `http://localhost:3000`

Backend API base defaults to `http://localhost:8080/api/v1` and can be changed with `NUXT_PUBLIC_API_BASE`.

## Build

```bash
npm run build
```

## Frontend Source Pointers

- API client: `app/services/api.ts`
- Auth store: `app/stores/auth.ts`
- Route guards: `app/middleware/*.ts`
- Pages: `app/pages/**/*.vue`
- Layouts: `app/layouts/*.vue`
- Shared UI: `app/components` and `app/components/ui`
