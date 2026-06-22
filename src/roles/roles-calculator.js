/* ─────────────────────────────────────────────────────────────────────────────
   roles/salary-calculator.js
   Salary calculator for Role collection pages.
   Reads #smw-api-role-key (CMS-bound hidden element) to match the page role
   against the API, then renders data directly — no dropdown.
───────────────────────────────────────────────────────────────────────────── */

var API_URL =
  "https://salarycalculator.somewheretypingtest.com/api/caller/embedded-table?mode=flat";

var REC_LABEL = {
  "Latin America": "LATAM",
  "South Africa": "South Africa",
  Philippines: "Philippines",
};

var REC_FIELDS = {
  "Latin America": { j: "juniorLatinAmerica", m: "midLevelLatinAmerica", s: "seniorLatinAmerica" },
  "South Africa":  { j: "juniorSa",           m: "midLevelSa",           s: "seniorSa" },
  Philippines:     { j: "juniorPh",           m: "midLevelPh",           s: "seniorPh" },
};

var SAV_FIELDS = {
  "Latin America": { j: "savingJuniorLatinAmerica", m: "savingMidLevelLatinAmerica", s: "savingSeniorLatinAmerica" },
  "South Africa":  { j: "savingJuniorSa",           m: "savingMidLevelSa",           s: "savingSeniorSa" },
  Philippines:     { j: "savingJuniorPh",           m: "savingMidLevelPh",           s: "savingSeniorPh" },
};

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

export function initRoleCalculator() {
  var calc = document.getElementById("calculator");
  if (!calc) return;

  var keyEl = document.getElementById("smw-api-role-key");
  var pageRoleKey = keyEl ? keyEl.textContent.trim() : "";

  var elSavingsJunior  = document.getElementById("savings-junior");
  var elSavingsMid     = document.getElementById("savings-mid-level");
  var elSavingsSenior  = document.getElementById("savings-senior");
  var elSavingsUpTo    = document.getElementById("savings-up-to");
  var elTitle          = document.getElementById("savings-recommend-title");
  var elDesc           = document.getElementById("savings-recommend-description");
  var elJuniorUS       = document.getElementById("savings-junior-us");
  var elJuniorLatAM    = document.getElementById("savings-junior-LatAM");
  var elJuniorSA       = document.getElementById("savings-junior-south-africa");
  var elJuniorPh       = document.getElementById("savings-junior-philippines");
  var elMidUS          = document.getElementById("savings-mid-level-us");
  var elMidLatAM       = document.getElementById("savings-mid-level-LatAM");
  var elMidSA          = document.getElementById("savings-mid-level-south-africa");
  var elMidPh          = document.getElementById("savings-mid-level-philippines");
  var elSeniorUS       = document.getElementById("savings-senior-us");
  var elSeniorLatAM    = document.getElementById("savings-senior-LatAM");
  var elSeniorSA       = document.getElementById("savings-senior-south-africa");
  var elSeniorPh       = document.getElementById("savings-senior-philippines");


  function animEls() {
    var items = [];
    [elSavingsJunior, elSavingsMid, elSavingsSenior].forEach(function (el) {
      if (el) items.push({ el: el, lime: true });
    });
    if (elSavingsUpTo) items.push({ el: elSavingsUpTo, lime: true });
    if (elTitle)       items.push({ el: elTitle,       lime: false });
    if (elDesc)        items.push({ el: elDesc,        lime: false });
    [elJuniorUS, elJuniorLatAM, elJuniorSA, elJuniorPh,
     elMidUS, elMidLatAM, elMidSA, elMidPh,
     elSeniorUS, elSeniorLatAM, elSeniorSA, elSeniorPh].forEach(function (el) {
      if (el) items.push({ el: el, lime: false });
    });
    return items;
  }

  function applyData(item) {
    var rec     = item.recommendation || "Latin America";
    var recLbl  = REC_LABEL[rec] || rec;
    var rFields = REC_FIELDS[rec] || REC_FIELDS["Latin America"];
    var sFields = SAV_FIELDS[rec] || SAV_FIELDS["Latin America"];

    if (elSavingsJunior) elSavingsJunior.textContent = fmtPct(item[sFields.j]);
    if (elSavingsMid)    elSavingsMid.textContent    = fmtPct(item[sFields.m]);
    if (elSavingsSenior) elSavingsSenior.textContent = fmtPct(item[sFields.s]);

    var seniorUs  = parseMoney(item.seniorUs);
    var seniorRec = parseMoney(item[rFields.s]);
    var maxSavAnn = (seniorUs - seniorRec) * 12;
    if (elSavingsUpTo)
      elSavingsUpTo.textContent =
        maxSavAnn >= 1000
          ? "$" + (maxSavAnn / 1000).toFixed(1).replace(".0", "") + "K"
          : "$" + Math.round(maxSavAnn);

    if (elTitle) elTitle.textContent = "We recommend " + recLbl + " for this role";
    if (elDesc)  elDesc.textContent  = item.recommendationReason || "";

    if (elJuniorUS)    elJuniorUS.textContent    = fmtAnn(item.juniorUs);
    if (elJuniorLatAM) elJuniorLatAM.textContent = fmtAnn(item.juniorLatinAmerica);
    if (elJuniorSA)    elJuniorSA.textContent    = fmtAnn(item.juniorSa);
    if (elJuniorPh)    elJuniorPh.textContent    = fmtAnn(item.juniorPh);
    if (elMidUS)       elMidUS.textContent       = fmtAnn(item.midLevelUs);
    if (elMidLatAM)    elMidLatAM.textContent    = fmtAnn(item.midLevelLatinAmerica);
    if (elMidSA)       elMidSA.textContent       = fmtAnn(item.midLevelSa);
    if (elMidPh)       elMidPh.textContent       = fmtAnn(item.midLevelPh);
    if (elSeniorUS)    elSeniorUS.textContent    = fmtAnn(item.seniorUs);
    if (elSeniorLatAM) elSeniorLatAM.textContent = fmtAnn(item.seniorLatinAmerica);
    if (elSeniorSA)    elSeniorSA.textContent    = fmtAnn(item.seniorSa);
    if (elSeniorPh)    elSeniorPh.textContent    = fmtAnn(item.seniorPh);
  }

  skelOn(animEls());

  fetch(API_URL, { headers: { accept: "application/json" } })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) {
      if (!data || !data.length) throw new Error("Empty API response");

      var matched = null;
      if (pageRoleKey) {
        for (var i = 0; i < data.length; i++) {
          if (data[i].role === pageRoleKey) { matched = data[i]; break; }
        }
      }

      if (!matched) {
        console.warn('[RoleCalculator] No API match for "' + pageRoleKey + '". Falling back to first item.');
        matched = data[0];
      }

      var els = animEls();
      skelOff(els);
      setTimeout(function () { applyData(matched); }, els.length * 28 + 50);
    })
    .catch(function (err) {
      console.warn("[RoleCalculator] API error:", err.message);
      skelOff(animEls());
    });
}