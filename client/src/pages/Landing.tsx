import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import IntegrationHub from '../components/IntegrationHub';
import LandingNav from '../components/LandingNav';
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
        <LandingNav theme={theme} onToggleTheme={onToggleTheme} />

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
                <PluginCard icon={<SiIcon path={SI.notion} color="var(--landing-text)" />} name="Notion" meta="3-col daily page parser" badge="● Live" active />
                <PluginCard icon={<SiIcon path={SI.obsidian} color="#a78bfa" />} name="Obsidian" meta="Daily note vault" badge="◌ Soon" muted />
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
                <PluginCard icon={<SiIcon path={SI.icloud} color="#3b82f6" />} name="iCloud" meta="CalDAV · VEVENT + VTODO" badge="● Live" active cyan />
                <PluginCard icon={<SiIcon path={SI.googlecalendar} color="#4285f4" />} name="Google Calendar" meta="OAuth2 · Calendar API" badge="◌ Roadmap" muted />
                <PluginCard icon={<SiIcon path={SI.outlook} color="#0078d4" />} name="Outlook" meta="Microsoft Graph API" badge="◌ Roadmap" muted />
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

function SiIcon({ path, color, size = 20 }: { path: string; color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ display: 'block' }}>
      <path d={path} />
    </svg>
  );
}

const SI = {
  notion:
    'M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z',
  obsidian:
    'M19.355 18.538a68.967 68.959 0 0 0 1.858-2.954.81.81 0 0 0-.062-.9c-.516-.685-1.504-2.075-2.042-3.362-.553-1.321-.636-3.375-.64-4.377a1.707 1.707 0 0 0-.358-1.05l-3.198-4.064a3.744 3.744 0 0 1-.076.543c-.106.503-.307 1.004-.536 1.5-.134.29-.29.6-.446.914l-.31.626c-.516 1.068-.997 2.227-1.132 3.59-.124 1.26.046 2.73.815 4.481.128.011.257.025.386.044a6.363 6.363 0 0 1 3.326 1.505c.916.79 1.744 1.922 2.415 3.5zM8.199 22.569c.073.012.146.02.22.02.78.024 2.095.092 3.16.29.87.16 2.593.64 4.01 1.055 1.083.316 2.198-.548 2.355-1.664.114-.814.33-1.735.725-2.58l-.01.005c-.67-1.87-1.522-3.078-2.416-3.849a5.295 5.295 0 0 0-2.778-1.257c-1.54-.216-2.952.19-3.84.45.532 2.218.368 4.829-1.425 7.531zM5.533 9.938c-.023.1-.056.197-.098.29L2.82 16.059a1.602 1.602 0 0 0 .313 1.772l4.116 4.24c2.103-3.101 1.796-6.02.836-8.3-.728-1.73-1.832-3.081-2.55-3.831zM9.32 14.01c.615-.183 1.606-.465 2.745-.534-.683-1.725-.848-3.233-.716-4.577.154-1.552.7-2.847 1.235-3.95.113-.235.223-.454.328-.664.149-.297.288-.577.419-.86.217-.47.379-.885.46-1.27.08-.38.08-.72-.014-1.043-.095-.325-.297-.675-.68-1.06a1.6 1.6 0 0 0-1.475.36l-4.95 4.452a1.602 1.602 0 0 0-.513.952l-.427 2.83c.672.59 2.328 2.316 3.335 4.711.09.21.175.43.253.653z',
  icloud:
    'M13.762 4.29a6.51 6.51 0 0 0-5.669 3.332 3.571 3.571 0 0 0-1.558-.36 3.571 3.571 0 0 0-3.516 3A4.918 4.918 0 0 0 0 14.796a4.918 4.918 0 0 0 4.92 4.914 4.93 4.93 0 0 0 .617-.045h14.42c2.305-.272 4.041-2.258 4.043-4.589v-.009a4.594 4.594 0 0 0-3.727-4.508 6.51 6.51 0 0 0-6.511-6.27z',
  googlecalendar:
    'M18.316 5.684H24v12.632h-5.684V5.684zM5.684 24h12.632v-5.684H5.684V24zM18.316 5.684V0H1.895A1.894 1.894 0 0 0 0 1.895v16.421h5.684V5.684h12.632zm-7.207 6.25v-.065c.272-.144.5-.349.687-.617s.279-.595.279-.982c0-.379-.099-.72-.3-1.025a2.05 2.05 0 0 0-.832-.714 2.703 2.703 0 0 0-1.197-.257c-.6 0-1.094.156-1.481.467-.386.311-.65.671-.793 1.078l1.085.452c.086-.249.224-.461.413-.633.189-.172.445-.257.767-.257.33 0 .602.088.816.264a.86.86 0 0 1 .322.703c0 .33-.12.589-.36.778-.24.19-.535.284-.886.284h-.567v1.085h.633c.407 0 .748.109 1.02.327.272.218.407.499.407.843 0 .336-.129.614-.387.832s-.565.327-.924.327c-.351 0-.651-.103-.897-.311-.248-.208-.422-.502-.521-.881l-1.096.452c.178.616.505 1.082.977 1.401.472.319.984.478 1.538.477a2.84 2.84 0 0 0 1.293-.291c.382-.193.684-.458.902-.794.218-.336.327-.72.327-1.149 0-.429-.115-.797-.344-1.105a2.067 2.067 0 0 0-.881-.689zm2.093-1.931l.602.913L15 10.045v5.744h1.187V8.446h-.827l-2.158 1.557zM22.105 0h-3.289v5.184H24V1.895A1.894 1.894 0 0 0 22.105 0zm-3.289 23.5l4.684-4.684h-4.684V23.5zM0 22.105C0 23.152.848 24 1.895 24h3.289v-5.184H0v3.289z',
  outlook:
    'M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z',
};

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
  icon: ReactNode;
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
      <div style={{ marginBottom: 8 }}>{icon}</div>
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
