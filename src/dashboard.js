const user = JSON.parse(localStorage.getItem("fundilinkUser"));

if (!user) {
  window.location.href = "login.html";
} else {
  document.getElementById("dashName").textContent = `, ${user.firstName}`;
}

document.getElementById("logoutBtn").addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("fundilinkUser");
  window.location.href = "login.html";
});