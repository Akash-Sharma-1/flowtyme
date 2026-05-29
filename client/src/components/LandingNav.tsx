import { Link } from 'react-router-dom';
import type { Theme } from '../hooks/useTheme';
import { appEntryHref, isExternalAppEntry } from '../lib/base-path';
import ThemeToggle from './ThemeToggle';

function BrandMark({ size = 32 }: { size?: number }) {
  const icon = Math.round(size * 0.56);
  return (
    <span className="landing-brand-mark" style={{ width: size, height: size }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={icon}
        height={icon}
        fill="none"
        viewBox="0 0 48 46"
        className="landing-brand-bolt"
        aria-hidden
      >
        <path
          fill="#863bff"
          d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"
        />
      </svg>
      <svg viewBox="0 0 32 32" width={size} height={size} fill="none" className="landing-brand-ring" aria-hidden>
        <circle cx="16" cy="16" r="13" stroke="rgba(124,106,247,0.2)" strokeWidth="1.2" />
        <circle
          cx="16"
          cy="16"
          r="13"
          stroke="#7c6af7"
          strokeWidth="1.8"
          fill="none"
          strokeDasharray="61.26 81.68"
          strokeLinecap="round"
          transform="rotate(-90 16 16)"
          opacity="0.8"
        />
      </svg>
    </span>
  );
}

function AppEntryCta({ className }: { className: string }) {
  const href = appEntryHref();
  const label = isExternalAppEntry(href) ? 'Get started' : 'Log in';
  if (isExternalAppEntry(href)) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    );
  }
  return (
    <Link to={href} className={className}>
      {label}
    </Link>
  );
}

const NAV_LINKS = [
  { href: '#integrations', label: 'Integrations' },
  { href: '#architecture', label: 'Architecture' },
  { href: '#flow', label: 'How it works' },
] as const;

export default function LandingNav({
  theme,
  onToggleTheme,
}: {
  theme: Theme;
  onToggleTheme: () => void;
}) {
  return (
    <header className="landing-nav-shell">
      <nav className="landing-nav-float" aria-label="Main">
        <Link to="/" className="landing-brand">
          <BrandMark size={34} />
          <span className="landing-brand-wordmark">
            <span className="landing-brand-flow">Flow</span>
            <span className="landing-brand-tyme">Tyme</span>
          </span>
        </Link>

        <div className="landing-nav-pill">
          {NAV_LINKS.map(({ href, label }) => (
            <a key={href} href={href} className="landing-nav-link">
              {label}
            </a>
          ))}
        </div>

        <div className="landing-nav-actions">
          <a
            href="https://github.com/Akash-Sharma-1/flowtyme"
            target="_blank"
            rel="noopener noreferrer"
            className="landing-nav-icon-btn"
            aria-label="GitHub repository"
          >
            <svg height="18" width="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} className="landing-nav-theme-btn" />
          <AppEntryCta className="landing-nav-cta" />
        </div>
      </nav>
    </header>
  );
}
