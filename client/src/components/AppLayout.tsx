import { Link, NavLink, Outlet } from 'react-router-dom';
import type { Theme } from '../hooks/useTheme';
import ThemeToggle from './ThemeToggle';

export default function AppLayout({
  theme,
  onToggleTheme,
}: {
  theme: Theme;
  onToggleTheme: () => void;
}) {
  const base = 'px-4 py-2 rounded-lg text-sm font-medium transition-colors';
  const active = 'bg-[var(--color-accent)] text-white';
  const inactive = 'text-[var(--color-muted)] hover:text-[var(--color-text)]';

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <nav className="flex items-center gap-1 px-6 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <Link
          to="/"
          className="flex items-center gap-2 mr-6 hover:opacity-80 transition-opacity"
          style={{ textDecoration: 'none' }}
        >
          {/* Bolt + time ring icon */}
          <div style={{ position: 'relative', width: 32, height: 32, flexShrink: 0 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="17" fill="none" viewBox="0 0 48 46"
              style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
              <path fill="#863bff" d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"/>
            </svg>
            {/* Time ring: r=13, C=81.68, 75%=61.26 */}
            <svg viewBox="0 0 32 32" width="32" height="32" fill="none"
              style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
              <circle cx="16" cy="16" r="13" stroke="rgba(124,106,247,0.18)" strokeWidth="1.2" fill="none"/>
              <circle cx="16" cy="16" r="13"
                stroke="#7c6af7" strokeWidth="1.8" fill="none"
                strokeDasharray="61.26 81.68" strokeLinecap="round"
                transform="rotate(-90 16 16)" opacity="0.75"/>
            </svg>
          </div>
          {/* Wordmark */}
          <span><span style={{ fontFamily: 'Inter, sans-serif', fontSize: 17, fontWeight: 200, color: 'var(--color-text)', letterSpacing: '-0.3px' }}>Flow</span><span style={{ fontFamily: 'Inter, sans-serif', fontSize: 17, fontWeight: 800, color: 'var(--color-accent)', letterSpacing: '-0.8px' }}>Tyme</span></span>
        </Link>
        {[
          { to: '/dashboard', label: 'Dashboard' },
          { to: '/proposals', label: 'Proposals' },
          { to: '/confirm', label: 'Confirm' },
          { to: '/setup', label: 'Setup' },
        ].map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
          >
            {label}
          </NavLink>
        ))}

        <div className="flex-1" />
        <ThemeToggle
          theme={theme}
          onToggle={onToggleTheme}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] hover:border-[var(--color-accent)] transition-colors"
        />
      </nav>
      <main className="flex-1 p-6 flex flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
