# FundiLink

**Kenya's fastest way to find casual work, nearby.**

FundiLink connects employers who need short-term work done with local skilled workers. Employers can publish job listings; workers can browse by trade, apply, and track applications.

## Tech stack

- HTML and CSS for responsive pages
- Vanilla JavaScript and React (CDN/Babel) for browser interactions
- Express API backed by `src/db.json`
- Jest and Supertest for automated integration tests

> This is a learning/demo application. The JSON-file database and browser localStorage authentication are not production-grade. Passwords are stored in plaintext in the mock database; use proper password hashing, sessions/tokens, and a real database before deployment.

## Run locally

Prerequisite: install a current Node.js LTS release.

1. Clone the repository and enter its folder:
   ```bash
   git clone https://github.com/AringoA/FundiLinks.git
   cd FundiLinks
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the API (port 3001):
   ```bash
   npm start
   ```
4. In a second terminal, start the static site:
   ```bash
   npm run serve:web
   ```
5. Open `http://localhost:8080/src/index.html`.

The API stores demo records in `src/db.json`. Back up this file before manually editing it. Do not use real personal information or real passwords in the demo database.

## API endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/jobs` | List active jobs; optional `status`, `county`, and `category` filters |
| GET | `/api/jobs/{jobId}` | Get one job |
| GET | `/api/jobs/{jobId}/status` | Get job status |
| POST | `/api/applications` | Create an application |
| PUT | `/api/applications/{applicationId}` | Update a pending application |
| DELETE | `/api/applications/{applicationId}` | Cancel a pending application |
| GET | `/api/applications/{applicationId}/status` | Get application status |
| GET | `/api/applications/{applicationId}/subscribe` | Receive an initial status event over Server-Sent Events |

The browser demo also uses `/users`, `/jobs`, and `/applications` compatibility routes. Request and response schemas are in [openapi.yaml](openapi.yaml).

## Automated tests

Run:

```bash
npm test
```

Tests use a temporary copy of seeded data so test writes do not modify `src/db.json`.

## Week 7 partner exchange

Run your partner's tests against the running API, record actual pass/fail results, and classify each issue as an implementation bug, contract ambiguity, or misunderstanding in [PARTNER_TEST_RESULTS.md](PARTNER_TEST_RESULTS.md). Partner testing must not be reported as completed until it has actually been performed.
