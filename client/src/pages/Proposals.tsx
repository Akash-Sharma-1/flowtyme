import { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Event as RBCEvent, SlotInfo } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay, parseISO, addMinutes } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { getProposal, updateProposalItems, fetchCalendarEvents } from '../api';
import { ProposalItem, CalendarEvent } from '../types';
import { useNavigate } from 'react-router-dom';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });
const DnDCalendar = withDragAndDrop(Calendar);

interface CalEvent extends RBCEvent {
  id: string;
  proposalItem?: ProposalItem;
  isExisting?: boolean;
  hasConflict?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Office Work': '#7c6af7',
  Health: '#4ade80',
  'Interview Prep': '#fbbf24',
  'Side Hustle': '#60a5fa',
  Chores: '#f97316',
  General: '#a78bfa',
};

function colorForCategory(cat: string) {
  return CATEGORY_COLORS[cat] || '#8888aa';
}

export default function Proposals() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ProposalItem[]>([]);
  const [existingEvents, setExistingEvents] = useState<CalendarEvent[]>([]);
  const [proposalId, setProposalId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ProposalItem | null>(null);

  const date = localStorage.getItem('proposalDate') || format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [proposal, events] = await Promise.all([
          getProposal(date),
          fetchCalendarEvents(date),
        ]);
        setProposalId(proposal._id);
        setItems(proposal.items);
        setExistingEvents(events);
      } catch (e: any) {
        setError(e.response?.data?.error || e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [date]);

  const calEvents: CalEvent[] = [
    ...existingEvents.filter((e) => !e.isAllDay).map((e) => ({
      id: e.uid,
      title: e.title,
      start: new Date(e.startTime),
      end: new Date(e.endTime),
      isExisting: true,
    })),
    ...items.map((item) => ({
      id: item.id,
      title: item.title,
      start: new Date(item.startTime),
      end: new Date(item.endTime),
      proposalItem: item,
      hasConflict: item.hasConflict,
    })),
  ];

  const onEventDrop = useCallback(
    ({ event, start, end }: { event: object; start: Date | string; end: Date | string }) => {
      const ev = event as CalEvent;
      if (ev.isExisting) return;
      setItems((prev) =>
        prev.map((item) =>
          item.id === ev.id
            ? {
                ...item,
                startTime: new Date(start).toISOString(),
                endTime: new Date(end).toISOString(),
                hasConflict: false,
              }
            : item
        )
      );
    },
    []
  );

  const onEventResize = useCallback(
    ({ event, start, end }: { event: object; start: Date | string; end: Date | string }) => {
      const ev = event as CalEvent;
      if (ev.isExisting) return;
      setItems((prev) =>
        prev.map((item) =>
          item.id === ev.id
            ? {
                ...item,
                startTime: new Date(start).toISOString(),
                endTime: new Date(end).toISOString(),
              }
            : item
        )
      );
    },
    []
  );

  function toggleAccepted(id: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, accepted: !item.accepted } : item))
    );
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
    if (ev.isExisting) {
      return { style: { background: '#2a2a38', color: '#8888aa', opacity: 0.7 } };
    }
    const item = ev.proposalItem;
    if (!item) return {};
    const color = colorForCategory(item.category);
    if (ev.hasConflict) {
      return {
        style: {
          background: 'rgba(248,113,113,0.15)',
          border: '1px solid #f87171',
          color: '#f87171',
        },
      };
    }
    if (!item.accepted) {
      return {
        style: { background: 'rgba(136,136,170,0.1)', border: '1px solid #444', color: '#666' },
      };
    }
    return { style: { background: `${color}22`, border: `1px solid ${color}`, color } };
  };

  const conflicts = items.filter((i) => i.hasConflict);

  if (loading) return <Loading />;
  if (error) return <ErrorBox msg={error} />;

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)]">
      {/* sidebar */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-4 overflow-y-auto">
        {conflicts.length > 0 && (
          <div className="bg-red-500/10 border border-[var(--color-error)] rounded-xl p-3">
            <p className="text-[var(--color-error)] text-xs font-semibold mb-2">
              ⚠ {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''} — drag to resolve
            </p>
            {conflicts.map((c) => (
              <div key={c.id} className="text-xs text-[var(--color-muted)] py-1 border-b border-red-500/20">
                {c.title}
              </div>
            ))}
          </div>
        )}

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3">
          <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide mb-2 font-semibold">
            Tasks & Chores
          </p>
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => toggleAccepted(item.id)}
              className={`w-full text-left flex items-center gap-2 px-2 py-2 rounded-lg mb-1 text-xs transition-colors ${
                item.accepted
                  ? 'bg-[var(--color-bg)] text-[var(--color-text)]'
                  : 'bg-transparent text-[var(--color-muted)] line-through'
              } ${item.hasConflict ? 'border border-[var(--color-error)]' : ''}`}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: colorForCategory(item.category) }}
              />
              <span className="flex-1 truncate">{item.title}</span>
              <span className="text-[var(--color-muted)]">
                {format(new Date(item.startTime), 'HH:mm')}
              </span>
            </button>
          ))}
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
          events={calEvents}
          defaultView="day"
          views={['day']}
          date={new Date(date)}
          onNavigate={() => {}}
          step={15}
          timeslots={4}
          min={new Date(`${date}T06:00:00`)}
          max={new Date(`${date}T23:00:00`)}
          onEventDrop={onEventDrop as any}
          onEventResize={onEventResize as any}
          resizable
          eventPropGetter={eventStyleGetter as any}
          onSelectEvent={(e) => {
            const ev = e as CalEvent;
            if (ev.proposalItem) setSelected(ev.proposalItem);
          }}
          style={{ height: '100%' }}
        />
      </div>

      {/* detail panel */}
      {selected && (
        <div className="w-64 flex-shrink-0 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--color-muted)] uppercase tracking-wide">Selected</span>
            <button onClick={() => setSelected(null)} className="text-[var(--color-muted)] hover:text-[var(--color-text)]">✕</button>
          </div>
          <p className="font-medium text-sm">{selected.title}</p>
          <div className="text-xs text-[var(--color-muted)] space-y-1">
            <div>Category: {selected.category}</div>
            <div>Calendar: {selected.calendarName}</div>
            <div>Type: {selected.type}</div>
            <div>
              {format(new Date(selected.startTime), 'HH:mm')} –{' '}
              {format(new Date(selected.endTime), 'HH:mm')}
            </div>
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
