(() => {
  const { useState, useEffect } = React;
  const API = "http://localhost:3001";
  function JobCard({ job, applied, onApply, applying }) {
    return <article className="job-card">
      <div className="card-top"><span className="card-category">{job.category}</span>{job.urgent && <span className="card-urgent">Urgent</span>}</div>
      <h3 className="card-title">{job.title}</h3><p className="card-location">{job.location}</p><p className="card-duration">{job.duration}</p>
      {job.description && <p className="card-description">{job.description}</p>}
      <div className="card-footer"><span className="card-pay">KES {Number(job.pay || 0).toLocaleString()} <small>{job.payType}</small></span>
      <button className="apply-btn" disabled={applied || applying} onClick={() => onApply(job)}>{applied ? "Applied" : applying ? "Applying…" : "Apply Now"}</button></div>
    </article>;
  }
  function JobGrid() {
    const [jobs, setJobs] = useState([]), [activeCategory, setActiveCategory] = useState("all");
    const [loading, setLoading] = useState(true), [error, setError] = useState("");
    const [appliedIds, setAppliedIds] = useState(new Set()), [applyingId, setApplyingId] = useState(null);
    const user = (() => { try { return JSON.parse(localStorage.getItem("fundilinkUser") || "null"); } catch { return null; } })();
    useEffect(() => {
      let cancelled = false;
      Promise.all([
        fetch(API + "/jobs?isActive=true").then(r => { if (!r.ok) throw new Error(); return r.json(); }),
        user ? fetch(API + "/applications?workerId=" + encodeURIComponent(user.id)).then(r => { if (!r.ok) throw new Error(); return r.json(); }) : Promise.resolve([])
      ]).then(([items, applications]) => {
        if (cancelled) return;
        setJobs(items.filter(j => j.isActive !== false && (!j.status || j.status === "active")));
        setAppliedIds(new Set(applications.filter(a => a.status !== "cancelled").map(a => String(a.jobId))));
      }).catch(() => { if (!cancelled) setError("Could not load listings. Make sure the API is running with npm start."); })
        .finally(() => { if (!cancelled) setLoading(false); });
      return () => { cancelled = true; };
    }, []);
    useEffect(() => {
      const bar = document.getElementById("chipsBar");
      if (!bar) return;
      const handler = e => { const chip = e.target.closest(".chip"); if (!chip) return; setActiveCategory(chip.dataset.category || "all"); bar.querySelectorAll(".chip").forEach(c => c.classList.toggle("active", c === chip)); };
      bar.addEventListener("click", handler);
      return () => bar.removeEventListener("click", handler);
    }, []);
    const handleApply = async job => {
      if (!user) { window.location.href = "login.html"; return; }
      if (user.role !== "worker") { alert("Only worker accounts can apply for jobs."); return; }
      setApplyingId(String(job.id));
      try {
        const res = await fetch(API + "/applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId: String(job.id), workerId: String(user.id), workerName: [user.firstName, user.lastName].filter(Boolean).join(" ") }) });
        const body = await res.json();
        if (!res.ok) throw new Error(body.message || "Application failed.");
        setAppliedIds(prev => new Set([...prev, String(job.id)]));
      } catch (err) { alert(err.message || "Could not submit application."); }
      finally { setApplyingId(null); }
    };
    if (loading) return <p className="no-results">Loading jobs…</p>;
    if (error) return <p className="no-results" role="alert">{error}</p>;
    const filtered = activeCategory === "all" ? jobs : jobs.filter(j => String(j.category).toLowerCase() === activeCategory.toLowerCase());
    if (!filtered.length) return <p className="no-results">No jobs found for this category.</p>;
    return <div className="job-grid">{filtered.map(job => <JobCard key={job.id} job={job} applied={appliedIds.has(String(job.id))} applying={applyingId === String(job.id)} onApply={handleApply}/>)}</div>;
  }
  const root = document.getElementById("jobGrid");
  if (root) ReactDOM.createRoot(root).render(<JobGrid />);
})();