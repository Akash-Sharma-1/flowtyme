/** Animated hub diagram — adapted from integration-diagram.html */
export default function IntegrationHub() {
  return (
    <div className="integration-hub w-full overflow-hidden rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-surface)]">
      <svg
        viewBox="0 0 980 500"
        className="w-full h-auto block"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="FlowTyme connects task sources to calendars"
      >
        <defs>
          <radialGradient id="ih-bg" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="var(--ih-bg-center)" />
            <stop offset="100%" stopColor="var(--ih-bg-edge)" />
          </radialGradient>
          <radialGradient id="ih-hub" cx="38%" cy="28%" r="90%">
            <stop offset="0%" stopColor="#311b6b" />
            <stop offset="55%" stopColor="#1a1045" />
            <stop offset="100%" stopColor="#0e0b22" />
          </radialGradient>
          <linearGradient id="ih-ftg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="100%" stopColor="#7dd3fc" />
          </linearGradient>
          <filter id="ih-blur">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>

        <rect width="980" height="500" rx="22" fill="url(#ih-bg)" />

        <ellipse cx="490" cy="250" rx="260" ry="180" fill="#7c3aed" opacity="0.08" filter="url(#ih-blur)" className="ih-pulse" />

        {/* Sources → hub */}
        {[
          ['M 110 60  C 290 60  310 218 420 218', '#ef4444', '0s'],
          ['M 110 132 C 290 132 310 231 420 231', '#94a3b8', '.3s'],
          ['M 110 204 C 290 204 310 244 420 244', '#6366f1', '.6s'],
          ['M 110 276 C 290 276 310 257 420 257', '#8b5cf6', '.9s'],
          ['M 110 348 C 290 348 310 270 420 270', '#3b82f6', '1.2s'],
          ['M 110 420 C 290 420 310 283 420 283', '#c084fc', '1.5s'],
        ].map(([d, stroke, delay], i) => (
          <path
            key={`s${i}`}
            d={d as string}
            fill="none"
            stroke={stroke as string}
            strokeWidth="1.3"
            opacity="0.55"
            className="ih-flow"
            style={{ animationDelay: delay as string }}
          />
        ))}

        {/* Hub → calendars */}
        {[
          ['M 560 218 C 700 218 730 110 870 110', '#ef4444', '.15s'],
          ['M 560 243 C 700 243 730 203 870 203', '#4285f4', '.55s'],
          ['M 560 258 C 700 258 730 296 870 296', '#60a5fa', '.95s'],
          ['M 560 283 C 700 283 730 389 870 389', '#f97316', '1.35s'],
        ].map(([d, stroke, delay], i) => (
          <path
            key={`c${i}`}
            d={d as string}
            fill="none"
            stroke={stroke as string}
            strokeWidth="1.3"
            opacity="0.5"
            className="ih-flow"
            style={{ animationDelay: delay as string }}
          />
        ))}

        <circle cx="490" cy="250" r="112" fill="none" stroke="#6366f1" strokeWidth="1" strokeDasharray="7 15" opacity="0.35" className="ih-spin-slow" />
        <circle cx="490" cy="250" r="91" fill="none" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="3 22" opacity="0.28" className="ih-spin-rev" />
        <circle cx="490" cy="250" r="70" fill="url(#ih-hub)" />
        <circle cx="490" cy="250" r="70" fill="none" stroke="#6d28d9" strokeWidth="1.5" opacity="0.85" />
        <text x="490" y="252" textAnchor="middle" dominantBaseline="central" fontSize="15.5" fontWeight="800" fill="url(#ih-ftg)">
          FlowTyme
        </text>
        <text x="490" y="272" textAnchor="middle" fontSize="7" fill="var(--ih-label)" letterSpacing="0.14em" fontWeight="600">
          AUTO·SCHEDULE
        </text>

        {/* Source nodes */}
        {[
          [82, 60, 'Todoist', '#ef4444'],
          [82, 132, 'Notion', '#94a3b8'],
          [82, 204, 'Linear', '#818cf8'],
          [82, 276, 'Obsidian', '#8b5cf6'],
          [82, 348, 'Things 3', '#60a5fa'],
          [82, 420, 'ClickUp', '#c084fc'],
        ].map(([x, y, label, color]) => (
          <g key={label as string} transform={`translate(${x},${y})`}>
            <circle r="28" fill="var(--ih-node-bg)" />
            <circle r="28" fill="none" stroke={color as string} strokeWidth="1.5" className="ih-breathe" />
            <text y="42" textAnchor="middle" fontSize="9.5" fill="var(--ih-label)">
              {label as string}
            </text>
          </g>
        ))}

        {/* Calendar nodes */}
        {[
          [898, 110, 'iCloud Cal', '#f87171'],
          [898, 203, 'Google Cal', '#93c5fd'],
          [898, 296, 'Outlook', '#60a5fa'],
          [898, 389, 'Reminders', '#fb923c'],
        ].map(([x, y, label, color]) => (
          <g key={label as string} transform={`translate(${x},${y})`}>
            <circle r="26" fill="var(--ih-node-bg)" />
            <circle r="26" fill="none" stroke={color as string} strokeWidth="1.5" className="ih-breathe" />
            <text y="39" textAnchor="middle" fontSize="9" fill="var(--ih-label)">
              {label as string}
            </text>
          </g>
        ))}

        <text x="82" y="16" textAnchor="middle" fontSize="8.5" fontWeight="700" letterSpacing="0.14em" fill="#7c3aed" opacity="0.9">
          TASK SOURCES
        </text>
        <text x="898" y="58" textAnchor="middle" fontSize="8.5" fontWeight="700" letterSpacing="0.14em" fill="#0e7490" opacity="0.9">
          CALENDARS &amp;
        </text>
        <text x="898" y="70" textAnchor="middle" fontSize="8.5" fontWeight="700" letterSpacing="0.14em" fill="#0e7490" opacity="0.9">
          REMINDERS
        </text>
      </svg>
    </div>
  );
}
