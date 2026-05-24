import { Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Proposals from './pages/Proposals';
import Setup from './pages/Setup';
import Confirm from './pages/Confirm';

function Nav() {
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
    </nav>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
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
