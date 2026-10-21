const express = require("express");
const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const DEFAULT_DB = path.join(__dirname, "src", "db.json");

function createApp({ dbPath = DEFAULT_DB } = {}) {
  const app = express();
  app.use(express.json({ limit: "1mb" }));
  const read = () => {
    const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
    for (const key of ["users", "jobs", "applications"]) if (!Array.isArray(db[key])) db[key] = [];
    return db;
  };
  const write = db => {
    const tmp = dbPath + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(db, null, 2) + "\n");
    fs.renameSync(tmp, dbPath);
  };
  const fail = (res, status, message) => res.status(status).json({ message });
  const same = (a, b) => String(a) === String(b);
  const now = () => new Date().toISOString();
  const statusOf = job => job.status || (job.isActive === false ? "cancelled" : "active");
  const validEmail = s => typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
  function validateApplication(body) {
    if (!body || body.jobId == null || !String(body.jobId).trim()) return "jobId is required";
    if (body.workerId == null || !String(body.workerId).trim()) return "workerId is required";
    if (typeof body.workerName !== "string" || !body.workerName.trim()) return "workerName is required";
    if (body.scheduledAt !== undefined && (typeof body.scheduledAt !== "string" || Number.isNaN(Date.parse(body.scheduledAt)))) return "scheduledAt must be a valid date-time string";
    if (body.note !== undefined && typeof body.note !== "string") return "note must be a string";
    return null;
  }
  function createApplication(db, body) {
    const job = db.jobs.find(j => same(j.id, body.jobId));
    if (!job) return { error: [404, "Job not found"] };
    if (statusOf(job) !== "active") return { error: [409, "This job is no longer available"] };
    if (db.applications.some(a => same(a.jobId, body.jobId) && same(a.workerId, body.workerId) && a.status !== "cancelled")) return { error: [409, "You have already applied for this job"] };
    const timestamp = now();
    const item = { id: randomUUID(), jobId: String(body.jobId), workerId: String(body.workerId), workerName: body.workerName.trim(), status: "pending", appliedAt: timestamp, updatedAt: timestamp };
    if (body.scheduledAt) item.scheduledAt = new Date(body.scheduledAt).toISOString();
    if (body.note) item.note = body.note.trim();
    db.applications.push(item);
    write(db);
    return { item };
  }
  function updateApplication(db, item, body) {
    if (item.status !== "pending") return [409, "Only pending applications can be updated"];
    if (!db.jobs.some(j => same(j.id, body.jobId))) return [404, "Job not found"];
    item.jobId = String(body.jobId); item.workerId = String(body.workerId); item.workerName = body.workerName.trim();
    if (body.scheduledAt !== undefined) item.scheduledAt = new Date(body.scheduledAt).toISOString();
    if (body.note !== undefined) item.note = body.note.trim();
    item.updatedAt = now(); write(db); return null;
  }
  function cancelApplication(db, id, res) {
    const item = db.applications.find(a => same(a.id, id));
    if (!item) return fail(res, 404, "Application not found");
    if (item.status !== "pending") return fail(res, 409, "Only pending applications can be cancelled");
    item.status = "cancelled"; item.updatedAt = now(); write(db); return res.status(204).end();
  }

  // Compatibility routes used by the existing browser pages.
  app.get("/users", (req, res) => {
    let users = read().users;
    if (req.query.email) users = users.filter(u => String(u.email).toLowerCase() === String(req.query.email).toLowerCase());
    res.json(users);
  });
  app.post("/users", (req, res) => {
    const { firstName, lastName, email, password, role } = req.body || {};
    if (![firstName, lastName, email, password, role].every(v => typeof v === "string" && v.trim())) return fail(res, 400, "firstName, lastName, email, password and role are required");
    if (!validEmail(email)) return fail(res, 400, "A valid email address is required");
    if (password.length < 8) return fail(res, 400, "Password must be at least 8 characters");
    if (!["worker", "employer"].includes(role)) return fail(res, 400, "role must be worker or employer");
    const db = read();
    if (db.users.some(u => String(u.email).toLowerCase() === email.trim().toLowerCase())) return fail(res, 409, "An account with this email already exists");
    const user = { id: randomUUID(), firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim().toLowerCase(), password, role };
    db.users.push(user); write(db); res.status(201).json(user);
  });
  app.get("/jobs", (req, res) => {
    let jobs = read().jobs;
    if (req.query.isActive !== undefined) jobs = jobs.filter(j => String(j.isActive) === String(req.query.isActive));
    if (req.query.category) jobs = jobs.filter(j => String(j.category).toLowerCase() === String(req.query.category).toLowerCase());
    if (req.query.county) jobs = jobs.filter(j => String(j.location || "").toLowerCase().includes(String(req.query.county).toLowerCase()));
    res.json(jobs);
  });
  app.get("/jobs/:jobId", (req, res) => {
    const job = read().jobs.find(j => same(j.id, req.params.jobId));
    return job ? res.json(job) : fail(res, 404, "Job not found");
  });
  app.post("/jobs", (req, res) => {
    const b = req.body || {};
    if (typeof b.title !== "string" || !b.title.trim() || typeof b.category !== "string" || !b.category.trim() || typeof b.location !== "string" || !b.location.trim() || typeof b.pay !== "number" || !Number.isFinite(b.pay) || b.pay < 0 || typeof b.payType !== "string" || !b.payType.trim() || typeof b.duration !== "string" || !b.duration.trim() || b.employerId == null) return fail(res, 400, "title, category, location, non-negative numeric pay, payType, duration and employerId are required");
    const db = read(); const timestamp = now();
    const job = { id: randomUUID(), title: b.title.trim(), category: b.category.trim().toLowerCase(), location: b.location.trim(), pay: b.pay, payType: b.payType.trim(), duration: b.duration.trim(), employerId: b.employerId, employer: typeof b.employer === "string" ? b.employer : "", description: typeof b.description === "string" ? b.description.trim() : "", urgent: Boolean(b.urgent), isActive: true, status: "active", createdAt: timestamp, updatedAt: timestamp };
    db.jobs.push(job); write(db); res.status(201).json(job);
  });
  app.get("/applications", (req, res) => {
    let items = read().applications;
    for (const key of ["workerId", "jobId", "status"]) if (req.query[key] !== undefined) items = items.filter(a => key === "status" ? a.status === req.query[key] : same(a[key], req.query[key]));
    res.json(items);
  });
  app.post("/applications", (req, res) => {
    const invalid = validateApplication(req.body); if (invalid) return fail(res, 400, invalid);
    const db = read(); const result = createApplication(db, req.body);
    if (result.error) return fail(res, ...result.error);
    res.status(201).json(result.item);
  });

  // Contract-facing endpoints for SettleIn.
  app.get("/api/jobs", (req, res) => {
    let jobs = read().jobs;
    jobs = jobs.filter(j => statusOf(j) === (req.query.status || "active"));
    if (req.query.county) jobs = jobs.filter(j => String(j.location || "").toLowerCase().includes(String(req.query.county).toLowerCase()));
    if (req.query.category) jobs = jobs.filter(j => String(j.category || "").toLowerCase() === String(req.query.category).toLowerCase());
    res.status(200).json(jobs);
  });
  app.get("/api/jobs/:jobId/status", (req, res) => {
    const job = read().jobs.find(j => same(j.id, req.params.jobId));
    if (!job) return fail(res, 404, "Job not found");
    res.json({ jobId: String(job.id), status: statusOf(job), updatedAt: job.updatedAt || job.createdAt || new Date(0).toISOString() });
  });
  app.get("/api/jobs/:jobId", (req, res) => {
    const job = read().jobs.find(j => same(j.id, req.params.jobId));
    return job ? res.json(job) : fail(res, 404, "Job not found");
  });
  app.get("/api/applications/:applicationId/status", (req, res) => {
    const a = read().applications.find(x => same(x.id, req.params.applicationId));
    if (!a) return fail(res, 404, "Application not found");
    res.json({ applicationId: String(a.id), status: a.status, updatedAt: a.updatedAt || a.appliedAt || new Date(0).toISOString() });
  });
  app.get("/api/applications/:applicationId/subscribe", (req, res) => {
    const a = read().applications.find(x => same(x.id, req.params.applicationId));
    if (!a) return fail(res, 404, "Application not found");
    res.status(200).set({ "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache", Connection: "keep-alive" });
    res.write("event: status\ndata: " + JSON.stringify({ applicationId: String(a.id), status: a.status, updatedAt: a.updatedAt || a.appliedAt || new Date(0).toISOString() }) + "\n\n");
    res.end();
  });
  app.post("/api/applications", (req, res) => {
    const invalid = validateApplication(req.body); if (invalid) return fail(res, 400, invalid);
    const db = read(); const result = createApplication(db, req.body);
    if (result.error) return fail(res, ...result.error);
    res.status(201).json(result.item);
  });
  app.put("/api/applications/:applicationId", (req, res) => {
    const invalid = validateApplication(req.body); if (invalid) return fail(res, 400, invalid);
    const db = read(); const a = db.applications.find(x => same(x.id, req.params.applicationId));
    if (!a) return fail(res, 404, "Application not found");
    const issue = updateApplication(db, a, req.body); if (issue) return fail(res, ...issue);
    res.status(200).json(a);
  });
  app.delete("/api/applications/:applicationId", (req, res) => cancelApplication(read(), req.params.applicationId, res));

  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && Object.prototype.hasOwnProperty.call(err, "body")) return fail(res, 400, "Request body must contain valid JSON");
    console.error(err); return fail(res, 500, "Internal server error");
  });
  return app;
}
module.exports = { createApp };
