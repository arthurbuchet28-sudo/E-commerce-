import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
// Applique les modifications de l'espace admin à la banque locale dès le démarrage.
import './store/admin';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
