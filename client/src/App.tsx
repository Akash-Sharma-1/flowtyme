import { useEffect, useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Proposals from './pages/Proposals';
import Setup from './pages/Setup';
import Confirm from './pages/Confirm';

type Theme = 'light' | 'dark';

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

function Nav({ theme, onToggleTheme }: { theme: Theme; onToggleTheme: () => void }) {
  const base = 'px-4 py-2 rounded-lg text-sm font-medium transition-colors';
  const active = 'bg-[var(--color-accent)] text-white';
  const inactive = 'text-[var(--color-muted)] hover:text-[var(--color-text)]';

  return (
    <nav className="flex items-center gap-1 px-6 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <span className="text-[var(--color-accent)] font-bold text-lg mr-6">FlowTyme</span>
      {[
        { to: '/', label: 'Dashboard' },
        { to: '/proposals', label: 'Proposals' },
        { to: '/confirm', label: 'Confirm' },
        { to: '/setup', label: 'Setup' },
      ].map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
        >
          {label}
        </NavLink>
      ))}

      <div className="flex-1" />
      <button
        type="button"
        onClick={onToggleTheme}
        className="px-3 py-2 rounded-lg text-sm font-medium border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] hover:border-[var(--color-accent)] transition-colors"
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? 'Light mode' : 'Dark mode'}
      </button>
    </nav>
  );
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('flowtyme.theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('flowtyme.theme', theme);
  }, [theme]);

  return (
    <div className="min-h-screen flex flex-col">
      <Nav theme={theme} onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} />
      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/proposals" element={<Proposals />} />
          <Route path="/confirm" element={<Confirm />} />
          <Route path="/setup" element={<Setup />} />
        </Routes>
      </main>
    </div>
  );
}
