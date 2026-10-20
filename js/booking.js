/* ==========================================================================
   HUNSY — Réservation en 4 étapes et page de confirmation
   ========================================================================== */
(function () {
  'use strict';

  const H = window.HUNSY;
  const UI = window.HUNSY_UI;
  const STORAGE_KEY = 'hunsy-booking';
  const NBSP = ' ';
  const page = document.body.dataset.page;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));
  const esc = UI.esc;

  /* ---------- Partagé ---------- */
  function documentsFor(status) {
    if (status === 'resident') {
      return ['Emirates ID en cours de validité', 'Permis de conduire émirien', 'Carte de crédit au nom du conducteur (caution)'];
    }
    return ['Passeport avec tampon ou visa d’entrée', 'Permis de conduire de votre pays', 'Permis international si votre pays l’exige', 'Carte de crédit au nom du conducteur (caution)'];
  }

  function bookingQuote(booking) {
    const car = H.getCar(booking.car);
    if (!car) return null;
    const days = H.daysBetween(booking.start, booking.end);
    return H.quote({ car, days, extras: booking.extras, delivery: booking.delivery, collection: booking.returnLocation });
  }

  function summaryHTML(booking) {
    const car = H.getCar(booking.car);
    if (!car) return '';
    const q = bookingQuote(booking);
    const valid = booking.start && booking.end && H.parseDate(booking.end) > H.parseDate(booking.start);
    return `<div class="summary-card__media">${UI.carImage(car, 0, { eager: true })}</div>
      ${booking.ref ? `<p class="summary-card__ref">RÉFÉRENCE ${esc(booking.ref)}</p>` : ''}
      <div>
        <p class="car-card__brand">${esc(car.brand)}</p>
        <h3 class="h3">${esc(car.model)}</h3>
      </div>
      <div class="summary-card__dates">
        <p><span>Prise en charge</span>${valid ? `${H.formatDate(booking.start)} · ${esc(booking.startTime)}` : '—'}</p>
        <p><span>Retour</span>${valid ? `${H.formatDate(booking.end)} · ${esc(booking.endTime)}` : '—'}</p>
      </div>
      <p class="muted">${q.days}${NBSP}${UI.plural(q.days, 'jour', 'jours')} · ${esc(H.getLocation(booking.delivery).label)}</p>
      <dl class="breakdown">${UI.breakdownHTML(q)}</dl>`;
  }

  function renderSummaries(booking) {
    $$('[data-summary]').forEach((el) => {
      el.innerHTML = summaryHTML(booking);
      UI.fixBrokenImages(el);
    });
    const total = $('#summary-mobile-total');
    if (total) {
      const q = bookingQuote(booking);
      total.textContent = q ? H.formatAED(q.total) : '';
    }
  }

  function randomRef() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const values = new Uint32Array(6);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(values);
    } else {
      for (let i = 0; i < 6; i += 1) values[i] = Math.floor(Math.random() * 1e6);
    }
    return `HNS-${Array.from(values, (v) => letters[v % letters.length]).join('')}`;
  }

  function ageOn(birth, onDate) {
    let age = onDate.getFullYear() - birth.getFullYear();
    const m = onDate.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && onDate.getDate() < birth.getDate())) age -= 1;
    return age;
  }

  /* ======================================================================
     PAGE RÉSERVATION
     ====================================================================== */
  function initBooking() {
    const form = $('#booking-form');
    const steps = $$('.booking-step', form);
    const progress = $$('[data-progress]');
    const back = $('#b-back');
    const next = $('#b-next');
    const submit = $('#b-submit');
    const params = new URLSearchParams(window.location.search);
    const today = UI.today();

    const f = {
      car: $('#b-car'),
      start: $('#b-start'),
      startTime: $('#b-start-time'),
      end: $('#b-end'),
      endTime: $('#b-end-time'),
      delivery: $('#b-location'),
      returnLocation: $('#b-return'),
      address: $('#b-address'),
      first: $('#b-first'),
      last: $('#b-last'),
      email: $('#b-email'),
      phone: $('#b-phone'),
      nationality: $('#b-nationality'),
      birth: $('#b-birth'),
      flight: $('#b-flight'),
      terms: $('#b-terms')
    };

    /* Valeurs initiales (depuis l'URL si présentes) */
    const preset = H.getCar(params.get('voiture'));
    f.car.value = preset ? preset.slug : 'mercedes-amg-g63';
    f.start.min = H.toISODate(today);
    const startParam = H.parseDate(params.get('debut'));
    const startDate = startParam && startParam >= today ? startParam : UI.addDays(today, 1);
    f.start.value = H.toISODate(startDate);
    const endParam = H.parseDate(params.get('fin'));
    f.end.value = H.toISODate(endParam && endParam > startDate ? endParam : UI.addDays(startDate, 3));
    f.end.min = H.toISODate(UI.addDays(startDate, 1));
    const time = params.get('heure');
    if (time && $$('option', f.startTime).some((o) => o.value === time)) {
      f.startTime.value = time;
      f.endTime.value = time;
    }
    const loc = params.get('lieu');
    if (loc && H.PRICING.locations.some((l) => l.id === loc)) f.delivery.value = loc;
    f.returnLocation.value = 'dubai';
    const birthMax = new Date(today.getFullYear() - 21, today.getMonth(), today.getDate());
    f.birth.max = H.toISODate(birthMax);

    /* Options */
    const presetExtras = (params.get('options') || '').split(',');
    $('#b-extras').innerHTML = H.PRICING.extras.map((extra) => `<label class="option-card">
        <input type="checkbox" name="extras" value="${extra.id}"${presetExtras.includes(extra.id) ? ' checked' : ''}>
        <span class="option-card__box" aria-hidden="true">${UI.svg('check', 16)}</span>
        <strong>${esc(UI.fr(extra.label))}</strong>
        <p>${esc(UI.fr(extra.description))}</p>
        <p><strong class="price">${H.priceHTML(extra.pricePerDay)}</strong> / jour</p>
      </label>`).join('');

    const read = () => ({
      car: f.car.value,
      start: f.start.value,
      startTime: f.startTime.value,
      end: f.end.value,
      endTime: f.endTime.value,
      delivery: f.delivery.value,
      returnLocation: f.returnLocation.value,
      address: f.address.value.trim(),
      extras: $$('input[name="extras"]:checked', form).map((input) => input.value),
      firstName: f.first.value.trim(),
      lastName: f.last.value.trim(),
      email: f.email.value.trim(),
      phone: f.phone.value.trim(),
      nationality: f.nationality.value.trim(),
      birth: f.birth.value,
      status: $('input[name="b-status"]:checked', form).value,
      flight: f.flight.value.trim()
    });

    /* Documents et numéro de vol selon la situation */
    const updateContext = () => {
      const booking = read();
      $('#b-docs').innerHTML = `<strong>Documents à présenter à la livraison</strong><ul>${documentsFor(booking.status).map((d) => `<li>${esc(d)}</li>`).join('')}</ul>`;
      const airport = H.getLocation(booking.delivery).airport;
      $('#b-flight-field').hidden = !airport;
      f.address.placeholder = airport ? 'Terminal (ex. Terminal 3, arrivées)' : 'Hôtel, résidence, rue ou terminal';
    };

    const refresh = () => {
      const startValue = H.parseDate(f.start.value);
      if (startValue) f.end.min = H.toISODate(UI.addDays(startValue, 1));
      renderSummaries(read());
      updateContext();
    };

    f.start.addEventListener('change', () => {
      const s = H.parseDate(f.start.value);
      const e = H.parseDate(f.end.value);
      if (s && (!e || e <= s)) f.end.value = H.toISODate(UI.addDays(s, 1));
    });
    form.addEventListener('change', refresh);
    form.addEventListener('input', (event) => {
      if (event.target.matches('input[type="text"], input[type="email"], input[type="tel"]')) return;
      refresh();
    });
    UI.clearOnInput(form);

    /* Validation par étape */
    const validators = {
      1: () => {
        let ok = true;
        const s = H.parseDate(f.start.value);
        const e = H.parseDate(f.end.value);
        ok = UI.setError(f.start, !s ? 'Choisissez une date de prise en charge.' : (s < today ? 'La date ne peut pas être passée.' : '')) && ok;
        ok = UI.setError(f.end, !e ? 'Choisissez une date de retour.' : (s && e <= s ? 'La date de retour doit être après la prise en charge.' : '')) && ok;
        ok = UI.setError(f.address, f.address.value.trim().length >= 3 ? '' : 'Indiquez l’adresse de livraison.') && ok;
        return ok;
      },
      2: () => true,
      3: () => {
        let ok = true;
        const car = H.getCar(f.car.value);
        ok = UI.setError(f.first, f.first.value.trim() ? '' : 'Ce champ est obligatoire.') && ok;
        ok = UI.setError(f.last, f.last.value.trim() ? '' : 'Ce champ est obligatoire.') && ok;
        ok = UI.setError(f.email, !f.email.value.trim() ? 'Ce champ est obligatoire.' : (UI.EMAIL_RE.test(f.email.value.trim()) ? '' : 'Adresse e-mail invalide.')) && ok;
        ok = UI.setError(f.phone, !f.phone.value.trim() ? 'Ce champ est obligatoire.' : (UI.isValidPhone(f.phone.value.trim()) ? '' : 'Numéro de téléphone invalide.')) && ok;
        ok = UI.setError(f.nationality, f.nationality.value.trim() ? '' : 'Ce champ est obligatoire.') && ok;
        const birth = H.parseDate(f.birth.value);
        const start = H.parseDate(f.start.value) || today;
        let birthError = '';
        if (!birth) birthError = 'Indiquez votre date de naissance.';
        else if (ageOn(birth, start) < car.minAge) birthError = UI.fr(`Âge minimum requis pour la ${car.name} : ${car.minAge} ans.`);
        ok = UI.setError(f.birth, birthError) && ok;
        return ok;
      },
      4: () => UI.setError(f.terms, f.terms.checked ? '' : 'Merci d’accepter les conditions générales.')
    };

    let current = 1;

    const reviewHTML = () => {
      const b = read();
      const car = H.getCar(b.car);
      const extras = b.extras.map((id) => H.getExtra(id).short).join(', ') || 'Aucune';
      const block = (title, step, rows) => `<div class="review__block">
          <div class="review__head"><h3>${title}</h3><button type="button" class="link-btn" data-goto="${step}">Modifier</button></div>
          <dl>${rows.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
        </div>`;
      return block('Voiture et dates', 1, [
        ['Voiture', car.name],
        ['Prise en charge', `${H.formatDate(b.start)} à ${b.startTime}`],
        ['Retour', `${H.formatDate(b.end)} à ${b.endTime}`],
        ['Livraison', `${H.getLocation(b.delivery).label} — ${b.address}`],
        ['Retour du véhicule', H.getLocation(b.returnLocation).label]
      ]) + block('Options', 2, [['Options choisies', extras]]) + block('Vos informations', 3, [
        ['Nom', `${b.firstName} ${b.lastName}`],
        ['E-mail', b.email],
        ['Téléphone', b.phone],
        ['Nationalité', b.nationality],
        ['Date de naissance', H.formatDate(b.birth)],
        ['Situation', b.status === 'resident' ? 'Résident aux Émirats' : 'Touriste'],
        ...(b.flight ? [['Numéro de vol', b.flight]] : [])
      ]);
    };

    const goTo = (step, focus = true) => {
      current = step;
      steps.forEach((section) => { section.hidden = Number(section.dataset.step) !== step; });
      progress.forEach((item) => {
        const n = Number(item.dataset.progress);
        item.classList.toggle('is-current', n === step);
        item.classList.toggle('is-done', n < step);
        const dot = $('.progress__dot', item);
        dot.innerHTML = n < step ? UI.svg('check', 14) : String(n);
        if (n === step) item.setAttribute('aria-current', 'step');
        else item.removeAttribute('aria-current');
      });
      back.hidden = step === 1;
      next.hidden = step === 4;
      submit.hidden = step !== 4;
      if (step === 4) $('#b-review').innerHTML = reviewHTML();
      if (focus) {
        $('#progress').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        const heading = $(`.booking-step[data-step="${step}"] .h3`);
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    };

    next.addEventListener('click', () => {
      if (!validators[current]()) {
        UI.focusFirstError(form);
        return;
      }
      goTo(current + 1);
    });
    back.addEventListener('click', () => goTo(current - 1));
    form.addEventListener('click', (event) => {
      const target = event.target.closest('[data-goto]');
      if (target) goTo(Number(target.dataset.goto));
    });
    /* Entrée dans un champ = « Continuer » plutôt qu'un envoi */
    form.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && event.target.tagName === 'INPUT' && event.target.type !== 'checkbox' && current < 4) {
        event.preventDefault();
        next.click();
      }
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (current !== 4) return;
      for (let step = 1; step <= 4; step += 1) {
        if (!validators[step]()) {
          goTo(step);
          UI.focusFirstError(form);
          return;
        }
      }
      const booking = read();
      booking.ref = randomRef();
      booking.createdAt = new Date().toISOString();
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(booking));
      } catch (e) { /* stockage indisponible */ }
      submit.classList.add('is-loading');
      submit.textContent = 'Envoi en cours…';
      window.location.href = 'confirmation.html';
    });

    goTo(1, false);
    refresh();
  }

  /* ======================================================================
     PAGE CONFIRMATION
     ====================================================================== */
  function initConfirmation() {
    let booking = null;
    try {
      booking = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
    } catch (e) {
      booking = null;
    }
    const car = booking && H.getCar(booking.car);

    if (!booking || !car) {
      $('#confirm-hero').hidden = true;
      $('#confirm-empty').hidden = false;
      $('#confirm-details').hidden = true;
      return;
    }

    const q = bookingQuote(booking);
    $('#confirm-title').textContent = UI.fr(`Merci ${booking.firstName} !`);
    $('#confirm-text').textContent = `Votre référence est ${booking.ref}. Notre équipe confirme la disponibilité sous 15${NBSP}minutes.`;

    const extras = booking.extras.map((id) => H.getExtra(id).short).join(', ') || 'aucune';
    const message = [
      `Bonjour HUNSY, je confirme ma réservation ${booking.ref} :`,
      `• Voiture : ${car.name}`,
      `• Du ${H.formatDate(booking.start)} à ${booking.startTime} au ${H.formatDate(booking.end)} à ${booking.endTime} (${q.days} ${UI.plural(q.days, 'jour', 'jours')})`,
      `• Livraison : ${H.getLocation(booking.delivery).label}, ${booking.address}`,
      `• Retour : ${H.getLocation(booking.returnLocation).label}`,
      `• Options : ${extras}`,
      `• Total : ${H.formatAED(q.total)} TTC (caution ${H.formatAED(q.deposit)})`,
      booking.flight ? `• Vol : ${booking.flight}` : '',
      `Nom : ${booking.firstName} ${booking.lastName} — ${booking.phone}`
    ].filter(Boolean).join('\n');
    $('#confirm-wa').href = UI.waLink(message);

    $('#confirm-docs').innerHTML = documentsFor(booking.status).map((d) => `<li>${UI.svg('check', 18)}<span>${esc(d)}</span></li>`).join('');
    renderSummaries(booking);
    document.title = `Réservation ${booking.ref} reçue — HUNSY`;

    $('#print-btn').addEventListener('click', () => window.print());
  }

  if (page === 'booking') initBooking();
  if (page === 'confirmation') initConfirmation();
})();
