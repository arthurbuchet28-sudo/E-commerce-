import { lazy, Suspense } from 'react';
import { HashRouter, Link, MemoryRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { SqueletteQuestion } from '@/components/Squelette';
import { T } from '@/i18n/fr';
import { Accueil } from '@/pages/Accueil';
import { Partie } from '@/pages/Partie';
import { codeDepuisAncre } from '@/engine/salon';
import { SuiviSalon } from '@/components/SuiviSalon';

// Pages secondaires chargées à la demande (code séparé du chargement initial).
const charger = <K extends string>(importer: () => Promise<Record<K, React.ComponentType>>, nom: K) =>
  lazy(() => importer().then((m) => ({ default: m[nom] })));
const Configuration = charger(() => import('@/pages/Configuration'), 'Configuration');
const Resultats = charger(() => import('@/pages/Resultats'), 'Resultats');
const Profil = charger(() => import('@/pages/progression/Profil'), 'Profil');
const Badges = charger(() => import('@/pages/progression/Badges'), 'Badges');
const Statistiques = charger(() => import('@/pages/progression/Statistiques'), 'Statistiques');
const Historique = charger(() => import('@/pages/progression/Historique'), 'Historique');
const Classement = charger(() => import('@/pages/progression/Classement'), 'Classement');
const Salon = charger(() => import('@/pages/Salon'), 'Salon');
const Admin = charger(() => import('@/pages/admin/Admin'), 'Admin');

function Introuvable() {
  return (
    <div className="py-20 text-center">
      <p className="text-6xl" aria-hidden>
        🤔
      </p>
      <p className="mt-4 text-lg font-bold">{T.erreurs.pageIntrouvable}</p>
      <Link to="/" className="mt-4 inline-block font-bold text-violet-700 underline dark:text-violet-300">
        {T.erreurs.retourAccueil}
      </Link>
    </div>
  );
}

/** Routeur par ancre (#/…) ; en mémoire si VITE_ROUTEUR=memoire (hébergement intégré qui contrôle l'URL). */
const memoire = import.meta.env.VITE_ROUTEUR === 'memoire';

/** Lien d'invitation (#salon-K7QF) : on ouvre directement le salon. */
const codeInvitation = codeDepuisAncre(window.location.hash);
if (codeInvitation && !memoire) window.history.replaceState(null, '', `#/salon/${codeInvitation}`);

function Routeur({ children }: { children: React.ReactNode }) {
  return memoire ? (
    <MemoryRouter initialEntries={[codeInvitation ? `/salon/${codeInvitation}` : '/']}>{children}</MemoryRouter>
  ) : (
    <HashRouter>{children}</HashRouter>
  );
}

export function App() {
  return (
    <Routeur>
      <SuiviSalon />
      <Layout>
        <Suspense fallback={<SqueletteQuestion />}>
          <Routes>
            <Route path="/" element={<Accueil />} />
            <Route path="/jouer" element={<Navigate to="/jouer/classique" replace />} />
            <Route path="/jouer/:mode" element={<Configuration />} />
            <Route path="/partie" element={<Partie />} />
            <Route path="/resultats" element={<Resultats />} />
            <Route path="/profil" element={<Profil />} />
            <Route path="/badges" element={<Badges />} />
            <Route path="/statistiques" element={<Statistiques />} />
            <Route path="/historique" element={<Historique />} />
            <Route path="/classement" element={<Classement />} />
            <Route path="/salon" element={<Salon />} />
            <Route path="/salon/:code" element={<Salon />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Introuvable />} />
          </Routes>
        </Suspense>
      </Layout>
    </Routeur>
  );
}
