const { useState, useEffect } = React;

function JobCard({ job, onApply }) {
  return (
    <div className="job-card">
      <div className="card-top">
        <span className="card-category">{job.category}</span>
        {job.urgent && <span className="card-urgent">Urgent</span>}
      </div>
      <h3 className="card-title">{job.title}</h3>
      <p className="card-location">{job.location}</p>
      <p className="card-duration">{job.duration}</p>
      <div className="card-footer">
        <span className="card-pay">
          KES {job.pay.toLocaleString()} <small>{job.payType}</small>
        </span>
        <button
          className="apply-btn"
          disabled={job.applied}
          onClick={() => onApply(job.id)}
        >
          {job.applied ? "Applied" : "Apply Now"}
        </button>
      </div>
    </div>
  );
}

function JobGrid() {
  const [jobs, setJobs] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/jobs")
      .then(res => res.json())
      .then(data => {
        setJobs(data.map(j => ({ ...j, applied: false })));
        setLoading(false);
      })
      .catch(() => {
        alert("Could not load jobs. Is json-server running on port 3001?");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const chips = document.querySelectorAll(".chip");
    const handleClick = (e) => {
      chips.forEach(c => c.classList.remove("active"));
      e.target.classList.add("active");
      setActiveCategory(e.target.dataset.category);
    };
    chips.forEach(chip => chip.addEventListener("click", handleClick));
    return () => chips.forEach(chip => chip.removeEventListener("click", handleClick));
  }, []);

  const handleApply = async (jobId) => {
    const user = JSON.parse(localStorage.getItem("fundilinkUser"));
    if (!user) { alert("Please log in to apply."); return; }

    await fetch("http://localhost:3001/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobId,
        workerId: user.id,
        workerName: `${user.firstName} ${user.lastName}`,
        status: "pending",
        appliedAt: new Date().toISOString()
      })
    });

    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, applied: true } : j));
  };

  if (loading) return <p className="no-results">Loading jobs...</p>;

  const filtered = activeCategory === "all"
    ? jobs
    : jobs.filter(j => j.category === activeCategory);

  if (filtered.length === 0) {
    return <p className="no-results">No jobs found for this category.</p>;
  }

  return (
    <div className="job-grid">
      {filtered.map(job => (
        <JobCard key={job.id} job={job} onApply={handleApply} />
      ))}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("jobGrid")).render(<JobGrid />);