import { HashRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { T } from '@/i18n/fr';
import { Accueil } from '@/pages/Accueil';
import { Configuration } from '@/pages/Configuration';
import { Partie } from '@/pages/Partie';
import { Resultats } from '@/pages/Resultats';
import { Badges } from '@/pages/progression/Badges';
import { Classement } from '@/pages/progression/Classement';
import { Historique } from '@/pages/progression/Historique';
import { Profil } from '@/pages/progression/Profil';
import { Statistiques } from '@/pages/progression/Statistiques';

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

export function App() {
  return (
    <HashRouter>
      <Layout>
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
          <Route path="*" element={<Introuvable />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
