/* ─────────────────────────────────────────────────────────────────────────────
   Landing-page calculator entry point — /lp/spotify etc.

   No logic here. global.js sets window.SMW_DEFAULT_ROLE before calling
   initCalculator(), which global/calculator.js already handles.
───────────────────────────────────────────────────────────────────────────── */
export { initCalculator } from "../global/calculator.js";