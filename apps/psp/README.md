# PrintSuite Pro — public web (`printsuitepro.fmtsoftware.com`)

Public, unauthenticated pages for the PrintSuite Pro desktop app. Attendance is
the first of them; the app is named for the product rather than the feature so
later public flows can live here without another subdomain.

## Routes

| Route | Reached from | Purpose |
|---|---|---|
| `/` | Someone typing the domain | One paragraph explaining what this is. No form, no org list, nothing to enumerate. |
| `/a/:token` | The morning attendance SMS | Clock in, or clock out. Shows **one** action, never both. |
| `/p/:token` | An admin-issued PIN link | Set or reset a 4-digit PIN. Single-use, 30 minutes. |
| `/qr/:code` | A printed QR poster | Phone + PIN instead of a token. Costs no SMS credits. |

## How it talks to the server

It reaches **print-calc-pro's** Supabase project (not the fmt-ss one the
marketing site uses) and can call exactly five `SECURITY DEFINER` functions:

```
get_attendance_link_state   what to render
mark_attendance             the only write path
set_employee_pin            PIN setup / reset
get_org_by_public_code      resolve a poster code
get_employee_self_service   the employee's own profile + this month
```

It has **no table access at all** — every attendance table either has no `anon`
policy or no `anon` grant. So the anon key in the bundle grants nothing: identity
is the employee's PIN, checked server-side, and presence is the geofence,
computed server-side. The browser sends a PIN and a pair of coordinates and is
told yes or no. It is never told where the geofence is.

## Environment

Set in the monorepo root `.env` / `.env.local` (vite `envDir` is `../../`), and
in Netlify's environment for the deployed site:

```
VITE_PSP_SUPABASE_URL=https://<print-calc-pro-ref>.supabase.co
VITE_PSP_SUPABASE_ANON_KEY=<print-calc-pro anon key>
```

The app throws at boot if either is missing, because the alternative is every
page quietly showing "invalid link".

## Netlify

Fourth site on the same repo, same pattern as `web` / `admin` / `studio`:

- **Base directory:** `/` (leave empty)
- **Package directory:** `apps/psp`
- **Build command:** `pnpm build`
- **Publish directory:** `apps/psp/dist`
- **Domain:** `printsuitepro.fmtsoftware.com`

`netlify.toml` handles SPA routing and sends `noindex`, `no-referrer` and a
`Permissions-Policy` that allows geolocation only to this origin — attendance
links carry a day-long token and read the device location, so they should not be
indexed or leaked through a referrer header.

## Local development

```bash
pnpm --filter psp dev
```

There is no login. To exercise a real page you need a token, which the desktop
app issues (`issue_attendance_token`) — or insert an `attendance_tokens` row
directly with the service role, storing `sha256(plaintext)` as `token_hash`.

## Design notes

Built for one situation: somebody outside a workshop at 7am, on a mid-range
Android, in sunlight, possibly with one hand full.

- **Light theme only.** A dark card in direct sun is harder to read, and nobody
  is opening a theme setting here.
- **One PIN box, not four.** Four boxes fight the Android keyboard, break paste
  and confuse autofill, and the fiddliness lands on the people least able to
  absorb it.
- **Location is requested on mount**, not on submit, so the GPS wait overlaps
  with typing the PIN instead of hanging after the tap.
- **Failure messages say what to do**, not what went wrong internally: "You are
  not at work yet" rather than `outside_radius` — and neither reveals where the
  geofence actually is.
- `font-size: 16px` on inputs, because iOS zooms the whole page below that.
