-- Demonstration data (local and preview only): one complete free course and one paid course
-- with two modules. Titles, durations and prices are editorial placeholders [À VALIDER].
-- Lesson texts: content/formations/<course slug>/<lesson slug>.mdx

-- ---------------------------------------------------------------------------
-- F0 — Les bases du e-commerce (free)
-- ---------------------------------------------------------------------------
insert into public.courses (id, slug, code, title, summary, objectives, audience, prerequisites, level, is_free, price_cents, access_months, faq, status, position)
values (
  '00000000-0000-4000-8000-000000000f00',
  'les-bases-du-e-commerce',
  'F0',
  'Les bases du e-commerce',
  'Un panorama honnête de la vente en ligne : les modèles, les étapes, un budget réaliste, les erreurs à éviter et un plan d’action pour vos 30 premiers jours.',
  array[
    'Décrire les principaux modèles de vente en ligne et leurs contraintes',
    'Situer votre projet dans les 8 étapes du lancement',
    'Estimer les postes de dépenses d’un premier test',
    'Repérer les erreurs classiques des débutants',
    'Construire votre plan d’action pour les 30 prochains jours'
  ],
  'Toute personne qui envisage de vendre en ligne et part de zéro.',
  array['Aucun prérequis technique', 'Un compte gratuit sur le site'],
  'debutant', true, null, 24,
  '[{"question":"La formation est-elle vraiment gratuite ?","answer":"Oui. Elle est accessible après la création d’un compte gratuit, sans limite de durée."},{"question":"Faut-il avoir déjà une idée de produit ?","answer":"Non. La formation vous aide justement à choisir un modèle et à préparer vos premiers tests."}]',
  'published', 0
);

insert into public.modules (id, course_id, position, title) values
  ('00000000-0000-4000-8000-000000000f01', '00000000-0000-4000-8000-000000000f00', 1, 'Comprendre la vente en ligne'),
  ('00000000-0000-4000-8000-000000000f02', '00000000-0000-4000-8000-000000000f00', 2, 'Préparer son lancement');

insert into public.lessons (id, course_id, module_id, position, slug, title, duration_min, has_video, mdx_path, is_preview) values
  ('00000000-0000-4000-8000-000000000a01', '00000000-0000-4000-8000-000000000f00', '00000000-0000-4000-8000-000000000f01', 1, 'panorama', 'Panorama du e-commerce en France', 12, true, 'les-bases-du-e-commerce/panorama.mdx', true),
  ('00000000-0000-4000-8000-000000000a02', '00000000-0000-4000-8000-000000000f00', '00000000-0000-4000-8000-000000000f01', 2, 'modeles', 'Les modèles de vente en ligne', 15, true, 'les-bases-du-e-commerce/modeles.mdx', false),
  ('00000000-0000-4000-8000-000000000a03', '00000000-0000-4000-8000-000000000f00', '00000000-0000-4000-8000-000000000f01', 3, 'etapes', 'Les 8 étapes du lancement', 15, true, 'les-bases-du-e-commerce/etapes.mdx', false),
  ('00000000-0000-4000-8000-000000000a04', '00000000-0000-4000-8000-000000000f00', '00000000-0000-4000-8000-000000000f02', 1, 'budget', 'Un budget réaliste pour tester', 15, true, 'les-bases-du-e-commerce/budget.mdx', false),
  ('00000000-0000-4000-8000-000000000a05', '00000000-0000-4000-8000-000000000f00', '00000000-0000-4000-8000-000000000f02', 2, 'erreurs', 'Les erreurs classiques des débutants', 15, true, 'les-bases-du-e-commerce/erreurs.mdx', false),
  ('00000000-0000-4000-8000-000000000a06', '00000000-0000-4000-8000-000000000f00', '00000000-0000-4000-8000-000000000f02', 3, 'plan-30-jours', 'Votre plan d’action pour 30 jours', 18, true, 'les-bases-du-e-commerce/plan-30-jours.mdx', false);

insert into public.lesson_resources (lesson_id, label, storage_path, position) values
  ('00000000-0000-4000-8000-000000000a06', 'Plan d’action 30 jours (PDF à imprimer)', 'plan-action-30-jours.pdf', 0);

insert into public.quiz_questions (module_id, position, prompt, choices, correct_index, explanation) values
  ('00000000-0000-4000-8000-000000000f01', 1, 'En dropshipping, qui est responsable de la bonne exécution de la commande vis-à-vis du client ?',
    array['Le fournisseur qui expédie', 'Le vendeur, c’est-à-dire vous', 'La plateforme de paiement'], 1,
    'Pour le client, c’est vous le vendeur : délais, conformité et retours relèvent de votre responsabilité, même si le fournisseur est en cause.'),
  ('00000000-0000-4000-8000-000000000f01', 2, 'Quel modèle permet de vendre sans stock ni expédition ?',
    array['Les produits numériques', 'L’artisanat', 'L’achat-revente de lots'], 0,
    'Un produit numérique est créé une fois et livré en ligne : il n’y a ni stock ni colis.'),
  ('00000000-0000-4000-8000-000000000f01', 3, 'Par quelle étape le parcours conseille-t-il de commencer, avant de créer sa boutique ?',
    array['Choisir sa plateforme', 'Lancer de la publicité', 'Valider qu’il existe des acheteurs'], 2,
    'Valider la demande avant d’investir évite de construire une boutique pour un produit qui ne se vend pas.'),
  ('00000000-0000-4000-8000-000000000f01', 4, 'Que signifie « marketplace » ?',
    array['Un site qui permet à des vendeurs tiers de vendre à ses visiteurs, contre une commission', 'Un logiciel de comptabilité', 'Un type de statut juridique'], 0,
    'Amazon, Etsy ou Cdiscount sont des marketplaces : elles apportent du trafic et prélèvent une commission.'),
  ('00000000-0000-4000-8000-000000000f02', 1, 'Pourquoi fixer à l’avance le budget maximal d’un test ?',
    array['Pour obtenir un crédit plus facilement', 'Pour savoir quand arrêter sans vous mettre en difficulté', 'Parce que c’est une obligation légale'], 1,
    'Un plafond décidé à froid évite de continuer à dépenser pour rattraper un test qui ne fonctionne pas.'),
  ('00000000-0000-4000-8000-000000000f02', 2, 'Pour fixer votre prix, par quoi faut-il partir ?',
    array['Du prix des concurrents uniquement', 'De vos coûts réels, puis vérifier le prix de marché', 'D’un coefficient fixe identique pour tous les produits'], 1,
    'Partir de vos coûts réels garantit que chaque vente vous rapporte quelque chose ; le marché dit ensuite si le prix est acceptable.'),
  ('00000000-0000-4000-8000-000000000f02', 3, 'Lequel de ces frais réduit votre marge à chaque vente ?',
    array['Les frais de paiement', 'Le nom de domaine', 'L’immatriculation'], 0,
    'Les frais de paiement sont prélevés sur chaque commande, comme les commissions et les frais de port réels.'),
  ('00000000-0000-4000-8000-000000000f02', 4, 'Combien de canaux d’acquisition le plan 30 jours conseille-t-il de tenir au début ?',
    array['Un ou deux, suivis sérieusement', 'Tous les réseaux sociaux à la fois', 'Aucun avant six mois'], 0,
    'Mieux vaut un ou deux canaux tenus dans la durée que plusieurs abandonnés au bout de quelques semaines.');

-- ---------------------------------------------------------------------------
-- F1 — Trouver et valider son produit (paid, demonstration: 2 modules)
-- ---------------------------------------------------------------------------
insert into public.courses (id, slug, code, title, summary, objectives, audience, prerequisites, level, is_free, price_cents, access_months, faq, status, position)
values (
  '00000000-0000-4000-8000-000000000f10',
  'trouver-et-valider-son-produit',
  'F1',
  'Trouver et valider son produit',
  'Une méthode pas à pas pour choisir un produit qui répond à une vraie demande, analyser la concurrence et tester votre idée avec un petit budget avant d’investir.',
  array[
    'Évaluer une idée de produit avec des critères objectifs',
    'Trouver des idées à partir de sources fiables',
    'Analyser des concurrents et les avis de leurs clients',
    'Concevoir un test à petit budget et interpréter son résultat'
  ],
  'Porteurs de projet qui hésitent sur le produit à vendre, ou veulent vérifier leur idée avant d’investir.',
  array['Avoir suivi « Les bases du e-commerce » ou connaître les modèles de vente en ligne'],
  'debutant', false, 4900, 24,
  '[{"question":"Combien de temps ai-je accès à la formation ?","answer":"Vous y avez accès pendant 24 mois à compter de l’achat."},{"question":"Puis-je voir un extrait avant d’acheter ?","answer":"Oui, la première leçon est accessible gratuitement."}]',
  'published', 1
);

insert into public.modules (id, course_id, position, title) values
  ('00000000-0000-4000-8000-000000000f11', '00000000-0000-4000-8000-000000000f10', 1, 'Trouver une idée de produit'),
  ('00000000-0000-4000-8000-000000000f12', '00000000-0000-4000-8000-000000000f10', 2, 'Valider avant d’investir');

insert into public.lessons (id, course_id, module_id, position, slug, title, duration_min, has_video, mdx_path, is_preview) values
  ('00000000-0000-4000-8000-000000000b01', '00000000-0000-4000-8000-000000000f10', '00000000-0000-4000-8000-000000000f11', 1, 'criteres-bon-produit', 'Les critères d’un bon produit à vendre en ligne', 15, true, 'trouver-et-valider-son-produit/criteres-bon-produit.mdx', true),
  ('00000000-0000-4000-8000-000000000b02', '00000000-0000-4000-8000-000000000f10', '00000000-0000-4000-8000-000000000f11', 2, 'sources-idees', 'Où trouver des idées de produits', 15, true, 'trouver-et-valider-son-produit/sources-idees.mdx', false),
  ('00000000-0000-4000-8000-000000000b03', '00000000-0000-4000-8000-000000000f10', '00000000-0000-4000-8000-000000000f12', 1, 'analyser-concurrence', 'Analyser la concurrence', 20, true, 'trouver-et-valider-son-produit/analyser-concurrence.mdx', false),
  ('00000000-0000-4000-8000-000000000b04', '00000000-0000-4000-8000-000000000f10', '00000000-0000-4000-8000-000000000f12', 2, 'tester-petit-budget', 'Tester son idée avec un petit budget', 20, true, 'trouver-et-valider-son-produit/tester-petit-budget.mdx', false);

insert into public.quiz_questions (module_id, position, prompt, choices, correct_index, explanation) values
  ('00000000-0000-4000-8000-000000000f11', 1, 'Lequel de ces critères rend un produit plus facile à vendre en ligne ?',
    array['Il est lourd et fragile', 'Il répond à un problème précis d’un public identifiable', 'Il plaît à tout le monde'], 1,
    'Un public précis avec un problème précis se trouve et se convainc plus facilement qu’un public « tout le monde ».'),
  ('00000000-0000-4000-8000-000000000f11', 2, 'Pourquoi les avis négatifs des concurrents sont-ils une bonne source d’idées ?',
    array['Ils révèlent des attentes non satisfaites', 'Ils permettent de copier les produits', 'Ils indiquent le chiffre d’affaires des concurrents'], 0,
    'Les critiques récurrentes montrent ce que les clients veulent et ne trouvent pas : autant d’améliorations possibles.'),
  ('00000000-0000-4000-8000-000000000f11', 3, 'Une marge unitaire faible est plus difficile à tenir quand…',
    array['la publicité est votre principal canal d’acquisition', 'vous vendez à votre entourage', 'le produit est léger'], 0,
    'Chaque client acquis par la publicité coûte de l’argent : avec une marge faible, ce coût absorbe vite tout le bénéfice.'),
  ('00000000-0000-4000-8000-000000000f12', 1, 'Dans une analyse de concurrence, que faut-il relever en priorité ?',
    array['Le nombre d’abonnés sur les réseaux sociaux', 'Les prix, l’offre et ce que les clients critiquent', 'La couleur du logo'], 1,
    'Prix, offre et critiques permettent de positionner votre produit et de trouver votre différence.'),
  ('00000000-0000-4000-8000-000000000f12', 2, 'Quel test mesure le mieux une intention d’achat réelle ?',
    array['Un sondage « Achèteriez-vous ce produit ? »', 'Des précommandes ou une liste d’attente avec engagement', 'Le nombre de « j’aime » sur une publication'], 1,
    'Payer ou s’engager est un signal bien plus fiable qu’une réponse déclarative ou un « j’aime ».'),
  ('00000000-0000-4000-8000-000000000f12', 3, 'Avant de lancer un test, que faut-il définir ?',
    array['Un seuil de réussite et un budget maximal', 'Le nom de la marque définitive', 'Le nombre de salariés'], 0,
    'Fixer à l’avance ce qui compte comme réussite évite d’interpréter le résultat à son avantage.');

-- ---------------------------------------------------------------------------
-- F2 to F7: catalogue in draft (programme defined, lesson texts, quizzes and resources
-- to write). They cannot be published before every lesson text exists (back-office check).
-- Prices: placeholders [À VALIDER] between 39 and 89 € TTC.
-- ---------------------------------------------------------------------------
insert into public.courses (id, slug, code, title, summary, objectives, audience, prerequisites, level, is_free, price_cents, access_months, faq, status, position)
values ('00000000-0000-4000-8000-000000020000', 'creer-son-entreprise-et-etre-en-regle', 'F2', 'Créer son entreprise et être en règle', 'Choisir son statut, créer sa micro-entreprise, comprendre la TVA et mettre son site en conformité : tout ce qu’il faut régler avant la première vente, sources officielles à l’appui.',
  array['Choisir un statut adapté à son projet', 'Déclarer son activité sur le guichet unique', 'Appliquer les règles de TVA à ses ventes', 'Mettre en place les pages légales obligatoires de son site', 'Organiser sa comptabilité et ses déclarations'],
  'Porteurs de projet prêts à se déclarer, et vendeurs déjà actifs qui veulent vérifier leur conformité.', array['Avoir un projet de vente en ligne défini'],
  'debutant', false, 4900, 24, '[{"question":"Combien de temps ai-je accès à la formation ?","answer":"Vous y avez accès pendant 24 mois à compter de l’ouverture de votre accès."},{"question":"Y a-t-il un quiz ?","answer":"Oui, chaque module se termine par un quiz. Il faut 80 % de bonnes réponses pour le valider."}]', 'draft', 2);
insert into public.modules (id, course_id, position, title) values
  ('00000000-0000-4000-8000-000000021001', '00000000-0000-4000-8000-000000020000', 1, 'Choisir et créer son statut'),
  ('00000000-0000-4000-8000-000000021002', '00000000-0000-4000-8000-000000020000', 2, 'TVA et facturation'),
  ('00000000-0000-4000-8000-000000021003', '00000000-0000-4000-8000-000000020000', 3, 'Un site en règle'),
  ('00000000-0000-4000-8000-000000021004', '00000000-0000-4000-8000-000000020000', 4, 'Gérer au quotidien');
insert into public.lessons (id, course_id, module_id, position, slug, title, duration_min, has_video, mdx_path, is_preview) values
  ('00000000-0000-4000-8000-000000022101', '00000000-0000-4000-8000-000000020000', '00000000-0000-4000-8000-000000021001', 1, 'statuts', 'Micro-entreprise, EI, EURL, SASU : comparer', 25, true, 'creer-son-entreprise-et-etre-en-regle/statuts.mdx', true),
  ('00000000-0000-4000-8000-000000022102', '00000000-0000-4000-8000-000000020000', '00000000-0000-4000-8000-000000021001', 2, 'creer-sa-micro-entreprise', 'Créer sa micro-entreprise pas à pas', 20, true, 'creer-son-entreprise-et-etre-en-regle/creer-sa-micro-entreprise.mdx', false),
  ('00000000-0000-4000-8000-000000022103', '00000000-0000-4000-8000-000000020000', '00000000-0000-4000-8000-000000021001', 3, 'declarations', 'Déclarer son chiffre d’affaires et ses cotisations', 20, true, 'creer-son-entreprise-et-etre-en-regle/declarations.mdx', false),
  ('00000000-0000-4000-8000-000000022201', '00000000-0000-4000-8000-000000020000', '00000000-0000-4000-8000-000000021002', 1, 'tva', 'Franchise, taux et ventes dans l’Union', 25, true, 'creer-son-entreprise-et-etre-en-regle/tva.mdx', false),
  ('00000000-0000-4000-8000-000000022202', '00000000-0000-4000-8000-000000020000', '00000000-0000-4000-8000-000000021002', 2, 'facturer', 'Émettre des factures conformes', 20, true, 'creer-son-entreprise-et-etre-en-regle/facturer.mdx', false),
  ('00000000-0000-4000-8000-000000022301', '00000000-0000-4000-8000-000000020000', '00000000-0000-4000-8000-000000021003', 1, 'mentions-cgv', 'Mentions légales et CGV', 25, true, 'creer-son-entreprise-et-etre-en-regle/mentions-cgv.mdx', false),
  ('00000000-0000-4000-8000-000000022302', '00000000-0000-4000-8000-000000020000', '00000000-0000-4000-8000-000000021003', 2, 'rgpd-cookies', 'RGPD et cookies', 20, true, 'creer-son-entreprise-et-etre-en-regle/rgpd-cookies.mdx', false),
  ('00000000-0000-4000-8000-000000022303', '00000000-0000-4000-8000-000000020000', '00000000-0000-4000-8000-000000021003', 3, 'retractation', 'Droit de rétractation et fonction en ligne', 20, true, 'creer-son-entreprise-et-etre-en-regle/retractation.mdx', false),
  ('00000000-0000-4000-8000-000000022401', '00000000-0000-4000-8000-000000020000', '00000000-0000-4000-8000-000000021004', 1, 'assurances', 'Les assurances à vérifier', 10, true, 'creer-son-entreprise-et-etre-en-regle/assurances.mdx', false),
  ('00000000-0000-4000-8000-000000022402', '00000000-0000-4000-8000-000000020000', '00000000-0000-4000-8000-000000021004', 2, 'comptabilite', 'Tenir une comptabilité simple', 15, true, 'creer-son-entreprise-et-etre-en-regle/comptabilite.mdx', false);
insert into public.courses (id, slug, code, title, summary, objectives, audience, prerequisites, level, is_free, price_cents, access_months, faq, status, position)
values ('00000000-0000-4000-8000-000000030000', 'creer-sa-boutique-pas-a-pas', 'F3', 'Créer sa boutique pas à pas', 'De la page blanche à la boutique prête à vendre, avec deux parcours au choix : Shopify ou WooCommerce. Nom de domaine, thème, produits, paiement, livraison, pages légales et commande test.',
  array['Choisir sa plateforme en fonction de son projet', 'Configurer une boutique complète sur Shopify ou WooCommerce', 'Mettre en ligne des produits avec des fiches complètes', 'Paramétrer le paiement et la livraison', 'Vérifier sa boutique avant l’ouverture'],
  'Débutants qui veulent créer eux-mêmes leur boutique, sans développeur.', array['Avoir choisi son produit', 'Avoir déclaré son activité ou être sur le point de le faire'],
  'debutant', false, 7900, 24, '[{"question":"Combien de temps ai-je accès à la formation ?","answer":"Vous y avez accès pendant 24 mois à compter de l’ouverture de votre accès."},{"question":"Y a-t-il un quiz ?","answer":"Oui, chaque module se termine par un quiz. Il faut 80 % de bonnes réponses pour le valider."}]', 'draft', 3);
insert into public.modules (id, course_id, position, title) values
  ('00000000-0000-4000-8000-000000031001', '00000000-0000-4000-8000-000000030000', 1, 'Préparer sa boutique'),
  ('00000000-0000-4000-8000-000000031002', '00000000-0000-4000-8000-000000030000', 2, 'Parcours Shopify'),
  ('00000000-0000-4000-8000-000000031003', '00000000-0000-4000-8000-000000030000', 3, 'Parcours WooCommerce'),
  ('00000000-0000-4000-8000-000000031004', '00000000-0000-4000-8000-000000030000', 4, 'Avant d’ouvrir');
insert into public.lessons (id, course_id, module_id, position, slug, title, duration_min, has_video, mdx_path, is_preview) values
  ('00000000-0000-4000-8000-000000032101', '00000000-0000-4000-8000-000000030000', '00000000-0000-4000-8000-000000031001', 1, 'choisir-plateforme', 'Choisir sa plateforme', 20, true, 'creer-sa-boutique-pas-a-pas/choisir-plateforme.mdx', true),
  ('00000000-0000-4000-8000-000000032102', '00000000-0000-4000-8000-000000030000', '00000000-0000-4000-8000-000000031001', 2, 'nom-de-domaine', 'Choisir et réserver son nom de domaine', 15, true, 'creer-sa-boutique-pas-a-pas/nom-de-domaine.mdx', false),
  ('00000000-0000-4000-8000-000000032103', '00000000-0000-4000-8000-000000030000', '00000000-0000-4000-8000-000000031001', 3, 'structure', 'Organiser son catalogue et ses pages', 20, true, 'creer-sa-boutique-pas-a-pas/structure.mdx', false),
  ('00000000-0000-4000-8000-000000032201', '00000000-0000-4000-8000-000000030000', '00000000-0000-4000-8000-000000031002', 1, 'shopify-demarrer', 'Ouvrir sa boutique Shopify', 25, true, 'creer-sa-boutique-pas-a-pas/shopify-demarrer.mdx', false),
  ('00000000-0000-4000-8000-000000032202', '00000000-0000-4000-8000-000000030000', '00000000-0000-4000-8000-000000031002', 2, 'shopify-theme', 'Choisir et adapter son thème', 25, true, 'creer-sa-boutique-pas-a-pas/shopify-theme.mdx', false),
  ('00000000-0000-4000-8000-000000032203', '00000000-0000-4000-8000-000000030000', '00000000-0000-4000-8000-000000031002', 3, 'shopify-produits', 'Ajouter ses produits', 25, true, 'creer-sa-boutique-pas-a-pas/shopify-produits.mdx', false),
  ('00000000-0000-4000-8000-000000032204', '00000000-0000-4000-8000-000000030000', '00000000-0000-4000-8000-000000031002', 4, 'shopify-paiement-livraison', 'Paiement et livraison sur Shopify', 25, true, 'creer-sa-boutique-pas-a-pas/shopify-paiement-livraison.mdx', false),
  ('00000000-0000-4000-8000-000000032301', '00000000-0000-4000-8000-000000030000', '00000000-0000-4000-8000-000000031003', 1, 'woo-hebergement', 'Hébergement et installation de WordPress', 25, true, 'creer-sa-boutique-pas-a-pas/woo-hebergement.mdx', false),
  ('00000000-0000-4000-8000-000000032302', '00000000-0000-4000-8000-000000030000', '00000000-0000-4000-8000-000000031003', 2, 'woo-installer', 'Installer et configurer WooCommerce', 25, true, 'creer-sa-boutique-pas-a-pas/woo-installer.mdx', false),
  ('00000000-0000-4000-8000-000000032303', '00000000-0000-4000-8000-000000030000', '00000000-0000-4000-8000-000000031003', 3, 'woo-produits', 'Ajouter ses produits', 25, true, 'creer-sa-boutique-pas-a-pas/woo-produits.mdx', false),
  ('00000000-0000-4000-8000-000000032304', '00000000-0000-4000-8000-000000030000', '00000000-0000-4000-8000-000000031003', 4, 'woo-paiement-livraison', 'Paiement et livraison sur WooCommerce', 25, true, 'creer-sa-boutique-pas-a-pas/woo-paiement-livraison.mdx', false),
  ('00000000-0000-4000-8000-000000032401', '00000000-0000-4000-8000-000000030000', '00000000-0000-4000-8000-000000031004', 1, 'pages-legales', 'Installer ses pages légales', 20, true, 'creer-sa-boutique-pas-a-pas/pages-legales.mdx', false),
  ('00000000-0000-4000-8000-000000032402', '00000000-0000-4000-8000-000000030000', '00000000-0000-4000-8000-000000031004', 2, 'commande-test', 'Passer une commande test de bout en bout', 20, true, 'creer-sa-boutique-pas-a-pas/commande-test.mdx', false),
  ('00000000-0000-4000-8000-000000032403', '00000000-0000-4000-8000-000000030000', '00000000-0000-4000-8000-000000031004', 3, 'lancement', 'Le jour de l’ouverture', 15, true, 'creer-sa-boutique-pas-a-pas/lancement.mdx', false);
insert into public.courses (id, slug, code, title, summary, objectives, audience, prerequisites, level, is_free, price_cents, access_months, faq, status, position)
values ('00000000-0000-4000-8000-000000040000', 'paiement-logistique-et-service-client', 'F4', 'Paiement, logistique et service client', 'Choisir ses moyens de paiement et calculer leurs frais réels, organiser les expéditions, gérer les retours et le service client sans y passer ses soirées.',
  array['Comparer les moyens de paiement et leurs frais réels', 'Choisir ses transporteurs et fixer ses frais de port', 'Mettre en place une procédure de retour conforme', 'Organiser un service client efficace'],
  'Vendeurs qui préparent leur ouverture ou qui débordent déjà sous les colis et les e-mails.', array['Avoir une boutique en préparation ou en ligne'],
  'debutant', false, 3900, 24, '[{"question":"Combien de temps ai-je accès à la formation ?","answer":"Vous y avez accès pendant 24 mois à compter de l’ouverture de votre accès."},{"question":"Y a-t-il un quiz ?","answer":"Oui, chaque module se termine par un quiz. Il faut 80 % de bonnes réponses pour le valider."}]', 'draft', 4);
insert into public.modules (id, course_id, position, title) values
  ('00000000-0000-4000-8000-000000041001', '00000000-0000-4000-8000-000000040000', 1, 'Encaisser'),
  ('00000000-0000-4000-8000-000000041002', '00000000-0000-4000-8000-000000040000', 2, 'Expédier'),
  ('00000000-0000-4000-8000-000000041003', '00000000-0000-4000-8000-000000040000', 3, 'Accompagner');
insert into public.lessons (id, course_id, module_id, position, slug, title, duration_min, has_video, mdx_path, is_preview) values
  ('00000000-0000-4000-8000-000000042101', '00000000-0000-4000-8000-000000040000', '00000000-0000-4000-8000-000000041001', 1, 'moyens-de-paiement', 'Choisir ses moyens de paiement', 20, true, 'paiement-logistique-et-service-client/moyens-de-paiement.mdx', true),
  ('00000000-0000-4000-8000-000000042102', '00000000-0000-4000-8000-000000040000', '00000000-0000-4000-8000-000000041001', 2, 'frais-et-fraude', 'Frais réels et prévention de la fraude', 20, true, 'paiement-logistique-et-service-client/frais-et-fraude.mdx', false),
  ('00000000-0000-4000-8000-000000042201', '00000000-0000-4000-8000-000000040000', '00000000-0000-4000-8000-000000041002', 1, 'transporteurs', 'Comparer les transporteurs', 20, true, 'paiement-logistique-et-service-client/transporteurs.mdx', false),
  ('00000000-0000-4000-8000-000000042202', '00000000-0000-4000-8000-000000040000', '00000000-0000-4000-8000-000000041002', 2, 'emballage', 'Emballer juste', 15, true, 'paiement-logistique-et-service-client/emballage.mdx', false),
  ('00000000-0000-4000-8000-000000042203', '00000000-0000-4000-8000-000000040000', '00000000-0000-4000-8000-000000041002', 3, 'delais', 'Annoncer et tenir ses délais', 15, true, 'paiement-logistique-et-service-client/delais.mdx', false),
  ('00000000-0000-4000-8000-000000042301', '00000000-0000-4000-8000-000000040000', '00000000-0000-4000-8000-000000041003', 1, 'retours', 'Gérer les retours', 20, true, 'paiement-logistique-et-service-client/retours.mdx', false),
  ('00000000-0000-4000-8000-000000042302', '00000000-0000-4000-8000-000000040000', '00000000-0000-4000-8000-000000041003', 2, 'reponses-types', 'Les réponses types qui font gagner du temps', 20, true, 'paiement-logistique-et-service-client/reponses-types.mdx', false),
  ('00000000-0000-4000-8000-000000042303', '00000000-0000-4000-8000-000000040000', '00000000-0000-4000-8000-000000041003', 3, 'litiges', 'Réclamations et médiation', 20, true, 'paiement-logistique-et-service-client/litiges.mdx', false);
insert into public.courses (id, slug, code, title, summary, objectives, audience, prerequisites, level, is_free, price_cents, access_months, faq, status, position)
values ('00000000-0000-4000-8000-000000050000', 'attirer-ses-premiers-clients', 'F5', 'Attirer ses premiers clients', 'Référencement naturel, assistants IA, réseaux sociaux et social commerce, e-mailing, publicité à petit budget et avis clients : construire un plan d’acquisition réaliste et mesurable.',
  array['Optimiser ses pages pour les moteurs de recherche', 'Rendre son offre compréhensible par les assistants IA', 'Publier des contenus réguliers sur un réseau social', 'Construire une liste e-mail dans les règles', 'Lancer et mesurer une première campagne publicitaire', 'Collecter des avis authentiques'],
  'Vendeurs dont la boutique est en ligne et qui cherchent leurs premiers clients.', array['Avoir une boutique en ligne ou sur une marketplace'],
  'intermediaire', false, 8900, 24, '[{"question":"Combien de temps ai-je accès à la formation ?","answer":"Vous y avez accès pendant 24 mois à compter de l’ouverture de votre accès."},{"question":"Y a-t-il un quiz ?","answer":"Oui, chaque module se termine par un quiz. Il faut 80 % de bonnes réponses pour le valider."}]', 'draft', 5);
insert into public.modules (id, course_id, position, title) values
  ('00000000-0000-4000-8000-000000051001', '00000000-0000-4000-8000-000000050000', 1, 'Être trouvé sur Google'),
  ('00000000-0000-4000-8000-000000051002', '00000000-0000-4000-8000-000000050000', 2, 'Être recommandé par les assistants IA'),
  ('00000000-0000-4000-8000-000000051003', '00000000-0000-4000-8000-000000050000', 3, 'Réseaux sociaux et social commerce'),
  ('00000000-0000-4000-8000-000000051004', '00000000-0000-4000-8000-000000050000', 4, 'E-mailing'),
  ('00000000-0000-4000-8000-000000051005', '00000000-0000-4000-8000-000000050000', 5, 'Publicité à petit budget'),
  ('00000000-0000-4000-8000-000000051006', '00000000-0000-4000-8000-000000050000', 6, 'Avis clients');
insert into public.lessons (id, course_id, module_id, position, slug, title, duration_min, has_video, mdx_path, is_preview) values
  ('00000000-0000-4000-8000-000000052101', '00000000-0000-4000-8000-000000050000', '00000000-0000-4000-8000-000000051001', 1, 'seo-bases', 'Les bases du référencement', 25, true, 'attirer-ses-premiers-clients/seo-bases.mdx', true),
  ('00000000-0000-4000-8000-000000052102', '00000000-0000-4000-8000-000000050000', '00000000-0000-4000-8000-000000051001', 2, 'seo-fiches-categories', 'Optimiser fiches et catégories', 25, true, 'attirer-ses-premiers-clients/seo-fiches-categories.mdx', false),
  ('00000000-0000-4000-8000-000000052103', '00000000-0000-4000-8000-000000050000', '00000000-0000-4000-8000-000000051001', 3, 'seo-contenus', 'Des contenus utiles', 20, true, 'attirer-ses-premiers-clients/seo-contenus.mdx', false),
  ('00000000-0000-4000-8000-000000052201', '00000000-0000-4000-8000-000000050000', '00000000-0000-4000-8000-000000051002', 1, 'geo-comprendre', 'Comment les assistants choisissent leurs sources', 20, true, 'attirer-ses-premiers-clients/geo-comprendre.mdx', false),
  ('00000000-0000-4000-8000-000000052202', '00000000-0000-4000-8000-000000050000', '00000000-0000-4000-8000-000000051002', 2, 'geo-structurer', 'Structurer ses pages', 20, true, 'attirer-ses-premiers-clients/geo-structurer.mdx', false),
  ('00000000-0000-4000-8000-000000052301', '00000000-0000-4000-8000-000000050000', '00000000-0000-4000-8000-000000051003', 1, 'reseaux-strategie', 'Choisir son réseau et son rythme', 25, true, 'attirer-ses-premiers-clients/reseaux-strategie.mdx', false),
  ('00000000-0000-4000-8000-000000052302', '00000000-0000-4000-8000-000000050000', '00000000-0000-4000-8000-000000051003', 2, 'reseaux-videos', 'Des vidéos courtes qui montrent le produit', 25, true, 'attirer-ses-premiers-clients/reseaux-videos.mdx', false),
  ('00000000-0000-4000-8000-000000052303', '00000000-0000-4000-8000-000000050000', '00000000-0000-4000-8000-000000051003', 3, 'influence', 'Travailler avec des créateurs, dans les règles', 20, true, 'attirer-ses-premiers-clients/influence.mdx', false),
  ('00000000-0000-4000-8000-000000052401', '00000000-0000-4000-8000-000000050000', '00000000-0000-4000-8000-000000051004', 1, 'emailing-liste', 'Construire sa liste', 20, true, 'attirer-ses-premiers-clients/emailing-liste.mdx', false),
  ('00000000-0000-4000-8000-000000052402', '00000000-0000-4000-8000-000000050000', '00000000-0000-4000-8000-000000051004', 2, 'emailing-sequences', 'Écrire ses premiers e-mails', 20, true, 'attirer-ses-premiers-clients/emailing-sequences.mdx', false),
  ('00000000-0000-4000-8000-000000052501', '00000000-0000-4000-8000-000000050000', '00000000-0000-4000-8000-000000051005', 1, 'pub-premiere-campagne', 'Lancer une première campagne', 25, true, 'attirer-ses-premiers-clients/pub-premiere-campagne.mdx', false),
  ('00000000-0000-4000-8000-000000052502', '00000000-0000-4000-8000-000000050000', '00000000-0000-4000-8000-000000051005', 2, 'pub-mesurer', 'Mesurer et décider', 20, true, 'attirer-ses-premiers-clients/pub-mesurer.mdx', false),
  ('00000000-0000-4000-8000-000000052601', '00000000-0000-4000-8000-000000050000', '00000000-0000-4000-8000-000000051006', 1, 'avis-collecter', 'Collecter des avis authentiques', 20, true, 'attirer-ses-premiers-clients/avis-collecter.mdx', false),
  ('00000000-0000-4000-8000-000000052602', '00000000-0000-4000-8000-000000050000', '00000000-0000-4000-8000-000000051006', 2, 'avis-repondre', 'Répondre aux avis', 15, true, 'attirer-ses-premiers-clients/avis-repondre.mdx', false);
insert into public.courses (id, slug, code, title, summary, objectives, audience, prerequisites, level, is_free, price_cents, access_months, faq, status, position)
values ('00000000-0000-4000-8000-000000060000', 'vendre-sur-les-marketplaces', 'F6', 'Vendre sur les marketplaces', 'Choisir la bonne marketplace, calculer ses coûts réels, créer des fiches qui ressortent et rester indépendant de la plateforme.',
  array['Choisir une marketplace adaptée à ses produits', 'Calculer sa marge après commissions et frais', 'Créer un compte vendeur et des fiches conformes', 'Réduire sa dépendance à une seule plateforme'],
  'Vendeurs qui veulent ajouter un canal de vente ou tester un produit sans créer de boutique.', array['Avoir déclaré son activité'],
  'debutant', false, 3900, 24, '[{"question":"Combien de temps ai-je accès à la formation ?","answer":"Vous y avez accès pendant 24 mois à compter de l’ouverture de votre accès."},{"question":"Y a-t-il un quiz ?","answer":"Oui, chaque module se termine par un quiz. Il faut 80 % de bonnes réponses pour le valider."}]', 'draft', 6);
insert into public.modules (id, course_id, position, title) values
  ('00000000-0000-4000-8000-000000061001', '00000000-0000-4000-8000-000000060000', 1, 'Choisir'),
  ('00000000-0000-4000-8000-000000061002', '00000000-0000-4000-8000-000000060000', 2, 'Se lancer'),
  ('00000000-0000-4000-8000-000000061003', '00000000-0000-4000-8000-000000060000', 3, 'Durer');
insert into public.lessons (id, course_id, module_id, position, slug, title, duration_min, has_video, mdx_path, is_preview) values
  ('00000000-0000-4000-8000-000000062101', '00000000-0000-4000-8000-000000060000', '00000000-0000-4000-8000-000000061001', 1, 'panorama', 'Panorama des marketplaces', 20, true, 'vendre-sur-les-marketplaces/panorama.mdx', true),
  ('00000000-0000-4000-8000-000000062102', '00000000-0000-4000-8000-000000060000', '00000000-0000-4000-8000-000000061001', 2, 'couts', 'Calculer ses coûts réels', 20, true, 'vendre-sur-les-marketplaces/couts.mdx', false),
  ('00000000-0000-4000-8000-000000062201', '00000000-0000-4000-8000-000000060000', '00000000-0000-4000-8000-000000061002', 1, 'compte-vendeur', 'Ouvrir son compte vendeur', 20, true, 'vendre-sur-les-marketplaces/compte-vendeur.mdx', false),
  ('00000000-0000-4000-8000-000000062202', '00000000-0000-4000-8000-000000060000', '00000000-0000-4000-8000-000000061002', 2, 'fiches', 'Des fiches qui ressortent', 20, true, 'vendre-sur-les-marketplaces/fiches.mdx', false),
  ('00000000-0000-4000-8000-000000062203', '00000000-0000-4000-8000-000000060000', '00000000-0000-4000-8000-000000061002', 3, 'logistique', 'Expédier soi-même ou confier la logistique', 20, true, 'vendre-sur-les-marketplaces/logistique.mdx', false),
  ('00000000-0000-4000-8000-000000062301', '00000000-0000-4000-8000-000000060000', '00000000-0000-4000-8000-000000061003', 1, 'visibilite', 'Gagner en visibilité', 20, true, 'vendre-sur-les-marketplaces/visibilite.mdx', false),
  ('00000000-0000-4000-8000-000000062302', '00000000-0000-4000-8000-000000060000', '00000000-0000-4000-8000-000000061003', 2, 'independance', 'Rester indépendant', 20, true, 'vendre-sur-les-marketplaces/independance.mdx', false),
  ('00000000-0000-4000-8000-000000062303', '00000000-0000-4000-8000-000000060000', '00000000-0000-4000-8000-000000061003', 3, 'regles', 'Respecter les règles de la plateforme', 10, true, 'vendre-sur-les-marketplaces/regles.mdx', false);
insert into public.courses (id, slug, code, title, summary, objectives, audience, prerequisites, level, is_free, price_cents, access_months, faq, status, position)
values ('00000000-0000-4000-8000-000000070000', 'piloter-et-rentabiliser', 'F7', 'Piloter et rentabiliser', 'Tableau de bord mensuel, marge réelle, prix, trésorerie et stock : piloter son activité avec quelques chiffres, et savoir quand passer en société.',
  array['Suivre huit indicateurs chaque mois', 'Calculer sa marge réelle et ajuster ses prix', 'Anticiper sa trésorerie', 'Décider du bon moment pour passer en société'],
  'Vendeurs qui ont leurs premières ventes et veulent en vivre sans perdre de vue leurs chiffres.', array['Avoir réalisé ses premières ventes'],
  'intermediaire', false, 4900, 24, '[{"question":"Combien de temps ai-je accès à la formation ?","answer":"Vous y avez accès pendant 24 mois à compter de l’ouverture de votre accès."},{"question":"Y a-t-il un quiz ?","answer":"Oui, chaque module se termine par un quiz. Il faut 80 % de bonnes réponses pour le valider."}]', 'draft', 7);
insert into public.modules (id, course_id, position, title) values
  ('00000000-0000-4000-8000-000000071001', '00000000-0000-4000-8000-000000070000', 1, 'Tableau de bord'),
  ('00000000-0000-4000-8000-000000071002', '00000000-0000-4000-8000-000000070000', 2, 'Marge et prix'),
  ('00000000-0000-4000-8000-000000071003', '00000000-0000-4000-8000-000000070000', 3, 'Trésorerie et stock'),
  ('00000000-0000-4000-8000-000000071004', '00000000-0000-4000-8000-000000070000', 4, 'Évoluer');
insert into public.lessons (id, course_id, module_id, position, slug, title, duration_min, has_video, mdx_path, is_preview) values
  ('00000000-0000-4000-8000-000000072101', '00000000-0000-4000-8000-000000070000', '00000000-0000-4000-8000-000000071001', 1, 'indicateurs', 'Les huit indicateurs à suivre', 25, true, 'piloter-et-rentabiliser/indicateurs.mdx', true),
  ('00000000-0000-4000-8000-000000072102', '00000000-0000-4000-8000-000000070000', '00000000-0000-4000-8000-000000071001', 2, 'outils', 'Un tableau de bord simple', 15, true, 'piloter-et-rentabiliser/outils.mdx', false),
  ('00000000-0000-4000-8000-000000072201', '00000000-0000-4000-8000-000000070000', '00000000-0000-4000-8000-000000071002', 1, 'marge', 'Calculer sa marge réelle', 25, true, 'piloter-et-rentabiliser/marge.mdx', false),
  ('00000000-0000-4000-8000-000000072202', '00000000-0000-4000-8000-000000070000', '00000000-0000-4000-8000-000000071002', 2, 'prix', 'Ajuster ses prix', 20, true, 'piloter-et-rentabiliser/prix.mdx', false),
  ('00000000-0000-4000-8000-000000072301', '00000000-0000-4000-8000-000000070000', '00000000-0000-4000-8000-000000071003', 1, 'tresorerie', 'Anticiper sa trésorerie', 20, true, 'piloter-et-rentabiliser/tresorerie.mdx', false),
  ('00000000-0000-4000-8000-000000072302', '00000000-0000-4000-8000-000000070000', '00000000-0000-4000-8000-000000071003', 2, 'stock', 'Piloter son stock', 15, true, 'piloter-et-rentabiliser/stock.mdx', false),
  ('00000000-0000-4000-8000-000000072401', '00000000-0000-4000-8000-000000070000', '00000000-0000-4000-8000-000000071004', 1, 'passer-en-societe', 'Quand passer en société', 20, true, 'piloter-et-rentabiliser/passer-en-societe.mdx', false),
  ('00000000-0000-4000-8000-000000072402', '00000000-0000-4000-8000-000000070000', '00000000-0000-4000-8000-000000071004', 2, 'deleguer', 'Ce qu’on peut déléguer', 10, true, 'piloter-et-rentabiliser/deleguer.mdx', false);
