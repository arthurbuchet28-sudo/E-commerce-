/**
 * Transport temps réel des parties entre amis.
 *
 * Chaque appareil publie sa « présence » (pseudo, score, progression…) dans un salon nommé
 * et reçoit celle des autres. Rien n'est stocké côté serveur : l'hôte porte la configuration
 * de la partie dans sa propre présence, ce qui suffit aux retardataires.
 *
 * Implémentations :
 * - `claude` : salons temps réel de la page hébergée sur Claude (capacité `room`) ;
 * - `local` : BroadcastChannel entre onglets du même navigateur (développement et tests).
 * Un transport Supabase Realtime pourra s'ajouter ici sans toucher au reste.
 */

export type Pair = {
  /** Identifiant d'une page ouverte (un onglet = un pair). */
  id: string;
  moi: boolean;
  presence: Readonly<Record<string, unknown>>;
};

export interface ConnexionSalon {
  /** Remplace les champs donnés de ma présence. */
  presence(patch: Record<string, unknown>): Promise<void>;
  /** Appelé à chaque changement du salon, avec la liste complète des pairs (moi compris). */
  surPairs(fn: (pairs: Pair[]) => void): () => void;
  quitter(): Promise<void>;
}

export interface TransportMulti {
  nom: 'claude' | 'local';
  rejoindre(code: string): Promise<ConnexionSalon>;
}

const nomSalon = (code: string) => `quizmania-${code.toLowerCase()}`;

// ---------------------------------------------------------------------------
// Claude (capacité « room »)

type PeerClaude = { peer: string; sameTab: boolean; kind: string; presence: Readonly<Record<string, unknown>> };
type SalonClaude = {
  presence(p: Record<string, unknown>): Promise<void>;
  peers(): readonly PeerClaude[];
  onPeers(fn: (c: { peers: readonly PeerClaude[] }) => void, err?: (e: unknown) => void): () => void;
  leave(): Promise<void>;
};
type RoomClaude = { join(nom: string): Promise<SalonClaude> };
type FenetreClaude = { claude?: { use?: (nom: string) => Promise<unknown> } };

async function transportClaude(): Promise<TransportMulti | null> {
  const use = (window as unknown as FenetreClaude).claude?.use;
  if (typeof use !== 'function') return null;
  const room = (await use.call((window as unknown as FenetreClaude).claude, 'room').catch(() => null)) as RoomClaude | null;
  if (!room) return null;
  return {
    nom: 'claude',
    rejoindre: async (code) => {
      const salon = await room.join(nomSalon(code));
      const convertir = (peers: readonly PeerClaude[]): Pair[] =>
        peers.filter((p) => p.kind === 'viewer').map((p) => ({ id: p.peer, moi: p.sameTab, presence: p.presence ?? {} }));
      return {
        presence: (p) => salon.presence(p),
        surPairs: (fn) => {
          const arret = salon.onPeers((c) => fn(convertir(c.peers)));
          fn(convertir(salon.peers()));
          return arret;
        },
        quitter: () => salon.leave(),
      };
    },
  };
}

// ---------------------------------------------------------------------------
// Local (BroadcastChannel) : plusieurs onglets du même navigateur

const BATTEMENT_MS = 1500;
const ABSENCE_MS = 5000;

type MessageLocal =
  | { type: 'presence'; id: string; presence: Record<string, unknown> }
  | { type: 'bonjour'; id: string }
  | { type: 'depart'; id: string };

export function transportLocal(): TransportMulti | null {
  if (typeof BroadcastChannel === 'undefined') return null;
  return {
    nom: 'local',
    rejoindre: async (code) => {
      const canal = new BroadcastChannel(nomSalon(code));
      const moi = Math.random().toString(36).slice(2, 10);
      let maPresence: Record<string, unknown> = {};
      const autres = new Map<string, { presence: Record<string, unknown>; vu: number }>();
      const abonnes = new Set<(pairs: Pair[]) => void>();
      const pairs = (): Pair[] => [
        { id: moi, moi: true, presence: maPresence },
        ...[...autres].map(([id, a]) => ({ id, moi: false, presence: a.presence })),
      ];
      const notifier = () => abonnes.forEach((fn) => fn(pairs()));
      const envoyer = (m: MessageLocal) => canal.postMessage(m);
      canal.onmessage = (e: MessageEvent<MessageLocal>) => {
        const m = e.data;
        if (m.type === 'presence') {
          autres.set(m.id, { presence: m.presence, vu: Date.now() });
          notifier();
        } else if (m.type === 'bonjour') {
          envoyer({ type: 'presence', id: moi, presence: maPresence });
        } else if (autres.delete(m.id)) {
          notifier();
        }
      };
      const battement = window.setInterval(() => {
        envoyer({ type: 'presence', id: moi, presence: maPresence });
        const limite = Date.now() - ABSENCE_MS;
        let change = false;
        for (const [id, a] of autres) if (a.vu < limite) change = autres.delete(id) || change;
        if (change) notifier();
      }, BATTEMENT_MS);
      envoyer({ type: 'bonjour', id: moi });
      return {
        presence: async (patch) => {
          maPresence = { ...maPresence, ...patch };
          envoyer({ type: 'presence', id: moi, presence: maPresence });
          notifier();
        },
        surPairs: (fn) => {
          abonnes.add(fn);
          fn(pairs());
          return () => abonnes.delete(fn);
        },
        quitter: async () => {
          window.clearInterval(battement);
          envoyer({ type: 'depart', id: moi });
          canal.close();
          abonnes.clear();
        },
      };
    },
  };
}

// ---------------------------------------------------------------------------

let enCours: Promise<TransportMulti | null> | null = null;

/** Le transport disponible ici (mémorisé), ou null si le jeu entre amis n'est pas possible. */
export function obtenirTransport(): Promise<TransportMulti | null> {
  enCours ??= transportClaude().then((t) => t ?? (import.meta.env.DEV || import.meta.env.VITE_MULTI_LOCAL === '1' ? transportLocal() : null));
  return enCours;
}
