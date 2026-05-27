import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { getProposal, confirmProposal } from '../api';
import type { Proposal, ProposalItem } from '../types';

export default function Confirm() {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [pushing, setPushing] = useState(false);
  const [done, setDone] = useState(false);
  const [results, setResults] = useState<{ id: string; title: string; status: string; error?: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [remindersListName, setRemindersListName] = useState('Reminders');

  const date = localStorage.getItem('proposalDate') || format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    getProposal(date)
      .then(setProposal)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [date]);

  async function handleConfirm() {
    if (!proposal) return;
    setPushing(true);
    setError(null);
    try {
      const res = await confirmProposal(proposal._id, remindersListName);
      setResults(res.results);
      setDone(true);
    } catch (e: any) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setPushing(false);
    }
  }

  if (loading) return <div className="text-[var(--color-muted)]">Loading…</div>;
  if (!proposal) return <div className="text-[var(--color-error)]">No proposal found for {date}</div>;

  const accepted = proposal.items.filter((i) => i.accepted);
  const rejected = proposal.items.filter((i) => !i.accepted);
  const tasks = accepted.filter((i) => i.type === 'task');
  const chores = accepted.filter((i) => i.type === 'chore');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Confirm & Push</h1>
        <p className="text-[var(--color-muted)] mt-1">
          {format(parseISO(date), 'EEEE, MMMM d')} · {accepted.length} items to push
        </p>
      </div>

      {done ? (
        <PushResults results={results} />
      ) : (
        <>
          <Section title={`Tasks → Apple Calendar (${tasks.length})`} items={tasks} />
          <Section title={`Chores → Reminders (${chores.length})`} items={chores} />

          {rejected.length > 0 && (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
              <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide mb-2 font-semibold">
                Skipped ({rejected.length})
              </p>
              {rejected.map((i) => (
                <div key={i.id} className="text-[var(--color-muted)] text-sm line-through py-0.5">
                  {i.title}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            <label className="text-sm text-[var(--color-muted)]">Reminders list:</label>
            <input
              value={remindersListName}
              onChange={(e) => setRemindersListName(e.target.value)}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-[var(--color-error)] text-[var(--color-error)] px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleConfirm}
            disabled={pushing || accepted.length === 0}
            className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-dim)] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {pushing ? 'Pushing to iCloud…' : `Push ${accepted.length} items to iCloud →`}
          </button>

          {proposal.status === 'pushed' && (
            <p className="text-center text-[var(--color-success)] text-sm">
              ✓ Already pushed on {format(parseISO(proposal.updatedAt || date), 'HH:mm')}
            </p>
          )}
        </>
      )}
    </div>
  );
}

function Section({ title, items }: { title: string; items: ProposalItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 space-y-2">
      <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide mb-2 font-semibold">{title}</p>
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between text-sm">
          <span className="flex-1">{item.title}</span>
          <span className="text-[var(--color-muted)] text-xs">
            {format(parseISO(item.startTime), 'HH:mm')} – {format(parseISO(item.endTime), 'HH:mm')}
          </span>
          <span className="text-[var(--color-muted)] text-xs ml-3">{item.calendarName}</span>
        </div>
      ))}
    </div>
  );
}

function PushResults({ results }: { results: { id: string; title: string; status: string; error?: string }[] }) {
  const pushed = results.filter((r) => r.status === 'pushed');
  const errored = results.filter((r) => r.status === 'error');

  return (
    <div className="space-y-4">
      <div className="bg-green-500/10 border border-[var(--color-success)] rounded-xl p-4">
        <p className="text-[var(--color-success)] font-semibold mb-2">
          ✓ {pushed.length} items pushed to iCloud
        </p>
        {pushed.map((r) => (
          <div key={r.id} className="text-sm text-[var(--color-text)] py-0.5">
            {r.title}
          </div>
        ))}
      </div>
      {errored.length > 0 && (
        <div className="bg-red-500/10 border border-[var(--color-error)] rounded-xl p-4">
          <p className="text-[var(--color-error)] font-semibold mb-2">
            ✗ {errored.length} failed
          </p>
          {errored.map((r) => (
            <div key={r.id} className="text-sm text-[var(--color-muted)] py-0.5">
              {r.title}: {r.error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
