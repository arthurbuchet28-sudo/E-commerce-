import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProgressProvider } from './lib/progress';
import { Dashboard } from './pages/Dashboard';
import { MODULE_PAGES } from './pages/modules';
import { ExercisesPage } from './pages/ExercisesPage';
import { FlashCardsPage } from './pages/exercises/FlashCardsPage';
import { CardStreamPage } from './pages/exercises/CardStreamPage';
import { DeckCountdownPage } from './pages/exercises/DeckCountdownPage';
import { GroupsPage } from './pages/exercises/GroupsPage';
import { TrueCountPage } from './pages/exercises/TrueCountPage';
import { DiscardPage } from './pages/exercises/DiscardPage';
import { DeviationQuizPage } from './pages/exercises/DeviationQuizPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { CheatSheetPage } from './pages/CheatSheetPage';

export function App() {
  return (
    <ProgressProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            {MODULE_PAGES.map(({ id, Page }) => (
              <Route key={id} path={`/module/${id}`} element={<Page />} />
            ))}
            <Route path="/exercices" element={<ExercisesPage />} />
            <Route path="/exercices/flash-cards" element={<FlashCardsPage />} />
            <Route path="/exercices/defile" element={<CardStreamPage />} />
            <Route path="/exercices/jeu-complet" element={<DeckCountdownPage />} />
            <Route path="/exercices/groupes" element={<GroupsPage />} />
            <Route path="/exercices/true-count" element={<TrueCountPage />} />
            <Route path="/exercices/defausse" element={<DiscardPage />} />
            <Route path="/exercices/deviations" element={<DeviationQuizPage />} />
            <Route path="/simulateur" element={<SimulatorPage />} />
            <Route path="/aide-memoire" element={<CheatSheetPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </ProgressProvider>
  );
}
