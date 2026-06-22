const API_URL =
  "https://salarycalculator.somewheretypingtest.com/api/caller/embedded-table?mode=flat";
const DEST_URL = "/contact-flow/01";

export async function initRoleSearch() {
  const input = document.getElementById("role-search-input");
  const button = document.getElementById("role-search-button");
  const dropdown = document.getElementById("role-dropdown");
  const itemTemplate = document.getElementById("role-dropdown_item");

  if (!input || !button || !dropdown || !itemTemplate) return;

  // Hide the template item — it's just a style reference
  itemTemplate.style.display = "none";

  let roles = [];
  let selectedRole = null;
  let activeIndex = -1;

  // Fetch roles from API
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    roles = [...new Set(data.map((item) => item.role).filter(Boolean))].sort();
  } catch (e) {
    console.warn("[role-search] API fetch failed:", e);
  }

  function getItems() {
    return Array.from(
      dropdown.querySelectorAll(".role-dropdown_item:not([data-template])")
    );
  }

  function renderDropdown(query) {
    // Remove all dynamic items
    getItems().forEach((el) => el.remove());
    activeIndex = -1;

    const filtered = roles
      .filter((r) => r.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 8);

    if (!filtered.length || !query.trim()) {
      closeDropdown();
      return;
    }

    filtered.forEach((role) => {
      const item = itemTemplate.cloneNode(true);
      item.removeAttribute("id");
      item.removeAttribute("data-template");
      item.style.display = "";
      item.textContent = role;
      item.style.cursor = "pointer";

      item.addEventListener("mousedown", (e) => {
        e.preventDefault(); // Prevent input blur before selection
        selectRole(role);
      });

      item.addEventListener("mouseenter", () => {
        setActiveIndex(getItems().indexOf(item));
      });

      dropdown.appendChild(item);
    });

    openDropdown();
  }

  function openDropdown() {
    dropdown.style.display = "block";
  }

  function closeDropdown() {
    dropdown.style.display = "none";
    activeIndex = -1;
  }

  function setActiveIndex(index) {
    const items = getItems();
    items.forEach((el, i) => {
      el.style.backgroundColor = i === index ? "rgba(1,58,61,0.08)" : "";
    });
    activeIndex = index;
  }

  function selectRole(role) {
    selectedRole = role;
    input.value = role;
    closeDropdown();
  }

  function navigate() {
    if (!selectedRole && input.value.trim()) {
      // Use typed value if nothing was selected from dropdown
      selectedRole = input.value.trim();
    }
    if (!selectedRole) return;
    const encoded = encodeURIComponent(selectedRole);
    window.location.href = `${DEST_URL}?role=${encoded}`;
  }

  // Input events
  input.addEventListener("input", () => {
    selectedRole = null;
    renderDropdown(input.value);
  });

  input.addEventListener("keydown", (e) => {
    const items = getItems();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(Math.min(activeIndex + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(Math.max(activeIndex - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && items[activeIndex]) {
        selectRole(items[activeIndex].textContent.trim());
      } else {
        navigate();
      }
    } else if (e.key === "Escape") {
      closeDropdown();
    }
  });

  input.addEventListener("blur", () => {
    setTimeout(closeDropdown, 150);
  });

  // Search button
  button.addEventListener("click", (e) => {
    e.preventDefault();
    navigate();
  });

  // Click outside
  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && e.target !== input) {
      closeDropdown();
    }
  });
}
