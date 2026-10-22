# Dashboard integration review

Base: `priyanshu` / `origin/main` at `0b93d88b381f65e60c5f927eca1fa4202d15026b`.
Feature: `origin/feature/clinq-dashboards` at `12bc84047d8bac0d2e6ea85adaa64358268182b4`.
[PR #1](https://github.com/PriyankGupta22/ClinQ/pull/1) was open and unmerged when inspected.

Prepared first in the isolated `integration/clinq-dashboards-priyanshu` worktree
using `git merge --no-commit --no-ff`. No integration commit or push is authorized.
The original stash `4fc4259bce7e882992ebe02138dc6946be1932f7` must remain untouched.

The verified resolution is now staged on `priyanshu` as an uncommitted merge,
with the same complete Git tree as the isolated rehearsal. HEAD remains at
`0b93d88`; MERGE_HEAD is the dashboard feature commit. All conflicts are resolved.
Environment files and the stash are unchanged. Commit/push still require approval.

## Conflict resolutions

- DoctorLayout: retain latest main's DoctorClinicProvider and add the feature's
  onSignOut wiring. All original layout classes and navigation remain.
- DoctorDashboard: retain the authenticated dashboard, ten-day chart, calendar,
  response validation and General option. Concrete clinic selections update
  the shared clinic context used by queues, prescriptions and messaging. General
  clears only the dashboard filter; those other workflows retain a concrete clinic.
- PatientDashboard: use the authenticated patient's dashboard selector and
  stable calendar-date rendering. Public clinic discovery and booking remain in
  the latest main's PatientClinics/PatientClinicDoctors routes, without mixing
  public clinic results into private dashboard records.

## Necessary compatibility adjustments

- DoctorClinicContext retains its public interface, validates a pending selection
  after affiliations load, scopes data to the current token, and ignores stale
  requests. Development demo mode uses the existing local dashboard generator;
  fictional clinic IDs are never saved as normal workflow preferences.
- Current QueueEntry.estimatedEndTime is a Date. Demo data, synthetic backend
  fixtures and assertions now use timestamps; documentation warns against treating
  legacy numeric records as dates. No schema or stored-record migration was made.
- ConversationMessages has one effect-body correction: scrollIntoView can return
  a Promise in the tested Chromium. React must not receive it as an effect cleanup.
  The scroll call now runs in a block that returns undefined. Message APIs,
  conversation filtering and socket behavior are unchanged.

Latest main's queue/prescription controllers, models, routes, utilities and UI
files remain unchanged. The server diff adds only the dashboard route import and
mount; latest Socket.IO/queue/messaging handlers remain intact. All latest main
prescription, patient booking/queue and clinic store routes remain in App.jsx.

## Verification

- Production build with `VITE_DASHBOARD_DEMO_MODE=true`: passed; production demo lockout is tested.
- Frontend data/identity/profile tests: 60 passed.
- Backend HTTP integration tests with mocked database execution: 144 passed.
- New cross-workflow browser checks: 10 passed, including delayed clinic affiliations.
- Dashboard browser regression suite: 12 flows passed.
- Identity browser regression suite: nine flows passed.
- Doctor Profile browser regression suite: 20 scenarios passed.
- Total intercepted browser coverage: 51 flows/scenarios passed.
- Targeted lint across all changed frontend source files: zero errors, nine existing
  warnings (unused imports/state, effect state updates, Fast Refresh and JSX in try/catch).
- Conflict markers, import resolution, credential-pattern scan and staged whitespace: checked.

All API responses in browser checks are intercepted; no Atlas records were read
or changed. The backend is not started. Real database aggregation, deployed
authentication and live Socket.IO behavior still require approved environment testing.

The GitHub conflict banner remains until an approved resolution commit is pushed.
Local resolution alone does not update the remote PR. No reset, restore, stash
apply/drop, force push, or remote-main merge is part of this integration.

## Existing short-height limitation

Latest main adds the clinic Store queue menu entry. At a 720px viewport height,
the clinic Sign Out button can fall outside the viewport. The login/logout
harness now uses 1900x1100, matching the other dashboard checks. No sidebar CSS
or menu entry was removed to conceal this existing layout limitation.

## Exact integration file list

Relative to latest main (`0b93d88`), these 41 files comprise the feature and
necessary integration adjustments, tests and this review document:

```text
DASHBOARD_INTEGRATION_REVIEW.md
helioBackend/docs/dashboard-api.md
helioBackend/src/controllers/dashboard.controllers.js
helioBackend/src/routes/dashboard.routes.js
helioBackend/src/server.js
helioBackend/tests/README.dashboard.md
helioBackend/tests/dashboard-fixtures.js
helioBackend/tests/dashboard-mock-db.js
helioBackend/tests/dashboard.integration.test.js
helioFrontend/DASHBOARD_DEMO.md
helioFrontend/src/App.jsx
helioFrontend/src/api/authenticatedIdentity.js
helioFrontend/src/api/client.js
helioFrontend/src/api/dashboardDemoData.js
helioFrontend/src/api/dashboardRequest.js
helioFrontend/src/components/AuthenticatedIdentity.jsx
helioFrontend/src/components/ConversationMessages.jsx
helioFrontend/src/components/DashboardDemoIndicator.jsx
helioFrontend/src/components/ProtectedRoute.jsx
helioFrontend/src/components/clinicAdminFrontend/ClinicAdminDashboard.jsx
helioFrontend/src/components/clinicAdminFrontend/ClinicAdminSidebar.jsx
helioFrontend/src/components/doctorFrontend/DoctorClinicContext.jsx
helioFrontend/src/components/doctorFrontend/DoctorDashboard.jsx
helioFrontend/src/components/doctorFrontend/DoctorLayout.jsx
helioFrontend/src/components/doctorFrontend/DoctorProfile.jsx
helioFrontend/src/components/doctorFrontend/DoctorSidebar.jsx
helioFrontend/src/components/doctorFrontend/doctorProfileData.js
helioFrontend/src/components/doctorFrontend/useDoctorProfile.js
helioFrontend/src/components/landingPageComponents/ClinicSignUp.jsx
helioFrontend/src/components/landingPageComponents/DoctorSignup.jsx
helioFrontend/src/components/landingPageComponents/PatientSignup.jsx
helioFrontend/src/components/patientFrontend/PatientDashboard.jsx
helioFrontend/src/components/patientFrontend/PatientLayout.jsx
helioFrontend/src/components/patientFrontend/PatientSidebar.jsx
helioFrontend/tests/authenticated-identity.test.mjs
helioFrontend/tests/dashboard-browser.test.py
helioFrontend/tests/dashboard-demo.test.mjs
helioFrontend/tests/dashboard-identity.browser.py
helioFrontend/tests/dashboard-merge.browser.py
helioFrontend/tests/doctor-profile.browser.py
helioFrontend/tests/doctor-profile.test.mjs
```
