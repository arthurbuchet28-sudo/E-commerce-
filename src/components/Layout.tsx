import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { MODULES } from '../content';
import { useProgress } from '../lib/progress';

function NavItem({ to, children, end }: { to: string; children: ReactNode; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${isActive ? 'bg-emerald-700/40 text-emerald-200' : 'text-slate-300 hover:bg-slate-800'}`
      }
    >
      {children}
    </NavLink>
  );
}

function Sidebar() {
  const { isUnlocked, isPassed } = useProgress();
  return (
    <nav className="space-y-1" aria-label="Navigation principale">
      <NavItem to="/" end>🏠 Tableau de bord</NavItem>
      <div className="px-3 pt-4 pb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">Modules</div>
      {MODULES.map((m) => {
        const unlocked = isUnlocked(m.id);
        const passed = isPassed(m.id);
        return (
          <NavItem key={m.id} to={`/module/${m.id}`}>
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${passed ? 'bg-emerald-600 text-white' : unlocked ? 'bg-slate-700 text-slate-200' : 'bg-slate-800 text-slate-500'}`}>
              {passed ? '✓' : unlocked ? m.id : '🔒'}
            </span>
            <span className={unlocked ? '' : 'text-slate-500'}>{m.title}</span>
          </NavItem>
        );
      })}
      <div className="px-3 pt-4 pb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">Pratique</div>
      <NavItem to="/exercices">🎯 Exercices</NavItem>
      <NavItem to="/simulateur">🃏 Simulateur de table</NavItem>
      <NavItem to="/aide-memoire">📋 Aide-mémoire</NavItem>
    </nav>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur lg:hidden">
        <NavLink to="/" className="font-display text-lg font-bold text-emerald-300">
          ♠ Compteur Pro
        </NavLink>
        <button className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="menu-mobile">
          {open ? 'Fermer' : 'Menu'}
        </button>
      </header>
      {open && (
        <div id="menu-mobile" className="fixed inset-0 top-[57px] z-20 overflow-y-auto bg-slate-950 p-4 lg:hidden">
          <Sidebar />
        </div>
      )}
      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 overflow-y-auto border-r border-slate-800 p-4 lg:block">
          <NavLink to="/" className="mb-4 block px-3 font-display text-xl font-bold text-emerald-300">
            ♠ Compteur Pro
            <span className="block font-sans text-xs font-normal text-slate-500">Formation au comptage de cartes</span>
          </NavLink>
          <Sidebar />
        </aside>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, kicker }: { title: string; subtitle?: string; kicker?: string }) {
  return (
    <header className="mb-6">
      {kicker && <div className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">{kicker}</div>}
      <h1 className="font-display text-2xl font-bold text-slate-50 sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-slate-400">{subtitle}</p>}
    </header>
  );
}
