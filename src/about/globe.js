// odyn:/about/globe.js

export async function initGlobe() {
  const canvas = document.getElementById('cobe-canvas');
  if (!canvas) return;

  const { default: createGlobe } = await import('https://esm.sh/cobe@2');

  const cities = [
    { id: 'costa-rica',   label: 'Costa Rica',        location: [9.75,   -83.75] },
    { id: 'panama',       label: 'Panama',             location: [8.99,   -79.52] },
    { id: 'dominican',    label: 'Dominican Republic', location: [18.74,  -70.16] },
    { id: 'puerto-rico',  label: 'Puerto Rico',        location: [18.22,  -66.59] },
    { id: 'jamaica',      label: 'Jamaica',            location: [18.11,  -77.30] },
    { id: 'chile',        label: 'Chile',              location: [-35.68, -71.54] },
    { id: 'peru',         label: 'Peru',               location: [-9.19,  -75.02] },
    { id: 'venezuela',    label: 'Venezuela',          location: [6.42,   -66.59] },
    { id: 'ecuador',      label: 'Ecuador',            location: [-1.83,  -78.18] },
    { id: 'bolivia',      label: 'Bolivia',            location: [-16.29, -63.59] },
    { id: 'paraguay',     label: 'Paraguay',           location: [-23.44, -58.44] },
    { id: 'uruguay',      label: 'Uruguay',            location: [-32.52, -55.77] },
    { id: 'south-africa', label: 'South Africa',       location: [-28.47,  24.68] },
    { id: 'philippines',  label: 'Philippines',        location: [12.88,  121.77] },
    { id: 'ukraine',      label: 'Ukraine',            location: [48.38,   31.17] },
    { id: 'czech',        label: 'Czech Republic',     location: [49.82,   15.47] },
    { id: 'pakistan',     label: 'Pakistan',           location: [30.38,   69.35] },
    { id: 'srilanka',     label: 'Sri Lanka',          location: [7.87,    80.77] },
    { id: 'mexico',       label: 'Mexico',             location: [23.63, -102.55] },
    { id: 'colombia',     label: 'Colombia',           location: [4.57,   -74.30] },
    { id: 'brazil',       label: 'Brazil',             location: [-14.24, -51.93] },
    { id: 'argentina',    label: 'Argentina',          location: [-38.42, -63.62] },
    { id: 'india',        label: 'India',              location: [20.59,   78.96] },
  ];

  const wrapper = canvas.parentElement;
  wrapper.style.position = 'relative';

  // Limpar labels antigos se existirem
  wrapper.querySelectorAll('.cobe-label').forEach(el => el.remove());
  document.getElementById('cobe-label-styles')?.remove();

  // CSS dos labels — position-anchor na classe, específico por id
  const styleEl = document.createElement('style');
  styleEl.id = 'cobe-label-styles';
  styleEl.textContent = cities.map(c => `
    .cobe-label-${c.id} {
      position: absolute;
      position-anchor: --cobe-${c.id};
      bottom: anchor(top);
      left: anchor(center);
      translate: -50% 0;
      margin-bottom: var(--spacing--small);
      background: #B8F64A;
      color: #0F1C16;
      font-size: var(--text--font-size--small);
      font-family: var(--_typography---body);
      font-weight: 500;
      padding: 0.25rem 0.5rem;  
      border: 1px solid var(--_buttons---button-primary--border-button-primary-enabled);
      border-radius: var(--border-radius--round);
      white-space: nowrap;
      pointer-events: none;
      opacity: var(--cobe-visible-${c.id}, 0);
      filter: blur(calc((1 - var(--cobe-visible-${c.id}, 0)) * 4px));
      transition: opacity 0.3s, filter 0.3s;
    }
  `).join('');
  document.head.appendChild(styleEl);

  // Criar labels no wrapper
  cities.forEach(c => {
    const el = document.createElement('div');
    el.className = `cobe-label-${c.id}`;
    el.textContent = c.label;
    wrapper.appendChild(el);
  });

  // Canvas resize
  function resize() {
    const r = wrapper.getBoundingClientRect();
    canvas.width  = r.width  * window.devicePixelRatio;
    canvas.height = r.height * window.devicePixelRatio;
  }
  resize();
  new ResizeObserver(resize).observe(wrapper);

  let phi = 0.001;
  let theta = 0.02;
  let velX = 0;
  let velY = 0;
  let isDragging = false;
  let lastX = 0;
  let lastY = 0;
  let autoRotate = true;

  // ── Padrão correto da doc: globe.update() num loop RAF ────
  const globe = createGlobe(canvas, {
    devicePixelRatio: window.devicePixelRatio,
    width:  canvas.width,
    height: canvas.height,
    phi,
    theta,
    dark:              0,
    diffuse:           1.2,
    mapSamples:        20000,
    mapBrightness:     4,
    mapBaseBrightness: 0.12,
    baseColor:   [0.008, 0.396, 0.376],
    markerColor: [0.722, 0.965, 0.290],
    glowColor:   [0.008, 0.396, 0.376],
    markers: cities.map(c => ({ location: c.location, size: 0.02, id: c.id })),
    markerElevation: 0,
    arcs: [],
  });

  function animate() {
    if (!isDragging) {
      velX *= 0.95;
      velY *= 0.95;
      if (autoRotate) velX += 0.0001;
      phi   += velX;
      theta += velY;
      theta = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, theta));
    }
    globe.update({
      phi,
      theta,
      width:  canvas.width,
      height: canvas.height,
    });
    requestAnimationFrame(animate);
  }
  animate();

  // ── Drag interaction ───────────────────────────────────────
  canvas.addEventListener('mousedown', e => {
    isDragging = true;
    autoRotate = false;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const w = wrapper.getBoundingClientRect().width;
    velX = (e.clientX - lastX) / w * 5;
    velY = (e.clientY - lastY) / w * 3;
    phi   += velX;
    theta += velY;
    lastX = e.clientX;
    lastY = e.clientY;
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    canvas.style.cursor = 'grab';
    setTimeout(() => { autoRotate = true; }, 2500);
  });

  canvas.addEventListener('touchstart', e => {
    isDragging = true;
    autoRotate = false;
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const w = wrapper.getBoundingClientRect().width;
    velX = (e.touches[0].clientX - lastX) / w * 5;
    velY = (e.touches[0].clientY - lastY) / w * 3;
    phi   += velX;
    theta += velY;
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
    setTimeout(() => { autoRotate = true; }, 2500);
  });
}