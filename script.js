/* =============================================================
   elemente Homes — script.js
   Plain JavaScript, no libraries. Everything degrades gracefully:
   if this file fails to load, the site is still fully readable
   and every link (call, WhatsApp, anchors) still works.
   ============================================================= */
(() => {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: solid state after scrolling ---------- */
  const header = $('[data-header]');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const toggle = $('.nav-toggle');
  const nav = $('#primary-nav');

  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    header.classList.toggle('menu-open', open);
    root.classList.toggle('nav-open', open);
  };
  const menuIsOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  toggle.addEventListener('click', () => setMenu(!menuIsOpen()));
  $$('a', nav).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuIsOpen()) { setMenu(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 1000px)').addEventListener('change', (e) => {
    if (e.matches) setMenu(false);
  });

  /* ---------- Scroll reveals (skipped when reduced motion is on) ---------- */
  if ('IntersectionObserver' in window && !reduceMotion) {
    root.classList.add('js-reveal');
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    $$('.reveal').forEach((el) => revealObserver.observe(el));
  }

  /* ---------- Highlight the current section in the nav ---------- */
  const navLinks = $$('.nav-list a[href^="#"]');
  const sections = navLinks.map((a) => $(a.hash)).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => {
          if (a.hash === '#' + entry.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- If an image fails to load, show the tonal placeholder ---------- */
  $$('.media img').forEach((img) => {
    const markBroken = () => img.closest('.media')?.classList.add('is-broken');
    if (img.complete && img.naturalWidth === 0) markBroken();
    else img.addEventListener('error', markBroken, { once: true });
  });

  /* ---------- Project filter ---------- */
  const grid = $('[data-projects]');
  const chips = $$('[data-filter]');
  const status = $('[data-filter-status]');
  if (grid && chips.length) {
    const tiles = $$('.project', grid);
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const value = chip.dataset.filter;
        chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
        let visible = 0;
        tiles.forEach((tile) => {
          const show = value === 'all' || tile.dataset.category === value;
          tile.hidden = !show;
          if (show) visible += 1;
        });
        grid.classList.toggle('is-filtered', value !== 'all');
        grid.dataset.count = String(visible);
        if (status) {
          status.textContent = value === 'all'
            ? `Showing all ${visible} projects`
            : `Showing ${visible} ${visible === 1 ? 'project' : 'projects'} in ${value}`;
        }
      });
    });
  }

  /* ---------- Service "Enquire" links pre-select the enquiry form ---------- */
  const form = $('[data-enquiry-form]');
  const typeSelect = form ? $('#f-type', form) : null;
  $$('[data-service]').forEach((link) => {
    link.addEventListener('click', () => {
      if (!typeSelect) return;
      const match = Array.from(typeSelect.options).find((o) => o.text === link.dataset.service);
      if (match) typeSelect.value = match.value || match.text;
    });
  });

  /* ---------- Enquiry form: opens WhatsApp with the message ready to send ----------
     The WhatsApp number is read from the first link marked data-whatsapp in index.html,
     so there is only one place to edit it (search for the number in index.html). */
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const waLink = $('a[data-whatsapp]');
      if (!waLink) return;
      const number = new URL(waLink.href).pathname.replace(/\D/g, '');

      const data = new FormData(form);
      const lines = [
        'Hello elemente Homes, I would like to discuss a project.',
        '',
        `Name: ${String(data.get('name') || '').trim()}`,
      ];
      const phone = String(data.get('phone') || '').trim();
      const details = String(data.get('details') || '').trim();
      if (phone) lines.push(`Phone: ${phone}`);
      lines.push(`Requirement: ${data.get('type')}`);
      if (details) lines.push('', details);

      const url = `https://wa.me/${number}?text=${encodeURIComponent(lines.join('\n'))}`;
      const win = window.open(url, '_blank');
      if (win) win.opener = null; else window.location.href = url;
    });
  }

  /* ---------- Placeholder links (Privacy Policy / Terms) ---------- */
  const toast = $('[data-toast]');
  let toastTimer;
  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-on'), 2600);
  };
  $$('[data-placeholder]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      showToast(`${a.dataset.placeholder} page coming soon.`);
    });
  });

  /* ---------- Footer year ---------- */
  const year = $('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
