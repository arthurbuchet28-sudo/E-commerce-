import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, STYLES_AVATAR } from '@/components/Avatar';
import { BarreXp } from '@/components/BarreXp';
import { BADGES } from '@/config/progression';
import { niveauDepuisXp } from '@/engine/progression';
import { T } from '@/i18n/fr';
import { useProfil, type StyleAvatar } from '@/store/profil';
import { useRevision } from '@/store/revision';
import { usePartie } from '@/store/partie';
import { PageProgression, Tuile } from './commun';

function grainesAleatoires(n: number) {
  return Array.from({ length: n }, () => Math.random().toString(36).slice(2, 10));
}

export function Profil() {
  const { pseudo, avatar, xp, stats, badges, modifier } = useProfil();
  const aRevoir = useRevision((s) => s.questions.length);
  const navigate = useNavigate();
  const { lancer, chargement } = usePartie();
  const reviser = async () => {
    if (await lancer({ mode: 'revision', categorie: 'mix', difficulte: 'moyen', nombreQuestions: 10 })) navigate('/partie');
  };
  const [style, setStyle] = useState<StyleAvatar>(avatar.style);
  const [graines, setGraines] = useState(() => [avatar.graine, ...grainesAleatoires(11)]);
  const [choixOuvert, setChoixOuvert] = useState(false);
  const info = niveauDepuisXp(xp);
  const obtenus = BADGES.filter((b) => badges[b.id]);

  return (
    <PageProgression titre={T.profil.titre}>
      <section className="space-y-4 rounded-3xl bg-white p-5 shadow-md dark:bg-slate-800">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => setChoixOuvert((o) => !o)} className="rounded-full" aria-label={T.profil.changerAvatar} aria-expanded={choixOuvert}>
            <Avatar avatar={avatar} taille={88} />
          </button>
          <label className="min-w-0 flex-1">
            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{T.profil.pseudo}</span>
            <input
              type="text"
              value={pseudo}
              maxLength={20}
              onChange={(e) => modifier({ pseudo: e.target.value })}
              onBlur={(e) => !e.target.value.trim() && modifier({ pseudo: 'Joueur' })}
              className="mt-1 block min-h-12 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 font-display text-xl font-extrabold outline-none focus:border-violet-600 dark:border-slate-600 dark:bg-slate-900"
            />
          </label>
        </div>
        {choixOuvert && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={T.profil.avatar}>
              {STYLES_AVATAR.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={style === s.id}
                  onClick={() => setStyle(s.id)}
                  className={`rounded-full px-3 py-1.5 text-sm font-bold ${style === s.id ? 'bg-violet-700 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}
                >
                  {s.nom}
                </button>
              ))}
              <button type="button" onClick={() => setGraines(grainesAleatoires(12))} className="rounded-full bg-amber-100 px-3 py-1.5 text-sm font-bold text-amber-900 dark:bg-amber-400/20 dark:text-amber-100">
                {T.profil.autreTirage}
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {graines.map((g, i) => {
                const candidat = { style, graine: g };
                const choisi = avatar.style === style && avatar.graine === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => modifier({ avatar: candidat })}
                    aria-label={T.profil.choisirAvatar(i + 1)}
                    aria-pressed={choisi}
                    className={`flex justify-center rounded-2xl p-1 transition hover:scale-105 ${choisi ? 'ring-4 ring-violet-600' : ''}`}
                  >
                    <Avatar avatar={candidat} taille={64} />
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Avatars DiceBear (thumbs, lorelei, notionists : CC0 ; bottts : libre d’usage).</p>
          </div>
        )}
        <BarreXp info={info} xp={xp} />
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tuile icone="🎮" libelle={T.profil.parties} valeur={String(stats.parties)} />
        <Tuile icone="❓" libelle={T.profil.questions} valeur={stats.questions.toLocaleString('fr-FR')} />
        <Tuile icone="🎯" libelle={T.profil.reussite} valeur={stats.questions ? `${Math.round((stats.bonnes / stats.questions) * 100)} %` : '–'} />
        <Tuile icone="🔥" libelle={T.profil.meilleureSerie} valeur={String(stats.meilleureSerie)} />
      </div>

      <section className="rounded-3xl bg-white p-5 shadow-md dark:bg-slate-800" aria-labelledby="titre-badges-profil">
        <div className="flex items-center justify-between">
          <h2 id="titre-badges-profil" className="font-display text-xl font-extrabold">
            {T.profil.badgesObtenus(obtenus.length, BADGES.length)}
          </h2>
          <Link to="/badges" className="font-bold text-violet-700 dark:text-violet-300">
            {T.profil.voirTout} →
          </Link>
        </div>
        <p className="mt-2 text-3xl tracking-wide">{obtenus.length ? obtenus.map((b) => <span key={b.id} title={b.nom} role="img" aria-label={b.nom}>{b.icone}</span>) : '—'}</p>
      </section>

      <section className="flex flex-col gap-3 rounded-3xl bg-gradient-to-br from-yellow-200 to-amber-300 p-5 text-slate-950 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-extrabold">🔁 {T.profil.revision}</h2>
          <p className="font-semibold">{T.profil.revisionCompte(aRevoir)}</p>
        </div>
        {aRevoir > 0 && (
          <button type="button" onClick={() => void reviser()} disabled={chargement} className="rounded-full bg-slate-950 px-6 py-3 font-display text-lg font-extrabold text-amber-200 shadow-lg">
            {T.profil.reviser}
          </button>
        )}
      </section>
    </PageProgression>
  );
}
