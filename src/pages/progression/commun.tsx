import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { T } from '@/i18n/fr';

const ONGLETS = [
  { to: '/profil', libelle: T.profil.titre, icone: '🙂' },
  { to: '/badges', libelle: T.profil.badges, icone: '🏅' },
  { to: '/statistiques', libelle: T.profil.statistiques, icone: '📊' },
  { to: '/historique', libelle: T.profil.historique, icone: '🕘' },
  { to: '/classement', libelle: T.profil.classement, icone: '🏆' },
];

/** Gabarit des pages de progression, avec la navigation entre elles. */
export function PageProgression({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <div className="space-y-6">
      <nav aria-label="Progression" className="-mx-4 overflow-x-auto px-4">
        <ul className="flex gap-2">
          {ONGLETS.map((o) => (
            <li key={o.to}>
              <NavLink
                to={o.to}
                end
                className={({ isActive }) =>
                  `flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-bold transition ${
                    isActive ? 'bg-violet-700 text-white' : 'bg-white/70 text-slate-700 hover:bg-white dark:bg-slate-800 dark:text-slate-200'
                  }`
                }
              >
                <span aria-hidden>{o.icone}</span> {o.libelle}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <h1 className="font-display text-3xl font-extrabold">{titre}</h1>
      {children}
    </div>
  );
}

export function Vide({ texte }: { texte: string }) {
  return (
    <div className="rounded-3xl bg-white p-8 text-center shadow-sm dark:bg-slate-800">
      <p className="text-5xl" aria-hidden>
        🌱
      </p>
      <p className="mt-2 font-semibold">{texte}</p>
      <Link to="/jouer/classique" className="mt-4 inline-block rounded-full bg-violet-700 px-6 py-3 font-bold text-white">
        {T.accueil.jouer}
      </Link>
    </div>
  );
}

export function formaterDate(iso: string, avecHeure = false): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', ...(avecHeure ? { hour: '2-digit', minute: '2-digit' } : {}) });
}

export function Tuile({ libelle, valeur, icone }: { libelle: string; valeur: string; icone: string }) {
  return (
    <div className="rounded-2xl bg-white p-3 text-center shadow-sm dark:bg-slate-800">
      <span className="text-2xl" aria-hidden>
        {icone}
      </span>
      <p className="font-display text-2xl font-extrabold tabular-nums">{valeur}</p>
      <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{libelle}</p>
    </div>
  );
}
