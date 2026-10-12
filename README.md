# Compteur Pro — Formation au comptage de cartes au Blackjack

Application web **entièrement en français** pour apprendre, depuis zéro, à compter les cartes au Blackjack avec le système **Hi-Lo** : cours théoriques, exercices chronométrés, quiz de validation et simulateur de table.

## Installation et lancement

Prérequis : [Node.js](https://nodejs.org) 18 ou plus récent.

```bash
npm install
npm run dev
```

Ouvrez ensuite l'adresse affichée dans le terminal (par défaut http://localhost:5173).

Autres commandes :

| Commande | Rôle |
|---|---|
| `npm test` | Tests unitaires (Vitest) du moteur de jeu et du contenu |
| `npm run build` | Vérification TypeScript + build de production dans `dist/` |
| `npm run preview` | Sert le build de production localement |

La progression est enregistrée dans le `localStorage` du navigateur (toutes les lectures/écritures sont protégées par `try/catch` : l'application fonctionne aussi en navigation privée, sans sauvegarde). Elle peut être exportée/importée en JSON depuis le tableau de bord.

## Contenu de la formation

Neuf modules, chacun avec objectifs, cours illustré, points clés, erreurs fréquentes, exercices et un quiz d'au moins 10 questions expliquées. Le module suivant se débloque avec **80 %** au quiz (un interrupteur permet de tout déverrouiller).

1. Les règles du Blackjack (paiements 3:2 / 6:5, assurance, S17/H17, DAS, pénétration, calculateur d'avantage de la maison)
2. La stratégie de base (tableaux complets pour 6 jeux, S17, DAS, abandon tardif ; variantes H17 / sans DAS)
3. Le principe du comptage (effet de retrait, histoire : Thorp, Dubner, Wong, Schlesinger)
4. Le système Hi-Lo (running count, comptage par paires)
5. Le true count (estimation de la défausse, arrondi plancher, ≈ +0,5 % par point)
6. La gestion de la mise (rampe, Wonging, variance, risque de ruine, calculateur de bankroll)
7. Les déviations (Illustrious 18, Fab 4, assurance à TC +3 — règles de validité précisées)
8. Le comptage en conditions réelles (vitesse, camouflage, signes de repérage, réalité du métier)
9. Aller plus loin (KO, Omega II, Zen) — optionnel

## Exercices

- **Flash cards de stratégie de base** avec correction expliquée, statistiques par type de main et répétition espacée (Leitner) des situations ratées
- **Défilé de cartes** (8 niveaux de vitesse + vitesse libre)
- **Compte à rebours d'un jeu complet** (51 cartes, catégorie de la carte manquante, objectif < 25 s)
- **Paires et groupes** (2, 3, 4 cartes, mode flash)
- **Conversion en true count** (chiffres ou bac de défausse)
- **Estimation de la défausse**
- **Quiz de déviations** (I18 + Fab 4)

## Simulateur de table

Sabot configurable (1 à 8 jeux, S17/H17, DAS, abandon, pénétration, 3:2 ou 6:5), 0 à 5 joueurs virtuels jouant la stratégie de base, rampe de mise 1-4 / 1-8 / 1-12.

- **Mode entraînement** : affichage optionnel du running count, du true count, de l'action recommandée (déviations comprises), de la mise conseillée, et signalement immédiat des erreurs.
- **Mode examen** : aucune aide ; toutes les 3 à 7 mains (au hasard), l'application demande le running count et le true count avant la mise. Les décisions de jeu, l'assurance et les mises (par rapport à la rampe) sont notées, et un bilan détaillé est affiché à la fin.

## Architecture

```
src/
  engine/      Logique pure, sans React (testée avec Vitest)
    cards.ts, hand.ts, shoe.ts, rules.ts      cartes, mains, sabot, règles et avantage maison
    count.ts                                  Hi-Lo, true count, autres systèmes
    strategy.ts, deviations.ts                stratégie de base, I18 et Fab 4
    game.ts                                   moteur de table (joueurs virtuels, croupier, paiements)
    betting.ts                                rampe, fréquences de TC, risque de ruine
    srs.ts, situations.ts                     répétition espacée, génération de mains
  content/     Contenu des 9 modules (fichiers TS structurés) et liste des exercices
  components/  Carte, main, table, tableaux de stratégie, chronomètre, quiz, widgets
  pages/       Tableau de bord, une page par module, exercices, simulateur, aide-mémoire
  lib/         Progression (localStorage) et suivi des séances
```

## Conventions et limites

- Configuration de référence : **6 jeux, S17, DAS, abandon tardif, blackjack 3:2, peek du croupier**.
- True count arrondi **à l'entier inférieur** ; une déviation d'indice *n* s'applique quand TC ≥ *n* (ou TC < *n* pour les déviations négatives).
- Les chiffres d'avantage de la maison, de rendement et de risque de ruine sont des **ordres de grandeur** (modèles simplifiés), pas des garanties.

> Outil pédagogique. Le jeu d'argent comporte des risques (endettement, dépendance). En France : Joueurs Info Service, 09 74 75 13 13 (appel non surtaxé).
