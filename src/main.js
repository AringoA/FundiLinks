(() => {
  "use strict";
  let user = null;
  try { user = JSON.parse(localStorage.getItem("fundilinkUser") || "null"); } catch { localStorage.removeItem("fundilinkUser"); }
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const protectedPages = ["jobs.html", "dashboard.html", "post-job.html", "my-applications.html"];
  if (protectedPages.includes(currentPage) && !user) { window.location.replace("login.html"); return; }
  if (user && currentPage === "dashboard.html" && user.role !== "employer") { window.location.replace("jobs.html"); return; }
  if (user && ["jobs.html", "my-applications.html"].includes(currentPage) && user.role !== "worker") { window.location.replace("dashboard.html"); return; }
  if (user && currentPage === "post-job.html" && user.role !== "employer") { window.location.replace("jobs.html"); return; }

  const navMenu = document.querySelector(".nav-menu");
  if (navMenu && user) {
    navMenu.innerHTML = user.role === "employer"
      ? '<li><a href="dashboard.html">Dashboard</a></li><li><a href="post-job.html">Post a Job</a></li><li><a href="#" id="logoutBtn">Log Out</a></li>'
      : '<li><a href="jobs.html">Browse Jobs</a></li><li><a href="my-applications.html">My Applications</a></li><li><a href="#" id="logoutBtn">Log Out</a></li>';
    document.getElementById("logoutBtn")?.addEventListener("click", e => {
      e.preventDefault(); localStorage.removeItem("fundilinkUser"); window.location.href = "login.html";
    });
  }
  const hamburger = document.getElementById("hamburger");
  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      const open = navMenu.classList.toggle("open");
      hamburger.setAttribute("aria-expanded", String(open));
      hamburger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      hamburger.textContent = open ? "✕" : "☰";
    });
    navMenu.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      navMenu.classList.remove("open"); hamburger.textContent = "☰"; hamburger.setAttribute("aria-expanded", "false");
    }));
  }
  document.querySelectorAll('.nav-menu a[href^="#"]').forEach(link => link.addEventListener("click", e => {
    const target = document.querySelector(link.getAttribute("href"));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth" }); }
  }));
  const header = document.querySelector("header");
  if (header) window.addEventListener("scroll", () => header.classList.toggle("scrolled", window.scrollY > 10), { passive: true });
})();