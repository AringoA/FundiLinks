# ENDPOINT_LIST.md — FundiLink (Team 15)

## Downstream endpoints — FundiLink provides to SettleIn

| # | Method | Endpoint | Purpose | Maps to Need |
|---|--------|----------|---------|---------------|
| 1 | GET | `/api/jobs?status=active` | Returns all currently active job/service listings | Statement 1 |
| 2 | GET | `/api/jobs?county={county}&category={category}&status=active` | Filters active listings by location and category near a student's accommodation | Statement 2 |
| 3 | GET | `/api/jobs/{jobId}` | Returns a single job's full details, including status and pay range | Statements 3, 4 |
| 4 | GET | `/api/jobs/{jobId}/status` | Returns just the availability status of a job (lightweight — SettleIn polls this often without pulling the full job payload) | Statement 3 |
| 5 | GET | `/api/applications/{applicationId}/status` | Returns the current status of an application/service request | Statement 5 |
| 6 | GET | `/api/applications/{applicationId}/subscribe` | Opens a WebSocket/SSE stream that pushes status changes in real time (accepted / filled) | Statement 5 |
| 7 | POST | `/api/applications` | Creates a new application/service request from a SettleIn student | Statement 6 |
| 8 | PUT | `/api/applications/{applicationId}` | Updates an existing pending application (e.g., reschedule, edit details) | Statement 7 |
| 9 | DELETE | `/api/applications/{applicationId}` | Cancels a pending application/service request | Statement 8 |

## Notes on changes from the first draft

- **#1**: `active` moved from a path segment to a query parameter — it's a filter on the `jobs` resource, not a distinct resource itself.
- **#3/#4**: Kept `pay-range` and `status` split out only where there's a real reason. A single `GET /jobs/{jobId}` now covers pay range as part of the full resource (folded `pay-range` into it — a separate endpoint for one field wasn't earning its keep). `status` stays split out as a lighter-weight endpoint since SettleIn is expected to poll it frequently.
- **#6**: Flattened from three levels of nesting (`/applications/{id}/status/subscribe`) to two, and replaced the non-standard "GET/WebSocket" method with a plain `GET` that upgrades to a WebSocket/SSE stream — noted explicitly in the Purpose column since strict REST doesn't have a clean verb for "subscribe."
- **#7, #8, #9**: Previously had no needs statement to justify them. Added Statements 6–8 to API_NEEDS.md to close that gap — each write endpoint now traces to something SettleIn actually needs, not something invented while designing.
