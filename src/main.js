// ── Auth guard + dynamic nav ──────────────────────────────────────────────────
const user = JSON.parse(localStorage.getItem("fundilinkUser"));
const currentPage = window.location.pathname.split("/").pop();

// Pages that require login
const protectedPages = ["jobs.html", "dashboard.html", "post-job.html", "my-applications.html"];

if (protectedPages.includes(currentPage) && !user) {
  window.location.href = "login.html";
}

// Wrong role redirect
if (user && currentPage === "dashboard.html" && user.role !== "employer") {
  window.location.href = "jobs.html";
}
if (user && currentPage === "jobs.html" && user.role !== "worker") {
  window.location.href = "dashboard.html";
}

// Update nav based on role
const navMenu = document.querySelector(".nav-menu");
if (navMenu && user) {
  if (user.role === "employer") {
    navMenu.innerHTML = `
      <li><a href="dashboard.html">Dashboard</a></li>
      <li><a href="post-job.html">Post a Job</a></li>
      <li><a href="#" id="logoutBtn">Log Out</a></li>
    `;
  } else {
    navMenu.innerHTML = `
      <li><a href="jobs.html">Browse Jobs</a></li>
      <li><a href="my-applications.html">My Applications</a></li>
      <li><a href="#" id="logoutBtn">Log Out</a></li>
    `;
  }

  document.getElementById("logoutBtn").addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("fundilinkUser");
    window.location.href = "login.html";
  });
}

// ── Hamburger menu ────────────────────────────────────────────────────────────
const hamburger = document.getElementById("hamburger");
if (hamburger && navMenu) {
  hamburger.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    hamburger.setAttribute("aria-expanded", isOpen);
    hamburger.innerHTML = isOpen ? "✕" : "☰";
  });

  navMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("open");
      hamburger.innerHTML = "☰";
      hamburger.setAttribute("aria-expanded", false);
    });
  });
}

// ── Smooth scroll ─────────────────────────────────────────────────────────────
document.querySelectorAll('.nav-menu a[href^="#"]').forEach(link => {
  link.addEventListener("click", e => {
    const target = document.querySelector(link.getAttribute("href"));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth" }); }
  });
});

// ── Sticky header shadow ──────────────────────────────────────────────────────
const header = document.querySelector("header");
if (header) {
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 10);
  }, { passive: true });
}