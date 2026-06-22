import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import JavaScriptObfuscator from 'javascript-obfuscator';

// ─── Post-build obfuscation plugin ────────────────────────────────────────────
// Runs inside Vite's `closeBundle` hook — after Rollup has finished bundling and
// Vite has minified the output. Reading and rewriting dist/bundle.js at this
// stage guarantees obfuscation always runs on the final, minified artifact.
function obfuscatePlugin() {
  return {
    name: 'vite-plugin-obfuscate',
    apply: 'build', // No-op during `npm run dev` (watch mode)
    closeBundle() {
      const bundlePath = resolve(__dirname, 'dist/bundle.js');

      try {
        const code = readFileSync(bundlePath, 'utf-8');

        const result = JavaScriptObfuscator.obfuscate(code, {
          // ── Output ──────────────────────────────────────────────────────────
          compact: true,           // Remove all whitespace / newlines
          target: 'browser',       // Optimize for browser runtime

          // ── Identifier renaming ──────────────────────────────────────────
          // Renames all local identifiers to _0x<hex> patterns.
          // `renameGlobals: false` preserves window, document, etc.
          identifierNamesGenerator: 'hexadecimal',
          renameGlobals: false,

          // ── String array encoding ────────────────────────────────────────
          // Extracts string literals into a hidden, base64-encoded array and
          // replaces every usage with an indirect lookup function call.
          // Makes string-based reverse-engineering significantly harder.
          stringArray: true,
          stringArrayEncoding: ['base64'],
          stringArrayThreshold: 0.75,
          stringArrayIndexShift: true,
          stringArrayRotate: true,
          stringArrayShuffle: true,
          stringArrayCallsTransform: true,
          stringArrayCallsTransformThreshold: 0.75,
          stringArrayWrappersCount: 2,
          stringArrayWrappersChainedCalls: true,
          stringArrayWrappersParametersMaxCount: 4,
          stringArrayWrappersType: 'function',

          // ── Disabled transformations ─────────────────────────────────────
          // controlFlowFlattening → ~2x runtime CPU overhead, skipped
          // deadCodeInjection     → ~30% bundle size increase, skipped
          // selfDefending         → incompatible with Webflow strict mode
          controlFlowFlattening: false,
          deadCodeInjection: false,
          debugProtection: false,
          disableConsoleOutput: false,
          selfDefending: false,

          // ── Misc ─────────────────────────────────────────────────────────
          numbersToExpressions: false,
          simplify: true,
          splitStrings: false,
          transformObjectKeys: false,
          unicodeEscapeSequence: false,
          log: false,
        });

        writeFileSync(bundlePath, result.getObfuscatedCode());
        console.log('[obfuscate] ✓ dist/bundle.js obfuscated successfully');
      } catch (err) {
        console.error('[obfuscate] ✗ Obfuscation failed:', err.message);
        throw err;
      }
    },
  };
}

// ─── Vite build config ────────────────────────────────────────────────────────
export default defineConfig({
  plugins: [obfuscatePlugin()],

  build: {
    // Library mode — generates a single self-executing JS file (IIFE)
    lib: {
      entry: resolve(__dirname, 'src/global.js'),
      name: 'SomewhereBundle',
      formats: ['iife'],
      fileName: () => 'bundle.js',
    },

    rollupOptions: {
      output: {
        // Inline all dynamic import()s — no extra HTTP requests at runtime
        inlineDynamicImports: true,
        // Always output CSS as bundle.css
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) return 'bundle.css';
          return '[name][extname]';
        },
      },
    },

    cssCodeSplit: false,    // Concatenate all CSS into a single bundle.css
    outDir: 'dist',
    emptyOutDir: true,
    minify: true,           // Vite/esbuild minifies first; obfuscatePlugin() runs after
    target: 'es2020',
  },
});
