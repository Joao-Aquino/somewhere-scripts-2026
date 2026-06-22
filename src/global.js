// ─── GLOBAL ────────────────────────────────────────────────
import "./global/navbar";
import "./global/lenis";
import "./global/reveal-animation";
import "./global/button-stagger";
import "./global/faq";
import './global/roles-slider.js';
import "./forms/hs-dropdown-scroll-fix";
import { initTimerModal } from "./global/timer-modal";
window.Webflow ||= [];
window.Webflow.push(() => {
  initTimerModal();
});

// ─── HOME ────────────────────────────────────────────────────
if (window.location.pathname === "/") {
  import("./home/role-search.js").then((m) => m.initRoleSearch());
  import("./home/logo-marquee");
  import("./global/swiper");
  import("./global/calculator.js").then((m) => m.initCalculator());
  import("./global/odometer");
}

// ─── About ────────────────────────────────────────────────────
if (window.location.pathname === "/about") {
  import("./home/logo-marquee");
  import("./about/globe").then((m) => m.initGlobe());
  import("./about/team-marquee");
  import("./global/odometer");
  import("./global/swiper");
}

// ─── Calculator ────────────────────────────────────────────────────
if (window.location.pathname === "/calculator") {
  import("./global/calculator.js").then((m) => m.initCalculator());
}

// ─── Contact Flow ────────────────────────────────────────────────────
if (window.location.pathname === "/contact-flow/01") {
  import("./contact-flow/role-injector.js").then((m) => m.initRoleInjector());
  import("./global/odometer");
}

// ─── Pricing ────────────────────────────────────────────────────
if (window.location.pathname === "/pricing") {
  import("./global/calculator.js").then((m) => m.initCalculator());
}

// ─── Hire-in ────────────────────────────────────────────────────
if (window.location.pathname.startsWith("/hire-in/")) {
  import("./global/swiper");
}

// ─── Services ────────────────────────────────────────────────────
if (window.location.pathname === "/services/direct-hire") {
  import("./global/swiper");
}
if (window.location.pathname === "/services/talent-on-demand") {
  import("./global/swiper");
  import("./global/calculator.js").then((m) => m.initCalculator());
}
if (window.location.pathname === "/services/eor") {
  import("./services/countries-marquee");
}
if (window.location.pathname === "/services/equipment") {
  import("./services/lightbox-equipment");
}
if (window.location.pathname === "/services/bpo/sales") {
  import("./services/bpo-calculator.js").then(({ initBpoCalculator }) => {
    initBpoCalculator();
  });
  import("./global/swiper");
}

// ─── Guide ────────────────────────────────────────────────────
if (window.location.pathname === "/guides/global-hiring-guide") {
  import("./global/calculator.js").then((m) => m.initCalculator());
}

// ─── Roles ────────────────────────────────────────────────────
if (window.location.pathname.startsWith("/roles/")) {
  import("./global/swiper");
  import("./roles/roles-calculator.js").then((m) => m.initRoleCalculator());
  import("./roles/content-tabs-visibility.js").then((m) => m.initContentTabsVisibility());
}

// ─── Roles [New] ────────────────────────────────────────────────────
if (window.location.pathname.startsWith("/roles-new/")) {
  import("./global/swiper");
  import("./roles/roles-calculator.js").then((m) => m.initRoleCalculator());
  import("./roles/content-tabs-visibility.js").then((m) => m.initContentTabsVisibility());
}


// ─── Landing Pages ────────────────────────────────────────────────────
if (window.location.pathname === "/lp/spotify") {
  window.SMW_DEFAULT_ROLE = "Executive Assistant";
  import("./global/calculator.js").then((m) => m.initCalculator());
}
if (window.location.pathname === "/lp/global-hiring") {
  import("./global/odometer");
}

// ─── Blog ────────────────────────────────────────────────────
if (window.location.pathname.startsWith("/post/")) {
  import("./global/swiper");
}

// ─── Candidates ────────────────────────────────────────────────────
if (window.location.pathname === "/candidates") {
  import("./candidates/rotating-text");
}

// ─── Universities ────────────────────────────────────────────────────
if (window.location.pathname.startsWith("/universities/")) {
  import("./global/swiper");
  import("./global/odometer");
}

// ─── Industries ────────────────────────────────────────────────────
if (window.location.pathname.startsWith("/industry/")) {
  import("./home/logo-marquee");
  import("./global/odometer");
  import("./global/calculator.js").then((m) => m.initCalculator());
  import("./global/swiper");
}

// ─── Archive ────────────────────────────────────────────────────
if (window.location.pathname === "/archive") {
  import("./home/tabs");
  import("./home/process-sticky");
}