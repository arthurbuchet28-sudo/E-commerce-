/* ==========================================================================
   HUNSY — Données de la flotte et règles de prix
   Source unique : toutes les pages lisent les voitures et les prix ici.
   ========================================================================== */
(function (global) {
  'use strict';

  const images = (slug) => [
    `assets/cars/${slug}.jpg`,
    `assets/cars/${slug}-2.jpg`,
    `assets/cars/${slug}-3.jpg`
  ];

  /* ---------- Flotte ---------- */
  const CARS = [
    {
      slug: 'rolls-royce-cullinan',
      brand: 'Rolls-Royce',
      model: 'Cullinan',
      name: 'Rolls-Royce Cullinan',
      year: 2025,
      category: 'SUV',
      pricePerDay: 4500,
      deposit: 10000,
      seats: 5,
      seatsLabel: '5',
      doors: 5,
      transmission: 'Automatique',
      fuel: 'Essence',
      horsepower: 563,
      acceleration: 5.2,
      topSpeed: 250,
      color: 'Noir diamant',
      kmPerDay: 250,
      minAge: 25,
      featured: true,
      description: 'Le SUV le plus luxueux au monde. Silence absolu, suspension « tapis volant » et une présence incomparable : le Cullinan transforme chaque trajet à Dubaï en événement.',
      features: ['Ciel étoilé Starlight', 'Sièges massants et ventilés', 'Système audio Bespoke 18 haut-parleurs', 'Portes antagonistes à fermeture électrique', 'Suspension pneumatique adaptative', 'Réfrigérateur intégré', 'Caméras 360°', 'Apple CarPlay et Android Auto'],
      images: images('rolls-royce-cullinan')
    },
    {
      slug: 'lamborghini-urus-s',
      brand: 'Lamborghini',
      model: 'Urus S',
      name: 'Lamborghini Urus S',
      year: 2025,
      category: 'SUV',
      pricePerDay: 3200,
      deposit: 8000,
      seats: 5,
      seatsLabel: '5',
      doors: 5,
      transmission: 'Automatique',
      fuel: 'Essence',
      horsepower: 657,
      acceleration: 3.5,
      topSpeed: 305,
      color: 'Jaune Inti',
      kmPerDay: 250,
      minAge: 25,
      featured: true,
      description: 'Le super-SUV de Lamborghini allie l’âme d’une sportive italienne au confort d’un SUV cinq places. Son V8 biturbo de 657 ch en fait l’une des voitures les plus spectaculaires de Dubaï.',
      features: ['V8 biturbo 4.0 L', 'Mode de conduite ANIMA', 'Échappement sport', 'Sièges sport chauffants', 'Système audio Bang & Olufsen', 'Toit panoramique', 'Affichage tête haute', 'Apple CarPlay'],
      images: images('lamborghini-urus-s')
    },
    {
      slug: 'ferrari-roma',
      brand: 'Ferrari',
      model: 'Roma',
      name: 'Ferrari Roma',
      year: 2025,
      category: 'Sportive',
      pricePerDay: 3500,
      deposit: 8000,
      seats: 4,
      seatsLabel: '2+2',
      doors: 2,
      transmission: 'Automatique',
      fuel: 'Essence',
      horsepower: 612,
      acceleration: 3.4,
      topSpeed: 320,
      color: 'Rouge Corsa',
      kmPerDay: 250,
      minAge: 25,
      featured: true,
      description: 'La « nouvelle dolce vita » selon Ferrari. Lignes élégantes, V8 de 612 ch et comportement d’une précision chirurgicale : la grand tourisme idéale pour longer Jumeirah au coucher du soleil.',
      features: ['V8 biturbo 3.9 L', 'Boîte F1 à double embrayage 8 rapports', 'Manettino 5 positions', 'Écran passager', 'Sièges électriques en cuir', 'Cockpit numérique 16 pouces', 'Freins carbone-céramique', 'Apple CarPlay'],
      images: images('ferrari-roma')
    },
    {
      slug: 'mercedes-amg-g63',
      brand: 'Mercedes-AMG',
      model: 'G 63',
      name: 'Mercedes-AMG G 63',
      year: 2025,
      category: 'SUV',
      pricePerDay: 2200,
      deposit: 5000,
      seats: 5,
      seatsLabel: '5',
      doors: 5,
      transmission: 'Automatique',
      fuel: 'Essence',
      horsepower: 577,
      acceleration: 4.5,
      topSpeed: 220,
      color: 'Noir obsidienne',
      kmPerDay: 250,
      minAge: 23,
      featured: true,
      description: 'Icône absolue des rues de Dubaï. Le G 63 associe une allure de légende, un V8 de 577 ch et un intérieur AMG d’un raffinement rare.',
      features: ['V8 biturbo 4.0 L AMG', 'Échappement AMG Performance', 'Système audio Burmester', 'Sièges massants', 'Toit ouvrant électrique', 'Écrans MBUX 12,3 pouces', 'Éclairage d’ambiance 64 couleurs', 'Caméra 360°'],
      images: images('mercedes-amg-g63')
    },
    {
      slug: 'porsche-911-carrera-s',
      brand: 'Porsche',
      model: '911 Carrera S',
      name: 'Porsche 911 Carrera S',
      year: 2025,
      category: 'Sportive',
      pricePerDay: 1900,
      deposit: 5000,
      seats: 4,
      seatsLabel: '2+2',
      doors: 2,
      transmission: 'Automatique',
      fuel: 'Essence',
      horsepower: 473,
      acceleration: 3.5,
      topSpeed: 308,
      color: 'Gris craie',
      kmPerDay: 250,
      minAge: 23,
      featured: true,
      description: 'La référence des sportives depuis 60 ans. Agile, précise et utilisable au quotidien, la 911 Carrera S, c’est le plaisir de conduite à l’état pur.',
      features: ['Flat-6 biturbo 3.0 L', 'Boîte PDK 8 rapports', 'Pack Sport Chrono', 'Échappement sport', 'Système audio Bose', 'Sièges sport Plus', 'Phares LED Matrix', 'Apple CarPlay'],
      images: images('porsche-911-carrera-s')
    },
    {
      slug: 'mercedes-s500',
      brand: 'Mercedes-Benz',
      model: 'Classe S 500',
      name: 'Mercedes-Benz Classe S 500',
      year: 2025,
      category: 'Berline de luxe',
      pricePerDay: 1400,
      deposit: 3000,
      seats: 5,
      seatsLabel: '5',
      doors: 4,
      transmission: 'Automatique',
      fuel: 'Essence',
      horsepower: 429,
      acceleration: 4.9,
      topSpeed: 250,
      color: 'Blanc diamant',
      kmPerDay: 250,
      minAge: 21,
      featured: true,
      description: 'La limousine de référence pour vos rendez-vous d’affaires et vos soirées. Silence, espace à l’arrière et technologies de pointe pour voyager comme en première classe.',
      features: ['Six cylindres 3.0 L hybride léger', 'Sièges arrière inclinables et massants', 'Système audio Burmester 3D', 'Affichage tête haute à réalité augmentée', 'Suspension pneumatique Airmatic', 'Éclairage d’ambiance actif', 'Rideaux arrière électriques', 'Aides à la conduite semi-autonome'],
      images: images('mercedes-s500')
    },
    {
      slug: 'range-rover-sport',
      brand: 'Land Rover',
      model: 'Range Rover Sport',
      name: 'Range Rover Sport',
      year: 2025,
      category: 'SUV',
      pricePerDay: 1200,
      deposit: 3000,
      seats: 5,
      seatsLabel: '5',
      doors: 5,
      transmission: 'Automatique',
      fuel: 'Essence',
      horsepower: 395,
      acceleration: 5.9,
      topSpeed: 242,
      color: 'Gris Carpathian',
      kmPerDay: 250,
      minAge: 21,
      featured: false,
      description: 'Élégant, polyvalent et confortable, le Range Rover Sport est le compagnon idéal pour la ville comme pour les dunes autour de Dubaï.',
      features: ['Six cylindres 3.0 L hybride léger', 'Suspension pneumatique', 'Système audio Meridian', 'Toit panoramique', 'Sièges chauffants et ventilés', 'Écran Pivi Pro 13,1 pouces', 'Terrain Response 2', 'Caméra 360°'],
      images: images('range-rover-sport')
    },
    {
      slug: 'audi-rs-q8',
      brand: 'Audi',
      model: 'RS Q8',
      name: 'Audi RS Q8',
      year: 2025,
      category: 'SUV',
      pricePerDay: 1500,
      deposit: 3500,
      seats: 5,
      seatsLabel: '5',
      doors: 5,
      transmission: 'Automatique',
      fuel: 'Essence',
      horsepower: 591,
      acceleration: 3.8,
      topSpeed: 305,
      color: 'Bleu Navarre',
      kmPerDay: 250,
      minAge: 23,
      featured: false,
      description: 'Un SUV au tempérament de supercar : 591 ch, transmission quattro et un intérieur ultra technologique. Le choix parfait pour allier sensations et espace.',
      features: ['V8 biturbo 4.0 L', 'Transmission quattro', 'Roues arrière directrices', 'Sièges sport RS massants', 'Système audio Bang & Olufsen 3D', 'Virtual Cockpit', 'Toit panoramique', 'Affichage tête haute'],
      images: images('audi-rs-q8')
    },
    {
      slug: 'bmw-m4-cabriolet',
      brand: 'BMW',
      model: 'M4 Competition Cabriolet',
      name: 'BMW M4 Competition Cabriolet',
      year: 2025,
      category: 'Cabriolet',
      pricePerDay: 1100,
      deposit: 3000,
      seats: 4,
      seatsLabel: '4',
      doors: 2,
      transmission: 'Automatique',
      fuel: 'Essence',
      horsepower: 503,
      acceleration: 3.7,
      topSpeed: 280,
      color: 'Bleu Portimao',
      kmPerDay: 250,
      minAge: 21,
      featured: false,
      description: 'Le plaisir de rouler cheveux au vent sous le soleil de Dubaï, avec la puissance d’une M4 : 503 ch et transmission intégrale M xDrive.',
      features: ['Six cylindres biturbo 3.0 L', 'Transmission M xDrive', 'Capote souple électrique (18 s)', 'Sièges M Sport chauffants', 'Chauffe-nuque Air Collar', 'Système audio Harman Kardon', 'Écran incurvé BMW', 'Apple CarPlay'],
      images: images('bmw-m4-cabriolet')
    },
    {
      slug: 'nissan-patrol-nismo',
      brand: 'Nissan',
      model: 'Patrol NISMO',
      name: 'Nissan Patrol NISMO',
      year: 2025,
      category: 'SUV',
      pricePerDay: 800,
      deposit: 2000,
      seats: 7,
      seatsLabel: '7',
      doors: 5,
      transmission: 'Automatique',
      fuel: 'Essence',
      horsepower: 495,
      acceleration: 6.0,
      topSpeed: 210,
      color: 'Blanc perle',
      kmPerDay: 250,
      minAge: 21,
      featured: false,
      description: 'Le roi du désert dans sa version la plus sportive. Sept places, V6 biturbo de 495 ch et capacités tout-terrain légendaires : parfait pour les familles et les excursions dans les dunes.',
      features: ['V6 biturbo 3.5 L', '7 places en cuir', 'Transmission intégrale', 'Suspension hydraulique HBMC', 'Système audio Klipsch', 'Écrans arrière', 'Caméra 360°', 'Apple CarPlay'],
      images: images('nissan-patrol-nismo')
    }
  ];

  /* Catégories : valeur stockée dans les données + libellé au pluriel pour les filtres */
  const CATEGORIES = [
    { value: 'SUV', label: 'SUV' },
    { value: 'Sportive', label: 'Sportives' },
    { value: 'Berline de luxe', label: 'Berlines de luxe' },
    { value: 'Cabriolet', label: 'Cabriolets' }
  ];

  /* ---------- Règles de prix ---------- */
  const PRICING = {
    weeklyDays: 7,
    monthlyDays: 28,
    weeklyDiscount: 0.15,
    monthlyDiscount: 0.30,
    vat: 0.05,
    extras: [
      { id: 'assurance', label: 'Assurance tous risques (sans franchise)', short: 'Assurance sans franchise', pricePerDay: 150, description: 'Aucune franchise à payer en cas de dommage couvert, sur présentation d’un rapport de police.' },
      { id: 'conducteur', label: 'Conducteur supplémentaire', short: 'Conducteur supplémentaire', pricePerDay: 50, description: 'Partagez le volant avec une seconde personne, assurée au même titre que vous.' },
      { id: 'siege-enfant', label: 'Siège enfant', short: 'Siège enfant', pricePerDay: 30, description: 'Siège homologué adapté à l’âge de l’enfant, installé avant la livraison.' },
      { id: 'km', label: '100 km/jour supplémentaires', short: '+100 km/jour', pricePerDay: 120, description: 'Passez de 250 à 350 km inclus par jour, idéal pour un aller-retour à Abu Dhabi.' }
    ],
    locations: [
      { id: 'dubai', label: 'Dubaï', fee: 0 },
      { id: 'dxb', label: 'Aéroport de Dubaï (DXB)', fee: 0, airport: true },
      { id: 'dwc', label: 'Aéroport Al Maktoum (DWC)', fee: 0, airport: true },
      { id: 'sharjah', label: 'Sharjah', fee: 150 },
      { id: 'abu-dhabi', label: 'Abu Dhabi', fee: 300 }
    ]
  };

  const DAY = 24 * 60 * 60 * 1000;

  function getCar(slug) {
    return CARS.find((car) => car.slug === slug) || null;
  }

  function getLocation(id) {
    return PRICING.locations.find((loc) => loc.id === id) || PRICING.locations[0];
  }

  function getExtra(id) {
    return PRICING.extras.find((extra) => extra.id === id) || null;
  }

  function discountRate(days) {
    if (days >= PRICING.monthlyDays) return PRICING.monthlyDiscount;
    if (days >= PRICING.weeklyDays) return PRICING.weeklyDiscount;
    return 0;
  }

  /* Tarif journalier après remise de durée */
  function ratePerDay(car, days) {
    return Math.round(car.pricePerDay * (1 - discountRate(days)));
  }

  /* 'AAAA-MM-JJ' -> Date locale à minuit */
  function parseDate(value) {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function toISODate(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  /* Nombre de jours facturés entre deux dates (minimum 1) */
  function daysBetween(start, end) {
    const a = start instanceof Date ? start : parseDate(start);
    const b = end instanceof Date ? end : parseDate(end);
    if (!a || !b) return 0;
    return Math.max(1, Math.round((b - a) / DAY));
  }

  /* Devis complet. options : { car, days, extras: [ids], delivery: id, collection: id } */
  function quote(options) {
    const car = options.car;
    const days = Math.max(1, options.days || 1);
    const rate = ratePerDay(car, days);
    const base = car.pricePerDay * days;
    const rental = rate * days;
    const extras = (options.extras || [])
      .map(getExtra)
      .filter(Boolean)
      .map((extra) => ({ id: extra.id, label: extra.short, pricePerDay: extra.pricePerDay, total: extra.pricePerDay * days }));
    const extrasTotal = extras.reduce((sum, extra) => sum + extra.total, 0);
    const delivery = getLocation(options.delivery || 'dubai').fee;
    const collection = getLocation(options.collection || 'dubai').fee;
    const subtotal = rental + extrasTotal + delivery + collection;
    const vat = Math.round(subtotal * PRICING.vat);
    return {
      days,
      basePerDay: car.pricePerDay,
      rate,
      discountRate: discountRate(days),
      base,
      discount: base - rental,
      rental,
      extras,
      extrasTotal,
      delivery,
      collection,
      subtotal,
      vat,
      total: subtotal + vat,
      deposit: car.deposit
    };
  }

  /* ---------- Formatage (fr-FR) ---------- */
  const numberFormat = new Intl.NumberFormat('fr-FR');
  const NBSP = ' ';

  function formatNumber(value) {
    return numberFormat.format(value);
  }

  function formatAED(value) {
    return `${formatNumber(value)}${NBSP}AED`;
  }

  /* Prix pour l'affichage HTML : devise plus petite */
  function priceHTML(value) {
    return `${formatNumber(value)}${NBSP}<span class="cur">AED</span>`;
  }

  /* 'AAAA-MM-JJ' -> 'JJ/MM/AAAA' */
  function formatDate(value) {
    const date = value instanceof Date ? value : parseDate(value);
    if (!date) return '';
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  global.HUNSY = {
    CARS,
    CATEGORIES,
    PRICING,
    getCar,
    getLocation,
    getExtra,
    discountRate,
    ratePerDay,
    parseDate,
    toISODate,
    daysBetween,
    quote,
    formatNumber,
    formatAED,
    priceHTML,
    formatDate
  };
})(window);
