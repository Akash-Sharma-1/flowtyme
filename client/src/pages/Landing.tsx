import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import IntegrationHub from '../components/IntegrationHub';
import type { Theme } from '../hooks/useTheme';
import { appEntryHref, isExternalAppEntry } from '../lib/base-path';
import '../landing.css';

function AppEntryLink({
  className,
  style,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const href = appEntryHref();
  if (isExternalAppEntry(href)) {
    return (
      <a href={href} className={className} style={style} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link to={href} className={className} style={style}>
      {children}
    </Link>
  );
}

export default function Landing({
  theme,
  onToggleTheme,
}: {
  theme: Theme;
  onToggleTheme: () => void;
}) {
  return (
    <div className="landing-page">
      <div className="landing-grid-bg" aria-hidden />
      <div className="landing-glow landing-glow-1" aria-hidden />
      <div className="landing-glow landing-glow-2" aria-hidden />
      <div className="landing-glow landing-glow-3" aria-hidden />

      <div className="landing-inner">
        <header className="landing-nav">
          {/* Bolt + ring icon + wordmark */}
          <div className="landing-logo" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', backgroundImage: 'none', textDecoration: 'none' }}>
            <div style={{ position: 'relative', width: 32, height: 32, flexShrink: 0 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="17" fill="none" viewBox="0 0 48 46"
                style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', filter: 'drop-shadow(0 0 4px rgba(134,59,255,0.5))' }}>
                <path fill="#863bff" d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"/>
              </svg>
              <svg viewBox="0 0 32 32" width="32" height="32" fill="none"
                style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
                <circle cx="16" cy="16" r="13" stroke="rgba(124,106,247,0.18)" strokeWidth="1.2" fill="none"/>
                <circle cx="16" cy="16" r="13" stroke="#7c6af7" strokeWidth="1.8" fill="none"
                  strokeDasharray="61.26 81.68" strokeLinecap="round" transform="rotate(-90 16 16)" opacity="0.75"/>
              </svg>
            </div>
            <span><span style={{ fontWeight: 200, fontSize: 17, letterSpacing: '-0.3px', color: 'var(--landing-text)', WebkitTextFillColor: 'var(--landing-text)', backgroundImage: 'none', WebkitBackgroundClip: 'unset', backgroundClip: 'unset' }}>Flow</span><span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.8px', color: '#7c6af7', WebkitTextFillColor: '#7c6af7', backgroundImage: 'none', WebkitBackgroundClip: 'unset', backgroundClip: 'unset' }}>Tyme</span></span>
          </div>
          <a href="#integrations" className="landing-nav-link">
            Integrations
          </a>
          <a href="#architecture" className="landing-nav-link">
            Architecture
          </a>
          <a href="#flow" className="landing-nav-link">
            How it works
          </a>
          <a
            href="https://github.com/Akash-Sharma-1/flowtyme"
            target="_blank"
            rel="noopener noreferrer"
            className="landing-nav-link"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            GitHub
          </a>
          <button type="button" className="landing-btn-ghost" onClick={onToggleTheme}>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <AppEntryLink className="landing-btn-primary">Log in →</AppEntryLink>
        </header>

        <section className="landing-hero">
          {/* Hero bolt + time ring mark */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <div style={{ position: 'relative', width: 88, height: 88 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="52" height="50" fill="none" viewBox="0 0 48 46"
                style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', filter: 'drop-shadow(0 0 18px rgba(134,59,255,0.55))' }}>
                <path fill="#863bff" d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"/>
              </svg>
              {/* ring: r=40, C=251.33, 75%=188.50 */}
              <svg viewBox="0 0 88 88" width="88" height="88" fill="none"
                style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
                <circle cx="44" cy="44" r="40" stroke="rgba(124,106,247,0.18)" strokeWidth="1.5" fill="none"/>
                <line x1="44" y1="4" x2="44" y2="10" stroke="rgba(124,106,247,0.45)" strokeWidth="1.5"/>
                <line x1="44" y1="4" x2="44" y2="10" stroke="rgba(124,106,247,0.45)" strokeWidth="1.5" transform="rotate(90 44 44)"/>
                <line x1="44" y1="4" x2="44" y2="10" stroke="rgba(124,106,247,0.45)" strokeWidth="1.5" transform="rotate(180 44 44)"/>
                <line x1="44" y1="4" x2="44" y2="10" stroke="rgba(124,106,247,0.45)" strokeWidth="1.5" transform="rotate(270 44 44)"/>
                <circle cx="44" cy="44" r="40" stroke="#7c6af7" strokeWidth="2.5" fill="none"
                  strokeDasharray="188.50 251.33" strokeLinecap="round"
                  transform="rotate(-90 44 44)" opacity="0.65"/>
                <circle cx="4" cy="44" r="3" fill="#7c6af7" opacity="0.75"/>
              </svg>
            </div>
          </div>
          <div className="landing-badge">
            <span className="landing-badge-dot" />
            Plugin-based · Open source
          </div>
          <h1 className="landing-title">
            Your day,
            <br />
            <span>automatically structured</span>
          </h1>
          <p className="landing-sub">
            Connect any task source, any calendar. FlowTyme finds your free slots and proposes a
            time-blocked schedule — you drag, confirm, push.
          </p>
          <div className="landing-hero-cta">
            <AppEntryLink className="landing-btn-primary">Open dashboard</AppEntryLink>
            <a href="#architecture" className="landing-btn-ghost" style={{ padding: '10px 20px' }}>
              See how it works
            </a>
          </div>
          <p className="landing-mono">Notion · Obsidian · iCloud · Google Calendar · Outlook</p>
        </section>

        <div className="landing-stats">
          <div className="landing-stat">
            <div className="landing-stat-num purple">15min</div>
            <div className="landing-stat-label">slot grid resolution</div>
          </div>
          <div className="landing-stat">
            <div className="landing-stat-num cyan">3</div>
            <div className="landing-stat-label">plugin layers</div>
          </div>
          <div className="landing-stat">
            <div className="landing-stat-num emerald">0</div>
            <div className="landing-stat-label">code changes to swap sources</div>
          </div>
          <div className="landing-stat">
            <div className="landing-stat-num">1-click</div>
            <div className="landing-stat-label">push entire day to calendar</div>
          </div>
        </div>

        <section id="integrations" className="landing-section">
          <p className="landing-section-label">Integrations</p>
          <p
            style={{
              textAlign: 'center',
              color: 'var(--landing-dim)',
              maxWidth: 520,
              margin: '0 auto 28px',
              lineHeight: 1.6,
            }}
          >
            Tasks flow in from anywhere you work. Accepted proposals flow out to the calendars you
            already use.
          </p>
          <IntegrationHub />
        </section>

        <section id="architecture" className="landing-section">
          <p className="landing-section-label">Architecture</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, alignItems: 'stretch' }}>
            <div className="landing-layer landing-layer-source">
              <div className="landing-layer-tag">
                <span className="landing-pill landing-pill-purple">Layer 1</span>
                Source plugins
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Any task source, zero lock-in</h3>
              <p style={{ fontSize: 12, color: 'var(--landing-muted)', marginBottom: 16 }}>
                <code style={{ color: 'var(--color-accent)', fontSize: 11 }}>fetchItems(date) → SourceItem[]</code>
                . Enable multiple — tasks merge before scheduling.
              </p>
              <div className="landing-plugin-grid">
                <PluginCard icon="📓" name="Notion" meta="3-col daily page parser" badge="● Live" active />
                <PluginCard icon="🗒️" name="Obsidian" meta="Daily note vault" badge="◌ Soon" muted />
                <PluginCard icon="＋" name="Any source" meta="via /generate-parser" badge="✦ AI-gen" muted dashed />
              </div>
            </div>

            <div className="landing-connector">
              <div className="landing-connector-line" />
              <span className="landing-connector-label">SourceItem[]</span>
              <span style={{ color: '#6366f1', fontSize: 14 }}>▼</span>
            </div>

            <div className="landing-layer landing-layer-engine">
              <div className="landing-layer-tag">
                <span className="landing-pill landing-pill-indigo">Layer 3</span>
                Core engine
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
                Slot assignment + conflict resolution
              </h3>
              <p style={{ fontSize: 12, color: 'var(--landing-muted)', marginBottom: 16 }}>
                Reads your calendar, finds free slots on a 15-min grid, respects day partitions.
                Conflicts surfaced to UI — never auto-resolved.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['⚡ 15-min grid', '🔀 Day partitions', '⚠️ Conflict flags', '⏱️ Per-category duration', '🔁 Multi-source merge'].map(
                  (chip) => (
                    <span
                      key={chip}
                      style={{
                        fontSize: 10,
                        padding: '4px 10px',
                        borderRadius: 6,
                        background: 'rgba(99,102,241,0.1)',
                        color: '#818cf8',
                        border: '1px solid rgba(99,102,241,0.15)',
                      }}
                    >
                      {chip}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="landing-connector">
              <div className="landing-connector-line" />
              <span className="landing-connector-label">ProposalItem[]</span>
              <span style={{ color: '#6366f1', fontSize: 14 }}>▼</span>
            </div>

            <div className="landing-layer landing-layer-calendar">
              <div className="landing-layer-tag">
                <span className="landing-pill landing-pill-cyan">Layer 2</span>
                Calendar plugins
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Push to any calendar backend</h3>
              <p style={{ fontSize: 12, color: 'var(--landing-muted)', marginBottom: 16 }}>
                Swap backends via <code style={{ fontSize: 11 }}>plugins.yaml</code> — no code changes.
              </p>
              <div className="landing-plugin-grid">
                <PluginCard icon="☁️" name="iCloud" meta="CalDAV · VEVENT + VTODO" badge="● Live" active cyan />
                <PluginCard icon="📅" name="Google Calendar" meta="OAuth2 · Calendar API" badge="◌ Roadmap" muted />
                <PluginCard icon="📧" name="Outlook" meta="Microsoft Graph API" badge="◌ Roadmap" muted />
              </div>
            </div>
          </div>
        </section>

        <section id="flow" className="landing-section">
          <p className="landing-section-label">Daily flow</p>
          <div className="landing-journey">
            {[
              { n: '01', icon: '⚙️', title: 'Setup', desc: 'Map categories to calendars. Set day partition times once.', items: ['Category → Calendar', 'Morning / Afternoon / Evening', 'Duration overrides'] },
              { n: '02', icon: 'bolt', title: 'Generate', desc: 'Pick a date. One click fetches tasks + reads your calendar.', items: ['Reads all enabled sources', 'Checks live calendar', 'Assigns free slots'] },
              { n: '03', icon: '🗓️', title: 'Review', desc: 'Day-view calendar. Drag blocks, toggle accept/reject.', items: ['Drag-and-drop timeline', 'Conflicts in red', 'Per-item accept/reject'] },
              { n: '04', icon: '🚀', title: 'Push', desc: 'One button pushes accepted blocks to iCloud.', items: ['VEVENT calendar blocks', 'VTODO reminders', 'Active plugin handles push'] },
            ].map((step) => (
              <div key={step.n} className="landing-journey-card">
                <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--landing-muted)', marginBottom: 12 }}>
                  {step.n}
                </div>
                {step.icon === 'bolt' ? (
                  <div style={{ marginBottom: 12 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="27" fill="none" viewBox="0 0 48 46"
                      style={{ filter: 'drop-shadow(0 0 6px rgba(134,59,255,0.6))' }}>
                      <path fill="#863bff" d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"/>
                    </svg>
                  </div>
                ) : (
                  <span style={{ fontSize: 28, display: 'block', marginBottom: 12 }}>{step.icon}</span>
                )}
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{step.title}</div>
                <div style={{ fontSize: 12, color: 'var(--landing-muted)', lineHeight: 1.55, marginBottom: 12 }}>
                  {step.desc}
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 11, color: 'var(--landing-muted)' }}>
                  {step.items.map((item) => (
                    <li key={item} style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                      <span style={{ color: '#6366f1' }}>→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="landing-section">
          <div className="landing-yaml-grid">
            <div className="landing-code-card landing-code">
              <div className="landing-code-header">
                <YamlDots />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>plugins.yaml</div>
                  <div style={{ fontSize: 11, color: 'var(--landing-muted)' }}>
                    Swap sources &amp; calendars — zero code changes
                  </div>
                </div>
              </div>
              <pre>{`sources:
  - id: notion-daily
    type: notion
    enabled: true

calendars:
  - id: icloud-primary
    type: icloud
    enabled: true`}</pre>
            </div>
            <div className="landing-code-card">
              <div className="landing-code-header">
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Why plugin architecture</div>
                  <div style={{ fontSize: 11, color: 'var(--landing-muted)' }}>Built to last beyond any one tool</div>
                </div>
              </div>
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Feature icon="🔌" title="Edit YAML, not code" desc="Enable a new source or calendar by editing one config file. Core engine untouched." />
                <Feature icon="🔀" title="Multiple sources merge" desc="Notion + Obsidian simultaneously. All tasks flatten before slot assignment." />
                <Feature icon="🤫" title="Secrets stay in .env" desc="plugins.yaml never holds credentials. Tokens always in environment variables." />
              </div>
            </div>
          </div>
        </section>

        <section className="landing-cta-band">
          <h2>Ready to time-box your day?</h2>
          <p>Fetch from Notion, review proposals on a timeline, push to iCloud in one click.</p>
          <AppEntryLink className="landing-btn-primary" style={{ fontSize: '1rem', padding: '14px 28px' }}>
            {isExternalAppEntry(appEntryHref()) ? 'Run locally →' : 'Log in to dashboard →'}
          </AppEntryLink>
        </section>

        <footer className="landing-footer">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" fill="none" viewBox="0 0 48 46"
              style={{ filter: 'drop-shadow(0 0 3px rgba(134,59,255,0.5))', flexShrink: 0 }}>
              <path fill="#863bff" d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"/>
            </svg>
            <span><span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 200, color: 'var(--landing-muted)', letterSpacing: '-0.2px' }}>Flow</span><span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 800, color: '#7c6af7', letterSpacing: '-0.6px' }}>Tyme</span></span>
            <span style={{ color: 'var(--landing-border)', margin: '0 4px' }}>·</span>
            <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--landing-muted)', opacity: 0.7 }}>Time Boxing Assistant</span>
          </div>
          <p style={{ marginBottom: 8 }}>
            React · Vite · TypeScript · Express · MongoDB · CalDAV · Notion API
          </p>
          <p style={{ opacity: 0.6 }}>Built for personal use. Open-sourced because others might want this too.</p>
        </footer>
      </div>
    </div>
  );
}

function YamlDots() {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }} />
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }} />
    </div>
  );
}

function PluginCard({
  icon,
  name,
  meta,
  badge,
  active,
  muted,
  cyan,
  dashed,
}: {
  icon: string;
  name: string;
  meta: string;
  badge: string;
  active?: boolean;
  muted?: boolean;
  cyan?: boolean;
  dashed?: boolean;
}) {
  return (
    <div
      className={`landing-plugin-card ${active ? 'active' : ''} ${muted ? 'muted' : ''}`}
      style={dashed ? { borderStyle: 'dashed' } : cyan ? { borderTopColor: '#06b6d4' } : undefined}
    >
      <div style={{ fontSize: 20, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{name}</div>
      <div style={{ fontSize: 11, color: 'var(--landing-muted)' }}>{meta}</div>
      <div style={{ fontSize: 9, fontWeight: 600, marginTop: 8, color: active ? '#6ee7b7' : 'var(--landing-muted)' }}>
        {badge}
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 11, color: 'var(--landing-muted)', lineHeight: 1.5 }}>{desc}</div>
      </div>
    </div>
  );
}
