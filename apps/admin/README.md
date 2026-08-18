# FMT Admin

Internal admin console for FMT Software Solutions. Manages organizations, users,
provisioning, SMS credits and website data across all FMT products.

Deployed as its own Netlify site at `admin.fmtsoftware.com` (see `../../DEPLOYMENT.md`).

## Architecture

- **Auth**: Supabase Auth against the **main** FMT Supabase project. Login and
  password reset only — there is no signup.
- **Data**: everything privileged goes through the NestJS backend
  (`fmt-ss-backend`), which holds the service-role keys for the main project and
  for each product's Supabase project. This app never holds a service-role key.
- Admin API calls attach the Supabase access token as a bearer token; the
  backend's `AdminAuthGuard` verifies it and requires `app_metadata.fmt_admin`.

## Local development

```bash
pnpm --filter admin dev
```

Requires the backend running on port 3001:

```bash
npm --prefix fmt-ss-backend run dev
```

### Environment

Read from the monorepo root `.env.local` (`envDir: '../../'`):

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Main FMT Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Main FMT Supabase anon key |
| `VITE_API_URL` | Backend base URL, e.g. `http://localhost:3001/api` |

On Netlify these are set per-site under Site configuration → Environment
variables, with `VITE_API_URL` pointing at the production API.

## One-time backend setup

1. Run `fmt-ss-backend/supabase_migrations/20260817_admin_auth.sql` in the **main**
   Supabase project's SQL editor. It creates the `admin_otp_requests` table used
   for password-reset rate limiting and drops the over-permissive `quotes`
   SELECT policy.
2. Set `ADMIN_ALLOWED_ORIGINS` in the backend `.env` to the origins that should
   be allowed through CORS.

## Creating an admin

There is no signup. Create each admin manually:

1. In the main Supabase project, Authentication → Users → **Add user** (email +
   password, mark the email confirmed).
2. Grant the admin claim:

```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"fmt_admin": true}'::jsonb
WHERE email = 'admin@fmtsoftware.com';
```

Accounts without `fmt_admin` can authenticate with Supabase but are signed out
by the app and rejected with 403 by the backend.

## Password reset

Reset uses an OTP rather than Supabase's built-in reset email, matching the
pattern used by the desktop products:

1. `POST /api/admin-auth/forgot-password` generates a recovery OTP via
   `auth.admin.generateLink` and emails it through Resend. The response is the
   same whether or not the account exists.
2. The client verifies with `supabase.auth.verifyOtp({ type: 'recovery' })`,
   which returns a session, then calls `updateUser({ password })`.

Per-email cooldowns escalate (0/1/3/5 minutes) and cap at 4 requests per 24h.
