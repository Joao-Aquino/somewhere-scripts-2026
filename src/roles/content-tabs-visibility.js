/**
 * content-tabs-visibility.js
 * Hides tab links and tab panels when their corresponding title element has no content.
 * Targets: #content-tabs section on role pages.
 */

export function initContentTabsVisibility() {
  const TABS = ['benefits', 'job-description', 'country', 'hire', '10-facts'];

  setTimeout(() => {
    TABS.forEach((key) => {
      const title = document.getElementById(`content-title-${key}`);
      const link  = document.getElementById(`content-link-${key}`);
      const panel = document.getElementById(`content-tabs-${key}`);

      if (!title || title.innerText.trim() === '') {
        if (link)  link.style.display  = 'none';
        if (panel) panel.style.display = 'none';
      }
    });

    // Click first visible tab so Webflow activates it properly
    const firstVisible = TABS
      .map((key) => document.getElementById(`content-link-${key}`))
      .find((el) => el && el.style.display !== 'none');

    if (firstVisible) firstVisible.click();
  }, 300);
}