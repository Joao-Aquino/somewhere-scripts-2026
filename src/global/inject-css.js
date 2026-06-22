// utils/inject-css.js

export function injectPageCSS(css) {
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
}
