/* ============================================================
   BPO CALCULATOR — v1.2.0
   + Skeleton load no primeiro render
   + Skeleton na troca de plano e mudança de salary
   + Avatares dinâmicos por plano
   ============================================================ */
export function initBpoCalculator() {

  // ─── STYLES ───────────────────────────────────────────────
  const st = document.createElement("style");
  st.textContent =
    "@keyframes bpo-shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}" +
    "@keyframes bpo-fadein{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}" +
    ".bpo-sk{color:transparent!important;background:linear-gradient(90deg,rgba(255,255,255,.07) 25%,rgba(255,255,255,.18) 50%,rgba(255,255,255,.07) 75%);background-size:400px 100%;animation:bpo-shimmer 1.1s ease-in-out infinite;border-radius:4px;pointer-events:none;user-select:none}" +
    ".bpo-sk-lime{color:transparent!important;background:linear-gradient(90deg,rgba(13,61,46,.07) 25%,rgba(13,61,46,.18) 50%,rgba(13,61,46,.07) 75%);background-size:400px 100%;animation:bpo-shimmer 1.1s ease-in-out infinite;border-radius:4px;pointer-events:none;user-select:none}" +
    ".bpo-in{animation:bpo-fadein .32s cubic-bezier(.22,1,.36,1) both}" +
    // Pseudo-elemento para cobrir wrappers com imagens filhas
    "#calc-avatars.bpo-sk{position:relative;background:none!important;animation:none!important}" +
    "#calc-avatars.bpo-sk::after{content:'';position:absolute;inset:0;border-radius:4px;background:linear-gradient(90deg,rgba(255,255,255,.07) 25%,rgba(255,255,255,.18) 50%,rgba(255,255,255,.07) 75%);background-size:400px 100%;animation:bpo-shimmer 1.1s ease-in-out infinite;z-index:1}";
  document.head.appendChild(st);

  // ─── CONFIG ───────────────────────────────────────────────
  const SLIDER_MIN        = 50000;
  const SLIDER_MAX        = 130000;
  const SLIDER_DEFAULT    = 50000;
  const STEP              = 1000;
  const LIVE_HIDE_DELAY   = 1200;
  const SKELETON_DURATION = 320;

  const PLANS = {
    "Starter Pod": {
      teamDescription: "1 SDR + QA + Team Lead",
      teamBenefit:     "3 man pod to supercharge your sales",
      sdrMultiplier:   3,
      somewherePrice:  54000,
      planLabel:       "Somewhere Starter Pod Plan Price",
    },
    "Growth Pod": {
      teamDescription: "1 SDRs + 0.5 Shared SDR + QA + Team Lead + Tech stack integration",
      teamBenefit:     "4 man pod to supercharge your sales",
      sdrMultiplier:   4.5,
      somewherePrice:  90000,
      planLabel:       "Somewhere Growth Pod Plan Price",
    },
    "Hyper Pod": {
      teamDescription: "2 SDRs + Team Lead + QA + Tech stack integration",
      teamBenefit:     "5 man pod to supercharge your sales",
      sdrMultiplier:   5,
      somewherePrice:  150000,
      planLabel:       "Somewhere Hyper Pod Plan Price",
    },
  };

  const RATIOS = {
    benefits:    0.18,
    taxes:       0.065,
    software:    0.045,
    management:  0.12,
    recruitment: 0.20,
  };

  // ─── STATE ────────────────────────────────────────────────
  let selectedPlan = "Starter Pod";
  let salaryValue  = SLIDER_DEFAULT;
  let dragging     = false;
  const hideTimers = new Map();

  // ─── HELPERS ──────────────────────────────────────────────
  function $(id) { return document.getElementById(id); }
  function clamp(v, mn, mx) { return Math.min(mx, Math.max(mn, v)); }
  function snap(v, s) { return Math.round(v / s) * s; }
  function fmt$(n) { return "$" + Math.round(n).toLocaleString("en-US"); }

  // ─── SKELETON ─────────────────────────────────────────────
  function getSkeletonEls() {
    return [
      { id: "calc-avatars" },
      { id: "calc-team-description" },
      { id: "calc-team-description-benefit" },
      { id: "calc-cost-total-year" },
      { id: "calc-cost-somewhere-year" },
      { id: "calc-save-year", lime: true },
      { id: "calc-salary-cost" },
      { id: "calc-average-benefit" },
      { id: "calc-average-taxes" },
      { id: "calc-average-fee" },
      { id: "calc-average-tools" },
      { id: "calc-average-managment" },
      { id: "calc-average-us-team" },
      { id: "calc-average-somewhere-team" },
    ];
  }

  function skelOn() {
    getSkeletonEls().forEach(({ id, lime }) => {
      document.querySelectorAll("#" + id).forEach(el => {
        el.classList.remove("bpo-in");
        el.classList.add(lime ? "bpo-sk-lime" : "bpo-sk");
      });
    });
  }

  function skelOff() {
    getSkeletonEls().forEach(({ id, lime }, i) => {
      document.querySelectorAll("#" + id).forEach(el => {
        setTimeout(() => {
          el.classList.remove("bpo-sk", "bpo-sk-lime");
          el.classList.add("bpo-in");
          setTimeout(() => el.classList.remove("bpo-in"), 380);
        }, i * 28);
      });
    });
  }

  // ─── CALCULATE ────────────────────────────────────────────
  function calculate(plan) {
    const base        = salaryValue * plan.sdrMultiplier;
    const benefits    = base * RATIOS.benefits;
    const taxes       = base * RATIOS.taxes;
    const software    = base * RATIOS.software;
    const management  = base * RATIOS.management;
    const recruitment = base * RATIOS.recruitment;
    const totalUS     = base + benefits + taxes + recruitment + software + management;
    const savings     = totalUS - plan.somewherePrice;
    return { base, benefits, taxes, recruitment, software, management, totalUS, savings };
  }

  // ─── AVATARES ─────────────────────────────────────────────
  function updateAvatars() {
    const growth = $("calc-avatar-growth");
    const hyper  = $("calc-avatar-hyper");
    if (!growth || !hyper) return;

    if (selectedPlan === "Starter Pod") {
      growth.style.display = "none";
      hyper.style.display  = "none";
    } else if (selectedPlan === "Growth Pod") {
      growth.style.display = "";
      hyper.style.display  = "none";
    } else if (selectedPlan === "Hyper Pod") {
      growth.style.display = "";
      hyper.style.display  = "";
    }
  }

  // ─── APPLY DATA ───────────────────────────────────────────
  function applyData() {
    const plan = PLANS[selectedPlan];
    const calc = calculate(plan);

    // Team descriptions (ID duplicado — Step 1 e Step 3)
    document.querySelectorAll("#calc-team-description").forEach(el => {
      el.textContent = plan.teamDescription;
    });
    const benefitEl = $("calc-team-description-benefit");
    if (benefitEl) benefitEl.textContent = plan.teamBenefit;

    // Dropdown label
    const toggle = $("w-dropdown-toggle-0");
    if (toggle) {
      const labelDiv = toggle.querySelector("div:first-child");
      if (labelDiv) labelDiv.textContent = selectedPlan;
    }

    // KPIs
    const totalYearEl = $("calc-cost-total-year");
    if (totalYearEl) totalYearEl.textContent = fmt$(calc.totalUS);

    const somewhereYearEl = $("calc-cost-somewhere-year");
    if (somewhereYearEl) somewhereYearEl.textContent = fmt$(plan.somewherePrice);

    const saveYearEl = $("calc-save-year");
    if (saveYearEl) saveYearEl.textContent = fmt$(calc.savings);

    // Breakdown
    const salaryCostEl = $("calc-salary-cost");
    if (salaryCostEl) salaryCostEl.textContent = fmt$(calc.base) + " / year";

    const salaryCostRow = salaryCostEl?.closest(".calculator-bpo_results-table-line-inner");
    if (salaryCostRow) {
      const subtitle = salaryCostRow.querySelector("div:not([id])");
      if (subtitle) subtitle.textContent = "(" + plan.teamDescription + ")";
    }

    const benefitCalcEl = $("calc-average-benefit");
    if (benefitCalcEl) benefitCalcEl.textContent = fmt$(calc.benefits) + " / year";

    const taxesEl = $("calc-average-taxes");
    if (taxesEl) taxesEl.textContent = fmt$(calc.taxes) + " / year";

    const feeEl = $("calc-average-fee");
    if (feeEl) feeEl.textContent = fmt$(calc.recruitment) + " one-time";

    const toolsEl = $("calc-average-tools");
    if (toolsEl) toolsEl.textContent = fmt$(calc.software) + " / year";

    const mgmtEl = $("calc-average-managment");
    if (mgmtEl) mgmtEl.textContent = fmt$(calc.management) + " / year";

    // Footer rows
    const usTeamEl = $("calc-average-us-team");
    if (usTeamEl) usTeamEl.textContent = fmt$(calc.totalUS) + " / year";

    const somewhereTeamEl = $("calc-average-somewhere-team");
    if (somewhereTeamEl) somewhereTeamEl.textContent = fmt$(plan.somewherePrice) + " / year";

    const planLabelEl = somewhereTeamEl?.previousElementSibling;
    if (planLabelEl) {
      const strong = planLabelEl.querySelector("strong");
      if (strong) strong.textContent = plan.planLabel;
    }

    // Avatares
    updateAvatars();
  }

  // ─── RENDER ───────────────────────────────────────────────
  function render(animate = false) {
    if (!animate) {
      applyData();
      return;
    }
    skelOn();
    setTimeout(() => {
      applyData();
      skelOff();
    }, SKELETON_DURATION);
  }

  // ─── LIVE-INPUT POSITIONING ───────────────────────────────
  function positionLiveInput(liveEl, track, pct) {
    if (!liveEl || !track) return;
    const wrapper = track.closest(".calculator-bpo_slider-wrapper");
    if (!wrapper) return;
    const wrapperRect  = wrapper.getBoundingClientRect();
    const trackRect    = track.getBoundingClientRect();
    const thumbCenterX = trackRect.left - wrapperRect.left + (pct / 100) * trackRect.width;
    liveEl.style.left  = thumbCenterX + "px";
  }

  // ─── LIVE-INPUT SHOW / HIDE ───────────────────────────────
  function showLiveInput(liveEl) {
    if (!liveEl) return;
    if (hideTimers.has(liveEl)) {
      clearTimeout(hideTimers.get(liveEl));
      hideTimers.delete(liveEl);
    }
    liveEl.classList.remove("is-hiding");
    requestAnimationFrame(() => liveEl.classList.add("is-visible"));
  }
  function activateLiveInput(liveEl)   { if (liveEl) liveEl.classList.add("is-active"); }
  function deactivateLiveInput(liveEl) { if (liveEl) liveEl.classList.remove("is-active"); }
  function hideLiveInputDelayed(liveEl) {
    if (!liveEl) return;
    if (hideTimers.has(liveEl)) clearTimeout(hideTimers.get(liveEl));
    hideTimers.set(liveEl, setTimeout(() => {
      liveEl.classList.remove("is-visible", "is-active");
      liveEl.classList.add("is-hiding");
      setTimeout(() => liveEl.classList.remove("is-hiding"), 250);
      hideTimers.delete(liveEl);
    }, LIVE_HIDE_DELAY));
  }

  // ─── SLIDER UPDATE ────────────────────────────────────────
  function updateSlider(value, animate = false) {
    salaryValue = value;
    const pct   = ((salaryValue - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100;
    const track = $("calc-range-slider-salary");

    if (track) {
      const fill  = track.querySelector(".calculator-bpo_fill");
      const thumb = track.querySelector(".calculator-bpo_thumb");
      if (fill)  fill.style.width = pct + "%";
      if (thumb) thumb.style.left = pct + "%";

      const wrapper = track.closest(".calculator-bpo_slider-wrapper");
      const live    = wrapper?.querySelector(".calculator-bpo_live-input");
      positionLiveInput(live, track, pct);
    }

    const inputEl = $("calc-salary-input");
    if (inputEl) inputEl.value = salaryValue.toLocaleString("en-US");

    const liveEl = $("calc-range-value-salary");
    if (liveEl)  liveEl.textContent = fmt$(salaryValue);

    render(animate);
  }

  // ─── INIT SLIDER ──────────────────────────────────────────
  function initSlider() {
    const track = $("calc-range-slider-salary");
    if (!track) return;

    const wrapper = track.closest(".calculator-bpo_slider-wrapper");
    const live    = wrapper?.querySelector(".calculator-bpo_live-input");
    const thumb   = track.querySelector(".calculator-bpo_thumb");

    function valueFromPointer(e) {
      const rect    = track.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const ratio   = clamp((clientX - rect.left) / rect.width, 0, 1);
      return snap(SLIDER_MIN + ratio * (SLIDER_MAX - SLIDER_MIN), STEP);
    }

    function onStart(e) {
      dragging = true;
      if (thumb) thumb.classList.add("is-dragging");
      showLiveInput(live);
      activateLiveInput(live);
      updateSlider(valueFromPointer(e), false);
      e.preventDefault();
    }
    function onMove(e) {
      if (!dragging) return;
      updateSlider(valueFromPointer(e), false);
    }
    function onEnd() {
      if (!dragging) return;
      dragging = false;
      if (thumb) thumb.classList.remove("is-dragging");
      deactivateLiveInput(live);
      hideLiveInputDelayed(live);
      render(true);
    }

    track.addEventListener("mousedown", onStart);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    track.addEventListener("touchstart", onStart, { passive: false });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);

    if (thumb) {
      thumb.setAttribute("tabindex", "0");
      thumb.setAttribute("role", "slider");
      thumb.setAttribute("aria-valuemin", SLIDER_MIN);
      thumb.setAttribute("aria-valuemax", SLIDER_MAX);
      thumb.addEventListener("keydown", (e) => {
        const d = (e.key === "ArrowRight" || e.key === "ArrowUp")   ?  STEP
                : (e.key === "ArrowLeft"  || e.key === "ArrowDown") ? -STEP : 0;
        if (!d) return;
        e.preventDefault();
        showLiveInput(live);
        activateLiveInput(live);
        updateSlider(clamp(salaryValue + d, SLIDER_MIN, SLIDER_MAX), false);
        deactivateLiveInput(live);
        hideLiveInputDelayed(live);
        render(true);
      });
    }
  }

  // ─── INIT SALARY INPUT ────────────────────────────────────
  function initSalaryInput() {
    const inputEl = $("calc-salary-input");
    if (!inputEl) return;

    inputEl.addEventListener("input", () => {
      const raw = parseInt(inputEl.value.replace(/\D/g, ""), 10);
      if (isNaN(raw)) return;
      const clamped = clamp(snap(raw, STEP), SLIDER_MIN, SLIDER_MAX);
      salaryValue = clamped;
      const pct   = ((salaryValue - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100;
      const track = $("calc-range-slider-salary");
      if (track) {
        const fill  = track.querySelector(".calculator-bpo_fill");
        const thumb = track.querySelector(".calculator-bpo_thumb");
        if (fill)  fill.style.width = pct + "%";
        if (thumb) thumb.style.left = pct + "%";
        const wrapper = track.closest(".calculator-bpo_slider-wrapper");
        const live    = wrapper?.querySelector(".calculator-bpo_live-input");
        positionLiveInput(live, track, pct);
      }
      const liveEl = $("calc-range-value-salary");
      if (liveEl) liveEl.textContent = fmt$(salaryValue);
      render(false);
    });

    function commitInput() {
      const raw   = parseInt(inputEl.value.replace(/\D/g, ""), 10);
      const final = isNaN(raw) ? SLIDER_DEFAULT : clamp(snap(raw, STEP), SLIDER_MIN, SLIDER_MAX);
      updateSlider(final, false);
      render(true);
    }

    inputEl.addEventListener("blur", commitInput);
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        inputEl.blur();
      }
    });
  }

  // ─── INIT DROPDOWN ────────────────────────────────────────
  function initDropdown() {
    const links = document.querySelectorAll(".calculator-bpo-dropdown_dropdown-link");
    links.forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const planName = link.textContent.trim();
        if (!PLANS[planName]) return;
        selectedPlan = planName;

        const list   = $("w-dropdown-list-0");
        const toggle = $("w-dropdown-toggle-0");
        if (list)   list.classList.remove("w--open");
        if (toggle) toggle.classList.remove("w--open");

        render(true);
      });
    });
  }

  // ─── INIT ─────────────────────────────────────────────────
  const liveEl = document.querySelector(".calculator-bpo_live-input");
  if (liveEl) liveEl.classList.remove("is-visible", "is-active", "is-hiding");

  initDropdown();
  initSlider();
  initSalaryInput();

  // Primeiro load: skeleton → reveal
  skelOn();
  setTimeout(() => {
    updateSlider(SLIDER_DEFAULT, false);
    skelOff();
  }, SKELETON_DURATION);
}