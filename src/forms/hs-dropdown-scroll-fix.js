// Fix: HubSpot dropdown options list scroll blocked by Lenis smooth scroll.
// Adds `data-lenis-prevent` to dropdown lists so Lenis ignores wheel events
// inside them, letting native scroll work.
//
// Targets `.hsfc-DropdownOptions__List` (HubSpot developer embed dropdown).
// Path guard: contact form page only.

if (window.location.pathname.startsWith("/form/contact")) {
  const SELECTOR = ".hsfc-DropdownOptions__List:not([data-lenis-prevent])";

  const tag = () => {
    document.querySelectorAll(SELECTOR).forEach((list) => {
      list.setAttribute("data-lenis-prevent", "");
    });
  };

  // Watch for HubSpot mounting dropdown lists dynamically on open.
  const observer = new MutationObserver(tag);
  observer.observe(document.body, { childList: true, subtree: true });

  // Initial pass for any lists already in DOM.
  tag();
}