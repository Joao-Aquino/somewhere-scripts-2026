/* ─────────────────────────────────────────────────────────────────────────────
   Salary Calculator — widget shared across multiple pages:
   /, /services/talent-on-demand, /guides/global-hiring-guide, /industry/*

   Refactored from IIFE to export function so it only runs when explicitly
   called from global.js — prevents the IIFE from executing on every page.
───────────────────────────────────────────────────────────────────────────── */

/* ── Styles ─────────────────────────────────────────────────────── */
var _smwStylesInjected = false;
function injectSmwStyles() {
  if (_smwStylesInjected) return;
  _smwStylesInjected = true;
  var st = document.createElement("style");
  st.textContent =
    "@keyframes smw-shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}" +
    "@keyframes smw-fadein{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}" +
    ".smw-sk{color:transparent!important;background:linear-gradient(90deg,rgba(255,255,255,.05) 25%,rgba(255,255,255,.16) 50%,rgba(255,255,255,.05) 75%);background-size:400px 100%;animation:smw-shimmer 1.1s ease-in-out infinite;border-radius:4px;pointer-events:none;user-select:none}" +
    ".smw-sk-lime{color:transparent!important;background:linear-gradient(90deg,rgba(13,61,46,.07) 25%,rgba(13,61,46,.18) 50%,rgba(13,61,46,.07) 75%);background-size:400px 100%;animation:smw-shimmer 1.1s ease-in-out infinite;border-radius:4px;pointer-events:none;user-select:none}" +
    ".smw-in{animation:smw-fadein .32s cubic-bezier(.22,1,.36,1) both}" +
    "#smw-dd{position:relative;width:100%}" +
    "#smw-dd-input{display:flex;align-items:center;gap:.5rem;width:100%;padding:.75rem 1rem;background:#0c796c;color:white;border:1px solid rgba(255,255,255,0.25);border-radius:9999px;font-size:16px;font-family:inherit;box-sizing:border-box;cursor:text}" +
    "#smw-dd-search{flex:1;background:none;border:none;outline:none;color:white;font-size:16px;font-family:inherit;min-width:0}" +
    "#smw-dd-search::placeholder{color:rgba(255,255,255,.6)}" +
    "#smw-dd-search-icon{width:16px;height:16px;flex-shrink:0;color:rgba(255,255,255,.6)}" +
    "#smw-dd-clear{width:16px;height:16px;flex-shrink:0;color:rgba(255,255,255,.5);cursor:pointer;display:none;background:none;border:none;padding:0;line-height:1}" +
    "#smw-dd-clear.smw-visible{display:block}" +
    "#smw-dd-list{display:none;position:absolute;top:calc(100% + .5rem);left:0;right:0;z-index:999;background:#0c796c;border-radius:1rem;padding:.5rem;max-height:300px;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,.28);scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.2) transparent}" +
    "#smw-dd-list.smw-open{display:block}" +
    ".smw-sector{display:block;padding:.35rem .75rem .2rem;color:rgba(255,255,255,.5);font-size:11px;font-family:inherit;font-weight:600;letter-spacing:.08em;text-transform:uppercase;cursor:default;pointer-events:none}" +
    ".smw-opt{display:block;width:100%;padding:.45rem .75rem;color:#d1fae1;font-size:15px;font-family:inherit;text-align:left;cursor:pointer;border-radius:.75rem;background:none;border:none;transition:background .12s;box-sizing:border-box}" +
    ".smw-opt:hover{background:#169082}" +
    ".smw-opt.smw-sel{background:rgba(255,255,255,.12);color:white;font-weight:500}" +
    ".smw-opt.smw-hidden{display:none}" +
    ".calculator_calculator-wrapper{overflow:visible!important}" +
    "#smw-dd-empty{padding:.75rem;color:rgba(255,255,255,.5);font-size:14px;font-family:inherit;text-align:center;display:none}" +
    "#smw-dd-empty.smw-visible{display:block}";
  document.head.appendChild(st);
}

/* ── API config ──────────────────────────────────────────────────── */
var API_URL =
  "https://salarycalculator.somewheretypingtest.com/api/caller/embedded-table?mode=flat";

/* ── Maps ────────────────────────────────────────────────────────── */
var REC_LABEL = {
  "Latin America": "LATAM",
  "South Africa": "South Africa",
  Philippines: "Philippines",
};
var REC_FIELDS = {
  "Latin America": { j: "juniorLatinAmerica", m: "midLevelLatinAmerica", s: "seniorLatinAmerica" },
  "South Africa": { j: "juniorSa", m: "midLevelSa", s: "seniorSa" },
  Philippines: { j: "juniorPh", m: "midLevelPh", s: "seniorPh" },
};
var SAV_FIELDS = {
  "Latin America": { j: "savingJuniorLatinAmerica", m: "savingMidLevelLatinAmerica", s: "savingSeniorLatinAmerica" },
  "South Africa": { j: "savingJuniorSa", m: "savingMidLevelSa", s: "savingSeniorSa" },
  Philippines: { j: "savingJuniorPh", m: "savingMidLevelPh", s: "savingSeniorPh" },
};

/* ── Helpers ────────────────────────────────────────────────────── */
function parseMoney(str) {
  if (!str) return 0;
  return parseFloat(String(str).replace(/[$,\s]/g, "")) || 0;
}
function fmtAnn(str) {
  var n = parseMoney(str) * 12;
  if (!n) return "N/A";
  return n >= 1000 ? "$" + (n / 1000).toFixed(1).replace(".0", "") + "K" : "$" + n;
}
function fmtPct(str) {
  return str ? String(str).trim() : "N/A";
}
function skelOn(els) {
  els.forEach(function (e) {
    e.el.classList.remove("smw-in");
    e.el.classList.add(e.lime ? "smw-sk-lime" : "smw-sk");
  });
}
function skelOff(els) {
  els.forEach(function (e, i) {
    setTimeout(function () {
      e.el.classList.remove("smw-sk", "smw-sk-lime");
      e.el.classList.add("smw-in");
      setTimeout(function () { e.el.classList.remove("smw-in"); }, 380);
    }, i * 28);
  });
}

/* ── Main init ───────────────────────────────────────────────────── */
export function initCalculator() {
  injectSmwStyles();

  var calc = document.getElementById("calculator");
  if (!calc) return;

  /* ── DOM refs ─────────────────────────────────────────────────── */
  var elSavingsJunior      = document.getElementById("savings-junior");
  var elSavingsMid         = document.getElementById("savings-mid-level");
  var elSavingsSenior      = document.getElementById("savings-senior");
  var elSavingsUpTo        = document.getElementById("savings-up-to");
  var elRecTitle           = document.getElementById("savings-recommend-title");
  var elRecDesc            = document.getElementById("savings-recommend-description");
  var elJuniorUs           = document.getElementById("savings-junior-us");
  var elJuniorLatam        = document.getElementById("savings-junior-LatAM");
  var elJuniorSa           = document.getElementById("savings-junior-south-africa");
  var elJuniorPh           = document.getElementById("savings-junior-philippines");
  var elMidUs              = document.getElementById("savings-mid-level-us");
  var elMidLatam           = document.getElementById("savings-mid-level-LatAM");
  var elMidSa              = document.getElementById("savings-mid-level-south-africa");
  var elMidPh              = document.getElementById("savings-mid-level-philippines");
  var elSeniorUs           = document.getElementById("savings-senior-us");
  var elSeniorLatam        = document.getElementById("savings-senior-LatAM");
  var elSeniorSa           = document.getElementById("savings-senior-south-africa");
  var elSeniorPh           = document.getElementById("savings-senior-philippines");

  function animEls() {
    var f = [];
    [elSavingsJunior, elSavingsMid, elSavingsSenior].forEach(function (x) { x && f.push({ el: x, lime: true }); });
    elSavingsUpTo && f.push({ el: elSavingsUpTo, lime: true });
    elRecTitle    && f.push({ el: elRecTitle,    lime: false });
    elRecDesc     && f.push({ el: elRecDesc,     lime: false });
    [elJuniorUs, elJuniorLatam, elJuniorSa, elJuniorPh,
     elMidUs, elMidLatam, elMidSa, elMidPh,
     elSeniorUs, elSeniorLatam, elSeniorSa, elSeniorPh]
      .forEach(function (x) { x && f.push({ el: x, lime: false }); });
    return f;
  }

  function applyData(row) {
    var rec    = row.recommendation || "Latin America";
    var label  = REC_LABEL[rec]  || rec;
    var rFields = REC_FIELDS[rec] || REC_FIELDS["Latin America"];
    var sFields = SAV_FIELDS[rec] || SAV_FIELDS["Latin America"];

    elSearch.value = row.role;
    elSearch.setAttribute("data-selected", row.role);
    elClear.classList.add("smw-visible");

    elSavingsJunior && (elSavingsJunior.textContent = fmtPct(row[sFields.j]));
    elSavingsMid    && (elSavingsMid.textContent    = fmtPct(row[sFields.m]));
    elSavingsSenior && (elSavingsSenior.textContent = fmtPct(row[sFields.s]));

    var senUs = parseMoney(row.seniorUs);
    var senRec = parseMoney(row[rFields.s]);
    var saving = (senUs - senRec) * 12;
    elSavingsUpTo && (elSavingsUpTo.textContent =
      saving >= 1000
        ? "$" + (saving / 1000).toFixed(1).replace(".0", "") + "K"
        : "$" + Math.round(saving));

    elRecTitle && (elRecTitle.textContent = "We recommend " + label + " for this role");
    elRecDesc  && (elRecDesc.textContent  = row.recommendationReason || "");

    elJuniorUs    && (elJuniorUs.textContent    = fmtAnn(row.juniorUs));
    elJuniorLatam && (elJuniorLatam.textContent = fmtAnn(row.juniorLatinAmerica));
    elJuniorSa    && (elJuniorSa.textContent    = fmtAnn(row.juniorSa));
    elJuniorPh    && (elJuniorPh.textContent    = fmtAnn(row.juniorPh));
    elMidUs       && (elMidUs.textContent       = fmtAnn(row.midLevelUs));
    elMidLatam    && (elMidLatam.textContent    = fmtAnn(row.midLevelLatinAmerica));
    elMidSa       && (elMidSa.textContent       = fmtAnn(row.midLevelSa));
    elMidPh       && (elMidPh.textContent       = fmtAnn(row.midLevelPh));
    elSeniorUs    && (elSeniorUs.textContent    = fmtAnn(row.seniorUs));
    elSeniorLatam && (elSeniorLatam.textContent = fmtAnn(row.seniorLatinAmerica));
    elSeniorSa    && (elSeniorSa.textContent    = fmtAnn(row.seniorSa));
    elSeniorPh    && (elSeniorPh.textContent    = fmtAnn(row.seniorPh));
  }

  function render(row) {
    var els = animEls();
    skelOn(els);
    setTimeout(function () { applyData(row); skelOff(els); }, 380);
  }

  /* ── Build dropdown ───────────────────────────────────────────── */
  // Match any Webflow dropdown variant used across pages
  var existingWf = calc.querySelector(".dropdown2_component, .calculator-dropdown_component, .w-dropdown");
  existingWf && (existingWf.style.display = "none");

  var dd = document.createElement("div");
  dd.id = "smw-dd";
  dd.innerHTML =
    '<div id="smw-dd-input">' +
      '<svg id="smw-dd-search-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 12A5 5 0 1 0 7 2a5 5 0 0 0 0 10ZM14 14l-3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
      '<input id="smw-dd-search" type="text" placeholder="Search role..." autocomplete="off" />' +
      '<button id="smw-dd-clear" aria-label="Clear">&#x2715;</button>' +
    '</div>' +
    '<div id="smw-dd-list" role="listbox"><div id="smw-dd-empty">No roles found</div></div>';

  // Insert after native dropdown if found, else prepend into dropdown wrapper
  var insertTarget = existingWf || calc.querySelector(".calculator_dropdown-wrapper");
  existingWf
    ? existingWf.insertAdjacentElement("afterend", dd)
    : insertTarget.prepend(dd);

  var elSearch = document.getElementById("smw-dd-search");
  var elList   = document.getElementById("smw-dd-list");
  var elClear  = document.getElementById("smw-dd-clear");
  var elEmpty  = document.getElementById("smw-dd-empty");

  function openDD()  { elList.classList.add("smw-open"); }
  function closeDD() { elList.classList.remove("smw-open"); }

  function filterList(q) {
    var query = q.trim().toLowerCase();
    var sectors = elList.querySelectorAll(".smw-sector");
    var anyVisible = false;
    sectors.forEach(function (sec) {
      var hasVisible = false;
      var node = sec.nextElementSibling;
      while (node && !node.classList.contains("smw-sector")) {
        var match = !query || node.textContent.toLowerCase().includes(query);
        node.classList.toggle("smw-hidden", !match);
        if (match) { hasVisible = true; anyVisible = true; }
        node = node.nextElementSibling;
      }
      sec.style.display = hasVisible ? "" : "none";
    });
    elEmpty.classList.toggle("smw-visible", !anyVisible);
  }

  function buildDropdown(data) {
    var bysector = {};
    data.forEach(function (row) {
      bysector[row.sector] = bysector[row.sector] || [];
      bysector[row.sector].push(row);
    });
    elList.querySelectorAll(".smw-sector, .smw-opt").forEach(function (n) { n.remove(); });
    Object.keys(bysector).forEach(function (sector) {
      var hdr = document.createElement("div");
      hdr.className = "smw-sector";
      hdr.textContent = sector;
      elList.insertBefore(hdr, elEmpty);
      bysector[sector].forEach(function (row) {
        var btn = document.createElement("button");
        btn.className = "smw-opt";
        btn.setAttribute("role", "option");
        btn.textContent = row.role;
        btn.addEventListener("click", function (e) {
          e.stopPropagation();
          elList.querySelectorAll(".smw-opt").forEach(function (o) { o.classList.remove("smw-sel"); });
          btn.classList.add("smw-sel");
          closeDD();
          render(row);
        });
        elList.insertBefore(btn, elEmpty);
      });
    });
  }

  /* ── Events ───────────────────────────────────────────────────── */
  elSearch.addEventListener("focus",  function () { elSearch.select(); filterList(elSearch.value); openDD(); });
  elSearch.addEventListener("input",  function () { filterList(elSearch.value); openDD(); elClear.classList.toggle("smw-visible", elSearch.value.length > 0); });
  elClear.addEventListener("click",   function () { elSearch.value = ""; elClear.classList.remove("smw-visible"); filterList(""); elSearch.focus(); });
  document.addEventListener("click",  function (e) { dd.contains(e.target) || closeDD(); });
  elSearch.addEventListener("keydown", function (e) { e.key === "Escape" && (closeDD(), elSearch.blur()); });

  /* ── Fetch & render ───────────────────────────────────────────── */
  skelOn(animEls());
  fetch(API_URL, { headers: { accept: "application/json" } })
    .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then(function (data) {
      buildDropdown(data);
      var first = (window.SMW_DEFAULT_ROLE
        ? data.find(function (d) { return d.role === window.SMW_DEFAULT_ROLE; })
        : null) || data[0];
      if (first) {
        elList.querySelectorAll(".smw-opt").forEach(function (o) {
          if (o.textContent === first.role) o.classList.add("smw-sel");
        });
        skelOff(animEls());
        setTimeout(function () { applyData(first); }, data.length * 28 + 50);
      }
    })
    .catch(function (err) {
      console.warn("[Calculator] API unavailable:", err.message);
      elSearch.placeholder = "CORS pending…";
      skelOff(animEls());
    });
}