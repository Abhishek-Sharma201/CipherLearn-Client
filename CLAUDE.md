# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CipherLearn is a full-stack Smart Tuition Management Platform. Monorepo with separate `frontend/` and `backend/` directories (no workspace config — each has its own `package.json`).

## Commands

### Frontend (`frontend/`)
```bash
npm run dev          # Next.js dev server (port 3000)
npm run build        # Production build
npm run lint         # ESLint
```

### Backend (`backend/`)
```bash
npm run start:dev    # Dev server with hot reload via tsx watch (port 5000)
npm run build        # TypeScript compile to dist/
npm run prisma:g     # Generate Prisma client
npm run prisma:m:d   # Run Prisma migrations (dev)
```

No test framework is configured in either package.

## Architecture

### Frontend
- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Redux Toolkit + RTK Query** for state and API calls (`frontend/src/redux/`)
- **Tailwind CSS v4** with CSS variables for dark/light theming
- **Radix UI** primitives for accessible UI components (`frontend/src/components/ui/`)
- React Compiler enabled in `next.config.ts`
- Path alias: `@/*` → `./src/*`

**Route groups:**
- `(auth)` — public login/signup pages
- `(pages)` — protected dashboard pages with shared Sidebar/Navbar layout

**RTK Query pattern:** API slices live in `frontend/src/redux/slices/<feature>/<feature>Api.ts`. Base API config at `frontend/src/redux/api/api.ts` auto-injects Bearer token from Redux state and redirects to login on 401. Cache invalidation uses tag types defined in `redux/constants/tags.ts`.

### Backend
- **Express.js v5** + **TypeScript** (CommonJS)
- **Prisma 7** with PostgreSQL (`@prisma/adapter-pg`)
- **JWT auth** with token blacklist and account lockout
- **Cloudinary** for file storage (via Multer memory storage)
- **Winston** logging + **Morgan** HTTP logging

**Module pattern** — each feature in `backend/src/modules/` follows:
```
module/
├── controller.ts    # Request/response handling
├── service.ts       # Business logic + Prisma queries
├── route.ts         # Express routes + middleware
├── validation.ts    # Joi schemas
└── types.ts         # TypeScript interfaces
```

**Two API surfaces:**
- `/api/dashboard/*` — Admin/Teacher dashboard (web frontend)
- `/api/app/*` — Student/Teacher mobile app endpoints
- `/api/auth` — Admin/Teacher authentication

**Auth middleware guards** in `backend/src/modules/auth/middleware.ts`: `isAuthenticated`, `isAdmin`, `isAdminOrTeacher`, `isAppUser`, `isStudent`.

### Database
Prisma schema at `backend/prisma/schema.prisma`. Key patterns:
- Soft deletes via `isDeleted` flag on most models
- Audit fields: `createdBy`, `deletedBy`
- Generated client output: `backend/prisma/generated/prisma`

### Key Conventions
- `cn()` utility (`clsx` + `tailwind-merge`) for className composition
- `"use client"` directive required for client components
- Class-based controllers/services in backend
- Joi validation on all backend routes
- File uploads: Multer memory → Cloudinary (magic number validation, max 5 files × 10MB)

## Environment Variables

**Backend** `.env`: `APP_PORT`, `DB_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLOUDINARY_*`, `CLIENT_URL`, `QR_SECRET`, `SALT`

**Frontend** `.env.local`: `NEXT_PUBLIC_API_URL` (default: `http://localhost:5000/api`)

## Postman Collections

API collections in `postman/` directory for testing endpoints.
