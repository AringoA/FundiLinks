const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const request = require("supertest");
const { createApp } = require("../app");

let tempDir, app;
const seed = () => ({
  users: [{ id: "worker-1", firstName: "Test", lastName: "Worker", email: "worker@example.test", password: "password123", role: "worker" }],
  jobs: [
    { id: "job-1", title: "Fix a tap", category: "plumbing", location: "Westlands, Nairobi", pay: 1500, payType: "fixed", duration: "2 hours", employerId: "employer-1", isActive: true, status: "active", updatedAt: "2026-10-01T10:00:00.000Z" },
    { id: "job-2", title: "Clean office", category: "cleaning", location: "Kilimani, Nairobi", pay: 2000, payType: "fixed", duration: "Half day", employerId: "employer-1", isActive: false, status: "cancelled" }
  ],
  applications: [{ id: "app-1", jobId: "job-1", workerId: "worker-1", workerName: "Test Worker", status: "pending", appliedAt: "2026-10-01T12:00:00.000Z", updatedAt: "2026-10-01T12:00:00.000Z" }]
});
beforeEach(() => { tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "fundilinks-test-")); const dbPath = path.join(tempDir, "db.json"); fs.writeFileSync(dbPath, JSON.stringify(seed())); app = createApp({ dbPath }); });
afterEach(() => fs.rmSync(tempDir, { recursive: true, force: true }));

describe("GET endpoints", () => {
  test("lists active jobs with typed fields and filters", async () => {
    const all = await request(app).get("/api/jobs");
    expect(all.status).toBe(200); expect(all.body).toHaveLength(1);
    expect(all.body[0]).toMatchObject({ id: "job-1", title: "Fix a tap", category: "plumbing", pay: 1500 });
    expect(typeof all.body[0].location).toBe("string");
    const filtered = await request(app).get("/api/jobs?county=Nairobi&category=plumbing&status=active");
    expect(filtered.body.map(j => j.id)).toEqual(["job-1"]);
  });
  test("job detail and status handle found and missing IDs", async () => {
    const detail = await request(app).get("/api/jobs/job-1");
    expect(detail.status).toBe(200); expect(detail.body.payType).toBe("fixed");
    const status = await request(app).get("/api/jobs/job-1/status");
    expect(status.body).toMatchObject({ jobId: "job-1", status: "active" });
    expect(Number.isNaN(Date.parse(status.body.updatedAt))).toBe(false);
    expect((await request(app).get("/api/jobs/nope")).status).toBe(404);
    expect((await request(app).get("/api/jobs/nope/status")).status).toBe(404);
  });
});
describe("Application contract", () => {
  test("creates application and rejects malformed input before writing", async () => {
    const created = await request(app).post("/api/applications").send({ jobId: "job-1", workerId: "worker-2", workerName: "Second Worker", note: "Tomorrow" });
    expect(created.status).toBe(201); expect(created.body).toMatchObject({ jobId: "job-1", workerId: "worker-2", status: "pending" });
    expect(created.body.id).toBeTruthy(); expect(Number.isNaN(Date.parse(created.body.appliedAt))).toBe(false);
    const invalid = await request(app).post("/api/applications").send({ jobId: "job-1", workerId: "worker-3" });
    expect(invalid.status).toBe(400); expect(invalid.body.message).toMatch(/workerName/);
  });
  test("rejects unknown jobs and duplicate active applications", async () => {
    expect((await request(app).post("/api/applications").send({ jobId: "nope", workerId: "w", workerName: "Worker" })).status).toBe(404);
    expect((await request(app).post("/api/applications").send({ jobId: "job-1", workerId: "worker-1", workerName: "Test Worker" })).status).toBe(409);
  });
  test("reads application status and emits an SSE status event", async () => {
    const status = await request(app).get("/api/applications/app-1/status");
    expect(status.status).toBe(200); expect(status.body).toMatchObject({ applicationId: "app-1", status: "pending" });
    const stream = await request(app).get("/api/applications/app-1/subscribe");
    expect(stream.status).toBe(200); expect(stream.headers["content-type"]).toMatch(/text\/event-stream/);
    expect(stream.text).toContain("event: status"); expect(stream.text).toContain('"applicationId":"app-1"');
    expect((await request(app).get("/api/applications/nope/status")).status).toBe(404);
  });
  test("PUT is repeatable, validates, and returns 404 for missing IDs", async () => {
    const body = { jobId: "job-1", workerId: "worker-1", workerName: "Test Worker", note: "Rescheduled" };
    const one = await request(app).put("/api/applications/app-1").send(body);
    const two = await request(app).put("/api/applications/app-1").send(body);
    expect(one.status).toBe(200); expect(two.status).toBe(200); expect(two.body.note).toBe("Rescheduled"); expect(two.body.id).toBe("app-1");
    expect((await request(app).put("/api/applications/app-1").send({ jobId: "job-1" })).status).toBe(400);
    expect((await request(app).put("/api/applications/nope").send(body)).status).toBe(404);
  });
  test("DELETE cancels pending applications with 204 and returns 404 for missing IDs", async () => {
    expect((await request(app).delete("/api/applications/app-1")).status).toBe(204);
    expect((await request(app).get("/api/applications/app-1/status")).body.status).toBe("cancelled");
    expect((await request(app).delete("/api/applications/nope")).status).toBe(404);
  });
  test("malformed JSON receives 400", async () => {
    const res = await request(app).post("/api/applications").set("Content-Type", "application/json").send("{bad json");
    expect(res.status).toBe(400);
  });
});
describe("Existing browser routes", () => {
  test("registration rejects invalid and duplicate emails", async () => {
    expect((await request(app).post("/users").send({ firstName: "A", lastName: "B", email: "bad", password: "password123", role: "worker" })).status).toBe(400);
    expect((await request(app).post("/users").send({ firstName: "Test", lastName: "Worker", email: "worker@example.test", password: "password123", role: "worker" })).status).toBe(409);
  });
  test("job creation validates numeric pay", async () => {
    const body = { title: "Clean", category: "cleaning", location: "Nairobi", pay: "500", payType: "fixed", duration: "1 hour", employerId: "employer-1" };
    expect((await request(app).post("/jobs").send(body)).status).toBe(400);
    const created = await request(app).post("/jobs").send({ ...body, pay: 500 });
    expect(created.status).toBe(201); expect(created.body.pay).toBe(500);
  });
});
