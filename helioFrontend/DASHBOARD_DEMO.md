# Dashboard demo preview

Set `VITE_DASHBOARD_DEMO_MODE=true` in your local `.env.local`, then restart
`npm run dev`. To disable, remove the variable (or set it to `false`) and restart.
The flag must be exactly `true`. No environment file is changed by this feature.
Production always uses the existing API client, even if this flag is set while
running `npm run build`. There is no fallback to synthetic data after API errors.

Only the three dashboard GET calls are served locally. Login, signup, logout,
booking and other workflows retain their existing behavior. Use an existing
approved development session, or intercepted synthetic login responses in tests.
Do not log in against an unapproved database or navigate to other data workflows
when testing. This feature does not start a backend or connect to any database.

The local preview requires a token with the correct role, 24-character subject
ID and future expiry; it rejects missing, expired, premature and wrong-role
tokens. These are client-side preview checks, not signature verification. It
does not issue tokens, bypass backend middleware, verify a real identity or
grant access to backend data. Every dashboard displays a fixed `Demo Data`
badge. Roster and appointment names are fictional; the authenticated account's
identity is kept separate. Sidebars use profiles returned by existing login,
`/me`, or normal dashboard responses. Missing identity uses neutral labels.
Display profiles are cached per tab, bound to the exact access token by a SHA-256
fingerprint; no extra token is persisted. Logout and account changes invalidate
the cache. No identity fields are inferred from JWT claims and no extra profile
request is made. For an existing session without a captured profile, sign in
again through an approved backend (or mocked login in tests) to supply identity.

One deterministic record set yields 30 clinic bookings across six doctors,
18 bookings for the first doctor across two clinics, and eight bookings for the
first patient. All metrics, filters, calendar days, trends and capped lists derive
from these records. Dates follow Asia/Kolkata; appointment calendar labels and
stored queue appointment timestamps remain separate. Data rolls with the current
India calendar day. General removes the filter; selector options remain stable.
Appointments are capped at 20, history at 50, independently of full counts.

Run `node --test tests/dashboard-demo.test.mjs` in this directory for pure-data
tests. The backend contract suite is run separately with
`node --test tests/dashboard.integration.test.js` in `helioBackend`; it blocks
database connections and writes. Browser checks must intercept all `/api/**`
calls, including login, when live database access has not been approved.

The repeatable browser harness is `python tests/dashboard-browser.test.py` from
this directory. It needs an existing Python Playwright/Chromium installation.
Run two separate development servers, one with the flag `true` on port 5187 and
one with it `false` on port 5188 (`npm run dev -- --host 127.0.0.1 --port PORT
--strictPort`). First build production with the flag `true` to verify lockout.
The harness serves that build on 5186, intercepts every backend API request,
and runs 12 flows: three demo, three disabled-mode state/filter matrices, three
production lockout checks and three login/logout flows. It checks loading,
empty/zero data, absent references, errors, stale success/error, cleanup,
selectors, calendars, ten bars, token isolation, Back and direct-route guards.

For identity checks, run `node --test tests/authenticated-identity.test.mjs
tests/dashboard-demo.test.mjs` and `python tests/dashboard-identity.browser.py`.
The identity browser harness uses the same servers/build, mocks two authenticated
accounts per role plus an account with no profile fields, and tests demo on/off,
saved-session mode changes, reloads, logout, token replacement, initials and
production lockout. Run the two browser harnesses sequentially (both use 5186).

## Doctor Profile

The existing Doctor Profile uses authenticated `GET /api/doctor-auth/me` and
`GET /api/doctor-auth/clinics` through the shared API client in normal mode.
Name, specialization, email, phone, the stored single-day schedule and active
clinic links come from these responses. Missing fields remain neutral. Profile
photos, qualifications, experience, fee, biography and languages are not stored
in the current model; normal mode never invents them. The portrait is a local
generic placeholder. Edit Profile is visibly unavailable because no
doctor-authorized profile update endpoint exists.

In development demo mode the profile makes no profile/dashboard API requests.
The existing local dashboard generator supplies explicitly labelled fictional
details and clinics, while the authenticated display cache supplies the actual
name, email and specialization. Missing identity uses neutral labels; phone is
unavailable because the display cache does not retain it. Production always uses
the authenticated APIs. Session changes, logout, late responses and unmounts
cannot restore the previous profile. No backend/schema/authentication changes
are required for this read-only integration.

Run all 60 frontend data/identity/profile tests with:

```sh
node --test tests/dashboard-demo.test.mjs tests/authenticated-identity.test.mjs tests/doctor-profile.test.mjs
```

After a production build with the demo flag enabled, run
`python tests/doctor-profile.browser.py` for 20 intercepted browser scenarios.
This harness starts/stops its own demo-enabled/disabled Vite servers on 5191/5192
and serves production on 5193. It checks two accounts, logout/Back, missing fields,
errors, partial clinic failure, mounted token changes, StrictMode, late success
and error responses, unmount cleanup, demo lockout, and fixed profile photo/header
dimensions at 1900px and 1024px. Every backend API request is intercepted.
