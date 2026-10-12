import { useState } from 'react';
import { LISTE_CATEGORIES_JEU } from '@/config/categories';
import { validerQuestion } from '@/engine/validation';
import { T } from '@/i18n/fr';
import { CATEGORIES, type Categorie, type NiveauQuestion, type Question, type TypeQuestion } from '@/types/question';

const TYPES: TypeQuestion[] = ['qcm', 'vrai_faux', 'saisie', 'image', 'audio', 'chronologie', 'estimation'];
const lignes = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean);
const nombreOuVide = (s: string) => (s.trim() === '' ? undefined : Number(s.replace(',', '.')));

const CHAMP = 'mt-1 block w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900';

function Champ({ libelle, children }: { libelle: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="font-bold">{libelle}</span>
      {children}
    </label>
  );
}

/** Formulaire d'ajout / de modification d'une question de la banque locale (validé avant enregistrement). */
export function FormulaireQuestion({ initiale, onEnregistrer, onAnnuler }: { initiale: Question | null; onEnregistrer: (q: Question) => void; onAnnuler: () => void }) {
  const q0 = initiale;
  const [id] = useState(q0?.id ?? `adm-${Date.now().toString(36)}`);
  const [categorie, setCategorie] = useState<Categorie>(q0?.categorie ?? 'culture_generale');
  const [type, setType] = useState<TypeQuestion>(q0?.type ?? 'qcm');
  const [difficulte, setDifficulte] = useState<NiveauQuestion>(q0?.difficulte ?? 1);
  const [enonce, setEnonce] = useState(q0?.enonce ?? '');
  const bonneInitiale = Array.isArray(q0?.bonneReponse) ? '' : String(q0?.bonneReponse ?? '');
  const [bonne, setBonne] = useState(bonneInitiale);
  const [mauvaises, setMauvaises] = useState((q0?.choix ?? []).filter((c) => c !== bonneInitiale).join('\n'));
  const [acceptees, setAcceptees] = useState((q0?.reponsesAcceptees ?? []).join('\n'));
  const [ordre, setOrdre] = useState(Array.isArray(q0?.bonneReponse) ? q0.bonneReponse.join('\n') : '');
  const [marge, setMarge] = useState(String(q0?.estimation?.marge ?? ''));
  const [unite, setUnite] = useState(q0?.estimation?.unite ?? '');
  const [min, setMin] = useState(q0?.estimation?.min !== undefined ? String(q0.estimation.min) : '');
  const [max, setMax] = useState(q0?.estimation?.max !== undefined ? String(q0.estimation.max) : '');
  const [image, setImage] = useState(q0?.media?.image ?? '');
  const [alt, setAlt] = useState(q0?.media?.alt ?? '');
  const [credit, setCredit] = useState(q0?.media?.credit ?? '');
  const [audio, setAudio] = useState(q0?.media?.audio ?? '');
  const [anecdote, setAnecdote] = useState(q0?.anecdote ?? '');
  const [erreurs, setErreurs] = useState<string[]>([]);

  const construire = (): Question => {
    const q: Question = { id, source: q0?.source ?? 'local', categorie, type, difficulte, enonce: enonce.trim(), bonneReponse: bonne.trim(), anecdote: anecdote.trim() || undefined };
    if (type === 'qcm' || type === 'image' || type === 'audio') q.choix = [bonne.trim(), ...lignes(mauvaises)];
    if (type === 'vrai_faux') q.choix = ['Vrai', 'Faux'];
    if ((type === 'qcm' || type === 'saisie') && lignes(acceptees).length) q.reponsesAcceptees = lignes(acceptees);
    if (type === 'chronologie') q.bonneReponse = lignes(ordre);
    if (type === 'estimation') {
      q.bonneReponse = Number(bonne.replace(',', '.'));
      q.estimation = { marge: Number(marge.replace(',', '.')) };
      if (unite.trim()) q.estimation.unite = unite.trim();
      const a = nombreOuVide(min);
      const b = nombreOuVide(max);
      if (a !== undefined && b !== undefined) Object.assign(q.estimation, { min: a, max: b });
    }
    if (type === 'image') q.media = { image: image.trim(), alt: alt.trim(), credit: credit.trim() || undefined };
    if (type === 'audio') q.media = { audio: audio.trim(), credit: credit.trim() || undefined };
    return q;
  };

  return (
    <form
      className="space-y-4 rounded-3xl bg-white p-5 shadow-md dark:bg-slate-800"
      onSubmit={(e) => {
        e.preventDefault();
        const q = construire();
        const e2 = validerQuestion(q, CATEGORIES.includes(categorie) ? categorie : undefined);
        setErreurs(e2);
        if (!e2.length) onEnregistrer(q);
      }}
    >
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
        {T.admin.champs.id} : <code>{id}</code>
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <Champ libelle={T.admin.champs.categorie}>
          <select value={categorie} onChange={(e) => setCategorie(e.target.value as Categorie)} className={CHAMP}>
            {LISTE_CATEGORIES_JEU.filter((c) => c.id !== 'mix').map((c) => (
              <option key={c.id} value={c.id}>
                {c.icone} {c.nom}
              </option>
            ))}
          </select>
        </Champ>
        <Champ libelle={T.admin.champs.type}>
          <select value={type} onChange={(e) => setType(e.target.value as TypeQuestion)} className={CHAMP}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {T.admin.types[t]}
              </option>
            ))}
          </select>
        </Champ>
        <Champ libelle={T.admin.champs.difficulte}>
          <select value={difficulte} onChange={(e) => setDifficulte(Number(e.target.value) as NiveauQuestion)} className={CHAMP}>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </Champ>
      </div>
      <Champ libelle={T.admin.champs.enonce}>
        <textarea value={enonce} onChange={(e) => setEnonce(e.target.value)} rows={2} className={CHAMP} required />
      </Champ>

      {type === 'vrai_faux' ? (
        <Champ libelle={T.admin.champs.vraiFaux}>
          <select value={bonne || 'Vrai'} onChange={(e) => setBonne(e.target.value)} className={CHAMP}>
            <option>Vrai</option>
            <option>Faux</option>
          </select>
        </Champ>
      ) : type === 'chronologie' ? (
        <Champ libelle={T.admin.champs.ordre}>
          <textarea value={ordre} onChange={(e) => setOrdre(e.target.value)} rows={5} className={CHAMP} />
        </Champ>
      ) : (
        <Champ libelle={type === 'estimation' ? T.admin.champs.valeur : T.admin.champs.bonne}>
          <input value={bonne} onChange={(e) => setBonne(e.target.value)} inputMode={type === 'estimation' ? 'decimal' : undefined} className={CHAMP} />
        </Champ>
      )}

      {(type === 'qcm' || type === 'image' || type === 'audio') && (
        <Champ libelle={T.admin.champs.choix}>
          <textarea value={mauvaises} onChange={(e) => setMauvaises(e.target.value)} rows={5} className={CHAMP} />
        </Champ>
      )}
      {(type === 'qcm' || type === 'saisie') && (
        <Champ libelle={T.admin.champs.acceptees}>
          <textarea value={acceptees} onChange={(e) => setAcceptees(e.target.value)} rows={2} className={CHAMP} />
        </Champ>
      )}
      {type === 'estimation' && (
        <div className="grid gap-3 sm:grid-cols-4">
          <Champ libelle={T.admin.champs.marge}>
            <input value={marge} onChange={(e) => setMarge(e.target.value)} inputMode="decimal" className={CHAMP} />
          </Champ>
          <Champ libelle={T.admin.champs.unite}>
            <input value={unite} onChange={(e) => setUnite(e.target.value)} className={CHAMP} />
          </Champ>
          <Champ libelle={T.admin.champs.min}>
            <input value={min} onChange={(e) => setMin(e.target.value)} inputMode="decimal" className={CHAMP} />
          </Champ>
          <Champ libelle={T.admin.champs.max}>
            <input value={max} onChange={(e) => setMax(e.target.value)} inputMode="decimal" className={CHAMP} />
          </Champ>
        </div>
      )}
      {type === 'image' && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Champ libelle={T.admin.champs.image}>
            <input value={image} onChange={(e) => setImage(e.target.value)} type="url" className={CHAMP} />
          </Champ>
          <Champ libelle={T.admin.champs.alt}>
            <input value={alt} onChange={(e) => setAlt(e.target.value)} className={CHAMP} />
          </Champ>
          <Champ libelle={T.admin.champs.credit}>
            <input value={credit} onChange={(e) => setCredit(e.target.value)} className={CHAMP} />
          </Champ>
        </div>
      )}
      {type === 'audio' && (
        <Champ libelle="URL de l’extrait audio">
          <input value={audio} onChange={(e) => setAudio(e.target.value)} type="url" className={CHAMP} />
        </Champ>
      )}
      <Champ libelle={T.admin.champs.anecdote}>
        <textarea value={anecdote} onChange={(e) => setAnecdote(e.target.value)} rows={2} className={CHAMP} />
      </Champ>

      {erreurs.length > 0 && (
        <div role="alert" className="rounded-2xl bg-red-50 p-3 text-sm text-red-900 dark:bg-red-950 dark:text-red-100">
          <p className="font-bold">{T.admin.erreurs}</p>
          <ul className="list-inside list-disc">
            {erreurs.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex gap-2">
        <button type="submit" className="rounded-full bg-violet-700 px-6 py-3 font-bold text-white">
          {T.admin.enregistrer}
        </button>
        <button type="button" onClick={onAnnuler} className="rounded-full px-6 py-3 font-bold">
          {T.admin.annuler}
        </button>
      </div>
    </form>
  );
}
