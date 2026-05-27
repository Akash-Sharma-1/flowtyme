import { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import type { Event as RBCEvent } from 'react-big-calendar';
import _withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const withDragAndDrop: typeof _withDragAndDrop = ((_withDragAndDrop as any).default ?? _withDragAndDrop);
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { getProposal, updateProposalItems, fetchCalendarEvents, getConfig } from '../api';
import type { ProposalItem, CalendarEvent, AppConfig } from '../types';
import { getProposalCache, setProposalCache, updateCachedItems } from '../proposalCache';
import { useNavigate } from 'react-router-dom';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });
const DnDCalendar = withDragAndDrop(Calendar);

interface CalEvent extends RBCEvent {
  id: string;
  proposalItem?: ProposalItem;
  isExisting?: boolean;
  hasConflict?: boolean;
  calendarName?: string;
}

// partition name → background color for the day-view bands
// Morning: golden sunrise · Afternoon: clear sky blue · Evening: sunset coral · Night: deep purple
const PARTITION_BG: Record<string, string> = {
  morning:   'rgba(251,191,36,0.14)',   // golden yellow
  afternoon: 'rgba(56,189,248,0.12)',   // sky blue
  evening:   'rgba(251,113,133,0.16)',  // sunset coral/pink
  night:     'rgba(139,92,246,0.20)',   // deep purple
};

const PARTITION_LABEL_COLOR: Record<string, string> = {
  morning:   '#fbbf24',  // amber
  afternoon: '#38bdf8',  // sky blue
  evening:   '#fb7185',  // rose/coral
  night:     '#8b5cf6',  // violet
};

// Apple Calendar name → color
const CALENDAR_COLORS: Record<string, string> = {
  'Office Work':    '#7c6af7',
  'Side Hustle':    '#60a5fa',
  'Prep Work':      '#fbbf24',
  'Home and Chores':'#f97316',
  'Fitness and Meals': '#4ade80',
  'Reminders':      '#a78bfa',
};

const TASK_COLOR  = '#ef4444'; // bright red for proposed tasks
const CHORE_COLOR = '#3b82f6'; // bright blue for proposed chores

/** Custom event renderer — ≤20 min: "HH:mm–HH:mm  title" inline; >20 min: time range + title stacked */
function EventComponent({ event }: { event: object }) {
  const ev = event as CalEvent;
  const durationMin = ((ev.end as Date).getTime() - (ev.start as Date).getTime()) / 60000;
  const startStr = format(ev.start as Date, 'h:mma').toLowerCase();
  const endStr   = format(ev.end   as Date, 'h:mma').toLowerCase();
  const timeRange = `${startStr}–${endStr}`;

  if (durationMin <= 30) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        height: '100%', padding: '0 4px', overflow: 'hidden',
        lineHeight: 1.4,
      }}>
        <span style={{ fontSize: 11, opacity: 0.75, flexShrink: 0, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
          {timeRange}
        </span>
        <span style={{
          fontSize: 12, fontWeight: 600,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {ev.title as string}
        </span>
      </div>
    );
  }

  return (
    <div style={{ padding: '2px 5px 3px', overflow: 'hidden', height: '100%' }}>
      <div style={{ fontSize: 11, opacity: 0.99, fontVariantNumeric: 'tabular-nums', lineHeight: 1.3, marginBottom: 1 }}>
        {timeRange}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', whiteSpace: 'nowrap', lineHeight: 1.4 }}>
        {ev.title as string}
      </div>
    </div>
  );
}

function colorFor(calendarName: string): string {
  return CALENDAR_COLORS[calendarName] || '#8888aa';
}

function partitionFor(isoTime: string, partitions: AppConfig['partitions']): string | null {
  const d = new Date(isoTime);
  const mins = d.getHours() * 60 + d.getMinutes();
  for (const p of partitions) {
    const [sh, sm] = p.startTime.split(':').map(Number);
    const [eh, em] = p.endTime.split(':').map(Number);
    if (mins >= sh * 60 + sm && mins < eh * 60 + em) return p.name;
  }
  return null;
}

export default function Proposals() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ProposalItem[]>([]);
  const [existingEvents, setExistingEvents] = useState<CalendarEvent[]>([]);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [proposalId, setProposalId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ProposalItem | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'chores'>('tasks');

  const date = localStorage.getItem('proposalDate') || format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const cached = getProposalCache(date);
        if (cached) {
          setProposalId(cached.proposalId);
          setItems(cached.items);
          setExistingEvents(cached.existingEvents);
          setConfig(cached.config);
          return;
        }
        const [proposal, events, cfg] = await Promise.all([
          getProposal(date),
          fetchCalendarEvents(date),
          getConfig(),
        ]);
        setProposalCache(date, { proposalId: proposal._id, items: proposal.items, existingEvents: events, config: cfg });
        setProposalId(proposal._id);
        setItems(proposal.items);
        setExistingEvents(events);
        setConfig(cfg);
      } catch (e: any) {
        setError(e.response?.data?.error || e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [date]);

  const tasks  = items.filter(i => i.type === 'task');
  const chores = items.filter(i => i.type === 'chore');

  const existingCalEvents: CalEvent[] = existingEvents
    .filter(e => !e.isAllDay)
    .map(e => ({
      id: e.uid,
      title: e.title,
      start: new Date(e.startTime),
      end: new Date(e.endTime),
      isExisting: true,
      calendarName: e.calendarName,
    }));

  // Calendar always shows all items — tab only changes the sidebar list
  const allProposalCalEvents: CalEvent[] = [
    ...existingCalEvents,
    ...items.map(item => ({
      id: item.id,
      title: item.title,
      start: new Date(item.startTime),
      end: new Date(item.endTime),
      proposalItem: item,
      hasConflict: item.hasConflict,
      calendarName: item.calendarName,
    })),
  ];

  const sidebarItems = activeTab === 'tasks' ? tasks : chores;

  // mark each 15-min slot with a colored left border to show which partition it's in
  const slotPropGetter = useCallback((slotDate: Date) => {
    if (!config) return {};
    const totalMins = slotDate.getHours() * 60 + slotDate.getMinutes();
    for (const p of config.partitions) {
      const [sh, sm] = p.startTime.split(':').map(Number);
      const [eh, em] = p.endTime.split(':').map(Number);
      if (totalMins >= sh * 60 + sm && totalMins < eh * 60 + em) {
        const borderColor = PARTITION_LABEL_COLOR[p.name];
        const bg = PARTITION_BG[p.name];
        return borderColor
          ? { style: { borderLeft: `4px solid ${borderColor}70`, background: bg || 'transparent' } }
          : {};
      }
    }
    return {};
  }, [config]);

  const onEventDrop = useCallback(
    ({ event, start, end }: { event: object; start: Date | string; end: Date | string }) => {
      const ev = event as CalEvent;
      if (ev.isExisting) return;
      setItems(prev => {
        const next = prev.map(item =>
          item.id === ev.id
            ? { ...item, startTime: new Date(start).toISOString(), endTime: new Date(end).toISOString(), hasConflict: false }
            : item
        );
        updateCachedItems(date, next);
        return next;
      });
    },
    [date]
  );

  const onEventResize = useCallback(
    ({ event, start, end }: { event: object; start: Date | string; end: Date | string }) => {
      const ev = event as CalEvent;
      if (ev.isExisting) return;
      setItems(prev => {
        const next = prev.map(item =>
          item.id === ev.id
            ? { ...item, startTime: new Date(start).toISOString(), endTime: new Date(end).toISOString() }
            : item
        );
        updateCachedItems(date, next);
        return next;
      });
    },
    [date]
  );

  function toggleAccepted(id: string) {
    setItems(prev => {
      const next = prev.map(item => item.id === id ? { ...item, accepted: !item.accepted } : item);
      updateCachedItems(date, next);
      return next;
    });
  }

  async function handleSave() {
    if (!proposalId) return;
    setSaving(true);
    try {
      await updateProposalItems(proposalId, items);
      navigate('/confirm');
    } catch (e: any) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setSaving(false);
    }
  }

  const eventStyleGetter = (event: object) => {
    const ev = event as CalEvent;
    const calColor = colorFor(ev.calendarName || '');
    if (ev.isExisting) {
      return {
        className: 'existing-event',
        style: { background: calColor, border: `1px solid ${calColor}cc`, color: '#fff', fontSize: '11px', fontWeight: 600 },
      };
    }
    const item = ev.proposalItem;
    if (!item) return {};
    if (ev.hasConflict) {
      return { style: { background: 'rgba(248,113,113,0.2)', border: '1px solid #ef4444', color: '#ef4444' } };
    }
    const typeColor = item.type === 'task' ? TASK_COLOR : CHORE_COLOR;
    if (!item.accepted) {
      return { style: { background: `${typeColor}10`, border: `1px solid ${typeColor}30`, color: `${typeColor}55` } };
    }
    return {
      className: 'proposed-accepted',
      style: { background: `${typeColor}22`, border: `1px solid ${typeColor}`, color: typeColor, fontWeight: 500 },
    };
  };

  const conflicts = items.filter(i => i.hasConflict);

  if (loading) return <Loading />;
  if (error) return <ErrorBox msg={error} />;

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-80px)]">
      {/* partition legend */}
      {config && (
        <div className="flex gap-3 items-center flex-wrap">
          {config.partitions.map(p => (
            <span key={p.name} className="flex items-center gap-1.5 text-xs">
              <span
                className="w-3 h-3 rounded-sm border"
                style={{
                  background: PARTITION_BG[p.name] || 'transparent',
                  borderColor: PARTITION_LABEL_COLOR[p.name] || '#555',
                }}
              />
              <span style={{ color: PARTITION_LABEL_COLOR[p.name] || '#999' }} className="capitalize font-medium">
                {p.name}
              </span>
              <span className="text-[var(--color-muted)]">{p.startTime}–{p.endTime}</span>
            </span>
          ))}
          <span className="ml-auto flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
              <span className="w-3 h-3 rounded-sm" style={{ background: 'var(--color-accent)' }} />
              existing
            </span>
            <span className="flex items-center gap-1.5 text-xs text-[var(--color-muted)] proposed-accepted-demo">
              <span className="w-3 h-3 rounded-sm border" style={{ background: '#7c6af728', borderColor: '#7c6af7aa' }} />
              proposed
            </span>
            {Object.entries(CALENDAR_COLORS).map(([cal, color]) => (
              <span key={cal} className="flex items-center gap-1 text-xs text-[var(--color-muted)]">
                <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                {cal}
              </span>
            ))}
          </span>
        </div>
      )}

      <div className="flex gap-6 flex-1 min-h-0">
        {/* sidebar */}
        <div className="w-64 flex-shrink-0 flex flex-col gap-3 overflow-y-auto">
          {/* tabs */}
          <div className="flex gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-1">
            {(['tasks', 'chores'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors capitalize ${
                  activeTab === tab ? 'text-white' : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                }`}
                style={activeTab === tab ? { background: tab === 'tasks' ? 'var(--color-accent)' : '#f97316' } : {}}
              >
                {tab} ({tab === 'tasks' ? tasks.length : chores.length})
              </button>
            ))}
          </div>

          {conflicts.length > 0 && (
            <div className="bg-red-500/10 border border-[var(--color-error)] rounded-xl p-3">
              <p className="text-[var(--color-error)] text-xs font-semibold mb-1.5">
                ⚠ {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''} — drag to resolve
              </p>
              {conflicts.map(c => (
                <div key={c.id} className="text-xs text-[var(--color-muted)] py-0.5 border-b border-red-500/20 truncate">
                  {c.title}
                </div>
              ))}
            </div>
          )}

          <div
            className="rounded-xl p-3 flex-1 overflow-y-auto"
            style={{
              background: 'linear-gradient(var(--color-surface), var(--color-surface)) padding-box, linear-gradient(135deg, var(--color-accent), #f97316) border-box',
              border: '1px solid transparent',
            }}
          >
            <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide mb-2 font-semibold">
              {activeTab === 'tasks' ? 'Tasks' : 'Chores'}
            </p>
            {sidebarItems.map(item => {
              const color = item.type === 'task' ? TASK_COLOR : CHORE_COLOR;
              const partition = config ? partitionFor(item.startTime, config.partitions) : null;
              return (
                <button
                  key={item.id}
                  onClick={() => toggleAccepted(item.id)}
                  className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg mb-1 text-xs transition-colors ${
                    item.accepted
                      ? 'bg-[var(--color-bg)] text-[var(--color-text)]'
                      : 'bg-transparent text-[var(--color-muted)] line-through'
                  } ${item.hasConflict ? 'border border-[var(--color-error)]' : ''}`}
                >
                  <span
                    className="w-1 flex-shrink-0 self-stretch rounded-full"
                    style={{ background: color, minHeight: '16px' }}
                  />
                  <span className="flex-1 truncate">{item.title}</span>
                  {partition && (
                    <span
                      className="text-[9px] px-1 py-0.5 rounded capitalize flex-shrink-0"
                      style={{
                        color: PARTITION_LABEL_COLOR[partition] || '#999',
                        background: PARTITION_BG[partition] || 'transparent',
                      }}
                    >
                      {partition}
                    </span>
                  )}
                  <span className="text-[var(--color-muted)] flex-shrink-0">
                    {format(new Date(item.startTime), 'HH:mm')}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-dim)] disabled:opacity-50 text-white font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            {saving ? 'Saving…' : 'Save & Review →'}
          </button>
        </div>

        {/* calendar */}
        <div className="flex-1 min-w-0">
          <DnDCalendar
            localizer={localizer}
            events={allProposalCalEvents}
            defaultView="day"
            views={['day']}
            date={new Date(date)}
            onNavigate={() => {}}
            step={15}
            timeslots={4}
            min={new Date(`${date}T00:00:00`)}
            max={new Date(`${date}T23:59:00`)}
            scrollToTime={new Date(`${date}T06:00:00`)}
            onEventDrop={onEventDrop as any}
            onEventResize={onEventResize as any}
            resizable
            eventPropGetter={eventStyleGetter as any}
            slotPropGetter={slotPropGetter as any}
            onSelectEvent={(e) => {
              const ev = e as CalEvent;
              if (ev.proposalItem) setSelected(ev.proposalItem);
            }}
            components={{ event: EventComponent as any }}
            style={{ height: '100%' }}
          />
        </div>

        {/* detail panel */}
        {selected && (
          <div className="w-56 flex-shrink-0 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--color-muted)] uppercase tracking-wide">Selected</span>
              <button onClick={() => setSelected(null)} className="text-[var(--color-muted)] hover:text-[var(--color-text)]">✕</button>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: colorFor(selected.calendarName) }} />
              <p className="font-medium text-sm leading-tight">{selected.title}</p>
            </div>
            <div className="text-xs text-[var(--color-muted)] space-y-1">
              <div>Category: {selected.category}</div>
              <div>Calendar: {selected.calendarName}</div>
              <div>Type: {selected.type}</div>
              <div>{format(new Date(selected.startTime), 'HH:mm')} – {format(new Date(selected.endTime), 'HH:mm')}</div>
            </div>
            {selected.hasConflict && (
              <p className="text-[var(--color-error)] text-xs">⚠ Conflict — drag to resolve</p>
            )}
            <button
              onClick={() => toggleAccepted(selected.id)}
              className={`w-full text-xs py-1.5 rounded-lg border transition-colors ${
                selected.accepted
                  ? 'border-[var(--color-error)] text-[var(--color-error)] hover:bg-red-500/10'
                  : 'border-[var(--color-success)] text-[var(--color-success)] hover:bg-green-500/10'
              }`}
            >
              {selected.accepted ? 'Reject' : 'Accept'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex items-center justify-center h-64 text-[var(--color-muted)]">
      Loading proposals…
    </div>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="bg-red-500/10 border border-[var(--color-error)] text-[var(--color-error)] px-4 py-3 rounded-lg text-sm max-w-lg">
      {msg}
    </div>
  );
}
