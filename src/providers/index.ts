/**
 * Point d'entrée des sources de questions : enregistre tous les fournisseurs.
 * Pour ajouter une source : créer son adaptateur (voir ./types.ts) puis l'ajouter à la liste ci-dessous.
 */
import { fournisseurDeezer } from './deezer';
import { fournisseurOpenQuizzDb } from './openquizzdb';
import { fournisseurOpenTdb } from './opentdb';
import { fournisseurDepartements, fournisseurPays } from './pays';
import { enregistrerFournisseur } from './registre';
import { fournisseurWikidata } from './wikidata';

export { recupererQuestions, rafraichirMedia, FOURNISSEURS } from './registre';

[fournisseurWikidata, fournisseurPays, fournisseurDepartements, fournisseurDeezer, fournisseurOpenQuizzDb, fournisseurOpenTdb].forEach(
  enregistrerFournisseur,
);
