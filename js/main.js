/* ==========================================================================
   HUNSY — Logique commune à toutes les pages
   Vidéo, préchargeur, en-tête, menu mobile, animations, cartes voitures,
   accordéon FAQ, carrousel, et logique propre à chaque page.
   ========================================================================== */
(function () {
  'use strict';

  const H = window.HUNSY;
  const root = document.documentElement;
  const page = document.body.dataset.page;
  const WA_NUMBER = '971501234567';
  const NBSP = ' ';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

  /* ---------- Utilitaires ---------- */

  /* Espaces insécables de la typographie française */
  function fr(text) {
    return String(text)
      .replace(/ ([?!:;»])/g, `${NBSP}$1`)
      .replace(/« /g, `«${NBSP}`);
  }

  function esc(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function waLink(message) {
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  function plural(count, singular, pluralForm) {
    return count > 1 ? pluralForm : singular;
  }

  function addDays(date, days) {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return copy;
  }

  function today() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  /* Normalise un texte pour la recherche (minuscules, sans accents) */
  function normalize(text) {
    return String(text).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  /* ---------- Icônes ---------- */
  const ICONS = {
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M18 14a6.5 6.5 0 0 1 3.5 6"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    truck: '<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    users2: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M18 14a6.5 6.5 0 0 1 3.5 6"/>',
    baby: '<circle cx="12" cy="7" r="3.5"/><path d="M6 21v-4a6 6 0 0 1 12 0v4M9 14l3 2 3-2"/>',
    route: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h8a3.5 3.5 0 0 0 0-7H8a3.5 3.5 0 0 1 0-7h8"/>'
  };

  function svg(name, size = 16) {
    return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;
  }

  /* ---------- Images des voitures & image de secours ---------- */
  const VIEWS = ['vue de trois quarts avant', 'vue de profil', 'vue de l’habitacle'];

  function carImage(car, index = 0, options = {}) {
    const src = car.images[index] || car.images[0];
    const alt = `${car.name} ${car.color.toLowerCase()}, ${VIEWS[index] || VIEWS[0]}`;
    return `<img src="${esc(src)}" alt="${esc(alt)}" width="800" height="500" loading="${options.eager ? 'eager' : 'lazy'}" decoding="async" data-brand="${esc(car.brand)}" data-name="${esc(car.model)}"${options.compact ? ' data-compact' : ''}>`;
  }

  function applyFallback(img) {
    const block = document.createElement('div');
    block.className = `img-fallback${img.hasAttribute('data-compact') ? ' img-fallback--compact' : ''}`;
    block.setAttribute('role', 'img');
    block.setAttribute('aria-label', img.alt || img.dataset.name || '');
    block.innerHTML = `<span class="img-fallback__brand">${esc(img.dataset.brand || '')}</span><span class="img-fallback__name">${esc(img.dataset.name || '')}</span>`;
    img.replaceWith(block);
  }

  /* Les événements 'error' ne remontent pas : écoute en phase de capture */
  document.addEventListener('error', (event) => {
    const target = event.target;
    if (target && target.tagName === 'IMG' && target.hasAttribute('data-brand')) applyFallback(target);
  }, true);

  function fixBrokenImages(context = document) {
    $$('img[data-brand]', context).forEach((img) => {
      if (img.complete && img.naturalWidth === 0) applyFallback(img);
    });
  }

  /* ---------- Carte voiture ---------- */
  function carCard(car, options = {}) {
    return `<a class="car-card reveal" href="voiture.html?id=${encodeURIComponent(car.slug)}" aria-label="${esc(`${car.name}, à partir de ${H.formatAED(car.pricePerDay)} par jour`)}">
      <div class="car-card__media">
        ${carImage(car, 0, options)}
        <span class="chip chip--glass">${esc(car.category)}</span>
      </div>
      <div class="car-card__body">
        <p class="car-card__brand">${esc(car.brand)}</p>
        <h3 class="h3 car-card__name">${esc(car.model)}</h3>
        <ul class="specs">
          <li>${svg('users')}${esc(car.seatsLabel)} places</li>
          <li>${svg('gear')}${esc(car.transmission)}</li>
          <li>${svg('bolt')}${car.horsepower}${NBSP}ch</li>
          <li>${svg('timer')}${String(car.acceleration).replace('.', ',')}${NBSP}s</li>
        </ul>
        <div class="car-card__foot">
          <p>à partir de <strong class="price">${H.priceHTML(car.pricePerDay)}</strong> / jour</p>
          <span class="car-card__link">Voir ${svg('arrow')}</span>
        </div>
      </div>
    </a>`;
  }

  function renderCars(container, cars, options = {}) {
    container.innerHTML = cars.map((car) => carCard(car, options)).join('');
    fixBrokenImages(container);
    observeReveals(container);
  }

  /* Remplacement avec fondu */
  function renderCarsAnimated(container, cars) {
    if (reduceMotion || !container.children.length) {
      renderCars(container, cars);
      return;
    }
    container.classList.add('is-fading');
    window.setTimeout(() => {
      renderCars(container, cars);
      $$('.reveal', container).forEach((el) => el.classList.add('is-visible'));
      container.classList.remove('is-fading');
    }, 220);
  }

  /* ---------- Détail du prix ---------- */
  function breakdownHTML(q, options = {}) {
    const rows = [];
    rows.push([`${H.formatAED(q.basePerDay)} × ${q.days}${NBSP}${plural(q.days, 'jour', 'jours')}`, H.formatAED(q.base)]);
    if (q.discount > 0) {
      rows.push([`Remise longue durée (−${Math.round(q.discountRate * 100)}${NBSP}%)`, `−${H.formatAED(q.discount)}`, 'is-discount']);
    }
    q.extras.forEach((extra) => rows.push([`${extra.label} (${H.formatAED(extra.pricePerDay)}/jour)`, H.formatAED(extra.total)]));
    rows.push(['Livraison', q.delivery ? H.formatAED(q.delivery) : 'Offerte']);
    if (q.collection) rows.push(['Récupération', H.formatAED(q.collection)]);
    rows.push([`TVA (5${NBSP}%)`, H.formatAED(q.vat)]);
    let html = rows.map(([label, value, cls]) => `<dt${cls ? ` class="${cls}"` : ''}>${label}</dt><dd${cls ? ` class="${cls}"` : ''}>${value}</dd>`).join('');
    html += `<dt class="is-total">Total TTC</dt><dd class="is-total">${H.formatAED(q.total)}</dd>`;
    if (options.deposit !== false) {
      html += `<dt class="is-deposit">Caution (remboursable)</dt><dd class="is-deposit">${H.formatAED(q.deposit)}</dd>`;
    }
    return html;
  }

  /* ---------- Formulaires : champs communs ---------- */
  function fillTimeSelects(context = document) {
    $$('[data-time-select]', context).forEach((select) => {
      if (select.options.length) return;
      for (let h = 0; h < 24; h += 1) {
        ['00', '30'].forEach((m) => {
          const value = `${String(h).padStart(2, '0')}:${m}`;
          select.add(new Option(value, value, false, value === '10:00'));
        });
      }
    });
  }

  function fillLocationSelects(context = document) {
    $$('[data-location-select]', context).forEach((select) => {
      if (select.options.length) return;
      H.PRICING.locations.forEach((loc) => {
        const label = loc.fee ? `${loc.label} (+${H.formatAED(loc.fee)})` : `${loc.label} (offerte)`;
        select.add(new Option(label, loc.id));
      });
    });
  }

  function fillCarSelects(context = document) {
    $$('[data-car-select]', context).forEach((select) => {
      if (select.options.length) return;
      if (select.hasAttribute('data-optional')) select.add(new Option('Aucune en particulier', ''));
      H.CATEGORIES.forEach((cat) => {
        const group = document.createElement('optgroup');
        group.label = cat.label;
        H.CARS.filter((car) => car.category === cat.value).forEach((car) => {
          group.appendChild(new Option(`${car.name} — ${H.formatAED(car.pricePerDay)}/jour`, car.slug));
        });
        select.appendChild(group);
      });
    });
  }

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function isValidPhone(value) {
    return /^[+\d\s().-]+$/.test(value) && value.replace(/\D/g, '').length >= 8;
  }

  /* Affiche ou retire le message d'erreur d'un champ */
  function setError(input, message) {
    const field = input.closest('.field');
    const error = document.getElementById(`${input.id}-error`);
    if (message) {
      if (field) field.classList.add('has-error');
      input.setAttribute('aria-invalid', 'true');
      if (error) {
        error.textContent = message;
        error.hidden = false;
      }
    } else {
      if (field) field.classList.remove('has-error');
      input.removeAttribute('aria-invalid');
      if (error) {
        error.textContent = '';
        error.hidden = true;
      }
    }
    return !message;
  }

  /* Efface l'erreur dès que l'utilisateur corrige */
  function clearOnInput(form) {
    form.addEventListener('input', (event) => {
      if (event.target.getAttribute('aria-invalid') === 'true') setError(event.target, '');
    });
    form.addEventListener('change', (event) => {
      if (event.target.getAttribute('aria-invalid') === 'true') setError(event.target, '');
    });
  }

  function focusFirstError(form) {
    const first = $('[aria-invalid="true"]', form);
    if (first) first.focus();
  }

  /* API partagée avec booking.js */
  window.HUNSY_UI = {
    fr,
    esc,
    svg,
    waLink,
    plural,
    addDays,
    today,
    carImage,
    carCard,
    renderCars,
    breakdownHTML,
    fixBrokenImages,
    setError,
    clearOnInput,
    focusFirstError,
    isValidPhone,
    EMAIL_RE
  };

  /* ======================================================================
     Vidéo d'arrière-plan : boucle infinie, ne s'arrête jamais
     ====================================================================== */
  function initVideo() {
    const video = $('#bg-video');
    if (!video) return null;
    video.loop = true;
    video.muted = true;
    const play = () => {
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') promise.catch(() => {});
    };
    video.addEventListener('ended', () => {
      video.currentTime = 0;
      play();
    });
    video.addEventListener('pause', play);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') play();
    });
    play();
    return video;
  }

  /* ======================================================================
     Préchargeur : une seule fois par session
     ====================================================================== */
  function initPreloader(video) {
    const preloader = $('#preloader');
    const start = () => root.classList.remove('is-loading');

    if (!preloader || !video || root.classList.contains('no-preloader')) {
      if (preloader) preloader.classList.add('is-hidden');
      start();
      return;
    }

    const value = $('#preloader-value');
    let done = false;

    const update = () => {
      if (done || !video.duration || !video.buffered.length) return;
      const end = video.buffered.end(video.buffered.length - 1);
      const percent = Math.min(100, Math.round((end / video.duration) * 100));
      value.textContent = `${percent}${NBSP}%`;
    };

    const hide = () => {
      if (done) return;
      done = true;
      value.textContent = `100${NBSP}%`;
      preloader.classList.add('is-hidden');
      try {
        sessionStorage.setItem('hunsy-preloaded', '1');
      } catch (e) { /* stockage indisponible */ }
      start();
    };

    video.addEventListener('progress', update);
    video.addEventListener('canplaythrough', hide);
    if (video.readyState >= 4) hide();
    window.setTimeout(hide, 6000);
  }

  /* ======================================================================
     En-tête : transparent sur la vidéo, opaque après 80 % du hero
     ====================================================================== */
  function initHeader() {
    const header = $('#site-header');
    if (!header) return;

    const setHeight = () => root.style.setProperty('--header-h', `${header.offsetHeight}px`);
    setHeight();
    window.addEventListener('resize', setHeight);

    if (header.classList.contains('is-static')) return;

    const hero = $('[data-hero]');
    if (!hero) {
      header.classList.add('is-solid');
      return;
    }

    let ticking = false;
    const update = () => {
      header.classList.toggle('is-solid', window.scrollY > hero.offsetHeight * 0.8);
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ======================================================================
     Menu mobile
     ====================================================================== */
  function initMobileMenu() {
    const toggle = $('.menu-toggle');
    const menu = $('#mobile-menu');
    if (!toggle || !menu) return;
    const closeBtn = $('.mobile-menu__close', menu);

    const open = () => {
      menu.classList.add('is-open');
      document.body.classList.add('menu-open');
      toggle.setAttribute('aria-expanded', 'true');
      closeBtn.focus();
    };

    const close = (returnFocus = true) => {
      if (!menu.classList.contains('is-open')) return;
      menu.classList.remove('is-open');
      document.body.classList.remove('menu-open');
      toggle.setAttribute('aria-expanded', 'false');
      if (returnFocus) toggle.focus();
    };

    toggle.addEventListener('click', open);
    closeBtn.addEventListener('click', () => close());
    $$('a', menu).forEach((link) => link.addEventListener('click', () => close(false)));

    document.addEventListener('keydown', (event) => {
      if (!menu.classList.contains('is-open')) return;
      if (event.key === 'Escape') close();
      if (event.key === 'Tab') {
        const focusables = $$('a, button', menu);
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    window.matchMedia('(min-width: 900px)').addEventListener('change', (event) => {
      if (event.matches) close(false);
    });
  }

  /* ======================================================================
     Titres et textes animés mot par mot
     ====================================================================== */
  function splitWords() {
    $$('[data-split]').forEach((el) => {
      const type = el.dataset.split === 'title' ? 'title' : 'fade';
      const start = parseFloat(el.dataset.start || (type === 'title' ? '0.30' : '1.00'));
      const step = type === 'title' ? 0.1 : 0.05;
      const fragment = document.createDocumentFragment();
      let index = 0;

      Array.from(el.childNodes).forEach((node) => {
        if (node.nodeType !== Node.TEXT_NODE) {
          fragment.appendChild(node);
          return;
        }
        node.textContent.split(/([ \t\n\r]+)/).forEach((part) => {
          if (!part) return;
          if (/^[ \t\n\r]+$/.test(part)) {
            fragment.appendChild(document.createTextNode(' '));
            return;
          }
          const span = document.createElement('span');
          span.className = `word word--${type}`;
          span.textContent = part;
          span.style.animationDelay = `${(start + index * step).toFixed(2)}s`;
          index += 1;
          fragment.appendChild(span);
        });
      });

      el.textContent = '';
      el.appendChild(fragment);
      el.classList.add('is-split');
    });
  }

  /* ======================================================================
     Apparition au scroll
     ====================================================================== */
  let revealObserver = null;

  function revealElement(el) {
    const group = el.parentElement && el.parentElement.closest('.reveal-group, .car-grid');
    if (group) {
      const siblings = $$(':scope > .reveal', group);
      const index = Math.max(0, siblings.indexOf(el));
      el.style.setProperty('--d', `${(index % 8) * 0.08}s`);
    }
    el.classList.add('is-visible');
  }

  function observeReveals(context = document) {
    const items = $$('.reveal:not(.is-visible)', context);
    if (!revealObserver) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    items.forEach((el) => revealObserver.observe(el));
  }

  function initReveal() {
    if ('IntersectionObserver' in window && !reduceMotion) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          /* 15 % visible, ou un quart de l'écran pour les blocs très hauts */
          const enough = entry.intersectionRatio >= 0.15 || entry.intersectionRect.height >= window.innerHeight * 0.25;
          if (!enough) return;
          revealElement(entry.target);
          revealObserver.unobserve(entry.target);
        });
      }, { threshold: [0, 0.15, 0.3] });
    }
    observeReveals();
  }

  /* ======================================================================
     Compteurs animés
     ====================================================================== */
  function initCounters() {
    const counters = $$('[data-count]');
    if (!counters.length) return;

    const format = (el, value) => {
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const suffix = (el.dataset.suffix || '').replace(/^ /, NBSP);
      el.textContent = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value) + suffix;
    };

    const run = (el) => {
      const target = parseFloat(el.dataset.count);
      if (reduceMotion) {
        format(el, target);
        return;
      }
      const duration = 1200;
      const startTime = performance.now();
      const tick = (now) => {
        const progress = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        format(el, target * eased);
        if (progress < 1) window.requestAnimationFrame(tick);
      };
      window.requestAnimationFrame(tick);
    };

    if (!('IntersectionObserver' in window)) {
      counters.forEach((el) => format(el, parseFloat(el.dataset.count)));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          run(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => observer.observe(el));
  }

  /* ======================================================================
     Bouton WhatsApp flottant
     ====================================================================== */
  function initFloatingWhatsApp() {
    const button = $('.wa-float');
    if (!button) return;
    const update = () => button.classList.toggle('is-visible', window.scrollY > 400);
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ======================================================================
     Pastilles de catégories
     ====================================================================== */
  function initPills(container, onChange) {
    const buttons = $$('.pill', container);
    const select = (value, notify = true) => {
      buttons.forEach((btn) => {
        const active = btn.dataset.category === value;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', String(active));
      });
      if (notify) onChange(value);
    };
    buttons.forEach((btn) => btn.addEventListener('click', () => select(btn.dataset.category)));
    return select;
  }

  /* ======================================================================
     Accordéon FAQ : une seule question ouverte par groupe
     ====================================================================== */
  function initAccordions() {
    $$('[data-accordion]').forEach((list) => {
      const items = $$('[data-faq-item]', list);
      items.forEach((item) => {
        const button = $('button', item);
        button.addEventListener('click', () => {
          const willOpen = button.getAttribute('aria-expanded') !== 'true';
          items.forEach((other) => {
            other.classList.remove('is-open');
            $('button', other).setAttribute('aria-expanded', 'false');
          });
          if (willOpen) {
            item.classList.add('is-open');
            button.setAttribute('aria-expanded', 'true');
          }
        });
      });
    });
  }

  /* ======================================================================
     Carrousel d'avis
     ====================================================================== */
  function initSliders() {
    $$('[data-slider]').forEach((slider) => {
      const track = $('.slider__track', slider);
      const prev = $('[data-slider-prev]', slider);
      const next = $('[data-slider-next]', slider);
      const step = () => {
        const card = track.firstElementChild;
        const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        return card ? card.getBoundingClientRect().width + gap : track.clientWidth;
      };
      const updateButtons = () => {
        const max = track.scrollWidth - track.clientWidth - 2;
        prev.disabled = track.scrollLeft <= 2;
        next.disabled = track.scrollLeft >= max;
      };
      prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: reduceMotion ? 'auto' : 'smooth' }));
      next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: reduceMotion ? 'auto' : 'smooth' }));
      track.addEventListener('scroll', updateButtons, { passive: true });
      track.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight') { event.preventDefault(); next.click(); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); prev.click(); }
      });
      window.addEventListener('resize', updateButtons);
      updateButtons();
    });
  }

  /* ======================================================================
     Zones de livraison (tarifs, fonctionnement)
     ====================================================================== */
  function renderZones() {
    $$('#zone-list').forEach((list) => {
      list.innerHTML = H.PRICING.locations.map((loc) => `<li><span>${esc(loc.label)}</span><span class="${loc.fee ? '' : 'is-free'}">${loc.fee ? H.formatAED(loc.fee) : 'Offerte'}</span></li>`).join('');
    });
  }

  /* ======================================================================
     PAGE D'ACCUEIL : flotte à la une
     ====================================================================== */
  function initHome() {
    const grid = $('#home-grid');
    if (!grid) return;
    const featured = H.CARS.filter((car) => car.featured).slice(0, 6);
    renderCars(grid, featured);
    const pills = $('[data-pills="home-grid"]');
    if (pills) {
      initPills(pills, (category) => {
        const cars = category === 'all' ? featured : H.CARS.filter((car) => car.category === category).slice(0, 6);
        renderCarsAnimated(grid, cars);
      });
    }
  }

  /* ======================================================================
     PAGE FLOTTE : filtres, tri, URL
     ====================================================================== */
  function initFleet() {
    const grid = $('#fleet-grid');
    if (!grid) return;
    const bar = $('#filter-bar');
    const search = $('#f-search');
    const sort = $('#f-sort');
    const price = $('#f-price');
    const priceValue = $('#f-price-value');
    const seats = $('#f-seats');
    const count = $('#results-count');
    const empty = $('#empty-state');
    const toggle = $('.filter-toggle');
    const params = new URLSearchParams(window.location.search);
    const MAX_PRICE = 5000;

    const state = {
      category: params.get('categorie') || 'all',
      query: params.get('q') || '',
      sort: params.get('tri') || 'recommande',
      maxPrice: parseInt(params.get('prix') || MAX_PRICE, 10) || MAX_PRICE,
      seats: parseInt(params.get('places') || '0', 10) || 0
    };
    if (state.category !== 'all' && !H.CATEGORIES.some((c) => c.value === state.category)) state.category = 'all';
    if (!['recommande', 'prix-croissant', 'prix-decroissant', 'puissance'].includes(state.sort)) state.sort = 'recommande';

    search.value = state.query;
    sort.value = state.sort;
    price.value = state.maxPrice;
    seats.value = String(state.seats);

    const syncURL = () => {
      const next = new URLSearchParams();
      if (state.category !== 'all') next.set('categorie', state.category);
      if (state.query) next.set('q', state.query);
      if (state.sort !== 'recommande') next.set('tri', state.sort);
      if (state.maxPrice < MAX_PRICE) next.set('prix', state.maxPrice);
      if (state.seats) next.set('places', state.seats);
      const qs = next.toString();
      window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
    };

    const results = () => {
      const q = normalize(state.query.trim());
      let cars = H.CARS.filter((car) =>
        (state.category === 'all' || car.category === state.category) &&
        car.pricePerDay <= state.maxPrice &&
        car.seats >= state.seats &&
        (!q || normalize(`${car.name} ${car.brand} ${car.model} ${car.category}`).includes(q)));
      if (state.sort === 'prix-croissant') cars = cars.slice().sort((a, b) => a.pricePerDay - b.pricePerDay);
      if (state.sort === 'prix-decroissant') cars = cars.slice().sort((a, b) => b.pricePerDay - a.pricePerDay);
      if (state.sort === 'puissance') cars = cars.slice().sort((a, b) => b.horsepower - a.horsepower);
      return cars;
    };

    let first = true;
    const update = () => {
      priceValue.textContent = H.formatAED(state.maxPrice);
      const cars = results();
      count.textContent = cars.length
        ? `${cars.length} ${plural(cars.length, 'voiture disponible', 'voitures disponibles')}`
        : 'Aucune voiture disponible';
      empty.hidden = cars.length > 0;
      if (first) {
        renderCars(grid, cars);
        first = false;
      } else {
        renderCarsAnimated(grid, cars);
      }
      syncURL();
    };

    const selectPill = initPills($('[data-pills="fleet-grid"]'), (category) => {
      state.category = category;
      update();
    });
    selectPill(state.category, false);

    let searchTimer;
    search.addEventListener('input', () => {
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(() => {
        state.query = search.value;
        update();
      }, 150);
    });
    sort.addEventListener('change', () => { state.sort = sort.value; update(); });
    price.addEventListener('input', () => { state.maxPrice = parseInt(price.value, 10); update(); });
    seats.addEventListener('change', () => { state.seats = parseInt(seats.value, 10); update(); });

    $$('[data-reset-filters]').forEach((btn) => btn.addEventListener('click', () => {
      Object.assign(state, { category: 'all', query: '', sort: 'recommande', maxPrice: MAX_PRICE, seats: 0 });
      search.value = '';
      sort.value = 'recommande';
      price.value = MAX_PRICE;
      seats.value = '0';
      selectPill('all', false);
      update();
    }));

    /* Panneau de filtres (mobile) */
    const openPanel = () => {
      bar.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
      window.setTimeout(() => search.focus(), 300);
    };
    const closePanel = () => {
      if (!bar.classList.contains('is-open')) return;
      bar.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
      toggle.focus();
    };
    toggle.addEventListener('click', openPanel);
    $$('[data-close-filters]').forEach((el) => el.addEventListener('click', closePanel));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closePanel();
    });

    update();
  }

  /* ======================================================================
     FICHE VOITURE
     ====================================================================== */
  function initCarPage() {
    const params = new URLSearchParams(window.location.search);
    const car = H.getCar(params.get('id'));
    if (!car) {
      window.location.replace('flotte.html');
      return;
    }

    /* Titre, description et données structurées */
    document.title = `${car.name} — Location à Dubaï dès ${H.formatAED(car.pricePerDay)}/jour | HUNSY`;
    const metaDesc = $('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', `Louez la ${car.name} à Dubaï à partir de ${H.formatAED(car.pricePerDay)} par jour. ${car.horsepower} ch, ${car.seatsLabel} places, livraison offerte, assurance incluse.`);
    const ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: car.name,
      brand: { '@type': 'Brand', name: car.brand },
      category: car.category,
      description: car.description,
      image: car.images.map((src) => `https://www.hunsy.ae/${src}`),
      offers: {
        '@type': 'Offer',
        priceCurrency: 'AED',
        price: car.pricePerDay,
        availability: 'https://schema.org/InStock',
        url: `https://www.hunsy.ae/voiture.html?id=${car.slug}`,
        seller: { '@type': 'AutoRental', name: 'HUNSY' }
      }
    });
    document.head.appendChild(ld);

    /* Contenu */
    $('#crumb-name').textContent = car.name;
    $('#car-category').textContent = car.category;
    $('#car-brand').textContent = car.brand;
    $('#car-name').textContent = car.model;
    $('#car-meta').textContent = `${car.year} · ${car.color}`;
    $('#car-description').textContent = fr(car.description);

    const specs = [
      ['Puissance', `${car.horsepower}${NBSP}ch`],
      ['0–100 km/h', `${String(car.acceleration).replace('.', ',')}${NBSP}s`],
      ['Vitesse max', `${car.topSpeed}${NBSP}km/h`],
      ['Places', car.seatsLabel],
      ['Portes', car.doors],
      ['Boîte', car.transmission],
      ['Carburant', car.fuel],
      ['Km/jour inclus', `${car.kmPerDay}${NBSP}km`]
    ];
    $('#car-specs').innerHTML = specs.map(([label, value]) => `<div class="spec"><p class="spec__label">${label}</p><p class="spec__value">${esc(value)}</p></div>`).join('');
    $('#car-features').innerHTML = car.features.map((f) => `<li>${svg('check', 18)}<span>${esc(fr(f))}</span></li>`).join('');
    $('#car-requirements').innerHTML = [
      ['Âge minimum', `${car.minAge}${NBSP}ans`],
      ['Permis de conduire', `Depuis au moins 1${NBSP}an`],
      ['Pièce d’identité', 'Passeport ou Emirates ID'],
      ['Caution', `${H.formatAED(car.deposit)}, remboursée sous 14${NBSP}jours`]
    ].map(([label, value]) => `<li><span>${label}</span><span>${value}</span></li>`).join('');

    /* Galerie + visionneuse */
    const main = $('#gallery-main');
    const thumbs = $('#gallery-thumbs');
    let current = 0;
    const showMain = (index) => {
      current = index;
      main.innerHTML = carImage(car, index, { eager: index === 0 });
      $$('button', thumbs).forEach((btn, i) => btn.setAttribute('aria-current', String(i === index)));
      fixBrokenImages(main);
    };
    thumbs.innerHTML = car.images.map((_, i) => `<button type="button" aria-label="Afficher la photo ${i + 1}">${carImage(car, i, { compact: true })}</button>`).join('');
    $$('button', thumbs).forEach((btn, i) => btn.addEventListener('click', () => showMain(i)));
    showMain(0);
    fixBrokenImages(thumbs);
    initLightbox(car, () => current, main);

    /* Module de réservation */
    initBookingWidget(car);

    /* Voitures similaires */
    let similar = H.CARS.filter((c) => c.category === car.category && c.slug !== car.slug);
    if (similar.length < 3) {
      const others = H.CARS
        .filter((c) => c.slug !== car.slug && !similar.includes(c))
        .sort((a, b) => Math.abs(a.pricePerDay - car.pricePerDay) - Math.abs(b.pricePerDay - car.pricePerDay));
      similar = similar.concat(others);
    }
    renderCars($('#similar-grid'), similar.slice(0, 3));
  }

  function initLightbox(car, getIndex, trigger) {
    const box = $('#lightbox');
    const stage = $('#lightbox-stage');
    const counter = $('#lightbox-count');
    let index = 0;

    const show = (i) => {
      index = (i + car.images.length) % car.images.length;
      stage.innerHTML = carImage(car, index, { eager: true });
      counter.textContent = `${index + 1} / ${car.images.length}`;
      fixBrokenImages(stage);
    };
    const open = () => {
      box.hidden = false;
      document.body.classList.add('menu-open');
      show(getIndex());
      $('.lightbox__close', box).focus();
    };
    const close = () => {
      box.hidden = true;
      document.body.classList.remove('menu-open');
      trigger.focus();
    };

    trigger.addEventListener('click', open);
    $('.lightbox__close', box).addEventListener('click', close);
    $('.lightbox__prev', box).addEventListener('click', () => show(index - 1));
    $('.lightbox__next', box).addEventListener('click', () => show(index + 1));
    box.addEventListener('click', (event) => {
      if (event.target === box) close();
    });
    document.addEventListener('keydown', (event) => {
      if (box.hidden) return;
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowLeft') show(index - 1);
      if (event.key === 'ArrowRight') show(index + 1);
      if (event.key === 'Tab') {
        const focusables = $$('button', box).filter((b) => b.offsetParent !== null);
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });

    /* Balayage sur mobile */
    let startX = null;
    stage.addEventListener('touchstart', (event) => { startX = event.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', (event) => {
      if (startX === null) return;
      const delta = event.changedTouches[0].clientX - startX;
      if (Math.abs(delta) > 40) show(index + (delta < 0 ? 1 : -1));
      startX = null;
    });
  }

  function initBookingWidget(car) {
    const form = $('#booking-widget');
    const start = $('#w-start');
    const end = $('#w-end');
    const time = $('#w-time');
    const location = $('#w-location');
    const breakdown = $('#w-breakdown');
    const endError = $('#w-end-error');
    const wa = $('#w-wa');
    const t = today();

    $('#w-price').innerHTML = H.priceHTML(car.pricePerDay);
    $('#bar-price').innerHTML = H.priceHTML(car.pricePerDay);
    $('#w-rates').innerHTML = `${H.formatAED(Math.round(car.pricePerDay * (1 - H.PRICING.weeklyDiscount)))} / jour dès 7${NBSP}jours<br>${H.formatAED(Math.round(car.pricePerDay * (1 - H.PRICING.monthlyDiscount)))} / jour dès 28${NBSP}jours`;

    start.min = H.toISODate(t);
    start.value = H.toISODate(addDays(t, 1));
    end.min = H.toISODate(addDays(t, 2));
    end.value = H.toISODate(addDays(t, 4));

    const update = () => {
      const startDate = H.parseDate(start.value);
      if (startDate) end.min = H.toISODate(addDays(startDate, 1));
      const endDate = H.parseDate(end.value);
      const valid = startDate && endDate && endDate > startDate;
      endError.hidden = valid || !startDate || !endDate;
      end.closest('.field').classList.toggle('has-error', !endError.hidden);
      const days = valid ? H.daysBetween(startDate, endDate) : 1;
      const q = H.quote({ car, days, extras: [], delivery: location.value });
      breakdown.innerHTML = breakdownHTML(q);
      const from = H.formatDate(start.value);
      const to = H.formatDate(end.value);
      wa.href = waLink(`Bonjour HUNSY, je suis intéressé(e) par la ${car.name} du ${from} au ${to}.`);
      return valid;
    };

    start.addEventListener('change', () => {
      const startDate = H.parseDate(start.value);
      const endDate = H.parseDate(end.value);
      if (startDate && (!endDate || endDate <= startDate)) end.value = H.toISODate(addDays(startDate, 1));
      update();
    });
    [end, time, location].forEach((el) => el.addEventListener('change', update));

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!update()) {
        end.focus();
        return;
      }
      const qs = new URLSearchParams({ voiture: car.slug, debut: start.value, fin: end.value, heure: time.value, lieu: location.value });
      window.location.href = `reservation.html?${qs.toString()}`;
    });

    update();

    /* Barre de réservation fixe sur mobile, masquée quand le module est visible */
    const bar = $('#mobile-book-bar');
    $('#bar-book').addEventListener('click', (event) => {
      event.preventDefault();
      form.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      window.setTimeout(() => start.focus({ preventScroll: true }), 500);
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        bar.classList.toggle('is-visible', !entries[0].isIntersecting);
      }).observe(form);
    } else {
      bar.classList.add('is-visible');
    }
  }

  /* ======================================================================
     PAGE TARIFS
     ====================================================================== */
  function initPricing() {
    /* Tableau des prix */
    const body = $('#price-table-body');
    if (body) {
      body.innerHTML = H.CARS.map((car) => {
        const week = Math.round(car.pricePerDay * (1 - H.PRICING.weeklyDiscount));
        const month = Math.round(car.pricePerDay * (1 - H.PRICING.monthlyDiscount));
        return `<tr>
          <td><a class="price-table__car" href="voiture.html?id=${car.slug}"><span class="price-table__thumb">${carImage(car, 0, { compact: true })}</span><span><strong>${esc(car.name)}</strong><span>${esc(car.category)}</span></span></a></td>
          <td data-label="Journée"><strong class="price">${H.priceHTML(car.pricePerDay)}</strong></td>
          <td data-label="Semaine (/jour)">${H.priceHTML(week)}</td>
          <td data-label="Mois (/jour)">${H.priceHTML(month)}</td>
          <td data-label="Caution">${H.priceHTML(car.deposit)}</td>
          <td><a class="text-link" href="reservation.html?voiture=${car.slug}">Réserver ${svg('arrow')}</a></td>
        </tr>`;
      }).join('');
      fixBrokenImages(body);
    }

    /* Options */
    const extras = $('#extras-grid');
    if (extras) {
      const icons = { assurance: 'shield', conducteur: 'users2', 'siege-enfant': 'baby', km: 'route' };
      extras.innerHTML = H.PRICING.extras.map((extra) => `<article class="info-card reveal">
        <span class="feature__icon">${svg(icons[extra.id] || 'check', 22)}</span>
        <h3 class="h3">${esc(fr(extra.label))}</h3>
        <p>${esc(fr(extra.description))}</p>
        <p><strong class="price">${H.priceHTML(extra.pricePerDay)}</strong> <span>/ jour</span></p>
      </article>`).join('');
      observeReveals(extras);
    }

    /* Simulateur */
    const sim = $('#simulator');
    if (!sim) return;
    const carSelect = $('#s-car');
    const start = $('#s-start');
    const end = $('#s-end');
    const location = $('#s-location');
    const extrasBox = $('#s-extras');
    const result = $('#s-breakdown');
    const book = $('#s-book');
    const t = today();

    carSelect.value = 'mercedes-amg-g63';
    start.min = H.toISODate(t);
    start.value = H.toISODate(addDays(t, 1));
    end.value = H.toISODate(addDays(t, 8));
    extrasBox.innerHTML = H.PRICING.extras.map((extra) => `<label class="check-tile"><input type="checkbox" value="${extra.id}"><span>${esc(fr(extra.short))}</span><small>${H.formatAED(extra.pricePerDay)}/j</small></label>`).join('');

    const update = () => {
      const car = H.getCar(carSelect.value) || H.CARS[0];
      const startDate = H.parseDate(start.value);
      if (startDate) end.min = H.toISODate(addDays(startDate, 1));
      let endDate = H.parseDate(end.value);
      if (startDate && (!endDate || endDate <= startDate)) {
        endDate = addDays(startDate, 1);
        end.value = H.toISODate(endDate);
      }
      const days = startDate && endDate ? H.daysBetween(startDate, endDate) : 1;
      const chosen = $$('input:checked', extrasBox).map((input) => input.value);
      result.innerHTML = breakdownHTML(H.quote({ car, days, extras: chosen, delivery: location.value }));
      const qs = new URLSearchParams({ voiture: car.slug, debut: start.value, fin: end.value, lieu: location.value });
      if (chosen.length) qs.set('options', chosen.join(','));
      book.href = `reservation.html?${qs.toString()}`;
    };
    sim.addEventListener('change', update);
    sim.addEventListener('input', update);
    sim.addEventListener('submit', (event) => event.preventDefault());
    update();
  }

  /* ======================================================================
     PAGE FAQ : recherche + catégorie active
     ====================================================================== */
  function initFaqPage() {
    const search = $('#faq-search');
    if (!search) return;
    const groups = $$('[data-faq-group]');
    const empty = $('#faq-empty');
    const links = $$('.faq-nav__link');

    search.addEventListener('input', () => {
      const q = normalize(search.value.trim());
      let total = 0;
      groups.forEach((group) => {
        let visible = 0;
        $$('[data-faq-item]', group).forEach((item) => {
          const match = !q || normalize(item.textContent).includes(q);
          item.hidden = !match;
          if (match) visible += 1;
        });
        group.hidden = visible === 0;
        total += visible;
      });
      empty.hidden = total > 0;
    });

    const setActive = (id) => {
      links.forEach((link) => {
        const active = link.getAttribute('href') === `#${id}`;
        link.classList.toggle('is-active', active);
        if (active && link.parentElement.scrollWidth > link.parentElement.clientWidth) {
          link.parentElement.scrollTo({ left: link.offsetLeft - 20, behavior: reduceMotion ? 'auto' : 'smooth' });
        }
      });
    };
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      }, { rootMargin: '-30% 0px -60% 0px' });
      groups.forEach((group) => observer.observe(group));
    }
  }

  /* ======================================================================
     PAGE CONTACT
     ====================================================================== */

  /* À brancher sur un vrai service d'envoi (Formspree, Getform, API maison…).
     Exemple avec Formspree :
       return fetch('https://formspree.io/f/VOTRE_IDENTIFIANT', {
         method: 'POST',
         headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
         body: JSON.stringify(data)
       }).then((response) => { if (!response.ok) throw new Error('Envoi impossible'); });
     En attendant, l'envoi est simulé. */
  function sendForm(data) {
    return new Promise((resolve) => window.setTimeout(() => resolve(data), 800));
  }

  function initContact() {
    const form = $('#contact-form');
    if (!form) return;
    clearOnInput(form);

    const preset = new URLSearchParams(window.location.search).get('voiture');
    if (preset && H.getCar(preset)) $('#c-car').value = preset;

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = $('#c-name');
      const email = $('#c-email');
      const phone = $('#c-phone');
      const message = $('#c-message');
      const consent = $('#c-consent');

      let ok = true;
      ok = setError(name, name.value.trim().length >= 2 ? '' : 'Indiquez votre nom complet.') && ok;
      ok = setError(email, !email.value.trim() ? 'Ce champ est obligatoire.' : (EMAIL_RE.test(email.value.trim()) ? '' : 'Adresse e-mail invalide.')) && ok;
      ok = setError(phone, !phone.value.trim() ? 'Ce champ est obligatoire.' : (isValidPhone(phone.value.trim()) ? '' : 'Numéro de téléphone invalide.')) && ok;
      ok = setError(message, message.value.trim().length >= 10 ? '' : 'Votre message doit contenir au moins 10 caractères.') && ok;
      ok = setError(consent, consent.checked ? '' : 'Merci d’accepter la politique de confidentialité.') && ok;
      if (!ok) {
        focusFirstError(form);
        return;
      }

      const car = H.getCar($('#c-car').value);
      const data = {
        name: name.value.trim(),
        email: email.value.trim(),
        phone: phone.value.trim(),
        subject: $('#c-subject').value,
        car: car ? car.name : '',
        message: message.value.trim()
      };

      const submit = $('button[type="submit"]', form);
      submit.classList.add('is-loading');
      submit.textContent = 'Envoi en cours…';

      sendForm(data).then(() => {
        const firstName = data.name.split(/\s+/)[0];
        const success = $('#contact-success');
        $('#contact-success-title').textContent = fr(`Merci ${firstName} !`);
        $('#contact-success-wa').href = waLink(`Bonjour HUNSY, je suis ${data.name}. ${data.subject}${data.car ? ` (${data.car})` : ''} : ${data.message}`);
        form.hidden = true;
        success.hidden = false;
        success.focus();
      }).catch(() => {
        submit.classList.remove('is-loading');
        submit.textContent = 'Envoyer le message';
        window.alert('L’envoi a échoué. Réessayez ou écrivez-nous sur WhatsApp.');
      });
    });
  }

  /* ======================================================================
     Pages légales : sommaire actif
     ====================================================================== */
  function initLegal() {
    const links = $$('.legal__toc a');
    if (!links.length || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    $$('.legal__section').forEach((section) => observer.observe(section));
  }

  /* ======================================================================
     Initialisation
     ====================================================================== */
  splitWords();
  const video = initVideo();
  initPreloader(video);
  initHeader();
  initMobileMenu();
  fillTimeSelects();
  fillLocationSelects();
  fillCarSelects();
  initReveal();
  initCounters();
  initFloatingWhatsApp();
  initAccordions();
  initSliders();
  renderZones();

  if (page === 'home') initHome();
  if (page === 'fleet') initFleet();
  if (page === 'car') initCarPage();
  if (page === 'pricing') initPricing();
  if (page === 'faq') initFaqPage();
  if (page === 'contact') initContact();
  if (page === 'legal') initLegal();

  fixBrokenImages();
})();
