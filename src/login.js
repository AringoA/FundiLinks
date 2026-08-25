const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const tabLogin = document.getElementById("tabLogin");
const tabRegister = document.getElementById("tabRegister");

// ── Tab switching ─────────────────────────────────────────────────────────────
function showLogin() {
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
  tabLogin.classList.add("active");
  tabRegister.classList.remove("active");
}

function showRegister() {
  loginForm.classList.add("hidden");
  registerForm.classList.remove("hidden");
  tabLogin.classList.remove("active");
  tabRegister.classList.add("active");
}

tabLogin.addEventListener("click", (e) => { e.preventDefault(); showLogin(); });
tabRegister.addEventListener("click", (e) => { e.preventDefault(); showRegister(); });
document.getElementById("switchToRegister").addEventListener("click", (e) => { e.preventDefault(); showRegister(); });
document.getElementById("switchToLogin").addEventListener("click", (e) => { e.preventDefault(); showLogin(); });

// ── Login ─────────────────────────────────────────────────────────────────────
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!email || !password) { alert("Please fill in all fields."); return; }

  try {
    const res = await fetch(`http://localhost:3001/users?email=${encodeURIComponent(email)}`);
    const users = await res.json();
    const user = users.find(u => u.password === password);

    if (!user) { alert("Invalid email or password."); return; }

    localStorage.setItem("fundilinkUser", JSON.stringify(user));

    // Redirect based on role
    if (user.role === "employer") {
      window.location.href = "dashboard.html";
    } else {
      window.location.href = "jobs.html";
    }

  } catch (error) {
    alert("Could not reach server. Is json-server running on port 3001?");
  }
});

// ── Register ──────────────────────────────────────────────────────────────────
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const firstName = document.getElementById("regFirstName").value.trim();
  const lastName  = document.getElementById("regLastName").value.trim();
  const email     = document.getElementById("regEmail").value.trim();
  const password  = document.getElementById("regPassword").value.trim();
  const role      = document.getElementById("regRole").value;

  if (!firstName || !lastName || !email || !password || !role) {
    alert("Please fill in all fields."); return;
  }
  if (password.length < 8) {
    alert("Password must be at least 8 characters."); return;
  }

  try {
    const res = await fetch("http://localhost:3001/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, password, role })
    });

    const newUser = await res.json();
    localStorage.setItem("fundilinkUser", JSON.stringify(newUser));

    if (newUser.role === "employer") {
      window.location.href = "dashboard.html";
    } else {
      window.location.href = "jobs.html";
    }

  } catch (error) {
    alert("Could not reach server. Is json-server running on port 3001?");
  }
});