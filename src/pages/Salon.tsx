import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Avatar } from '@/components/Avatar';
import { QrCode } from '@/components/QrCode';
import { lienSalon, normaliserCode } from '@/engine/salon';
import { T } from '@/i18n/fr';
import { useMulti } from '@/store/multi';
import { useProfil } from '@/store/profil';

/** Adresse publique de l'application, pour le lien d'invitation (fixée au build quand la page est hébergée dans un cadre). */
export function adresseInvitation(code: string): string {
  return lienSalon(code, import.meta.env.VITE_URL_PARTAGE || window.location.href);
}

const champ = 'mt-1 block min-h-12 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 text-lg font-bold dark:border-slate-700 dark:bg-slate-800';
const boutonPrincipal =
  'w-full rounded-full bg-gradient-to-r from-violet-700 to-fuchsia-600 py-4 font-display text-xl font-extrabold text-white shadow-xl shadow-fuchsia-600/30 disabled:opacity-70';

function Message({ children, alerte = false }: { children: React.ReactNode; alerte?: boolean }) {
  return (
    <p role={alerte ? 'alert' : 'status'} className={`rounded-2xl p-4 font-semibold ${alerte ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200' : 'bg-white shadow-sm dark:bg-slate-800'}`}>
      {children}
    </p>
  );
}

/** Formulaire pour rejoindre : code (s'il n'est pas dans le lien) et pseudo. */
function Rejoindre({ codeLien }: { codeLien: string | null }) {
  const navigate = useNavigate();
  const { pseudo, modifier } = useProfil();
  const { rejoindre, statut } = useMulti();
  const [saisieCode, setSaisieCode] = useState(codeLien ?? '');
  const [nom, setNom] = useState(pseudo === 'Joueur' ? '' : pseudo);
  const [codeFaux, setCodeFaux] = useState(false);

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = normaliserCode(saisieCode);
    if (!code) return setCodeFaux(true);
    setCodeFaux(false);
    if (nom.trim()) modifier({ pseudo: nom.trim().slice(0, 24) });
    if (code !== codeLien) navigate(`/salon/${code}`, { replace: true });
    await rejoindre(code);
  };

  return (
    <form onSubmit={(e) => void envoyer(e)} className="space-y-5 rounded-3xl bg-white p-5 shadow-lg dark:bg-slate-800">
      <h1 className="font-display text-3xl font-extrabold">{codeLien ? T.multi.invitationTitre(codeLien) : T.multi.rejoindreTitre}</h1>
      {!codeLien && (
        <label className="block font-bold">
          {T.multi.codeSalon}
          <input
            value={saisieCode}
            onChange={(e) => setSaisieCode(e.target.value.toUpperCase())}
            maxLength={8}
            autoCapitalize="characters"
            autoComplete="off"
            className={`${champ} text-center font-display text-3xl tracking-[0.4em] uppercase`}
            aria-describedby="aide-code"
          />
          <span id="aide-code" className="mt-1 block text-sm font-semibold text-slate-600 dark:text-slate-400">
            {T.multi.rejoindreAide}
          </span>
        </label>
      )}
      {codeFaux && <Message alerte>{T.multi.codeInvalide}</Message>}
      <label className="block font-bold">
        {T.multi.tonPseudo}
        <input value={nom} onChange={(e) => setNom(e.target.value)} maxLength={24} autoComplete="nickname" placeholder="Joueur" className={champ} />
      </label>
      <button type="submit" disabled={statut === 'connexion'} className={boutonPrincipal}>
        {statut === 'connexion' ? T.multi.connexion : `${T.multi.rejoindre} 🎉`}
      </button>
    </form>
  );
}

function CopierLien({ lien }: { lien: string }) {
  const [copie, setCopie] = useState(false);
  const [echec, setEchec] = useState(false);
  const copier = async () => {
    try {
      await navigator.clipboard.writeText(lien);
      setCopie(true);
      window.setTimeout(() => setCopie(false), 2000);
    } catch {
      setEchec(true);
    }
  };
  if (echec) {
    return <input readOnly value={lien} aria-label={T.multi.copierLien} onFocus={(e) => e.currentTarget.select()} autoFocus className={`${champ} text-sm`} />;
  }
  return (
    <button type="button" onClick={() => void copier()} className="rounded-full bg-slate-100 px-4 py-2 font-bold dark:bg-slate-700" aria-live="polite">
      {copie ? `✅ ${T.multi.lienCopie}` : `🔗 ${T.multi.copierLien}`}
    </button>
  );
}

/** Salon d'attente : QR code, joueurs présents et bouton de lancement pour l'hôte. */
function SalonAttente({ code }: { code: string }) {
  const navigate = useNavigate();
  const { joueurs, hote, estHote, lancerManche, quitter } = useMulti();
  const lien = adresseInvitation(code);
  const quitterSalon = () => {
    quitter();
    navigate('/');
  };
  return (
    <div className="space-y-6">
      <section className="flex flex-col items-center gap-3 rounded-3xl bg-gradient-to-br from-cyan-300 to-sky-400 p-5 text-center text-slate-950 shadow-lg">
        <h1 className="font-display text-3xl font-extrabold">{T.multi.invitationTitre(code)}</h1>
        <QrCode texte={lien} titre={T.multi.qr(code)} taille={232} />
        <p className="font-display text-5xl font-extrabold tracking-[0.3em]" aria-label={`${T.multi.codeSalon} : ${code.split('').join(' ')}`}>
          {code}
        </p>
        <p className="max-w-sm text-sm font-semibold">{T.multi.invitationAide}</p>
        <CopierLien lien={lien} />
      </section>

      <section aria-labelledby="titre-joueurs" className="rounded-3xl bg-white p-4 shadow-md dark:bg-slate-800">
        <h2 id="titre-joueurs" className="font-display text-xl font-extrabold" aria-live="polite">
          {T.multi.joueursPresents(joueurs.length)}
        </h2>
        <ul className="mt-3 flex flex-wrap gap-3">
          <AnimatePresence>
            {joueurs.map((j) => (
              <motion.li
                key={j.id}
                layout
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.4, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                className={`flex w-24 flex-col items-center gap-1 rounded-2xl p-2 ${j.moi ? 'bg-violet-100 dark:bg-violet-950' : 'bg-slate-50 dark:bg-slate-900'}`}
              >
                <Avatar avatar={j.avatar} taille={52} />
                <span className="w-full truncate text-center font-bold">{j.pseudo}</span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {[j.hote && `👑 ${T.multi.hote}`, j.moi && T.multi.toi].filter(Boolean).join(' · ') || ' '}
                </span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </section>

      {estHote ? (
        <div className="sticky bottom-4 space-y-2">
          <motion.button type="button" onClick={lancerManche} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`${boutonPrincipal} py-5 text-2xl`}>
            {T.multi.lancer}
          </motion.button>
          <p className="text-center text-sm font-semibold text-slate-600 dark:text-slate-400">{T.multi.lancerAide}</p>
        </div>
      ) : hote ? (
        <Message>
          <span className="mr-2 inline-block animate-pulse" aria-hidden>
            ⏳
          </span>
          {T.multi.attenteHote(hote.pseudo)}
        </Message>
      ) : (
        <Message>{T.multi.hoteAbsent}</Message>
      )}

      <div className="text-center">
        <button type="button" onClick={quitterSalon} className="text-sm font-semibold text-slate-600 underline-offset-4 hover:underline dark:text-slate-400">
          {T.multi.quitter}
        </button>
      </div>
    </div>
  );
}

export function Salon() {
  const { code: param } = useParams();
  const codeLien = param ? normaliserCode(param) : null;
  const { statut, code } = useMulti();

  if (statut === 'indisponible') {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl font-extrabold">{T.multi.titre}</h1>
        <Message alerte>{T.multi.indisponible}</Message>
        {import.meta.env.VITE_LIEN_MULTI && (
          <a href={import.meta.env.VITE_LIEN_MULTI} className="block rounded-full bg-cyan-300 px-6 py-4 text-center font-display text-xl font-extrabold text-slate-950 shadow-lg">
            📱 {T.multi.ouvrirVersionAmis}
          </a>
        )}
        <Link to="/" className="inline-block font-bold text-violet-700 underline dark:text-violet-300">
          {T.erreurs.retourAccueil}
        </Link>
      </div>
    );
  }
  if (codeLien && code === codeLien && statut === 'connecte') return <SalonAttente code={codeLien} />;
  return (
    <div className="space-y-4">
      {statut === 'erreur' && <Message alerte>{T.multi.erreur}</Message>}
      <Rejoindre key={codeLien ?? ''} codeLien={codeLien} />
    </div>
  );
}
