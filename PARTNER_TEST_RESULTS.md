# Week 7 — Automated and Partner Test Results

## Automated tests

Jest and Supertest integration tests cover successful reads and writes, response shape, validation failures, missing resources, duplicate applications, malformed JSON, and cancellation/update behavior.

Run `npm test`.

## Partner test exchange

**Pending — not yet performed in this environment.** The upstream/downstream partner must run independently written tests against the running API and share the actual results. Do not record partner tests as passed until they have been executed against this server.

## Follow-up classification

Record each real partner-test failure here as one of:
- **Implementation bug:** behavior does not match this repository's OpenAPI contract.
- **Contract ambiguity:** a reasonable test assumption is not resolved by the contract; clarify `openapi.yaml` and notify the partner.
- **Misunderstanding:** the tested behavior is not promised by the contract; explain the contract wording to the partner.
