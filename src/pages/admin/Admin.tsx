import { useMemo, useState } from 'react';
import { INFOS_CATEGORIES, LISTE_CATEGORIES_JEU } from '@/config/categories';
import { depuisCsv, depuisJson, versCsv, versFichiersBanque, type ResultatImport } from '@/engine/import-export';
import { normaliserTexte } from '@/engine/texte';
import { T } from '@/i18n/fr';
import { banqueFichiers, banqueLocale } from '@/providers/local';
import { useAdmin } from '@/store/admin';
import type { Categorie, Question, TypeQuestion } from '@/types/question';
import { FormulaireQuestion } from './FormulaireQuestion';

const CODE = (import.meta.env.VITE_ADMIN_CODE as string | undefined)?.trim();
const CLE_SESSION = 'quizmania-admin-ouvert';

function sessionOuverte() {
  try {
    return sessionStorage.getItem(CLE_SESSION) === '1';
  } catch {
    return false;
  }
}

function telecharger(nom: string, contenu: string, type: string) {
  const url = URL.createObjectURL(new Blob([contenu], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = nom;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

type Statut = 'tous' | 'ajoutee' | 'modifiee' | 'supprimee';
type Onglet = 'questions' | 'signalements' | 'echanges';

export function Admin() {
  const [ouvert, setOuvert] = useState(sessionOuverte);
  const [saisie, setSaisie] = useState('');
  const [erreurCode, setErreurCode] = useState(false);

  if (!CODE)
    return (
      <div className="space-y-3">
        <h1 className="font-display text-3xl font-extrabold">🛠️ {T.admin.titre}</h1>
        <p className="rounded-3xl bg-white p-6 font-semibold shadow-sm dark:bg-slate-800">{T.admin.desactive}</p>
      </div>
    );
  if (!ouvert) {
    return (
      <form
        className="mx-auto max-w-sm space-y-3 rounded-3xl bg-white p-6 shadow-md dark:bg-slate-800"
        onSubmit={(e) => {
          e.preventDefault();
          if (saisie === CODE) {
            try {
              sessionStorage.setItem(CLE_SESSION, '1');
            } catch {
              /* ignoré */
            }
            setOuvert(true);
          } else setErreurCode(true);
        }}
      >
        <h1 className="font-display text-2xl font-extrabold">🔐 {T.admin.titre}</h1>
        <label className="block">
          <span className="text-sm font-bold">{T.admin.code}</span>
          <input type="password" value={saisie} onChange={(e) => setSaisie(e.target.value)} autoComplete="off" className="mt-1 block min-h-12 w-full rounded-xl border-2 border-slate-200 bg-white px-3 dark:border-slate-600 dark:bg-slate-900" />
        </label>
        {erreurCode && (
          <p role="alert" className="text-sm font-semibold text-red-700 dark:text-red-300">
            {T.admin.codeFaux}
          </p>
        )}
        <button type="submit" className="w-full rounded-full bg-violet-700 py-3 font-bold text-white">
          {T.admin.entrer}
        </button>
      </form>
    );
  }
  return <EspaceAdmin />;
}

function EspaceAdmin() {
  const admin = useAdmin();
  const [onglet, setOnglet] = useState<Onglet>('questions');
  const [edition, setEdition] = useState<Question | 'nouvelle' | null>(null);
  const [message, setMessage] = useState('');
  const nonTraites = admin.signalements.filter((s) => !s.traite).length;

  const enregistrer = (q: Question) => {
    const estNouvelle = edition === 'nouvelle';
    admin.enregistrer(q, estNouvelle && !banqueFichiers().some((b) => b.id === q.id));
    setEdition(null);
    setMessage(T.admin.enregistree);
  };

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl font-extrabold">🛠️ {T.admin.titre}</h1>
      <p className="rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-900 dark:bg-amber-400/10 dark:text-amber-100">{T.admin.avertissement}</p>
      <div className="flex flex-wrap gap-2" role="tablist">
        {(Object.keys(T.admin.onglets) as Onglet[]).map((o) => (
          <button
            key={o}
            type="button"
            role="tab"
            aria-selected={onglet === o}
            onClick={() => {
              setOnglet(o);
              setEdition(null);
            }}
            className={`rounded-full px-4 py-2 font-bold ${onglet === o ? 'bg-violet-700 text-white' : 'bg-white dark:bg-slate-800'}`}
          >
            {T.admin.onglets[o]}
            {o === 'signalements' && nonTraites > 0 && <span className="ml-1 rounded-full bg-red-600 px-2 text-xs text-white">{nonTraites}</span>}
          </button>
        ))}
      </div>
      {message && (
        <p role="status" className="rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
          {message}
        </p>
      )}
      {edition ? (
        <FormulaireQuestion initiale={edition === 'nouvelle' ? null : edition} onEnregistrer={enregistrer} onAnnuler={() => setEdition(null)} />
      ) : onglet === 'questions' ? (
        <ListeQuestions onModifier={setEdition} onNouvelle={() => setEdition('nouvelle')} />
      ) : onglet === 'signalements' ? (
        <ListeSignalements onModifier={setEdition} />
      ) : (
        <Echanges onMessage={setMessage} />
      )}
    </div>
  );
}

function ListeQuestions({ onModifier, onNouvelle }: { onModifier: (q: Question) => void; onNouvelle: () => void }) {
  const { ajoutees, modifiees, supprimees, supprimer, restaurer } = useAdmin();
  const [recherche, setRecherche] = useState('');
  const [categorie, setCategorie] = useState<Categorie | ''>('');
  const [type, setType] = useState<TypeQuestion | ''>('');
  const [statut, setStatut] = useState<Statut>('tous');
  const [limite, setLimite] = useState(30);

  const toutes = useMemo(() => {
    const idsAjoutees = new Set(ajoutees.map((q) => q.id));
    const supp = new Set(supprimees);
    const liste = [...banqueFichiers().map((q) => modifiees[q.id] ?? q), ...ajoutees];
    return liste.map((q) => ({
      q,
      statut: (supp.has(q.id) ? 'supprimee' : idsAjoutees.has(q.id) ? 'ajoutee' : modifiees[q.id] ? 'modifiee' : 'tous') as Statut,
    }));
  }, [ajoutees, modifiees, supprimees]);

  const filtre = normaliserTexte(recherche);
  const visibles = toutes.filter(
    ({ q, statut: s }) =>
      (!categorie || q.categorie === categorie) &&
      (!type || q.type === type) &&
      (statut === 'tous' || s === statut) &&
      (!filtre || normaliserTexte(`${q.enonce} ${q.id} ${String(q.bonneReponse)}`).includes(filtre)),
  );

  return (
    <section className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-4">
        <input type="search" value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder={T.admin.recherche} aria-label={T.admin.recherche} className="min-h-11 rounded-xl border-2 border-slate-200 bg-white px-3 sm:col-span-4 dark:border-slate-600 dark:bg-slate-800" />
        <select value={categorie} onChange={(e) => setCategorie(e.target.value as Categorie | '')} aria-label={T.admin.champs.categorie} className="min-h-11 rounded-xl border-2 border-slate-200 bg-white px-2 dark:border-slate-600 dark:bg-slate-800">
          <option value="">{T.admin.toutesCategories}</option>
          {LISTE_CATEGORIES_JEU.filter((c) => c.id !== 'mix').map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value as TypeQuestion | '')} aria-label={T.admin.champs.type} className="min-h-11 rounded-xl border-2 border-slate-200 bg-white px-2 dark:border-slate-600 dark:bg-slate-800">
          <option value="">{T.admin.tousTypes}</option>
          {(Object.keys(T.admin.types) as TypeQuestion[]).map((t) => (
            <option key={t} value={t}>
              {T.admin.types[t]}
            </option>
          ))}
        </select>
        <select value={statut} onChange={(e) => setStatut(e.target.value as Statut)} aria-label="Statut" className="min-h-11 rounded-xl border-2 border-slate-200 bg-white px-2 dark:border-slate-600 dark:bg-slate-800">
          {(Object.keys(T.admin.statuts) as Statut[]).map((s) => (
            <option key={s} value={s}>
              {T.admin.statuts[s]}
            </option>
          ))}
        </select>
        <button type="button" onClick={onNouvelle} className="min-h-11 rounded-xl bg-violet-700 px-3 font-bold text-white">
          {T.admin.nouvelle}
        </button>
      </div>
      <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">{T.admin.resultats(visibles.length)}</p>
      <ul className="space-y-2">
        {visibles.slice(0, limite).map(({ q, statut: s }) => (
          <li key={q.id} className={`rounded-2xl bg-white p-3 shadow-sm dark:bg-slate-800 ${s === 'supprimee' ? 'opacity-60' : ''}`}>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
              <span>{INFOS_CATEGORIES[q.categorie].icone} {INFOS_CATEGORIES[q.categorie].nom}</span>
              <span>· {T.admin.types[q.type]}</span>
              <span>· niveau {q.difficulte}</span>
              <code className="font-normal">{q.id}</code>
              {s === 'ajoutee' && <span className="rounded-full bg-emerald-100 px-2 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100">{T.admin.statutAjoutee}</span>}
              {s === 'modifiee' && <span className="rounded-full bg-sky-100 px-2 text-sky-900 dark:bg-sky-900 dark:text-sky-100">{T.admin.statutModifiee}</span>}
              {s === 'supprimee' && <span className="rounded-full bg-red-100 px-2 text-red-900 dark:bg-red-900 dark:text-red-100">{T.admin.statutSupprimee}</span>}
            </div>
            <p className={`mt-1 font-bold ${s === 'supprimee' ? 'line-through' : ''}`}>{q.enonce}</p>
            <p className="text-sm text-emerald-800 dark:text-emerald-300">{Array.isArray(q.bonneReponse) ? q.bonneReponse.join(' → ') : String(q.bonneReponse)}</p>
            <div className="mt-2 flex gap-2 text-sm font-bold">
              {s !== 'supprimee' && (
                <button type="button" onClick={() => onModifier(q)} className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-700">
                  {T.admin.modifier}
                </button>
              )}
              {s === 'supprimee' || s === 'modifiee' ? (
                <button type="button" onClick={() => restaurer(q.id)} className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-700">
                  {T.admin.restaurer}
                </button>
              ) : null}
              {s !== 'supprimee' && (
                <button type="button" onClick={() => window.confirm(T.admin.confirmerSuppression) && supprimer(q.id)} className="rounded-full bg-red-50 px-3 py-1 text-red-800 dark:bg-red-950 dark:text-red-200">
                  {T.admin.supprimer}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {visibles.length > limite && (
        <button type="button" onClick={() => setLimite((l) => l + 30)} className="w-full rounded-full bg-white py-3 font-bold shadow-sm dark:bg-slate-800">
          {T.admin.plus}
        </button>
      )}
    </section>
  );
}

function ListeSignalements({ onModifier }: { onModifier: (q: Question) => void }) {
  const { signalements, traiterSignalement, supprimerSignalement } = useAdmin();
  if (!signalements.length) return <p className="rounded-2xl bg-white p-6 text-center font-semibold shadow-sm dark:bg-slate-800">{T.admin.aucunSignalement}</p>;
  return (
    <ul className="space-y-2">
      {signalements.map((s) => {
        const locale = banqueLocale().find((q) => q.id === s.questionId);
        return (
          <li key={s.id} className={`rounded-2xl bg-white p-3 shadow-sm dark:bg-slate-800 ${s.traite ? 'opacity-60' : ''}`}>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
              {new Date(s.date).toLocaleString('fr-FR')} · {T.signalement.motifs[s.motif]} {s.traite && `· ✓ ${T.admin.traite}`}
            </p>
            <p className="mt-1 font-bold">{s.question.enonce}</p>
            <p className="text-sm text-emerald-800 dark:text-emerald-300">{Array.isArray(s.question.bonneReponse) ? s.question.bonneReponse.join(' → ') : String(s.question.bonneReponse)}</p>
            {s.commentaire && <p className="mt-1 text-sm italic">« {s.commentaire} »</p>}
            {!locale && <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{T.admin.questionGeneree.replace('{source}', s.question.source)}</p>}
            <div className="mt-2 flex flex-wrap gap-2 text-sm font-bold">
              {locale && (
                <button type="button" onClick={() => onModifier(locale)} className="rounded-full bg-violet-100 px-3 py-1 text-violet-900 dark:bg-violet-900 dark:text-violet-100">
                  {T.admin.modifierQuestion}
                </button>
              )}
              <button type="button" onClick={() => traiterSignalement(s.id, !s.traite)} className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-700">
                {s.traite ? T.admin.rouvrir : T.admin.marquerTraite}
              </button>
              <button type="button" onClick={() => supprimerSignalement(s.id)} className="rounded-full bg-red-50 px-3 py-1 text-red-800 dark:bg-red-950 dark:text-red-200">
                {T.admin.supprimerSignalement}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Echanges({ onMessage }: { onMessage: (m: string) => void }) {
  const admin = useAdmin();
  const [apercu, setApercu] = useState<ResultatImport | null>(null);
  const date = new Date().toISOString().slice(0, 10);

  const lireFichier = async (f: File) => {
    const texte = await f.text();
    setApercu(f.name.toLowerCase().endsWith('.csv') ? depuisCsv(texte) : depuisJson(texte));
  };

  return (
    <section className="space-y-4">
      <div className="space-y-3 rounded-3xl bg-white p-5 shadow-sm dark:bg-slate-800">
        <label className="block font-bold">
          {T.admin.importer}
          <input type="file" accept=".json,.csv,application/json,text/csv" onChange={(e) => e.target.files?.[0] && void lireFichier(e.target.files[0])} className="mt-2 block w-full text-sm" />
        </label>
        {apercu && (
          <div className="space-y-2">
            <p className="font-semibold">{T.admin.apercu(apercu.questions.length, apercu.erreurs.length)}</p>
            {apercu.erreurs.length > 0 && (
              <ul className="max-h-40 list-inside list-disc overflow-auto rounded-xl bg-red-50 p-2 text-xs text-red-900 dark:bg-red-950 dark:text-red-100">
                {apercu.erreurs.slice(0, 50).map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            )}
            {apercu.questions.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  const r = admin.importer(apercu.questions, new Set(banqueLocale().map((q) => q.id)));
                  onMessage(T.admin.importees(r.ajoutees, r.modifiees));
                  setApercu(null);
                }}
                className="rounded-full bg-violet-700 px-5 py-2 font-bold text-white"
              >
                {T.admin.confirmerImport}
              </button>
            )}
          </div>
        )}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={() => telecharger(`quizmania-banque-${date}.json`, JSON.stringify(Object.values(versFichiersBanque(banqueLocale())), null, 2), 'application/json')} className="rounded-2xl bg-white p-4 text-left font-bold shadow-sm dark:bg-slate-800">
          ⬇️ {T.admin.exporterJson}
        </button>
        <button type="button" onClick={() => telecharger(`quizmania-banque-${date}.csv`, versCsv(banqueLocale()), 'text/csv;charset=utf-8')} className="rounded-2xl bg-white p-4 text-left font-bold shadow-sm dark:bg-slate-800">
          ⬇️ {T.admin.exporterCsv}
        </button>
        <button
          type="button"
          onClick={() => telecharger(`quizmania-modifications-${date}.json`, JSON.stringify({ ajoutees: admin.ajoutees, modifiees: Object.values(admin.modifiees), supprimees: admin.supprimees }, null, 2), 'application/json')}
          className="rounded-2xl bg-white p-4 text-left font-bold shadow-sm dark:bg-slate-800"
        >
          ⬇️ {T.admin.exporterModifs}
        </button>
        <button type="button" onClick={() => window.confirm(T.admin.confirmerToutAnnuler) && admin.toutAnnuler()} className="rounded-2xl bg-red-50 p-4 text-left font-bold text-red-900 shadow-sm dark:bg-red-950 dark:text-red-100">
          ↩️ {T.admin.toutAnnuler}
        </button>
      </div>
    </section>
  );
}
