(() => {
  const user = (() => { try { return JSON.parse(localStorage.getItem("fundilinkUser") || "null"); } catch { return null; } })();
  if (!user) { window.location.replace("login.html"); return; }
  const name = document.getElementById("dashName");
  if (name) name.textContent = ", " + (user.firstName || "");
  const logout = document.getElementById("logoutBtn");
  logout?.addEventListener("click", e => { e.preventDefault(); localStorage.removeItem("fundilinkUser"); window.location.href = "login.html"; });
  const container = document.getElementById("employerJobs");
  if (!container) return;
  fetch("http://localhost:3001/jobs?employerId=" + encodeURIComponent(user.id))
    .then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .then(jobs => {
      if (!jobs.length) return;
      container.innerHTML = "";
      jobs.filter(j => String(j.employerId) === String(user.id)).forEach(job => {
        const card = document.createElement("article"); card.className = "job-card";
        const title = document.createElement("h3"); title.textContent = job.title;
        const details = document.createElement("p"); details.textContent = job.location + " · KES " + Number(job.pay).toLocaleString() + " · " + (job.status || (job.isActive ? "active" : "cancelled"));
        card.append(title, details); container.appendChild(card);
      });
    }).catch(() => { container.textContent = "Could not load your jobs. Please try again."; });
})();