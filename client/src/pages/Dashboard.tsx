import { useState } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { fetchNotionParsed, generateProposal } from '../api';
import { clearProposalCache } from '../proposalCache';

interface EditableTask {
  id: string;
  title: string;
  category: string;
  partitionHint?: string;
  preferredStartTime?: string;
}

interface EditableChore {
  id: string;
  title: string;
  partitionHint?: string;
  preferredStartTime?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Office Work':    '#7c6af7',
  'Side Hustle':    '#60a5fa',
  'Interview Prep': '#fbbf24',
  'Prep Work':      '#fbbf24',
  'Health':         '#4ade80',
  'Home and Chores':'#f97316',
  'Personal':       '#a78bfa',
  'General':        '#8888aa',
};

function categoryColor(cat: string): string {
  return CATEGORY_COLORS[cat] || '#8888aa';
}

const inputClass =
  'bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-2 py-1 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]';

export default function Dashboard() {
  const navigate = useNavigate();
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [fetching, setFetching] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<EditableTask[]>([]);
  const [chores, setChores] = useState<EditableChore[]>([]);
  const [fetched, setFetched] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('General');
  const [newChoreTitle, setNewChoreTitle] = useState('');

  async function handleFetch() {
    setFetching(true);
    setError(null);
    try {
      const data = await fetchNotionParsed(date);
      setTasks(
        (data.tasks as any[]).map((t, i) => ({
          id: `task-${i}-${Date.now()}`,
          title: t.title,
          category: t.category,
          partitionHint: t.partitionHint,
          preferredStartTime: t.preferredStartTime,
        }))
      );
      setChores(
        (data.chores as any[]).map((c, i) => ({
          id: `chore-${i}-${Date.now()}`,
          title: c.title,
          partitionHint: c.partitionHint,
          preferredStartTime: c.preferredStartTime,
        }))
      );
      setFetched(true);
    } catch (e: any) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setFetching(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const data = await generateProposal(
        date,
        tasks.map((t) => ({
          title: t.title,
          category: t.category,
          partitionHint: t.partitionHint,
          preferredStartTime: t.preferredStartTime,
          checked: false,
        })),
        chores.map((c) => ({
          title: c.title,
          checked: false,
          partitionHint: c.partitionHint,
          preferredStartTime: c.preferredStartTime,
        }))
      );
      clearProposalCache(date);
      localStorage.setItem('proposalId', data.proposalId);
      localStorage.setItem('proposalDate', date);
      navigate('/proposals');
    } catch (e: any) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setGenerating(false);
    }
  }

  function updateTaskTitle(id: string, title: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, title } : t)));
  }

  function addTask() {
    if (!newTaskTitle.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: `task-${Date.now()}`, title: newTaskTitle.trim(), category: newTaskCategory || 'General' },
    ]);
    setNewTaskTitle('');
  }

  function addChore() {
    if (!newChoreTitle.trim()) return;
    setChores((prev) => [...prev, { id: `chore-${Date.now()}`, title: newChoreTitle.trim() }]);
    setNewChoreTitle('');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Today's Plan</h1>
        <p className="text-[var(--color-muted)] mt-1">
          Fetch Notion tasks, review and edit, then generate time slots
        </p>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="date"
          value={date}
          onChange={(e) => { setDate(e.target.value); setFetched(false); }}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
        />
        <button
          onClick={handleFetch}
          disabled={fetching}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-[var(--color-text)] font-medium px-5 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {fetching ? 'Fetching…' : fetched ? 'Re-fetch from Notion' : 'Fetch from Notion'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-[var(--color-error)] text-[var(--color-error)] px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {fetched && (
        <>
          <div className="grid grid-cols-2 gap-6">
            {/* Tasks */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 space-y-1.5">
              <h3 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-3">
                Tasks ({tasks.length})
              </h3>

              {tasks.length === 0 && (
                <p className="text-[var(--color-muted)] text-sm">No tasks</p>
              )}

              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[var(--color-bg)] group"
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: categoryColor(task.category) }}
                  />
                  {editingId === task.id ? (
                    <input
                      autoFocus
                      value={task.title}
                      onChange={(e) => updateTaskTitle(task.id, e.target.value)}
                      onBlur={() => setEditingId(null)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                      className="flex-1 bg-transparent text-sm text-[var(--color-text)] outline-none"
                    />
                  ) : (
                    <span
                      className="flex-1 text-sm text-[var(--color-text)] cursor-text truncate"
                      onClick={() => setEditingId(task.id)}
                    >
                      {task.title}
                    </span>
                  )}
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 font-medium"
                    style={{
                      background: `${categoryColor(task.category)}22`,
                      color: categoryColor(task.category),
                    }}
                  >
                    {task.category}
                  </span>
                  {task.partitionHint && (
                    <span className="text-[10px] text-[var(--color-muted)] flex-shrink-0 italic">
                      {task.partitionHint}
                      {task.preferredStartTime ? ` @ ${task.preferredStartTime}` : ''}
                    </span>
                  )}
                  <button
                    onClick={() => setTasks((prev) => prev.filter((t) => t.id !== task.id))}
                    className="text-[var(--color-muted)] hover:text-[var(--color-error)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <div className="flex gap-2 pt-2 border-t border-[var(--color-border)]">
                <input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTask()}
                  placeholder="Add task…"
                  className={`${inputClass} flex-1`}
                />
                <input
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value)}
                  placeholder="Category"
                  className={`${inputClass} w-28`}
                />
                <button
                  onClick={addTask}
                  className="text-[var(--color-accent)] hover:opacity-70 text-sm px-1"
                >
                  +
                </button>
              </div>
            </div>

            {/* Chores */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 space-y-1.5">
              <h3 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-3">
                Chores ({chores.length})
              </h3>

              {chores.length === 0 && (
                <p className="text-[var(--color-muted)] text-sm">No chores</p>
              )}

              {chores.map((chore) => (
                <div
                  key={chore.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[var(--color-bg)] group"
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0 bg-[var(--color-muted)]" />
                  {editingId === chore.id ? (
                    <input
                      autoFocus
                      value={chore.title}
                      onChange={(e) =>
                        setChores((prev) =>
                          prev.map((c) => (c.id === chore.id ? { ...c, title: e.target.value } : c))
                        )
                      }
                      onBlur={() => setEditingId(null)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                      className="flex-1 bg-transparent text-sm text-[var(--color-text)] outline-none"
                    />
                  ) : (
                    <span
                      className="flex-1 text-sm text-[var(--color-text)] cursor-text truncate"
                      onClick={() => setEditingId(chore.id)}
                    >
                      {chore.title}
                    </span>
                  )}
                  {chore.partitionHint && (
                    <span className="text-[10px] text-[var(--color-muted)] flex-shrink-0 italic">
                      {chore.partitionHint}
                      {chore.preferredStartTime ? ` @ ${chore.preferredStartTime}` : ''}
                    </span>
                  )}
                  <button
                    onClick={() => setChores((prev) => prev.filter((c) => c.id !== chore.id))}
                    className="text-[var(--color-muted)] hover:text-[var(--color-error)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <div className="flex gap-2 pt-2 border-t border-[var(--color-border)]">
                <input
                  value={newChoreTitle}
                  onChange={(e) => setNewChoreTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addChore()}
                  placeholder="Add chore…"
                  className={`${inputClass} flex-1`}
                />
                <button
                  onClick={addChore}
                  className="text-[var(--color-accent)] hover:opacity-70 text-sm px-1"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={generating || (tasks.length === 0 && chores.length === 0)}
              className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-dim)] disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
            >
              {generating ? 'Generating…' : 'Generate Proposals →'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
