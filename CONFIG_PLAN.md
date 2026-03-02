# CipherLearn — SaaS Configuration & Operations Plan

> **Authoritative reference.** Written after deep-reading every config file, auth flow,
> middleware, schema, and route in both `admin/` and `client/`.
> Supersedes `client/CONFIG_PLAN.md`.
>
> Last updated: 2026-03-02

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [The Two Codebases](#2-the-two-codebases)
3. [Client Auth Flows — Exactly How They Work](#3-client-auth-flows--exactly-how-they-work)
4. [Complete Environment Variable Reference](#4-complete-environment-variable-reference)
5. [Configuration Tiers](#5-configuration-tiers)
6. [Feature Flags — End-to-End](#6-feature-flags--end-to-end)
7. [Teacher Permissions — End-to-End](#7-teacher-permissions--end-to-end)
8. [What "Push Env Vars" Does — and the Full Gap](#8-what-push-env-vars-does--and-the-full-gap)
9. [Full Provisioning Flow (with DB Migration)](#9-full-provisioning-flow-with-db-migration)
10. [Post-Sale Setup — Complete Checklist](#10-post-sale-setup--complete-checklist)
11. [Testing Checklist](#11-testing-checklist)
12. [Is It Ready for Sale? — Honest Assessment](#12-is-it-ready-for-sale--honest-assessment)
13. [Known Issues & Bugs](#13-known-issues--bugs)
14. [Pricing & Feature Flag Mapping](#14-pricing--feature-flag-mapping)

---

## 1. System Architecture

```
╔══════════════════════════════════════════════════════════════════════╗
║  CipherLearn Admin Portal  (YOU operate — one instance)              ║
║                                                                      ║
║  admin/frontend (Vercel :3001)  ←→  admin/backend (Render :5001)    ║
║                                          ↕                           ║
║                                   cipherlearnadmin DB (Aiven)        ║
║                                   defaultdb DB (Aiven) ←─ cross-DB  ║
╚══════════════════════════════════════════════════════════════════════╝
          │  auto-provisions ↓
          │
╔═════════▼═════════════════════════════════════════════════════╗
║  Per-Class Deployment  (one per coaching class you sell)       ║
║                                                                ║
║  Vercel: cipherlearn-{slug}        → Next.js 16 Frontend       ║
║  Render: cipherlearn-{slug}-api    → Express 5 Backend         ║
║  Aiven:  cipherlearn-{slug}-db     → PostgreSQL Database       ║
║                                                                ║
║  Completely isolated. No shared DB. No tenantId. No risk.      ║
╚════════════════════════════════════════════════════════════════╝
```

**Design principles:**
- Each class is a **completely isolated deployment** — own Vercel, Render, Aiven
- **No shared DB, no `tenantId`** anywhere in the schema — zero cross-tenant risk
- Config in two tiers: **env vars** (deploy-time) and **AppSettings table** (runtime)
- All classes pull from the **same GitHub template repo** → push one commit, all classes update

---

## 2. The Two Codebases

### `client/` — The Template App (deployed once per class you sell)

```
client/
├── backend/
│   Port:     5000 (Render)
│   Entry:    src/index.ts → server.ts → routes.ts
│   Routes:   /api/auth          Admin/Teacher signup + login
│             /api/app/auth      Student + Teacher mobile app auth
│             /api/dashboard/*   Admin + Teacher web dashboard
│             /api/app/*         Student + Teacher app endpoints
│   DB:       Prisma 7 + @prisma/adapter-pg (Aiven PostgreSQL)
│   Auth:     JWT (single secret, all roles share it)
│   Security: Helmet, CORS, rate limiting, account lockout, token blacklist
│
└── frontend/
    Port:     3000 (Vercel)
    Entry:    src/app/layout.tsx → (auth)/ and (pages)/
    Config:   src/config/siteConfig.ts (reads NEXT_PUBLIC_* at build time)
    State:    Redux Toolkit + RTK Query
    Auth:     JWT stored in Redux + localStorage, auto-rehydrated on mount
    Guards:   (pages)/layout.tsx checks token expiry + auto-clears on expiry
```

### `admin/` — The Control Plane (you run this)

```
admin/
├── backend/    port 5001, manages classes, hosting, billing, config
└── frontend/   port 3001, dashboard for you to manage everything
```

---

## 3. Client Auth Flows — Exactly How They Work

### 3A. Dashboard Admin/Teacher Login

**Route:** `POST /api/auth/login`

```
1. Validate email + password in request body
2. prisma.user.findUnique({ where: { email } })
3. If user.password is null → throw "Password not set"
   NOTE: does NOT check isPasswordSet flag — only checks password existence
4. bcryptjs.compareSync(password, user.password)
5. Sign JWT: jwt.sign({ id, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
6. Return { user: { id, name, email, role }, token }

MISSING: No isPasswordSet=false check → no forced password change on first login
MISSING: No token blacklist check on login
```

**Route:** `POST /api/auth/logout`

```typescript
// service.auth.ts
async logout(token: string): Promise<void> {
  try {
    return;  // ← DOES NOTHING — token is NOT blacklisted
  } catch { return; }
}
```
> ⚠ Dashboard logout is a no-op. The JWT stays valid until expiry. This is a security gap.

**Route:** `POST /api/auth/request-password-reset`

```
1. Find user by email
2. Generate JWT token as reset token
3. console.log the token (no email sent!)
4. Return token in HTTP response body
→ This works for dev but is a security issue for production
```

**Route:** `POST /api/auth/signup` (Admin account creation)

```
1. isAdmin middleware: COMMENTED OUT — route is publicly accessible
2. checkAdminEmail(email): checks if email is in ADMIN_EMAILS env var
3. If ADMIN_EMAILS is empty string → empty array → ALL emails rejected
4. If email is in list → creates User with role=ADMIN, isPasswordSet=true
```

> `isAdmin` is commented out intentionally (no admin exists yet on first deploy).
> Protection is the `ADMIN_EMAILS` whitelist. **ADMIN_EMAILS must be set correctly.**

---

### 3B. Student/Teacher App Auth

**Different routes:** `/api/app/auth/*` (fully separate, has proper security)

```
Student first-time flow:
  POST /app/auth/check-enrollment   Check if email is in students table
  POST /app/auth/setup-password     Set password for the first time
                                    → logs LoginAttempt, sets isPasswordSet=true
  POST /app/auth/login              Normal login after password is set

Student forgot password:
  POST /app/auth/forgot-password    Sends OTP via NodeMailer (actually emails!)
  POST /app/auth/verify-otp         Verify OTP → returns reset token
  POST /app/auth/reset-password     Reset password with token

Token refresh:
  POST /app/auth/refresh-token      Refresh expired access token

Logout:
  POST /app/auth/logout             Blacklists token in token_blacklist table ✓
```

**Auth middleware on app routes checks token blacklist** (`isAppUser`, `isTeacher`, `isStudent`).
App auth is significantly more complete than dashboard auth.

---

### 3C. CORS Config (important for custom domains)

```typescript
// server.ts — exact origins allowed:
allowedOrigins = [
  config.APP.CLIENT_URL,     // From CLIENT_URL env var
  "http://localhost:3000",
  "http://localhost:3001",
]

// Also allows via regex:
/^https?:\/\/[^.]+\.cipherlearn\.com(:\d+)?$/  // Any *.cipherlearn.com subdomain
/^https?:\/\/localhost(:\d+)?$/                  // Any localhost port
```

> ⚠ Custom domains (e.g., `app.sharmacademy.com`) are NOT automatically allowed.
> You must set `CLIENT_URL=https://app.sharmacademy.com` on Render and redeploy.

---

## 4. Complete Environment Variable Reference

### 4A. Client Backend — ALL variables (`client/backend/src/config/env.config.ts`)

This is the authoritative list from the actual source code.

#### Application
| Variable | Default | Required | Notes |
|---|---|---|---|
| `APP_PORT` | `3000` | yes | Set to `5000` on Render |
| `APP_HOST` | `localhost` | yes | Set to `0.0.0.0` on Render |
| `NODE_ENV` | `development` | yes | Set to `production` |
| `CLIENT_URL` | `""` | **critical** | Vercel frontend URL (CORS) |
| `SALT` | `NaN` ⚠ | **critical** | Integer e.g. `10` — **no default!** |
| `ADMIN_EMAILS` | `""` | **critical** | Class owner's email — controls who can sign up as ADMIN |

> ⚠ `SALT` has **no default** — `Number(undefined) = NaN`. If not set, bcrypt will fail silently or throw. Always set it.

#### Database
| Variable | Default | Notes |
|---|---|---|
| `DB_URL` | `""` | Full Aiven connection URI — use this, not the individual parts |
| `DB_HOST` | `localhost` | Ignored when DB_URL is set (Prisma uses DB_URL) |
| `DB_PORT` | `5432` | Ignored when DB_URL is set |
| `DB_USER` | `user` | Ignored when DB_URL is set |
| `DB_PASSWORD` | `password` | Ignored when DB_URL is set |
| `DB_NAME` | `database` | Ignored when DB_URL is set |

#### JWT & Authentication
| Variable | Default | Notes |
|---|---|---|
| `JWT_SECRET` | `"your_jwt_secret"` ⚠ | **Must override** — shared across ALL roles (admin/teacher/student) |
| `JWT_EXPIRES_IN` | `1h` | Short-lived access token |
| `JWT_REFRESH_TOKEN_EXPIRES_IN` | `7d` | Refresh token TTL |
| `QR_SECRET` | Falls back to `JWT_SECRET` | Sign QR attendance tokens — set separately |

> ⚠ `JWT_SECRET` has a default placeholder. If not overridden, anyone who knows the default can forge tokens.

#### Account Security
| Variable | Default | Notes |
|---|---|---|
| `ACCOUNT_LOCKOUT_MAX_FAILED` | `5` | Failed login attempts before lockout |
| `ACCOUNT_LOCKOUT_DURATION_MINUTES` | `30` | Minutes to stay locked |
| `OTP_EXPIRY_MINUTES` | `10` | Student password reset OTP TTL |

#### Rate Limiting
| Variable | Default | Notes |
|---|---|---|
| `RATE_LIMIT_LOGIN_MAX` | `5` | Max login attempts |
| `RATE_LIMIT_LOGIN_WINDOW_MS` | `900000` | 15 min window |
| `RATE_LIMIT_PASSWORD_RESET_MAX` | `3` | Max password reset requests |
| `RATE_LIMIT_PASSWORD_RESET_WINDOW_MS` | `3600000` | 1 hour window |

#### Email (NodeMailer)
| Variable | Default | Notes |
|---|---|---|
| `NODE_MAILER_HOST` | `smtp.example.com` | SMTP host |
| `NODE_MAILER_PORT` | `587` | SMTP port |
| `NODE_MAILER_USER` | `""` | SMTP username |
| `NODE_MAILER_PASSWORD` | `""` | SMTP password (NOT `NODE_MAILER_PASS`) |
| `NODE_MAILER_FROM_EMAIL` | `noreply@cipherlearn.com` | Sender address (NOT `NODE_MAILER_FROM`) |
| `NODE_MAILER_FROM_NAME` | `CipherLearn` | Sender display name |

> Email is only used by the **student/app auth** flow (OTP for forgot password).
> Dashboard admin password reset does NOT send an email — it returns the token in the HTTP response.

#### File Storage (Cloudinary)
| Variable | Default | Notes |
|---|---|---|
| `CLOUDINARY_CLOUD_NAME` | `""` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | `""` | API key |
| `CLOUDINARY_API_SECRET` | `""` | API secret |

#### Class Branding (set by portal at provision time)
| Variable | Default | Notes |
|---|---|---|
| `CLASS_NAME` | `"CipherLearn"` | Also checks `SCHOOL_NAME` as fallback |
| `CLASS_LOGO_URL` | `""` | Also checks `SCHOOL_LOGO_URL` as fallback |
| `PRIMARY_COLOR` | `#0F766E` | Brand hex color |
| `ACCENT_COLOR` | `#F59E0B` | Accent hex color |

#### Feature Flags (set by portal at provision time)
| Variable | Default | Logic |
|---|---|---|
| `FEATURE_QR_ATTENDANCE` | ON | `!== "false"` — set to `"false"` to disable |
| `FEATURE_FEES` | ON | `!== "false"` |
| `FEATURE_ASSIGNMENTS` | ON | `!== "false"` |
| `FEATURE_STUDY_MATERIALS` | ON | `!== "false"` |
| `FEATURE_ANNOUNCEMENTS` | ON | `!== "false"` |
| `FEATURE_VIDEOS` | ON | `!== "false"` |

#### Instagram Automation (optional)
| Variable | Default | Notes |
|---|---|---|
| `INSTAGRAM_APP_ID` | `""` | Meta app ID |
| `INSTAGRAM_APP_SECRET` | `""` | Meta app secret |
| `INSTAGRAM_WEBHOOK_VERIFY_TOKEN` | `cipherlearn_ig_webhook_2026` | Change per deployment |
| `INSTAGRAM_REDIRECT_URI` | `""` | OAuth callback URL |

---

### 4B. Client Frontend — ALL variables (`client/frontend/src/config/siteConfig.ts`)

Read at Next.js **build time** (baked into the JS bundle). Require a **redeploy** to change.

| Variable | Default | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000/api` | Render backend URL — **must end in `/api`** |
| `NEXT_PUBLIC_APP_NAME` | `CipherLearn` | Class name (sidebar, login panel, titles) |
| `NEXT_PUBLIC_APP_TAGLINE` | `Teaching Platform` | Tagline below logo |
| `NEXT_PUBLIC_APP_DESCRIPTION` | `Comprehensive management…` | SEO meta description |
| `NEXT_PUBLIC_LOGO_URL` | `""` | Logo image URL — empty = use initials |
| `NEXT_PUBLIC_LOGO_INITIALS` | `CL` | 2-char fallback (max 2 chars) |
| `NEXT_PUBLIC_PRIMARY_COLOR` | `#0F766E` | Brand color — used in login gradient |
| `NEXT_PUBLIC_ACCENT_COLOR` | `#F59E0B` | Accent — used in login orb effects |
| `NEXT_PUBLIC_CONTACT_EMAIL` | `admin@cipherlearn.com` | Shown on error pages |
| `NEXT_PUBLIC_FEATURE_QR_ATTENDANCE` | ON | `!== "false"` |
| `NEXT_PUBLIC_FEATURE_FEES` | ON | `!== "false"` |
| `NEXT_PUBLIC_FEATURE_ASSIGNMENTS` | ON | `!== "false"` |
| `NEXT_PUBLIC_FEATURE_STUDY_MATERIALS` | ON | `!== "false"` |
| `NEXT_PUBLIC_FEATURE_ANNOUNCEMENTS` | ON | `!== "false"` |
| `NEXT_PUBLIC_FEATURE_VIDEOS` | ON | `!== "false"` |

---

### 4C. Admin Portal Backend (`admin/backend/.env`)

| Variable | Notes |
|---|---|
| `PORT` | `5001` |
| `DB_URL` | Admin DB (`cipherlearnadmin` on Aiven) |
| `CLIENT_DB_URL` | Client DB (`defaultdb` on Aiven) — for cross-DB user provisioning |
| `SUPER_ADMIN_JWT_SECRET` | Separate from client JWT_SECRET |
| `VERCEL_TOKEN` | Vercel account/team API token |
| `VERCEL_TEAM_ID` | Optional — if using Vercel Teams |
| `RENDER_API_KEY` | Render API key |
| `AIVEN_TOKEN` | Aiven API token |
| `AIVEN_PROJECT` | Aiven project name |

---

### 4D. Admin Portal — Provisioning Config (stored in DB via Settings page)

| Key | Example | Category |
|---|---|---|
| `provision.vercel.repo` | `myorg/client-app` | provisioning |
| `provision.render.repo` | `myorg/client-backend` | provisioning |
| `provision.render.buildCommand` | `npm install && npm run build` | provisioning |
| `provision.render.startCommand` | `npm start` | provisioning |
| `provision.aiven.plan` | `startup-4` | provisioning |
| `provision.aiven.cloud` | `google-asia-south1` | provisioning |

---

## 5. Configuration Tiers

```
Tier 1 — Deploy-Time (env vars)
  Who sets: Portal auto-provisions via Push Env Vars (4 vars) + manual (rest)
  When: At provisioning. Changing requires Vercel redeploy + Render redeploy.
  What:
    - NEXT_PUBLIC_* branding (name, logo, colors, tagline)
    - Feature flags (FEATURE_* and NEXT_PUBLIC_FEATURE_*)
    - Infrastructure (DB_URL, NEXT_PUBLIC_API_URL, CLIENT_URL)
    - Security (JWT_SECRET, QR_SECRET, SALT)
    - Email (NODE_MAILER_*)
    - ADMIN_EMAILS (who can sign up as admin)

Tier 2 — Runtime (AppSettings table, id=1)
  Who sets: Class admin via /settings page — no redeployment
  When: After first login, anytime
  What:
    - Class profile: className, classEmail, classPhone, classAddress, classWebsite
    - Teacher permissions: 9 boolean flags

Public endpoint (GET /api/app/settings — no auth required):
  Returns: Tier 1 branding from env + Tier 1 features from env + Tier 2 permissions from DB
  Used by: Mobile/student app to style login screen before authentication
```

---

## 6. Feature Flags — End-to-End

How a feature flag actually flows through the system (using Fees as example):

```
Portal Settings page → add FEATURE_FEES=false

↓ Push to Render env vars
Render: FEATURE_FEES=false
→ config.FEATURES.FEES = false (env.config.ts: !== "false" → false)
→ API routes check this and return 403 if disabled
→ GET /api/app/settings returns features.fees: false

↓ Push to Vercel env vars + redeploy
Vercel: NEXT_PUBLIC_FEATURE_FEES=false
→ siteConfig.features.fees = false (siteConfig.ts: !== "false" → false)
→ Sidebar hides /fees nav item (except for ADMIN role who sees everything)
→ Feature-gated pages show redirect/404

↓ Student app fetches GET /api/app/settings
→ features.fees: false
→ App hides fees tab before login
```

**Key point:** Feature flags are enforced at **both** frontend (sidebar/page visibility) and
backend (API 403). Disabling at one layer without the other creates inconsistency.

---

## 7. Teacher Permissions — End-to-End

```
Source of truth: AppSettings.teacherPermissions (JSON, DB table)

Defaults (conservative — baked into schema):
  canManageLectures:     true   → Create/edit/delete lectures
  canUploadNotes:        true   → Upload notes and documents
  canUploadVideos:       false  → Upload videos to resource hub
  canManageAssignments:  true   → Create + grade assignments
  canViewFees:           false  → Access fee data and receipts
  canManageStudyMaterials: false → Upload study materials
  canSendAnnouncements:  true   → Create and pin announcements
  canViewAnalytics:      false  → View dashboard analytics
  canExportData:         false  → Export student/fee data

How it flows:
  1. Admin goes to /settings → Teacher Permissions section
  2. Toggles permissions → PUT /api/dashboard/settings (isAdmin middleware)
  3. Frontend sidebar reads permissions on next fetch and shows/hides nav items
  4. GET /api/app/settings returns permissions (used by mobile app before login)

API protection:
  Currently stored and served, but individual API routes don't enforce permissions.
  Enforcement is advisory (frontend shows/hides) — routes don't check permissions.
  → Future: middleware that checks teacherPermissions per-endpoint
```

---

## 8. What "Push Env Vars" Does — and the Full Gap

### Currently auto-pushed (4 variables only)

`pushEnvVarsToClass()` in `admin/backend/src/modules/hosting/service.hosting.ts`:

| Variable | Source | Pushed To |
|---|---|---|
| `DATABASE_URL` | Aiven connection URI | Render (backend) |
| `NEXT_PUBLIC_API_URL` | Render service URL | Vercel (frontend) |
| `NEXT_PUBLIC_TENANT_SLUG` | Class slug | Vercel (frontend) |
| `NEXT_PUBLIC_APP_URL` | `https://{slug}.cipherlearn.vercel.app` | Vercel (frontend) |

### Must be set manually — the full gap

**On Render (backend) — set these after auto-provision:**

```bash
# ── CRITICAL (app won't start without these) ──────────────────────
APP_PORT=5000
APP_HOST=0.0.0.0
NODE_ENV=production
CLIENT_URL=https://cipherlearn-{slug}.vercel.app    # CORS origin
SALT=10                                             # No default — will break bcrypt if missing
ADMIN_EMAILS=owner@classname.com                    # Class owner's email — CRITICAL
JWT_SECRET=<openssl rand -hex 32>                   # Must be strong random secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_TOKEN_EXPIRES_IN=7d
QR_SECRET=<openssl rand -hex 16>                    # For QR attendance tokens

# ── BRANDING (mirrors frontend) ────────────────────────────────────
CLASS_NAME=Sharma Coaching Academy
CLASS_LOGO_URL=https://cdn.example.com/logo.png
PRIMARY_COLOR=#0F766E
ACCENT_COLOR=#F59E0B

# ── FEATURE FLAGS (all ON by default, set "false" to disable) ─────
FEATURE_QR_ATTENDANCE=true
FEATURE_FEES=true
FEATURE_ASSIGNMENTS=true
FEATURE_STUDY_MATERIALS=true
FEATURE_ANNOUNCEMENTS=true
FEATURE_VIDEOS=true

# ── FILE STORAGE ────────────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# ── EMAIL (needed for student OTP/forgot password) ─────────────────
NODE_MAILER_HOST=smtp.gmail.com
NODE_MAILER_PORT=587
NODE_MAILER_USER=noreply@classname.com
NODE_MAILER_PASSWORD=<app-password>                  # NOT NODE_MAILER_PASS
NODE_MAILER_FROM_EMAIL=noreply@classname.com         # NOT NODE_MAILER_FROM
NODE_MAILER_FROM_NAME=Sharma Coaching Academy

# ── OPTIONAL ────────────────────────────────────────────────────────
ACCOUNT_LOCKOUT_MAX_FAILED=5
ACCOUNT_LOCKOUT_DURATION_MINUTES=30
OTP_EXPIRY_MINUTES=10
```

**On Vercel (frontend) — set + redeploy:**

```bash
NEXT_PUBLIC_APP_NAME=Sharma Coaching Academy
NEXT_PUBLIC_APP_TAGLINE=Empowering Students Since 2020
NEXT_PUBLIC_LOGO_URL=https://cdn.example.com/logo.png
NEXT_PUBLIC_LOGO_INITIALS=SC
NEXT_PUBLIC_PRIMARY_COLOR=#0F766E
NEXT_PUBLIC_ACCENT_COLOR=#F59E0B
NEXT_PUBLIC_CONTACT_EMAIL=owner@sharma.com
NEXT_PUBLIC_FEATURE_QR_ATTENDANCE=true
NEXT_PUBLIC_FEATURE_FEES=true
NEXT_PUBLIC_FEATURE_ASSIGNMENTS=true
NEXT_PUBLIC_FEATURE_STUDY_MATERIALS=true
NEXT_PUBLIC_FEATURE_ANNOUNCEMENTS=true
NEXT_PUBLIC_FEATURE_VIDEOS=true
# DATABASE_URL is NOT needed on Vercel — frontend never touches DB directly
```

---

## 9. Full Provisioning Flow (with DB Migration)

This is the correct end-to-end flow including the critical DB migration step.

```
Step 1 — Portal auto-provisions
  POST /api/portal/classes  →  Classroom row in admin DB
                            →  UPSERT User in client DB (ADMIN, isPasswordSet=false)
                            →  Returns credentials

Step 2 — Auto-Provision button (Infrastructure tab)
  provisionClass()
  → Vercel: create project    (instant — from template repo)
  → Render: create service    (instant — queued, no DB yet)
  → Aiven:  create PostgreSQL (REBUILDING — 2-10 min)

Step 3 — Wait for Aiven RUNNING
  Refresh Status button → polls aivenGetService() → status: RUNNING ✓

Step 4 — Push Env Vars
  pushEnvVarsToClass()
  → Pushes DATABASE_URL + NEXT_PUBLIC_API_URL + slug + app URL
  → Render gets DATABASE_URL (connects to Aiven DB)
  → Vercel gets NEXT_PUBLIC_API_URL (calls Render backend)

Step 5 — ⚠ CRITICAL: Run DB Migration
  The database exists but has NO TABLES yet.
  Someone must run: npx prisma migrate deploy
  OR for dev: npm run prisma:m:d

  Options:
  A) SSH into Render service → run `npx prisma migrate deploy`
  B) Add a startup migration in package.json:
     "start": "npx prisma migrate deploy && node dist/index.js"
  C) Use Render's Deploy Hook to run a one-time command

  WITHOUT THIS STEP: backend starts, connects to DB, every API call fails with
  "table does not exist" errors.

Step 6 — Set remaining env vars manually
  On Render: SALT, JWT_SECRET, ADMIN_EMAILS, CLIENT_URL, CLOUDINARY_*, NODE_MAILER_*
  On Vercel: All NEXT_PUBLIC_APP_* + NEXT_PUBLIC_FEATURE_*
  → Both auto-redeploy after env var changes

Step 7 — Admin signs up
  Navigate to https://cipherlearn-{slug}.vercel.app/signup
  Enter name, email (must match ADMIN_EMAILS), password
  → POST /api/auth/signup → checkAdminEmail() → create User(role=ADMIN)

Step 8 — Admin logs in + configures
  Login → GET /api/dashboard/settings → Class Profile form
  Fill: classEmail, classPhone, classAddress, classWebsite
  Optionally adjust teacher permissions

Step 9 — Hand off to client
  URL + credentials → client is live
```

---

## 10. Post-Sale Setup — Complete Checklist

### PHASE 0 — One-Time Platform Setup (done once ever)

```
□ Deploy admin portal
    backend → Render (DB_URL, CLIENT_DB_URL, SUPER_ADMIN_JWT_SECRET, PORT=5001)
    frontend → Vercel (NEXT_PUBLIC_API_URL pointing to Render)

□ Seed OWNER account
    POST https://admin-api.render.com/api/portal/auth/seed
    { "name": "...", "email": "...", "password": "..." }

□ Settings → Add platform API keys
    VERCEL_TOKEN, RENDER_API_KEY, AIVEN_TOKEN, AIVEN_PROJECT

□ Settings → Provisioning category → add 6 keys
    provision.vercel.repo         = myorg/client-app
    provision.render.repo         = myorg/client-backend
    provision.render.buildCommand = npm install && npm run build
    provision.render.startCommand = npx prisma migrate deploy && npm start
                                    ↑ Important: runs migrations on every start
    provision.aiven.plan          = startup-4
    provision.aiven.cloud         = google-asia-south1

□ In Vercel: connect GitHub org to Vercel account
    So API can create projects linked to the repo
```

> **Tip:** Set `startCommand` to `npx prisma migrate deploy && npm start` so migrations
> run automatically on every Render deployment. This eliminates the manual migration step.

---

### PHASE 1 — Collect Client Info

```
□ Class full name
□ URL slug (lowercase, no spaces) e.g. "sharma"
□ Owner email (will become ADMIN_EMAILS)
□ Plan purchased
□ Brand: logo URL, primary color, accent color, initials
□ Features to enable/disable per plan
□ SMTP credentials OR confirm using shared SMTP
□ Cloudinary: shared account or dedicated?
```

---

### PHASE 2 — Create Class in Portal

```
□ Portal → Classes → New Class
    Fill all fields including slug, email, plan

□ Submit — note the generated credentials on success screen
    SAVE: owner email + temporary password

□ Note: portal creates User in client DB with:
    role=ADMIN, isPasswordSet=false, password=<hashed temp>
    → Admin CAN log in with this immediately (isPasswordSet is not enforced on login)
```

---

### PHASE 3 — Infrastructure

```
□ Class detail → Infrastructure tab → "Auto-Provision"
    Vercel ✓ created, Render ✓ created, Aiven ✓ REBUILDING...

□ Refresh Status every 2 min → wait for Aiven: RUNNING

□ Push to All (Push Env Vars)
    DATABASE_URL → Render ✓
    NEXT_PUBLIC_API_URL → Vercel ✓
```

---

### PHASE 4 — Set Remaining Env Vars

**On Render → cipherlearn-{slug}-api → Environment:**

```
APP_PORT              = 5000
APP_HOST              = 0.0.0.0
NODE_ENV              = production
CLIENT_URL            = https://cipherlearn-{slug}.vercel.app
SALT                  = 10
ADMIN_EMAILS          = owner@classname.com
JWT_SECRET            = <openssl rand -hex 32>
JWT_EXPIRES_IN        = 1h
JWT_REFRESH_TOKEN_EXPIRES_IN = 7d
QR_SECRET             = <openssl rand -hex 16>
CLASS_NAME            = Sharma Coaching Academy
CLASS_LOGO_URL        = https://...
PRIMARY_COLOR         = #0F766E
ACCENT_COLOR          = #F59E0B
FEATURE_QR_ATTENDANCE = true
FEATURE_FEES          = true
FEATURE_ASSIGNMENTS   = true
FEATURE_STUDY_MATERIALS = true
FEATURE_ANNOUNCEMENTS = true
FEATURE_VIDEOS        = true
CLOUDINARY_CLOUD_NAME = ...
CLOUDINARY_API_KEY    = ...
CLOUDINARY_API_SECRET = ...
NODE_MAILER_HOST      = smtp.gmail.com
NODE_MAILER_PORT      = 587
NODE_MAILER_USER      = ...
NODE_MAILER_PASSWORD  = ...          ← correct var name
NODE_MAILER_FROM_EMAIL = noreply@classname.com  ← correct var name
NODE_MAILER_FROM_NAME  = Sharma Coaching Academy
```

**On Vercel → cipherlearn-{slug} → Settings → Environment Variables:**

```
NEXT_PUBLIC_APP_NAME              = Sharma Coaching Academy
NEXT_PUBLIC_APP_TAGLINE           = Empowering Students
NEXT_PUBLIC_LOGO_URL              = https://...
NEXT_PUBLIC_LOGO_INITIALS         = SC
NEXT_PUBLIC_PRIMARY_COLOR         = #0F766E
NEXT_PUBLIC_ACCENT_COLOR          = #F59E0B
NEXT_PUBLIC_CONTACT_EMAIL         = owner@sharma.com
NEXT_PUBLIC_FEATURE_QR_ATTENDANCE = true
NEXT_PUBLIC_FEATURE_FEES          = true
NEXT_PUBLIC_FEATURE_ASSIGNMENTS   = true
NEXT_PUBLIC_FEATURE_STUDY_MATERIALS = true
NEXT_PUBLIC_FEATURE_ANNOUNCEMENTS = true
NEXT_PUBLIC_FEATURE_VIDEOS        = true
```

Vercel: Redeploy after saving env vars (Vercel → Deployments → Redeploy latest).

---

### PHASE 5 — DB Migration (if not in startCommand)

```
□ Render → cipherlearn-{slug}-api → Shell (or deploy hook)
    npx prisma migrate deploy

OR — preferred: ensure startCommand includes migration:
    "npx prisma migrate deploy && npm start"
    Then just redeploy.
```

---

### PHASE 6 — Admin First Login

```
□ Navigate to https://cipherlearn-{slug}.vercel.app/login
□ Login with email + temporary password (from Phase 2)
□ Go to Settings → fill class profile (email, phone, address, website)
□ Go to Settings → Teacher Permissions → adjust per client's needs
□ Create first batch: /batches → New Batch
□ Test that all enabled features load correctly
```

---

### PHASE 7 — Hand Off

```
□ Give client:
    Login URL:   https://cipherlearn-{slug}.vercel.app/login
    Email:       owner@classname.com
    Password:    <temp password from Phase 2>

□ Record in portal:
    Payments tab → Add payment record
    Subscription tab → Set subscriptionEndsAt

□ Optionally schedule a 15-min onboarding call with the class owner
```

---

### PHASE 8 — Custom Domain (optional)

```
□ Vercel → cipherlearn-{slug} → Settings → Domains → Add domain
    e.g. app.sharmacademy.com

□ DNS provider → Add CNAME:
    app  →  cname.vercel-dns.com

□ Wait ~30 min for SSL cert

□ Update Render env:
    CLIENT_URL = https://app.sharmacademy.com
    Render auto-redeploys → CORS updated
```

---

## 11. Testing Checklist

### Infrastructure
```
□ GET https://cipherlearn-{slug}-api.onrender.com/
  → Returns "CipherLearn" (health check)

□ GET https://cipherlearn-{slug}-api.onrender.com/api/app/settings
  → Returns { class, branding, features, teacherPermissions }
  → branding.primaryColor = your chosen color (proves env vars are set)
  → features.fees = true/false (proves feature flags work)

□ https://cipherlearn-{slug}.vercel.app loads
  → Login page branding matches (class name, colors, logo)
```

### Admin Authentication
```
□ POST /api/auth/signup with ADMIN_EMAILS email → 201 Created
□ POST /api/auth/signup with non-whitelisted email → 500 "Only admin accounts..."
□ POST /api/auth/login with correct credentials → 200 + token
□ POST /api/auth/login with wrong password → 401
□ Dashboard loads after login (token valid)
□ Closing browser + reopening → session restored from localStorage
□ Wait for JWT_EXPIRES_IN → auto-redirect to /login
```

### Core Operations
```
□ Create a batch → appears in list
□ Enroll a student (single) → student appears in batch
□ Enroll students via CSV bulk upload
□ Create attendance sheet → mark students present/absent/late
□ Generate QR code → scan with phone → attendance marked automatically
□ Create fee structure → generate receipt → mark as PAID
□ Schedule a lecture → appears in calendar
□ Create a test → upload scores for students
□ Create an assignment → (enroll a student with app access to test submission)
□ Post announcement → visible on /announcements
□ Upload study material → visible on /resources
```

### Student App Flow
```
□ POST /api/app/auth/check-enrollment { email: "enrolled-student@email.com" }
  → { enrolled: true }

□ POST /api/app/auth/setup-password { email, password }
  → { success: true } (first time only)

□ POST /api/app/auth/login { email, password }
  → { user, token }

□ GET /api/app/fees (with student token)
  → Returns student's fee receipts

□ POST /api/app/auth/forgot-password { email }
  → Email with OTP received ← tests NodeMailer config

□ POST /api/app/auth/logout
  → Token blacklisted → subsequent requests fail with "revoked"
```

### Feature Flag Verification
```
□ Set FEATURE_FEES=false on Render → Save → Redeploy
□ GET /api/app/settings → features.fees = false ✓
□ Set NEXT_PUBLIC_FEATURE_FEES=false on Vercel → Redeploy
□ /fees page → hidden from sidebar (non-admin) ✓
□ Reset both to true, redeploy to restore
```

---

## 12. Is It Ready for Sale? — Honest Assessment

### ✅ Green — Works well, production ready

| Area | Status |
|---|---|
| Core architecture (isolated deployments) | ✅ Solid |
| Feature flags (frontend + backend) | ✅ Works |
| Teacher permissions (runtime) | ✅ Works |
| All major features implemented | ✅ Complete |
| Rate limiting (login, password reset) | ✅ Done |
| Account lockout after failed attempts | ✅ Done |
| CORS + Helmet security headers | ✅ Done |
| File uploads via Cloudinary | ✅ Done |
| Token cleanup scheduler | ✅ Done |
| Student app auth (complete OTP flow) | ✅ Complete |
| Notification preferences model | ✅ Done |
| White-label branding (zero code changes) | ✅ Done |

---

### 🔴 Red — Blockers before first real sale

| Issue | Impact | Fix |
|---|---|---|
| **No DB migration on deploy** | DB has no tables — ALL API calls fail | Add `npx prisma migrate deploy &&` before `npm start` in Render startCommand |
| **Dashboard logout is a no-op** | Logged-out admin JWTs remain valid until expiry | Add token to `TokenBlacklist` in `service.auth.ts logout()` |
| **`SALT` has no default** | bcrypt throws/returns garbage if SALT env missing | Must always set `SALT=10` (document clearly) |
| **Admin password reset returns token in HTTP response** | Token exposed in browser/logs | Should send email; for now return nothing, only log |
| **`JWT_SECRET` defaults to `"your_jwt_secret"`** | Anyone can forge tokens on default deployments | Must set strong secret — document as critical |

---

### 🟡 Yellow — Fix soon after first sale

| Issue | Impact |
|---|---|
| `isAdmin`/`isAdminOrTeacher` don't check TokenBlacklist | Dashboard tokens can't be revoked via logout |
| Admin password reset doesn't send an email | Class admin has no self-service password reset |
| Teacher permission flags not enforced at API level | Permissions only advisory (UI only) |
| `console.log` in `service.auth.ts` (should be `logger`) | Logs miss structured logging |
| No `.env.example` in `client/` | Makes manual setup harder — needs documentation |
| `isPasswordSet=false` not enforced on dashboard login | No forced password change on first login |
| No test suite | Regressions are invisible |
| CORS wildcard `*.cipherlearn.com` | Any compromised subdomain can hit any backend |

---

### Verdict

**Not quite ready for a paid sale.** The blockers are real:

1. Without DB migration in the start command, the backend will start but every
   API call will crash with "relation does not exist" — the class admin can't
   do anything.

2. Without a strong `JWT_SECRET`, anyone who knows the default can forge tokens
   for any class where the secret wasn't changed.

3. Dashboard logout leaving JWTs active is a trust issue for a school admin.

**Fix the 🔴 reds** (30 min of changes) and it's ready for beta customers.
The 🟡 yellows can be shipped in the first maintenance release.

---

## 13. Known Issues & Bugs

### Bug 1 — `SALT` has no fallback
**File:** `client/backend/src/config/env.config.ts:11`
```typescript
SALT: Number(process.env.SALT),  // Number(undefined) = NaN
```
**Fix:** `SALT: Number(process.env.SALT) || 10`

### Bug 2 — Dashboard logout is a no-op
**File:** `client/backend/src/modules/auth/service.auth.ts:103-110`
```typescript
async logout(token: string): Promise<void> {
  try { return; }  // Does nothing
}
```
**Fix:** Add `prisma.tokenBlacklist.create({ data: { token, userId, expiresAt, reason: "logout" } })`

### Bug 3 — Admin password reset leaks token in HTTP response
**File:** `client/backend/src/modules/auth/controller.auth.ts:121-125`
```typescript
return res.status(200).json({
  token: result.resetToken,  // Don't return this
});
```
**Fix:** Don't return token; send via email using NodeMailer.

### Bug 4 — `isAdmin` middleware commented out on signup
**File:** `client/backend/src/modules/auth/routes.auth.ts:12`
```typescript
// isAdmin,  ← commented out
```
**Intentional** — needed for first-time setup. But ADMIN_EMAILS must be set.
**Risk:** If ADMIN_EMAILS is not set, signup is blocked for everyone (no admin can be created).

### Bug 5 — `isAdmin`/`isAdminOrTeacher` don't check TokenBlacklist
**File:** `client/backend/src/modules/auth/middleware.ts`
**Fix:** Add `isTokenBlacklisted(token)` check same as in `isAppUser`.

### Bug 6 — No env.example file
No template to guide manual setup. Must rely on this document.
**Fix:** Create `client/backend/.env.example` with all vars and descriptions.

---

## 14. Pricing & Feature Flag Mapping

| Feature | FREE | STARTER | PRO | ENTERPRISE |
|---|---|---|---|---|
| Max students | 30 | 100 | 500 | Unlimited |
| Max batches | 1 | 3 | 10 | Unlimited |
| Lectures + Tests | ✓ | ✓ | ✓ | ✓ |
| Announcements | ✓ | ✓ | ✓ | ✓ |
| QR Attendance | ✗ | ✓ | ✓ | ✓ |
| Fee Management | ✗ | ✓ | ✓ | ✓ |
| Assignments | ✗ | ✓ | ✓ | ✓ |
| Study Materials | ✗ | ✓ | ✓ | ✓ |
| YouTube Videos | ✗ | ✗ | ✓ | ✓ |
| Instagram Auto | ✗ | ✗ | ✓ | ✓ |
| Custom Domain | ✗ | ✗ | ✓ | ✓ |
| Cloudinary | Shared | Shared | Per-class | Per-class |
| Aiven plan | hobbyist | startup-4 | startup-4 | business-4 |
| Support | Email | Email | Priority | Dedicated |

**Setting flags per plan on Render:**
```bash
# STARTER plan — disable Videos only
FEATURE_VIDEOS=false

# FREE plan — disable most features
FEATURE_QR_ATTENDANCE=false
FEATURE_FEES=false
FEATURE_ASSIGNMENTS=false
FEATURE_STUDY_MATERIALS=false
FEATURE_VIDEOS=false

# PRO/ENTERPRISE — all true (defaults)
```

**And matching vars on Vercel (`NEXT_PUBLIC_FEATURE_*`)** — must always mirror Render.

---

*Architecture: Per-deployment isolation — no shared DB, no tenantId*
*Portal: `admin/` | Template app: `client/`*
*Last deep-read: 2026-03-02*
