# Contract Deviations

The Week 6 implementation and OpenAPI contract were reconciled on the `week6-week7-api-fixes` branch.

- Repaired the OpenAPI document structure: the server URL belongs under `servers`, and schema references use the valid `$ref` key.
- Standardized the contract-facing routes under `/api/jobs` and `/api/applications`, served on port 3001 to match the app's local API configuration.
- Added documented validation and error outcomes: 400 for malformed input, 404 for missing resources, 409 for unavailable/duplicate/conflicting application actions, 201 for creation, 200 for reads/updates, and 204 for cancellation.
- Kept `/users`, `/jobs`, and `/applications` compatibility routes so the existing browser pages can use the same server.

These are implementation/contract alignment changes. Review the revised `openapi.yaml` with the downstream partner and notify them before they rely on the changed contract.

## Verification status

Automated Jest/Supertest tests have been added. They could not be executed in the current editing environment because it could not resolve `github.com` to fetch the branch. Run `npm install` and `npm test` locally or use the added GitHub Actions workflow before treating the suite as passing. Partner tests also remain pending until executed against the live API.
