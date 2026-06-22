// workers/index.js
// Somewhere.com — Cloudflare Worker
//
// Routes (configured in wrangler.toml):
//   somewhere.com/js/bundle.js  →  serves the compiled + obfuscated JS bundle
//                                   from Cloudflare Pages under the first-party
//                                   somewhere.com domain
//   somewhere.com/cf/*          →  reverse-proxies third-party tracking scripts
//                                   as first-party requests, bypassing ad-blocker
//                                   domain block-lists
//
// Env variables (set in wrangler.toml or via `wrangler secret put`):
//   BUNDLE_ORIGIN   URL of the Cloudflare Pages project, e.g. https://somewhere-redesign.pages.dev
//   CLARITY_ID      Microsoft Clarity project ID (resolves the /cf/clarity.js route)

// ─── Third-party script proxy map ────────────────────────────────────────────
// Maps each /cf/<slug> to its real upstream URL.
// Query params (e.g. ?id=GTM-XXXX) are forwarded automatically.
//
// NOTE: After Server-Side GTM is active, the *collection* endpoints
// (g/collect, fbevents conversion calls) are replaced by calls to
// gtm.somewhere.com. These entries are still needed for the initial SDK loads.
const PROXY_MAP = {
  // Google Tag Manager & Analytics
  '/cf/gtm.js':      'https://www.googletagmanager.com/gtm.js',
  '/cf/gtag/js':     'https://www.googletagmanager.com/gtag/js',
  '/cf/g/collect':   'https://www.google-analytics.com/g/collect',

  // Meta (Facebook) Pixel base SDK
  '/cf/fbevents.js': 'https://connect.facebook.net/en_US/fbevents.js',

  // TikTok Pixel
  '/cf/tiktok.js':   'https://analytics.tiktok.com/i18n/pixel/events.js',

  // Reddit Pixel
  '/cf/reddit.js':   'https://www.redditstatic.com/ads/pixel.js',

  // Microsoft Clarity — resolved dynamically via env.CLARITY_ID
  '/cf/clarity.js':  null,

  // X (Twitter) Pixel
  '/cf/adsct':       'https://static.ads-twitter.com/uwt.js',

  // LinkedIn Insight Tag
  '/cf/linkedin.js': 'https://snap.licdn.com/li.lms-analytics/insight.min.js',
};

// ─── Main fetch handler ───────────────────────────────────────────────────────
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Route A: first-party bundle serving
    if (path === '/js/bundle.js') {
      return handleBundle(request, env, ctx);
    }

    // Route B: third-party script proxy
    if (path.startsWith('/cf/')) {
      return handleScriptProxy(request, url, env);
    }

    return new Response('Not found', { status: 404 });
  },
};

// ─── Route A: Bundle proxy ─────────────────────────────────────────────────────
// Fetches dist/bundle.js from Cloudflare Pages (BUNDLE_ORIGIN) and returns it
// under the somewhere.com domain. Cloudflare's Cache API is used to avoid an
// upstream fetch on every single request.
async function handleBundle(request, env, ctx) {
  const origin = env.BUNDLE_ORIGIN || 'https://somewhere-redesign.pages.dev';
  const upstreamUrl = `${origin}/bundle.js`;

  const cache = caches.default;
  const cacheKey = new Request(upstreamUrl);
  let response = await cache.match(cacheKey);

  if (!response) {
    const upstream = await fetch(upstreamUrl, { cf: { cacheTtl: 3600 } });

    if (!upstream.ok) {
      return new Response(`Bundle fetch failed: ${upstream.status}`, { status: 502 });
    }

    // Store a clean copy in the edge cache
    ctx.waitUntil(
      cache.put(
        cacheKey,
        new Response(upstream.clone().body, {
          status: upstream.status,
          headers: buildBundleHeaders(upstream.headers),
        })
      )
    );

    response = upstream;
  }

  return new Response(response.body, {
    status: response.status,
    headers: buildBundleHeaders(response.headers),
  });
}

function buildBundleHeaders(source) {
  const h = new Headers(source);

  // Strip headers that would reveal the Cloudflare Pages origin
  ['server', 'via', 'x-cache', 'cf-ray', 'x-powered-by', 'age'].forEach((k) => h.delete(k));

  h.set('Content-Type', 'application/javascript; charset=utf-8');
  h.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  h.set('Access-Control-Allow-Origin', '*');

  return h;
}

// ─── Route B: Third-party script proxy ────────────────────────────────────────
// Resolves the upstream URL from PROXY_MAP (or dynamically for Clarity),
// forwards the request with the original user headers, and strips any response
// headers that would expose the real upstream origin.
async function handleScriptProxy(request, url, env) {
  const path = url.pathname;

  // Resolve Clarity URL using the CLARITY_ID env variable
  const clarityId = env.CLARITY_ID || '';
  const resolvedMap = {
    ...PROXY_MAP,
    '/cf/clarity.js': clarityId ? `https://www.clarity.ms/tag/${clarityId}` : null,
  };

  const upstream = resolvedMap[path];

  if (!upstream) {
    const msg =
      path === '/cf/clarity.js'
        ? 'CLARITY_ID env var is not set in wrangler.toml'
        : `No proxy route configured for ${path}`;
    return new Response(msg, { status: 404 });
  }

  // Forward original query params (e.g. ?id=GTM-XXXX, ?v=...)
  const upstreamUrl = new URL(upstream);
  url.searchParams.forEach((value, key) => upstreamUrl.searchParams.set(key, value));

  const proxyResponse = await fetch(upstreamUrl.toString(), {
    method: request.method,
    headers: {
      'User-Agent':      request.headers.get('User-Agent') || '',
      'Accept':          request.headers.get('Accept') || '*/*',
      'Accept-Language': request.headers.get('Accept-Language') || '',
      'Referer':         request.headers.get('Referer') || '',
    },
    // Forward body only for non-idempotent methods (e.g. POST to /g/collect)
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
  });

  const headers = new Headers(proxyResponse.headers);

  // Strip upstream-revealing headers
  ['x-powered-by', 'server', 'via', 'x-cache'].forEach((k) => headers.delete(k));

  // Do not cache collection/pixel endpoints — only cache static SDK scripts
  const isCollectionEndpoint = /\/collect|\.gif/.test(path);
  if (!isCollectionEndpoint) {
    headers.set('Cache-Control', 'public, max-age=3600');
  }

  headers.set('Access-Control-Allow-Origin', '*');

  return new Response(proxyResponse.body, {
    status: proxyResponse.status,
    headers,
  });
}
