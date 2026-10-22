# Dashboard HTTP tests with mocked database execution

Run from helioBackend:

```powershell
node --test tests/dashboard.integration.test.js
```

Use the existing installed project dependencies and Node.js with node:test Date
mocking support. The final Git review uses Node 24.16.0. No dependencies or lockfile
changes are required. The dashboard-only candidate also runs without the unrelated
package.json type declaration under this Node version's ESM syntax detection.

## Current results

144 tests pass, 0 fail, 0 skip in the final working-tree verification.
The earlier 58-test report described an older contract; it is superseded.

Coverage includes:
- Production Express routing, signed JWT signature/expiry/role/id validation and
  clinic/doctor/patient data isolation.
- Schema-validated synthetic fixtures; success, empty and missing-reference states.
- Seven-day legacy compatibility and exactly ten calendar days with zero fill.
- Active metrics separate from cancelled appointments; patient completed trends.
- Stable selectors, authorized filters, date/month validation, leap days and
  selected-date/month behavior.
- Calendar totals, consultation counters, per-doctor metrics and stored availability.
- Independent full counts, appointment/queue cap 20, history cap 50, patient selector
  cap 100, deterministic bounded list ordering and truncation metadata.
- Wrong/missing/expired/malformed JWTs, invalid scopes, missing/inactive accounts,
  query failures and generic errors without private details.
- Static inspection of dashboard registration in server.js; production-source
  hashes before/after tests.

## Isolation

These are HTTP integration tests with mocked database execution, not live MongoDB
tests. They never load .env, execute server.js, connect to MongoDB or use real
patient data. A process-local random signing key is restored after tests without
being printed. Database connections and collection writes are blocked.

Mongoose query construction runs; Query.exec and Aggregate.exec are replaced by
an in-memory adapter evaluating the controller's emitted pipeline. Population and
projections are simulated. Unsupported operators fail.

The fixture date covers November 1, 2026, including New York's DST transition.
To verify a deployment timezone, set TZ for the test process and rerun the suite;
do not infer current coverage from the superseded 58-test timezone table.

Still unverified: real MongoDB aggregation/population/index behavior, performance,
concurrent update consistency, deployed secrets/login, full server startup/CORS and
socket integration. Starting the server would initiate its configured database
connection and requires separate database approval.

See [the current API contract](../docs/dashboard-api.md) and
[frontend demo/identity verification](../../helioFrontend/DASHBOARD_DEMO.md).
