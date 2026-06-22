export function initRoleInjector() {
  const span = document.getElementById("role-name-header");
  if (!span) return;

  const params = new URLSearchParams(window.location.search);
  const role = params.get("role");

  if (role && role.trim() !== "") {
    span.textContent = decodeURIComponent(role);
    span.style.display = "";
  } else {
    span.style.display = "none";
  }
}
