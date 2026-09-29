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
