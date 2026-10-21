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

