import { useState } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { generateProposal } from '../api';
import { CalendarEvent, ProposalItem } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    proposalId: string;
    items: ProposalItem[];
    existingEvents: CalendarEvent[];
  } | null>(null);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const data = await generateProposal(date);
      setResult(data);
      localStorage.setItem('proposalId', data.proposalId);
      localStorage.setItem('proposalDate', date);
    } catch (e: any) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  const tasks = result?.items.filter((i) => i.type === 'task') || [];
  const chores = result?.items.filter((i) => i.type === 'chore') || [];
  const conflicts = result?.items.filter((i) => i.hasConflict) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Today's Plan</h1>
        <p className="text-[var(--color-muted)] mt-1">
          Fetch Notion tasks + calendar, generate time slots
        </p>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-dim)] disabled:opacity-50 text-white font-medium px-5 py-2 rounded-lg transition-colors"
        >
          {loading ? 'Generating…' : 'Generate Plan'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-[var(--color-error)] text-[var(--color-error)] px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Tasks" value={tasks.length} color="var(--color-accent)" />
          <StatCard label="Chores" value={chores.length} color="var(--color-success)" />
          <StatCard
            label="Conflicts"
            value={conflicts.length}
            color={conflicts.length > 0 ? 'var(--color-error)' : 'var(--color-muted)'}
          />
        </div>
      )}

      {result && (
        <div className="grid grid-cols-2 gap-4">
          <ItemList title="Tasks" items={tasks} />
          <ItemList title="Chores" items={chores} />
        </div>
      )}

      {result && (
        <div className="flex justify-end">
          <button
            onClick={() => navigate('/proposals')}
            className="bg-[var(--color-surface)] border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white font-medium px-5 py-2 rounded-lg transition-colors"
          >
            Review Proposals →
          </button>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
      <div className="text-3xl font-bold" style={{ color }}>{value}</div>
      <div className="text-[var(--color-muted)] text-sm mt-1">{label}</div>
    </div>
  );
}

function ItemList({ title, items }: { title: string; items: ProposalItem[] }) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 space-y-2">
      <h3 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wide">{title}</h3>
      {items.length === 0 && (
        <p className="text-[var(--color-muted)] text-sm">None</p>
      )}
      {items.map((item) => (
        <div
          key={item.id}
          className={`flex items-center justify-between text-sm px-3 py-2 rounded-lg ${
            item.hasConflict
              ? 'bg-red-500/10 border border-[var(--color-error)]'
              : 'bg-[var(--color-bg)]'
          }`}
        >
          <span className="truncate flex-1">{item.title}</span>
          <span className="text-[var(--color-muted)] text-xs ml-2 shrink-0">
            {format(new Date(item.startTime), 'HH:mm')}
          </span>
          {item.hasConflict && (
            <span className="text-[var(--color-error)] text-xs ml-2">⚠ conflict</span>
          )}
        </div>
      ))}
    </div>
  );
}
