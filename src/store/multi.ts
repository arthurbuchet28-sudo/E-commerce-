import { create } from 'zustand';
import { DIFFICULTES, type ChoixDifficulte } from '@/config/difficulte';
import { MULTI } from '@/config/modes';
import type { ConfigPartie } from '@/engine/partie';
import { classerSalon, genererCode } from '@/engine/salon';
import { obtenirTransport, type ConnexionSalon, type Pair } from '@/multi/transport';
import { CATEGORIES, type CategorieJeu } from '@/types/question';
import { usePartie } from './partie';
import { useProfil, type Avatar, type StyleAvatar } from './profil';

export type EtatJoueur = 'attente' | 'jeu' | 'fini';

export type JoueurSalon = {
  id: string;
  moi: boolean;
  hote: boolean;
  pseudo: string;
  avatar: Avatar;
  etat: EtatJoueur;
  /** Graine de la manche que joue ce joueur (vide dans le salon d'attente). */
  manche: string;
  score: number;
  bonnes: number;
  repondues: number;
  total: number;
};

/** Manche lancée par l'hôte : configuration commune et graine du tirage. */
export type MancheSalon = { config: ConfigPartie; graine: string };

export type StatutSalon = 'inactif' | 'connexion' | 'connecte' | 'indisponible' | 'erreur';

type EtatMulti = {
  statut: StatutSalon;
  code: string | null;
  estHote: boolean;
  joueurs: JoueurSalon[];
  /** L'hôte du salon (le premier à l'avoir créé), s'il est là. */
  hote: JoueurSalon | null;
  manche: MancheSalon | null;
  /** Numéro de la manche démarrée sur cet appareil (sert à aller sur l'écran de jeu). */
  numeroManche: number;
  creer: (config: Omit<ConfigPartie, 'mode'>) => Promise<string | null>;
  rejoindre: (code: string) => Promise<boolean>;
  lancerManche: () => void;
  quitter: () => void;
};

const STYLES = new Set<StyleAvatar>(['thumbs', 'lorelei', 'notionists', 'bottts-neutral']);
const CATEGORIES_JEU = new Set<string>([...CATEGORIES, 'mix']);

const texte = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '');
const nombre = (v: unknown, max = 1e7) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(Math.max(0, Math.round(v)), max) : 0);

/** La présence vient des autres appareils : on ne garde que des valeurs bien formées. */
function lireConfig(v: unknown, graine: string): ConfigPartie | null {
  if (!v || typeof v !== 'object') return null;
  const c = v as Record<string, unknown>;
  const difficulte = texte(c.difficulte, 20) as ChoixDifficulte;
  const categorie = texte(c.categorie, 40) as CategorieJeu;
  if (!(difficulte in DIFFICULTES) || !CATEGORIES_JEU.has(categorie)) return null;
  const n = nombre(c.nombreQuestions, 30);
  return { mode: 'multi', categorie, difficulte, nombreQuestions: n || 10, salon: graine };
}

function lireJoueur(p: Pair, code: string): (JoueurSalon & { cree: number; mancheHote: MancheSalon | null }) | null {
  const pr = p.presence;
  if (pr.v !== 1 || pr.salon !== code) return null;
  const av = (pr.avatar ?? {}) as Record<string, unknown>;
  const style = texte(av.style, 20) as StyleAvatar;
  const hote = pr.role === 'hote';
  const m = pr.manche as Record<string, unknown> | undefined;
  const graine = texte(m?.graine, 24);
  const config = hote && graine ? lireConfig(m?.config, graine) : null;
  return {
    id: p.id,
    moi: p.moi,
    hote,
    pseudo: texte(pr.pseudo, 24).trim() || 'Joueur',
    avatar: { style: STYLES.has(style) ? style : 'thumbs', graine: texte(av.graine, 40) || p.id },
    etat: pr.etat === 'jeu' || pr.etat === 'fini' ? pr.etat : 'attente',
    manche: texte(pr.enManche, 24),
    score: nombre(pr.score),
    bonnes: nombre(pr.bonnes, 100),
    repondues: nombre(pr.repondues, 100),
    total: nombre(pr.total, 100),
    cree: nombre(pr.cree, Number.MAX_SAFE_INTEGER),
    mancheHote: config ? { config, graine } : null,
  };
}

/** Classement des joueurs d'une manche (ceux qui la jouent ou l'ont finie). */
export function classementManche(joueurs: JoueurSalon[], graine: string) {
  return classerSalon(joueurs.filter((j) => j.manche === graine));
}

let connexion: ConnexionSalon | null = null;
let arretPairs: (() => void) | null = null;
let arretPartie: (() => void) | null = null;
/** Graine de la dernière manche démarrée ici (pour ne pas la relancer). */
let mancheDemarree = '';
/** Configuration choisie par l'hôte, en attente du lancement. */
let configHote: Omit<ConfigPartie, 'mode'> | null = null;

const grainAleatoire = () => Math.random().toString(36).slice(2, 10);

function presenceDeBase(code: string, estHote: boolean): Record<string, unknown> {
  const { pseudo, avatar } = useProfil.getState();
  return {
    v: 1,
    salon: code,
    role: estHote ? 'hote' : 'joueur',
    pseudo: pseudo.slice(0, 24),
    avatar,
    etat: 'attente',
    enManche: '',
    score: 0,
    bonnes: 0,
    repondues: 0,
    total: 0,
    ...(estHote ? { cree: Date.now() } : {}),
  };
}

/** Ma progression dans la manche, publiée à chaque réponse. */
function suivreMaPartie() {
  arretPartie?.();
  let derniere = '';
  arretPartie = usePartie.subscribe(({ partie }) => {
    if (!connexion || !partie || partie.config.mode !== 'multi' || partie.config.salon !== mancheDemarree) return;
    const patch = {
      etat: partie.phase === 'terminee' ? 'fini' : 'jeu',
      enManche: mancheDemarree,
      score: partie.score,
      bonnes: partie.resultats.filter((r) => r.correct).length,
      repondues: partie.resultats.length,
      total: partie.questions.length,
    };
    const cle = JSON.stringify(patch);
    if (cle === derniere) return;
    derniere = cle;
    void connexion.presence(patch).catch(() => undefined);
  });
}

async function demarrer(manche: MancheSalon) {
  mancheDemarree = manche.graine;
  await connexion?.presence({ etat: 'jeu', enManche: manche.graine, score: 0, bonnes: 0, repondues: 0, total: manche.config.nombreQuestions }).catch(() => undefined);
  if (await usePartie.getState().lancer(manche.config)) useMulti.setState((s) => ({ numeroManche: s.numeroManche + 1 }));
}

function surPairs(code: string, pairs: Pair[]) {
  const lus = pairs.map((p) => lireJoueur(p, code)).filter((j) => j !== null);
  // L'hôte : le premier arrivé qui s'annonce comme tel.
  const hote = lus.filter((j) => j.hote).sort((a, b) => a.cree - b.cree || a.id.localeCompare(b.id))[0] ?? null;
  const joueurs: JoueurSalon[] = lus.map(({ cree: _c, mancheHote: _m, ...j }) => ({ ...j, hote: j.id === hote?.id }));
  const manche = hote?.mancheHote ?? null;
  useMulti.setState({ joueurs, hote: joueurs.find((j) => j.hote) ?? null, manche });
  if (manche && manche.graine !== mancheDemarree) void demarrer(manche);
}

async function connecter(code: string, estHote: boolean): Promise<boolean> {
  useMulti.getState().quitter();
  useMulti.setState({ statut: 'connexion', code, estHote, joueurs: [], hote: null, manche: null });
  const transport = await obtenirTransport();
  if (!transport) {
    useMulti.setState({ statut: 'indisponible' });
    return false;
  }
  try {
    const c = await transport.rejoindre(code);
    if (useMulti.getState().code !== code) {
      void c.quitter();
      return false;
    }
    connexion = c;
    await c.presence(presenceDeBase(code, estHote));
    arretPairs = c.surPairs((pairs) => surPairs(code, pairs));
    suivreMaPartie();
    useMulti.setState({ statut: 'connecte' });
    return true;
  } catch {
    useMulti.setState({ statut: 'erreur' });
    return false;
  }
}

export const useMulti = create<EtatMulti>()((set, get) => ({
  statut: 'inactif',
  code: null,
  estHote: false,
  joueurs: [],
  hote: null,
  manche: null,
  numeroManche: 0,

  creer: async (config) => {
    configHote = config;
    const code = genererCode();
    return (await connecter(code, true)) ? code : null;
  },

  rejoindre: (code) => connecter(code, false),

  lancerManche: () => {
    const { estHote, manche } = get();
    if (!estHote || !connexion) return;
    const base = configHote ?? manche?.config;
    if (!base) return;
    const graine = grainAleatoire();
    const config: ConfigPartie = {
      mode: 'multi',
      categorie: base.categorie,
      difficulte: base.difficulte === 'adaptatif' ? 'moyen' : base.difficulte,
      nombreQuestions: Math.min(base.nombreQuestions, Math.max(...MULTI.nombres)),
      salon: graine,
    };
    void connexion.presence({ manche: { config: { categorie: config.categorie, difficulte: config.difficulte, nombreQuestions: config.nombreQuestions }, graine } });
  },

  quitter: () => {
    arretPairs?.();
    arretPartie?.();
    arretPairs = arretPartie = null;
    void connexion?.quitter().catch(() => undefined);
    connexion = null;
    mancheDemarree = '';
    set({ statut: 'inactif', code: null, estHote: false, joueurs: [], hote: null, manche: null });
  },
}));
