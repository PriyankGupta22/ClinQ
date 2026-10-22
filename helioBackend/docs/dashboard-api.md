# ClinQ dashboard API

This documents the current controller and HTTP tests. Examples and tests use
synthetic records; no live database was queried. Prefix: `/api/dashboard`.
All three endpoints are authenticated, read-only GET requests.

## Authentication and scope

| Endpoint | JWT role | Immutable identity scope |
| --- | --- | --- |
| /clinic | clinicAdmin | clinicId from the authenticated JWT id |
| /doctor | doctor | doctorId from the authenticated JWT id |
| /patient | patient | userId from the authenticated JWT id |

Use `Authorization: Bearer <ACCESS_TOKEN>`. The router verifies signature and
expiry with `JWT_SECRET`, then validates an object payload, a string id of exactly
24 hexadecimal characters, and the endpoint role. Request bodies and identity
query parameters cannot override the authenticated identity.

Clinic and doctor accounts must exist and be active; the patient must exist.
Every appointment/queue query retains the authenticated scope. Patient results
contain only that patient's records. Populated patients expose only id and name;
the authenticated patient also receives their own email.

## Filters and calendar parameters

| Endpoint | Optional selection filter | Authorization |
| --- | --- | --- |
| /clinic | doctorId | DoctorClinic assignment to the authenticated clinic |
| /doctor | clinicId | DoctorClinic assignment to the authenticated doctor |
| /patient | clinicId | That patient's own appointment or queue association |

All endpoints accept `month=YYYY-MM` and `date=YYYY-MM-DD`. Both default to the
server's current local calendar month/day. They are independent: a selected date
may be outside the displayed month. A filter must be omitted for General;
empty, malformed, duplicate or non-scalar filter/date/month values are rejected.
A valid ObjectId without the required association returns 403.

For example:
`GET /api/dashboard/doctor?clinicId=000000000000000000000001&month=2026-10&date=2026-10-22`.

Filters scope statistics, trends, appointments and queues. Month changes the
calendar; date changes selectedDay. Daily cards, dailyQueue and consultationStats
still describe today, and trend10Days still ends today, regardless of selection.
Patient appointment statistics describe the full selected clinic scope.

Selector arrays remain independent of selection:
- Clinic `doctors`: all linked active doctors.
- Doctor `clinics`: all linked active clinics.
- Patient `selectorClinics`: existing clinics associated with that patient's
  appointments or queues; sorted by id, capped at 100. `selectorCoverage` has
  limit and truncated fields. Inactive clinics are not explicitly excluded here.

## Shared success metadata

Successful responses include `success: true`, `dashboard: "clinic" | "doctor" |
"patient"`, and the following fields.

| Field | Meaning |
| --- | --- |
| appliedFilters | Authenticated identity scope plus the optional selection ID; date/month are not included |
| trend10Days | Exactly ten calendar dates, oldest first, ending today |
| comparison | currentDay, previousDay, difference, percentageChange, metric |
| calendar | month, coverage, days |
| selectedDay | date, appointments, queueEntries, appointmentCount, queueCount, limit, appointmentsTruncated, queuesTruncated |
| dailyQueue | date, queueEntries, total, limit, truncated |
| consultationStats | basis, completedConsultations, patientsServed, consultingConsultations |

Clinic appliedFilters always includes clinicId; doctor always includes doctorId;
patient always includes userId. The optional selection is an additional key.
Clients must retain request/session scope when applying asynchronous responses.

Calendar coverage contains start, endExclusive, complete=true and
timezone="server-local". There is one row per calendar day of the requested month.
Rows contain date, appointments (all statuses), scheduled, completed, cancelled.
Calendar highlights establish bookings, not verified attendance.

selectedDay lists are capped at 20 independently from full appointmentCount and
queueCount. dailyQueue is also capped at 20 with an independent total. Truncation
flags describe those caps. There is no paging/cursor mechanism.

## Trends, comparison and dates

The server's local timezone defines dates and half-open day boundaries:
[local midnight, next local midnight). It is not necessarily the browser's or
clinic's timezone. Calendar/trend date labels use YYYY-MM-DD. Serialized stored
Date fields use ISO UTC timestamps; a label is not a UTC instant.

trend10Days rows contain date, appointments, scheduled, completed and cancelled.
appointments counts scheduled + completed. Clinic/doctor rows also contain
patients: unique patients with scheduled/completed appointments on that day.
Patient rows deliberately omit patients; completed is the personal visit-history
metric. All ten days are present, including zeros. Clinic/doctor additionally
retain the legacy seven-row `trend` field for compatibility.

Comparison metric is activePatients for clinic/doctor, completedAppointments
for patient. Percentage is null when the previous day's baseline is zero;
otherwise (currentDay - previousDay) / previousDay * 100.

The frontend preserves date-only labels. For timestamp-only patient appointment
dates without a server timezone identifier, it displays an explicit UTC-labelled
fallback consistently, rather than guessing a local calendar date.

## Clinic response

clinic contains id and name. doctors contains _id, name, specialization and optional
schedule. stats includes:
- appointmentsToday, patientsToday: legacy totals including cancellations.
- activeAppointmentsToday, activePatientsToday: scheduled/completed only.
- scheduledToday, completedToday, cancelledToday.
- activeDoctors, waitingPatients, consultingPatients.

statusBreakdown contains scheduled, completed, cancelled counts for today.
doctorStats rows contain doctorId, appointmentsToday, activeAppointmentsToday,
waitingPatients, consultingPatients, completedConsultations, patientsServed.
Idle linked active doctors have zero rows; activity from previously linked
doctors may also appear. Selecting a doctor scopes these metrics while keeping
the doctors selector stable.

doctorAvailability contains doctorId, status (consulting or unknown),
basis="storedQueueStatus", livePresence=false. It does not establish live presence.
todayAppointments and upcomingAppointments are capped at 20.

## Doctor response

doctor contains _id, name, specialization and optional schedule. clinics contains
linked active clinic _id, clinicName and address. stats contains the shared daily
appointment/patient fields plus waitingPatients and consultingPatients.
statusBreakdown, legacy trend, todayAppointments and upcomingAppointments are
also returned. The two appointment lists are capped at 20.

## Patient response

patient contains _id, name and email. stats contains full-scope totalAppointments,
upcomingAppointments, completedAppointments and activeQueues. Counts are computed
independently of capped lists.

upcomingAppointmentsList contains scheduled appointments from today's midnight,
including earlier times today/date-only bookings, capped at 20.
appointmentHistory contains past appointments of any status plus today's completed
or cancelled appointments, newest first, capped at 50. Future cancelled/completed
appointments are not upcoming and are not included early in history.

queueEntries contains only the patient's waiting/consulting entries dated today,
capped at 20. activeQueues is an uncapped count. selectorClinics/selectorCoverage
are separate from those lists and remain stable under clinic filtering.

## Appointment and queue projections

Appointment arrays expose _id, userId {_id,name}, doctorId
{_id,name,specialization}, clinicId {_id,clinicName,address}, appointmentDate,
reason, status, createdAt and updatedAt when present. Missing populated references
may be null. Statuses are scheduled, completed and cancelled. Lists sort by
appointmentDate then _id ascending, except history which sorts descending.

Queue arrays expose _id, appointmentId, clinicId, doctorId, date, queueNumber,
status, appointmentTime, estimatedStartTime, estimatedEndTime,
consultationStartedAt and consultationEndedAt when present. dailyQueue and
selectedDay also select/populate userId with name. Patient top-level queueEntries
does not include userId. Clinic/doctor queue references contain names, not full
profiles. Queue lists sort by queueNumber then _id.

appointmentId is the association key; arrays must never be joined by position.
Queue number does not establish the number of people ahead or guarantee who is
next. estimatedEndTime is a stored number with an undefined unit here, not an ISO
timestamp. Missing/optional times must remain unavailable.

consultationStats and doctor consultation counters use today's stored queue date.
Completed consultation counts and distinct patientsServed derive from completed
queue entries, independently of completed appointment counts. dailyQueue and
selectedDay may include completed, skipped and no_show as well as active entries.

## Errors

| Status | Meaning |
| --- | --- |
| 400 | Invalid filter or calendar month/date parameter |
| 401 | Missing/malformed/expired/incorrectly signed JWT or invalid authenticated id |
| 403 | Wrong role or unauthorized doctor/clinic selection |
| 404 | Authenticated account missing/inactive as applicable |
| 500 | Controller/database failure; generic role-specific message |

Errors contain message and do not expose database errors or stack traces.
The router uses "Authentication required", "Invalid or expired token" and
"Access denied". Association errors identify the failed association. Controllers
use "Clinic not found", "Doctor not found", "Patient not found", or
"Failed to load <role> dashboard".

## Frontend and local demo mode

The original three dashboard designs consume these fields through the existing API
client. Loading/error/empty values do not fall back to sample statistics.
Role-specific logout returns to the original ClinQueue login forms using
/<role>/signup?mode=login, clears only the role's tokens/cache and uses history
replacement. Backend authentication and refresh-token revocation are unchanged.

See [frontend demo and identity instructions](../../helioFrontend/DASHBOARD_DEMO.md).
Demo responses are local, explicitly enabled and development-only. Production
always uses normal APIs. Identity comes from existing authenticated responses,
never fictional account records or unverified JWT profile claims.

## Verification and remaining limits

Run `node --test tests/dashboard.integration.test.js` from helioBackend.
The latest suite contains 144 passing HTTP integration tests using production
routing/controllers and mocked database execution. See
[the test report](../tests/README.dashboard.md). These are not live MongoDB tests.

- No approved live MongoDB integration, server bootstrap, CORS or Socket.IO test
  has been performed. Running server.js connects to the configured database.
- Queries are independent, not a transactional snapshot; concurrent changes may
  cause counts/lists to differ within a response.
- Linked doctor/clinic arrays and clinic doctorStats have no explicit cap/order;
  the patient selector has its separate 100-option bound.
- Counts reflect stored statuses and do not reconcile booking or queue workflows.
- Appointment completion alone does not verify physical attendance.
- Server-local deployment timezone agreement is still required.
- The numeric estimatedEndTime unit must be confirmed with the queue workflow owner.
