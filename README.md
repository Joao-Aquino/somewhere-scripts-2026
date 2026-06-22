# Somewhere Redesign — JS Bundle

Replaces Odyn. Built with Vite, deployed via Cloudflare Pages.

---

## Local setup

```bash
npm install
npm run build       # generates dist/bundle.js
npm run dev         # watch mode — rebuilds on every file save
```

---

## File structure

Paste each file from Odyn into the matching path under `src/`:

```
src/
├── global.js                    ← entry point
├── global/
│   ├── button-stagger.js
│   ├── calculator.js
│   ├── faq.js
│   ├── inject-css.js
│   ├── lenis.js
│   ├── modal.js
│   ├── navbar.js
│   ├── odometer.js
│   ├── reveal-animation.js
│   └── swiper.js
├── home/
│   ├── logo-marquee.js
│   ├── process-sticky.js
│   ├── role-search.js
│   └── tabs.js
├── contact-flow/
│   └── role-injector.js
├── about/
│   ├── globe.js
│   └── team-marquee.js
└── services/
    ├── bpo-calculator.js
    ├── countries-marquee.js
    └── lightbox-equipment.js
```

---

## Cloudflare Pages setup

1. Push this repo to GitHub (private is fine)
2. Go to cloudflare.com → Pages → Create a project
3. Connect your GitHub repo
4. Set build settings:
   - **Framework preset:** None
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Deploy

Your bundle URL will be:
```
https://your-project.pages.dev/bundle.js
```

---

## Webflow — swap the script URL

In Webflow → Project Settings → Custom Code → Before `</body>`:

Replace:
```html
<script src="https://cdn.odyn.dev/staging/rkgc/bundle.js" defer></script>
```

With:
```html
<script src="https://your-project.pages.dev/bundle.js" defer></script>
```

---

## CSS (future)

When you're ready to add CSS:

1. Create `src/global/styles/your-file.css`
2. Import it at the top of `src/global.js`:
   ```js
   import './global/styles/your-file.css';
   ```
3. Vite will automatically compile it into `dist/bundle.css`
4. Add the CSS link in Webflow `<head>`:
   ```html
   <link rel="stylesheet" href="https://your-project.pages.dev/bundle.css">
   ```
