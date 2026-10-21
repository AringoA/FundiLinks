(() => {
  "use strict";
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const tabLogin = document.getElementById("tabLogin");
  const tabRegister = document.getElementById("tabRegister");
  if (!loginForm || !registerForm || !tabLogin || !tabRegister) return;
  const showLogin = () => { loginForm.classList.remove("hidden"); registerForm.classList.add("hidden"); tabLogin.classList.add("active"); tabRegister.classList.remove("active"); };
  const showRegister = () => { loginForm.classList.add("hidden"); registerForm.classList.remove("hidden"); tabLogin.classList.remove("active"); tabRegister.classList.add("active"); };
  tabLogin.addEventListener("click", e => { e.preventDefault(); showLogin(); });
  tabRegister.addEventListener("click", e => { e.preventDefault(); showRegister(); });
  document.getElementById("switchToRegister")?.addEventListener("click", e => { e.preventDefault(); showRegister(); });
  document.getElementById("switchToLogin")?.addEventListener("click", e => { e.preventDefault(); showLogin(); });
  const api = "http://localhost:3001";
  loginForm.addEventListener("submit", async e => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;
    if (!email || !password) return alert("Please fill in all fields.");
    try {
      const res = await fetch(api + "/users?email=" + encodeURIComponent(email));
      if (!res.ok) throw new Error("Request failed");
      const users = await res.json();
      const user = users.find(u => u.password === password);
      if (!user) return alert("Invalid email or password.");
      localStorage.setItem("fundilinkUser", JSON.stringify(user));
      window.location.href = user.role === "employer" ? "dashboard.html" : "jobs.html";
    } catch { alert("Could not reach the API. Start it with npm start and try again."); }
  });
  registerForm.addEventListener("submit", async e => {
    e.preventDefault();
    const firstName = document.getElementById("regFirstName").value.trim();
    const lastName = document.getElementById("regLastName").value.trim();
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const password = document.getElementById("regPassword").value;
    const role = document.getElementById("regRole").value;
    if (![firstName, lastName, email, password, role].every(Boolean)) return alert("Please fill in all fields.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert("Enter a valid email address.");
    if (password.length < 8) return alert("Password must be at least 8 characters.");
    try {
      const res = await fetch(api + "/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ firstName, lastName, email, password, role }) });
      const result = await res.json();
      if (!res.ok) return alert(result.message || "Registration failed.");
      localStorage.setItem("fundilinkUser", JSON.stringify(result));
      window.location.href = result.role === "employer" ? "dashboard.html" : "jobs.html";
    } catch { alert("Could not reach the API. Start it with npm start and try again."); }
  });
})();