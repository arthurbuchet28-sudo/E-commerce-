# HUNSY — Location de voitures de luxe à Dubaï

Site statique multi-pages (HTML, CSS et JavaScript natif, sans framework ni étape de build).

## Lancer le site

- Double-cliquez sur `index.html`, ou
- servez le dossier avec n'importe quel hébergement statique (Netlify, GitHub Pages, OVH…).
  En local : `python3 -m http.server` puis ouvrez http://localhost:8000.

## Pages

| Fichier | Contenu |
| --- | --- |
| `index.html` | Accueil : hero vidéo, flotte à la une, avantages, étapes, tarifs, avis, FAQ, contact |
| `flotte.html` | Toute la flotte avec filtres (catégorie, recherche, tri, prix, places) |
| `voiture.html?id=<slug>` | Fiche voiture : galerie, caractéristiques, module de réservation avec prix en direct |
| `tarifs.html` | Formules, prix par voiture, options, zones de livraison, simulateur |
| `fonctionnement.html` | Étapes, documents nécessaires, livraison, caution et paiement |
| `a-propos.html` | Histoire, valeurs, équipe, avis |
| `faq.html` | FAQ par catégorie avec recherche |
| `contact.html` | Formulaire, coordonnées, carte |
| `reservation.html` | Réservation en 4 étapes |
| `confirmation.html` | Récapitulatif et confirmation WhatsApp |
| `conditions.html`, `confidentialite.html`, `mentions-legales.html` | Pages légales |
| `404.html` | Page introuvable |

## À personnaliser

- **Voitures et prix** : tout est dans `js/cars.js` (flotte, remises, options, zones de livraison). Les pages lisent ce fichier.
- **Photos des voitures** : à déposer dans `assets/cars/` (voir `assets/cars/README.md`). Sans photo, un bloc dégradé avec le nom de la voiture s'affiche.
- **Coordonnées** : numéro WhatsApp `971501234567`, téléphone et e-mail présents dans les pages HTML et dans `js/main.js` (`WA_NUMBER`).
- **Formulaire de contact** : l'envoi est simulé. Branchez un vrai service dans la fonction `sendForm()` de `js/main.js`.
- **Pages légales** : compléter les éléments entre crochets (licence, TRN, hébergeur).
- **Nom de domaine** : `https://www.hunsy.ae/` est utilisé dans les balises SEO, `sitemap.xml` et `robots.txt`.
