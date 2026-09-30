/* ============================================================
   Felipe Janires — portfolio interactions
   No libraries. Everything degrades to a normal page without JS
   and respects "reduce motion" settings.
   ============================================================ */
(() => {
  const html = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wide = matchMedia('(min-width: 761px)');

  /* ---------- intro: reveal hero once fonts are in ---------- */
  const markLoaded = () => html.classList.add('loaded');
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(markLoaded));
  setTimeout(markLoaded, 1200);

  /* ---------- year ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- nav: floating glass pill after scrolling ---------- */
  const nav = $('#nav');
  const setNav = () => nav.classList.toggle('scrolled', scrollY > 40);
  addEventListener('scroll', setNav, { passive: true });
  setNav();

  /* ---------- mobile menu ---------- */
  const burger = $('#burger'), sheet = $('#sheet');
  const setSheet = open => {
    document.body.classList.toggle('sheet-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    sheet.setAttribute('aria-hidden', !open);
  };
  burger.addEventListener('click', () => setSheet(!document.body.classList.contains('sheet-open')));
  $$('a', sheet).forEach(a => a.addEventListener('click', () => setSheet(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setSheet(false); });

  /* ---------- reveal on scroll (one-time) ---------- */
  const once = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); once.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal, .clip').forEach(el => once.observe(el));

  /* ---------- services: slide in, and back out when scrolling up ---------- */
  const srvIO = new IntersectionObserver(entries => {
    entries.forEach(e => e.target.classList.toggle('in', e.isIntersecting));
  }, { threshold: 0, rootMargin: '0px 0px -16% 0px' });
  $$('.srv').forEach(el => srvIO.observe(el));

  /* ---------- hero: crossfading B&W photos ---------- */
  const slides = $$('#heroMedia .slide');
  const cap = $('#heroCap');
  // the first photo loads with the page; the rest wait until everything else is in
  addEventListener('load', () => slides.forEach(s => {
    if (s.dataset.srcset) { s.srcset = s.dataset.srcset; s.src = s.dataset.src; }
  }));
  if (!reduce && slides.length > 1) {
    let i = 0;
    setInterval(() => {
      if (document.hidden || scrollY > innerHeight) return;
      slides[i].classList.remove('is-on');
      i = (i + 1) % slides.length;
      slides[i].classList.add('is-on');
      if (cap) {
        cap.style.opacity = 0;
        setTimeout(() => { cap.textContent = slides[i].dataset.cap; cap.style.opacity = 1; }, 400);
      }
    }, 5500);
  }

  /* ---------- scroll-linked motion ---------- */
  const hero = $('.hero');
  const heroMedia = $('#heroMedia');
  const heroLines = $$('.hero-name .line');

  const hs = $('#hs'), track = $('#hsTrack'), bar = $('#hsBar');
  let hsOn = false, hsDist = 0;
  function setupTrack() {
    hsOn = wide.matches && !reduce;
    hs.classList.toggle('hs-on', hsOn);
    if (!hsOn) { hs.style.height = ''; track.style.transform = ''; return; }
    const last = track.lastElementChild;
    const padR = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    hsDist = Math.max(0, last.offsetLeft + last.offsetWidth + padR - innerWidth);
    // the track moves a little faster than the page so the pinned section doesn't drag
    hs.style.height = (hsDist / 1.4 + innerHeight) + 'px';
  }

  const say = $('#say'), sayWords = $$('.say-w', say);
  const sayOn = !reduce;
  say.classList.toggle('say-on', sayOn);

  const par = $$('[data-par]').map(el => [el, parseFloat(el.dataset.par)]);

  function frame() {
    const vh = innerHeight, y = scrollY;

    // hero: name lines slide off in opposite directions, photos drift slower than the page
    if (y < hero.offsetHeight * 1.2) {
      const p = clamp(y / (hero.offsetHeight * 0.85), 0, 1);
      const e = Math.pow(p, 1.25);
      for (const l of heroLines) {
        const d = +l.dataset.dir;
        l.style.transform = `translate3d(${(d * e * innerWidth * 0.9).toFixed(1)}px,0,0)`;
        l.style.opacity = clamp(1 - p * 1.15, 0, 1).toFixed(3);
      }
      heroMedia.style.transform = `translate3d(0,${(y * 0.28).toFixed(1)}px,0)`;
    }

    // photography: vertical scroll drives the sideways track
    if (hsOn) {
      const r = hs.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) {
        const p = clamp(-r.top / (hs.offsetHeight - vh), 0, 1);
        track.style.transform = `translate3d(${(-p * hsDist).toFixed(1)}px,0,0)`;
        bar.style.transform = `scaleX(${p.toFixed(4)})`;
      }
    }

    // promise: three lines hand over to each other
    if (sayOn) {
      const r = say.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) {
        const p = clamp(-r.top / (say.offsetHeight - vh), 0, 1);
        const n = sayWords.length, seg = p * n;
        sayWords.forEach((w, i) => {
          const d = seg - i - 0.5;               // -0.5..0.5 while this line owns the screen
          const held = (i === 0 && d < 0) || (i === n - 1 && d > 0);
          const o = held ? 1 : clamp(1 - (Math.abs(d) - 0.34) / 0.16, 0, 1);
          const ty = held ? 0 : -d * 140;
          w.style.opacity = o.toFixed(3);
          w.style.transform = `translate3d(0,calc(-50% + ${ty.toFixed(1)}px),0)`;
        });
      }
    }

    // gentle parallax
    for (const [el, sp] of par) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      const c = r.top + r.height / 2 - vh / 2;
      el.style.transform = `translate3d(0,${(-c * sp).toFixed(1)}px,0)`;
    }
  }

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { frame(); ticking = false; });
  };
  const onResize = () => { setupTrack(); frame(); };

  setupTrack();
  if (!reduce) {
    addEventListener('scroll', onScroll, { passive: true });
    frame();
  }
  addEventListener('resize', onResize);
  wide.addEventListener?.('change', onResize);
  addEventListener('load', onResize);

  /* ---------- lightbox ---------- */
  const dlg = $('#lightbox');
  const lbImg = $('#lbImg'), lbTitle = $('#lbTitle'), lbKind = $('#lbKind'),
        lbDesc = $('#lbDesc'), lbLink = $('#lbLink'), lbCount = $('#lbCount');
  const groups = {};
  $$('a.lb').forEach(a => (groups[a.dataset.group] ||= []).push(a));
  // optional data-i sets gallery order (e.g. brand kit pages before mockups); otherwise page order
  Object.values(groups).forEach(g => g.sort((a, b) => (+a.dataset.i || 0) - (+b.dataset.i || 0)));
  let cur = [], idx = 0, closing = 0;

  function show(i) {
    idx = (i + cur.length) % cur.length;
    const a = cur[idx];
    lbImg.classList.remove('ready');
    lbImg.onload = () => lbImg.classList.add('ready');
    lbImg.src = a.getAttribute('href');
    lbImg.alt = a.dataset.alt || $('img', a)?.alt || a.dataset.title || '';
    if (lbImg.complete) lbImg.classList.add('ready');
    lbTitle.textContent = a.dataset.title || '';
    lbKind.textContent = a.dataset.kind || '';
    lbDesc.textContent = a.dataset.desc || '';
    const link = a.dataset.link;
    lbLink.textContent = link ? `Visit ${new URL(link).hostname.replace(/^www\./, '')} ↗` : '';
    if (link) lbLink.href = link; else lbLink.removeAttribute('href');
    lbCount.textContent = cur.length > 1 ? `${String(idx + 1).padStart(2, '0')} / ${String(cur.length).padStart(2, '0')}` : '';
    // warm up neighbours
    [1, -1].forEach(k => { const n = cur[(idx + k + cur.length) % cur.length]; if (n) new Image().src = n.getAttribute('href'); });
  }
  function open(a) {
    cur = groups[a.dataset.group] || [a];
    dlg.classList.toggle('multi', cur.length > 1);
    show(cur.indexOf(a));
    clearTimeout(closing);
    if (!dlg.open) dlg.showModal();
    document.body.classList.add('lb-open');
    requestAnimationFrame(() => dlg.classList.add('show'));
    cursor?.classList.remove('on');
  }
  function close() {
    dlg.classList.remove('show');
    document.body.classList.remove('lb-open');
    closing = setTimeout(() => dlg.open && dlg.close(), reduce ? 0 : 300);
  }
  $$('a.lb').forEach(a => a.addEventListener('click', e => { e.preventDefault(); open(a); }));
  $('#lbClose').addEventListener('click', close);
  $('#lbPrev').addEventListener('click', () => show(idx - 1));
  $('#lbNext').addEventListener('click', () => show(idx + 1));
  dlg.addEventListener('cancel', e => { e.preventDefault(); close(); });
  dlg.addEventListener('click', e => {
    if (e.target === dlg || e.target.classList.contains('lb-frame') || e.target.classList.contains('lb-fig')) close();
  });
  dlg.addEventListener('keydown', e => {
    if (cur.length < 2) return;
    if (e.key === 'ArrowRight') show(idx + 1);
    if (e.key === 'ArrowLeft') show(idx - 1);
  });
  let sx = null;
  dlg.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  dlg.addEventListener('touchend', e => {
    if (sx === null || cur.length < 2) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    sx = null;
  });

  /* ---------- copy email ---------- */
  $$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(b.dataset.copy);
      b.textContent = 'Copied'; b.classList.add('done');
      setTimeout(() => { b.textContent = 'Copy'; b.classList.remove('done'); }, 1800);
    } catch { location.href = 'mailto:' + b.dataset.copy; }
  }));

  /* ---------- "View" cursor over work (mouse only) ---------- */
  const cursor = $('.cursor');
  if (cursor && matchMedia('(hover: hover) and (pointer: fine)').matches && !reduce) {
    html.classList.add('has-cursor');
    let x = -200, y = -200, tx = -200, ty = -200, running = false;
    const loop = () => {
      x += (tx - x) * 0.22; y += (ty - y) * 0.22;
      cursor.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
      if (Math.abs(tx - x) > 0.1 || Math.abs(ty - y) > 0.1) requestAnimationFrame(loop); else running = false;
    };
    addEventListener('mousemove', e => {
      tx = e.clientX; ty = e.clientY;
      if (!running) { running = true; requestAnimationFrame(loop); }
    }, { passive: true });
    $$('a.lb').forEach(a => {
      a.addEventListener('mouseenter', () => cursor.classList.add('on'));
      a.addEventListener('mouseleave', () => cursor.classList.remove('on'));
    });
  }
})();
